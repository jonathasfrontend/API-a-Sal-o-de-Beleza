#!/bin/bash
# =============================================
# SCRIPT DE BACKUP AUTOMÁTICO
# Sistema de Gerenciamento de Salão
# =============================================

# Configurações
DB_NAME="salao_beleza"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"
BACKUP_DIR="./backups"
RETENTION_DAYS=30

# Criar diretório de backup se não existir
mkdir -p $BACKUP_DIR

# Data e hora atual
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/backup_${DB_NAME}_${TIMESTAMP}.dump"

echo "🔄 Iniciando backup do banco de dados..."
echo "📅 Data/Hora: $(date)"
echo "🗄️  Banco: ${DB_NAME}"
echo "📁 Arquivo: ${BACKUP_FILE}"

# Executar backup
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -F c -b -v -f $BACKUP_FILE

# Verificar se backup foi bem-sucedido
if [ $? -eq 0 ]; then
    echo "✅ Backup concluído com sucesso!"
    
    # Comprimir backup
    gzip $BACKUP_FILE
    echo "📦 Backup comprimido: ${BACKUP_FILE}.gz"
    
    # Calcular tamanho
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
    echo "📊 Tamanho: ${BACKUP_SIZE}"
    
    # Remover backups antigos
    echo "🧹 Removendo backups com mais de ${RETENTION_DAYS} dias..."
    find $BACKUP_DIR -name "backup_*.dump.gz" -mtime +$RETENTION_DAYS -delete
    
    # Listar backups existentes
    echo ""
    echo "📋 Backups disponíveis:"
    ls -lh $BACKUP_DIR/*.dump.gz 2>/dev/null || echo "Nenhum backup encontrado"
    
else
    echo "❌ Erro ao realizar backup!"
    exit 1
fi

echo ""
echo "✨ Processo finalizado!"
