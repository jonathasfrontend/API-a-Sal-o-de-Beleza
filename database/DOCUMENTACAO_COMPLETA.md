# 📊 Documentação Completa do Banco de Dados

Gerado em: **28 de Novembro de 2025**

---

## 📑 Índice

1. [Visão Geral](#visão-geral)
2. [Arquivos Disponíveis](#arquivos-disponíveis)
3. [Como Usar](#como-usar)
4. [Estrutura Completa](#estrutura-completa)
5. [Dados Iniciais](#dados-iniciais)
6. [Backup e Restore](#backup-e-restore)
7. [Queries Prontas](#queries-prontas)

---

## 🎯 Visão Geral

Este sistema de gerenciamento de salão de beleza possui um banco de dados PostgreSQL completo com:

- ✅ **17 Tabelas** principais
- ✅ **8 Tipos Enumerados** (Enums)
- ✅ **50+ Índices** otimizados
- ✅ **15+ Foreign Keys** com integridade referencial
- ✅ **3 Triggers** automáticos
- ✅ **5 Views** materializadas
- ✅ **2 Funções** utilitárias
- ✅ **100+ Queries** prontas para uso

### 📊 Principais Entidades

```
USUÁRIOS E AUTENTICAÇÃO
├── users (usuários do sistema)
├── refresh_tokens (tokens JWT)
└── staff (profissionais)

CLIENTES E CRM
├── clients (cadastro de clientes)
├── reviews (avaliações)
└── waitlist (lista de espera)

AGENDAMENTOS
├── appointments (agendamentos)
├── services (catálogo de serviços)
└── notifications (notificações enviadas)

FINANCEIRO
├── payments (pagamentos)
├── commissions (comissões)
└── expenses (despesas)

ESTOQUE E VENDAS
├── products (produtos)
├── stock_movements (movimentações)
├── sales (vendas)
└── sale_items (itens vendidos)

SEGURANÇA
└── audit_logs (auditoria completa)
```

---

## 📁 Arquivos Disponíveis

### 1. `schema.sql` (3.200+ linhas)
**O arquivo principal do banco de dados**

Contém:
- ✅ Definição de todas as 17 tabelas
- ✅ Enums customizados (UserRole, PaymentMethod, etc.)
- ✅ Índices otimizados para performance
- ✅ Foreign Keys e Constraints
- ✅ Triggers automáticos
- ✅ Views materializadas
- ✅ Funções utilitárias
- ✅ Comentários descritivos em todas as tabelas
- ✅ Usuário admin padrão

**Como usar:**
```bash
# Aplicar schema completo
psql -U postgres -d salao_beleza -f database/schema.sql
```

### 2. `queries.sql` (1.000+ linhas)
**Biblioteca completa de queries prontas**

Organizado em 10 categorias:

#### 📅 1. Agendamentos
- Agenda completa do dia
- Próximos agendamentos (24h)
- Horários disponíveis
- Taxa de no-show por profissional

#### 💰 2. Financeiro
- Faturamento diário/mensal
- Ticket médio
- Comissões pendentes
- Despesas vs Receitas
- Serviços mais rentáveis

#### 👥 3. CRM
- Top 10 clientes por valor
- Clientes inativos (>60 dias)
- Aniversariantes do mês
- Alto índice de no-show
- Segmentação (VIP, Frequente, Regular, Novo)

#### 📦 4. Estoque
- Produtos com estoque baixo
- Movimentação por produto
- Produtos mais vendidos
- Valor total do estoque

#### 📈 5. Performance
- Performance de profissionais
- Horários de pico
- Taxa de conversão

#### 🔍 6. Análises Avançadas
- Análise de retenção (cohort)
- Análise RFM (Recency, Frequency, Monetary)
- Previsão de demanda por dia da semana

#### 🔒 7. Auditoria
- Últimas ações no sistema
- Alterações por entidade

#### 📬 8. Notificações
- Status por canal
- Notificações com falha

#### 🧹 9. Limpeza
- Remover tokens expirados
- Arquivar dados antigos

#### ⚠️ 10. Validações
- Agendamentos sem pagamento
- Comissões órfãs
- Produtos com estoque negativo
- Clientes duplicados

**Como usar:**
```sql
-- Copiar query desejada e executar no psql ou cliente PostgreSQL
SELECT * FROM daily_financial_summary WHERE date >= NOW() - INTERVAL '30 days';
```

### 3. `migrations.sql`
**Migrations manuais e melhorias futuras**

Contém:
- ✅ Índices GIN para busca de texto (pg_trgm)
- ✅ Particionamento de audit_logs (por mês)
- ✅ Campos de localização (GPS) - opcional
- ✅ Histórico de preços
- ✅ Sistema de pacotes/combos
- ✅ Campanhas e cupons
- ✅ Agendamentos recorrentes
- ✅ Índices de performance adicionais
- ✅ Campos de integração externa
- ✅ Procedimentos de rollback

### 4. `backup.sh` (Linux/Mac)
Script automatizado de backup

**Recursos:**
- Backup em formato comprimido (gzip)
- Retenção automática (30 dias)
- Cálculo de tamanho
- Log de execução

**Como usar:**
```bash
chmod +x database/backup.sh
./database/backup.sh
```

**Agendar backup diário (cron):**
```bash
# Adicionar ao crontab
0 2 * * * /caminho/para/database/backup.sh >> /var/log/backup.log 2>&1
```

### 5. `backup.ps1` (Windows)
Script automatizado para PowerShell

**Como usar:**
```powershell
.\database\backup.ps1
```

**Agendar backup diário (Task Scheduler):**
1. Abrir Agendador de Tarefas
2. Criar Tarefa Básica
3. Ação: "Iniciar um programa"
4. Programa: `powershell.exe`
5. Argumentos: `-File "D:\caminho\para\backup.ps1"`

### 6. `DIAGRAM.md`
**Diagrama de Relacionamento Completo**

Inclui:
- ✅ Diagrama ER em Mermaid
- ✅ Documentação de todos os Enums
- ✅ Lista de relacionamentos
- ✅ Índices importantes
- ✅ Constraints e regras
- ✅ Triggers automáticos
- ✅ Views materializadas
- ✅ Estratégias de segurança (LGPD)
- ✅ Planos de escalabilidade

### 7. `README.md` (Database)
Documentação completa do diretório database

---

## 🚀 Como Usar

### Setup Inicial Completo

#### Passo 1: Criar o Banco de Dados

**Opção A - Docker (Recomendado):**
```bash
# Iniciar PostgreSQL e Redis
docker-compose up -d postgres redis

# Aguardar 30 segundos
sleep 30
```

**Opção B - PostgreSQL Local:**
```bash
psql -U postgres -c "CREATE DATABASE salao_beleza;"
```

#### Passo 2: Aplicar o Schema

**Opção A - Via Prisma (Recomendado):**
```bash
npm run prisma:generate
npm run prisma:migrate dev --name init
```

**Opção B - SQL Direto:**
```bash
psql -U postgres -d salao_beleza -f database/schema.sql
```

#### Passo 3: Verificar Instalação

```sql
-- Conectar ao banco
psql -U postgres -d salao_beleza

-- Listar tabelas
\dt

-- Verificar views
\dv

-- Verificar usuário admin
SELECT * FROM users WHERE role = 'ADMIN';
```

#### Passo 4: Popular com Dados de Teste (Opcional)

```bash
npm run prisma:seed
```

### Uso Diário

#### Executar Queries de Relatório

```sql
-- Conectar ao banco
psql -U postgres -d salao_beleza

-- Copiar e executar queries de queries.sql

-- Exemplo: Faturamento dos últimos 30 dias
SELECT 
    DATE(created_at) as date,
    SUM(amount) as total_revenue
FROM payments
WHERE status = 'PAID'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

#### Fazer Backup Manual

```bash
# Linux/Mac
./database/backup.sh

# Windows
.\database\backup.ps1
```

#### Restaurar Backup

```bash
# Descompactar
gunzip backup_salao_beleza_20241128.dump.gz

# Restaurar
pg_restore -U postgres -d salao_beleza -v backup_salao_beleza_20241128.dump
```

---

## 📊 Estrutura Completa

### Tabelas por Categoria

#### 🔐 Autenticação (2 tabelas)
```sql
users              -- Usuários do sistema
refresh_tokens     -- Tokens JWT
```

#### 👨‍💼 Profissionais (1 tabela)
```sql
staff              -- Dados dos profissionais
```

#### 👥 Clientes (3 tabelas)
```sql
clients            -- Cadastro de clientes
reviews            -- Avaliações
waitlist           -- Lista de espera
```

#### 📅 Agendamentos (3 tabelas)
```sql
services           -- Catálogo de serviços
appointments       -- Agendamentos
notifications      -- Notificações enviadas
```

#### 💰 Financeiro (3 tabelas)
```sql
payments           -- Pagamentos
commissions        -- Comissões
expenses           -- Despesas
```

#### 📦 Estoque (4 tabelas)
```sql
products           -- Produtos
stock_movements    -- Movimentações
sales              -- Vendas (PDV)
sale_items         -- Itens vendidos
```

#### 🔒 Segurança (1 tabela)
```sql
audit_logs         -- Auditoria completa
```

### Enums Definidos (8)

```typescript
enum UserRole {
  ADMIN, MANAGER, RECEPTION, STAFF, CLIENT
}

enum CommissionType {
  PERCENT, FIXED, TABLE
}

enum AppointmentStatus {
  SCHEDULED, CONFIRMED, IN_PROGRESS, 
  COMPLETED, CANCELLED, NO_SHOW
}

enum PaymentMethod {
  CASH, DEBIT, CREDIT, PIX, LINK, WALLET
}

enum PaymentStatus {
  PENDING, PAID, PARTIAL, REFUNDED, CANCELLED
}

enum NotificationType {
  CONFIRMATION, REMINDER_24H, REMINDER_1H,
  CANCELLATION, PROMOTION, BIRTHDAY, REACTIVATION
}

enum NotificationChannel {
  WHATSAPP, EMAIL, SMS, PUSH
}

enum NotificationStatus {
  PENDING, SENT, DELIVERED, FAILED
}
```

---

## 👤 Dados Iniciais

### Usuário Admin Padrão

```
Email: admin@salaodebeleza.com
Senha: Admin@123
Role: ADMIN
```

⚠️ **IMPORTANTE:** Alterar a senha em produção!

```sql
-- Alterar senha do admin
UPDATE users 
SET password_hash = '$2b$12$nova_hash_bcrypt_aqui'
WHERE email = 'admin@salaodebeleza.com';
```

---

## 💾 Backup e Restore

### Estratégia Recomendada: 3-2-1

- **3** cópias dos dados
- **2** tipos de mídia diferentes
- **1** cópia off-site (nuvem)

### Backup Automatizado

#### Linux/Mac (cron)
```bash
# Editar crontab
crontab -e

# Adicionar linha (backup diário às 2h da manhã)
0 2 * * * /caminho/completo/para/database/backup.sh >> /var/log/backup-salao.log 2>&1
```

#### Windows (Task Scheduler)
```powershell
# Criar tarefa agendada
$action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument '-File "D:\caminho\backup.ps1"'
$trigger = New-ScheduledTaskTrigger -Daily -At 2am
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "Backup Salão" -Description "Backup diário do banco"
```

### Restore Manual

```bash
# 1. Criar novo banco (se necessário)
createdb -U postgres salao_beleza_restore

# 2. Restaurar backup
pg_restore -U postgres -d salao_beleza_restore -v backup_20241128.dump

# 3. Verificar dados
psql -U postgres -d salao_beleza_restore -c "SELECT COUNT(*) FROM users;"
```

---

## 📋 Queries Prontas - Exemplos

### 💰 Top 10 Clientes por Faturamento

```sql
SELECT 
    c.name,
    c.phone,
    COUNT(DISTINCT a.id) as total_appointments,
    SUM(a.total_amount) as lifetime_value,
    MAX(a.start_time) as last_visit
FROM clients c
INNER JOIN appointments a ON c.id = a.client_id
WHERE a.status = 'COMPLETED'
GROUP BY c.id, c.name, c.phone
ORDER BY lifetime_value DESC
LIMIT 10;
```

### 📊 Faturamento Mensal

```sql
SELECT 
    TO_CHAR(created_at, 'YYYY-MM') as month,
    COUNT(*) as total_payments,
    SUM(amount) as revenue,
    ROUND(AVG(amount), 2) as avg_ticket
FROM payments
WHERE status = 'PAID'
GROUP BY TO_CHAR(created_at, 'YYYY-MM')
ORDER BY month DESC;
```

### 👥 Clientes Inativos (>60 dias)

```sql
SELECT 
    c.name,
    c.phone,
    c.email,
    MAX(a.start_time) as last_appointment,
    COUNT(a.id) as total_appointments
FROM clients c
LEFT JOIN appointments a ON c.id = a.client_id AND a.status = 'COMPLETED'
GROUP BY c.id, c.name, c.phone, c.email
HAVING MAX(a.start_time) < NOW() - INTERVAL '60 days'
   OR MAX(a.start_time) IS NULL
ORDER BY last_appointment DESC NULLS LAST;
```

### 📦 Produtos com Estoque Baixo

```sql
SELECT 
    name,
    sku,
    category,
    quantity,
    reorder_threshold,
    (reorder_threshold - quantity) as units_to_order,
    supplier
FROM products
WHERE quantity <= reorder_threshold
  AND is_active = true
ORDER BY quantity ASC;
```

### 📈 Performance de Profissionais (Mês Atual)

```sql
SELECT 
    u.name,
    COUNT(CASE WHEN a.status = 'COMPLETED' THEN 1 END) as completed,
    COUNT(CASE WHEN a.status = 'CANCELLED' THEN 1 END) as cancelled,
    COUNT(CASE WHEN a.status = 'NO_SHOW' THEN 1 END) as no_shows,
    SUM(CASE WHEN a.status = 'COMPLETED' THEN a.total_amount ELSE 0 END) as revenue,
    ROUND(AVG(CASE WHEN r.rating IS NOT NULL THEN r.rating END), 2) as avg_rating
FROM staff s
INNER JOIN users u ON s.user_id = u.id
LEFT JOIN appointments a ON s.id = a.staff_id 
    AND DATE_TRUNC('month', a.start_time) = DATE_TRUNC('month', NOW())
LEFT JOIN clients c ON a.client_id = c.id
LEFT JOIN reviews r ON c.id = r.client_id 
    AND DATE_TRUNC('month', r.created_at) = DATE_TRUNC('month', NOW())
GROUP BY u.name
ORDER BY revenue DESC;
```

---

## 🔧 Manutenção

### Limpeza Semanal

```sql
-- 1. Remover tokens expirados
DELETE FROM refresh_tokens 
WHERE expires_at < NOW() - INTERVAL '7 days';

-- 2. Vacuum em tabelas grandes
VACUUM ANALYZE appointments;
VACUUM ANALYZE payments;
VACUUM ANALYZE audit_logs;
```

### Limpeza Mensal

```sql
-- Arquivar notificações antigas (>6 meses)
-- Criar tabela de arquivo primeiro
CREATE TABLE notifications_archive AS SELECT * FROM notifications WHERE 1=0;

INSERT INTO notifications_archive
SELECT * FROM notifications
WHERE created_at < NOW() - INTERVAL '6 months';

DELETE FROM notifications
WHERE created_at < NOW() - INTERVAL '6 months';
```

### Monitoramento

```sql
-- Tamanho das tabelas
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Índices não utilizados
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexname NOT LIKE '%_pkey';
```

---

## 🎓 Recursos Adicionais

### Documentação
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [SQL Performance Explained](https://sql-performance-explained.com/)

### Ferramentas Recomendadas
- **pgAdmin** - Interface gráfica para PostgreSQL
- **DBeaver** - Cliente SQL multiplataforma
- **DataGrip** - IDE para databases (JetBrains)
- **Postico** - Cliente PostgreSQL para Mac

---

## ✅ Checklist de Produção

Antes de colocar em produção:

- [ ] Alterar senha do admin padrão
- [ ] Configurar backups automáticos
- [ ] Habilitar SSL/TLS no PostgreSQL
- [ ] Configurar firewall (apenas IPs permitidos)
- [ ] Criar usuário específico para aplicação (não usar postgres)
- [ ] Configurar retenção de dados (LGPD)
- [ ] Testar restore de backup
- [ ] Configurar monitoramento (CPU, disco, conexões)
- [ ] Revisar índices para queries mais usadas
- [ ] Configurar log rotation
- [ ] Documentar procedimentos de emergência

---

**Versão:** 1.0.0  
**Data:** 28 de Novembro de 2025  
**Autor:** Sistema Gerado por IA  
**PostgreSQL:** 14+ recomendado  
**Total de Linhas SQL:** ~5.000+
