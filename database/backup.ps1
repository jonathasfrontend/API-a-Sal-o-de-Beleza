# =============================================
# SCRIPT DE BACKUP AUTOMÁTICO - WINDOWS
# Sistema de Gerenciamento de Salão
# =============================================

# Configurações
$DB_NAME = "salao_beleza"
$DB_USER = "postgres"
$DB_HOST = "localhost"
$DB_PORT = "5432"
$BACKUP_DIR = ".\backups"
$RETENTION_DAYS = 30

# Criar diretório de backup se não existir
if (-not (Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR | Out-Null
}

# Data e hora atual
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_FILE = Join-Path $BACKUP_DIR "backup_${DB_NAME}_${TIMESTAMP}.dump"

Write-Host "🔄 Iniciando backup do banco de dados..." -ForegroundColor Cyan
Write-Host "📅 Data/Hora: $(Get-Date)" -ForegroundColor Gray
Write-Host "🗄️  Banco: $DB_NAME" -ForegroundColor Gray
Write-Host "📁 Arquivo: $BACKUP_FILE" -ForegroundColor Gray

# Definir senha do PostgreSQL (se necessário)
# $env:PGPASSWORD = "sua_senha"

# Executar backup
$pgDumpPath = "pg_dump" # Assumindo que está no PATH
& $pgDumpPath -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -F c -b -v -f $BACKUP_FILE 2>&1 | Out-Null

# Verificar se backup foi bem-sucedido
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backup concluído com sucesso!" -ForegroundColor Green
    
    # Comprimir backup
    Compress-Archive -Path $BACKUP_FILE -DestinationPath "$BACKUP_FILE.zip" -Force
    Remove-Item $BACKUP_FILE
    Write-Host "📦 Backup comprimido: $BACKUP_FILE.zip" -ForegroundColor Green
    
    # Calcular tamanho
    $BackupSize = (Get-Item "$BACKUP_FILE.zip").Length
    $BackupSizeMB = [math]::Round($BackupSize / 1MB, 2)
    Write-Host "📊 Tamanho: ${BackupSizeMB} MB" -ForegroundColor Gray
    
    # Remover backups antigos
    Write-Host "🧹 Removendo backups com mais de $RETENTION_DAYS dias..." -ForegroundColor Yellow
    $CutoffDate = (Get-Date).AddDays(-$RETENTION_DAYS)
    Get-ChildItem -Path $BACKUP_DIR -Filter "backup_*.zip" | 
        Where-Object { $_.LastWriteTime -lt $CutoffDate } | 
        Remove-Item -Force
    
    # Listar backups existentes
    Write-Host ""
    Write-Host "📋 Backups disponíveis:" -ForegroundColor Cyan
    Get-ChildItem -Path $BACKUP_DIR -Filter "backup_*.zip" | 
        Select-Object Name, @{Name="Tamanho (MB)";Expression={[math]::Round($_.Length / 1MB, 2)}}, LastWriteTime | 
        Format-Table -AutoSize
    
} else {
    Write-Host "❌ Erro ao realizar backup!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✨ Processo finalizado!" -ForegroundColor Green

# Limpar variável de ambiente
# Remove-Item Env:\PGPASSWORD
