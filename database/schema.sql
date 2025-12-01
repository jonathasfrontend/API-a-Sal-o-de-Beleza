-- =============================================
-- SISTEMA DE GERENCIAMENTO DE SALÃO DE BELEZA
-- Database Schema - PostgreSQL
-- Gerado em: 28/11/2025
-- =============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para busca de texto otimizada

-- =============================================
-- DROP TABLES (ordem reversa para respeitar FK)
-- =============================================

DROP TABLE IF EXISTS waitlist CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS sale_items CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS stock_movements CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS commissions CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop types/enums
DROP TYPE IF EXISTS notification_status CASCADE;
DROP TYPE IF EXISTS notification_channel CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS appointment_status CASCADE;
DROP TYPE IF EXISTS commission_type CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- =============================================
-- ENUMS (TIPOS PERSONALIZADOS)
-- =============================================

CREATE TYPE user_role AS ENUM (
  'ADMIN',
  'MANAGER',
  'RECEPTION',
  'STAFF',
  'CLIENT'
);

CREATE TYPE commission_type AS ENUM (
  'PERCENT',
  'FIXED',
  'TABLE'
);

CREATE TYPE appointment_status AS ENUM (
  'SCHEDULED',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW'
);

CREATE TYPE payment_method AS ENUM (
  'CASH',
  'DEBIT',
  'CREDIT',
  'PIX',
  'LINK',
  'WALLET'
);

CREATE TYPE payment_status AS ENUM (
  'PENDING',
  'PAID',
  'PARTIAL',
  'REFUNDED',
  'CANCELLED'
);

CREATE TYPE notification_type AS ENUM (
  'CONFIRMATION',
  'REMINDER_24H',
  'REMINDER_1H',
  'CANCELLATION',
  'PROMOTION',
  'BIRTHDAY',
  'REACTIVATION'
);

CREATE TYPE notification_channel AS ENUM (
  'WHATSAPP',
  'EMAIL',
  'SMS',
  'PUSH'
);

CREATE TYPE notification_status AS ENUM (
  'PENDING',
  'SENT',
  'DELIVERED',
  'FAILED'
);

-- =============================================
-- AUTHENTICATION & USERS
-- =============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'RECEPTION',
  is_active BOOLEAN NOT NULL DEFAULT true,
  phone VARCHAR(20),
  avatar TEXT,
  last_login TIMESTAMP,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices para users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

COMMENT ON TABLE users IS 'Tabela de usuários do sistema (admin, gerentes, recepcionistas, profissionais)';
COMMENT ON COLUMN users.password_hash IS 'Hash bcrypt da senha (12 rounds)';
COMMENT ON COLUMN users.role IS 'Papel do usuário no sistema';

-- =============================================

CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  revoked BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_refresh_token_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE
);

-- Índices para refresh_tokens
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

COMMENT ON TABLE refresh_tokens IS 'Tokens de atualização JWT para autenticação';

-- =============================================
-- STAFF (PROFISSIONAIS)
-- =============================================

CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE,
  specialties TEXT[] NOT NULL DEFAULT '{}',
  commission_type commission_type NOT NULL DEFAULT 'PERCENT',
  commission_value DECIMAL(10, 2) NOT NULL DEFAULT 0,
  work_schedule JSONB,
  blocked_dates JSONB,
  is_available BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_staff_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE
);

-- Índices para staff
CREATE INDEX idx_staff_user_id ON staff(user_id);
CREATE INDEX idx_staff_is_available ON staff(is_available);
CREATE INDEX idx_staff_specialties ON staff USING GIN(specialties);

COMMENT ON TABLE staff IS 'Profissionais do salão (manicures, cabeleireiros, etc)';
COMMENT ON COLUMN staff.specialties IS 'Array de especialidades: ["manicure", "cabelo", "maquiagem"]';
COMMENT ON COLUMN staff.work_schedule IS 'JSON com horários de trabalho por dia da semana';
COMMENT ON COLUMN staff.blocked_dates IS 'JSON com datas bloqueadas (férias, folgas)';

-- =============================================
-- CLIENTS
-- =============================================

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(255),
  birthdate DATE,
  cpf VARCHAR(14) UNIQUE,
  notes TEXT,
  preferences JSONB,
  loyalty_points INTEGER NOT NULL DEFAULT 0,
  no_show_count INTEGER NOT NULL DEFAULT 0,
  is_blocked BOOLEAN NOT NULL DEFAULT false,
  consent_lgpd BOOLEAN NOT NULL DEFAULT false,
  consent_date TIMESTAMP,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices para clients
CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_cpf ON clients(cpf);
CREATE INDEX idx_clients_name ON clients USING gin(name gin_trgm_ops);
CREATE INDEX idx_clients_is_blocked ON clients(is_blocked);
CREATE INDEX idx_clients_birthdate ON clients(birthdate);

COMMENT ON TABLE clients IS 'Cadastro de clientes do salão';
COMMENT ON COLUMN clients.preferences IS 'JSON com preferências: profissional favorito, alergias, cor preferida';
COMMENT ON COLUMN clients.loyalty_points IS 'Pontos de fidelidade acumulados';
COMMENT ON COLUMN clients.no_show_count IS 'Contador de faltas sem cancelamento';
COMMENT ON COLUMN clients.consent_lgpd IS 'Consentimento para uso de dados pessoais (LGPD)';

-- =============================================
-- SERVICES
-- =============================================

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  allows_combo BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices para services
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_is_active ON services(is_active);
CREATE INDEX idx_services_name ON services USING gin(name gin_trgm_ops);

COMMENT ON TABLE services IS 'Catálogo de serviços oferecidos';
COMMENT ON COLUMN services.duration_minutes IS 'Duração estimada do serviço em minutos';
COMMENT ON COLUMN services.category IS 'Categoria: cabelo, unha, estética, maquiagem, etc';
COMMENT ON COLUMN services.allows_combo IS 'Permite combinar com outros serviços';

-- =============================================
-- APPOINTMENTS (AGENDAMENTOS)
-- =============================================

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL,
  staff_id UUID NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  status appointment_status NOT NULL DEFAULT 'SCHEDULED',
  services JSONB NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  
  created_by UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_appointment_client FOREIGN KEY (client_id) 
    REFERENCES clients(id) ON DELETE RESTRICT,
  CONSTRAINT fk_appointment_staff FOREIGN KEY (staff_id) 
    REFERENCES staff(id) ON DELETE RESTRICT,
  CONSTRAINT fk_appointment_creator FOREIGN KEY (created_by) 
    REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT chk_appointment_time CHECK (end_time > start_time)
);

-- Índices para appointments
CREATE INDEX idx_appointments_start_time ON appointments(start_time);
CREATE INDEX idx_appointments_staff_start ON appointments(staff_id, start_time);
CREATE INDEX idx_appointments_client_id ON appointments(client_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_created_by ON appointments(created_by);
CREATE INDEX idx_appointments_date ON appointments(DATE(start_time));

COMMENT ON TABLE appointments IS 'Agendamentos de serviços';
COMMENT ON COLUMN appointments.services IS 'Array JSON com serviços: [{"id", "name", "price", "duration"}]';
COMMENT ON COLUMN appointments.status IS 'Status do agendamento';

-- =============================================
-- PAYMENTS & FINANCE
-- =============================================

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID,
  client_id UUID NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  method payment_method NOT NULL,
  status payment_status NOT NULL DEFAULT 'PENDING',
  gateway_reference VARCHAR(255),
  gateway_response JSONB,
  paid_at TIMESTAMP,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_payment_appointment FOREIGN KEY (appointment_id) 
    REFERENCES appointments(id) ON DELETE SET NULL,
  CONSTRAINT fk_payment_client FOREIGN KEY (client_id) 
    REFERENCES clients(id) ON DELETE RESTRICT,
  CONSTRAINT chk_payment_amount CHECK (amount >= 0)
);

-- Índices para payments
CREATE INDEX idx_payments_appointment_id ON payments(appointment_id);
CREATE INDEX idx_payments_client_id ON payments(client_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_method ON payments(method);
CREATE INDEX idx_payments_paid_at ON payments(paid_at);
CREATE INDEX idx_payments_created_at ON payments(created_at);

COMMENT ON TABLE payments IS 'Registro de pagamentos';
COMMENT ON COLUMN payments.gateway_reference IS 'ID da transação no gateway de pagamento';
COMMENT ON COLUMN payments.gateway_response IS 'Resposta completa do gateway';

-- =============================================

CREATE TABLE commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID NOT NULL,
  staff_id UUID NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  paid_at TIMESTAMP,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_commission_payment FOREIGN KEY (payment_id) 
    REFERENCES payments(id) ON DELETE RESTRICT,
  CONSTRAINT fk_commission_staff FOREIGN KEY (staff_id) 
    REFERENCES staff(id) ON DELETE RESTRICT,
  CONSTRAINT chk_commission_amount CHECK (amount >= 0)
);

