-- =============================================
-- MIGRATIONS MANUAIS
-- Sistema de Gerenciamento de Salão
-- =============================================
-- Use este arquivo para alterações no schema que não podem
-- ser feitas automaticamente pelo Prisma
-- =============================================

-- =============================================
-- MIGRATION: Adicionar índice GIN para busca de texto
-- Data: 2024-12-01
-- Descrição: Melhora performance de busca por nome
-- =============================================

-- Criar extensão pg_trgm se não existir
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Adicionar índices GIN para busca de texto
CREATE INDEX IF NOT EXISTS idx_clients_name_trgm ON clients USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_services_name_trgm ON services USING gin(name gin_trgm_ops);

-- =============================================
-- MIGRATION: Particionamento de audit_logs
-- Data: 2024-12-01
-- Descrição: Particionar tabela de auditoria por mês
-- =============================================

-- ATENÇÃO: Executar apenas se a tabela audit_logs estiver muito grande

/*
-- 1. Renomear tabela original
ALTER TABLE audit_logs RENAME TO audit_logs_old;

-- 2. Criar tabela particionada
CREATE TABLE audit_logs (
  id UUID DEFAULT uuid_generate_v4(),
  user_id UUID,
  action VARCHAR(50) NOT NULL,
  entity VARCHAR(100) NOT NULL,
  entity_id UUID,
  payload JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- 3. Criar partições para os próximos 12 meses
CREATE TABLE audit_logs_2024_12 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');

CREATE TABLE audit_logs_2025_01 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- ... criar demais partições

-- 4. Copiar dados da tabela antiga
INSERT INTO audit_logs SELECT * FROM audit_logs_old;

-- 5. Criar índices nas partições
CREATE INDEX ON audit_logs (user_id);
CREATE INDEX ON audit_logs (entity, entity_id);
CREATE INDEX ON audit_logs (created_at);
CREATE INDEX ON audit_logs (action);

-- 6. Remover tabela antiga (após validação)
-- DROP TABLE audit_logs_old;
*/

-- =============================================
-- MIGRATION: Adicionar campos de localização
-- Data: 2024-12-01
-- Descrição: Adicionar coordenadas para clientes (futuro)
-- =============================================

/*
ALTER TABLE clients ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS state VARCHAR(2);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS zip_code VARCHAR(10);

-- Índice espacial (requer PostGIS)
-- CREATE INDEX idx_clients_location ON clients USING GIST(ST_Point(longitude, latitude));
*/

-- =============================================
-- MIGRATION: Adicionar histórico de preços
-- Data: 2024-12-01
-- Descrição: Rastrear mudanças de preço em serviços
-- =============================================

/*
CREATE TABLE IF NOT EXISTS service_price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL,
  old_price DECIMAL(10, 2) NOT NULL,
  new_price DECIMAL(10, 2) NOT NULL,
  changed_by UUID NOT NULL,
  changed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_price_history_service FOREIGN KEY (service_id) 
    REFERENCES services(id) ON DELETE CASCADE,
  CONSTRAINT fk_price_history_user FOREIGN KEY (changed_by) 
    REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_price_history_service ON service_price_history(service_id);
CREATE INDEX idx_price_history_changed_at ON service_price_history(changed_at);

-- Trigger para registrar mudanças de preço
CREATE OR REPLACE FUNCTION log_price_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.price != OLD.price THEN
        INSERT INTO service_price_history (service_id, old_price, new_price, changed_by)
        VALUES (NEW.id, OLD.price, NEW.price, current_setting('app.current_user_id')::UUID);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_price_change
    AFTER UPDATE ON services
    FOR EACH ROW
    WHEN (NEW.price IS DISTINCT FROM OLD.price)
    EXECUTE FUNCTION log_price_change();
*/

-- =============================================
-- MIGRATION: Adicionar sistema de pacotes/combos
-- Data: 2024-12-01
-- Descrição: Permitir vendas de pacotes de serviços
-- =============================================

/*
CREATE TABLE IF NOT EXISTS service_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  services JSONB NOT NULL, -- [{"service_id": "uuid", "quantity": 1}]
  original_price DECIMAL(10, 2) NOT NULL,
  package_price DECIMAL(10, 2) NOT NULL,
  discount_percent DECIMAL(5, 2) GENERATED ALWAYS AS (
    ((original_price - package_price) / original_price * 100)
  ) STORED,
  validity_days INTEGER DEFAULT 90,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS client_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL,
  package_id UUID NOT NULL,
  purchased_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  services_remaining JSONB NOT NULL,
  amount_paid DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  CONSTRAINT fk_client_package_client FOREIGN KEY (client_id) 
    REFERENCES clients(id) ON DELETE RESTRICT,
  CONSTRAINT fk_client_package_package FOREIGN KEY (package_id) 
    REFERENCES service_packages(id) ON DELETE RESTRICT
);

CREATE INDEX idx_client_packages_client ON client_packages(client_id);
CREATE INDEX idx_client_packages_expires ON client_packages(expires_at);
*/

-- =============================================
-- MIGRATION: Adicionar campos para campanhas de marketing
-- Data: 2024-12-01
-- Descrição: Sistema de campanhas e cupons
-- =============================================

