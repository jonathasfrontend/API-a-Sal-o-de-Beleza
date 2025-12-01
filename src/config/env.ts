import { config } from 'dotenv';
config();

interface EnvConfig {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  
  // JWT
  jwtSecret: string;
  jwtAccessExpiration: string;
  jwtRefreshExpiration: string;
  
  // Redis
  redisUrl: string;
  
  // CORS
  corsOrigins: string[];
  
  // Rate Limiting
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  
  // Supabase
  supabaseUrl: string;
  supabaseKey: string;
  supabaseServiceRoleKey: string;
  
  // WhatsApp
  whatsappApiUrl: string;
  whatsappAccessToken: string;
  whatsappPhoneNumberId: string;
  whatsappVerifyToken: string;
  
  // Payment Gateways
  mercadopagoAccessToken: string;
  mercadopagoPublicKey: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  pagseguroEmail: string;
  pagseguroToken: string;
  
  // Email
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string;
  
  // Google OAuth
  googleClientId: string;
  googleClientSecret: string;
  googleRedirectUri: string;
  
  // Monitoring
  sentryDsn: string;
  
  // File Upload
  maxFileSize: number;
  allowedFileTypes: string[];
  
  // URLs
  frontendUrl: string;
  backendUrl: string;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value!;
};

const getEnvVarOptional = (key: string, defaultValue: string = ''): string => {
  return process.env[key] || defaultValue;
};

export const env: EnvConfig = {
  port: parseInt(getEnvVar('PORT', '4000'), 10),
  nodeEnv: getEnvVar('NODE_ENV', 'development'),
  databaseUrl: getEnvVar('DATABASE_URL'),
  
  // JWT
  jwtSecret: getEnvVar('JWT_SECRET'),
  jwtAccessExpiration: getEnvVar('JWT_ACCESS_EXPIRATION', '15m'),
  jwtRefreshExpiration: getEnvVar('JWT_REFRESH_EXPIRATION', '30d'),
  
  // Redis
  redisUrl: getEnvVar('REDIS_URL', 'redis://localhost:6379'),
  
  // CORS
  corsOrigins: getEnvVar('CORS_ORIGINS', 'http://localhost:3000').split(','),
  
  // Rate Limiting
  rateLimitWindowMs: parseInt(getEnvVar('RATE_LIMIT_WINDOW_MS', '900000'), 10),
  rateLimitMaxRequests: parseInt(getEnvVar('RATE_LIMIT_MAX_REQUESTS', '100'), 10),
  
  // Supabase
  supabaseUrl: getEnvVarOptional('SUPABASE_URL'),
  supabaseKey: getEnvVarOptional('SUPABASE_KEY'),
  supabaseServiceRoleKey: getEnvVarOptional('SUPABASE_SERVICE_ROLE_KEY'),
  
  // WhatsApp
  whatsappApiUrl: getEnvVarOptional('WHATSAPP_API_URL', 'https://graph.facebook.com/v18.0'),
  whatsappAccessToken: getEnvVarOptional('WHATSAPP_ACCESS_TOKEN'),
  whatsappPhoneNumberId: getEnvVarOptional('WHATSAPP_PHONE_NUMBER_ID'),
  whatsappVerifyToken: getEnvVarOptional('WHATSAPP_VERIFY_TOKEN'),
  
  // Payment Gateways
  mercadopagoAccessToken: getEnvVarOptional('MERCADOPAGO_ACCESS_TOKEN'),
  mercadopagoPublicKey: getEnvVarOptional('MERCADOPAGO_PUBLIC_KEY'),
  stripeSecretKey: getEnvVarOptional('STRIPE_SECRET_KEY'),
  stripeWebhookSecret: getEnvVarOptional('STRIPE_WEBHOOK_SECRET'),
  pagseguroEmail: getEnvVarOptional('PAGSEGURO_EMAIL'),
  pagseguroToken: getEnvVarOptional('PAGSEGURO_TOKEN'),
  
  // Email
  smtpHost: getEnvVarOptional('SMTP_HOST', 'smtp.gmail.com'),
  smtpPort: parseInt(getEnvVarOptional('SMTP_PORT', '587'), 10),
  smtpSecure: getEnvVarOptional('SMTP_SECURE', 'false') === 'true',
  smtpUser: getEnvVarOptional('SMTP_USER'),
  smtpPass: getEnvVarOptional('SMTP_PASS'),
  
  // Google OAuth
  googleClientId: getEnvVarOptional('GOOGLE_CLIENT_ID'),
  googleClientSecret: getEnvVarOptional('GOOGLE_CLIENT_SECRET'),
  googleRedirectUri: getEnvVarOptional('GOOGLE_REDIRECT_URI'),
  
  // Monitoring
  sentryDsn: getEnvVarOptional('SENTRY_DSN'),
  
  // File Upload
  maxFileSize: parseInt(getEnvVarOptional('MAX_FILE_SIZE', '5242880'), 10),
  allowedFileTypes: getEnvVarOptional('ALLOWED_FILE_TYPES', 'image/jpeg,image/png').split(','),
  
  // URLs
  frontendUrl: getEnvVar('FRONTEND_URL', 'http://localhost:3000'),
  backendUrl: getEnvVar('BACKEND_URL', 'http://localhost:4000'),
};