-- Índices para commissions
CREATE INDEX idx_commissions_staff_id ON commissions(staff_id);
CREATE INDEX idx_commissions_payment_id ON commissions(payment_id);
CREATE INDEX idx_commissions_is_paid ON commissions(is_paid);
CREATE INDEX idx_commissions_created_at ON commissions(created_at);

COMMENT ON TABLE commissions IS 'Comissões dos profissionais';

-- =============================================

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  description VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT chk_expense_amount CHECK (amount >= 0)
);

-- Índices para expenses
CREATE INDEX idx_expenses_due_date ON expenses(due_date);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_is_paid ON expenses(is_paid);
CREATE INDEX idx_expenses_is_recurring ON expenses(is_recurring);

COMMENT ON TABLE expenses IS 'Despesas do salão';
COMMENT ON COLUMN expenses.category IS 'Categoria: aluguel, produtos, salários, água, luz, etc';

-- =============================================
-- PRODUCTS & INVENTORY
-- =============================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  cost_price DECIMAL(10, 2) NOT NULL,
  sale_price DECIMAL(10, 2) NOT NULL,
  reorder_threshold INTEGER NOT NULL DEFAULT 10,
  supplier VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT chk_product_quantity CHECK (quantity >= 0),
  CONSTRAINT chk_product_cost_price CHECK (cost_price >= 0),
  CONSTRAINT chk_product_sale_price CHECK (sale_price >= 0)
);

-- Índices para products
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_name ON products USING gin(name gin_trgm_ops);
CREATE INDEX idx_products_quantity ON products(quantity);

COMMENT ON TABLE products IS 'Catálogo de produtos para venda';
COMMENT ON COLUMN products.reorder_threshold IS 'Quantidade mínima antes de alertar reposição';

-- =============================================

CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL,
  type VARCHAR(20) NOT NULL,
  quantity INTEGER NOT NULL,
  reason TEXT,
  reference VARCHAR(255),
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_stock_movement_product FOREIGN KEY (product_id) 
    REFERENCES products(id) ON DELETE RESTRICT,
  CONSTRAINT chk_stock_movement_type CHECK (type IN ('IN', 'OUT', 'ADJUSTMENT'))
);

-- Índices para stock_movements
CREATE INDEX idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_type ON stock_movements(type);
CREATE INDEX idx_stock_movements_created_at ON stock_movements(created_at);

COMMENT ON TABLE stock_movements IS 'Histórico de movimentações de estoque';
COMMENT ON COLUMN stock_movements.type IS 'Tipo: IN (entrada), OUT (saída), ADJUSTMENT (ajuste)';
COMMENT ON COLUMN stock_movements.reference IS 'Referência: nota fiscal, venda ID, etc';

-- =============================================
-- SALES (PDV)
-- =============================================

CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method payment_method NOT NULL,
  payment_status payment_status NOT NULL DEFAULT 'PAID',
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_sale_client FOREIGN KEY (client_id) 
    REFERENCES clients(id) ON DELETE SET NULL,
  CONSTRAINT chk_sale_total_amount CHECK (total_amount >= 0)
);

-- Índices para sales
CREATE INDEX idx_sales_client_id ON sales(client_id);
CREATE INDEX idx_sales_created_at ON sales(created_at);
CREATE INDEX idx_sales_payment_status ON sales(payment_status);

COMMENT ON TABLE sales IS 'Vendas de produtos (PDV)';

-- =============================================

CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID NOT NULL,
  product_id UUID NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  
  CONSTRAINT fk_sale_item_sale FOREIGN KEY (sale_id) 
    REFERENCES sales(id) ON DELETE CASCADE,
  CONSTRAINT fk_sale_item_product FOREIGN KEY (product_id) 
    REFERENCES products(id) ON DELETE RESTRICT,
  CONSTRAINT chk_sale_item_quantity CHECK (quantity > 0),
  CONSTRAINT chk_sale_item_unit_price CHECK (unit_price >= 0),
  CONSTRAINT chk_sale_item_total CHECK (total >= 0)
);

-- Índices para sale_items
CREATE INDEX idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product_id ON sale_items(product_id);

COMMENT ON TABLE sale_items IS 'Itens de cada venda';

