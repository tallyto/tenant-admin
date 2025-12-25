# Workflow de Desenvolvimento - Tenant Admin

## Ordem de Execução para Mudanças no Código

Sempre que fizer alterações no código, siga esta ordem:

### 1. Build
```bash
npm run build
```

### 2. Análise de Erros
- Leia atentamente todos os erros do TypeScript
- Identifique imports não utilizados
- Verifique erros de sintaxe
- Analise problemas de tipagem

### 3. Correção de Erros
- Corrija erros de sintaxe primeiro
- Remova imports não utilizados
- Ajuste tipagens se necessário
- Corrija duplicações de código

### 4. Verificação
- Execute build novamente para confirmar que não há erros
- Se houver warnings, avalie se precisam ser corrigidos

### 5. Commit
- Adicione as alterações ao git
- Faça commit com mensagem descritiva

---

## Stack Tecnológico

- **Angular 19** - Framework principal
- **PrimeNG 19** - Biblioteca de componentes UI
- **@primeng/themes** - Sistema de temas
- **PrimeIcons** - Biblioteca de ícones
- **TypeScript** - Linguagem

---

## Padrões de Código

### Componentes Standalone
```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule],
  template: `...`,
  styles: [`...`]
})
export class ExampleComponent {}
```

### Uso de PrimeNG
```typescript
// Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

// No template
<p-card>...</p-card>
<p-button label="Click" icon="pi pi-check"></p-button>
```

### Ícones PrimeIcons
```html
<!-- Use sempre classes pi pi-* -->
<i class="pi pi-check"></i>
<i class="pi pi-times"></i>
<i class="pi pi-user"></i>
```

---

## Comandos Úteis

### Desenvolvimento
```bash
npm start              # Inicia dev server
npm run start:local    # Inicia com config local
```

### Build
```bash
npm run build          # Build produção
npm run build:local    # Build local
```

### Testes
```bash
npm test              # Executa testes
```

---

## Estrutura de Diretórios

```
src/
├── app/
│   ├── core/           # Serviços, guards, interceptors
│   ├── features/       # Componentes de funcionalidades
│   ├── models/         # Modelos de dados
│   ├── shared/         # Componentes compartilhados
│   ├── app.component.ts
│   ├── app.config.ts   # Configuração global
│   └── app.routes.ts   # Rotas
├── environments/       # Variáveis de ambiente
└── styles.scss        # Estilos globais
```

---

## Checklist de Qualidade

Antes de fazer commit:

- [ ] Build executa sem erros
- [ ] Sem warnings de imports não utilizados
- [ ] Código formatado adequadamente
- [ ] Componentes usando PrimeNG quando apropriado
- [ ] Ícones usando PrimeIcons
- [ ] Tipagem TypeScript correta
- [ ] Template HTML válido

---

## Troubleshooting

### Erros Comuns

1. **Import não utilizado**
   - Remover do array de imports e do import statement

2. **Erro de sintaxe no template**
   - Verificar fechamento de tags
   - Verificar aspas e parênteses

3. **Erro de módulo PrimeNG**
   - Verificar se o módulo está importado
   - Verificar nome correto do componente

4. **Budget exceeded**
   - Normal ao adicionar bibliotecas UI
   - Avaliar se é necessário aumentar o budget

---

## Notas Importantes

- Sempre use componentes standalone
- Prefira PrimeNG para UI components
- Use PrimeIcons ao invés de emojis
- Mantenha a configuração do tema no app.config.ts
- Siga as convenções de nomenclatura do Angular
