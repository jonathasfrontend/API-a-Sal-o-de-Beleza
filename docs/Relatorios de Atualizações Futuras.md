# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [1.0.0] - 2024-11-28

### ✨ Adicionado

#### Autenticação & Segurança
- Sistema completo de autenticação JWT
- Refresh tokens com revogação
- Middleware de autorização baseado em roles
- Rate limiting por IP
- CORS configurável
- Helmet.js para headers de segurança
- Validação com Zod
- Logs de auditoria

#### Gestão de Clientes
- CRUD completo de clientes
- Histórico de atendimentos
- Controle de no-shows
- Bloqueio automático (>=3 faltas)
- Busca por nome/telefone/email
- Clientes inativos (reativação)
- Programa de fidelidade (pontos)
- LGPD compliance

#### Agendamentos
- CRUD de agendamentos
- Verificação de conflitos
- Agendamento múltiplo (combos)
- Cancelamento
- Marcação de no-show
- Filtros avançados (data, profissional, status)
- Estatísticas (completion rate, revenue)
- Verificação de disponibilidade

#### Profissionais
- Perfis de staff
- Especialidades configuráveis
- Escala de trabalho (JSON)
- Sistema de comissões (%, fixo, tabela)
- Bloqueio de horários
- Dashboard individual

#### Serviços
- Cadastro de serviços
- Duração e preço
- Categorização
- Habilitação de combos

#### Notificações
- WhatsApp Business API integration
- Sistema de e-mail (Nodemailer)
- Confirmação automática
- Lembretes (24h/1h antes)
- Cancelamento
- Promoções
- Templates customizáveis

#### Pagamentos
- Múltiplos métodos (cash, card, PIX, link)
- Status tracking
- Integração MercadoPago (preparado)
- Integração Stripe (preparado)
- Comissões automáticas

#### Sistema de Filas
- BullMQ + Redis
- Queue de notificações
- Queue de pagamentos
- Queue de relatórios
- Retry automático
- Workers isolados

#### Infraestrutura
- TypeScript strict mode
- Prisma ORM
- PostgreSQL (Supabase ready)
- Winston logging
- Error handling centralizado
- Health check endpoint
- Graceful shutdown
- Docker ready

#### Desenvolvimento
- ESLint configurado
- Prettier
- Jest setup
- Seed data
- Migrations versionadas
- Path aliases
- Hot reload (tsx)

### 📝 Documentação
- README completo
- QUICKSTART guide
- API endpoints documentados
- Exemplos de uso
- Troubleshooting guide
- Deploy checklist

### 🔧 Configuração
- .env.example com todas variáveis
- TypeScript config otimizado
- Prisma schema completo (15+ models)
- Package.json com scripts úteis

---

## [Próximas Versões]

### [1.1.0] - Planejado

#### Features
- [ ] Relatórios avançados (PDF/CSV)
- [ ] Dashboard analytics real-time
- [ ] WebSockets para updates live
- [ ] Google Calendar sync
- [ ] Backup automático
- [ ] Multi-tenancy (vários salões)

#### Melhorias
- [ ] Testes unitários (>80% coverage)
- [ ] Testes E2E
- [ ] CI/CD pipeline
- [ ] Documentação OpenAPI/Swagger
- [ ] Rate limiting por usuário
- [ ] Cache estratégico (Redis)

#### Integrações
- [ ] Instagram booking
- [ ] Google Maps (localização)
- [ ] Twilio (SMS backup)
- [ ] Zapier webhooks
- [ ] Export para Excel

---

## Tipos de Mudanças

- **Adicionado**: para novas funcionalidades
- **Modificado**: para mudanças em funcionalidades existentes
- **Deprecated**: para funcionalidades que serão removidas
- **Removido**: para funcionalidades removidas
- **Corrigido**: para correções de bugs
- **Segurança**: para vulnerabilidades corrigidas
