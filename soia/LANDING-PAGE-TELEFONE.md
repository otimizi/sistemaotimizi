# 📱 Landing Page - Melhorias de Telefone e Chat

## ✅ Implementações Realizadas

### 1. **Formatação Automática de Telefone Brasileiro** 🇧🇷

#### Função de Formatação
```typescript
formatarTelefoneBrasileiro(telefone: string): string
```

**Regras Aplicadas:**

1. ✅ Remove todos os caracteres não numéricos
2. ✅ Remove zero inicial (se houver)
3. ✅ Adiciona DDI 55 (Brasil) se não tiver
4. ✅ Adiciona 9º dígito se número tiver 8 dígitos
5. ✅ Resultado final: `5527988491255` (DDI+DDD+9 dígitos)

#### Exemplos de Transformação

```
Entrada              → Saída
----------------------------------
(27) 98849-1255     → 5527988491255 ✅
27 98849-1255       → 5527988491255 ✅
027988491255        → 5527988491255 ✅
2788491255          → 552798849125  ✅ (adiciona 9)
11987654321         → 5511987654321 ✅
5511987654321       → 5511987654321 ✅ (já correto)
```

### 2. **Máscara Visual no Formulário** 🎨

Enquanto o usuário digita, aplica máscara visual:

```
Digitado    → Exibido
---------------------
27          → 27
279         → (27) 9
27988       → (27) 988
2798849     → (27) 98849
279884912   → (27) 98849-12
27988491255 → (27) 98849-1255 ✅
```

**Benefícios:**
- ✅ Experiência de usuário melhorada
- ✅ Validação visual automática
- ✅ Placeholder: `(00) 00000-0000`
- ✅ Limite de 15 caracteres (com máscara)

### 3. **Salvamento no Histórico de Chat** 💬

Após enviar o WhatsApp, a mensagem é salva em `n8n_chat_histories`:

```json
{
  "session_id": "5527988491255",  ← Telefone formatado
  "message": {
    "type": "ai",
    "content": "Olá João! Recebemos seu cadastro...",
    "tool_calls": [],
    "additional_kwargs": {},
    "response_metadata": {},
    "invalid_tool_calls": []
  }
}
```

**session_id** = Telefone formatado (DDI+DDD+9 dígitos)

Isso permite que:
- ✅ A conversa apareça na tela de **Conversas**
- ✅ Histórico completo de interações
- ✅ Rastreamento por cliente

## 🔄 Fluxo Completo Atualizado

```
1. Cliente preenche formulário
   └─ Telefone: (27) 98849-1255 (com máscara visual)
         ↓
2. Ao enviar, formata telefone
   └─ Resultado: 5527988491255
         ↓
3. Salva/atualiza cliente no banco
   └─ Tabela: clientes
         ↓
4. Registra conversão
   └─ Tabela: landing_page_conversoes
         ↓
5. Envia WhatsApp via API
   └─ POST https://otimizi.uazapi.com/send/text
   └─ Body: { "number": "5527988491255", "text": "..." }
         ↓
6. Salva mensagem no histórico
   └─ Tabela: n8n_chat_histories
   └─ session_id: 5527988491255
   └─ message.type: "ai"
   └─ message.content: "Mensagem enviada"
         ↓
7. Mostra tela de sucesso ✅
```

## 📊 Estrutura dos Dados

### Formato do Telefone na API

```json
{
  "number": "5527988491255",
  "text": "Mensagem personalizada"
}
```

**Composição:**
- `55` - DDI Brasil
- `27` - DDD (Espírito Santo, no exemplo)
- `98849-1255` - Número com 9 dígitos

### Formato no Histórico de Chat

```sql
INSERT INTO n8n_chat_histories (session_id, message) VALUES (
  '5527988491255',
  '{
    "type": "ai",
    "content": "Olá João! Recebemos seu cadastro...",
    "tool_calls": [],
    "additional_kwargs": {},
    "response_metadata": {},
    "invalid_tool_calls": []
  }'
)
```

## 🎯 Casos de Uso

