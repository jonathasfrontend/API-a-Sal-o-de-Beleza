-- =============================================
-- QUERIES ÚTEIS - SISTEMA DE SALÃO DE BELEZA
-- =============================================

-- =============================================
-- 1. CONSULTAS DE AGENDAMENTOS
-- =============================================

-- Agenda completa de um profissional para hoje
SELECT 
    a.id,
    a.start_time,
    a.end_time,
    a.status,
    c.name as client_name,
    c.phone as client_phone,
    a.services,
    a.total_amount,
    a.is_paid
FROM appointments a
INNER JOIN clients c ON a.client_id = c.id
WHERE a.staff_id = 'SEU_STAFF_ID'
  AND DATE(a.start_time) = CURRENT_DATE
ORDER BY a.start_time;

-- Próximos agendamentos confirmados (próximas 24h)
SELECT 
    a.start_time,
    c.name as client,
    u.name as staff,
    a.services->0->>'name' as first_service,
    a.total_amount
FROM appointments a
INNER JOIN clients c ON a.client_id = c.id
INNER JOIN staff s ON a.staff_id = s.id
INNER JOIN users u ON s.user_id = u.id
WHERE a.status IN ('SCHEDULED', 'CONFIRMED')
  AND a.start_time BETWEEN NOW() AND NOW() + INTERVAL '24 hours'
ORDER BY a.start_time;

-- Horários disponíveis de um profissional para um dia
WITH time_slots AS (
    SELECT generate_series(
        '2024-12-01 09:00:00'::timestamp,
        '2024-12-01 18:00:00'::timestamp,
        '30 minutes'::interval
    ) AS slot_time
)
SELECT ts.slot_time
FROM time_slots ts
WHERE NOT EXISTS (
    SELECT 1 
    FROM appointments a
    WHERE a.staff_id = 'SEU_STAFF_ID'
      AND a.status NOT IN ('CANCELLED', 'NO_SHOW')
      AND ts.slot_time >= a.start_time 
      AND ts.slot_time < a.end_time
)
ORDER BY ts.slot_time;

-- Taxa de no-show por profissional
SELECT 
    u.name,
    COUNT(CASE WHEN a.status = 'NO_SHOW' THEN 1 END) as no_shows,
    COUNT(*) as total_appointments,
    ROUND(
        COUNT(CASE WHEN a.status = 'NO_SHOW' THEN 1 END)::NUMERIC / 
        NULLIF(COUNT(*), 0) * 100, 
        2
    ) as no_show_rate
FROM appointments a
INNER JOIN staff s ON a.staff_id = s.id
INNER JOIN users u ON s.user_id = u.id
WHERE a.start_time >= NOW() - INTERVAL '30 days'
GROUP BY u.name
ORDER BY no_show_rate DESC;

-- =============================================
-- 2. CONSULTAS FINANCEIRAS
-- =============================================

-- Faturamento diário dos últimos 30 dias
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_payments,
    SUM(amount) as total_revenue,
    SUM(CASE WHEN method = 'CASH' THEN amount ELSE 0 END) as cash,
    SUM(CASE WHEN method = 'PIX' THEN amount ELSE 0 END) as pix,
    SUM(CASE WHEN method = 'CREDIT' THEN amount ELSE 0 END) as credit,
    SUM(CASE WHEN method = 'DEBIT' THEN amount ELSE 0 END) as debit
FROM payments
WHERE status = 'PAID'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Ticket médio por período
SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as total_transactions,
    SUM(amount) as total_revenue,
    ROUND(AVG(amount), 2) as average_ticket
FROM payments
WHERE status = 'PAID'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- Comissões pendentes por profissional
SELECT 
    u.name as professional,
    COUNT(*) as pending_commissions,
    SUM(c.amount) as total_pending
FROM commissions c
INNER JOIN staff s ON c.staff_id = s.id
INNER JOIN users u ON s.user_id = u.id
WHERE c.is_paid = false
GROUP BY u.name
ORDER BY total_pending DESC;

-- Despesas vs Receitas (mês atual)
SELECT 
    'Receitas' as type,
    SUM(amount) as total
