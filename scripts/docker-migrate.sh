#!/bin/sh
cd /app || exit 1

echo "Alembic revision files:"
ls -1 alembic/versions/*.py || {
  echo "ERROR: alembic/versions boş veya yok — imajı yeniden derleyin: docker compose build --no-cache"
  exit 1
}

i=0
while [ "$i" -lt 30 ]; do
  if alembic upgrade head; then
    echo "Alembic: upgrade head OK"
    exit 0
  fi
  i=$((i + 1))
  echo "Alembic failed (attempt $i/30), retry in 2s..."
  sleep 2
done

echo "Alembic upgrade head failed."
echo "Sık neden: eski imaj (0002 dosyası yok) → docker compose build --no-cache"
echo "veya DB'de alembic_version uyumsuz → geliştirme için: docker compose down -v (VERİ SİLİNİR)"
exit 1
