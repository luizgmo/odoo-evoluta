# Preparação e operação dos ambientes Evoluta

## Objetivo

Este documento descreve a preparação do repositório e a operação dos três ambientes:

```text
local → staging/homologação → produção
```

A publicação real na VPS exige acesso SSH, domínio e DNS; estes arquivos não executam publicação automaticamente.

## Arquitetura

- React: build estático em `frontend/dist`.
- Nginx: serve o React e encaminha `/api/`, `/web/session/` e `/websocket` ao Odoo.
- Odoo: backend e fonte da verdade.
- PostgreSQL: somente na rede Docker, sem porta pública.
- Filestore: volume persistente separado do PostgreSQL.
- Produção: banco multi-município `evoluta_prod`.
- Staging: banco separado `evoluta_staging`, podendo conter massa DEMO.

A mesma VPS pode executar os dois ambientes inicialmente, usando as portas locais 8069/8072 para produção e 8070/8073 para staging. O acesso externo deve ocorrer somente pelo Nginx com HTTPS. Os checkouts e builds ficam separados em `/srv/evoluta-prod` e `/srv/evoluta-staging`.

## Pré-requisitos da VPS

- Ubuntu atualizado;
- Docker Engine e `docker-compose` compatível com `--env-file`;
- Git, Python 3 e Node/npm;
- Nginx e Certbot;
- usuário de deploy com `sudo`;
- DNS apontando para o IP da VPS;
- firewall liberando apenas SSH restrito, HTTP e HTTPS.

As portas 5432, 8069, 8070, 8071, 8072 e 8073 não devem ser liberadas publicamente.

## Preparação inicial

Crie um checkout independente para cada ambiente. Isso evita que o `frontend/dist` de staging seja confundido com o de produção:

```bash
sudo mkdir -p /srv/evoluta-staging /srv/evoluta-prod
sudo chown -R "$USER":"$USER" /srv/evoluta-staging /srv/evoluta-prod
for dir in /srv/evoluta-staging /srv/evoluta-prod; do
  git clone https://github.com/luizgmo/odoo-evoluta.git "$dir"
done
```

Instale os OCA conforme o manifesto versionado `deploy/oca-versions.lock`, em cada checkout. O script baixa os repositórios e fixa cada um no SHA aprovado:

```bash
cd /srv/evoluta-staging
./deploy/scripts/install-oca.sh
cd /srv/evoluta-prod
./deploy/scripts/install-oca.sh
```

Para atualizar um OCA, altere o manifesto em uma branch, teste no staging e só depois promova o novo SHA para produção.

O script imprime os SHAs usados. Esses SHAs devem ser registrados antes de promover o ambiente para produção.

## Secrets

Copie os exemplos e preencha valores reais somente na VPS:

```bash
cd /srv/evoluta-staging
cp .env.staging.example .env.staging
chmod 600 .env.staging

cd /srv/evoluta-prod
cp .env.prod.example .env.prod
chmod 600 .env.prod
```

Nunca versione os arquivos reais. Cada ambiente deve possuir senha diferente para PostgreSQL e para `admin_passwd` do Odoo.

## Staging

Renderizar as configurações:

```bash
./deploy/scripts/render-config.sh staging staging.evoluta.org.br
```

Inicializar um banco staging vazio:

```bash
./deploy/scripts/bootstrap-db.sh staging
./deploy/scripts/bootstrap-admin.sh staging
```

O comando `bootstrap-admin.sh` cria ou atualiza o superadmin técnico usando `BOOTSTRAP_ADMIN_LOGIN`, `BOOTSTRAP_ADMIN_PASSWORD` e `BOOTSTRAP_ADMIN_NAME` do `.env.staging`. Use uma senha temporária forte e troque-a após o primeiro acesso, se necessário.

Se o staging for uma cópia do ambiente local, restaure o dump PostgreSQL e o filestore com `restore.sh`, em vez de usar `bootstrap-db.sh`. Depois da restauração, execute `bootstrap-admin.sh` para garantir o acesso administrativo do ambiente.

Fazer o deploy:

```bash
./deploy/scripts/deploy-staging.sh
./deploy/scripts/healthcheck.sh staging
```

Preparar o Nginx:

