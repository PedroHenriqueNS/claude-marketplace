#!/usr/bin/env bash
set -euo pipefail

cat > package.json <<'EOF'
{
  "name": "tiny-greeter",
  "version": "1.0.0",
  "main": "src/index.js",
  "scripts": { "start": "node src/index.js" },
  "dependencies": { "chalk": "5.3.0" }
}
EOF
mkdir -p src
cat > src/index.js <<'EOF'
const name = process.argv[2] || "world";
console.log(`Hello, ${name}!`);
EOF
printf '# tiny-greeter\n\nA command-line tool that prints a colored greeting.\n' > README.md
