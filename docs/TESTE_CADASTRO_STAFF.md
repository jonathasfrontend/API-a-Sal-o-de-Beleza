# 🧪 Testes - Fluxo Completo de Cadastro de Staff

Este documento contém os comandos curl para testar o fluxo completo de cadastro de um profissional (staff).

## 🔐 Passo 0: Fazer Login como Admin

Primeiro, você precisa fazer login para obter o token de acesso:

```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@salao.com",
    "password": "admin123"
  }'
```

**Salve o `accessToken` retornado!** Você precisará dele nas próximas requisições.

---

## 📋 Passo 1: Listar Roles Disponíveis

Obtenha o UUID da role "Profissional":

```bash
curl -X GET http://localhost:4000/api/v1/roles \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

**Resposta esperada:**
```json
{
  "status": "success",
  "data": {
    "roles": [
      {
        "id": "uuid-admin",
        "name": "Admin",
        "description": "Administrador com acesso total ao sistema"
      },
      {
        "id": "uuid-recepcao",
        "name": "Recepção",
        "description": "Recepcionista com acesso a clientes e agendamentos"
      },
      {
        "id": "uuid-profissional",
        "name": "Profissional",
        "description": "Profissional do salão com acesso limitado"
      }
    ]
  }
}
```

**Copie o `id` da role "Profissional".**

---

## 👤 Passo 2: Criar o Usuário

Crie um novo usuário no sistema:

```bash
curl -X POST http://localhost:4000/api/v1/users \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "carlos.barbeiro@salao.com",
    "password": "senha123",
    "name": "Carlos Mendes",
    "phone": "11987654321",
    "roleId": "UUID_DA_ROLE_PROFISSIONAL"
  }'
```

**Resposta esperada:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "carlos.barbeiro@salao.com",
      "name": "Carlos Mendes",
      "phone": "11987654321",
      "isActive": true,
      "avatar": null,
      "lastLogin": null,
      "role": {
        "id": "uuid-profissional",
        "name": "Profissional",
        "description": "Profissional do salão com acesso limitado",
        "rolePermissions": [
          {
            "permission": {
              "id": "perm-1",
              "name": "appointments.read",
              "description": "Visualizar agendamentos",
              "module": "appointments"
            }
          },
          {
            "permission": {
              "id": "perm-2",
              "name": "clients.read",
              "description": "Visualizar clientes",
              "module": "clients"
            }
          }
        ]
      },
      "staff": null,
      "createdAt": "2024-12-05T14:30:00.000Z",
      "updatedAt": "2024-12-05T14:30:00.000Z"
    }
  }
}
```

**⚠️ IMPORTANTE: Copie o `id` do usuário! Você precisará dele no próximo passo.**

---

## 👨‍💼 Passo 3: Criar o Perfil de Staff

Agora crie o perfil de profissional usando o `id` do usuário criado:

```bash
curl -X POST http://localhost:4000/api/v1/staff \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \
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
      "friday": { "start": "09:00", "end": "20:00" },
      "saturday": { "start": "09:00", "end": "14:00" }
    },
    "blockedDates": []
  }'
```

**Resposta esperada:**
```json
{
  "status": "success",
  "data": {
    "staff": {
      "id": "staff-uuid-123",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "specialties": ["cabelo", "barba", "coloração"],
      "commissionType": "PERCENT",
      "commissionValue": 40,
      "workSchedule": {
        "monday": { "start": "09:00", "end": "18:00" },
        "tuesday": { "start": "09:00", "end": "18:00" },
        "wednesday": { "start": "09:00", "end": "18:00" },
        "thursday": { "start": "09:00", "end": "18:00" },
        "friday": { "start": "09:00", "end": "20:00" },
        "saturday": { "start": "09:00", "end": "14:00" }
      },
      "blockedDates": [],
      "isAvailable": true,
      "createdAt": "2024-12-05T14:35:00.000Z",
      "updatedAt": "2024-12-05T14:35:00.000Z",
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Carlos Mendes",
        "email": "carlos.barbeiro@salao.com",
        "phone": "11987654321",
        "avatar": null
      }
    }
  }
}
```

---

## ✅ Passo 4: Verificar Usuário e Staff Criados

### Listar todos os usuários:

```bash
curl -X GET http://localhost:4000/api/v1/users \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

### Buscar usuário específico:

```bash
curl -X GET http://localhost:4000/api/v1/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

### Listar todos os profissionais:

```bash
curl -X GET http://localhost:4000/api/v1/staff \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

### Buscar profissional específico:

```bash
curl -X GET http://localhost:4000/api/v1/staff/staff-uuid-123 \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

---

## 🔄 Operações Adicionais

### Atualizar dados do usuário:

```bash
curl -X PUT http://localhost:4000/api/v1/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Carlos Mendes Silva",
    "phone": "11988887777"
  }'
```

### Alterar senha do usuário:

```bash
curl -X PUT http://localhost:4000/api/v1/users/550e8400-e29b-41d4-a716-446655440000/password \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "senha123",
    "newPassword": "novaSenha456"
  }'
```

