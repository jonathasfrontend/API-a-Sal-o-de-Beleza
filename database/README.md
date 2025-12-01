# 📊 Database - Sistema de Salão de Beleza

Este diretório contém todos os arquivos relacionados ao banco de dados PostgreSQL do sistema.

## 📁 Estrutura

```
database/
├── schema.sql          # Schema completo do banco de dados
├── queries.sql         # Queries úteis e relatórios
└── README.md          # Este arquivo
```

## 🗄️ Arquivos

### `schema.sql`
Schema completo do banco de dados incluindo:
- ✅ **17 tabelas principais** (users, clients, appointments, payments, etc.)
- ✅ **8 enums customizados** (UserRole, PaymentMethod, AppointmentStatus, etc.)
- ✅ **Índices otimizados** para performance
- ✅ **Foreign keys** e constraints
- ✅ **Triggers automáticos** (updated_at, cálculo de totais, estoque)
- ✅ **5 Views materializadas** para dashboards
- ✅ **Funções úteis** (verificação de conflitos, cálculo de comissões)
- ✅ **Comentários descritivos** em todas as tabelas e colunas
- ✅ **Dados iniciais** (usuário admin)

### `queries.sql`
Coleção de queries úteis organizadas por categoria:
1. **Agendamentos** - Agenda, disponibilidade, estatísticas
2. **Financeiro** - Faturamento, comissões, despesas
3. **CRM** - Top clientes, inativos, aniversariantes
4. **Estoque** - Produtos baixos, movimentações, mais vendidos
5. **Performance** - Métricas de profissionais, horários de pico
6. **Análises** - RFM, cohort, previsões
7. **Auditoria** - Logs de ações
8. **Notificações** - Status de envios
9. **Manutenção** - Limpeza de dados antigos
10. **Validações** - Identificação de inconsistências

## 🚀 Como Usar

### 1️⃣ Criar o Banco de Dados

#### Usando Docker (Recomendado)
```bash
# Iniciar PostgreSQL e Redis
docker-compose up -d postgres redis

# Aguardar inicialização (15-30 segundos)
timeout /t 30
```

#### Usando PostgreSQL Local
```powershell
# Criar banco de dados
psql -U postgres -c "CREATE DATABASE salao_beleza;"
```

### 2️⃣ Aplicar o Schema

#### Opção A: Usando Prisma (Recomendado)
```bash
# Gerar cliente Prisma
npm run prisma:generate

# Criar migration
npm run prisma:migrate dev --name init

# Aplicar migration
npm run prisma:migrate deploy
```

#### Opção B: Aplicando SQL Diretamente
```powershell
# Windows (PowerShell)
Get-Content database/schema.sql | psql -U postgres -d salao_beleza

# Ou usando arquivo
psql -U postgres -d salao_beleza -f database/schema.sql
```

### 3️⃣ Verificar Instalação

```sql
-- Conectar ao banco
psql -U postgres -d salao_beleza

-- Listar tabelas
\dt

-- Ver estrutura de uma tabela
\d appointments

-- Verificar dados iniciais
SELECT * FROM users WHERE role = 'ADMIN';
```

### 4️⃣ Popular com Dados de Teste

```bash
# Executar seed do Prisma
npm run prisma:seed
```

## 📋 Estrutura do Banco

### Tabelas Principais

| Tabela | Descrição | Registros Típicos |
|--------|-----------|------------------|
| `users` | Usuários do sistema | Admin, recepcionistas, gerentes |
| `staff` | Profissionais | Manicures, cabeleireiros, etc |
| `clients` | Clientes | Base de clientes |
| `services` | Catálogo de serviços | Corte, manicure, coloração |
| `appointments` | Agendamentos | 100-500/mês |
| `payments` | Pagamentos | Igual a appointments |
| `commissions` | Comissões | Calculadas automaticamente |
| `products` | Estoque de produtos | Esmaltes, shampoos, etc |
| `sales` | Vendas de produtos | PDV |
| `notifications` | Notificações enviadas | WhatsApp, Email |
| `reviews` | Avaliações | Feedback dos clientes |
| `expenses` | Despesas | Aluguel, salários, contas |
| `audit_logs` | Auditoria | Todas as ações |
| `waitlist` | Lista de espera | Clientes aguardando vaga |

