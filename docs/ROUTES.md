# 🧪 Testes da API - Guia Completo

## 📋 Pré-requisitos

1. Servidor rodando em `http://localhost:4000`
2. Banco de dados configurado e migrations executadas
3. Pelo menos um usuário admin no banco (use seed)

---

## 🔐 1. Autenticação

> **💡 Sistema de Permissões**: Após o login, o token JWT contém as permissões do usuário. Cada rota valida automaticamente se o usuário possui a permissão necessária (ex: `clients.create`, `appointments.update`, etc.).

### Registrar Novo Usuário
```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "novousuario@salao.com",
    "password": "senha123",
    "name": "Novo Usuário",
    "role": "RECEPTION"
  }'
```

**Resposta esperada:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid",
      "email": "novousuario@salao.com",
      "name": "Novo Usuário"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "abc123..."
  }
}
```

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
      "role": {
        "id": "uuid-role",
        "name": "Admin",
        "description": "Acesso completo ao sistema"
      },
      "permissions": [
        "clients.list",
        "clients.create",
        "clients.read",
        "clients.update",
        "clients.delete",
        "appointments.list",
        // ... todas as 38 permissões para Admin
      ]
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "abc123..."
  }
}
```

**💡 Salve o accessToken para usar nas próximas requisições!**

**🔑 Credenciais de teste disponíveis:**
```
Admin:         admin@salao.com / admin123
Recepção:      recepcao@salao.com / reception123
Profissional:  maria@salao.com / staff123
```

### Refresh Token
```bash
curl -X POST http://localhost:4000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "SEU_REFRESH_TOKEN"
  }'
```

### Logout
```bash
curl -X POST http://localhost:4000/api/v1/auth/logout \
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

## � 2. Usuários

> **🔐 Permissões necessárias**: `users.list`, `users.create`, `users.read`, `users.update`, `users.delete`

### Criar Usuário (Para posteriormente criar Staff)
```bash
curl -X POST http://localhost:4000/api/v1/users \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "profissional@salao.com",
    "password": "senha123",
    "name": "Carlos Mendes",
    "phone": "11987654321",
    "roleId": "UUID_DA_ROLE"
  }'
```

**Resposta esperada:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid-do-usuario",
      "email": "profissional@salao.com",
      "name": "Carlos Mendes",
      "phone": "11987654321",
      "isActive": true,
      "role": {
        "id": "uuid-role",
        "name": "Profissional",
        "description": "Profissional do salão",
        "rolePermissions": [...]
      },
      "staff": null,
      "createdAt": "2024-12-05T10:00:00Z"
    }
  }
}
```

💡 **Após criar o usuário, use o `id` retornado para criar o perfil de Staff!**

### Listar Usuários
```bash
# Todos os usuários
curl -X GET http://localhost:4000/api/v1/users \
  -H "Authorization: Bearer SEU_TOKEN"

# Filtrar ativos
curl -X GET "http://localhost:4000/api/v1/users?isActive=true" \
  -H "Authorization: Bearer SEU_TOKEN"

# Filtrar por role
curl -X GET "http://localhost:4000/api/v1/users?roleId=UUID_DA_ROLE" \
  -H "Authorization: Bearer SEU_TOKEN"

# Buscar por nome/email/telefone
curl -X GET "http://localhost:4000/api/v1/users?search=carlos" \
  -H "Authorization: Bearer SEU_TOKEN"
```

**Resposta esperada:**
```json
{
  "status": "success",
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "profissional@salao.com",
        "name": "Carlos Mendes",
        "phone": "11987654321",
        "isActive": true,
        "role": {
          "id": "uuid-role",
          "name": "Profissional",
          "description": "Profissional do salão"
        },
        "staff": {
          "id": "uuid-staff",
          "specialties": ["cabelo", "barba"],
          "isAvailable": true
        }
      }
    ],
    "total": 1
  }
}
```

