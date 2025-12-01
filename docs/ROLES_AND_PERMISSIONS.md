# Sistema de Cargos e Permissões

## Visão Geral

Foi implementado um sistema completo de gerenciamento de cargos (roles) e permissões que permite controle granular de acesso à plataforma. Apenas usuários com o cargo de **Admin** podem gerenciar cargos e atribuir permissões.

## Estrutura do Sistema

### Models Criados

1. **Role** - Representa um cargo no sistema
   - `id`: UUID
   - `name`: Nome único do cargo
   - `description`: Descrição do cargo
   - `isSystem`: Indica se é um cargo do sistema (não pode ser deletado)
   - `isActive`: Status do cargo

2. **Permission** - Representa uma permissão específica
   - `id`: UUID
   - `name`: Nome único da permissão (formato: `module.action`)
   - `description`: Descrição da permissão
   - `module`: Módulo ao qual a permissão pertence

3. **RolePermission** - Relacionamento entre cargos e permissões
   - `roleId`: ID do cargo
   - `permissionId`: ID da permissão

### Cargos Padrão

O sistema vem com 3 cargos pré-configurados:

#### 1. Admin
- **Acesso total** a todas as funcionalidades
- Permissões: Todas as 38 permissões disponíveis
- Não pode ser deletado (isSystem: true)

#### 2. Recepção
- Acesso a clientes e agendamentos
- **Permissões** (12 total):
  - `clients.*` - Todas as operações de clientes
  - `appointments.*` - Todas as operações de agendamentos
  - `staff.read` - Visualizar profissionais
  - `services.read` - Visualizar serviços
  - `waitlist.read`, `waitlist.create` - Lista de espera

#### 3. Profissional
- Acesso limitado para visualização
- **Permissões** (3 total):
  - `appointments.read` - Visualizar agendamentos
  - `clients.read` - Visualizar clientes
  - `services.read` - Visualizar serviços

## Permissões Disponíveis

### Módulos e Permissões

| Módulo | Permissões |
|--------|-----------|
| **clients** | read, create, update, delete |
| **appointments** | read, create, update, delete |
| **staff** | read, create, update, delete |
| **services** | read, create, update, delete |
| **products** | read, create, update, delete |
| **sales** | read, create |
| **payments** | read, create, update |
| **expenses** | read, create, update, delete |
| **reports** | read |
| **roles** | read, create, update, delete, assign |
| **reviews** | read |
| **waitlist** | read, create |

## Endpoints da API

### Gerenciamento de Cargos

Todos os endpoints exigem autenticação e permissão específica de `roles.*`

#### Listar Cargos
```
GET /api/v1/roles
Permissão: roles.read
```

#### Buscar Cargo por ID
```
GET /api/v1/roles/:id
Permissão: roles.read
```

#### Criar Novo Cargo
```
POST /api/v1/roles
Permissão: roles.create
Body: {
  "name": "Nome do Cargo",
  "description": "Descrição",
  "permissionIds": ["uuid1", "uuid2", ...]
}
```

#### Atualizar Cargo
```
PUT /api/v1/roles/:id
Permissão: roles.update
Body: {
  "name": "Novo Nome",
  "description": "Nova Descrição",
  "isActive": true
}
```

#### Deletar Cargo
```
DELETE /api/v1/roles/:id
Permissão: roles.delete
```
**Nota:** Não é possível deletar cargos do sistema ou cargos com usuários atribuídos.

#### Atribuir Permissões a um Cargo
```
PUT /api/v1/roles/:id/permissions
Permissão: roles.update
Body: {
  "permissionIds": ["uuid1", "uuid2", ...]
}
```

#### Atribuir Cargo a um Usuário
```
POST /api/v1/roles/:roleId/assign/:userId
Permissão: roles.assign
```

#### Listar Todas as Permissões
```
GET /api/v1/roles/permissions
Permissão: roles.read
```

#### Obter Permissões de um Cargo
```
GET /api/v1/roles/:id/permissions
Permissão: roles.read
```

### Atribuir Cargo a Staff

```
POST /api/v1/staff/:id/assign-role
Permissão: roles.assign
Body: {
  "roleId": "uuid-do-cargo"
}
```

## Como Usar

### 1. Criar um Novo Cargo

```bash
POST /api/v1/roles
Authorization: Bearer {token-admin}
Content-Type: application/json

{
  "name": "Gerente de Vendas",
  "description": "Gerente responsável pelas vendas e produtos",
  "permissionIds": [
    "uuid-sales.read",
    "uuid-sales.create",
    "uuid-products.read",
    "uuid-products.update"
  ]
}
```

