# Tenant Admin - Painel Administrativo

Painel administrativo Angular 19 para gerenciar tenants da plataforma Salve Mais.

## Funcionalidades

- 🏢 Gerenciamento de Tenants (listar, ativar/desativar, visualizar)
- 👥 Visualização de usuários por tenant
- 📊 Dashboard com estatísticas e atividades
- 🔐 Autenticação e controle de acesso
- 📱 Interface responsiva

## Tecnologias

- Angular 19 (standalone components)
- TypeScript 5.6
- SCSS
- RxJS

## Como executar

1. Instalar dependências:
```bash
npm install
```

2. Configurar o environment:
   - Edite `src/environments/environment.ts` com a URL da API

3. Executar em desenvolvimento:
```bash
npm start
```

4. Build para produção:
```bash
npm run build
```

## Estrutura do Projeto

```
src/
├── app/
│   ├── core/           # Serviços core (auth, http, guards)
│   ├── shared/         # Componentes compartilhados
│   ├── features/       # Módulos de funcionalidades
│   │   ├── auth/       # Login/Logout
│   │   ├── tenants/    # Gerenciamento de tenants
│   │   └── dashboard/  # Dashboard principal
│   └── models/         # Interfaces e types
├── assets/             # Imagens, ícones, etc
└── environments/       # Configurações de ambiente
```

## API Backend

A aplicação se conecta com a API Spring Boot em `http://localhost:8080/api`

Endpoints principais:
- `GET /api/tenants` - Listar tenants
- `GET /api/tenants/{id}` - Buscar tenant específico
- `DELETE /api/tenants/{id}` - Deletar tenant
- `POST /api/tenants/cadastro` - Cadastrar novo tenant
