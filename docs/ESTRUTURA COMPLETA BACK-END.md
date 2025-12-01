Vou cobrir:
* 1. Visão geral da arquitetura
* 2. Estrutura de pastas da API (boa prática)
* 3. Principais módulos/endpoints (rota + responsabilidade + payloads exemplo)
* 4. Esquema de banco de dados (tabelas principais, campos, chaves e índices)
* 5. Autenticação, autorização e fluxo JWT
* 6. Integrações (WhatsApp, pagamentos, Google Calendar) e webhooks
* 7. Jobs, fila e notificações (design)
* 8. Segurança, observabilidade e implantação rápida
* 9. Variáveis de ambiente importantes & checklist final

Se preferir, eu já gero os arquivos iniciais (ex.: migrations SQL + esquema TypeScript/Sequelize/knex) — diga qual ORM/migration prefere (Prisma, Knex, TypeORM, Sequelize).

---

# 1 — Visão geral (arquitetura)

* **Backend**: Node.js + Express (restful JSON).
* **DB**: Postgres (hospedado no Supabase).
* **Auth**: JWT (Access token curto + Refresh token).
* **Storage**: Supabase Storage (imagens de perfil, comprovantes).
* **Queue / Jobs**: BullMQ (Redis) para notificações, envio de WhatsApp, relatórios e tarefas agendadas.
* **Integrações**: WhatsApp Business API (via axios), gateways de pagamento (MercadoPago/Stripe/PagSeguro) via axios/SDK.
* **Realtime / Notifs**: WebSockets ou Supabase Realtime para dashboard em tempo real + webhooks do WhatsApp.
* **Monitoramento / Logs**: Sentry + Winston/Logstash + metrics (Prometheus / Grafana ou serviços administrados).
* **Deploy**: Container (Docker) ou Vercel/Render/Heroku + Supabase + Redis gerenciado.

---

# 2 — Estrutura de pastas (sugestão)

```
/src
  /config
    db.ts
    env.ts
  /api
    /v1
      /auth
        auth.controller.ts
        auth.service.ts
        auth.routes.ts
      /users
      /staff
      /clients
      /appointments
      /payments
      /inventory
      /reports
      /webhooks
  /services
    whatsapp.service.ts
    payments.service.ts
    calendar.service.ts
    storage.service.ts
  /jobs
    queue.ts
    send-reminder.job.ts
    process-payment.job.ts
  /middlewares
    auth.jwt.ts
    cors.ts
    error.handler.ts
    validate.ts
    permissions.ts
  /db
    migrations/
    seeds/
    models/  (if using ORM)
  /utils
    logger.ts
    validator.ts
  app.ts
  server.ts
```

---

# 3 — Principais módulos e endpoints (essenciais)

Vou listar endpoints-chave com verbos e payloads resumidos.

## Auth

* `POST /api/v1/auth/login`
  Payload: `{ email, password }`
  Resposta: `{ accessToken, refreshToken, user }`

* `POST /api/v1/auth/refresh`
  Payload: `{ refreshToken }` → novo accessToken

* `POST /api/v1/auth/logout`
  Invalida refresh token (salvar blacklist ou DB).

## Usuários / Perfis

* `GET /api/v1/users/me`
* `PUT /api/v1/users/:id` (perfil, permissões)

## Profissionais (staff)

* `GET /api/v1/staff`
* `POST /api/v1/staff` (criar perfil do profissional)
* Campos: `id, name, role, commission_type, commission_value, working_hours`

## Clientes

* `GET /api/v1/clients`
* `POST /api/v1/clients` `{ name, phone, email, birthdate, notes }`
* `GET /api/v1/clients/:id/history` (histórico de serviços)

## Agendamentos

* `POST /api/v1/appointments` `{ client_id, staff_id, service_id[], start, end, status, paid }`
* `GET /api/v1/appointments?date=YYYY-MM-DD&staff_id=`
* `PUT /api/v1/appointments/:id` (reagendar, cancelar)
* `DELETE /api/v1/appointments/:id`

## Serviços

* `GET /api/v1/services`
* `POST /api/v1/services` `{ name, duration_min, price, category }`

## Caixa / Financeiro

* `POST /api/v1/payments` `{ appointment_id, client_id, amount, method, reference }`
* `GET /api/v1/financials/report?from=&to=`
* `POST /api/v1/expenses` `{ description, amount, date }`

## Estoque / PDV

