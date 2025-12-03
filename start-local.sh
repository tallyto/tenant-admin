#!/bin/bash

# Script para rodar o Tenant Admin Panel localmente
# Uso: ./start-local.sh

echo "🚀 Iniciando Tenant Admin Panel (Ambiente Local)"
echo ""
echo "📋 Configurações:"
echo "   - Ambiente: Local"
echo "   - API URL: http://localhost:8080/api"
echo "   - Frontend URL: http://localhost:4200"
echo ""

# Verificar se o backend está rodando
echo "🔍 Verificando se o backend está rodando..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/actuator/health 2>/dev/null | grep -q "200"; then
    echo "✅ Backend está rodando em http://localhost:8080"
else
    echo "⚠️  Backend não está respondendo em http://localhost:8080"
    echo "   Certifique-se de iniciar o Spring Boot antes de continuar."
    echo ""
    read -p "Deseja continuar mesmo assim? (s/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo "❌ Abortando..."
        exit 1
    fi
fi

echo ""
echo "📦 Instalando dependências (se necessário)..."
npm install

echo ""
echo "🏃 Iniciando servidor de desenvolvimento..."
echo "   Acesse: http://localhost:4200"
echo ""
echo "   Para parar o servidor, pressione Ctrl+C"
echo ""

# Rodar com configuração local
npm run start:local
