# 📘 Guia: Como Cadastrar um Profissional (Staff)

## 🎯 Fluxo Correto de Cadastro

Para cadastrar um profissional no sistema, é necessário seguir **2 etapas**:

1. **Criar o Usuário** (tabela `users`)
2. **Criar o perfil de Staff** (tabela `staff`) vinculado ao usuário

---

## 📝 Passo a Passo Completo

### Passo 1: Criar o Usuário

Primeiro, você precisa criar um usuário no sistema. Este usuário será a base para o perfil de profissional.

**Endpoint:** `POST /api/v1/users`

**Requisição:**
```bash
curl -X POST http://localhost:4000/api/v1/users \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria.silva@salao.com",
    "password": "senha123",
    "name": "Maria Silva",
    "phone": "11987654321",
    "roleId": "UUID_DA_ROLE_PROFISSIONAL"
  }'
```

**Resposta:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",  // ⚠️ GUARDE ESTE ID!
      "email": "maria.silva@salao.com",
      "name": "Maria Silva",
      "phone": "11987654321",
      "isActive": true,
      "role": {
        "id": "uuid-role",
        "name": "Profissional",
        "description": "Profissional do salão"
      },
      "staff": null,
      "createdAt": "2024-12-05T10:00:00Z"
    }
  }
}
```

**⚠️ IMPORTANTE**: Salve o `id` do usuário retornado! Você precisará dele no próximo passo.

---

### Passo 2: Criar o Perfil de Staff

Agora que você tem o usuário criado, use o `id` dele para criar o perfil de profissional.

**Endpoint:** `POST /api/v1/staff`

**Requisição:**
```bash
curl -X POST http://localhost:4000/api/v1/staff \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "specialties": ["cabelo", "barba", "coloração"],
    "commissionType": "PERCENT",
    "commissionValue": 40,
    "workSchedule": {
      "monday": { "start": "09:00", "end": "18:00" },
      "tuesday": { "start": "09:00", "end": "18:00" },
      "wednesday": { "start": "09:00", "end": "18:00" },
      "thursday": { "start": "09:00", "end": "18:00" },
      "friday": { "start": "09:00", "end": "18:00" },
      "saturday": { "start": "09:00", "end": "14:00" }
    },
    "blockedDates": []
  }'