### Views Disponíveis

- `daily_financial_summary` - Resumo financeiro diário
- `staff_statistics` - Estatísticas de profissionais
- `client_summary` - Resumo de clientes
- `low_stock_products` - Produtos com estoque baixo
- `today_schedule` - Agenda do dia

### Funções Úteis

```sql
-- Verificar conflito de horário
SELECT check_appointment_conflict(
    'staff_id'::UUID,
    '2024-12-01 10:00:00'::TIMESTAMP,
    '2024-12-01 11:00:00'::TIMESTAMP
);

-- Calcular comissão
SELECT calculate_commission(
    'staff_id'::UUID,
    150.00
);
```

## 🔒 Segurança

### Credenciais Padrão

⚠️ **ALTERAR EM PRODUÇÃO!**

```
Email: admin@salaodebeleza.com
Senha: Admin@123
```

### Recomendações

1. **Backup Diário Automático**
```bash
# Script de backup (Linux/Mac)
pg_dump -U postgres -d salao_beleza -F c -b -v -f "backup_$(date +%Y%m%d).dump"

# Restaurar backup
pg_restore -U postgres -d salao_beleza -v backup_YYYYMMDD.dump
```

2. **Criar Usuário Específico para Aplicação**
```sql
CREATE ROLE app_user WITH LOGIN PASSWORD 'senha_forte_aqui';
GRANT CONNECT ON DATABASE salao_beleza TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;
```

3. **Habilitar SSL** em produção

4. **Configurar Retenção de Logs**
```sql
-- Logs de auditoria: 1 ano
-- Notificações: 6 meses
-- Refresh tokens: limpar expirados semanalmente
```

## 📊 Monitoramento

### Verificar Tamanho das Tabelas

```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Verificar Índices Não Utilizados

```sql
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexname NOT LIKE '%_pkey';
```

### Estatísticas de Performance

```sql
SELECT * FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

## 🧹 Manutenção

### Limpeza Semanal Recomendada

```sql
-- 1. Remover tokens expirados
DELETE FROM refresh_tokens WHERE expires_at < NOW() - INTERVAL '7 days';

-- 2. Vacuum em tabelas grandes
VACUUM ANALYZE appointments;
VACUUM ANALYZE payments;
VACUUM ANALYZE audit_logs;

-- 3. Reindex se necessário
REINDEX TABLE appointments;
```

### Limpeza Mensal

```sql
-- Arquivar notificações antigas (> 6 meses)
-- Arquivar logs de auditoria (> 1 ano)
-- Verificar integridade referencial
```

## 📈 Otimizações

### Configurações PostgreSQL Recomendadas

```ini
# postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB
```

### Índices Compostos Importantes

Já criados no schema:
- `(staff_id, start_time)` em appointments
- `(entity, entity_id)` em audit_logs
- Índices GIN para busca de texto em `name`
- Índices em todas as foreign keys

## 🆘 Troubleshooting

### Erro: "relation does not exist"
```bash
# Recriar schema
npm run prisma:migrate reset
```

### Performance Lenta
```sql
-- Verificar queries lentas
SELECT * FROM pg_stat_activity WHERE state = 'active';

-- Analisar plano de execução
EXPLAIN ANALYZE SELECT ...;
```

### Conexões Excessivas
```sql
-- Ver conexões ativas
SELECT count(*) FROM pg_stat_activity;

-- Matar conexões inativas
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'idle' 
  AND state_change < NOW() - INTERVAL '1 hour';
```

## 📚 Recursos Adicionais

- [Documentação PostgreSQL](https://www.postgresql.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [SQL Performance Explained](https://sql-performance-explained.com/)

## 🔄 Migrations

As migrations são gerenciadas pelo Prisma. Histórico em `prisma/migrations/`.

```bash
# Criar nova migration
npm run prisma:migrate dev --name descricao_da_mudanca

# Aplicar migrations pendentes
npm run prisma:migrate deploy

# Resetar banco (CUIDADO!)
npm run prisma:migrate reset
```

---

**Última atualização:** 28/11/2025
**Versão do Schema:** 1.0.0
**PostgreSQL:** 14+ recomendado