### Buscar Usuário por ID
```bash
curl -X GET http://localhost:4000/api/v1/users/UUID_DO_USUARIO \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Atualizar Usuário
```bash
curl -X PUT http://localhost:4000/api/v1/users/UUID_DO_USUARIO \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Carlos Mendes Silva",
    "phone": "11988887777",
    "roleId": "UUID_NOVA_ROLE"
  }'
```

### Alterar Senha do Usuário
```bash
curl -X PUT http://localhost:4000/api/v1/users/UUID_DO_USUARIO/password \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "senha123",
    "newPassword": "novaSenha456"
  }'
```

### Desativar Usuário (Soft Delete)
```bash
curl -X PUT http://localhost:4000/api/v1/users/UUID_DO_USUARIO/deactivate \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Ativar Usuário
```bash
curl -X PUT http://localhost:4000/api/v1/users/UUID_DO_USUARIO/activate \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Deletar Usuário Permanentemente
```bash
curl -X DELETE http://localhost:4000/api/v1/users/UUID_DO_USUARIO \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## �👥 3. Clientes

> **🔐 Permissões necessárias**: `clients.list`, `clients.create`, `clients.read`, `clients.update`, `clients.delete`

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

## 💇 4. Serviços

> **🔐 Permissões necessárias**: `services.list`, `services.create`, `services.read`, `services.update`, `services.delete`

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

## 👨‍💼 5. Profissionais (Staff)

> **🔐 Permissões necessárias**: `staff.list`, `staff.create`, `staff.read`, `staff.update`, `staff.delete`, `staff.availability`, `staff.assign-role`

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

### Atualizar Profissional
```bash
curl -X PUT http://localhost:4000/api/v1/staff/UUID_STAFF \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "specialties": ["cabelo", "manicure", "design de sobrancelhas"],
    "commissionValue": 45,
    "isAvailable": true
  }'
```

### Atribuir Cargo a Profissional
```bash
curl -X POST http://localhost:4000/api/v1/staff/UUID_STAFF/assign-role \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roleId": "UUID_DO_CARGO"
  }'
```

### Deletar Profissional
```bash
curl -X DELETE http://localhost:4000/api/v1/staff/UUID_STAFF \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 📅 6. Agendamentos

> **🔐 Permissões necessárias**: `appointments.list`, `appointments.create`, `appointments.read`, `appointments.update`, `appointments.delete`, `appointments.cancel`, `appointments.no-show`

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

## 💰 7. Pagamentos

> **🔐 Permissões necessárias**: `payments.list`, `payments.create`, `payments.read`, `payments.confirm`, `payments.refund`, `payments.report`

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

## 📦 8. Produtos

> **🔐 Permissões necessárias**: `products.list`, `products.create`, `products.read`, `products.update`, `products.delete`, `products.stock`

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

### Atualizar Produto
```bash
curl -X PUT http://localhost:4000/api/v1/products/UUID_PRODUTO \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "salePrice": 50.00,
    "reorderThreshold": 15,
    "isActive": true
  }'
```

### Deletar Produto
```bash
curl -X DELETE http://localhost:4000/api/v1/products/UUID_PRODUTO \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 🛒 9. Vendas (PDV)

> **🔐 Permissões necessárias**: `sales.list`, `sales.create`, `sales.read`

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

**Resposta esperada:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "clientId": "uuid-cliente",
    "totalAmount": 120.00,
    "paymentMethod": "CREDIT",
    "items": [
      {
        "productId": "uuid-produto-1",
        "quantity": 2,
        "unitPrice": 45.00,
        "subtotal": 90.00
      },
      {
        "productId": "uuid-produto-2",
        "quantity": 1,
        "unitPrice": 30.00,
        "subtotal": 30.00
      }
    ],
    "createdAt": "2024-12-04T10:00:00Z"
  }
}
```

### Listar Vendas
```bash
# Todas as vendas
curl -X GET http://localhost:4000/api/v1/sales \
  -H "Authorization: Bearer SEU_TOKEN"

# Por período
curl -X GET "http://localhost:4000/api/v1/sales?startDate=2024-12-01&endDate=2024-12-31" \
  -H "Authorization: Bearer SEU_TOKEN"

