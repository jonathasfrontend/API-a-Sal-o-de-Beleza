# 🧪 Testes da API - Guia Completo

## 📋 Pré-requisitos

1. Servidor rodando em `http://localhost:4000`
2. Banco de dados configurado e migrations executadas
3. Pelo menos um usuário admin no banco (use seed)

---

## 🔐 1. Autenticação

### Login
```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@salao.com",
    "password": "admin123"
  }'
```

**Resposta esperada:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@salao.com",
      "name": "Administrador",
      "role": "ADMIN"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "abc123..."
  }
}
```

**💡 Salve o accessToken para usar nas próximas requisições!**

### Refresh Token
```bash
curl -X POST http://localhost:4000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "SEU_REFRESH_TOKEN"
  }'
```

### Meus Dados
```bash
curl -X GET http://localhost:4000/api/v1/auth/me \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

---

## 👥 2. Clientes

### Criar Cliente
```bash
curl -X POST http://localhost:4000/api/v1/clients \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Julia Santos",
    "phone": "11999887766",
    "email": "julia@email.com",
    "birthdate": "1995-03-20T00:00:00Z",
    "notes": "Alérgica a produtos com amônia",
    "preferences": {
      "preferredStaff": "uuid-do-profissional",
      "favoriteServices": ["corte", "manicure"]
    },
    "consentLGPD": true
  }'
```

### Listar Clientes
```bash
# Todos os clientes (com paginação)
curl -X GET "http://localhost:4000/api/v1/clients?page=1&limit=20" \
  -H "Authorization: Bearer SEU_TOKEN"

# Buscar por nome/telefone/email
curl -X GET "http://localhost:4000/api/v1/clients?search=maria" \
  -H "Authorization: Bearer SEU_TOKEN"

# Filtrar bloqueados
curl -X GET "http://localhost:4000/api/v1/clients?isBlocked=false" \
  -H "Authorization: Bearer SEU_TOKEN"
```

**Resposta esperada:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "name": "Maria Silva",
      "phone": "11987654321",
      "email": "maria@email.com",
      "loyaltyPoints": 150,
      "noShowCount": 0,
      "isBlocked": false,
      "_count": {
        "appointments": 5,
        "payments": 5
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### Buscar Cliente por ID
```bash
curl -X GET http://localhost:4000/api/v1/clients/UUID_DO_CLIENTE \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Atualizar Cliente
```bash
curl -X PUT http://localhost:4000/api/v1/clients/UUID_DO_CLIENTE \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Silva Santos",
    "notes": "Cliente VIP"
  }'
```

### Histórico do Cliente
```bash
curl -X GET http://localhost:4000/api/v1/clients/UUID_DO_CLIENTE/history \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Clientes Inativos
```bash
# Inativos há 60 dias (padrão)
curl -X GET "http://localhost:4000/api/v1/clients/inactive" \
  -H "Authorization: Bearer SEU_TOKEN"

# Inativos há 90 dias
curl -X GET "http://localhost:4000/api/v1/clients/inactive?days=90" \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Deletar Cliente
```bash
curl -X DELETE http://localhost:4000/api/v1/clients/UUID_DO_CLIENTE \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 💇 3. Serviços

### Criar Serviço
```bash
curl -X POST http://localhost:4000/api/v1/services \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Corte Feminino",
    "description": "Corte de cabelo feminino completo",
    "durationMinutes": 60,
    "price": 80,
    "category": "cabelo"
  }'
```

### Listar Serviços
```bash
# Todos
curl -X GET http://localhost:4000/api/v1/services \
  -H "Authorization: Bearer SEU_TOKEN"

# Por categoria
curl -X GET "http://localhost:4000/api/v1/services?category=cabelo" \
  -H "Authorization: Bearer SEU_TOKEN"

# Apenas ativos
curl -X GET "http://localhost:4000/api/v1/services?isActive=true" \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Listar Categorias
```bash
curl -X GET http://localhost:4000/api/v1/services/categories \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Buscar Serviço por ID
```bash
curl -X GET http://localhost:4000/api/v1/services/UUID_DO_SERVICO \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Atualizar Serviço
```bash
curl -X PUT http://localhost:4000/api/v1/services/UUID_DO_SERVICO \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 90,
    "description": "Corte feminino com escova"
  }'
