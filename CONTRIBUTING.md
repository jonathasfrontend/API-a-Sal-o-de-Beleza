# 🤝 Guia de Contribuição

Obrigado por considerar contribuir com o Sistema de Gerenciamento para Salão de Beleza! Este documento fornece diretrizes para contribuir com o projeto.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Posso Contribuir?](#como-posso-contribuir)
- [Processo de Desenvolvimento](#processo-de-desenvolvimento)
- [Padrões de Código](#padrões-de-código)
- [Padrões de Commit](#padrões-de-commit)
- [Testes](#testes)
- [Documentação](#documentação)
- [Pull Requests](#pull-requests)

---

## 📜 Código de Conduta

### Nosso Compromisso

Nós, como membros, contribuidores e líderes, nos comprometemos a tornar a participação em nossa comunidade uma experiência livre de assédio para todos, independentemente de:

- Idade, tamanho corporal, deficiência visível ou invisível
- Etnia, características sexuais, identidade e expressão de gênero
- Nível de experiência, educação, status socioeconômico
- Nacionalidade, aparência pessoal, raça, religião
- Identidade e orientação sexual

### Comportamentos Esperados

✅ Demonstrar empatia e gentileza  
✅ Respeitar opiniões, pontos de vista e experiências diferentes  
✅ Dar e receber feedback construtivo  
✅ Aceitar responsabilidade e pedir desculpas quando necessário  
✅ Focar no que é melhor para a comunidade  

### Comportamentos Inaceitáveis

❌ Uso de linguagem ou imagens sexualizadas  
❌ Trolling, comentários insultuosos ou depreciativos  
❌ Assédio público ou privado  
❌ Publicar informações privadas de terceiros  
❌ Conduta inadequada em ambiente profissional  

### Aplicação

Violações podem ser reportadas para [contato@seudominio.com]. Todas as reclamações serão revisadas e investigadas de forma justa.

---

## 🎯 Como Posso Contribuir?

### 🐛 Reportar Bugs

Antes de criar um report de bug:

1. **Verifique se já não existe** uma issue sobre o problema
2. **Use a versão mais recente** do código
3. **Colete informações** sobre o bug

#### Template de Bug Report

```markdown
**Descrição**
Descrição clara e concisa do bug.

**Passos para Reproduzir**
1. Vá para '...'
2. Clique em '...'
3. Role até '...'
4. Veja o erro

**Comportamento Esperado**
O que deveria acontecer.

**Comportamento Atual**
O que está acontecendo.

**Screenshots**
Se aplicável, adicione screenshots.

**Ambiente**
- SO: [e.g. Windows 11]
- Node.js: [e.g. 18.17.0]
- npm: [e.g. 9.6.7]
- Versão do projeto: [e.g. 1.0.0]

**Contexto Adicional**
Qualquer informação adicional relevante.
```

### 💡 Sugerir Funcionalidades

Antes de sugerir uma funcionalidade:

1. **Verifique se já não foi sugerida** nas issues
2. **Pense bem na proposta** - ela é realmente útil para a maioria dos usuários?
3. **Seja específico** sobre o que você quer

#### Template de Feature Request

```markdown
**A funcionalidade resolve algum problema?**
Descrição clara do problema. Ex: Fico frustrado quando [...]

**Descreva a solução que você gostaria**
Descrição clara e concisa da solução desejada.

**Descreva alternativas que você considerou**
Outras soluções ou funcionalidades que você considerou.

**Contexto Adicional**
Screenshots, mockups, exemplos de outros sistemas.
```

### 🔧 Contribuir com Código

1. **Fork** o repositório
2. **Clone** seu fork localmente
3. **Crie uma branch** para sua feature/fix
4. **Faça suas alterações**
5. **Teste** suas alterações
6. **Commit** seguindo os padrões
7. **Push** para seu fork
8. **Abra um Pull Request**

### 📝 Melhorar Documentação

Documentação é crucial! Contribuições são bem-vindas:

- Corrigir erros de digitação
- Melhorar clareza de explicações
- Adicionar exemplos
- Traduzir documentação
- Criar tutoriais

---

## 🛠️ Processo de Desenvolvimento

### 1️⃣ Configurar Ambiente Local

```bash
# Fork e clone o repositório
git clone https://github.com/seu-usuario/sistema-salao-backend.git
cd sistema-salao-backend

# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env
# Edite .env com suas configurações

# Executar migrations
npm run prisma:generate
npm run prisma:migrate

# Iniciar em modo desenvolvimento
npm run dev
```

### 2️⃣ Criar Branch

```bash
# Certifique-se de estar na branch main atualizada
git checkout main
git pull origin main

# Crie uma nova branch
git checkout -b tipo/descricao-curta

# Exemplos:
git checkout -b feat/adicionar-sistema-pontos
git checkout -b fix/corrigir-calculo-comissao
git checkout -b docs/atualizar-readme
```

### 3️⃣ Fazer Alterações

- Siga os [padrões de código](#padrões-de-código)
- Escreva código limpo e legível
- Adicione comentários quando necessário
- Mantenha consistência com o código existente

### 4️⃣ Testar

```bash
# Executar todos os testes
npm test

# Executar testes específicos
npm test -- appointments.test.ts

# Verificar cobertura
npm run test:coverage

# Lint
npm run lint
npm run lint:fix
```

### 5️⃣ Commit

Siga as [convenções de commit](#padrões-de-commit):

```bash
git add .
git commit -m "feat: adiciona sistema de pontos de fidelidade"
```

### 6️⃣ Push

```bash
git push origin feat/adicionar-sistema-pontos
```

### 7️⃣ Pull Request

Abra um PR seguindo o [template](#pull-requests).

---

## 💻 Padrões de Código

### TypeScript

- ✅ **Use TypeScript** para todos os arquivos
- ✅ **Evite `any`** - use tipos específicos
- ✅ **Defina interfaces** para objetos complexos
- ✅ **Use enums** para valores fixos

```typescript
// ❌ Ruim
function createUser(data: any) {
  // ...
}

// ✅ Bom
interface CreateUserDto {
  name: string;
  email: string;
  role: UserRole;
}

function createUser(data: CreateUserDto) {
  // ...
}
```

### Nomenclatura

```typescript
// Classes, Interfaces, Types: PascalCase
class AppointmentsService { }
interface CreateAppointmentDto { }
type UserRole = 'ADMIN' | 'MANAGER';

// Funções, variáveis: camelCase
const userName = 'João';
async function fetchAppointments() { }

// Constantes: UPPER_SNAKE_CASE
const MAX_UPLOAD_SIZE = 5242880;

// Arquivos: kebab-case
// appointments.controller.ts
// auth.middleware.ts
```

### Estrutura de Arquivos

```typescript
// 1. Imports de bibliotecas externas
import { Request, Response } from 'express';
import { z } from 'zod';

// 2. Imports internos (config, utils)
import { logger } from '@/utils/logger';
import { prisma } from '@/config/db';

// 3. Imports de módulos locais
import { AppointmentsService } from './appointments.service';

// 4. Types e Interfaces
interface CreateAppointmentDto {
  clientId: string;
  staffId: string;
  startTime: Date;
}

// 5. Classe/Função principal
class AppointmentsController {
  async create(req: Request, res: Response) {
    // ...
  }
}

// 6. Export
export default new AppointmentsController();
```

### Formatação

```typescript
// Indentação: 2 espaços
function exemplo() {
  if (condicao) {
    // código
  }
}

// Aspas: simples
const nome = 'João';

// Ponto e vírgula: sempre
const valor = 10;

// Arrow functions: use quando apropriado
const soma = (a: number, b: number) => a + b;

// Template strings: para interpolação
const mensagem = `Olá, ${nome}!`;
```

### Comentários

```typescript
// ✅ Bom: explica o "porquê"
// Aguarda 1 segundo para evitar race condition no banco
await sleep(1000);

// ❌ Ruim: explica o "o quê" (óbvio pelo código)
// Incrementa contador
counter++;
```

### Error Handling

```typescript
// ✅ Bom: erros específicos
class AppointmentNotFoundError extends Error {
  constructor(id: string) {
    super(`Appointment with id ${id} not found`);
    this.name = 'AppointmentNotFoundError';
  }
}

// ✅ Bom: try-catch em pontos críticos
try {
  await paymentGateway.charge(amount);
} catch (error) {
  logger.error('Payment failed', { error, amount });
  throw new PaymentError('Falha ao processar pagamento');
}
```

### Async/Await

```typescript
// ✅ Bom
async function fetchData() {
  try {
    const data = await database.query();
    return data;
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

// ❌ Evite callbacks
function fetchData(callback) {
  database.query((err, data) => {
    if (err) callback(err);
    else callback(null, data);
  });
}
```

---

## 📝 Padrões de Commit

### Conventional Commits

Seguimos a especificação [Conventional Commits](https://www.conventionalcommits.org/).

#### Formato

```
<tipo>[escopo opcional]: <descrição>

[corpo opcional]

[rodapé opcional]
```

#### Tipos

| Tipo | Descrição | Exemplo |
|------|-----------|---------|
| `feat` | Nova funcionalidade | `feat: adiciona sistema de pontos` |
| `fix` | Correção de bug | `fix: corrige cálculo de comissão` |
| `docs` | Documentação | `docs: atualiza guia de instalação` |
| `style` | Formatação de código | `style: formata controllers com prettier` |
| `refactor` | Refatoração | `refactor: simplifica lógica de agendamentos` |
| `test` | Testes | `test: adiciona testes para payments` |
| `chore` | Tarefas de manutenção | `chore: atualiza dependências` |
| `perf` | Performance | `perf: otimiza query de relatórios` |
| `ci` | Integração contínua | `ci: adiciona workflow do GitHub Actions` |
| `build` | Sistema de build | `build: atualiza configuração do Docker` |
| `revert` | Reverter commit | `revert: reverte commit abc123` |

#### Escopo (Opcional)

Indica a parte do código afetada:

```
feat(auth): adiciona autenticação 2FA
fix(appointments): corrige validação de horário
docs(api): atualiza documentação de endpoints
```

#### Descrição

- Use imperativo: "adiciona", não "adicionado" ou "adicionando"
- Não capitalize a primeira letra
- Sem ponto final
- Máximo 50 caracteres

#### Exemplos

```bash
# Feature
git commit -m "feat: adiciona sistema de avaliações de clientes"

# Fix
git commit -m "fix: corrige erro ao deletar agendamento"

# Docs
git commit -m "docs: adiciona exemplos de uso da API"

# Com escopo
git commit -m "feat(payments): integra com Stripe"

# Breaking change
git commit -m "feat!: muda estrutura de retorno da API

BREAKING CHANGE: endpoints agora retornam { success, data } ao invés de apenas data"

# Múltiplas linhas
git commit -m "feat: adiciona filtros avançados nos relatórios

- Filtro por data
- Filtro por profissional
- Filtro por serviço
- Exportação em PDF"
```

---

## 🧪 Testes

### Cobertura Mínima

- ✅ **Services:** 80%+
- ✅ **Utilities:** 90%+
- ✅ **Critical paths:** 100%

### Estrutura de Testes

```typescript
// appointments.service.test.ts
describe('AppointmentsService', () => {
  describe('create', () => {
    it('deve criar agendamento com dados válidos', async () => {
      // Arrange
      const data = {
        clientId: 'uuid',
        staffId: 'uuid',
        startTime: new Date()
      };
      
      // Act
      const result = await appointmentsService.create(data);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.clientId).toBe(data.clientId);
    });
    
    it('deve lançar erro se horário indisponível', async () => {
      // Arrange
      const data = { /* ... */ };
      
      // Act & Assert
      await expect(appointmentsService.create(data))
        .rejects
        .toThrow('Horário indisponível');
    });
  });
});
```

### Executar Testes

```bash
# Todos os testes
npm test

# Watch mode
npm run test:watch

# Com cobertura
npm run test:coverage

# Teste específico
npm test -- appointments.test.ts
```

---

## 📚 Documentação

### Quando Documentar

- ✅ Novas funcionalidades
- ✅ Mudanças em APIs públicas
- ✅ Configurações complexas
- ✅ Decisões arquiteturais importantes

### O Que Documentar

#### README.md
- Visão geral do projeto
- Instruções de instalação
- Exemplos de uso básico

#### docs/
- Guias detalhados
- Tutoriais
- Referências de API
- Decisões arquiteturais

#### Código
```typescript
/**
 * Cria um novo agendamento e envia notificações.
 * 
 * @param data - Dados do agendamento
 * @returns Agendamento criado
 * @throws {AppointmentConflictError} Se horário indisponível
 * @throws {ValidationError} Se dados inválidos
 * 
 * @example
 * ```typescript
 * const appointment = await appointmentsService.create({
 *   clientId: 'uuid',
 *   staffId: 'uuid',
 *   startTime: new Date()
 * });
 * ```
 */
async create(data: CreateAppointmentDto): Promise<Appointment> {
  // ...
}
```

---

## 🔄 Pull Requests

### Antes de Submeter

- [ ] Código segue os padrões do projeto
- [ ] Testes foram adicionados/atualizados
- [ ] Todos os testes passam (`npm test`)
- [ ] Lint passa (`npm run lint`)
- [ ] Documentação foi atualizada
- [ ] Commits seguem o padrão Conventional Commits
- [ ] Branch está atualizada com `main`

### Template de PR

```markdown
## Descrição
Descrição clara e concisa das mudanças.

## Tipo de Mudança
- [ ] 🐛 Bug fix (correção de bug)
- [ ] ✨ Nova funcionalidade
- [ ] 💥 Breaking change
- [ ] 📝 Documentação
- [ ] ♻️ Refatoração
- [ ] ⚡ Performance
- [ ] ✅ Testes

## Como Testar
1. Passo 1
2. Passo 2
3. ...

## Checklist
- [ ] Código segue os padrões do projeto
- [ ] Testes adicionados/atualizados
- [ ] Todos os testes passam
- [ ] Lint passa
- [ ] Documentação atualizada
- [ ] Commits seguem Conventional Commits

## Screenshots (se aplicável)
![screenshot](url)

## Issues Relacionadas
Fixes #123
Closes #456
```

### Processo de Review

1. **Automático:** CI/CD executa testes e lint
2. **Manual:** Maintainer revisa o código
3. **Feedback:** Mudanças podem ser solicitadas
4. **Aprovação:** PR é aprovado
5. **Merge:** PR é mergeado para `main`

### Tempo de Review

- **Bug fixes:** 1-2 dias
- **Features pequenas:** 2-4 dias
- **Features grandes:** 1-2 semanas

---

## 🎯 Boas Práticas

### DRY (Don't Repeat Yourself)

```typescript
// ❌ Ruim
const user1 = await prisma.user.findUnique({ where: { id: id1 } });
const user2 = await prisma.user.findUnique({ where: { id: id2 } });

// ✅ Bom
const findUser = (id: string) => 
  prisma.user.findUnique({ where: { id } });

const user1 = await findUser(id1);
const user2 = await findUser(id2);
```

### KISS (Keep It Simple, Stupid)

```typescript
// ❌ Complexo demais
const isValid = (data) => {
  if (data) {
    if (data.name) {
      if (data.email) {
        return true;
      }
    }
  }
  return false;
};

// ✅ Simples
const isValid = (data) => 
  data?.name && data?.email;
```

### YAGNI (You Aren't Gonna Need It)

Não implemente funcionalidades que você acha que vai precisar no futuro. Implemente apenas o que é necessário agora.

---

## 🆘 Precisa de Ajuda?

- 📖 Leia a [documentação](docs/)
- 💬 Abra uma [discussion](https://github.com/seu-usuario/sistema-salao-backend/discussions)
- 📧 Entre em contato: contato@seudominio.com
- 💡 Veja [issues marcadas como "good first issue"](https://github.com/seu-usuario/sistema-salao-backend/labels/good%20first%20issue)

---

## 🙏 Agradecimentos

Obrigado por contribuir! Sua ajuda torna este projeto melhor para todos. ❤️

---

**Última atualização:** 1 de dezembro de 2025
