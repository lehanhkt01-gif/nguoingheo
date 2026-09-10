#!/bin/sh
# ==============================================================================
# Script Tự Động Sao Lưu Cơ Sở Dữ Liệu Quỹ Vì Người Nghèo Ea Súp
# ==============================================================================

BACKUP_DIR="/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="backup_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Bắt đầu tiến trình sao lưu cơ sở dữ liệu ${PGDATABASE}..."

# Thực hiện pg_dump và nén trực tiếp bằng gzip
pg_dump -h "${PGHOST}" -p "${PGPORT}" -U "${PGUSER}" -d "${PGDATABASE}" | gzip > "${BACKUP_DIR}/${FILENAME}"

if [ $? -eq 0 ]; then
  echo "[$(date)] ✅ Sao lưu thành công: ${FILENAME} ($(du -h "${BACKUP_DIR}/${FILENAME}" | cut -f1))"
else
  echo "[$(date)] ❌ Lỗi sao lưu cơ sở dữ liệu!"
  exit 1
fi

# Tự động dọn dẹp các bản sao lưu cũ hơn 30 ngày để tiết kiệm dung lượng đĩa
find "${BACKUP_DIR}" -type f -name "backup_*.sql.gz" -mtime +30 -exec rm {} \;
echo "[$(date)] Hoàn tất tiến trình bảo trì dữ liệu."
