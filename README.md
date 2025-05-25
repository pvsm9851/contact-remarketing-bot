# Contact Remarketing Bot

Uma aplicação web moderna para automação de marketing via WhatsApp, permitindo o envio de mensagens personalizadas para múltiplos contatos de forma segura e controlada.

## 🚀 Funcionalidades

### 1. Autenticação e Segurança
- Sistema completo de autenticação de usuários
- Registro com confirmação por email
- Login seguro
- Rotas protegidas
- Gerenciamento de sessão

### 2. Conexão com WhatsApp
- Conexão via QR Code
- Verificação automática de status da conexão
- Interface intuitiva para escaneamento
- Reconexão automática quando necessário
- Feedback em tempo real do status da conexão

### 3. Gerenciamento de Contatos
- Importação em massa de contatos
- Validação automática de números
- Edição individual de contatos
- Exclusão de contatos
- Seleção múltipla para ações em lote
- Visualização em grid com paginação

### 4. Sistema de Mensagens
- Editor de mensagens com formatação
- Configuração de intervalo entre envios
- Presets de velocidade de envio:
  - Rápido (10 segundos)
  - Normal (30 segundos)
  - Seguro (60 segundos)
  - Ultra Seguro (120 segundos)
- Indicadores de risco para cada velocidade
- Estimativa de tempo total de envio
- Progresso em tempo real

### 5. Estatísticas e Monitoramento
- Dashboard com métricas principais
- Contagem de mensagens enviadas
- Taxa de sucesso/falha
- Histórico de envios
- Gráficos de desempenho

### 6. Planos e Pagamentos
- Sistema de assinatura
- Diferentes níveis de plano
- Integração com gateway de pagamento
- Gestão de limites por plano
- Upgrade/downgrade de plano

## 🔧 Tecnologias

- **Frontend:**
  - React
  - TypeScript
  - Tailwind CSS
  - Shadcn/ui
  - React Query
  - React Router

- **Backend:**
  - Node.js
  - Express
  - WebSocket
  - WhatsApp Web API

- **Banco de Dados:**
  - Supabase (PostgreSQL)

- **Infraestrutura:**
  - Vite
  - Docker
  - Nginx

## 📦 Estrutura do Projeto

```
src/
├── components/         # Componentes React reutilizáveis
├── contexts/          # Contextos React para estado global
├── hooks/             # Hooks personalizados
├── lib/              # Utilitários e configurações
├── pages/            # Componentes de página
├── services/         # Serviços de API
└── types/            # Definições de tipos TypeScript
```

## 🌊 Fluxo da Aplicação

1. **Registro/Login**
   - Usuário se registra ou faz login
   - Confirmação de email para novos registros
   - Redirecionamento para dashboard

2. **Conexão WhatsApp**
   - Geração de QR Code para conexão
   - Escaneamento via aplicativo móvel
   - Verificação de status da conexão
   - Redirecionamento para contatos após conexão

3. **Gestão de Contatos**
   - Importação ou adição manual de contatos
   - Validação e normalização dos números
   - Organização e edição dos contatos
   - Seleção para envio de mensagens

4. **Envio de Mensagens**
   - Seleção dos contatos alvo
   - Composição da mensagem
   - Configuração do intervalo de envio
   - Monitoramento do progresso
   - Visualização de estatísticas

## ⚙️ Configuração do Ambiente

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/contact-remarketing-bot.git
cd contact-remarketing-bot
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## 🔒 Segurança

- Todas as senhas são hasheadas
- Tokens JWT para autenticação
- Rate limiting para proteção contra ataques
- Validação de entrada em todas as rotas
- Sanitização de dados
- Proteção contra XSS e CSRF

## 📝 Boas Práticas

- **Intervalos de Envio:** Respeite os intervalos recomendados para evitar bloqueios
- **Conteúdo:** Evite spam e conteúdo inadequado
- **Números:** Use apenas números que você tem permissão para contatar
- **Horários:** Evite envios em horários inadequados
- **Opt-out:** Sempre forneça opção de descadastramento

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, leia o arquivo CONTRIBUTING.md para detalhes sobre nosso código de conduta e o processo para enviar pull requests.

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE.md para detalhes.

## 🆘 Suporte

Para suporte, envie um email para suporte@seudominio.com ou abra uma issue no GitHub.