FROM payments
WHERE status = 'PAID'
  AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())
UNION ALL
SELECT 
    'Despesas' as type,
    SUM(amount) as total
FROM expenses
WHERE is_paid = true
  AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW());

-- Serviços mais rentáveis
SELECT 
    service->>'name' as service_name,
    COUNT(*) as times_sold,
    SUM((service->>'price')::DECIMAL) as total_revenue,
    ROUND(AVG((service->>'price')::DECIMAL), 2) as avg_price
FROM appointments a,
     jsonb_array_elements(a.services) as service
WHERE a.status = 'COMPLETED'
  AND a.start_time >= NOW() - INTERVAL '30 days'
GROUP BY service->>'name'
ORDER BY total_revenue DESC
LIMIT 10;

-- =============================================
-- 3. CONSULTAS DE CLIENTES (CRM)
-- =============================================

-- Top 10 clientes por valor gasto
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

-- Clientes inativos (sem agendamento há mais de 60 dias)
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

-- Clientes aniversariantes do mês
SELECT 
    name,
    phone,
    email,
    birthdate,
    EXTRACT(DAY FROM birthdate) as day
FROM clients
WHERE EXTRACT(MONTH FROM birthdate) = EXTRACT(MONTH FROM NOW())
  AND consent_lgpd = true
ORDER BY EXTRACT(DAY FROM birthdate);

-- Clientes com alto índice de no-show
SELECT 
    name,
    phone,
    no_show_count,
    is_blocked,
    COUNT(a.id) as total_appointments,
    ROUND(
        no_show_count::NUMERIC / NULLIF(COUNT(a.id), 0) * 100,
        2
    ) as no_show_percentage
FROM clients c
LEFT JOIN appointments a ON c.id = a.client_id
WHERE no_show_count > 0
GROUP BY c.id, c.name, c.phone, c.no_show_count, c.is_blocked
HAVING COUNT(a.id) > 0
ORDER BY no_show_percentage DESC;

-- Segmentação de clientes por frequência
SELECT 
    CASE 
        WHEN appointment_count >= 10 THEN 'VIP'
        WHEN appointment_count >= 5 THEN 'Frequente'
        WHEN appointment_count >= 2 THEN 'Regular'
        ELSE 'Novo'
    END as segment,
    COUNT(*) as client_count,
    SUM(lifetime_value) as total_value,
    ROUND(AVG(lifetime_value), 2) as avg_value
FROM (
    SELECT 
        c.id,
        COUNT(a.id) as appointment_count,
        SUM(COALESCE(a.total_amount, 0)) as lifetime_value
    FROM clients c
    LEFT JOIN appointments a ON c.id = a.client_id AND a.status = 'COMPLETED'
    GROUP BY c.id
) client_stats
GROUP BY segment
ORDER BY 
    CASE segment
        WHEN 'VIP' THEN 1
        WHEN 'Frequente' THEN 2
        WHEN 'Regular' THEN 3
        ELSE 4
    END;

-- =============================================
-- 4. CONSULTAS DE ESTOQUE
-- =============================================

-- Produtos com estoque baixo
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

-- Movimentação de estoque por produto (último mês)
SELECT 
    p.name,
    p.sku,
    SUM(CASE WHEN sm.type = 'IN' THEN sm.quantity ELSE 0 END) as entries,
    SUM(CASE WHEN sm.type = 'OUT' THEN sm.quantity ELSE 0 END) as exits,
    SUM(CASE WHEN sm.type = 'ADJUSTMENT' THEN sm.quantity ELSE 0 END) as adjustments,
    p.quantity as current_stock
FROM products p
LEFT JOIN stock_movements sm ON p.id = sm.product_id 
    AND sm.created_at >= NOW() - INTERVAL '30 days'
GROUP BY p.id, p.name, p.sku, p.quantity
ORDER BY exits DESC;

-- Produtos mais vendidos
SELECT 
    p.name,
    COUNT(si.id) as times_sold,
    SUM(si.quantity) as total_quantity,
    SUM(si.total) as total_revenue