-- =============================================
-- NOTIFICATIONS
-- =============================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID,
  type notification_type NOT NULL,
  channel notification_channel NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status notification_status NOT NULL DEFAULT 'PENDING',
  scheduled_for TIMESTAMP,
  sent_at TIMESTAMP,
  error_message TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_notification_appointment FOREIGN KEY (appointment_id) 
    REFERENCES appointments(id) ON DELETE SET NULL
);

-- Índices para notifications
CREATE INDEX idx_notifications_appointment_id ON notifications(appointment_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_scheduled_for ON notifications(scheduled_for);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_channel ON notifications(channel);

COMMENT ON TABLE notifications IS 'Notificações enviadas aos clientes';
COMMENT ON COLUMN notifications.recipient IS 'Telefone ou email do destinatário';

-- =============================================
-- REVIEWS & FEEDBACK
-- =============================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  service_quality INTEGER,
  staff_behavior INTEGER,
  cleanliness INTEGER,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_review_client FOREIGN KEY (client_id) 
    REFERENCES clients(id) ON DELETE CASCADE,
  CONSTRAINT chk_review_rating CHECK (rating >= 1 AND rating <= 5),
  CONSTRAINT chk_review_service_quality CHECK (service_quality IS NULL OR (service_quality >= 1 AND service_quality <= 5)),
  CONSTRAINT chk_review_staff_behavior CHECK (staff_behavior IS NULL OR (staff_behavior >= 1 AND staff_behavior <= 5)),
  CONSTRAINT chk_review_cleanliness CHECK (cleanliness IS NULL OR (cleanliness >= 1 AND cleanliness <= 5))
);

-- Índices para reviews
CREATE INDEX idx_reviews_client_id ON reviews(client_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at);

COMMENT ON TABLE reviews IS 'Avaliações e feedback dos clientes';
COMMENT ON COLUMN reviews.rating IS 'Nota geral de 1 a 5 estrelas';

-- =============================================
-- AUDIT & SECURITY
-- =============================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  action VARCHAR(50) NOT NULL,
  entity VARCHAR(100) NOT NULL,
  entity_id UUID,
  payload JSONB,
  ip_address VARCHAR(45),
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_audit_log_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE SET NULL
);

-- Índices para audit_logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

COMMENT ON TABLE audit_logs IS 'Registro de auditoria de todas as operações';
COMMENT ON COLUMN audit_logs.action IS 'Ação realizada: CREATE, UPDATE, DELETE, LOGIN, LOGOUT';
COMMENT ON COLUMN audit_logs.entity IS 'Entidade afetada: appointment, payment, user, etc';
COMMENT ON COLUMN audit_logs.payload IS 'Dados completos da operação';

-- =============================================
-- WAITLIST (LISTA DE ESPERA)
-- =============================================

CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name VARCHAR(255) NOT NULL,
  client_phone VARCHAR(20) NOT NULL,
  service_id VARCHAR(255) NOT NULL,
  preferred_date TIMESTAMP,
  notes TEXT,
  is_contacted BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices para waitlist
CREATE INDEX idx_waitlist_is_contacted ON waitlist(is_contacted);
CREATE INDEX idx_waitlist_preferred_date ON waitlist(preferred_date);
CREATE INDEX idx_waitlist_created_at ON waitlist(created_at);

COMMENT ON TABLE waitlist IS 'Lista de espera de clientes';

-- =============================================
-- TRIGGERS
-- =============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- TRIGGER: Atualizar estoque ao criar venda
-- =============================================

CREATE OR REPLACE FUNCTION update_stock_on_sale()
RETURNS TRIGGER AS $$
BEGIN
    -- Diminui o estoque do produto
    UPDATE products 
    SET quantity = quantity - NEW.quantity
    WHERE id = NEW.product_id;
    
    -- Registra a movimentação de estoque
    INSERT INTO stock_movements (product_id, type, quantity, reason, reference)
    VALUES (NEW.product_id, 'OUT', NEW.quantity, 'Venda', NEW.sale_id::TEXT);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stock_on_sale
    AFTER INSERT ON sale_items
    FOR EACH ROW
    EXECUTE FUNCTION update_stock_on_sale();

-- =============================================
-- TRIGGER: Calcular total da venda automaticamente
-- =============================================

CREATE OR REPLACE FUNCTION calculate_sale_total()
RETURNS TRIGGER AS $$
DECLARE
    new_total DECIMAL(10,2);
