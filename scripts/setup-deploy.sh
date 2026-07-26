#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Jolie Fragrances - Deploy Setup Script
# ═══════════════════════════════════════════════════════════════

echo "⚽ Jolie Predicciones - Configuración de Deploy"
echo "═════════════════════════════════════════════════"
echo ""

# ─── 1. Google OAuth Setup ───
echo "━━━ PASO 1: Google OAuth Credentials ━━━"
echo ""
echo "Ve a: https://console.cloud.google.com/"
echo ""
echo "1. Crea un proyecto nuevo (o selecciona uno existente)"
echo "2. Ve a 'APIs & Services' > 'Credentials'"
echo "3. Click 'Create Credentials' > 'OAuth client ID'"
echo "4. Tipo: 'Web application'"
echo "5. Nombre: 'Jolie Predicciones'"
echo "6. Authorized JavaScript origins:"
echo "   - http://localhost:3000"
echo "   - https://TU-DOMINIO.vercel.app"
echo "7. Authorized redirect URIs:"
echo "   - http://localhost:3000/api/auth/callback/google"
echo "   - https://TU-DOMINIO.vercel.app/api/auth/callback/google"
echo "8. Click 'Create'"
echo "9. Copia el Client ID y Client Secret"
echo ""

read -p "Google Client ID: " GOOGLE_CLIENT_ID
read -p "Google Client Secret: " GOOGLE_CLIENT_SECRET

# ─── 2. Turso Database Setup ───
echo ""
echo "━━━ PASO 2: Turso Database ━━━"
echo ""
echo "Si no tienes cuenta de Turso:"
echo "  1. Ve a https://turso.tech/"
echo "  2. Crea una cuenta gratis"
echo "  3. Crea una base de datos: turso db create jolie-predictions"
echo ""
echo "Para obtener las credenciales:"
echo "  turso auth login"
echo "  turso db create jolie-predictions"
echo "  turso db show jolie-predictions --url"
echo "  turso db tokens create jolie-predictions"
echo ""

read -p "Turso Database URL (libsql://...): " TURSO_URL
read -p "Turso Auth Token: " TURSO_TOKEN

# ─── 3. Resend API Key ───
echo ""
echo "━━━ PASO 3: Resend API Key ━━━"
echo ""
echo "Ve a: https://resend.com/api-keys"
echo "Crea una API key (gratis hasta 100 emails/día)"
echo ""

read -p "Resend API Key (re_xxx): " RESEND_KEY

# ─── 4. NextAuth Secret ───
AUTH_SECRET=$(openssl rand -base64 32)
echo ""
echo "━━━ PASO 4: NextAuth Secret ━━━"
echo "Secret generado automáticamente: $AUTH_SECRET"

# ─── Write .env.production ───
ENV_FILE="/home/z/my-project/.env.production"
cat > "$ENV_FILE" << EOF
# ═══ Jolie Predicciones - Production Environment ═══

# Database (Turso/libSQL)
DATABASE_URL="${TURSO_URL}?authToken=${TURSO_TOKEN}"

# Google OAuth
GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID}"
GOOGLE_CLIENT_SECRET="${GOOGLE_CLIENT_SECRET}"

# NextAuth
NEXTAUTH_SECRET="${AUTH_SECRET}"
NEXTAUTH_URL="https://TU-DOMINIO.vercel.app"

# Resend (Email)
RESEND_API_KEY="${RESEND_KEY}"

# API-Football
API_FOOTBALL_KEY="5e6a5295c30205cf0ebb049f91b9fb5b"
API_FOOTBALL_HOST="v3.football.api-sports.io"

# QR HMAC Secret
QR_HMAC_SECRET="${AUTH_SECRET}"
EOF

echo ""
echo "✅ Archivo .env.production creado"
echo ""
echo "━━━ Siguiente paso: Deploy a Vercel ━━━"
echo ""
echo "Ejecuta estos comandos:"
echo ""
echo "  cd /home/z/my-project"
echo "  npx vercel login"
echo "  npx vercel --prod"
echo ""
echo "Luego agrega las variables de entorno en el dashboard de Vercel"
echo "o usando: npx vercel env add NOMBRE_VARIABLE"
