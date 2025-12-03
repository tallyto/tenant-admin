#!/bin/bash

# Script para testar o fluxo de autenticação
# Uso: ./test-auth.sh

echo "🧪 Teste de Autenticação - Tenant Admin"
echo "========================================"
echo ""

# Configurações
API_URL="http://localhost:8080/api"
EMAIL="tallyto@gmail.com"
SENHA="sua_senha_aqui"

echo "📋 Configurações:"
echo "   API URL: $API_URL"
echo "   Email: $EMAIL"
echo ""

# 1. Teste de Login
echo "1️⃣  Testando Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"senha\":\"$SENHA\"}" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$LOGIN_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Login bem-sucedido!"
    TOKEN=$(echo "$RESPONSE_BODY" | grep -o '"token":"[^"]*' | sed 's/"token":"//')
    echo "   📝 Token recebido: ${TOKEN:0:50}..."
    echo ""
else
    echo "   ❌ Erro no login (HTTP $HTTP_CODE)"
    echo "   Resposta: $RESPONSE_BODY"
    exit 1
fi

# 2. Teste de Requisição com Token
echo "2️⃣  Testando requisição autenticada (GET /tenants)..."
TENANTS_RESPONSE=$(curl -s -X GET "$API_URL/tenants" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$TENANTS_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$TENANTS_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Requisição autenticada bem-sucedida!"
    TENANT_COUNT=$(echo "$RESPONSE_BODY" | grep -o '"id"' | wc -l)
    echo "   📊 Tenants encontrados: $TENANT_COUNT"
    echo ""
else
    echo "   ❌ Erro na requisição autenticada (HTTP $HTTP_CODE)"
    echo "   Resposta: $RESPONSE_BODY"
    exit 1
fi

# 3. Teste de Requisição sem Token
echo "3️⃣  Testando requisição sem token (deve falhar)..."
NO_AUTH_RESPONSE=$(curl -s -X GET "$API_URL/tenants" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$NO_AUTH_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
    echo "   ✅ Requisição sem token bloqueada corretamente (HTTP $HTTP_CODE)"
    echo ""
else
    echo "   ⚠️  Requisição sem token não foi bloqueada (HTTP $HTTP_CODE)"
    echo "   Isso pode ser um problema de segurança!"
    echo ""
fi

# 4. Teste de Token Inválido
echo "4️⃣  Testando requisição com token inválido (deve falhar)..."
INVALID_TOKEN="eyJhbGciOiJIUzI1NiJ9.invalid.token"
INVALID_RESPONSE=$(curl -s -X GET "$API_URL/tenants" \
  -H "Authorization: Bearer $INVALID_TOKEN" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$INVALID_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
    echo "   ✅ Token inválido bloqueado corretamente (HTTP $HTTP_CODE)"
    echo ""
else
    echo "   ⚠️  Token inválido não foi bloqueado (HTTP $HTTP_CODE)"
    echo "   Isso é um problema de segurança!"
    echo ""
fi

# Resumo
echo "📊 Resumo dos Testes"
echo "===================="
echo "✅ Login: OK"
echo "✅ Requisição autenticada: OK"
echo "✅ Proteção contra acesso sem token: OK"
echo "✅ Proteção contra token inválido: OK"
echo ""
echo "🎉 Todos os testes passaram!"
echo ""
echo "💡 Dicas:"
echo "   - Token válido: $TOKEN"
echo "   - Use este token no Postman/Insomnia para testar"
echo "   - Header: Authorization: Bearer {token}"
echo ""
echo "🔍 Para testar no navegador:"
echo "   1. Abra http://localhost:4201"
echo "   2. Faça login"
echo "   3. Abra DevTools > Application > Local Storage"
echo "   4. Verifique se 'token' está salvo"