BEGIN
    SELECT COALESCE(SUM(total), 0) INTO new_total
    FROM sale_items
    WHERE sale_id = NEW.sale_id;
    
    UPDATE sales
    SET total_amount = new_total
    WHERE id = NEW.sale_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_sale_total
    AFTER INSERT OR UPDATE OR DELETE ON sale_items
    FOR EACH ROW
    EXECUTE FUNCTION calculate_sale_total();

-- =============================================
-- VIEWS ÚTEIS
-- =============================================

-- View: Dashboard financeiro diário
CREATE OR REPLACE VIEW daily_financial_summary AS
SELECT 
    DATE(p.created_at) as date,
    COUNT(DISTINCT p.id) as total_payments,
    SUM(p.amount) as total_revenue,
    COUNT(DISTINCT CASE WHEN p.method = 'CASH' THEN p.id END) as cash_payments,
    SUM(CASE WHEN p.method = 'CASH' THEN p.amount ELSE 0 END) as cash_revenue,
    COUNT(DISTINCT CASE WHEN p.method = 'PIX' THEN p.id END) as pix_payments,
    SUM(CASE WHEN p.method = 'PIX' THEN p.amount ELSE 0 END) as pix_revenue,
    COUNT(DISTINCT CASE WHEN p.method = 'CREDIT' THEN p.id END) as credit_payments,
    SUM(CASE WHEN p.method = 'CREDIT' THEN p.amount ELSE 0 END) as credit_revenue
FROM payments p
WHERE p.status = 'PAID'
GROUP BY DATE(p.created_at)
ORDER BY date DESC;

-- View: Profissionais com estatísticas
CREATE OR REPLACE VIEW staff_statistics AS
SELECT 
    s.id,
    u.name,
    u.email,
    s.specialties,
    s.is_available,
    COUNT(DISTINCT a.id) as total_appointments,
    COUNT(DISTINCT CASE WHEN a.status = 'COMPLETED' THEN a.id END) as completed_appointments,
    COUNT(DISTINCT CASE WHEN a.status = 'CANCELLED' THEN a.id END) as cancelled_appointments,
    COUNT(DISTINCT CASE WHEN a.status = 'NO_SHOW' THEN a.id END) as no_show_appointments,
    COALESCE(SUM(CASE WHEN a.status = 'COMPLETED' THEN a.total_amount ELSE 0 END), 0) as total_revenue,
    COALESCE(SUM(c.amount), 0) as total_commissions,
    COALESCE(SUM(CASE WHEN c.is_paid THEN c.amount ELSE 0 END), 0) as paid_commissions
FROM staff s
INNER JOIN users u ON s.user_id = u.id
LEFT JOIN appointments a ON s.id = a.staff_id
LEFT JOIN payments p ON a.id = p.appointment_id AND p.status = 'PAID'
LEFT JOIN commissions c ON s.id = c.staff_id
GROUP BY s.id, u.name, u.email, s.specialties, s.is_available;

-- View: Clientes com histórico
CREATE OR REPLACE VIEW client_summary AS
SELECT 
    c.id,
    c.name,
    c.phone,
    c.email,
    c.loyalty_points,
    c.no_show_count,
    c.is_blocked,
    COUNT(DISTINCT a.id) as total_appointments,
    COUNT(DISTINCT CASE WHEN a.status = 'COMPLETED' THEN a.id END) as completed_appointments,
    COUNT(DISTINCT CASE WHEN a.status = 'NO_SHOW' THEN a.id END) as no_show_appointments,
    COALESCE(SUM(CASE WHEN a.status = 'COMPLETED' THEN a.total_amount ELSE 0 END), 0) as lifetime_value,
    MAX(a.start_time) as last_appointment,
    AVG(CASE WHEN r.rating IS NOT NULL THEN r.rating END) as average_rating
FROM clients c
LEFT JOIN appointments a ON c.id = a.client_id
LEFT JOIN reviews r ON c.id = r.client_id
GROUP BY c.id, c.name, c.phone, c.email, c.loyalty_points, c.no_show_count, c.is_blocked;

-- View: Produtos com baixo estoque
CREATE OR REPLACE VIEW low_stock_products AS
SELECT 
    id,
    sku,
    name,
    category,
    quantity,
    reorder_threshold,
    supplier,
    (reorder_threshold - quantity) as units_needed
FROM products
WHERE quantity <= reorder_threshold AND is_active = true
ORDER BY quantity ASC;

-- View: Agenda do dia
CREATE OR REPLACE VIEW today_schedule AS
SELECT 
    a.id,
    a.start_time,
    a.end_time,
    a.status,
    u.name as staff_name,
    c.name as client_name,
    c.phone as client_phone,
    a.services,
    a.total_amount,
    a.is_paid