FROM products p
INNER JOIN sale_items si ON p.id = si.product_id
INNER JOIN sales s ON si.sale_id = s.id
WHERE s.created_at >= NOW() - INTERVAL '30 days'
GROUP BY p.id, p.name
ORDER BY total_revenue DESC
LIMIT 10;

-- Valor total do estoque
SELECT 
    category,
    COUNT(*) as product_count,
    SUM(quantity) as total_units,
    SUM(quantity * cost_price) as cost_value,
    SUM(quantity * sale_price) as sale_value,
    SUM(quantity * (sale_price - cost_price)) as potential_profit
FROM products
WHERE is_active = true
GROUP BY category
ORDER BY cost_value DESC;

-- =============================================
-- 5. RELATÓRIOS DE PERFORMANCE
-- =============================================

-- Performance de profissionais (mês atual)
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

-- Horários de pico
SELECT 
    EXTRACT(HOUR FROM start_time) as hour,
    COUNT(*) as appointment_count,
    SUM(total_amount) as revenue
FROM appointments
WHERE status = 'COMPLETED'
  AND start_time >= NOW() - INTERVAL '30 days'
GROUP BY EXTRACT(HOUR FROM start_time)
ORDER BY hour;

-- Taxa de conversão de agendamentos
SELECT 
    DATE_TRUNC('week', created_at) as week,
    COUNT(*) as total_appointments,
    COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed,
    COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelled,
    COUNT(CASE WHEN status = 'NO_SHOW' THEN 1 END) as no_shows,
    ROUND(
        COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END)::NUMERIC / 
        NULLIF(COUNT(*), 0) * 100,
        2
    ) as completion_rate
FROM appointments
WHERE created_at >= NOW() - INTERVAL '3 months'
GROUP BY DATE_TRUNC('week', created_at)
ORDER BY week DESC;

-- =============================================
-- 6. ANÁLISES AVANÇADAS
-- =============================================

-- Análise de retenção de clientes (cohort)
WITH first_visit AS (
    SELECT 
        client_id,
        DATE_TRUNC('month', MIN(start_time)) as cohort_month
    FROM appointments
    WHERE status = 'COMPLETED'
    GROUP BY client_id
),
monthly_activity AS (
    SELECT 
        a.client_id,
        DATE_TRUNC('month', a.start_time) as activity_month
    FROM appointments a
    WHERE status = 'COMPLETED'
    GROUP BY a.client_id, DATE_TRUNC('month', a.start_time)
)
SELECT 
    fv.cohort_month,
    COUNT(DISTINCT fv.client_id) as cohort_size,
    COUNT(DISTINCT CASE 
        WHEN ma.activity_month = fv.cohort_month + INTERVAL '1 month' 
        THEN ma.client_id 
    END) as month_1,
    COUNT(DISTINCT CASE 
        WHEN ma.activity_month = fv.cohort_month + INTERVAL '2 months' 
        THEN ma.client_id 
    END) as month_2,
    COUNT(DISTINCT CASE 
        WHEN ma.activity_month = fv.cohort_month + INTERVAL '3 months' 
        THEN ma.client_id 
    END) as month_3
FROM first_visit fv
LEFT JOIN monthly_activity ma ON fv.client_id = ma.client_id
GROUP BY fv.cohort_month
ORDER BY fv.cohort_month DESC
LIMIT 6;

-- Análise RFM (Recency, Frequency, Monetary)
WITH rfm_data AS (
    SELECT 
        c.id,
        c.name,
        NOW() - MAX(a.start_time) as recency,
        COUNT(a.id) as frequency,
        SUM(a.total_amount) as monetary
    FROM clients c
    LEFT JOIN appointments a ON c.id = a.client_id AND a.status = 'COMPLETED'
    GROUP BY c.id, c.name
)
SELECT 
    id,
    name,
    EXTRACT(DAYS FROM recency) as days_since_last_visit,
    frequency,
    monetary,
    CASE 
        WHEN recency <= INTERVAL '30 days' AND frequency >= 5 AND monetary >= 500 THEN 'Champions'
        WHEN recency <= INTERVAL '60 days' AND frequency >= 3 AND monetary >= 300 THEN 'Loyal'
        WHEN frequency >= 5 AND monetary >= 300 THEN 'Potential Loyalist'
        WHEN recency <= INTERVAL '30 days' THEN 'New Customers'
        WHEN recency > INTERVAL '180 days' THEN 'Lost'
        ELSE 'At Risk'
    END as segment