# Por cliente
curl -X GET "http://localhost:4000/api/v1/sales?clientId=UUID" \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Buscar Venda por ID
```bash
curl -X GET http://localhost:4000/api/v1/sales/UUID_VENDA \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 📊 10. Relatórios

> **🔐 Permissões necessárias**: `reports.dashboard`, `reports.financial`, `reports.commissions`

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

## ⭐ 11. Avaliações

> **🔐 Permissões necessárias**: `reviews.list`, `reviews.create`, `reviews.read`, `reviews.update`, `reviews.delete`, `reviews.stats`

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
# Todas as avaliações
curl -X GET http://localhost:4000/api/v1/reviews \
  -H "Authorization: Bearer SEU_TOKEN"

# Por cliente
curl -X GET "http://localhost:4000/api/v1/reviews?clientId=UUID" \
  -H "Authorization: Bearer SEU_TOKEN"

# Por rating mínimo
curl -X GET "http://localhost:4000/api/v1/reviews?minRating=4" \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Estatísticas de Avaliações
```bash
curl -X GET http://localhost:4000/api/v1/reviews/stats \
  -H "Authorization: Bearer SEU_TOKEN"
```

**Resposta esperada:**
```json
{
  "status": "success",
  "data": {
    "averageRating": 4.7,
    "totalReviews": 150,
    "ratingDistribution": {
      "5": 100,
      "4": 35,
      "3": 10,
      "2": 3,
      "1": 2
    },
    "averageServiceQuality": 4.8,
    "averageStaffBehavior": 4.9,
    "averageCleanliness": 4.6
  }
}
```

---

## 📋 12. Lista de Espera

> **🔐 Permissões necessárias**: `waitlist.list`, `waitlist.create`, `waitlist.read`, `waitlist.update`, `waitlist.delete`, `waitlist.notify`

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

## 💸 13. Despesas

> **🔐 Permissões necessárias**: `expenses.list`, `expenses.create`, `expenses.read`, `expenses.update`, `expenses.delete`

### Criar Despesa
```bash
curl -X POST http://localhost:4000/api/v1/expenses \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Aluguel do salão",
    "category": "Infraestrutura",
    "amount": 3500.00,
    "dueDate": "2024-12-10T00:00:00Z",
    "isRecurring": true,
    "notes": "Pagamento mensal do aluguel"
  }'
```

### Listar Despesas
```bash
# Todas as despesas
curl -X GET http://localhost:4000/api/v1/expenses \
  -H "Authorization: Bearer SEU_TOKEN"

# Por período
curl -X GET "http://localhost:4000/api/v1/expenses?startDate=2024-12-01&endDate=2024-12-31" \
  -H "Authorization: Bearer SEU_TOKEN"

# Por categoria
curl -X GET "http://localhost:4000/api/v1/expenses?category=Infraestrutura" \
  -H "Authorization: Bearer SEU_TOKEN"

# Apenas pendentes
curl -X GET "http://localhost:4000/api/v1/expenses?isPaid=false" \
  -H "Authorization: Bearer SEU_TOKEN"
```

**Resposta esperada:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "description": "Aluguel do salão",
      "category": "Infraestrutura",
      "amount": 3500.00,
      "dueDate": "2024-12-10T00:00:00Z",
      "isPaid": false,
      "paidAt": null,
      "isRecurring": true,
      "notes": "Pagamento mensal do aluguel",
      "createdAt": "2024-12-01T10:00:00Z"
    }
  ]
}
```

### Buscar Despesa por ID
```bash
curl -X GET http://localhost:4000/api/v1/expenses/UUID_DA_DESPESA \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Atualizar Despesa
```bash
curl -X PUT http://localhost:4000/api/v1/expenses/UUID_DA_DESPESA \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 3700.00,
    "notes": "Reajuste anual do aluguel"
  }'