* `GET /api/v1/products`
* `POST /api/v1/products` `{ sku, name, qty, cost_price, sale_price }`
* `POST /api/v1/sales` (venda de produtos, integração com caixa)

## Webhooks

* `POST /api/v1/webhooks/whatsapp` (recebe callbacks do WhatsApp)
* `POST /api/v1/webhooks/payment` (notificações do gateway)

---

# 4 — Esquema do Banco de Dados (ER principal)

A seguir os **principais** modelos/tabelas e campos sugeridos (omitindo timestamps para brevidade). Incluo chaves, índices e relações.

> Obs: prefira UUIDs (`uuid_generate_v4()`) para IDs.

### users

* `id uuid PK`
* `email varchar unique`
* `password_hash varchar`
* `name varchar`
* `role varchar` (`admin`, `manager`, `reception`, `staff`)
* `is_active boolean`
* `created_at, updated_at`

Índices: `email unique`.

### staff` (pode ser extensão de users, mas tabela separada é mais flexível)

* `id uuid PK`
* `user_id uuid FK -> users(id)`
* `specialties jsonb` (ex.: ["manicure","cabelo"])
* `commission_type enum('percent','fixed')`
* `commission_value numeric`
* `work_schedule jsonb` (horários por dia)
* `created_at`

### clients

* `id uuid PK`
* `name varchar`
* `phone varchar index`
* `email varchar`
* `birthdate date`
* `notes text`
* `loyalty_points int`
* `created_at`

Índices: `phone` para buscas rápidas.

### services

* `id uuid PK`
* `name varchar`
* `duration_minutes int`
* `price numeric`
* `category varchar`
* `created_at`

### appointments

* `id uuid PK`
* `client_id uuid FK -> clients(id)`
* `staff_id uuid FK -> staff(id)`
* `start_ts timestamptz`
* `end_ts timestamptz`
* `status varchar` (`scheduled`, `confirmed`, `in_progress`, `completed`, `cancelled`, `no_show`)
* `services jsonb` (lista de services com price/duration snapshot)
* `notes text`
* `created_by uuid -> users(id)`
* `created_at, updated_at`

Índices: `start_ts` (para buscas por dia), `staff_id + start_ts` (agenda por profissional).

### payments

* `id uuid PK`
* `appointment_id uuid FK`
* `client_id uuid FK`
* `amount numeric`
* `method varchar` (`cash`, `card`, `pix`, `link`)
* `status varchar` (`pending`, `paid`, `refunded`)
* `gateway_reference varchar`
* `created_at`

### commissions

* `id uuid PK`
* `payment_id uuid FK`
* `staff_id uuid FK`
* `amount numeric`
* `created_at`

### products (estoque)

* `id uuid PK`
* `sku varchar unique`
* `name varchar`
* `qty integer`
* `cost numeric`
* `sale_price numeric`
* `reorder_threshold int`

### sales_items & sales

* `sales` similar a payments, vinculado a produtos.

### audit_logs

* `id, user_id, action, entity, entity_id, payload jsonb, created_at`

### refresh_tokens

* `id, user_id, token_hash, revoked boolean, expires_at`

---

# 5 — Autenticação / Autorização (JWT flow)

* **Login**: Validar credenciais → gerar `accessToken` (JWT, validade curta, p.ex. 15min) e `refreshToken` (UUID armazenado na tabela `refresh_tokens` com expiry, validade longa, p.ex. 30d).
* **Access token claims**:

  ```json
  {
    "sub": "user_uuid",
    "role": "admin",
    "permissions": ["appointments:create","payments:read"],
    "iat": 169xxx,
    "exp": 169xxx
  }
  ```
* **Middleware**: `auth.jwt` — verifica header `Authorization: Bearer <token>`, valida assinatura e expiração. Em seguida `permissions` middleware para checar roles/escopos.
* **Refresh**: Endpoint `/auth/refresh` troca refresh token por novo access token; revogue refresh antigo se quiser.
* **Logout**: marque `revoked=true` para refresh token.

**Recomendações**:

* Use `HS256` com secret forte (ou `RS256` com keypair para maior segurança).
* Salvamento de sessão mínima: apenas para refresh tokens e blacklist quando for necessário invalidar tokens.

---

# 6 — Integrações e Webhooks

## WhatsApp Business API

* Serviço `whatsapp.service.ts` → wrapper com axios para:

  * enviar template de confirmação
  * enviar lembrete (24h / 1h)
  * receber mensagens (webhook)