FROM appointments a
INNER JOIN staff s ON a.staff_id = s.id
INNER JOIN users u ON s.user_id = u.id
INNER JOIN clients c ON a.client_id = c.id
WHERE DATE(a.start_time) = CURRENT_DATE
ORDER BY a.start_time;

-- =============================================
-- FUNÇÕES ÚTEIS
-- =============================================

-- Função: Verificar conflito de horário
CREATE OR REPLACE FUNCTION check_appointment_conflict(
    p_staff_id UUID,
    p_start_time TIMESTAMP,
    p_end_time TIMESTAMP,
    p_exclude_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    conflict_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO conflict_count
    FROM appointments
    WHERE staff_id = p_staff_id
      AND status NOT IN ('CANCELLED', 'NO_SHOW')
      AND (p_exclude_id IS NULL OR id != p_exclude_id)
      AND (
          (start_time <= p_start_time AND end_time > p_start_time) OR
          (start_time < p_end_time AND end_time >= p_end_time) OR
          (start_time >= p_start_time AND end_time <= p_end_time)
      );
    
    RETURN conflict_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Função: Calcular comissão
CREATE OR REPLACE FUNCTION calculate_commission(
    p_staff_id UUID,
    p_amount DECIMAL
)
RETURNS DECIMAL AS $$
DECLARE
    v_commission_type commission_type;
    v_commission_value DECIMAL;
    v_result DECIMAL;
BEGIN
    SELECT commission_type, commission_value
    INTO v_commission_type, v_commission_value
    FROM staff
    WHERE id = p_staff_id;
    
    IF v_commission_type = 'PERCENT' THEN
        v_result := p_amount * (v_commission_value / 100);
    ELSIF v_commission_type = 'FIXED' THEN
        v_result := v_commission_value;
    ELSE
        v_result := 0;
    END IF;
    
    RETURN ROUND(v_result, 2);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- DADOS INICIAIS (SEED)
-- =============================================

-- Usuário admin padrão
-- Senha: Admin@123 (hash bcrypt com 12 rounds)
INSERT INTO users (id, email, password_hash, name, role, is_active)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin@salaodebeleza.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIXq.8kNEy',
    'Administrador',
    'ADMIN',
    true
) ON CONFLICT (email) DO NOTHING;

-- Categorias de serviços padrão (como referência)
COMMENT ON COLUMN services.category IS 'Categorias sugeridas: Cabelo, Manicure/Pedicure, Depilação, Estética Facial, Maquiagem, Massagem, Sobrancelha/Cílios, Pacotes';

-- Categorias de produtos padrão (como referência)
COMMENT ON COLUMN products.category IS 'Categorias sugeridas: Shampoo, Condicionador, Coloração, Esmaltes, Cremes, Maquiagem, Acessórios, Equipamentos';

-- =============================================
-- GRANTS (PERMISSÕES)
-- =============================================

-- Criar role para aplicação (ajustar conforme necessário)
-- CREATE ROLE app_user WITH LOGIN PASSWORD 'sua_senha_forte';
-- GRANT CONNECT ON DATABASE seu_database TO app_user;
-- GRANT USAGE ON SCHEMA public TO app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- =============================================
-- PERFORMANCE & MAINTENANCE
-- =============================================

-- Configurar autovacuum para tabelas grandes
ALTER TABLE appointments SET (autovacuum_vacuum_scale_factor = 0.05);
ALTER TABLE payments SET (autovacuum_vacuum_scale_factor = 0.05);
ALTER TABLE audit_logs SET (autovacuum_vacuum_scale_factor = 0.02);

-- Análise inicial das tabelas
ANALYZE users;
ANALYZE clients;
ANALYZE staff;
ANALYZE appointments;
ANALYZE payments;
ANALYZE products;

-- =============================================
-- BACKUP & RECOVERY
-- =============================================

COMMENT ON DATABASE postgres IS 'Sistema de Gerenciamento de Salão de Beleza - Recomenda-se backup diário automático';

-- =============================================
-- FIM DO SCRIPT
-- =============================================

-- Para aplicar este schema:
-- psql -U postgres -d seu_database -f schema.sql

-- Para backup:
-- pg_dump -U postgres -d seu_database -F c -b -v -f backup_$(date +%Y%m%d).dump

-- Para restaurar:
-- pg_restore -U postgres -d seu_database -v backup_YYYYMMDD.dump
