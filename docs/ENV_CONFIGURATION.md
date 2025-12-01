# 🔧 Guia de Configuração - Variáveis de Ambiente

Este guia detalha todas as variáveis de ambiente necessárias para executar o Sistema de Gerenciamento para Salão de Beleza.

## 📋 Índice

- [Configuração Rápida](#configuração-rápida)
- [Variáveis Obrigatórias](#variáveis-obrigatórias)
- [Variáveis Opcionais](#variáveis-opcionais)
- [Ambientes](#ambientes)
- [Segurança](#segurança)

---

## ⚡ Configuração Rápida

### 1. Criar arquivo `.env`

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env
```

### 2. Configuração Mínima (Desenvolvimento Local)

Para rodar localmente, você precisa apenas de:

```env
# Obrigatórias
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/salao_db?schema=public"
JWT_SECRET="seu-secret-super-seguro-minimo-32-caracteres-aqui"

# Recomendadas
PORT=4000
NODE_ENV="development"
CORS_ORIGINS="http://localhost:3000"
```

---

## ✅ Variáveis Obrigatórias

### 🗄️ Database

#### `DATABASE_URL`
- **Descrição:** String de conexão com PostgreSQL
- **Formato:** `postgresql://[user]:[password]@[host]:[port]/[database]?schema=public`
- **Exemplo:** `postgresql://postgres:senha123@localhost:5432/salao_db?schema=public`
- **Obrigatória:** ✅ Sim

**Como obter:**

**Opção 1: PostgreSQL Local**
```bash
# Após instalar PostgreSQL, crie o banco:
psql -U postgres
CREATE DATABASE salao_db;
```

**Opção 2: Supabase (Gratuito)**
1. Acesse [supabase.com](https://supabase.com)
2. Crie um projeto
3. Em Settings → Database, copie a "Connection String"
4. Troque `[YOUR-PASSWORD]` pela senha do projeto

**Opção 3: Railway**
1. Acesse [railway.app](https://railway.app)
2. Crie um novo projeto
3. Adicione PostgreSQL
4. Copie a variável `DATABASE_URL`

---

### 🔐 JWT (Autenticação)

#### `JWT_SECRET`
- **Descrição:** Chave secreta para assinar tokens JWT
- **Formato:** String aleatória de no mínimo 32 caracteres
- **Obrigatória:** ✅ Sim
- **⚠️ CRÍTICO:** Nunca compartilhe ou commite esta chave!

**Como gerar:**

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# OpenSSL
openssl rand -hex 64

# Online (use apenas em desenvolvimento)
# https://www.uuidgenerator.net/
```

**Exemplo:**
```env
JWT_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2"
```

#### `JWT_ACCESS_EXPIRES_IN` (Opcional)
- **Descrição:** Tempo de expiração do access token
- **Padrão:** `15m` (15 minutos)
- **Formato:** `1h`, `30m`, `7d`
- **Recomendação:** Manter entre 15min e 1h

#### `JWT_REFRESH_EXPIRES_IN` (Opcional)
- **Descrição:** Tempo de expiração do refresh token
- **Padrão:** `30d` (30 dias)
- **Formato:** `1h`, `30m`, `7d`
- **Recomendação:** Entre 7d e 90d

---

### 🌐 Server

#### `PORT`
- **Descrição:** Porta onde o servidor irá rodar
- **Padrão:** `4000`
- **Obrigatória:** ❌ Não (usa 4000 por padrão)

#### `NODE_ENV`
- **Descrição:** Ambiente de execução
- **Valores:** `development`, `production`, `test`
- **Padrão:** `development`
- **Impacto:** 
  - `production`: Logs minimalistas, otimizações habilitadas
  - `development`: Logs detalhados, stack traces completas

---

## 🔧 Variáveis Opcionais

### 🔴 Redis (Filas e Cache)

#### `REDIS_URL`
- **Descrição:** URL de conexão com Redis
- **Formato:** `redis://[host]:[port]`
- **Exemplo:** `redis://localhost:6379`
- **Necessário para:** 
  - Filas de jobs (notificações, lembretes)
  - Cache de dados
  - Rate limiting distribuído

**Como obter:**

**Opção 1: Redis Local**
```bash
# Instalar Redis
# Windows: https://github.com/microsoftarchive/redis/releases
# Linux: sudo apt install redis-server
# Mac: brew install redis

# Iniciar Redis
redis-server
```

**Opção 2: Upstash (Gratuito)**
1. Acesse [upstash.com](https://upstash.com)
2. Crie um database Redis
3. Copie a `REDIS_URL`

**Opção 3: Redis Cloud**
1. Acesse [redis.com/cloud](https://redis.com/try-free/)
2. Crie um database
3. Copie a connection string

---

### 🌍 CORS

#### `CORS_ORIGINS`
- **Descrição:** URLs permitidas para acessar a API
- **Formato:** URLs separadas por vírgula
- **Exemplo:** `http://localhost:3000,https://meuapp.com`
- **Desenvolvimento:** `http://localhost:3000,http://localhost:5173`
- **Produção:** `https://seu-dominio.com`

**⚠️ Segurança:** Em produção, especifique apenas domínios confiáveis!

---

### 📧 Email (Nodemailer)

#### `SMTP_HOST`
- **Descrição:** Servidor SMTP
- **Exemplos:** 
  - Gmail: `smtp.gmail.com`
  - Outlook: `smtp-mail.outlook.com`
  - SendGrid: `smtp.sendgrid.net`

#### `SMTP_PORT`
- **Descrição:** Porta do servidor SMTP
- **Valores comuns:**
  - `587` - TLS (recomendado)
  - `465` - SSL
  - `25` - Sem criptografia (não recomendado)

#### `SMTP_SECURE`
- **Descrição:** Usar SSL/TLS
- **Valores:** `true` ou `false`
- **Recomendação:** `false` com porta 587 (STARTTLS)

#### `SMTP_USER`
- **Descrição:** Email remetente
- **Exemplo:** `seu-email@gmail.com`

#### `SMTP_PASS`
- **Descrição:** Senha do email
- **⚠️ Gmail:** Use "Senha de App", não a senha normal
  - Acesse: https://myaccount.google.com/apppasswords
  - Gere uma senha de 16 caracteres

#### `SMTP_FROM`
- **Descrição:** Nome e email exibidos no remetente
- **Formato:** `"Nome" <email@exemplo.com>`
- **Exemplo:** `"Sistema Salão" <noreply@seusalao.com>"`

**Exemplo completo (Gmail):**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
SMTP_FROM="Sistema Salão <noreply@seusalao.com>"
```

---

### 💬 WhatsApp Business API

#### `WHATSAPP_API_URL`
- **Descrição:** URL da API do WhatsApp
- **Padrão:** `https://graph.facebook.com/v18.0`

#### `WHATSAPP_ACCESS_TOKEN`
- **Descrição:** Token de acesso do WhatsApp Business
- **Como obter:**
  1. Acesse [Meta for Developers](https://developers.facebook.com/)
  2. Crie um app Business
  3. Configure WhatsApp
  4. Copie o token temporário ou gere um permanente

#### `WHATSAPP_PHONE_NUMBER_ID`
- **Descrição:** ID do número de telefone WhatsApp Business
- **Como obter:** No painel do Meta for Developers, em WhatsApp → Getting Started

#### `WHATSAPP_VERIFY_TOKEN`
- **Descrição:** Token para verificar webhook
- **Formato:** Qualquer string secreta que você definir
- **Exemplo:** `meu-token-secreto-webhook-123`

**Documentação:** https://developers.facebook.com/docs/whatsapp/cloud-api

---

### 💳 Gateways de Pagamento

#### Mercado Pago

```env
MERCADOPAGO_ACCESS_TOKEN=seu-token-aqui
MERCADOPAGO_PUBLIC_KEY=sua-chave-publica
```

**Como obter:**
1. Acesse [mercadopago.com.br](https://www.mercadopago.com.br/)
2. Vá em Seu negócio → Credenciais
3. Copie Access Token e Public Key

#### Stripe

```env
STRIPE_SECRET_KEY=sk_test_sua-chave
STRIPE_WEBHOOK_SECRET=whsec_seu-webhook-secret
```

**Como obter:**
1. Acesse [stripe.com](https://stripe.com/)
2. Developers → API Keys
3. Copie Secret Key
4. Para webhook: Developers → Webhooks → Add endpoint

#### PagSeguro

```env
PAGSEGURO_EMAIL=seu-email@exemplo.com
PAGSEGURO_TOKEN=seu-token-pagseguro
```

**Como obter:**
1. Acesse [pagseguro.uol.com.br](https://pagseguro.uol.com.br/)
2. Integrações → Token de Segurança

---

### 📊 Monitoramento

#### `SENTRY_DSN`
- **Descrição:** DSN do Sentry para rastreamento de erros
- **Formato:** `https://chave@sentry.io/projeto-id`
- **Como obter:**
  1. Acesse [sentry.io](https://sentry.io/)
  2. Crie um projeto
  3. Copie o DSN em Settings → Client Keys

---

### 🔒 Rate Limiting

#### `RATE_LIMIT_WINDOW_MS`
- **Descrição:** Janela de tempo para rate limit (em milissegundos)
- **Padrão:** `900000` (15 minutos)
- **Exemplo:** `60000` = 1 minuto

#### `RATE_LIMIT_MAX_REQUESTS`
- **Descrição:** Máximo de requisições por janela
- **Padrão:** `100`
- **Recomendação:**
  - Desenvolvimento: `100-200`
  - Produção: `50-100`

---

### 📁 Upload de Arquivos

#### `MAX_FILE_SIZE`
- **Descrição:** Tamanho máximo de arquivo (em bytes)
- **Padrão:** `5242880` (5MB)
- **Exemplos:**
  - 1MB = `1048576`
  - 5MB = `5242880`
  - 10MB = `10485760`

#### `ALLOWED_FILE_TYPES`
- **Descrição:** Tipos MIME permitidos para upload
- **Formato:** Lista separada por vírgulas
- **Padrão:** `image/jpeg,image/png,image/webp,application/pdf`

---

### 🌐 URLs da Aplicação

#### `FRONTEND_URL`
- **Descrição:** URL do frontend (para redirecionamentos, emails, etc.)
- **Desenvolvimento:** `http://localhost:3000`
- **Produção:** `https://seu-dominio.com`

#### `BACKEND_URL`
- **Descrição:** URL do backend (para webhooks, callbacks, etc.)
- **Desenvolvimento:** `http://localhost:4000`
- **Produção:** `https://api.seu-dominio.com`

---

## 🌍 Ambientes

### Desenvolvimento Local

```env
NODE_ENV=development
PORT=4000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/salao_db?schema=public"
JWT_SECRET="dev-secret-change-in-production"
CORS_ORIGINS="http://localhost:3000,http://localhost:5173"
REDIS_URL="redis://localhost:6379"
```

### Produção

```env
NODE_ENV=production
PORT=4000
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
JWT_SECRET="[GERAR NOVA CHAVE SEGURA]"
CORS_ORIGINS="https://seu-dominio.com"
REDIS_URL="rediss://user:pass@host:6379"
SENTRY_DSN="https://chave@sentry.io/projeto"
RATE_LIMIT_MAX_REQUESTS=50
```

### Testes

```env
NODE_ENV=test
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/salao_db_test?schema=public"
JWT_SECRET="test-secret"
```

---

## 🔐 Segurança

### ✅ Boas Práticas

1. **NUNCA commite o arquivo `.env`**
   - Está no `.gitignore` por padrão
   - Use `.env.example` como template

2. **Use secrets diferentes por ambiente**
   - Desenvolvimento vs. Produção
   - Nunca reutilize `JWT_SECRET` entre ambientes

3. **Rotacione secrets regularmente**
   - JWT_SECRET: a cada 3-6 meses
   - API Tokens: conforme política do provedor

4. **Use variáveis de ambiente no deploy**
   - Railway, Render, Heroku têm painel para isso
   - Nunca coloque secrets em código

5. **Valide variáveis obrigatórias**
   - O projeto usa Zod para validar em `src/config/env.ts`

### ❌ O Que Evitar

- ❌ Commitar arquivo `.env`
- ❌ Compartilhar secrets em chat/email
- ❌ Usar mesma chave em dev e prod
- ❌ Deixar `JWT_SECRET` padrão
- ❌ Expor `.env` publicamente

---

## 🆘 Troubleshooting

### Erro: "DATABASE_URL is required"

**Solução:** Certifique-se de que `.env` existe e contém `DATABASE_URL`

```bash
# Verifique se o arquivo existe
ls -la .env

# Se não existir, crie a partir do exemplo
cp .env.example .env
```

### Erro: "Connection to Redis failed"

**Solução:** Redis é opcional. Se não quiser usar, comente ou remova `REDIS_URL`

```env
# REDIS_URL="redis://localhost:6379"
```

### Erro: "JWT malformed"

**Solução:** `JWT_SECRET` deve ter pelo menos 32 caracteres

```bash
# Gere um novo
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Erro de CORS

**Solução:** Adicione a URL do frontend em `CORS_ORIGINS`

```env
CORS_ORIGINS="http://localhost:3000,http://localhost:5173,https://seu-dominio.com"
```

---

## 📚 Referências

- [Node.js Environment Variables](https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs)
- [Prisma Connection URLs](https://www.prisma.io/docs/reference/database-reference/connection-urls)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Twelve-Factor App](https://12factor.net/config)

---

**💡 Dica:** Mantenha um arquivo `.env.local` para sobrescrever variáveis localmente sem alterar `.env`.

```bash
# .gitignore já ignora:
.env
.env.local
.env.*.local
```