### 2. Atribuir Cargo a um Usuário Staff

```bash
POST /api/v1/staff/{staff-id}/assign-role
Authorization: Bearer {token-admin}
Content-Type: application/json

{
  "roleId": "uuid-do-cargo"
}
```

### 3. Listar Todos os Cargos

```bash
GET /api/v1/roles
Authorization: Bearer {token-admin}
```

## Middleware de Autorização

### authenticate
Verifica se o usuário está autenticado e carrega as permissões do banco de dados.

### checkPermission(...permissions)
Verifica se o usuário possui pelo menos uma das permissões especificadas.

**Exemplo:**
```typescript
router.get(
  '/clients',
  authenticate,
  checkPermission('clients.read'),
  clientsController.list
);
```

## Rotas Atualizadas

As seguintes rotas foram atualizadas para usar o sistema de permissões:

- **Staff**: Todas as rotas agora exigem permissões `staff.*`
- **Clients**: Todas as rotas agora exigem permissões `clients.*`
- **Appointments**: Todas as rotas agora exigem permissões `appointments.*`

## Credenciais de Teste

Após executar o seed (`npx prisma db seed`):

### Admin
- **Email**: admin@salao.com
- **Senha**: admin123
- **Cargo**: Admin
- **Permissões**: Todas

### Recepção
- **Email**: recepcao@salao.com
- **Senha**: reception123
- **Cargo**: Recepção
- **Permissões**: Clientes e Agendamentos

### Profissional
- **Email**: maria@salao.com ou ana@salao.com
- **Senha**: staff123
- **Cargo**: Profissional
- **Permissões**: Apenas visualização

## Regras de Negócio

1. **Apenas Admin pode gerenciar cargos**: Todas as operações de CRUD de cargos requerem permissões específicas que apenas o cargo Admin possui por padrão.

2. **Cargos do Sistema não podem ser deletados**: Os cargos Admin, Recepção e Profissional são marcados como `isSystem: true` e não podem ser removidos.

3. **Cargos com usuários não podem ser deletados**: Para manter a integridade, cargos que têm usuários atribuídos não podem ser deletados.

4. **Permissões são granulares**: Cada operação (create, read, update, delete) é uma permissão separada por módulo.

5. **Usuários sem cargo não podem acessar**: Todos os usuários devem ter um cargo atribuído para acessar o sistema.

## Fluxo de Autenticação

1. **Login**: O usuário faz login com email e senha
2. **Token JWT**: É gerado um token contendo o ID do usuário e nome do cargo
3. **Validação**: Em cada requisição, o middleware `authenticate` carrega as permissões do banco
4. **Autorização**: O middleware `checkPermission` verifica se o usuário tem a permissão necessária
5. **Execução**: Se autorizado, a requisição prossegue

## Exemplo Completo

### Criar cargo "Recepcionista Sênior"

```bash
# 1. Login como Admin
POST /api/v1/auth/login
{
  "email": "admin@salao.com",
  "password": "admin123"
}

# 2. Listar permissões disponíveis
GET /api/v1/roles/permissions
Authorization: Bearer {admin-token}

# 3. Criar o cargo
POST /api/v1/roles
Authorization: Bearer {admin-token}
{
  "name": "Recepcionista Sênior",
  "description": "Recepcionista com acesso a relatórios",
  "permissionIds": [
    "{id-clients.read}",
    "{id-clients.create}",
    "{id-clients.update}",
    "{id-appointments.read}",
    "{id-appointments.create}",
    "{id-appointments.update}",
    "{id-reports.read}"
  ]
}

# 4. Atribuir ao staff
POST /api/v1/staff/{staff-id}/assign-role
Authorization: Bearer {admin-token}
{
  "roleId": "{novo-cargo-id}"
}
```

## Migration Aplicada

A migration `20251201185043_add_roles_and_permissions` foi criada e aplicada com sucesso, criando as tabelas:
- `roles`
- `permissions`
- `role_permissions`

E modificando a tabela `users` para incluir `roleId` (foreign key para roles).

## Observações Importantes

- O campo `role` do tipo enum foi removido do User
- Todos os usuários agora devem ter um `roleId`
- O sistema é totalmente extensível - novos cargos e permissões podem ser adicionados dinamicamente
- As permissões são verificadas em tempo real a cada requisição
