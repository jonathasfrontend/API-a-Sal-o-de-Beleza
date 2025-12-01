#!/usr/bin/env pwsh
# Script para testar a compilação do projeto

Write-Host "🔍 Verificando instalação de dependências..." -ForegroundColor Cyan

# Verificar se node_modules existe
if (-Not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
    npm install
}

Write-Host "`n🔨 Gerando Prisma Client..." -ForegroundColor Cyan
npm run prisma:generate

Write-Host "`n🏗️ Compilando TypeScript..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Compilação bem-sucedida!" -ForegroundColor Green
    Write-Host "`n📋 Próximos passos:" -ForegroundColor Yellow
    Write-Host "1. Configure suas variáveis de ambiente no arquivo .env" -ForegroundColor White
    Write-Host "2. Execute as migrations: npm run prisma:migrate" -ForegroundColor White
    Write-Host "3. Inicie o servidor: npm run dev" -ForegroundColor White
    Write-Host "`n🚀 Para iniciar o servidor agora, execute:" -ForegroundColor Cyan
    Write-Host "   npm run dev" -ForegroundColor White
} else {
    Write-Host "`n❌ Erro na compilação!" -ForegroundColor Red
    Write-Host "Verifique os erros acima e corrija antes de continuar." -ForegroundColor Yellow
}