FROM rfm_data
WHERE recency IS NOT NULL
ORDER BY monetary DESC;

-- Previsão de demanda por dia da semana
SELECT 
    TO_CHAR(start_time, 'Day') as day_of_week,
    EXTRACT(DOW FROM start_time) as day_number,
    COUNT(*) as appointment_count,
    ROUND(AVG(total_amount), 2) as avg_revenue,
    COUNT(*) FILTER (WHERE status = 'NO_SHOW') as no_shows
FROM appointments
WHERE start_time >= NOW() - INTERVAL '90 days'
  AND status != 'CANCELLED'
GROUP BY TO_CHAR(start_time, 'Day'), EXTRACT(DOW FROM start_time)
ORDER BY day_number;

-- =============================================
-- 7. CONSULTAS DE AUDITORIA
-- =============================================

-- Últimas ações no sistema
SELECT 
    al.created_at,
    u.name as user,
    al.action,
    al.entity,
    al.ip_address
FROM audit_logs al
LEFT JOIN users u ON al.user_id = u.id
ORDER BY al.created_at DESC
LIMIT 50;

-- Alterações em um cliente específico
SELECT 
    created_at,
    u.name as changed_by,
    action,
    payload
FROM audit_logs al
LEFT JOIN users u ON al.user_id = u.id
WHERE entity = 'client' 
  AND entity_id = 'SEU_CLIENT_ID'
ORDER BY created_at DESC;

-- =============================================
-- 8. NOTIFICAÇÕES
-- =============================================

-- Status de notificações por canal
SELECT 
    channel,
    status,
    COUNT(*) as count,
    MIN(created_at) as oldest,
    MAX(created_at) as newest
FROM notifications
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY channel, status
ORDER BY channel, status;

-- Notificações com falha para reprocessar
SELECT 
    id,
    type,
    channel,
    recipient,
    error_message,
    attempts,
    created_at
FROM notifications
WHERE status = 'FAILED'
  AND attempts < 3
ORDER BY created_at;

-- =============================================
-- 9. LIMPEZA E MANUTENÇÃO
-- =============================================

-- Remover tokens expirados
DELETE FROM refresh_tokens
WHERE expires_at < NOW() - INTERVAL '7 days';

-- Arquivar notificações antigas
-- (Criar tabela notifications_archive primeiro)
/*
INSERT INTO notifications_archive
SELECT * FROM notifications
WHERE created_at < NOW() - INTERVAL '6 months';

DELETE FROM notifications
WHERE created_at < NOW() - INTERVAL '6 months';
*/

-- Limpar logs de auditoria antigos
-- DELETE FROM audit_logs
-- WHERE created_at < NOW() - INTERVAL '1 year';

-- =============================================
-- 10. VALIDAÇÕES E INCONSISTÊNCIAS
-- =============================================

-- Agendamentos sem pagamento (concluídos há mais de 7 dias)
SELECT 
    a.id,
    a.start_time,
    c.name as client,
    a.total_amount,
    a.is_paid
FROM appointments a
INNER JOIN clients c ON a.client_id = c.id
WHERE a.status = 'COMPLETED'
  AND a.is_paid = false
  AND a.start_time < NOW() - INTERVAL '7 days'
ORDER BY a.start_time;

-- Comissões sem pagamento associado
SELECT c.*
FROM commissions c
LEFT JOIN payments p ON c.payment_id = p.id
WHERE p.id IS NULL;

-- Produtos com estoque negativo (inconsistência)
SELECT * FROM products
WHERE quantity < 0;

-- Clientes duplicados (mesmo telefone)
SELECT phone, COUNT(*) as count, STRING_AGG(name, ', ') as names
FROM clients
GROUP BY phone
HAVING COUNT(*) > 1;
