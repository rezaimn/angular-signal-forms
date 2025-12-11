#!/bin/bash

# Migration script to replace custom service worker with Angular PWA

echo "🚀 Starting migration to Angular PWA..."

# Step 1: Install @angular/pwa
echo "📦 Installing @angular/pwa..."
ng add @angular/pwa --skip-confirmation

# Step 2: Check if custom service worker exists and remove it
if [ -f "src/service-worker.js" ]; then
    echo "🗑️  Removing custom service worker..."
    rm src/service-worker.js
fi

if [ -f "service-worker.js" ]; then
    echo "🗑️  Removing custom service worker..."
    rm service-worker.js
fi

# Step 3: Check for service worker registration in index.html
echo "🔍 Checking index.html for service worker registration..."
if grep -q "service-worker.js" src/index.html 2>/dev/null; then
    echo "⚠️  Found service worker registration in index.html. Please remove it manually."
fi

echo "✅ Migration complete!"
echo ""
echo "Next steps:"
echo "1. Update your app.module.ts to include ServiceWorkerModule (see app.module.example.ts)"
echo "2. Customize ngsw-config.json for your caching needs"
echo "3. Build with: ng build --configuration production"
echo "4. Test the PWA functionality"
