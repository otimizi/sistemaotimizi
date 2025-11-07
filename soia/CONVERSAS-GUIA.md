# 💬 Página de Conversas - Guia Completo

## 📋 Visão Geral

A página de Conversas (`/conversas`) exibe o histórico completo de interações entre clientes e a IA, usando a tabela `n8n_chat_histories`.

## 🎨 Layout

### Interface Dividida em 2 Colunas

#### 1. **Sidebar Esquerda** - Lista de Conversas
- 📊 Cards de estatísticas (Total, Mensagens, Média)
- 🔍 Campo de busca
- 📝 Lista de todas as sessões de conversa
- 🎯 Destaque visual da conversa selecionada

#### 2. **Área Principal** - Mensagens da Conversa
- 💬 Visualização estilo chat
- 👤 Mensagens do cliente (direita, azul)
- 🤖 Respostas da IA (esquerda, cinza)
- 📈 Contador de mensagens por tipo

## ✨ Funcionalidades

### 1. Agrupamento por Sessão
As mensagens são automaticamente agrupadas por `session_id`, permitindo ver conversas completas.

### 2. Busca Inteligente
Busca em:
- ID da sessão
- Conteúdo das mensagens

### 3. Visualização em Tempo Real
- Interface tipo chat
- Distinção visual entre humano e IA
- Ícones identificadores
- Cores diferentes para cada tipo

### 4. Estatísticas
- **Total**: Quantidade de conversas únicas
- **Mensagens**: Número total de mensagens
- **Média**: Média de mensagens por conversa

## 🎯 Como Usar

### Acessar a Página
```
http://localhost:3000/conversas
```

### Navegar
1. **Selecione uma conversa** na lista esquerda
2. **Veja o histórico completo** na área principal
3. **Use a busca** para encontrar conversas específicas

## 📊 Estrutura da Tabela

```sql
n8n_chat_histories:
- id (bigint)
- session_id (text) - Identificador único da conversa
- message (json) - Objeto com:
  - type: "human" ou "ai"
  - data:
    - content: Texto da mensagem
    - additional_kwargs: Metadados opcionais
```

## 🎨 Elementos Visuais

### Cores e Badges

**Mensagens:**
- 🔵 **Azul** (primary) - Mensagens do cliente
- ⚪ **Cinza** (muted) - Respostas da IA

**Ícones:**
- 👤 `User` - Cliente/Humano
- 🤖 `Bot` - SOIA (IA)

**Contadores:**
- Badge com número de mensagens por tipo
- Badge de total de respostas da IA

## 💡 Exemplos de Estrutura de Mensagem

### Mensagem do Cliente (type: "human")
```json
{
  "type": "human",
  "data": {
    "content": "Qual o prazo de entrega?"
  }
}
```

### Resposta da IA (type: "ai")
```json
{
  "type": "ai",
  "data": {
    "content": "O prazo de entrega é de 5 a 7 dias úteis após a confirmação do pagamento.",
    "additional_kwargs": {}
  }
}
```

## 🚀 Próximas Melhorias Possíveis

1. **Filtros Avançados**
   - Por data
   - Por quantidade de mensagens
   - Por status (ativas/arquivadas)

2. **Análise de Sentimento**
   - Classificar conversas por satisfação
   - Identificar problemas recorrentes

3. **Exportação**
   - Exportar conversas individuais
   - Relatórios em PDF

4. **Busca Avançada**
   - Regex
   - Busca por período
   - Filtro por tipo de mensagem

5. **Métricas Adicionais**
   - Tempo médio de resposta
   - Taxa de resolução
   - Tópicos mais comuns

## 🔧 Detalhes Técnicos

### Agrupamento
```typescript
// Agrupa mensagens por session_id
const grouped = data.reduce((acc, item) => {
  const sessionId = item.session_id || "sem-sessao"
  if (!acc[sessionId]) {
    acc[sessionId] = {
      session_id: sessionId,
      messages: [],
      messageCount: 0
    }
  }
  acc[sessionId].messages.push(item)
  acc[sessionId].messageCount++
  return acc
}, {})
```

### Ordenação
- Conversas ordenadas pela mensagem mais recente
- Mensagens dentro da conversa ordenadas por ID (cronológica)

### Performance
- Carregamento inicial único
- Seleção de conversa sem reload
- Renderização otimizada com AnimatePresence

## 📱 Responsividade

- Layout adaptável para telas menores
- Sidebar colapsável em mobile (futuro)
- Mensagens com largura máxima de 70%

## 🎬 Animações

- **Fade in** no carregamento
- **Slide in** nas mensagens
- **Hover effects** nos cards de conversa
- **Transições suaves** na seleção

---

**Nota:** Esta página trabalha exclusivamente com a tabela `n8n_chat_histories` e não depende de outras tabelas para funcionar.
