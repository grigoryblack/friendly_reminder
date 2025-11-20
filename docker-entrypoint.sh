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

# Sync database schema (using db push since no migrations exist)
echo "🔄 Syncing database schema..."
node node_modules/prisma/build/index.js db push --accept-data-loss

# Seed database (only if needed)
if [ "$RUN_SEED" = "true" ]; then
  echo "🌱 Seeding database..."
  node node_modules/prisma/build/index.js db seed || echo "⚠️  Seeding skipped or failed"
fi

echo "🎉 Starting Next.js server..."

# Set PORT if not provided (Render sets this automatically)
export PORT=${PORT:-3000}
export HOSTNAME="0.0.0.0"

echo "Server will listen on ${HOSTNAME}:${PORT}"

# Start the application
exec node server.js
