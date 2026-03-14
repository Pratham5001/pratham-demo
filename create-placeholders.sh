#!/bin/bash
# Creates a simple SVG placeholder and copies it to the public images folder
mkdir -p /home/claude/thrift-store/public/images

cat > /home/claude/thrift-store/public/images/default-avatar.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="50" fill="#EDE3D6"/>
  <circle cx="50" cy="35" r="18" fill="#B8A99A"/>
  <ellipse cx="50" cy="85" rx="28" ry="22" fill="#B8A99A"/>
</svg>
EOF

cat > /home/claude/thrift-store/public/images/placeholder.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="#EDE3D6"/>
  <text x="200" y="145" text-anchor="middle" fill="#B8A99A" font-size="40">👕</text>
  <text x="200" y="185" text-anchor="middle" fill="#B8A99A" font-size="16">No Image</text>
</svg>
EOF

echo "Placeholder images created"
