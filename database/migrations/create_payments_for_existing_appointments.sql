-- =============================================
-- MIGRAÇÃO DE DADOS: Criar Pagamentos para Agendamentos Existentes
-- =============================================
-- Data: 03/12/2024
-- Descrição: Cria registros de Payment para todos os Appointments que não possuem pagamento associado

-- =============================================
-- IMPORTANTE: Execute este script apenas UMA vez!
-- =============================================

-- Verificar quantos agendamentos não possuem pagamento
SELECT 
  COUNT(*) as total_sem_pagamento
FROM appointments a
WHERE NOT EXISTS (
  SELECT 1 FROM payments p WHERE p.appointment_id = a.id
);

-- =============================================
-- CRIAR PAGAMENTOS PARA AGENDAMENTOS EXISTENTES
-- =============================================

-- Inserir pagamentos para agendamentos SEM pagamento
-- O status será baseado no campo isPaid existente
INSERT INTO payments (
  id,
  appointment_id,
  client_id,
  amount,
  method,
  status,
  paid_at,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid() as id,
  a.id as appointment_id,
  a.client_id,
  a.total_amount as amount,
  'CASH' as method,
  CASE 
    WHEN a.is_paid = true THEN 'PAID'::payment_status
    WHEN a.status = 'CANCELLED'::appointment_status THEN 'CANCELLED'::payment_status
    ELSE 'PENDING'::payment_status
  END as status,
  CASE 
    WHEN a.is_paid = true THEN a.updated_at
    ELSE NULL
  END as paid_at,
  a.created_at,
  NOW() as updated_at
FROM appointments a
WHERE NOT EXISTS (
  SELECT 1 FROM payments p WHERE p.appointment_id = a.id
);

-- =============================================
-- VERIFICAÇÃO PÓS-MIGRAÇÃO
-- =============================================

-- Verificar agendamentos sem pagamento (deve ser 0)
SELECT 
  COUNT(*) as agendamentos_sem_pagamento
FROM appointments a
WHERE NOT EXISTS (
  SELECT 1 FROM payments p WHERE p.appointment_id = a.id
);

-- Verificar distribuição de status de pagamento
SELECT 
  p.status,
  COUNT(*) as quantidade,
  SUM(p.amount) as valor_total
FROM payments p
GROUP BY p.status
ORDER BY quantidade DESC;

-- Verificar agendamentos com seus pagamentos
SELECT 
  a.id as appointment_id,
  a.status as appointment_status,
  a.is_paid,
  a.total_amount,
  p.id as payment_id,
  p.status as payment_status,
  p.method,
  p.amount as payment_amount
FROM appointments a
LEFT JOIN payments p ON p.appointment_id = a.id
ORDER BY a.created_at DESC
LIMIT 20;

-- =============================================
-- RELATÓRIO FINAL
-- =============================================

-- Total de agendamentos e pagamentos
SELECT 
  (SELECT COUNT(*) FROM appointments) as total_agendamentos,
  (SELECT COUNT(*) FROM payments WHERE appointment_id IS NOT NULL) as total_pagamentos_agendamento,
  (SELECT COUNT(*) FROM payments WHERE appointment_id IS NULL) as total_pagamentos_avulsos;

-- Status de pagamentos por tipo de agendamento
SELECT 
  a.status as appointment_status,
  p.status as payment_status,
  COUNT(*) as quantidade,
  SUM(p.amount) as valor_total
FROM appointments a
INNER JOIN payments p ON p.appointment_id = a.id
GROUP BY a.status, p.status
ORDER BY a.status, p.status;

-- =============================================
-- OBSERVAÇÕES
-- =============================================

/*
1. Este script cria pagamentos apenas para agendamentos que não possuem nenhum pagamento associado.

2. A lógica de status aplicada:
   - Se isPaid = true → status = PAID
   - Se appointment.status = CANCELLED → status = CANCELLED
   - Caso contrário → status = PENDING

3. O método de pagamento padrão é CASH.

4. A data de pagamento (paid_at) é definida apenas para pagamentos com status PAID.

5. Agendamentos futuros receberão status PENDING automaticamente.

6. Execute as queries de verificação para validar a migração.

7. Considere fazer backup do banco de dados antes de executar!
*/
