#!/bin/bash
# ============================================
# 🚀 Jolie Fragrances - Git Push Script
# ============================================
# Uso: ./git-push.sh "Descripción del cambio"
# Ejemplo: ./git-push.sh "Corregidas notas de perfume Asad"
# ============================================

cd /home/z/my-project

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Verificar que se pasó un mensaje
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Necesitas escribir un mensaje${NC}"
    echo -e "${YELLOW}Uso: ./git-push.sh \"Descripción del cambio\"${NC}"
    echo -e "${YELLOW}Ejemplo: ./git-push.sh \"Corregidas notas de perfume Asad\"${NC}"
    exit 1
fi

MESSAGE="$1"

echo -e "${CYAN}═══════════════════════════════════════════${NC}"
echo -e "${CYAN}  🚀 Jolie Fragrances - Git Push${NC}"
echo -e "${CYAN}═══════════════════════════════════════════${NC}"

# 1. Ver cambios
echo -e "\n${YELLOW}📋 Cambios detectados:${NC}"
git status --short

# Si no hay cambios, salir
if [ -z "$(git status --short)" ]; then
    echo -e "\n${GREEN}✅ No hay cambios para commitear. Todo está actualizado.${NC}"
    exit 0
fi

# 2. Agregar todos los cambios
echo -e "\n${YELLOW}📦 Agregando cambios...${NC}"
git add .

# 3. Hacer commit
echo -e "${YELLOW}💾 Haciendo commit...${NC}"
git commit -m "$MESSAGE"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al hacer commit${NC}"
    exit 1
fi

# 4. Push a GitHub
echo -e "${YELLOW}☁️ Subiendo a GitHub...${NC}"
git push origin main

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al subir a GitHub${NC}"
    exit 1
fi

# 5. Éxito
echo -e "\n${GREEN}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ ¡Subido exitosamente a GitHub!${NC}"
echo -e "${GREEN}  📝 Commit: $MESSAGE${NC}"
echo -e "${GREEN}  🔗 https://github.com/ItsJolex3630/jolie-fragrances${NC}"
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
