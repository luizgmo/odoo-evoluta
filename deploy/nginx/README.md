# Nginx da Evoluta

Os arquivos `.template` são renderizados pelos scripts de deploy. O resultado deve ser instalado em `/etc/nginx/sites-available/` e habilitado em `/etc/nginx/sites-enabled/`.

A configuração publica o React e encaminha somente os endpoints necessários do Odoo (`/api/`, `/web/session/`, `/web/login` e `/websocket`). A interface administrativa completa do Odoo não deve ser exposta no mesmo caminho público sem proteção adicional.

Fluxo recomendado na VPS:

1. Renderizar a configuração HTTP.
2. Validar com `sudo nginx -t`.
3. Recarregar o Nginx.
4. Emitir o certificado com Certbot.
5. Revalidar HTTPS e cookies.
6. Ativar redirecionamento HTTP → HTTPS.
