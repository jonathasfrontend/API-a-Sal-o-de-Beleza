# 🏪 Sistema de Gerenciamento para Salão de Beleza

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

**Sistema profissional e completo para gerenciamento de salões de beleza, barbearias e clínicas de estética**

[Funcionalidades](#-funcionalidades-principais) • [Instalação](#-instalação-rápida) • [API](#-documentação-da-api) • [Deploy](#-deploy) • [Contribuir](#-contribuindo)

</div>

---

## 📖 Sobre o Projeto

Uma solução SaaS moderna e escalável para gestão completa de salões de beleza, oferecendo controle total sobre:

- **Agendamentos inteligentes** com confirmação automática via WhatsApp/Email
- **Gestão financeira** com relatórios detalhados, controle de comissões e fluxo de caixa
- **CRM de clientes** com histórico completo, programa de fidelidade e reativação
- **Controle de estoque** integrado ao PDV
- **Sistema de avaliações** e feedback de clientes
- **Multi-usuário** com 38 permissões granulares e 3 cargos customizáveis
- **Dashboards analíticos** em tempo real

### 🎯 Diferenciais

✅ Arquitetura limpa e escalável (MVC)  
✅ TypeScript com tipagem forte  
✅ Segurança de nível enterprise (LGPD compliant)  
✅ API RESTful documentada  
✅ Testes automatizados  
✅ Docker ready  
✅ Fácil integração com outros sistemas

---

## 🚀 Stack Tecnológica

### Backend Core
- **[Node.js](https://nodejs.org/)** 18+ - Runtime JavaScript
- **[TypeScript](https://www.typescriptlang.org/)** 5.3 - Superset JavaScript tipado
- **[Express.js](https://expressjs.com/)** 4.18 - Framework web minimalista e performático

### Banco de Dados & ORM
- **[PostgreSQL](https://www.postgresql.org/)** 15+ - Banco de dados relacional robusto
- **[Prisma](https://www.prisma.io/)** 5.7 - ORM moderno e type-safe
- **[Redis](https://redis.io/)** 7+ - Cache e sistema de filas

### Autenticação & Segurança
- **[JWT](https://jwt.io/)** - JSON Web Tokens com refresh tokens
- **[bcrypt](https://www.npmjs.com/package/bcrypt)** - Hash de senhas
- **[Helmet](https://helmetjs.github.io/)** - Headers de segurança HTTP
- **[express-rate-limit](https://www.npmjs.com/package/express-rate-limit)** - Proteção contra DDoS
- **Sistema de Cargos e Permissões** - 38 permissões modulares para controle granular de acesso

### Validação & Qualidade
- **[Zod](https://zod.dev/)** - Schema validation TypeScript-first
- **[Jest](https://jestjs.io/)** - Framework de testes
- **[ESLint](https://eslint.org/)** - Linter JavaScript/TypeScript

### Integrações & Serviços
- **[BullMQ](https://docs.bullmq.io/)** - Sistema de filas e jobs
- **[Nodemailer](https://nodemailer.com/)** - Envio de e-mails transacionais
- **[Winston](https://github.com/winstonjs/winston)** - Sistema de logs estruturados
- **[Sentry](https://sentry.io/)** - Monitoramento de erros
- **WhatsApp Business API** - Notificações e lembretes

### DevOps & Infraestrutura
- **[Docker](https://www.docker.com/)** - Containerização
- **[Docker Compose](https://docs.docker.com/compose/)** - Orquestração de containers

---

## 📋 Pré-requisitos

Certifique-se de ter instalado:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **npm** >= 9.0.0 (incluído com Node.js)
- **PostgreSQL** >= 15 ([Download](https://www.postgresql.org/download/)) ou use [Supabase](https://supabase.com/)
- **Redis** >= 7 ([Download](https://redis.io/download)) ou use [Upstash](https://upstash.com/)
- **Git** ([Download](https://git-scm.com/))

### Verificar instalações:

```bash
node --version   # v18.0.0 ou superior
npm --version    # 9.0.0 ou superior
psql --version   # 15.0 ou superior
redis-cli --version  # 7.0 ou superior
```

---

## ⚡ Instalação Rápida

### 1️⃣ Clone o Repositório

```bash
git clone https://github.com/seu-usuario/sistema-salao-backend.git
cd sistema-salao-backend
```

### 2️⃣ Instale as Dependências

```bash
npm install
```

### 3️⃣ Configure as Variáveis de Ambiente

Crie o arquivo `.env` na raiz do projeto:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# ===========================================
# DATABASE
# ===========================================
DATABASE_URL="postgresql://usuario:senha@localhost:5432/salao_db?schema=public"

# ===========================================
# JWT AUTHENTICATION
# ===========================================
JWT_SECRET="seu-secret-super-seguro-minimo-32-caracteres"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="30d"

# ===========================================
# SERVER
# ===========================================
PORT=4000
NODE_ENV="development"

# ===========================================
# CORS
# ===========================================
CORS_ORIGINS="http://localhost:3000,http://localhost:5173"

# ===========================================
# RATE LIMITING
# ===========================================
RATE_LIMIT_WINDOW_MS=900000      # 15 minutos
RATE_LIMIT_MAX_REQUESTS=100      # 100 requisições por janela

# ===========================================
# REDIS (Opcional - para jobs e cache)
# ===========================================
REDIS_URL="redis://localhost:6379"

# ===========================================
# EMAIL (Opcional - para notificações)
# ===========================================
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha-de-app"
SMTP_FROM="Sistema Salão <noreply@seusalao.com>"

# ===========================================
# WHATSAPP (Opcional)
# ===========================================
WHATSAPP_API_URL="https://graph.facebook.com/v18.0"
WHATSAPP_ACCESS_TOKEN="seu-token-whatsapp"
WHATSAPP_PHONE_NUMBER_ID="seu-phone-id"

# ===========================================
# PAYMENT GATEWAY (Opcional)
# ===========================================
PAYMENT_GATEWAY_KEY="sua-chave-mercadopago-ou-stripe"

# ===========================================
# MONITORING (Opcional)
# ===========================================
SENTRY_DSN="https://sua-chave@sentry.io/projeto"
```

### 4️⃣ Configure o Banco de Dados

```bash
# Gerar Prisma Client
npm run prisma:generate

# Executar migrations (cria as tabelas)
npm run prisma:migrate

# Popular com dados de exemplo (opcional)
# Cria: 38 permissões, 3 cargos (Admin, Recepção, Profissional), usuários de teste
npm run prisma:seed
```

**🔑 Credenciais criadas pelo seed:**
```
Admin:         admin@salao.com / admin123
Recepção:      recepcao@salao.com / reception123
Profissional:  maria@salao.com, ana@salao.com / staff123
```

### 5️⃣ Inicie o Servidor

**Modo Desenvolvimento:**
```bash
npm run dev
```

**Modo Produção:**
```bash
npm run build
npm start
```

O servidor estará disponível em: **http://localhost:4000**

### ✅ Verificar Instalação

Acesse: http://localhost:4000/health

Resposta esperada:
```json
{
  "status": "ok",
  "timestamp": "2025-12-01T12:00:00.000Z",
  "uptime": 123.456
}
```

---

## 📁 Estrutura do Projeto

```
backend/
│
├── 📂 database/                    # Scripts e documentação do banco de dados
│   ├── schema.sql                  # Schema SQL completo
│   ├── queries.sql                 # Queries úteis e relatórios
│   ├── migrations.sql              # Migrations manuais
│   ├── backup.sh                   # Script de backup (Linux/Mac)
│   ├── backup.ps1                  # Script de backup (Windows PowerShell)
│   ├── DIAGRAM.md                  # Diagrama ER do banco de dados
│   ├── DOCUMENTACAO_COMPLETA.md    # Documentação técnica completa
│   └── README.md                   # Guia do banco de dados
│
├── 📂 docs/                        # Documentação do projeto
│   ├── QUICKSTART_GUIDE.md         # Guia de início rápido
│   ├── ROTAS_IMPLEMENTADAS.md      # Lista de todas as rotas da API
│   ├── IMPLEMENTACAO_COMPLETA.md   # Detalhes da implementação
│   ├── TESTE_API.md                # Exemplos de testes da API
│   └── ...                         # Outras documentações
│
├── 📂 prisma/                      # Configuração do Prisma ORM
│   ├── schema.prisma               # Schema do banco (models, enums, relations)
│   ├── seed.ts                     # Script para popular dados iniciais
│   └── migrations/                 # Histórico de migrations
│       └── 20251129135435_/
│           └── migration.sql
│
├── 📂 src/                         # Código-fonte da aplicação
│   │
│   ├── 📂 api/v1/                  # API versão 1
│   │   ├── auth/                   # 🔐 Autenticação e autorização
│   │   │   ├── auth.controller.ts  # Controller (handlers de requisições)
│   │   │   ├── auth.service.ts     # Service (lógica de negócio)
│   │   │   └── auth.routes.ts      # Routes (definição de rotas)
│   │   │
│   │   ├── clients/                # 👥 Gestão de clientes
│   │   │   ├── clients.controller.ts
│   │   │   ├── clients.service.ts
│   │   │   └── clients.routes.ts
│   │   │
│   │   ├── appointments/           # 📅 Agendamentos
│   │   │   ├── appointments.controller.ts
│   │   │   ├── appointments.service.ts
│   │   │   └── appointments.routes.ts
│   │   │
│   │   ├── services/               # 💇 Serviços oferecidos
│   │   │   ├── services.controller.ts
│   │   │   ├── services.service.ts
│   │   │   └── services.routes.ts
│   │   │
│   │   ├── staff/                  # 👨‍💼 Profissionais/Funcionários
│   │   │   ├── staff.controller.ts
│   │   │   ├── staff.service.ts
│   │   │   └── staff.routes.ts
│   │   │
│   │   ├── payments/               # 💰 Pagamentos e comissões
│   │   │   ├── payments.controller.ts
│   │   │   ├── payments.service.ts
│   │   │   └── payments.routes.ts
│   │   │
│   │   ├── products/               # 📦 Produtos e estoque
│   │   │   ├── products.controller.ts
│   │   │   ├── products.service.ts
│   │   │   └── products.routes.ts
│   │   │
│   │   ├── sales/                  # 🛒 Vendas (PDV)
│   │   │   ├── sales.controller.ts
│   │   │   ├── sales.service.ts
│   │   │   └── sales.routes.ts
│   │   │
│   │   ├── expenses/               # 💸 Despesas
│   │   │   ├── expenses.controller.ts
│   │   │   ├── expenses.service.ts
│   │   │   └── expenses.routes.ts
│   │   │
│   │   ├── reports/                # 📊 Relatórios e analytics
│   │   │   ├── reports.controller.ts
│   │   │   ├── reports.service.ts
│   │   │   └── reports.routes.ts
│   │   │
│   │   ├── reviews/                # ⭐ Avaliações de clientes
│   │   │   ├── reviews.controller.ts
│   │   │   ├── reviews.service.ts
│   │   │   └── reviews.routes.ts
│   │   │
│   │   ├── waitlist/               # 📋 Lista de espera
│   │   │   ├── waitlist.controller.ts
│   │   │   ├── waitlist.service.ts
│   │   │   └── waitlist.routes.ts
│   │   │
│   │   └── webhooks/               # 🔗 Webhooks (integrações externas)
│   │       ├── webhooks.controller.ts
│   │       └── webhooks.routes.ts
│   │
│   ├── 📂 config/                  # Configurações da aplicação
│   │   ├── env.ts                  # Variáveis de ambiente (validadas com Zod)
│   │   └── db.ts                   # Conexão com banco de dados (Prisma)
│   │
│   ├── 📂 jobs/                    # Background jobs e workers
│   │   ├── queue.ts                # Configuração de filas (BullMQ)
│   │   └── notification.worker.ts  # Worker de notificações
│   │
│   ├── 📂 middlewares/             # Middlewares da aplicação
│   │   ├── auth.jwt.ts             # Autenticação JWT
│   │   ├── error.handler.ts        # Tratamento centralizado de erros
│   │   └── validate.ts             # Validação de schemas (Zod)
│   │
│   ├── 📂 services/                # Serviços externos e integrações
│   │   ├── email.service.ts        # Envio de e-mails (Nodemailer)
│   │   ├── whatsapp.service.ts     # Integração WhatsApp Business API
│   │   └── payment.service.ts      # Gateway de pagamentos
│   │
│   ├── 📂 utils/                   # Utilitários e helpers
│   │   └── logger.ts               # Sistema de logs (Winston)
│   │
│   ├── app.ts                      # Configuração do Express e middlewares
│   └── server.ts                   # Entry point da aplicação
│
├── 📂 logs/                        # Logs da aplicação (gerado em runtime)
│
├── .env                            # Variáveis de ambiente (NÃO commitar)
├── .env.example                    # Exemplo de variáveis de ambiente
├── .gitignore                      # Arquivos ignorados pelo Git
├── docker-compose.yml              # Orquestração de containers Docker
├── Dockerfile                      # Imagem Docker da aplicação
├── jest.config.js                  # Configuração do Jest
├── package.json                    # Dependências e scripts npm
├── tsconfig.json                   # Configuração do TypeScript
├── LICENSE                         # Licença MIT
├── PRIVACY_POLICY.md               # Política de Privacidade
├── TERMS_OF_SERVICE.md             # Termos de Serviço
└── README.md                       # Este arquivo
```

### 🏗️ Arquitetura MVC

O projeto segue o padrão **MVC (Model-View-Controller)** adaptado para APIs:

- **Routes** → Define os endpoints HTTP
- **Controllers** → Recebe requisições, chama services, retorna respostas
- **Services** → Lógica de negócio e interação com banco de dados
- **Models** → Definidos no Prisma Schema

---

## 🔑 Funcionalidades Principais

### 🔐 1. Autenticação e Autorização

- **JWT com Refresh Tokens** - Tokens de curta duração + renovação automática
- **Permissões baseadas em roles** (ADMIN, MANAGER, RECEPTION, STAFF, CLIENT)
- **Proteção de rotas** - Middleware de autenticação em todas as rotas privadas
- **Rate limiting** - Proteção contra ataques de força bruta

**Endpoints:**
```
POST   /api/v1/auth/login          # Login com email e senha
POST   /api/v1/auth/register       # Registro de novo usuário
POST   /api/v1/auth/refresh        # Renovar access token
POST   /api/v1/auth/logout         # Logout e revogação de tokens
GET    /api/v1/auth/me             # Dados do usuário autenticado
```

### 👥 2. Gestão de Clientes (CRM)

- **Cadastro completo** - Nome, contato, CPF, preferências, LGPD
- **Histórico detalhado** - Todos os atendimentos anteriores
- **Programa de fidelidade** - Pontos e recompensas
- **Reativação automática** - Identificação de clientes inativos
- **Política de no-show** - Controle de faltas e bloqueio
- **Filtros avançados** - Busca por nome, telefone, status

**Endpoints:**
```
GET    /api/v1/clients             # Listar clientes (paginado, com filtros)
POST   /api/v1/clients             # Criar novo cliente
GET    /api/v1/clients/:id         # Buscar cliente específico
PUT    /api/v1/clients/:id         # Atualizar dados do cliente
DELETE /api/v1/clients/:id         # Deletar cliente
GET    /api/v1/clients/:id/history # Histórico completo de atendimentos
GET    /api/v1/clients/inactive    # Listar clientes inativos
```

### 📅 3. Sistema de Agendamentos

- **Agendamento inteligente** - Verifica disponibilidade em tempo real
- **Multi-serviço** - Permite agendar combos de serviços
- **Bloqueio de horários** - Para eventos, folgas, etc.
- **Confirmação automática** - Via WhatsApp e e-mail
- **Lembretes programados** - 24h e 1h antes do horário
- **Lista de espera** - Para horários esgotados
- **Gestão de no-shows** - Rastreamento de faltas

**Endpoints:**
```
GET    /api/v1/appointments        # Listar agendamentos (filtros: data, status, profissional)
POST   /api/v1/appointments        # Criar novo agendamento
GET    /api/v1/appointments/:id    # Buscar agendamento específico
PUT    /api/v1/appointments/:id    # Atualizar agendamento
DELETE /api/v1/appointments/:id    # Deletar agendamento
POST   /api/v1/appointments/:id/cancel   # Cancelar agendamento
POST   /api/v1/appointments/:id/no-show  # Marcar como no-show
GET    /api/v1/appointments/availability # Verificar horários disponíveis
GET    /api/v1/appointments/stats        # Estatísticas de agendamentos
```

### 💇 4. Gestão de Serviços

- **Catálogo completo** - Todos os serviços oferecidos
- **Categorização** - Cabelo, barba, estética, etc.
- **Precificação** - Valores e duração de cada serviço
- **Disponibilidade** - Ativar/desativar serviços temporariamente
- **Combos** - Pacotes de serviços com desconto

**Endpoints:**
```
GET    /api/v1/services            # Listar serviços (com filtros)
POST   /api/v1/services            # Criar novo serviço
GET    /api/v1/services/:id        # Buscar serviço específico
PUT    /api/v1/services/:id        # Atualizar serviço
DELETE /api/v1/services/:id        # Deletar serviço (soft delete)
GET    /api/v1/services/categories # Listar categorias disponíveis
```

### 👨‍💼 5. Gestão de Profissionais (Staff)

- **Perfis completos** - Dados, especialidades, foto
- **Horários de trabalho** - Escalas e turnos personalizados
- **Comissões flexíveis** - Percentual, fixo ou tabela personalizada
- **Avaliações** - Notas e feedback dos clientes
- **Dashboard individual** - Métricas de desempenho
- **Bloqueio de datas** - Férias, folgas, eventos
- **Atribuição de cargos** - Definir função e permissões de cada profissional

**Endpoints:**
```
GET    /api/v1/staff               # Listar profissionais (com filtros)
POST   /api/v1/staff               # Criar perfil de profissional
GET    /api/v1/staff/:id           # Buscar profissional específico
PUT    /api/v1/staff/:id           # Atualizar dados do profissional
DELETE /api/v1/staff/:id           # Deletar profissional
GET    /api/v1/staff/:id/availability  # Verificar disponibilidade
GET    /api/v1/staff/:id/schedule      # Obter horários de trabalho
POST   /api/v1/staff/:id/assign-role   # Atribuir cargo a um profissional (Admin apenas)
```

### 👔 6. Sistema de Cargos e Permissões

- **Gestão de cargos** - Criar, editar e deletar cargos customizados
- **38 permissões disponíveis** - Controle granular por módulo e ação
- **Atribuição de permissões** - Definir exatamente quais acessos cada cargo possui
- **3 cargos padrão** - Admin, Recepção e Profissional pré-configurados
- **Proteção de rotas** - Todas as rotas validam permissões automaticamente
- **Acesso exclusivo Admin** - Apenas administradores gerenciam cargos

**Módulos com permissões:**
```
clients.*          # Gestão de clientes (list, create, read, update, delete)
appointments.*     # Agendamentos (list, create, read, update, delete, cancel, no-show)
staff.*           # Profissionais (list, create, read, update, delete, availability, assign-role)
services.*        # Serviços (list, create, read, update, delete)
products.*        # Produtos e estoque (list, create, read, update, delete, stock)
sales.*           # Vendas (list, create, read)
payments.*        # Pagamentos (list, create, read, confirm, refund, report)
expenses.*        # Despesas (list, create, read, update, delete)
reports.*         # Relatórios (dashboard, financial, commissions)
roles.*           # Gestão de cargos (list, create, read, update, delete, assign)
reviews.*         # Avaliações (list, create, read, update, delete, stats)
waitlist.*        # Lista de espera (list, create, read, update, delete, notify)
```

**Endpoints:**
```
GET    /api/v1/roles                    # Listar todos os cargos
POST   /api/v1/roles                    # Criar novo cargo
GET    /api/v1/roles/:id                # Buscar cargo específico
PUT    /api/v1/roles/:id                # Atualizar cargo
DELETE /api/v1/roles/:id                # Deletar cargo
PUT    /api/v1/roles/:id/permissions    # Atribuir permissões a um cargo
POST   /api/v1/roles/:roleId/assign/:userId  # Atribuir cargo a um usuário
GET    /api/v1/roles/permissions        # Listar todas as permissões disponíveis
```

### 💰 7. Sistema de Pagamentos e Comissões

- **Múltiplos métodos** - Dinheiro, cartão, PIX, link, carteira digital
- **Confirmação de pagamento** - Manual ou automática (gateway)
- **Reembolsos** - Controle de devoluções
- **Comissões automáticas** - Cálculo baseado em regras do profissional
- **Relatórios financeiros** - Por período, método, profissional
- **Integração com gateways** - Mercado Pago, Stripe, etc.

**Endpoints:**
```
GET    /api/v1/payments            # Listar pagamentos (com filtros)
POST   /api/v1/payments            # Criar registro de pagamento
GET    /api/v1/payments/:id        # Buscar pagamento específico
POST   /api/v1/payments/:id/confirm   # Confirmar pagamento
POST   /api/v1/payments/:id/refund    # Processar reembolso
GET    /api/v1/payments/report        # Relatório financeiro
```

### 📦 8. Controle de Estoque

- **Cadastro de produtos** - Nome, SKU, preço, categoria
- **Movimentações** - Entrada, saída, ajuste, venda
- **Alertas automáticos** - Estoque baixo, vencimento
- **Fornecedores** - Gestão de fornecedores
- **Histórico completo** - Rastreabilidade total
- **Integração com PDV** - Baixa automática em vendas

**Endpoints:**
```
GET    /api/v1/products            # Listar produtos (com filtros)
POST   /api/v1/products            # Criar novo produto
GET    /api/v1/products/:id        # Buscar produto específico
PUT    /api/v1/products/:id        # Atualizar produto
DELETE /api/v1/products/:id        # Deletar produto (soft delete)
POST   /api/v1/products/:id/stock/add    # Adicionar estoque
POST   /api/v1/products/:id/stock/remove # Remover estoque
GET    /api/v1/products/:id/movements    # Histórico de movimentações
```

### 🛒 8. PDV (Ponto de Venda)

- **Vendas rápidas** - Interface otimizada
- **Múltiplos itens** - Venda de vários produtos
- **Desconto** - Aplicação de descontos
- **Integração automática** - Com estoque e clientes
- **Comprovantes** - Geração de recibos

**Endpoints:**
```
GET    /api/v1/sales               # Listar vendas (com filtros)
POST   /api/v1/sales               # Registrar nova venda
GET    /api/v1/sales/:id           # Buscar venda específica
```

### 💸 9. Controle de Despesas

- **Registro completo** - Descrição, valor, categoria, anexos
- **Despesas recorrentes** - Aluguel, água, luz, internet
- **Status de pagamento** - Pendente, pago, atrasado
- **Categorização** - Para relatórios detalhados
- **Fornecedores** - Vinculação com fornecedores

**Endpoints:**
```
GET    /api/v1/expenses            # Listar despesas (com filtros)
POST   /api/v1/expenses            # Criar nova despesa
GET    /api/v1/expenses/:id        # Buscar despesa específica
PUT    /api/v1/expenses/:id        # Atualizar despesa
POST   /api/v1/expenses/:id/pay    # Marcar despesa como paga
DELETE /api/v1/expenses/:id        # Deletar despesa
```

### 📊 10. Relatórios e Analytics

- **Dashboard completo** - Métricas em tempo real
- **Relatórios financeiros** - Receitas, despesas, lucro
- **Relatórios de comissões** - Por profissional e período
- **Análise de desempenho** - Serviços mais vendidos, horários de pico
- **Exportação** - PDF, Excel, CSV

**Endpoints:**
```
GET    /api/v1/reports/dashboard   # Dashboard com métricas gerais
GET    /api/v1/reports/financial   # Relatório financeiro detalhado
GET    /api/v1/reports/commissions # Relatório de comissões
```

### ⭐ 11. Sistema de Avaliações

- **Feedback de clientes** - Notas e comentários
- **Avaliação por serviço** - Qualidade de cada atendimento
- **Avaliação por profissional** - Performance individual
- **Estatísticas** - Média geral, distribuição de notas
- **Melhoria contínua** - Identificação de pontos fracos

**Endpoints:**
```
GET    /api/v1/reviews             # Listar avaliações
POST   /api/v1/reviews             # Criar nova avaliação
GET    /api/v1/reviews/stats       # Estatísticas de avaliações
```

### 📋 12. Lista de Espera

- **Gerenciamento automático** - Para horários esgotados
- **Notificação** - Quando vaga abrir
- **Priorização** - Por ordem de cadastro ou critérios personalizados
- **Status de contato** - Contatado, agendado, desistente

**Endpoints:**
```
GET    /api/v1/waitlist            # Listar entradas da lista de espera
POST   /api/v1/waitlist            # Adicionar à lista de espera
POST   /api/v1/waitlist/:id/contact  # Marcar como contatado
DELETE /api/v1/waitlist/:id        # Remover da lista de espera
```

### 🔗 13. Webhooks e Integrações

- **WhatsApp Business API** - Receber status de mensagens
- **Gateways de pagamento** - Confirmação automática de pagamentos
- **Extensível** - Fácil adicionar novas integrações

**Endpoints:**
```
POST   /api/v1/webhooks/whatsapp   # Webhook do WhatsApp
POST   /api/v1/webhooks/payment    # Webhook de pagamento
```

---

## 📡 Documentação da API

### Base URL

```
Desenvolvimento: http://localhost:4000/api/v1
Produção: https://seu-dominio.com/api/v1
```

### Autenticação

Todas as rotas (exceto login e registro) requerem autenticação via **Bearer Token**:

```http
Authorization: Bearer {seu_access_token}
```

**💡 Após o login, o token JWT contém:**
- Dados do usuário (id, nome, email)
- Cargo (role) atribuído
- Lista de permissões do cargo
- As rotas validam automaticamente as permissões necessárias

### Exemplo de Requisição

```bash
curl -X GET http://localhost:4000/api/v1/clients \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

### Sistema de Permissões

O sistema utiliza **controle de acesso baseado em permissões granulares**:

| Cargo | Descrição | Permissões |
|------|-----------|-----------|
| **Admin** | Administrador | Todas as 38 permissões - acesso completo ao sistema |
| **Recepção** | Recepcionista | 12 permissões - clientes, agendamentos e lista de espera |
| **Profissional** | Staff | 3 permissões - consulta de agendamentos e clientes |

**Exemplo de validação de permissão:**
- Para criar um cliente: requer permissão `clients.create`
- Para cancelar agendamento: requer permissão `appointments.cancel`
- Para gerenciar cargos: requer permissão `roles.*` (apenas Admin)

📋 **Lista completa**: Consulte [docs/ROLES_AND_PERMISSIONS.md](docs/ROLES_AND_PERMISSIONS.md) para ver todas as 38 permissões disponíveis.

### Códigos de Status HTTP

| Código | Significado |
|--------|-------------|
| `200` | Sucesso |
| `201` | Criado com sucesso |
| `400` | Requisição inválida (erro de validação) |
| `401` | Não autenticado (token inválido/expirado) |
| `403` | Não autorizado (sem permissão necessária) |
| `404` | Recurso não encontrado |
| `409` | Conflito (email já existe, etc.) |
| `422` | Entidade não processável |
| `429` | Muitas requisições (rate limit) |
| `500` | Erro interno do servidor |

### Formato de Resposta Padrão

**Sucesso:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operação realizada com sucesso"
}
```

**Erro:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email inválido",
    "details": [
      {
        "field": "email",
        "message": "Formato de email inválido"
      }
    ]
  }
}
```

### Exemplos Completos de Uso

Consulte a documentação detalhada em:
- **[docs/ROUTES.md](docs/ROUTES.md)** - Guia completo com exemplos cURL para todas as rotas
- **[docs/ROLES_AND_PERMISSIONS.md](docs/ROLES_AND_PERMISSIONS.md)** - Sistema de permissões detalhado
- **[docs/TESTE_API.md](docs/TESTE_API.md)** - Exemplos práticos de uso
- **[docs/ROTAS_IMPLEMENTADAS.md](docs/ROTAS_IMPLEMENTADAS.md)** - Lista completa de rotas

---

## 🗄️ Banco de Dados

### Schema

O projeto utiliza **PostgreSQL** com **Prisma ORM**. O schema completo está em `prisma/schema.prisma`.

#### Principais Tabelas:

- **User** - Usuários do sistema
- **RefreshToken** - Tokens de refresh para autenticação
- **Staff** - Perfis de profissionais
- **Client** - Clientes do salão
- **Service** - Serviços oferecidos
- **Appointment** - Agendamentos
- **Payment** - Pagamentos e transações
- **Commission** - Comissões de profissionais
- **Expense** - Despesas do negócio
- **Product** - Produtos em estoque
- **StockMovement** - Movimentações de estoque
- **Sale** - Vendas realizadas
- **SaleItem** - Itens das vendas
- **Notification** - Notificações enviadas
- **Review** - Avaliações de clientes
- **AuditLog** - Logs de auditoria
- **Waitlist** - Lista de espera

### Diagrama ER

Consulte o diagrama completo em: **[database/DIAGRAM.md](database/DIAGRAM.md)**

### Migrations

```bash
# Criar nova migration
npm run prisma:migrate

# Aplicar migrations (produção)
npm run prisma:migrate:prod

# Visualizar banco de dados (Prisma Studio)
npm run prisma:studio
```

### Backup e Restore

**Windows (PowerShell):**
```powershell
.\database\backup.ps1
```

**Linux/Mac:**
```bash
./database/backup.sh
```

---

## 🧪 Testes

---

## 🧪 Testes

O projeto utiliza **Jest** para testes unitários e de integração.

### Executar Testes

```bash
# Rodar todos os testes
npm test

# Modo watch (ideal para desenvolvimento)
npm run test:watch

# Gerar relatório de cobertura
npm run test:coverage
```

### Estrutura de Testes

```
tests/
├── unit/              # Testes unitários
│   ├── services/
│   └── utils/
└── integration/       # Testes de integração
    └── api/
```

<!-- TODO: Implementar testes unitários e de integração -->

---

## 📊 Monitoramento e Logs

### Sistema de Logs

O projeto utiliza **Winston** para logs estruturados:

```typescript
// Logs são salvos em ./logs/
- combined.log    // Todos os logs
- error.log       // Apenas erros
```

### Níveis de Log

- `error` - Erros críticos
- `warn` - Avisos importantes
- `info` - Informações gerais
- `http` - Requisições HTTP
- `debug` - Informações de debug

### Monitoramento de Erros

Configure o **Sentry** para rastreamento de erros em produção:

```env
SENTRY_DSN=https://sua-chave@sentry.io/projeto
```

### Health Check

Endpoint para verificar status do servidor:

```bash
GET /health
```

Resposta:
```json
{
  "status": "ok",
  "timestamp": "2025-12-01T12:00:00.000Z",
  "uptime": 123.456
}
```

---

## 🐳 Docker

### Desenvolvimento com Docker

```bash
# Iniciar todos os serviços (PostgreSQL, Redis, API)
docker-compose up -d

# Ver logs
docker-compose logs -f api

# Parar serviços
docker-compose down

# Reconstruir imagens
docker-compose up -d --build
```

### Configuração Docker Compose

O `docker-compose.yml` inclui:

- **PostgreSQL** - Banco de dados na porta 5432
- **Redis** - Cache e filas na porta 6379
- **API** - Aplicação backend na porta 4000

### Build da Imagem Docker

```bash
# Build manual
docker build -t sistema-salao-backend .

# Executar container
docker run -p 4000:4000 \
  -e DATABASE_URL="postgresql://..." \
  sistema-salao-backend
```

---

## 🚢 Deploy

### Opções Recomendadas

#### 1. **Railway** (Recomendado para iniciantes)

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

Variáveis de ambiente necessárias:
- `DATABASE_URL` (PostgreSQL)
- `REDIS_URL` (Redis)
- `JWT_SECRET`
- Outras configurações do `.env`

#### 2. **Render**

1. Conecte seu repositório GitHub
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

#### 3. **Heroku**

```bash
# Login
heroku login

# Criar app
heroku create nome-do-app

# Adicionar PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Adicionar Redis
heroku addons:create heroku-redis:hobby-dev

# Deploy
git push heroku main

# Executar migrations
heroku run npm run prisma:migrate:prod
```

#### 4. **DigitalOcean / AWS / Azure**

Para deploy em VPS ou serviços de cloud, use Docker:

```bash
# Build e push para registry
docker build -t seu-registry/sistema-salao .
docker push seu-registry/sistema-salao

# No servidor
docker pull seu-registry/sistema-salao
docker run -d -p 4000:4000 --env-file .env seu-registry/sistema-salao
```

### Checklist de Deploy

- [ ] Configurar todas as variáveis de ambiente
- [ ] Executar migrations (`npm run prisma:migrate:prod`)
- [ ] Configurar domínio e SSL/TLS
- [ ] Configurar backup automático do banco de dados
- [ ] Configurar monitoramento (Sentry, New Relic, etc.)
- [ ] Habilitar CORS com domínios corretos
- [ ] Configurar rate limiting apropriado
- [ ] Revisar logs em produção
- [ ] Configurar alertas de erro

### Produção - Boas Práticas

```env
# .env (PRODUÇÃO)
NODE_ENV=production
PORT=4000
DATABASE_URL="postgresql://..."  # Use connection pooling
REDIS_URL="redis://..."
JWT_SECRET="secret-complexo-minimo-64-caracteres"
CORS_ORIGINS="https://seudominio.com"
RATE_LIMIT_MAX_REQUESTS=50  # Mais restritivo
```

---

## 🔒 Segurança

### Medidas Implementadas

✅ **Autenticação JWT** - Tokens de curta duração (15min)  
✅ **Refresh Tokens** - Renovação segura sem relogin  
✅ **Bcrypt** - Hash de senhas com salt  
✅ **Helmet** - Headers de segurança HTTP  
✅ **CORS** - Controle de origens permitidas  
✅ **Rate Limiting** - Proteção contra DDoS  
✅ **Validação de entrada** - Zod em todas as rotas  
✅ **SQL Injection** - Prevenido pelo Prisma  
✅ **XSS Protection** - Sanitização de dados  
✅ **LGPD Compliance** - Consentimento e direitos do usuário  
✅ **Audit Logs** - Rastreamento de ações críticas

### Recomendações Adicionais

- Use HTTPS em produção (Let's Encrypt gratuito)
- Mantenha dependências atualizadas: `npm audit`
- Configure firewall para permitir apenas portas necessárias
- Use variáveis de ambiente para secrets (nunca commite `.env`)
- Implemente 2FA para usuários ADMIN
- Faça backups regulares e teste restauração
- Monitore logs de segurança

---

## 🛠️ Scripts NPM

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor em modo desenvolvimento (hot reload) |
| `npm run build` | Compila TypeScript para JavaScript |
| `npm start` | Inicia servidor em produção (requer build) |
| `npm test` | Executa testes com Jest |
| `npm run test:watch` | Testes em modo watch |
| `npm run test:coverage` | Gera relatório de cobertura de testes |
| `npm run lint` | Verifica erros de linting |
| `npm run lint:fix` | Corrige erros de linting automaticamente |
| `npm run prisma:generate` | Gera Prisma Client |
| `npm run prisma:migrate` | Cria e aplica migrations (desenvolvimento) |
| `npm run prisma:migrate:prod` | Aplica migrations em produção |
| `npm run prisma:studio` | Abre Prisma Studio (GUI do banco) |
| `npm run prisma:seed` | Popula banco com dados iniciais (38 permissões, 3 cargos, usuários teste) |

---

## 📚 Documentação Adicional

Consulte a pasta `docs/` para documentação detalhada:

- **[QUICKSTART_GUIDE.md](docs/QUICKSTART_GUIDE.md)** - Guia de início rápido passo a passo
- **[ROUTES.md](docs/ROUTES.md)** - Guia completo de testes da API com exemplos cURL
- **[ROLES_AND_PERMISSIONS.md](docs/ROLES_AND_PERMISSIONS.md)** - Sistema de cargos e permissões
- **[ROTAS_IMPLEMENTADAS.md](docs/ROTAS_IMPLEMENTADAS.md)** - Lista completa de todas as rotas da API
- **[IMPLEMENTACAO_COMPLETA.md](docs/IMPLEMENTACAO_COMPLETA.md)** - Detalhes técnicos da implementação
- **[TESTE_API.md](docs/TESTE_API.md)** - Exemplos práticos de uso da API
- **[database/DIAGRAM.md](database/DIAGRAM.md)** - Diagrama ER do banco de dados
- **[database/DOCUMENTACAO_COMPLETA.md](database/DOCUMENTACAO_COMPLETA.md)** - Documentação completa do schema

---

## 🗺️ Roadmap

Funcionalidades planejadas para próximas versões:

### v1.1.0 (Próxima)
- [ ] Dashboard em tempo real com WebSockets
- [ ] Relatórios avançados com gráficos
- [ ] Exportação de relatórios (PDF, Excel)
- [ ] Integração com Google Calendar
- [ ] Sistema de pacotes/planos pré-pagos

### v1.2.0
- [ ] App mobile (React Native)
- [ ] Agendamento online para clientes
- [ ] Sistema de gift cards
- [ ] Programa de indicação

### v1.3.0
- [ ] Multi-tenancy (múltiplos salões)
- [ ] Marketplace de produtos
- [ ] Integração com Nota Fiscal Eletrônica
- [ ] Sistema de delivery

### v2.0.0
- [ ] IA para recomendação de serviços
- [ ] Análise preditiva de demanda
- [ ] Chatbot de atendimento
- [ ] Sistema de gamificação

---

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! Siga os passos abaixo:

### 1. Fork o Projeto

```bash
# Clone seu fork
git clone https://github.com/seu-usuario/sistema-salao-backend.git
cd sistema-salao-backend
```

### 2. Crie uma Branch

```bash
git checkout -b feature/MinhaNovaFuncionalidade
```

### 3. Faça suas Alterações

- Siga o padrão de código existente
- Adicione testes para novas funcionalidades
- Atualize a documentação se necessário

### 4. Commit suas Mudanças

```bash
git add .
git commit -m "feat: adiciona nova funcionalidade X"
```

**Padrão de commits (Conventional Commits):**

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Alterações na documentação
- `style:` - Formatação de código
- `refactor:` - Refatoração de código
- `test:` - Adição ou correção de testes
- `chore:` - Tarefas de manutenção

### 5. Push para o GitHub

```bash
git push origin feature/MinhaNovaFuncionalidade
```

### 6. Abra um Pull Request

- Descreva suas alterações detalhadamente
- Referencie issues relacionadas
- Aguarde revisão

### Diretrizes de Contribuição

- ✅ Código limpo e bem documentado
- ✅ Testes para novas funcionalidades
- ✅ Seguir padrões de código do projeto
- ✅ Commits semânticos
- ✅ Respeitar a arquitetura existente
- ❌ Não incluir arquivos desnecessários
- ❌ Não commitar `.env` ou secrets

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

```
MIT License

Copyright (c) 2025 [Seu Nome/Empresa]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👥 Autores

- **Desenvolvedor Principal** - [Seu Nome](https://github.com/seu-usuario)

### Contribuidores

Veja a lista completa de [contribuidores](https://github.com/seu-usuario/sistema-salao-backend/contributors) que ajudaram neste projeto.

---

## 📧 Suporte e Contato

### Encontrou um Bug?

Abra uma [issue](https://github.com/seu-usuario/sistema-salao-backend/issues) detalhando:
- Descrição do problema
- Passos para reproduzir
- Comportamento esperado vs. comportamento atual
- Screenshots (se aplicável)
- Ambiente (SO, versão Node.js, etc.)

### Precisa de Ajuda?

- 📖 Consulte a [documentação](docs/)
- 💬 Abra uma [discussion](https://github.com/seu-usuario/sistema-salao-backend/discussions)
- 📧 Email: contato@seudominio.com
- 🌐 Website: [www.seudominio.com](https://www.seudominio.com)

### Comunidade

- [Discord](https://discord.gg/seu-servidor) - Chat da comunidade
- [Twitter](https://twitter.com/seu-usuario) - Atualizações e novidades

---

## 🙏 Agradecimentos

Agradecimentos especiais a:

- Comunidade [Prisma](https://www.prisma.io/)
- Comunidade [Node.js](https://nodejs.org/)
- Todos os contribuidores open-source
- Desenvolvedores que testaram e deram feedback

---

## 📊 Estatísticas do Projeto

- **Módulos Implementados:** 13
- **Rotas da API:** 70+
- **Linhas de Código:** ~3000+
- **Dependências:** 20+
- **Tabelas do Banco:** 16

---

## 🔗 Links Úteis

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT.io](https://jwt.io/)
- [BullMQ Documentation](https://docs.bullmq.io/)

---

<div align="center">

**⭐ Se este projeto foi útil, considere dar uma estrela! ⭐**

![GitHub stars](https://img.shields.io/github/stars/seu-usuario/sistema-salao-backend?style=social)
![GitHub forks](https://img.shields.io/github/forks/seu-usuario/sistema-salao-backend?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/seu-usuario/sistema-salao-backend?style=social)

---

**Desenvolvido com ❤️ para salões de beleza modernos**

[⬆ Voltar ao topo](#-sistema-de-gerenciamento-para-salão-de-beleza)

</div>