```

### Marcar como Pago
```bash
curl -X POST http://localhost:4000/api/v1/expenses/UUID_DA_DESPESA/pay \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Deletar Despesa
```bash
curl -X DELETE http://localhost:4000/api/v1/expenses/UUID_DA_DESPESA \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 🔔 13. Webhooks

> **⚠️ IMPORTANTE**: Rotas públicas sem autenticação (usadas por serviços externos)

### Webhook WhatsApp
```bash
curl -X POST http://localhost:4000/api/v1/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "event": "message.received",
    "data": {
      "from": "5511999998888",
      "message": "Olá, gostaria de agendar um horário"
    }
  }'
```

**Descrição**: Recebe notificações de eventos do WhatsApp Business API, como mensagens recebidas, status de envio, etc.

### Webhook Pagamento
```bash
curl -X POST http://localhost:4000/api/v1/webhooks/payment \
  -H "Content-Type: application/json" \
  -d '{
    "event": "payment.approved",
    "data": {
      "paymentId": "uuid-do-pagamento",
      "status": "approved",
      "transactionId": "MP-123456789"
    }
  }'
```

**Descrição**: Recebe notificações de mudanças de status em pagamentos de gateways externos (Mercado Pago, Stripe, etc.).

---

## 👔 15. Sistema de Cargos e Permissões

> **⚠️ IMPORTANTE**: Todas as rotas deste módulo requerem permissão `roles.*` (apenas ADMIN)

### Listar Todos os Cargos
```bash
curl -X GET http://localhost:4000/api/v1/roles \
  -H "Authorization: Bearer SEU_TOKEN"
```

**Resposta esperada:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid-admin",
      "name": "Admin",
      "description": "Acesso completo ao sistema",
      "createdAt": "2024-12-01T10:00:00Z",
      "updatedAt": "2024-12-01T10:00:00Z",
      "_count": {
        "rolePermissions": 38,
        "users": 1
      }
    },
    {
      "id": "uuid-recepcao",
      "name": "Recepção",
      "description": "Acesso a clientes e agendamentos",
      "_count": {
        "rolePermissions": 12,
        "users": 3
      }
    },
    {
      "id": "uuid-profissional",
      "name": "Profissional",
      "description": "Acesso limitado para consulta",
      "_count": {
        "rolePermissions": 3,
        "users": 5
      }
    }
  ]
}
```

### Criar Novo Cargo
```bash
curl -X POST http://localhost:4000/api/v1/roles \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gerente",
    "description": "Gerente do salão com acesso amplo"
  }'
```

**Resposta esperada:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid-novo-cargo",
    "name": "Gerente",
    "description": "Gerente do salão com acesso amplo",
    "createdAt": "2024-12-01T15:30:00Z",
    "updatedAt": "2024-12-01T15:30:00Z"
  }
}
```

### Buscar Cargo Específico
```bash
curl -X GET http://localhost:4000/api/v1/roles/UUID_DO_CARGO \
  -H "Authorization: Bearer SEU_TOKEN"
```

**Resposta esperada:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid-cargo",
    "name": "Recepção",
    "description": "Acesso a clientes e agendamentos",
    "createdAt": "2024-12-01T10:00:00Z",
    "updatedAt": "2024-12-01T10:00:00Z",
    "rolePermissions": [
      {
        "permission": {
          "id": "uuid-perm-1",
          "name": "clients.list",
          "description": "Listar clientes",
          "module": "clients"
        }
      },
      {
        "permission": {
          "id": "uuid-perm-2",
          "name": "clients.create",
          "description": "Criar cliente",
          "module": "clients"
        }
      }
    ],
    "users": [
      {
        "id": "uuid-user",
        "name": "Maria Recepcionista",
        "email": "maria@salao.com"
      }
    ]
  }
}
```

### Atualizar Cargo
```bash
curl -X PUT http://localhost:4000/api/v1/roles/UUID_DO_CARGO \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gerente de Operações",
    "description": "Gerente com controle sobre operações diárias"
  }'
```