```

**Resposta:**
```json
{
  "status": "success",
  "data": {
    "staff": {
      "id": "staff-uuid",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "specialties": ["cabelo", "barba", "coloração"],
      "commissionType": "PERCENT",
      "commissionValue": 40,
      "isAvailable": true,
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Maria Silva",
        "email": "maria.silva@salao.com",
        "phone": "11987654321"
      }
    }
  }
}
```

✅ **Pronto!** Agora você tem um profissional completo cadastrado no sistema.

---

## 🔑 Obtendo o UUID da Role "Profissional"

Se você não tem o UUID da role "Profissional", pode obtê-lo listando todas as roles:

**Endpoint:** `GET /api/v1/roles`

```bash
curl -X GET http://localhost:4000/api/v1/roles \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN"
```

**Resposta:**
```json
{
  "status": "success",
  "data": {
    "roles": [
      {
        "id": "uuid-admin",
        "name": "Admin",
        "description": "Administrador com acesso total"
      },
      {
        "id": "uuid-recepcao",
        "name": "Recepção",
        "description": "Recepcionista"
      },
      {
        "id": "uuid-profissional",  // ⚠️ USE ESTE!
        "name": "Profissional",
        "description": "Profissional do salão"
      }
    ]
  }
}
```

---

## 📊 Tipos de Comissão

Ao criar o perfil de staff, você pode escolher entre 3 tipos de comissão:

### 1. **PERCENT** (Porcentagem)
O profissional recebe uma porcentagem do valor do serviço.

```json
{
  "commissionType": "PERCENT",
  "commissionValue": 40  // 40% do valor do serviço
}
```

### 2. **FIXED** (Valor Fixo)
O profissional recebe um valor fixo por serviço.

```json
{
  "commissionType": "FIXED",
  "commissionValue": 25.00  // R$ 25,00 por serviço
}
```

### 3. **TABLE** (Tabela Customizada)
Valor específico por tipo de serviço (configurado posteriormente).

```json
{
  "commissionType": "TABLE",
  "commissionValue": 0  // Será definido na tabela de comissões
}
```

---

## 🗓️ Configurando Horário de Trabalho

O campo `workSchedule` define os horários de trabalho de cada dia:

```json
{
  "monday": { "start": "09:00", "end": "18:00" },
  "tuesday": { "start": "09:00", "end": "18:00" },
  "wednesday": { "start": "09:00", "end": "18:00" },
  "thursday": { "start": "09:00", "end": "18:00" },
  "friday": { "start": "09:00", "end": "20:00" },  // Sexta até mais tarde
  "saturday": { "start": "09:00", "end": "14:00" },
  "sunday": null  // Não trabalha aos domingos
}
```

---

## 🚫 Bloqueando Datas (Férias, Folgas)

Use o campo `blockedDates` para bloquear períodos:

```json
{
  "blockedDates": [
    {
      "start": "2024-12-25",
      "end": "2024-12-26",
      "reason": "Natal"
    },
    {
      "start": "2025-01-01",
      "end": "2025-01-01",
      "reason": "Ano Novo"
    },
    {
      "start": "2025-02-10",
      "end": "2025-02-20",
      "reason": "Férias"
    }
  ]
}
```

---

## ❌ Erros Comuns

### Erro: "User already has a staff profile"

**Causa:** Você tentou criar um perfil de staff para um usuário que já tem um.

**Solução:** Cada usuário pode ter apenas um perfil de staff. Se precisar atualizar, use o endpoint `PUT /api/v1/staff/:id`.

---

### Erro: "User not found" ou "Invalid user ID"

**Causa:** O `userId` fornecido não existe ou está incorreto.

**Solução:** Certifique-se de que você criou o usuário primeiro e está usando o `id` correto retornado na criação.

---

### Erro: "Email already registered"

**Causa:** Já existe um usuário com este email no sistema.

**Solução:** Use um email diferente ou verifique se o usuário já foi criado anteriormente com `GET /api/v1/users?search=email`.

---

## 🔍 Verificando Usuários Cadastrados

Para listar todos os usuários e verificar quem já tem perfil de staff:

```bash
curl -X GET http://localhost:4000/api/v1/users \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN"
```

A resposta mostrará se o usuário já tem um perfil de staff:

```json
{
  "users": [
    {
      "id": "uuid",
      "name": "Maria Silva",
      "email": "maria.silva@salao.com",
      "staff": {  // ✅ Este usuário JÁ tem perfil de staff
        "id": "staff-uuid",
        "specialties": ["cabelo"],
        "isAvailable": true
      }
    },
    {
      "id": "uuid-2",
      "name": "João Santos",
      "email": "joao@salao.com",
      "staff": null  // ❌ Este usuário NÃO tem perfil de staff
    }
  ]
}
```

---

## 🎯 Resumo do Fluxo

```
1. Listar Roles → Pegar UUID da role "Profissional"
       ↓
2. Criar Usuário → Guardar o UUID do usuário criado
       ↓
3. Criar Staff → Usar o UUID do usuário
       ↓
4. ✅ Profissional pronto para atender!
```

---

## 🔐 Permissões Necessárias

Para executar essas operações, você precisa estar autenticado com um usuário que tenha as seguintes permissões:

- `users.create` - Para criar usuários
- `staff.create` - Para criar perfis de staff
- `roles.list` - Para listar as roles disponíveis

Por padrão, apenas usuários com role **Admin** têm essas permissões.

---

## 📞 Dúvidas?

Se encontrar problemas, verifique:

1. ✅ Você está autenticado como Admin?
2. ✅ O banco de dados foi populado com o seed? (`npm run seed`)
3. ✅ Você criou o usuário ANTES de tentar criar o staff?
4. ✅ O UUID do usuário está correto?
5. ✅ O email do usuário é único (não existe outro com o mesmo email)?
