# Contact Remarketing Bot

Uma aplicação web moderna para gerenciamento e automação de mensagens em massa via WhatsApp, construída com React, TypeScript, e Supabase.

## 🚀 Funcionalidades

- Conexão com WhatsApp via QR Code
- Gerenciamento de contatos
- Envio de mensagens em massa
- Importação de contatos via CSV
- Tracking de estatísticas
- Interface moderna e responsiva

## 🏗️ Arquitetura

### Frontend (React + TypeScript)

```
src/
├── components/        # Componentes reutilizáveis
├── contexts/         # Contextos React para gerenciamento de estado
├── hooks/           # Hooks personalizados
├── integrations/    # Integrações com serviços externos
├── pages/          # Componentes de página
├── services/       # Serviços de API e lógica de negócios
└── types/          # Definições de tipos TypeScript
```

### Backend (Supabase)

O backend é gerenciado pelo Supabase, oferecendo:
- Autenticação de usuários
- Banco de dados PostgreSQL
- Row Level Security (RLS)
- Políticas de segurança granulares

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

1. `auth.users` (gerenciada pelo Supabase)
   - Autenticação e informações básicas do usuário

2. `contacts`
   ```sql
   - id: UUID (PK)
   - user_id: UUID (FK -> auth.users)
   - name: TEXT
   - phone: TEXT
   - created_at: TIMESTAMPTZ
   ```
   - Armazena os contatos dos usuários
   - RLS garante que usuários só vejam seus próprios contatos

3. `stats` (append-only)
   ```sql
   - id: UUID (PK)
   - user_id: UUID (FK -> auth.users)
   - total_messages_sent: INTEGER
   - total_messages_failed: INTEGER
   - created_at: TIMESTAMPTZ
   ```
   - Registro histórico de estatísticas
   - Cada nova entrada acumula os totais anteriores

## 🔄 Fluxos Principais

### 1. Conexão com WhatsApp
1. Usuário acessa a página de WhatsApp
2. Sistema gera QR Code via API Evolution
3. Usuário escaneia o QR Code
4. Conexão é estabelecida e mantida

### 2. Gerenciamento de Contatos
1. Importação via CSV
   - Upload do arquivo
   - Validação dos dados
   - Preview dos contatos
   - Confirmação e salvamento

2. Gerenciamento manual
   - Adição individual
   - Edição
   - Remoção
   - Seleção para mensagens

### 3. Envio de Mensagens
1. Seleção de contatos
2. Composição da mensagem
3. Definição do intervalo
4. Envio em lote com tracking
5. Atualização de estatísticas

### 4. Tracking de Estatísticas
1. Cada operação de envio
   - Busca último registro de stats
   - Soma novos valores aos totais existentes
   - Cria novo registro com totais acumulados

## 🔒 Segurança

- Autenticação via Supabase
- Row Level Security em todas as tabelas
- Políticas de acesso granulares
- Validação de dados em múltiplas camadas
- Sanitização de inputs
- Rate limiting no envio de mensagens

## 🛠️ Tecnologias

- React 18
- TypeScript
- Tailwind CSS
- Shadcn/ui
- Supabase
- Evolution API (WhatsApp)
- Vite

## 📦 Instalação

1. Clone o repositório
```bash
git clone [url-do-repositorio]
```

2. Instale as dependências
```bash
npm install
```

3. Configure as variáveis de ambiente
```bash
cp .env.example .env
```

4. Execute as migrações do Supabase
```bash
npx supabase db push
```

5. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie sua branch de feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## Fluxo de Pagamento e Assinaturas

### Configuração do Stripe

1. Configure as variáveis de ambiente:
```env
VITE_STRIPE_PUBLIC_KEY=pk_test_your_key
VITE_STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

2. Configure o webhook no painel do Stripe:
   - URL: `https://seu-dominio.com/api/webhook`
   - Eventos necessários:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `invoice.payment_succeeded`

### Fluxo de Assinatura

1. **Início do Checkout**
   - Usuário seleciona um plano (Pro ou Business)
   - Sistema cria uma sessão de checkout do Stripe com:
     - Preço do plano selecionado
     - Metadados do usuário e plano
     - URLs de sucesso/cancelamento

2. **Processo de Pagamento**
   - Usuário é redirecionado para o checkout do Stripe
   - Insere informações de pagamento
   - Stripe processa o pagamento

3. **Webhook e Banco de Dados**
   - Após pagamento bem-sucedido:
     - Stripe envia evento `checkout.session.completed`
     - Sistema cria registro na tabela `subscriptions`
     - Sistema cria registro na tabela `payment_history`

4. **Atualização de Status**
   - Para pagamentos recorrentes:
     - Stripe envia evento `invoice.payment_succeeded`
     - Sistema registra novo pagamento em `payment_history`
   - Para mudanças na assinatura:
     - Stripe envia evento `customer.subscription.updated`
     - Sistema atualiza status em `subscriptions`

5. **Redirecionamento**
   - Usuário é redirecionado para `/dashboard?payment=success`
   - Interface atualiza para mostrar novo status da assinatura

### Tabelas do Banco de Dados

#### subscriptions
- `id`: UUID (PK)
- `user_id`: UUID (FK)
- `plan_id`: UUID (FK)
- `status`: string (active, canceled, etc)
- `current_period_start`: timestamp
- `current_period_end`: timestamp
- `payment_provider`: string
- `payment_provider_subscription_id`: string

#### payment_history
- `id`: UUID (PK)
- `subscription_id`: string (FK)
- `amount`: decimal
- `status`: string
- `provider_payment_id`: string
- `created_at`: timestamp

### Preços dos Planos

- Pro: `price_1RSOYJRHP1HTmtJCfC1AzwoX`
- Business: `price_1RSOW3RHP1HTmtJCodOnPpo4`