### Deletar Cargo
```bash
curl -X DELETE http://localhost:4000/api/v1/roles/UUID_DO_CARGO \
  -H "Authorization: Bearer SEU_TOKEN"
```

**Resposta esperada:**
```json
{
  "status": "success",
  "message": "Cargo deletado com sucesso"
}
```

### Atribuir Permissões a um Cargo
```bash
curl -X PUT http://localhost:4000/api/v1/roles/UUID_DO_CARGO/permissions \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "permissionIds": [
      "uuid-clients-list",
      "uuid-clients-create",
      "uuid-clients-read",
      "uuid-appointments-list",
      "uuid-appointments-create",
      "uuid-appointments-read",
      "uuid-appointments-update"
    ]
  }'
```

**Resposta esperada:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid-cargo",
    "name": "Recepção",
    "rolePermissions": [
      {
        "permission": {
          "id": "uuid-clients-list",
          "name": "clients.list",
          "description": "Listar clientes",
          "module": "clients"
        }
      },
      {
        "permission": {
          "id": "uuid-clients-create",
          "name": "clients.create",
          "description": "Criar cliente",
          "module": "clients"
        }
      }
      // ... demais permissões
    ]
  }
}
```

### Atribuir Cargo a um Usuário
```bash
curl -X POST http://localhost:4000/api/v1/roles/UUID_DO_CARGO/assign/UUID_DO_USUARIO \
  -H "Authorization: Bearer SEU_TOKEN"
```

**Resposta esperada:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid-usuario",
    "name": "João Silva",
    "email": "joao@salao.com",
    "roleId": "uuid-cargo",
    "role": {
      "id": "uuid-cargo",
      "name": "Gerente",
      "description": "Gerente do salão"
    }
  }
}
```

### Listar Todas as Permissões Disponíveis
```bash
curl -X GET http://localhost:4000/api/v1/roles/permissions \
  -H "Authorization: Bearer SEU_TOKEN"
```

