# 🚀 Guia Rápido de Início

## 📦 Instalação Rápida

```bash
# 1. Instalar dependências
npm install

# 2. Configurar .env
cp .env.example .env
# Edite o .env com suas credenciais

# 3. Configurar banco de dados
npm run prisma:generate
npm run prisma:migrate

# 4. (Opcional) Popular com dados de exemplo
npm run prisma:seed

# 5. Iniciar servidor
npm run dev
```

## 🔐 Credenciais Padrão (após seed)

```
Admin:     admin@salao.com / admin123
Recepção:  recepcao@salao.com / reception123
Staff 1:   maria@salao.com / staff123
Staff 2:   ana@salao.com / staff123
```

## 🧪 Testando a API

### 1. Login

```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@salao.com",
    "password": "admin123"
  }'
```

Resposta:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "...",
      "email": "admin@salao.com",
      "name": "Administrador",
      "role": "ADMIN"
    },
    "accessToken": "eyJhbGci...",
    "refreshToken": "a1b2c3..."
  }
}
```

### 2. Criar Cliente (com token)

```bash
curl -X POST http://localhost:4000/api/v1/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "name": "Maria Silva",
    "phone": "11987654321",
    "email": "maria@email.com",
    "consentLGPD": true
  }'
```

### 3. Criar Agendamento

```bash
curl -X POST http://localhost:4000/api/v1/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "clientId": "uuid-do-cliente",
    "staffId": "uuid-do-profissional",
    "startTime": "2024-12-01T14:00:00Z",
    "services": [{
      "id": "uuid-do-servico",
      "name": "Corte Feminino",
      "price": 80,
      "duration": 60
    }]
  }'
```

### 4. Listar Agendamentos do Dia

```bash
curl -X GET "http://localhost:4000/api/v1/appointments?date=2024-12-01" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 📊 Estrutura de Dados

### User (Usuário)
```typescript
{
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'MANAGER' | 'RECEPTION' | 'STAFF' | 'CLIENT'
  phone?: string
  avatar?: string
  isActive: boolean
}
```

### Client (Cliente)
```typescript
{
  id: string
  name: string
  phone: string
  email?: string
  birthdate?: Date
  notes?: string
  loyaltyPoints: number
  noShowCount: number
  isBlocked: boolean
}
```

### Appointment (Agendamento)
```typescript
{
  id: string
  clientId: string
  staffId: string
  startTime: Date
  endTime: Date
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  services: Service[]
  totalAmount: number
  isPaid: boolean
}
```

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor em modo dev
npm run build            # Compila TypeScript
npm start                # Inicia servidor em produção

# Prisma
npm run prisma:generate  # Gera Prisma Client
npm run prisma:migrate   # Executa migrations
npm run prisma:studio    # Abre Prisma Studio (GUI)
npm run prisma:seed      # Popula banco com dados

# Qualidade de Código
npm run lint             # Verifica código
npm run lint:fix         # Corrige problemas
npm test                 # Executa testes
npm run test:coverage    # Testes com coverage
```

## 🔄 Workflow Típico

### Criar um Novo Agendamento

1. **Listar serviços disponíveis**
   ```
   GET /api/v1/services
   ```

2. **Verificar disponibilidade do profissional**
   ```
   GET /api/v1/appointments/availability?staffId=xxx&date=2024-12-01
   ```

3. **Criar agendamento**
   ```
   POST /api/v1/appointments
   ```

4. **Sistema envia notificação automática** (WhatsApp/Email)

5. **Cliente recebe confirmação**

### Receber um Cliente

1. **Buscar agendamento**
   ```
   GET /api/v1/appointments?clientId=xxx&date=today
   ```

2. **Atualizar status**
   ```
   PUT /api/v1/appointments/:id
   { "status": "IN_PROGRESS" }
   ```

3. **Finalizar atendimento**
   ```
   PUT /api/v1/appointments/:id
   { "status": "COMPLETED" }
   ```

4. **Registrar pagamento**
   ```
   POST /api/v1/payments
   ```

## 🐛 Troubleshooting

### Erro: "Port already in use"
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:4000 | xargs kill -9
```

### Erro: "Database connection failed"
- Verifique se PostgreSQL está rodando
- Confirme `DATABASE_URL` no `.env`
- Teste conexão: `npm run prisma:studio`

### Erro: "Redis connection refused"
- Verifique se Redis está rodando
- Windows: Baixe Redis Stack
- Docker: `docker run -d -p 6379:6379 redis`

### Migrations não aplicadas
```bash
npm run prisma:migrate dev
npm run prisma:generate
```

## 📈 Performance Tips

1. **Indexação**: Os índices principais já estão no schema
2. **Caching**: Use Redis para dados frequentes
3. **Paginação**: Sempre use `page` e `limit` nas listagens
4. **N+1 Queries**: Prisma `include` já otimiza queries

## 🔒 Segurança Checklist

- ✅ Senhas hasheadas (bcrypt)
- ✅ JWT com expiração
- ✅ Refresh tokens revogáveis
- ✅ Rate limiting ativo
- ✅ CORS configurado
- ✅ Helmet.js ativo
- ✅ Validação de inputs (Zod)
- ✅ SQL injection protegido (Prisma)

## 🚀 Deploy Checklist

- [ ] Configurar variáveis de ambiente em produção
- [ ] Executar migrations: `npm run prisma:migrate:prod`
- [ ] Configurar Redis (Upstash/Redis Cloud)
- [ ] Configurar PostgreSQL (Supabase/Railway)
- [ ] Ativar HTTPS
- [ ] Configurar domínio
- [ ] Configurar Sentry (monitoramento)
- [ ] Testar webhooks
- [ ] Backup automático do DB

## 📞 Recursos

- **Documentação Prisma**: https://www.prisma.io/docs
- **Express Best Practices**: https://expressjs.com/en/advanced/best-practice-performance.html
- **WhatsApp Business API**: https://developers.facebook.com/docs/whatsapp
- **Supabase Docs**: https://supabase.com/docs

---

**Dúvidas?** Abra uma issue ou consulte o README.md principal.
