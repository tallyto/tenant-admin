# 🏗️ Arquitetura Multi-Tenancy

Este documento detalha a arquitetura de multi-tenancy utilizada no sistema.

## 📋 Índice
- [Visão Geral](#visão-geral)
- [Modelo de Isolamento](#modelo-de-isolamento)
- [Componentes Principais](#componentes-principais)
- [Fluxos de Dados](#fluxos-de-dados)
- [Considerações Importantes](#considerações-importantes)

## Visão Geral

O sistema utiliza **Schema-per-Tenant** (schema separado por tenant), onde cada tenant possui seu próprio schema de banco de dados PostgreSQL para total isolamento de dados.

### Características

✅ **Isolamento Completo**: Cada tenant tem seu próprio schema  
✅ **Segurança**: Dados de um tenant nunca vazam para outro  
✅ **Escalabilidade**: Schemas independentes permitem crescimento isolado  
✅ **Manutenção**: Migrations podem ser aplicadas por tenant  

## Modelo de Isolamento

```
PostgreSQL Database
├── public schema
│   └── tenants table (metadados dos tenants)
│       ├── id
│       ├── domain (nome do schema)
│       ├── name
│       ├── active
│       └── ...
│
├── tenant1.com.br schema
│   └── usuarios table
│       ├── id
│       ├── nome
│       ├── email
│       └── ...
│
├── tenant2.com.br schema
│   └── usuarios table
│       └── ...
│
└── tenant3.com.br schema
    └── usuarios table
        └── ...
```

## Componentes Principais

### 1. TenantContext
**Arquivo**: `src/main/java/com/tallyto/gestorfinanceiro/infrastructure/persistence/tenancy/TenantContext.java`

Gerencia o contexto do tenant ativo usando `ThreadLocal`.

```java
public class TenantContext {
    private static final ThreadLocal<String> currentTenant = new ThreadLocal<>();

    public static void setCurrentTenant(String tenant) {
        currentTenant.set(tenant);
    }

    public static String getCurrentTenant() {
        return currentTenant.get();
    }

    public static void clear() {
        currentTenant.remove();
    }
}
```

**Responsabilidades**:
- Armazenar o schema ativo por thread
- Permitir troca de contexto
- Prevenir vazamento de contexto entre requisições

### 2. MultiTenantConnectionProviderImpl
**Arquivo**: `src/main/java/com/tallyto/gestorfinanceiro/infrastructure/persistence/tenancy/MultiTenantConnectionProviderImpl.java`

Implementa `MultiTenantConnectionProvider` do Hibernate para trocar schemas automaticamente.

```java
@Override
public Connection getConnection(String tenantIdentifier) throws SQLException {
    Connection connection = dataSource.getConnection();
    connection.setSchema(tenantIdentifier); // Troca para o schema do tenant
    return connection;
}
```

**Responsabilidades**:
- Fornecer conexões com o schema correto
- Aplicar `connection.setSchema()` automaticamente
- Gerenciar pool de conexões

### 3. TenantService
**Arquivo**: `src/main/java/com/tallyto/gestorfinanceiro/core/application/services/TenantService.java`

Contém a lógica de negócio para operações que envolvem múltiplos schemas.

**Métodos importantes**:

#### getUsuariosByTenant(Long tenantId)
Busca usuários de um tenant específico trocando temporariamente para seu schema.

```java
public List<UsuarioTenantDTO> getUsuariosByTenant(Long tenantId) {
    Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new RuntimeException("Tenant não encontrado"));
    
    String tenantDomain = tenant.getDomain();
    String currentTenant = TenantContext.getCurrentTenant();
    
    try {
        // Troca para o schema do tenant
        TenantContext.setCurrentTenant(tenantDomain);
        
        // Busca usuários no schema do tenant
        return usuarioRepository.findAll().stream()
                .map(usuario -> new UsuarioTenantDTO(
                        usuario.getId(),
                        usuario.getNome(),
                        usuario.getEmail(),
                        usuario.getCriadoEm(),
                        usuario.getUltimoAcesso()
                ))
                .collect(Collectors.toList());
    } finally {
        // Restaura o contexto original
        TenantContext.setCurrentTenant(currentTenant);
    }
}
```

#### getStats()
Calcula estatísticas agregando dados de todos os schemas.

```java
public TenantStatsDTO getStats() {
    List<Tenant> allTenants = tenantRepository.findAll();
    
    long totalTenants = allTenants.size();
    long activeTenants = allTenants.stream().filter(Tenant::isActive).count();
    long inactiveTenants = totalTenants - activeTenants;
    
    // Agrega usuários de todos os schemas
    long totalUsers = 0;
    String currentTenant = TenantContext.getCurrentTenant();
    
    for (Tenant tenant : allTenants) {
        try {
            TenantContext.setCurrentTenant(tenant.getDomain());
            totalUsers += usuarioRepository.count();
        } catch (Exception e) {
            // Schema pode não existir ainda para tenant novo
            System.err.println("Erro ao contar usuários do tenant " + 
                              tenant.getDomain() + ": " + e.getMessage());
        } finally {
            TenantContext.setCurrentTenant(currentTenant);
        }
    }
    
    return new TenantStatsDTO(totalTenants, activeTenants, inactiveTenants, totalUsers);
}
```

## Fluxos de Dados

### Fluxo: Buscar Usuários de um Tenant

```
┌─────────────┐
│   Cliente   │
│  (Angular)  │
└──────┬──────┘
       │
       │ GET /api/tenants/123/usuarios
       │
       ▼
┌──────────────────┐
│ TenantController │
└────────┬─────────┘
         │
         │ getUsuariosByTenant(123)
         │
         ▼
┌──────────────────────────────────────────────┐
│            TenantService                     │
├──────────────────────────────────────────────┤
│ 1. Busca tenant no schema "public"          │
│    tenantRepository.findById(123)            │
│    → Retorna: { id: 123, domain: "abc.com" }│
│                                              │
│ 2. Salva contexto atual                     │
│    currentTenant = getCurrentTenant()        │
│                                              │
│ 3. Troca para schema do tenant              │
│    setCurrentTenant("abc.com")               │
│                                              │
│ 4. Busca usuários no schema "abc.com"       │
│    usuarioRepository.findAll()               │
│                                              │
│ 5. Restaura contexto original (finally)     │
│    setCurrentTenant(currentTenant)           │
└────────┬─────────────────────────────────────┘
         │
         │ List<UsuarioTenantDTO>
         │
         ▼
┌──────────────────┐
│ TenantController │
└────────┬─────────┘
         │
         │ ResponseEntity<List<...>>
         │
         ▼
┌─────────────┐
│   Cliente   │
│  (Angular)  │
└─────────────┘
```

### Fluxo: Calcular Estatísticas

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │
       │ GET /api/tenants/stats
       │
       ▼
┌──────────────────────────────────────────────┐
│            TenantService.getStats()          │
├──────────────────────────────────────────────┤
│ 1. Busca todos tenants (schema "public")    │
│    List<Tenant> = findAll()                  │
│                                              │
│ 2. Calcula totais simples                   │
│    totalTenants = 3                          │
│    activeTenants = 2                         │
│    inactiveTenants = 1                       │
│                                              │
│ 3. Itera cada tenant para contar usuários   │
│    ┌──────────────────────────────────────┐ │
│    │ for (Tenant t : allTenants)          │ │
│    │   setCurrentTenant(t.getDomain())    │ │
│    │   totalUsers += usuarioRepo.count()  │ │
│    │   restore context (finally)          │ │
│    └──────────────────────────────────────┘ │
│                                              │
│ 4. Retorna TenantStatsDTO                   │
│    { totalTenants, activeTenants,            │
│      inactiveTenants, totalUsers }           │
└──────────────────────────────────────────────┘
```

## Considerações Importantes

### ⚠️ Gestão de Contexto

**SEMPRE use try-finally ao trocar schemas**:

```java
String currentTenant = TenantContext.getCurrentTenant();
try {
    TenantContext.setCurrentTenant(targetSchema);
    // operações no schema
} finally {
    TenantContext.setCurrentTenant(currentTenant); // CRÍTICO!
}
```

❌ **Sem finally**: Vazamento de contexto entre requisições  
✅ **Com finally**: Contexto sempre restaurado

### 🔒 Isolamento de Dados

- Cada tenant **NUNCA** acessa dados de outro tenant
- `UsuarioRepository.findAll()` retorna apenas usuários do schema ativo
- Não há campo `tenantId` na tabela `usuarios` - o isolamento é por schema

### 🚀 Performance

**Operações cross-schema** (como `getStats()`) são custosas:
- Cada tenant requer uma troca de schema
- Cada troca envolve `connection.setSchema()`
- Com muitos tenants, considere:
  - Cache das estatísticas
  - Atualização assíncrona
  - Agregação em background job

### 🐛 Tratamento de Erros

Schemas podem não existir para tenants recém-criados:

```java
try {
    TenantContext.setCurrentTenant(tenant.getDomain());
    // operações
} catch (Exception e) {
    // Log e continua - schema pode não existir ainda
    logger.error("Schema {} não acessível", tenant.getDomain(), e);
} finally {
    // restaura contexto
}
```

### 📝 Migrations

Cada tenant precisa ter as migrations aplicadas ao seu schema:
- Migrations no schema `public` para tabela `tenants`
- Migrations em cada schema de tenant para tabelas de negócio (`usuarios`, etc.)

### 🧪 Testes

Ao testar funcionalidades multi-tenant:
1. Configure ambiente com múltiplos schemas
2. Teste isolamento de dados entre schemas
3. Teste restauração de contexto
4. Teste comportamento com schema inexistente

## Diagramas

### Diagrama de Schemas

```
┌─────────────────────────────────────────────────┐
│         PostgreSQL Database Instance            │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────┐                               │
│  │ public       │ (Schema Público)              │
│  ├──────────────┤                               │
│  │ • tenants    │ ← Metadados de todos tenants  │
│  └──────────────┘                               │
│                                                 │
│  ┌──────────────┐                               │
│  │ empresa1.com │ (Schema do Tenant 1)          │
│  ├──────────────┤                               │
│  │ • usuarios   │ ← Usuários da Empresa 1       │
│  │ • contas     │                               │
│  │ • transacoes │                               │
│  └──────────────┘                               │
│                                                 │
│  ┌──────────────┐                               │
│  │ empresa2.com │ (Schema do Tenant 2)          │
│  ├──────────────┤                               │
│  │ • usuarios   │ ← Usuários da Empresa 2       │
│  │ • contas     │                               │
│  │ • transacoes │                               │
│  └──────────────┘                               │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Diagrama de Contexto

```
Thread 1 (Request A)          Thread 2 (Request B)
TenantContext                 TenantContext
┌─────────────────┐          ┌─────────────────┐
│ ThreadLocal     │          │ ThreadLocal     │
│ "empresa1.com"  │          │ "empresa2.com"  │
└────────┬────────┘          └────────┬────────┘
         │                            │
         ▼                            ▼
    Connection                   Connection
    schema=empresa1.com          schema=empresa2.com
         │                            │
         ▼                            ▼
    usuarios (Empresa 1)         usuarios (Empresa 2)
```

## Referências

- [Hibernate Multi-Tenancy](https://docs.jboss.org/hibernate/orm/5.6/userguide/html_single/Hibernate_User_Guide.html#multitenacy)
- [PostgreSQL Schemas](https://www.postgresql.org/docs/current/ddl-schemas.html)
- [ThreadLocal Best Practices](https://www.baeldung.com/java-threadlocal)

---

**Última atualização**: [Data da última modificação]  
**Autor**: Equipe de Desenvolvimento