```bash
./deploy/scripts/prepare-nginx.sh staging staging.evoluta.org.br
sudo certbot --nginx -d staging.evoluta.org.br
```

Depois do certificado, validar login, sessão, isolamento e todos os workflows pelo domínio HTTPS.

## Produção

Produção deve ser inicializada sem a massa `DEMO-20261009`:

```bash
./deploy/scripts/render-config.sh prod app.evoluta.org.br
./deploy/scripts/bootstrap-db.sh prod
./deploy/scripts/bootstrap-admin.sh prod
```

O comando `bootstrap-admin.sh` cria ou atualiza o superadmin técnico usando as variáveis `BOOTSTRAP_ADMIN_*` do `.env.prod`. Defina credenciais reais, únicas e fortes antes de executá-lo. Não usar as credenciais de demonstração nem deixar os valores `CHANGE_ME` no servidor.

Preparar Nginx e certificado:

```bash
./deploy/scripts/prepare-nginx.sh prod app.evoluta.org.br
sudo certbot --nginx -d app.evoluta.org.br
```

Publicar uma versão aprovada somente após backup e aprovação do staging:

```bash
CONFIRM_PROD_DEPLOY=YES ./deploy/scripts/deploy-prod.sh
./deploy/scripts/healthcheck.sh prod
```

O script recusa o deploy se a confirmação não for informada, se houver alterações locais ou se a configuração obrigatória estiver incompleta.

## Build do frontend

O banco é gravado no bundle no momento da compilação. Portanto, nunca execute um build de produção sem informar `VITE_ODOO_DB`:

```bash
cd frontend
VITE_ODOO_DB=evoluta_staging npm ci
VITE_ODOO_DB=evoluta_staging npm run build
```

Para produção:

```bash
VITE_ODOO_DB=evoluta_prod npm ci
VITE_ODOO_DB=evoluta_prod npm run build
```

Um build em modo produção sem `VITE_ODOO_DB` deve falhar intencionalmente para evitar apontar acidentalmente para o banco `demo`.

## Backup

O backup deve conter banco e filestore:

```bash
./deploy/scripts/backup.sh staging
./deploy/scripts/backup.sh prod
```

Os arquivos gerados devem ser copiados para armazenamento externo. Snapshot da VPS sozinho não é estratégia suficiente.

## Restauração

A restauração exige confirmação adicional em produção:

```bash
CONFIRM_PROD_RESTORE=YES ./deploy/scripts/restore.sh prod \
  /caminho/banco.dump \
  /caminho/filestore.tar.gz
```

Após a restauração:

```bash
./deploy/scripts/healthcheck.sh prod
```

Também devem ser executados os testes de login, leitura de projetos, anexos, Helpdesk e jobs.

## Rollback

Rollback de código:

```bash
./deploy/scripts/rollback.sh staging <commit-ou-tag>
```

Em produção:

```bash
CONFIRM_PROD_ROLLBACK=YES ./deploy/scripts/rollback.sh prod <commit-ou-tag>
```

Rollback de código não desfaz automaticamente uma alteração de schema. Para migração incompatível, restaurar banco e filestore a partir de backup validado.

## Fluxo de promoção

1. Criar branch de feature.
2. Desenvolver e testar localmente.
3. Executar typecheck, Vitest, build e E2E.
4. Fazer revisão e merge do commit aprovado.
5. Publicar o mesmo commit no staging.
6. Executar testes de autorização, isolamento e workflows no staging.
7. Fazer backup de produção.
8. Publicar exatamente o commit aprovado.
9. Executar healthcheck e smoke test.
10. Registrar commit, horário, resultado e eventual rollback.

## Critérios de aceite do deploy

- HTTPS válido e HTTP redirecionado;
- React abre pelo domínio;
- cookies de sessão estão seguros;
- PostgreSQL não possui porta pública;
- Odoo não está exposto diretamente;
- `evoluta_staging` e `evoluta_prod` não compartilham volumes;
- build de produção não contém `demo`, login de teste ou secrets;
- superadmin entra pelo React;
- cada perfil respeita município, secretaria e departamento;
- Kanban, 5W2H, Helpdesk, anexos, agenda e jobs persistem após restart;
- backup de banco e filestore é criado;
- restore foi testado em staging;
- logs não exibem senha, cookie ou token;
- produção não contém registros DEMO.
