#!/bin/bash
# Quick script to add .js extensions to relative imports in TypeScript files

TOOLS_DIR="${1:-./tools}"

echo "Fixing imports in $TOOLS_DIR..."

find "$TOOLS_DIR" -name "*.ts" -type f | while read file; do
  # Skip .d.ts files
  [[ "$file" == *.d.ts ]] && continue
  
  # Create backup
  cp "$file" "$file.bak"
  
  # Add .js to relative imports (but not if already has extension or is node_modules)
  sed -i.tmp \
    -e "s/from ['\"]\(\.[^'\"]*\)['\"]/from '\1.js'/g" \
    -e "s/from ['\"]\(\.[^'\"]*\)\.js\.js['\"]/from '\1.js'/g" \
    "$file"
  
  # Remove temp file
  rm -f "$file.tmp"
  
  echo "Processed: $file"
done

echo "Done! Review changes and remove .bak files if satisfied."
