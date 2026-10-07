/**
 * SUBSTITUÍVEL: baixa um arquivo .docx. Aqui gera, no próprio navegador e sem
 * dependências, um .docx REAL (zip sem compressão + XML mínimo — o Word abre) com o
 * título e os parágrafos recebidos, para o botão funcionar sem servidor. Em um
 * sistema real, troque o corpo de `baixarDocx` por: buscar o blob no servidor (GET do
 * arquivo) e entregar a `salvar(blob, nome)`.
 */

/** Um bloco do documento: parágrafo (texto) ou subtítulo em negrito. */
export type BlocoDocx = string | { titulo: string };

const TIPO_DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function salvar(blob: Blob, nome: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${nome}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

const TABELA_CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(dados: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < dados.length; i++) c = TABELA_CRC[(c ^ dados[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

const texto = (s: string) => new TextEncoder().encode(s);

/** Zip "stored" (sem compressão): cabeçalho local + dados de cada arquivo, diretório central e fim. */
function zipar(arquivos: { nome: string; dados: Uint8Array }[]): Uint8Array {
  const locais: Uint8Array[] = [];
  const centrais: Uint8Array[] = [];
  let deslocamento = 0;
  for (const { nome, dados } of arquivos) {
    const n = texto(nome);
    const crc = crc32(dados);
    const local = new Uint8Array(30 + n.length + dados.length);
    const v = new DataView(local.buffer);
    v.setUint32(0, 0x04034b50, true);
    v.setUint16(4, 20, true); // versão mínima
    v.setUint16(6, 0x0800, true); // nomes em UTF-8
    v.setUint16(8, 0, true); // método 0 = sem compressão
    v.setUint16(10, 0, true); // hora
    v.setUint16(12, 0x21, true); // data 01/01/1980
    v.setUint32(14, crc, true);
    v.setUint32(18, dados.length, true);
    v.setUint32(22, dados.length, true);
    v.setUint16(26, n.length, true);
    v.setUint16(28, 0, true);
    local.set(n, 30);
    local.set(dados, 30 + n.length);
    locais.push(local);

    const central = new Uint8Array(46 + n.length);
    const c = new DataView(central.buffer);
    c.setUint32(0, 0x02014b50, true);
    c.setUint16(4, 20, true); // versão que criou
    c.setUint16(6, 20, true); // versão mínima
    c.setUint16(8, 0x0800, true);
    c.setUint16(10, 0, true);
    c.setUint16(12, 0, true);
    c.setUint16(14, 0x21, true);
    c.setUint32(16, crc, true);
    c.setUint32(20, dados.length, true);
    c.setUint32(24, dados.length, true);
    c.setUint16(28, n.length, true);
    c.setUint32(42, deslocamento, true);
    central.set(n, 46);
    centrais.push(central);
    deslocamento += local.length;
  }
  const tamanhoCentral = centrais.reduce((s, x) => s + x.length, 0);
  const fim = new Uint8Array(22);
  const f = new DataView(fim.buffer);
  f.setUint32(0, 0x06054b50, true);
  f.setUint16(8, arquivos.length, true);
  f.setUint16(10, arquivos.length, true);
  f.setUint32(12, tamanhoCentral, true);
  f.setUint32(16, deslocamento, true);
  const saida = new Uint8Array(deslocamento + tamanhoCentral + fim.length);
  let p = 0;
  for (const parte of [...locais, ...centrais, fim]) {
    saida.set(parte, p);
    p += parte.length;
  }
  return saida;
}

const escapar = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "");

function paragrafo(t: string, opcoes: { negrito?: boolean; tamanho?: number } = {}): string {
  const rpr = opcoes.negrito || opcoes.tamanho
    ? `<w:rPr>${opcoes.negrito ? "<w:b/>" : ""}${opcoes.tamanho ? `<w:sz w:val="${opcoes.tamanho}"/>` : ""}</w:rPr>`
    : "";
  return `<w:p><w:r>${rpr}<w:t xml:space="preserve">${escapar(t)}</w:t></w:r></w:p>`;
}

/** Monta os bytes de um .docx válido: título grande em negrito, depois os blocos. */
export function gerarDocx(titulo: string, blocos: BlocoDocx[]): Uint8Array {
  const corpo =
    paragrafo(titulo, { negrito: true, tamanho: 36 }) +
    blocos
      .map((b) => (typeof b === "string" ? paragrafo(b) : paragrafo(b.titulo, { negrito: true, tamanho: 28 })))
      .join("");
  const documento =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${corpo}</w:body></w:document>`;
  const tipos =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
    `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
    `<Default Extension="xml" ContentType="application/xml"/>` +
    `<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>` +
    `</Types>`;
  const relacoes =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>` +
    `</Relationships>`;
  return zipar([
    { nome: "[Content_Types].xml", dados: texto(tipos) },
    { nome: "_rels/.rels", dados: texto(relacoes) },
    { nome: "word/document.xml", dados: texto(documento) },
  ]);
}

/**
 * Os mesmos blocos em markdown, para mostrar na tela o que vai no .docx:
 * `markdownDocumentoToSafeHtml(blocosParaMarkdown(blocos))` (utils/markdown.ts).
 */
export const blocosParaMarkdown = (blocos: BlocoDocx[]): string =>
  blocos.map((b) => (typeof b === "string" ? b : `## ${b.titulo}`)).join("\n\n");

/**
 * Mantém a assinatura usada pelas telas. `blocos` é opcional: sem ele, sai um documento só
 * com o título e uma linha neutra. `titulo` é o título impresso na primeira linha do .docx;
 * sem ele vale o nome do arquivo (`nomeDoDocumento`, sem extensão). (Para o desenvolvedor: em
 * sistema real, troque o corpo por buscar o arquivo no servidor pelo `idDoArquivo`.)
 */
export async function baixarDocx(
  idDoArquivo: string,
  nomeDoDocumento: string,
  blocos?: BlocoDocx[],
  titulo?: string,
): Promise<void> {
  await new Promise((r) => setTimeout(r, 300));
  const bytes = gerarDocx(titulo ?? nomeDoDocumento, blocos ?? ["Documento sem conteúdo informado."]);
  salvar(new Blob([bytes as BlobPart], { type: TIPO_DOCX }), nomeDoDocumento);
}
