import { marked } from 'marked';
import DOMPurify from 'dompurify';

/**
 * Renderização segura de markdown (SUBSTITUÍVEL; EXEMPLO DE DOMÍNIO: no sistema de
 * origem serve ao chat com IA — apague se o seu não exibe markdown).
 *
 * Textos em markdown (`**bold**`, listas, headings, tabelas GFM) sem render
 * mostrariam asteriscos literais. Este
 * módulo é a fonte única do parser: `marked` (markdown → HTML) seguido de
 * `DOMPurify` (sanitização). `marked` v5+ NÃO sanitiza, então o DOMPurify
 * depois é a única defesa contra XSS — a ordem parse→sanitize é obrigatória.
 *
 * Duas variantes:
 *  - `markdownToSafeHtml`  — bloco (prosa das mensagens): parágrafos, listas,
 *    headings, tabelas. Vai num container `<div>`.
 *  - `markdownInlineToSafeHtml` — inline (corpo de perguntas numeradas e do
 *    painel lateral): só ênfase/código/link, sem blocos que quebrariam o layout.
 *
 * Performance: `marked.parse` roda o lexer completo e o chat re-renderiza toda
 * a lista de bolhas a cada mensagem nova. Como `marked` é puro, memoizamos por
 * string de entrada (cache com cap) — re-renders e bolhas repetidas ficam O(1).
 */

// Tags permitidas no modo BLOCO (prosa). É o allow-list que já existia em
// ProcessedMessageContent MAIS as tags de tabela GFM.
const BLOCK_ALLOWED_TAGS = [
  'b', 'i', 'strong', 'em', 'a', 'br', 'p', 'ul', 'ol', 'li', 'span',
  'h1', 'h2', 'h3', 'h4', 'code', 'pre',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
];

// Modo DOCUMENTO (folha do documento pronto e prévia de modelos): o de bloco mais
// o que um documento oficial usa e a conversa não — linha separadora, citação e
// títulos de 5º e 6º nível. A lista do chat fica como está.
const DOCUMENT_ALLOWED_TAGS = [...BLOCK_ALLOWED_TAGS, 'hr', 'blockquote', 'h5', 'h6'];

// Modo INLINE (cards de pergunta): sem blocos.
const INLINE_ALLOWED_TAGS = ['b', 'i', 'strong', 'em', 'a', 'code', 'br', 'span'];

const ALLOWED_ATTR = ['href', 'target', 'rel', 'class'];

// Links externos abrem em nova aba sem vazar `window.opener`. Hook global e
// idempotente; só toca em <a>. (security.ts usa ALLOWED_TAGS:[], então nenhum
// <a> sobrevive lá — o hook não interfere naquele caminho.)
let hookRegistered = false;
function ensureLinkHook(): void {
  if (hookRegistered) return;
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A' && node.getAttribute('href')) {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });
  hookRegistered = true;
}

const MARKED_OPTIONS = { gfm: true, breaks: true } as const;

// Cache memoizado (marked é puro). Map preserva ordem de inserção → evict FIFO.
const MAX_CACHE = 500;
const blockCache = new Map<string, string>();
const inlineCache = new Map<string, string>();
const documentCache = new Map<string, string>();

function memoized(
  cache: Map<string, string>,
  key: string,
  compute: () => string,
): string {
  const hit = cache.get(key);
  if (hit !== undefined) return hit;
  const value = compute();
  cache.set(key, value);
  if (cache.size > MAX_CACHE) {
    // Remove a entrada mais antiga.
    const oldest = cache.keys().next().value as string | undefined;
    if (oldest !== undefined) cache.delete(oldest);
  }
  return value;
}

/** Markdown de bloco → HTML sanitizado (prosa das mensagens do assistente). */
export function markdownToSafeHtml(md: string): string {
  if (!md) return '';
  return memoized(blockCache, md, () => {
    ensureLinkHook();
    const html = marked.parse(md, MARKED_OPTIONS) as string;
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: BLOCK_ALLOWED_TAGS,
      ALLOWED_ATTR,
      ALLOW_DATA_ATTR: false,
    });
  });
}

/** Markdown de documento → HTML sanitizado (folha do documento e prévia de modelos). */
export function markdownDocumentoToSafeHtml(md: string): string {
  if (!md) return '';
  return memoized(documentCache, md, () => {
    ensureLinkHook();
    const html = marked.parse(md, MARKED_OPTIONS) as string;
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: DOCUMENT_ALLOWED_TAGS,
      ALLOWED_ATTR,
      ALLOW_DATA_ATTR: false,
    });
  });
}

/**
 * Markdown inline → HTML sanitizado (corpo de perguntas; sem blocos).
 *
 * `breaks` (default true): converte `\n` em `<br>`. Passe `false` quando o
 * container já preserva quebras via `white-space: pre-wrap` (ex.: o intro do
 * painel) — senão o `<br>` do marked SOMA com a quebra do pre-wrap e dobra o
 * espaçamento.
 */
export function markdownInlineToSafeHtml(
  md: string,
  opts: { breaks?: boolean } = {},
): string {
  if (!md) return '';
  const breaks = opts.breaks !== false;
  const cacheKey = `${breaks ? 'b' : 'n'}:${md}`;
  return memoized(inlineCache, cacheKey, () => {
    ensureLinkHook();
    const html = marked.parseInline(md, { gfm: true, breaks }) as string;
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: INLINE_ALLOWED_TAGS,
      ALLOWED_ATTR,
      ALLOW_DATA_ATTR: false,
    });
  });
}
