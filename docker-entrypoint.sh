#!/bin/sh
set -e

echo "🚀 Starting Friendly Reminder application..."

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
until node -e "require('./node_modules/.prisma/client')" 2>/dev/null; do
  echo "Database not ready yet, waiting..."
  sleep 2
done

echo "✅ Database connection established"

# Run migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

# Seed database (only if needed)
if [ "$RUN_SEED" = "true" ]; then
  echo "🌱 Seeding database..."
  npx prisma db seed || echo "⚠️  Seeding skipped or failed"
fi

echo "🎉 Starting Next.js server..."

# Start the application
exec node server.js