```

### Deletar Serviço
```bash
curl -X DELETE http://localhost:4000/api/v1/services/UUID_DO_SERVICO \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 👨‍💼 4. Profissionais (Staff)

### Criar Profissional
```bash
curl -X POST http://localhost:4000/api/v1/staff \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "UUID_DO_USUARIO",
    "specialties": ["cabelo", "manicure"],
    "commissionType": "PERCENT",
    "commissionValue": 40,
    "workSchedule": {
      "monday": { "start": "09:00", "end": "18:00" },
      "tuesday": { "start": "09:00", "end": "18:00" },
      "wednesday": { "start": "09:00", "end": "18:00" },
      "thursday": { "start": "09:00", "end": "18:00" },
      "friday": { "start": "09:00", "end": "18:00" }
    }
  }'
```

### Listar Profissionais
```bash
# Todos
curl -X GET http://localhost:4000/api/v1/staff \
  -H "Authorization: Bearer SEU_TOKEN"

# Apenas disponíveis
curl -X GET "http://localhost:4000/api/v1/staff?isAvailable=true" \
  -H "Authorization: Bearer SEU_TOKEN"

# Por especialidade
curl -X GET "http://localhost:4000/api/v1/staff?specialty=cabelo" \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Verificar Disponibilidade
```bash
curl -X GET "http://localhost:4000/api/v1/staff/UUID_STAFF/availability?date=2024-12-01" \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Obter Horário de Trabalho
```bash
curl -X GET http://localhost:4000/api/v1/staff/UUID_STAFF/schedule \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 📅 5. Agendamentos

### Criar Agendamento
```bash
curl -X POST http://localhost:4000/api/v1/appointments \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "UUID_DO_CLIENTE",
    "staffId": "UUID_DO_PROFISSIONAL",
    "startTime": "2024-12-01T14:00:00Z",
    "services": [
      {
        "id": "UUID_SERVICO_1",
        "name": "Corte Feminino",
        "price": 80,
        "duration": 60
      },
      {
        "id": "UUID_SERVICO_2",
        "name": "Manicure",
        "price": 40,
        "duration": 45
      }
    ],
    "notes": "Cliente prefere água gelada"
  }'
```

**Resposta esperada:**
```json
{
  "status": "success",
  "data": {
    "appointment": {
      "id": "uuid",
      "clientId": "uuid",
      "staffId": "uuid",
      "startTime": "2024-12-01T14:00:00Z",
      "endTime": "2024-12-01T15:45:00Z",
      "status": "SCHEDULED",
      "totalAmount": 120,
      "services": [...],
      "client": {
        "name": "Julia Santos",
        "phone": "11999887766"
      },
      "staff": {
        "user": {
          "name": "Maria Silva"
        }
      }
    }
  }
}
```

### Listar Agendamentos
```bash
# Por data
curl -X GET "http://localhost:4000/api/v1/appointments?date=2024-12-01" \
  -H "Authorization: Bearer SEU_TOKEN"

# Por profissional
curl -X GET "http://localhost:4000/api/v1/appointments?staffId=UUID&date=2024-12-01" \
  -H "Authorization: Bearer SEU_TOKEN"

# Por período
curl -X GET "http://localhost:4000/api/v1/appointments?startDate=2024-12-01&endDate=2024-12-31" \
  -H "Authorization: Bearer SEU_TOKEN"

# Por status
curl -X GET "http://localhost:4000/api/v1/appointments?status=CONFIRMED" \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Verificar Disponibilidade
```bash
curl -X GET "http://localhost:4000/api/v1/appointments/availability?staffId=UUID&date=2024-12-01" \
  -H "Authorization: Bearer SEU_TOKEN"
```

