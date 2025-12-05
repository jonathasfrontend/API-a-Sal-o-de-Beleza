# 🔄 Guia de Migração - Sistema de Pagamentos

## 📋 Contexto

A refatoração do sistema de pagamentos introduziu a criação automática de registros de `Payment` quando um `Appointment` é criado. No entanto, agendamentos criados antes dessa atualização não possuem pagamentos associados.

Este guia fornece instruções para migrar os dados existentes.

## ⚠️ IMPORTANTE: Antes de Começar

1. **Faça backup do banco de dados!**
   ```bash
   pg_dump -U seu_usuario -d nome_do_banco > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Execute em ambiente de desenvolvimento primeiro!**

3. **Verifique se o servidor está parado** (opcional, mas recomendado)

## 🚀 Opção 1: Migração via Script TypeScript (Recomendado)

### Passo 1: Executar o Script

```bash
cd backend
npm run migrate:payments
```

ou

```bash
cd backend
npx tsx scripts/migrate-payments.ts
```

### Passo 2: Verificar Resultado

O script exibirá:
- Total de agendamentos
- Quantos já tinham pagamento
- Quantos não tinham pagamento
- Quantos pagamentos foram criados
- Distribuição por status
- Exemplos de agendamentos com pagamentos

### Exemplo de Saída

```
🚀 Iniciando migração de pagamentos...

📊 Total de agendamentos: 150
✅ Agendamentos com pagamento: 0
⚠️  Agendamentos sem pagamento: 150

💰 Criando pagamentos...

   Progresso: 10/150
   Progresso: 20/150
   ...
   Progresso: 150/150

✅ Migração concluída!

╔════════════════════════════════════════════════════╗
║  ESTATÍSTICAS DA MIGRAÇÃO                          ║
╚════════════════════════════════════════════════════╝
Total de agendamentos: 150
Agendamentos com pagamento: 0
Agendamentos sem pagamento: 150
Pagamentos criados: 150
Erros: 0

🔍 Verificando migração...

Agendamentos sem pagamento: 0

📊 Distribuição de status de pagamento:
   PAID: 45 pagamentos | Total: R$ 6750.00
   PENDING: 95 pagamentos | Total: R$ 14250.00
   CANCELLED: 10 pagamentos | Total: R$ 1500.00

✨ Migração finalizada com sucesso!
```

## 🗄️ Opção 2: Migração via SQL Direto

### Passo 1: Conectar ao Banco

```bash
psql -U seu_usuario -d nome_do_banco
```

### Passo 2: Executar Script SQL

```bash
\i backend/database/migrations/create_payments_for_existing_appointments.sql
```

ou copie e cole o conteúdo do arquivo SQL diretamente.

### Passo 3: Verificar Resultado

Execute as queries de verificação incluídas no arquivo SQL:

```sql
-- Verificar agendamentos sem pagamento (deve ser 0)
SELECT COUNT(*) FROM appointments a
WHERE NOT EXISTS (
  SELECT 1 FROM payments p WHERE p.appointment_id = a.id
);

-- Verificar distribuição de status
SELECT status, COUNT(*), SUM(amount) 
FROM payments 
GROUP BY status;
```

## 🧪 Testes Pós-Migração

### 1. Teste via API

```bash
# Listar agendamentos (deve incluir payments)
curl -X GET http://localhost:3000/api/v1/appointments \
  -H "Authorization: Bearer SEU_TOKEN"
```

Resposta esperada:
```json
{
  "status": "success",
  "data": [
    {
      "id": "...",
      "totalAmount": 150.00,
      "payments": [
        {
          "id": "...",
          "status": "PENDING",
          "amount": 150.00,
          "method": "CASH"
        }
      ]
    }
  ]
}
```

### 2. Teste via Prisma Studio

```bash
cd backend
npm run prisma:studio
```

Navegue até a tabela `Payment` e verifique:
- Todos os agendamentos têm pelo menos um pagamento
- Os status estão corretos
- Os valores batem com os agendamentos

### 3. Teste no Frontend

1. Acesse a página de agendamentos
2. Verifique se todos mostram status de pagamento
3. Verifique se os badges de status aparecem corretamente

## 📊 Lógica de Status Aplicada

O script determina o status do pagamento com base em:

```typescript
if (appointment.isPaid === true) {
  status = 'PAID'
  paidAt = appointment.updatedAt
} else if (appointment.status === 'CANCELLED') {
  status = 'CANCELLED'
} else {
  status = 'PENDING'
}
```

| Condição | Status do Payment | Data de Pagamento |
|----------|-------------------|-------------------|
| `isPaid = true` | `PAID` | `updatedAt` do appointment |
| `status = CANCELLED` | `CANCELLED` | `null` |
| Outros casos | `PENDING` | `null` |

## 🔍 Troubleshooting

### Erro: "Cannot find module '@prisma/client'"

```bash
cd backend
npm install
npm run prisma:generate
```

### Erro: "Database connection failed"

Verifique se:
1. O PostgreSQL está rodando
2. As credenciais em `.env` estão corretas
3. O banco de dados existe

### Alguns pagamentos não foram criados

Verifique os logs do script para identificar quais agendamentos falharam e o motivo.

### Status inconsistente

Execute novamente o script - ele pula agendamentos que já têm pagamento.

## 📝 Rollback (Se Necessário)

Se algo der errado, você pode reverter:

### Via SQL

```sql
-- CUIDADO: Isso remove TODOS os pagamentos vinculados a agendamentos!
DELETE FROM payments WHERE appointment_id IS NOT NULL;
```

### Via Backup

```bash
# Restaurar backup
psql -U seu_usuario -d nome_do_banco < backup_arquivo.sql
```

## ✅ Checklist de Validação

Após a migração, verifique:

- [ ] Todos os agendamentos têm pelo menos um pagamento
- [ ] Agendamentos com `isPaid = true` têm payment com status `PAID`
- [ ] Agendamentos cancelados têm payment com status `CANCELLED`
- [ ] API retorna payments corretamente
- [ ] Frontend exibe status de pagamento
- [ ] Novos agendamentos continuam criando payments automaticamente

## 🎯 Próximos Passos

Após a migração bem-sucedida:

1. **Teste criar novos agendamentos** e verificar se payments são criados automaticamente
2. **Teste cancelar agendamentos** e verificar se payments são cancelados
3. **Implemente a tela de pagamentos** usando os exemplos em `frontend/src/examples/payment-status-examples.tsx`
4. **Considere remover o campo `isPaid`** do schema em futuras versões (após garantir que toda a aplicação usa o novo sistema)

## 📚 Documentação Relacionada

- [Documentação Técnica](./PAYMENT_STATUS_IMPLEMENTATION.md)
- [Resumo Executivo](./REFATORACAO_PAGAMENTOS_RESUMO.md)
- [Exemplos de Código](../frontend/src/examples/payment-status-examples.tsx)

## 💡 Dúvidas?

Se encontrar problemas:
1. Verifique os logs do script
2. Execute as queries de verificação SQL
3. Consulte a documentação técnica
4. Reverta para o backup se necessário

---

**⚠️ LEMBRE-SE: Sempre faça backup antes de executar migrações em produção!**