**Resposta esperada:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid-perm-1",
      "name": "clients.list",
      "description": "Listar clientes",
      "module": "clients",
      "createdAt": "2024-12-01T10:00:00Z"
    },
    {
      "id": "uuid-perm-2",
      "name": "clients.create",
      "description": "Criar cliente",
      "module": "clients",
      "createdAt": "2024-12-01T10:00:00Z"
    }
    // ... Total: 38 permissões
  ]
}
```

### 📋 Lista Completa de Permissões (38 total)

#### Módulo: Clientes (clients.*)
- `clients.list` - Listar clientes
- `clients.create` - Criar cliente
- `clients.read` - Visualizar detalhes do cliente
- `clients.update` - Atualizar dados do cliente
- `clients.delete` - Deletar cliente

#### Módulo: Agendamentos (appointments.*)
- `appointments.list` - Listar agendamentos
- `appointments.create` - Criar agendamento
- `appointments.read` - Visualizar agendamento
- `appointments.update` - Atualizar agendamento
- `appointments.delete` - Deletar agendamento
- `appointments.cancel` - Cancelar agendamento
- `appointments.no-show` - Marcar como no-show

#### Módulo: Profissionais (staff.*)
- `staff.list` - Listar profissionais
- `staff.create` - Criar profissional
- `staff.read` - Visualizar profissional
- `staff.update` - Atualizar profissional
- `staff.delete` - Deletar profissional
- `staff.availability` - Ver disponibilidade
- `staff.assign-role` - Atribuir cargo

#### Módulo: Serviços (services.*)
- `services.list` - Listar serviços
- `services.create` - Criar serviço
- `services.read` - Visualizar serviço
- `services.update` - Atualizar serviço
- `services.delete` - Deletar serviço

#### Módulo: Produtos (products.*)
- `products.list` - Listar produtos
- `products.create` - Criar produto
- `products.read` - Visualizar produto
- `products.update` - Atualizar produto
- `products.delete` - Deletar produto
- `products.stock` - Gerenciar estoque

#### Módulo: Vendas (sales.*)
- `sales.list` - Listar vendas
- `sales.create` - Criar venda
- `sales.read` - Visualizar venda

#### Módulo: Pagamentos (payments.*)
- `payments.list` - Listar pagamentos
- `payments.create` - Criar pagamento
- `payments.read` - Visualizar pagamento
- `payments.confirm` - Confirmar pagamento
- `payments.refund` - Reembolsar pagamento
- `payments.report` - Relatório de pagamentos

#### Módulo: Despesas (expenses.*)
- `expenses.list` - Listar despesas
- `expenses.create` - Criar despesa
- `expenses.read` - Visualizar despesa
- `expenses.update` - Atualizar despesa
- `expenses.delete` - Deletar despesa

#### Módulo: Relatórios (reports.*)
- `reports.dashboard` - Dashboard geral
- `reports.financial` - Relatório financeiro
- `reports.commissions` - Relatório de comissões

#### Módulo: Cargos (roles.*)
- `roles.list` - Listar cargos
- `roles.create` - Criar cargo
- `roles.read` - Visualizar cargo
- `roles.update` - Atualizar cargo
- `roles.delete` - Deletar cargo
- `roles.assign` - Atribuir cargo

#### Módulo: Avaliações (reviews.*)
- `reviews.list` - Listar avaliações
- `reviews.create` - Criar avaliação
- `reviews.read` - Visualizar avaliação
- `reviews.update` - Atualizar avaliação
- `reviews.delete` - Deletar avaliação
- `reviews.stats` - Estatísticas de avaliações

#### Módulo: Lista de Espera (waitlist.*)
- `waitlist.list` - Listar lista de espera
- `waitlist.create` - Adicionar à lista
- `waitlist.read` - Visualizar entrada
- `waitlist.update` - Atualizar entrada
- `waitlist.delete` - Deletar entrada
- `waitlist.notify` - Notificar cliente

### 🎯 Cargos Padrão e suas Permissões

#### 1. Admin (Todas as 38 permissões)
Acesso completo a todos os módulos do sistema.

**Credenciais de teste:**
```
Email: admin@salao.com
Senha: admin123
```

#### 2. Recepção (12 permissões)
Foco em atendimento ao cliente e agendamentos:
- `clients.*` (todas as permissões de clientes)
- `appointments.*` (todas as permissões de agendamentos)
- `waitlist.list`
- `waitlist.create`

**Credenciais de teste:**
```
Email: recepcao@salao.com
Senha: reception123
```

#### 3. Profissional (3 permissões)
Acesso limitado para consulta:
- `appointments.list` (apenas seus próprios agendamentos)
- `clients.read` (visualizar clientes)
- `services.list` (listar serviços)

**Credenciais de teste:**
```
Email: maria@salao.com
Senha: staff123
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
3. **Verifique permissões**: Cada resposta 403 indica falta de permissão - verifique o cargo do usuário
4. **Teste com diferentes cargos**: Use as 3 credenciais padrão para testar diferentes níveis de acesso
5. **Verifique logs**: Acompanhe os logs do servidor para debug
6. **Use Prisma Studio**: `npm run prisma:studio` para visualizar os dados
7. **Health check**: Teste `GET http://localhost:4000/health` para verificar se o servidor está ativo
8. **Gerencie permissões**: Apenas admin pode criar e editar cargos através de `/api/v1/roles`

---

**📚 Documentação adicional**: 
- `ROLES_AND_PERMISSIONS.md` - Guia completo do sistema de permissões
- `API_EXAMPLES.md` - Mais exemplos e fluxos completos

---

## ⚠️ Nota sobre Permissões

Se você receber um erro **403 Forbidden**, significa que seu usuário não possui a permissão necessária. Exemplo:

```json
{
  "status": "error",
  "message": "Acesso negado. Permissão necessária: clients.create"
}
```

**Soluções:**
1. Faça login com um usuário que possui a permissão necessária
2. Peça ao administrador para atribuir a permissão ao seu cargo
3. Use as credenciais de teste do Admin para acesso total: `admin@salao.com / admin123`