**Resposta esperada:**
```json
{
  "status": "success",
  "data": {
    "appointments": [
      {
        "startTime": "2024-12-01T09:00:00Z",
        "endTime": "2024-12-01T10:00:00Z"
      },
      {
        "startTime": "2024-12-01T14:00:00Z",
        "endTime": "2024-12-01T15:30:00Z"
      }
    ]
  }
}
```

### Atualizar Agendamento
```bash
curl -X PUT http://localhost:4000/api/v1/appointments/UUID_APPOINTMENT \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CONFIRMED",
    "notes": "Cliente confirmou por WhatsApp"
  }'
```

### Cancelar Agendamento
```bash
curl -X POST http://localhost:4000/api/v1/appointments/UUID_APPOINTMENT/cancel \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Marcar No-Show
```bash
curl -X POST http://localhost:4000/api/v1/appointments/UUID_APPOINTMENT/no-show \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Estatísticas
```bash
curl -X GET "http://localhost:4000/api/v1/appointments/stats?startDate=2024-12-01&endDate=2024-12-31&staffId=UUID" \
  -H "Authorization: Bearer SEU_TOKEN"
```

**Resposta esperada:**
```json
{
  "status": "success",
  "data": {
    "total": 50,
    "completed": 45,
    "cancelled": 3,
    "noShow": 2,
    "totalRevenue": 4500,
    "completionRate": 90,
    "noShowRate": 4
  }
}
```

---

## 💰 6. Pagamentos

### Criar Pagamento
```bash
curl -X POST http://localhost:4000/api/v1/payments \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "appointmentId": "UUID_APPOINTMENT",
    "clientId": "UUID_CLIENTE",
    "amount": 120,
    "method": "CREDIT"
  }'
```

### Listar Pagamentos
```bash
# Todos
curl -X GET http://localhost:4000/api/v1/payments \
  -H "Authorization: Bearer SEU_TOKEN"

# Por status
curl -X GET "http://localhost:4000/api/v1/payments?status=PAID" \
  -H "Authorization: Bearer SEU_TOKEN"

# Por período
curl -X GET "http://localhost:4000/api/v1/payments?startDate=2024-12-01&endDate=2024-12-31" \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Confirmar Pagamento
```bash
curl -X POST http://localhost:4000/api/v1/payments/UUID_PAYMENT/confirm \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Reembolsar Pagamento
```bash
curl -X POST http://localhost:4000/api/v1/payments/UUID_PAYMENT/refund \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Relatório de Pagamentos
```bash
curl -X GET "http://localhost:4000/api/v1/payments/report?startDate=2024-12-01&endDate=2024-12-31" \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 📦 7. Produtos

### Criar Produto
```bash
curl -X POST http://localhost:4000/api/v1/products \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "SHAMPOO001",
    "name": "Shampoo Profissional 1L",
    "description": "Shampoo para tratamento capilar",
    "category": "produtos-cabelo",
    "quantity": 50,
    "costPrice": 25.00,
    "salePrice": 45.00,
    "reorderThreshold": 10,
    "supplier": "Fornecedor ABC"
  }'
```

### Listar Produtos
```bash
# Todos
curl -X GET http://localhost:4000/api/v1/products \
  -H "Authorization: Bearer SEU_TOKEN"

# Estoque baixo
curl -X GET "http://localhost:4000/api/v1/products?lowStock=true" \
  -H "Authorization: Bearer SEU_TOKEN"

# Por categoria
curl -X GET "http://localhost:4000/api/v1/products?category=produtos-cabelo" \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Adicionar Estoque
```bash
curl -X POST http://localhost:4000/api/v1/products/UUID_PRODUTO/stock/add \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 20,
    "reason": "Compra do fornecedor",
    "reference": "NF-12345"
  }'