### Atualizar dados do staff:

```bash
curl -X PUT http://localhost:4000/api/v1/staff/staff-uuid-123 \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "specialties": ["cabelo", "barba", "coloração", "sobrancelha"],
    "commissionValue": 45,
    "isAvailable": true
  }'
```

### Desativar usuário:

```bash
curl -X PUT http://localhost:4000/api/v1/users/550e8400-e29b-41d4-a716-446655440000/deactivate \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

### Ativar usuário:

```bash
curl -X PUT http://localhost:4000/api/v1/users/550e8400-e29b-41d4-a716-446655440000/activate \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

---

## 🧪 Testando Erros

### Erro: Tentar criar staff sem usuário:

```bash
curl -X POST http://localhost:4000/api/v1/staff \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "00000000-0000-0000-0000-000000000000",
    "specialties": ["cabelo"],
    "commissionType": "PERCENT",
    "commissionValue": 40
  }'
```

**Resposta esperada (erro):**
```json
{
  "status": "error",
  "message": "User not found or similar error"
}
```

### Erro: Email duplicado:

```bash
curl -X POST http://localhost:4000/api/v1/users \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "carlos.barbeiro@salao.com",
    "password": "senha123",
    "name": "Outro Carlos"
  }'
```

**Resposta esperada (erro):**
```json
{
  "status": "error",
  "message": "Email already registered"
}
```

### Erro: Criar staff duplicado para o mesmo usuário:

```bash
curl -X POST http://localhost:4000/api/v1/staff \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "specialties": ["manicure"],
    "commissionType": "FIXED",
    "commissionValue": 25
  }'
```

**Resposta esperada (erro):**
```json
{
  "status": "error",
  "message": "User already has a staff profile"
}
```

---

## 📝 Script Completo em Bash

Aqui está um script bash que executa todo o fluxo:

```bash
#!/bin/bash

# Configuração
API_URL="http://localhost:4000/api/v1"

# 1. Login
echo "🔐 Fazendo login..."
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@salao.com",
    "password": "admin123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.accessToken')
echo "✅ Token obtido: ${TOKEN:0:20}..."

# 2. Listar roles
echo ""
echo "📋 Listando roles..."
ROLES_RESPONSE=$(curl -s -X GET $API_URL/roles \
  -H "Authorization: Bearer $TOKEN")

ROLE_ID=$(echo $ROLES_RESPONSE | jq -r '.data.roles[] | select(.name=="Profissional") | .id')
echo "✅ Role ID (Profissional): $ROLE_ID"

# 3. Criar usuário
echo ""
echo "👤 Criando usuário..."
USER_RESPONSE=$(curl -s -X POST $API_URL/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"carlos$(date +%s)@salao.com\",
    \"password\": \"senha123\",
    \"name\": \"Carlos Mendes\",
    \"phone\": \"11987654321\",
    \"roleId\": \"$ROLE_ID\"
  }")

USER_ID=$(echo $USER_RESPONSE | jq -r '.data.user.id')
echo "✅ Usuário criado: $USER_ID"

# 4. Criar staff
echo ""
echo "👨‍💼 Criando perfil de staff..."
STAFF_RESPONSE=$(curl -s -X POST $API_URL/staff \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"specialties\": [\"cabelo\", \"barba\"],
    \"commissionType\": \"PERCENT\",
    \"commissionValue\": 40,
    \"workSchedule\": {
      \"monday\": { \"start\": \"09:00\", \"end\": \"18:00\" },
      \"tuesday\": { \"start\": \"09:00\", \"end\": \"18:00\" },
      \"wednesday\": { \"start\": \"09:00\", \"end\": \"18:00\" },
      \"thursday\": { \"start\": \"09:00\", \"end\": \"18:00\" },
      \"friday\": { \"start\": \"09:00\", \"end\": \"20:00\" },
      \"saturday\": { \"start\": \"09:00\", \"end\": \"14:00\" }
    }
  }")

STAFF_ID=$(echo $STAFF_RESPONSE | jq -r '.data.staff.id')
echo "✅ Staff criado: $STAFF_ID"

echo ""
echo "🎉 Fluxo completo executado com sucesso!"
echo "   User ID:  $USER_ID"
echo "   Staff ID: $STAFF_ID"
```

**Para executar o script:**

1. Salve como `test-staff-creation.sh`
2. Dê permissão de execução: `chmod +x test-staff-creation.sh`
3. Execute: `./test-staff-creation.sh`

**Nota:** Este script requer `jq` instalado para processar JSON. Instale com:
- Ubuntu/Debian: `sudo apt-get install jq`
- macOS: `brew install jq`
- Windows: Use WSL ou baixe de https://stedolan.github.io/jq/

---

## 🎯 Resumo do Fluxo

```
Login → Obter Token
  ↓
Listar Roles → Pegar UUID "Profissional"
  ↓
Criar Usuário → Obter User ID
  ↓
Criar Staff → Usar User ID
  ↓
✅ Profissional pronto!
```