* **Webhook**: `/api/v1/webhooks/whatsapp` — validar assinatura do provedor e enfileirar evento.

## Pagamentos

* `payments.service.ts` : cria pagamento no gateway → webhook para confirmar → atualiza `payments` e cria `commissions` se necessário.

## Google Calendar / iCal

* Sincronização opcional: quando criar agendamento, crie evento no GoogleCalendar do profissional (OAuth2).

---

# 7 — Jobs / Fila / Tarefas agendadas

* **Queue**: BullMQ + Redis.
* **Jobs exemplos**:

  * `send-reminder` (agendado quando cria appointment) — tenta 3x, registra falhas.
  * `process-webhook-payment` — confirma pagamento e cria comissão.
  * `daily-report` — gera relatório em PDF/CSV e envia por e-mail.
  * `cleanup-temp-files` — remove uploads temporários.

Design: crie job para cada integração externa (como WhatsApp) para desacoplar o request-sync.

---

# 8 — Segurança, validação e observabilidade

**Segurança**

* CORS: middleware configurável por ambiente (origins permitidos).
* Rate limiting: `express-rate-limit` por IP e endpoints críticos (login).
* Input validation: `Joi`/`Zod` nos controllers.
* Sanitize: proteja contra SQL injection (usando query params do ORM).
* Proteja uploads (size limit, content-type check).
* Criptografia: senhas com `bcrypt` (salt >= 12).
* LGPD: consentimento em cadastro + endpoint para solicitar exclusão.

**Observability**

* Logger: Winston com transports (console + arquivo + external).
* APM: Sentry + métricas (Prometheus/Grafana).
* Tracing: opentracing/Jaeger opcional.

---

# 9 — Migrations, testes e CI/CD

* **Migrations**: use Prisma Migrate ou Knex migrations. Mantenha scripts SQL versionados.
* **Testes**: unit (Jest), integração (supertest), e2e para endpoints principais.
* **CI/CD**: pipeline que roda lint → tests → build → deploy; use Docker image e variáveis de ambiente seguras.

---

# 10 — Variáveis de ambiente essenciais

```
PORT=4000
NODE_ENV=production
DATABASE_URL=postgresql://...
SUPABASE_URL=...
SUPABASE_KEY=...
JWT_SECRET=...
JWT_ACCESS_EXP=15m
JWT_REFRESH_EXP=30d
REDIS_URL=redis://...
WHATSAPP_API_URL=...
WHATSAPP_TOKEN=...
PAYMENT_GATEWAY_KEY=...
CORS_ORIGINS=https://app.meu-salao.com
SENTRY_DSN=
```

---

# 11 — Índices e performance (obs rápidas)

* Index em `appointments (staff_id, start_ts)` e `appointments (start_ts)` para consultas por dia.
* Index em `clients (phone)` para busca rápida.
* Use `EXPLAIN` para queries que tornam-se lentas; crie views/materialized views para relatórios pesados.
* Cache: Redis para sessões/contadores (ex.: taxa de ocupação), invalidate quando necessário.

---

# 12 — Fluxo de uma ação (exemplo: criar agendamento)

1. Cliente (ou recepcionista) chama `POST /appointments` com `client_id, staff_id, services, start`.
2. Backend valida disponibilidade (consulta `appointments` com overlap contra `staff_id`).
3. Se OK, cria `appointments` e enfileira `send-confirmation` job.
4. Job envia mensagem via WhatsApp (template) e grava `audit_log`.
5. Se cliente pagar online, webhook do gateway ativa `payment` process → marca `appointment.paid=true` e cria `commission` para `staff_id`.

---

# 13 — Recomendações de implementação imediata (MVP -> PRO)

**MVP** (rápido): agenda básica (criar/listar/agendar), CRUD serviços, clientes, staff, notificações por e-mail/WhatsApp simples (template), registro de pagamentos manual.
**PRO**: sincronização Google Calendar, POS/PDV, estoque, relatórios avançados, automações (fila/recall), dashboards por profissional, app PWA.

---

# 14 — Próximo passo prático

Escolha um stack ORM/migration (Prisma recomendado para produtividade com Postgres), que eu já preparo:

* Esquemas Prisma + migrations SQL, ou
* Migrations Knex + modelos (TypeScript) + exemplos de controllers (Express).

gere o **schema Prisma + rotas Express** iniciais (auth, appointments, services).