/*
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- 'BIRTHDAY', 'REACTIVATION', 'PROMOTIONAL'
  discount_type VARCHAR(20), -- 'PERCENT', 'FIXED'
  discount_value DECIMAL(10, 2),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  target_segment JSONB, -- Filtros para segmentação
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) NOT NULL UNIQUE,
  campaign_id UUID,
  discount_type VARCHAR(20) NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL,
  min_purchase_amount DECIMAL(10, 2),
  max_discount DECIMAL(10, 2),
  usage_limit INTEGER,
  usage_count INTEGER NOT NULL DEFAULT 0,
  valid_from TIMESTAMP NOT NULL,
  valid_until TIMESTAMP NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  CONSTRAINT fk_coupon_campaign FOREIGN KEY (campaign_id) 
    REFERENCES campaigns(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID NOT NULL,
  client_id UUID NOT NULL,
  appointment_id UUID,
  discount_applied DECIMAL(10, 2) NOT NULL,
  used_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_coupon_usage_coupon FOREIGN KEY (coupon_id) 
    REFERENCES coupons(id) ON DELETE RESTRICT,
  CONSTRAINT fk_coupon_usage_client FOREIGN KEY (client_id) 
    REFERENCES clients(id) ON DELETE RESTRICT,
  CONSTRAINT fk_coupon_usage_appointment FOREIGN KEY (appointment_id) 
    REFERENCES appointments(id) ON DELETE SET NULL
);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupon_usage_coupon ON coupon_usage(coupon_id);
*/

-- =============================================
-- MIGRATION: Adicionar sistema de agendamento recorrente
-- Data: 2024-12-01
-- Descrição: Permitir agendamentos recorrentes
-- =============================================

/*
CREATE TABLE IF NOT EXISTS recurring_appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL,
  staff_id UUID NOT NULL,
  services JSONB NOT NULL,
  frequency VARCHAR(20) NOT NULL, -- 'WEEKLY', 'BIWEEKLY', 'MONTHLY'
  day_of_week INTEGER, -- 0-6 (domingo-sábado)
  day_of_month INTEGER, -- 1-31
  preferred_time TIME NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_recurring_client FOREIGN KEY (client_id) 
    REFERENCES clients(id) ON DELETE CASCADE,
  CONSTRAINT fk_recurring_staff FOREIGN KEY (staff_id) 
    REFERENCES staff(id) ON DELETE CASCADE
);

CREATE INDEX idx_recurring_client ON recurring_appointments(client_id);
CREATE INDEX idx_recurring_staff ON recurring_appointments(staff_id);
*/

-- =============================================
-- MIGRATION: Melhorias de performance
-- Data: 2024-12-01
-- Descrição: Índices adicionais para queries frequentes
-- =============================================

-- Índices compostos para queries comuns
CREATE INDEX IF NOT EXISTS idx_appointments_client_status ON appointments(client_id, status);
CREATE INDEX IF NOT EXISTS idx_appointments_staff_status ON appointments(staff_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_client_status ON payments(client_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_status_channel ON notifications(status, channel);

-- Índices parciais (apenas registros ativos/pendentes)
CREATE INDEX IF NOT EXISTS idx_appointments_active ON appointments(start_time, staff_id) 
  WHERE status NOT IN ('CANCELLED', 'NO_SHOW');

CREATE INDEX IF NOT EXISTS idx_payments_pending ON payments(created_at) 
  WHERE status = 'PENDING';

CREATE INDEX IF NOT EXISTS idx_notifications_pending ON notifications(scheduled_for) 
  WHERE status = 'PENDING';

-- =============================================
-- MIGRATION: Adicionar campos de integração
-- Data: 2024-12-01
-- Descrição: Campos para integrações externas
-- =============================================

/*
ALTER TABLE clients ADD COLUMN IF NOT EXISTS external_id VARCHAR(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS external_source VARCHAR(50); -- 'GOOGLE', 'FACEBOOK', 'INSTAGRAM'
ALTER TABLE clients ADD COLUMN IF NOT EXISTS metadata JSONB;

CREATE INDEX IF NOT EXISTS idx_clients_external_id ON clients(external_id);
*/

-- =============================================
-- MIGRATION: Sistema de avaliações melhorado
-- Data: 2024-12-01
-- Descrição: Adicionar mais campos às avaliações
-- =============================================

/*
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS staff_id UUID;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS appointment_id UUID;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS would_recommend BOOLEAN;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS photos TEXT[];
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS response TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS responded_at TIMESTAMP;

ALTER TABLE reviews ADD CONSTRAINT fk_review_staff 
  FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE SET NULL;
  
ALTER TABLE reviews ADD CONSTRAINT fk_review_appointment 
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_reviews_staff ON reviews(staff_id);
CREATE INDEX IF NOT EXISTS idx_reviews_appointment ON reviews(appointment_id);
*/

-- =============================================
-- ROLLBACK PROCEDURES
-- =============================================

-- Para reverter índices GIN:
-- DROP INDEX IF EXISTS idx_clients_name_trgm;
-- DROP INDEX IF EXISTS idx_products_name_trgm;
-- DROP INDEX IF EXISTS idx_services_name_trgm;

-- Para reverter índices de performance:
-- DROP INDEX IF EXISTS idx_appointments_client_status;
-- DROP INDEX IF EXISTS idx_appointments_staff_status;
-- DROP INDEX IF EXISTS idx_payments_client_status;
-- DROP INDEX IF EXISTS idx_notifications_status_channel;
-- DROP INDEX IF EXISTS idx_appointments_active;
-- DROP INDEX IF EXISTS idx_payments_pending;
-- DROP INDEX IF EXISTS idx_notifications_pending;

-- =============================================
-- NOTAS
-- =============================================

/*
IMPORTANTE:
1. Sempre fazer backup antes de executar migrations
2. Testar em ambiente de desenvolvimento primeiro
3. Executar ANALYZE após criar índices grandes
4. Monitorar performance após mudanças
5. Documentar todas as alterações

Para executar uma migration:
psql -U postgres -d salao_beleza -f migrations.sql

Para reverter (rollback):
Executar os comandos na seção ROLLBACK PROCEDURES
*/
