# 🚀 GUIA RÁPIDO: Configurar Banco de Dados

## ⚠️ Problema Atual
Docker não está instalado. Você tem 3 opções:

---

## ✅ OPÇÃO 1: Instalar PostgreSQL Local (MAIS RÁPIDO) ⭐

### Passo 1: Baixar PostgreSQL
```
https://www.postgresql.org/download/windows/
```
- Baixar versão 15 ou 16
- Executar instalador
- **Senha que você vai criar:** anote essa senha!
- Porta padrão: 5432
- Instalar tudo (pgAdmin incluído)

### Passo 2: Criar Banco
```powershell
# Abrir pgAdmin (foi instalado junto)
# OU usar linha de comando:

# Conectar ao PostgreSQL
psql -U postgres

# Criar banco de dados
CREATE DATABASE salao_beleza;

# Sair
\q
```

### Passo 3: Atualizar .env
Editar arquivo `.env` e colocar a senha que você criou:

```env
DATABASE_URL="postgresql://postgres:SUA_SENHA_AQUI@localhost:5432/salao_beleza"
```

Exemplo:
```env
DATABASE_URL="postgresql://postgres:minhasenha123@localhost:5432/salao_beleza"
```

### Passo 4: Aplicar Schema
```powershell
cd "D:\portifolios\Sistema de gerenciamento\backend"

# Gerar Prisma Client
npm run prisma:generate

# Criar e aplicar migrations
npm run prisma:migrate dev --name init

# Iniciar servidor
npm run dev
```

**PRONTO! ✅**

---

## ✅ OPÇÃO 2: Instalar Docker Desktop

### Passo 1: Baixar e Instalar
```
https://www.docker.com/products/docker-desktop/
```
- Baixar Docker Desktop para Windows
- Executar instalador
- **Reiniciar o computador**
- Abrir Docker Desktop (ícone na barra de tarefas)

### Passo 2: Iniciar Containers
```powershell
cd "D:\portifolios\Sistema de gerenciamento\backend"

# Iniciar PostgreSQL e Redis
docker compose up -d postgres redis

# Aguardar 10 segundos
timeout /t 10

# Verificar se estão rodando
docker ps
```

### Passo 3: Atualizar .env
```env
DATABASE_URL="postgresql://salao:salao123@localhost:5432/salao_db"
```

### Passo 4: Aplicar Schema
```powershell
npm run prisma:generate
npm run prisma:migrate dev --name init
npm run dev
```

---

## ✅ OPÇÃO 3: Corrigir Supabase (Cloud)

### Verificar Status
1. Acesse: https://supabase.com/dashboard
2. Login na sua conta
3. Procure o projeto: `amluefbhwuxjldbxtqhv`
4. Verifique se está **ativo** (não pausado)

### Obter String de Conexão Correta
1. No Dashboard → **Settings** → **Database**
2. Copie a **Connection String** em **URI**
3. Cole no `.env`

Deve ser algo como:
```env
DATABASE_URL="postgresql://postgres.amluefbhwuxjldbxtqhv:[SUA-SENHA]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
```

### Adicionar seu IP
1. Settings → Database → **Connection Pooling**
2. **Add your IP** ou desabilitar restrições (desenvolvimento)

---

## 🎯 RECOMENDAÇÃO PARA VOCÊ

### Para começar AGORA (5 minutos):

**OPÇÃO 1: PostgreSQL Local** ⭐⭐⭐

Vantagens:
- ✅ Rápido de instalar (5 min)
- ✅ Funciona offline
- ✅ Fácil de gerenciar (pgAdmin)
- ✅ Sem custos

Desvantagens:
- ❌ Precisa instalar software
- ❌ Ocupa ~200MB de disco

### Para desenvolvimento profissional:

**OPÇÃO 2: Docker** ⭐⭐

Vantagens:
- ✅ Isolado do sistema
- ✅ Fácil de recriar
- ✅ Inclui Redis
- ✅ Usado pela equipe

Desvantagens:
- ❌ Precisa Docker Desktop (~500MB)
- ❌ Requer reiniciar PC

### Para produção/colaboração:

**OPÇÃO 3: Supabase** ⭐

Vantagens:
- ✅ Cloud (acesso de qualquer lugar)
- ✅ Backups automáticos
- ✅ Já configurado

Desvantagens:
- ❌ Depende de internet
- ❌ Pode pausar após inatividade
- ❌ Firewall precisa configurar

---

## 📋 EXECUÇÃO RÁPIDA

### SE ESCOLHEU OPÇÃO 1 (PostgreSQL Local):

```powershell
# 1. Baixar e instalar
# https://www.postgresql.org/download/windows/

# 2. Após instalar, criar banco:
psql -U postgres
# Digite a senha que você criou
# No prompt do postgres:
CREATE DATABASE salao_beleza;
\q

# 3. Editar .env
# Trocar DATABASE_URL para:
# DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/salao_beleza"

# 4. Aplicar schema
cd "D:\portifolios\Sistema de gerenciamento\backend"
npm run prisma:generate
npm run prisma:migrate dev --name init

# 5. Iniciar
npm run dev
```

---

## ❓ Qual opção você prefere?

1. **Instalar PostgreSQL local** (5 min) → Mais rápido
2. **Instalar Docker** (15 min) → Mais profissional
3. **Corrigir Supabase** (2 min) → Se já tiver conta

Me diga qual você escolhe e eu te ajudo com os próximos passos! 😊