```

### Remover Estoque
```bash
curl -X POST http://localhost:4000/api/v1/products/UUID_PRODUTO/stock/remove \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 5,
    "reason": "Produto danificado"
  }'
```

### Histórico de Movimentações
```bash
curl -X GET http://localhost:4000/api/v1/products/UUID_PRODUTO/movements \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 🛒 8. Vendas (PDV)

### Criar Venda
```bash
curl -X POST http://localhost:4000/api/v1/sales \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "UUID_CLIENTE",
    "items": [
      {
        "productId": "UUID_PRODUTO_1",
        "quantity": 2,
        "unitPrice": 45.00
      },
      {
        "productId": "UUID_PRODUTO_2",
        "quantity": 1,
        "unitPrice": 30.00
      }
    ],
    "paymentMethod": "CREDIT"
  }'
```

---

## 📊 9. Relatórios

### Dashboard
```bash
curl -X GET "http://localhost:4000/api/v1/reports/dashboard?startDate=2024-12-01&endDate=2024-12-31" \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Relatório Financeiro
```bash
curl -X GET "http://localhost:4000/api/v1/reports/financial?startDate=2024-12-01&endDate=2024-12-31" \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Relatório de Comissões
```bash
# Todas as comissões
curl -X GET http://localhost:4000/api/v1/reports/commissions \
  -H "Authorization: Bearer SEU_TOKEN"

# Por profissional
curl -X GET "http://localhost:4000/api/v1/reports/commissions?staffId=UUID" \
  -H "Authorization: Bearer SEU_TOKEN"

# Por período
curl -X GET "http://localhost:4000/api/v1/reports/commissions?startDate=2024-12-01&endDate=2024-12-31" \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## ⭐ 10. Avaliações

### Criar Avaliação
```bash
curl -X POST http://localhost:4000/api/v1/reviews \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "UUID_CLIENTE",
    "rating": 5,
    "comment": "Excelente atendimento!",
    "serviceQuality": 5,
    "staffBehavior": 5,
    "cleanliness": 5
  }'
```

### Listar Avaliações
```bash
curl -X GET http://localhost:4000/api/v1/reviews \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Estatísticas de Avaliações
```bash
curl -X GET http://localhost:4000/api/v1/reviews/stats \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 📋 11. Lista de Espera

### Adicionar à Lista
```bash
curl -X POST http://localhost:4000/api/v1/waitlist \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "João Silva",
    "clientPhone": "11999998888",
    "serviceId": "UUID_SERVICO",
    "preferredDate": "2024-12-15T00:00:00Z",
    "notes": "Prefere atendimento pela manhã"
  }'
```

### Listar Lista de Espera
```bash
# Todos
curl -X GET http://localhost:4000/api/v1/waitlist \
  -H "Authorization: Bearer SEU_TOKEN"

# Apenas não contatados
curl -X GET "http://localhost:4000/api/v1/waitlist?isContacted=false" \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Marcar como Contatado
```bash
curl -X POST http://localhost:4000/api/v1/waitlist/UUID_ENTRY/contact \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 🐛 Códigos de Erro Esperados

| Código | Descrição |
|--------|-----------|
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Token inválido ou ausente |
| 403 | Forbidden - Sem permissão |
| 404 | Not Found - Recurso não encontrado |
| 409 | Conflict - Conflito (ex: telefone já cadastrado) |
| 429 | Too Many Requests - Muitas requisições |
| 500 | Internal Server Error - Erro no servidor |

---

## 💡 Dicas

1. **Salve o token**: Após fazer login, salve o `accessToken` em uma variável de ambiente
2. **Use Postman/Insomnia**: Importar essas requisições facilita os testes
3. **Verifique logs**: Acompanhe os logs do servidor para debug
4. **Use Prisma Studio**: `npm run prisma:studio` para visualizar os dados
5. **Health check**: Teste `GET http://localhost:4000/health` para verificar se o servidor está ativo

---

**📚 Documentação adicional**: Veja `API_EXAMPLES.md` para mais exemplos e fluxos completos