### Caso 1: Número com 9 Dígitos (Completo)

```
Input: (27) 98849-1255
Formatado: 5527988491255
API: { "number": "5527988491255" }
Chat session_id: "5527988491255"
```

### Caso 2: Número com 8 Dígitos (Falta o 9)

```
Input: (27) 8849-1255
Formatado: 5527988491255 (adiciona 9 automaticamente)
API: { "number": "5527988491255" }
Chat session_id: "5527988491255"
```

### Caso 3: Número sem DDI

```
Input: 27988491255
Formatado: 5527988491255 (adiciona DDI 55)
API: { "number": "5527988491255" }
Chat session_id: "5527988491255"
```

### Caso 4: Número com Zero Inicial

```
Input: 027988491255
Formatado: 5527988491255 (remove zero)
API: { "number": "5527988491255" }
Chat session_id: "5527988491255"
```

## 💡 Integração com Tela de Conversas

Agora as mensagens da landing page aparecem na tela de **Conversas**:

```
Conversas
├─ 5527988491255 (João Silva)
│  ├─ AI: "Olá João! Recebemos seu cadastro..."
│  └─ (Pode continuar conversando)
│
├─ 5511987654321 (Maria Souza)
   └─ AI: "Olá Maria! Bem-vinda..."
```

**Benefícios:**
- ✅ Histórico centralizado
- ✅ Continuar conversa do ponto onde parou
- ✅ Ver todas as interações do cliente
- ✅ Identificação automática pelo telefone

## 🔧 Funções Implementadas

### 1. `formatarTelefoneBrasileiro(telefone)`
Formata telefone para o padrão da API (DDI+DDD+9 dígitos)

### 2. `formatarTelefoneVisual(valor)`
Aplica máscara visual `(XX) XXXXX-XXXX` durante digitação

### 3. `handleTelefoneChange(e)`
Handler especial para campo de telefone com máscara

### 4. `salvarNoHistoricoChat(telefone, mensagem)`
Salva mensagem enviada no histórico do n8n

## 📱 Validações

**Campo de Telefone:**
- ✅ Obrigatório (required)
- ✅ Tipo: `tel` (teclado numérico no mobile)
- ✅ Máscara visual automática
- ✅ Máximo 15 caracteres (com formatação)
- ✅ Placeholder: `(00) 00000-0000`

**Formatação Final:**
- ✅ Sempre 13 dígitos: `55` + `DDD(2)` + `Número(9)`
- ✅ Apenas números (sem espaços, parênteses ou hífens)
- ✅ Adição automática do 9º dígito se necessário

## 🚀 Exemplo Completo

### Usuário Preenche:
```
Nome: João Silva
Telefone: (27) 98849-1255
Email: joao@email.com
```

### Sistema Processa:
```javascript
// 1. Formata telefone
"(27) 98849-1255" → "5527988491255"

// 2. Envia WhatsApp
POST https://otimizi.uazapi.com/send/text
{
  "number": "5527988491255",
  "text": "Olá João Silva! Recebemos seu cadastro..."
}

// 3. Salva no histórico
INSERT INTO n8n_chat_histories
{
  "session_id": "5527988491255",
  "message": {
    "type": "ai",
    "content": "Olá João Silva! Recebemos seu cadastro...",
    ...
  }
}
```

### Resultado:
- ✅ WhatsApp enviado para `5527988491255`
- ✅ Cliente salvo no banco
- ✅ Conversa iniciada em `/conversas`
- ✅ Histórico rastreável

## ✨ Melhorias Futuras Possíveis

1. **Validação de DDD**
   - Verificar se DDD existe no Brasil
   - Alertar se DDD inválido

2. **Telefone Fixo**
   - Detectar se é fixo ou celular
   - Aplicar regra diferente (8 dígitos para fixo)

3. **Internacional**
   - Suportar outros DDIs
   - Permitir escolha de país

4. **Verificação por SMS**
   - Enviar código de verificação
   - Confirmar que número é válido

---

**Sistema completo com formatação automática de telefone brasileiro!** 📱🇧🇷
