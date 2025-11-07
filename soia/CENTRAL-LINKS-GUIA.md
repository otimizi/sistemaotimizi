# 🔗 Central de Links - Gerador de Landing Pages

## ✅ Sistema Completo Implementado

### O Que Foi Criado

1. **Banco de Dados**
   - Tabela `landing_pages` - Configurações das páginas
   - Tabela `landing_page_conversoes` - Rastreamento de leads
   - Políticas RLS configuradas

2. **Página de Gerenciamento** (`/central-links`)
   - Criar, editar e excluir landing pages
   - Visualizar métricas e estatísticas
   - Copiar links gerados
   - Ativar/desativar páginas

3. **Páginas Públicas** (`/f/[slug]`)
   - Formulários personalizados
   - Design responsivo
   - Envio automático de WhatsApp
   - Registro no banco de dados

## 🎨 Como Funciona

### 1. Criar Landing Page

```
Central de Links → Botão "Nova Landing Page"

Configurar:
✅ Título (ex: "Cadastro de Interesse")
✅ Descrição (opcional)
✅ Campos a coletar (checkbox múltiplo)
✅ Mensagem WhatsApp (com variáveis)
✅ Cor primária (personalize a aparência)
```

### 2. Campos Disponíveis

Você pode escolher quais campos coletar:
- ✅ Nome
- ✅ Email
- ✅ Telefone
- ✅ CPF/CNPJ
- ✅ Cidade
- ✅ Estado
- ✅ CEP
- ✅ Rua
- ✅ Número

**Campos obrigatórios:** Nome e Telefone

### 3. Mensagem WhatsApp com Variáveis

Personalize a mensagem usando variáveis:

```
Exemplo:
"Olá {nome}! Recebemos seu cadastro.
Seu email: {email}
Telefone: {telefone}
Entraremos em contato em breve! 🚀"

Resultado para João:
"Olá João! Recebemos seu cadastro.
Seu email: joao@email.com
Telefone: 11999999999
Entraremos em contato em breve! 🚀"
```

### 4. URL Única Gerada

Cada landing page recebe uma URL única:

```
https://seusite.com/f/cadastro-interesse-abc123
                    │
                    └── Slug único
```

## 📊 Fluxo Completo

### Quando Alguém Preenche o Formulário:

```
1. Cliente acessa: /f/seu-slug
2. Preenche o formulário
3. Clica em "Enviar Cadastro"

Sistema executa:
├─ 1. Verifica se cliente existe (por telefone)
│  ├─ Se existe: ATUALIZA dados
│  └─ Se não: CRIA novo cliente
│
├─ 2. Salva conversão em landing_page_conversoes
│
├─ 3. Incrementa contadores
│  ├─ total_acessos (toda vez que abre a página)
│  └─ total_conversoes (quando envia formulário)
│
├─ 4. Envia WhatsApp via API Otimizi
│  ├─ Substitui variáveis na mensagem
│  ├─ POST para https://otimizi.uazapi.com/send/text
│  ├─ Headers: token: cd8f9e7e-972a-4446-8d06-6e63c5caeb78
│  └─ Body: { number: "5511999999999", text: "mensagem" }
│
└─ 5. Mostra tela de sucesso
```

## 🗄️ Estrutura do Banco de Dados

### Tabela: `landing_pages`

```sql
id                  - ID único
slug                - URL única (ex: "cadastro-abc123")
titulo              - Título da página
descricao           - Descrição opcional
campos_habilitados  - JSON array ["nome", "email", ...]
mensagem_whatsapp   - Texto com variáveis
cor_primaria        - Cor hex (#3B82F6)
imagem_url          - URL da imagem (opcional)
ativo               - true/false
total_acessos       - Contador de acessos
total_conversoes    - Contador de conversões
created_at          - Data de criação
```

### Tabela: `landing_page_conversoes`

```sql
id                  - ID único
landing_page_id     - Referência à landing page
cliente_id          - Referência ao cliente criado
dados_capturados    - JSON com todos os dados
whatsapp_enviado    - true/false
whatsapp_erro       - Mensagem de erro (se houver)
created_at          - Data da conversão
```

## 💡 Casos de Uso

### Caso 1: Captura de Leads para Vendas

```
Título: "Solicite um Orçamento"
Campos: nome, email, telefone, cidade
Mensagem: "Olá {nome}! Recebemos sua solicitação.
Nossa equipe de {cidade} entrará em contato em até 24h!"
```

### Caso 2: Cadastro para Evento

```
Título: "Inscrição - Workshop Gratuito"
Campos: nome, email, telefone
Mensagem: "Parabéns {nome}! Você está inscrito no workshop.
Enviaremos os detalhes para {email}. Nos vemos lá! 🎉"
```

### Caso 3: Download de Material

```
Título: "Baixe o E-book Grátis"
Campos: nome, email
Mensagem: "Oi {nome}! Seu e-book está a caminho.
Verifique {email} nos próximos minutos. 📚"
```

## 📊 Métricas e Analytics

### Dashboard da Landing Page

Cada landing page mostra:

```
┌─────────────────────────────┐
│ Acessos      | Conversões   │
│    150       |     45       │
├──────────────┴──────────────┤
│ Taxa de Conversão: 30%      │
└─────────────────────────────┘
```

### Visão Geral (Topo da Página)

```
Total de Páginas: 5
Páginas Ativas: 4
Total de Acessos: 523
Conversões: 187
```

## 🎯 Gerenciamento de Links

### Ações Disponíveis

**Para cada landing page:**
- 📋 **Copiar Link** - Copia URL para compartilhar
- 🔗 **Abrir** - Abre em nova aba para testar
- ⚙️ **Editar** - Modificar configurações
- ▶️ **Ativar/Desativar** - Controlar disponibilidade
- 🗑️ **Excluir** - Remover página (confirmação)

### Status da Página

- 🟢 **Ativa** - Formulário funcionando, aceita envios
- ⚫ **Inativa** - Página retorna "não encontrada"

## 🔧 Integração com API WhatsApp

### Configuração Atual

```javascript
POST https://otimizi.uazapi.com/send/text

Headers:
  Accept: application/json
  Content-Type: application/json
  token: cd8f9e7e-972a-4446-8d06-6e63c5caeb78

Body:
{
  "number": "5511999999999",  // Apenas números
  "text": "Mensagem personalizada..."
}
```

### Tratamento de Erros

- ✅ Se envio OK → `whatsapp_enviado = true`
- ❌ Se falhar → `whatsapp_enviado = false` + salva erro

## 🎨 Personalização Visual

### Cor Primária

A cor escolhida é aplicada em:
- Fundo do gradiente da página
- Botão de envio
- Elementos destacados

### Exemplo de Cores

- **Azul** (#3B82F6) - Profissional
- **Verde** (#10B981) - Saúde, Natureza
- **Roxo** (#8B5CF6) - Criativo, Moderno
- **Laranja** (#F59E0B) - Energia, Ação

## 📱 Responsividade

As páginas são **100% responsivas**:
- ✅ Desktop (tela grande)
- ✅ Tablet (tela média)
- ✅ Mobile (tela pequena)

## 🚀 Próximas Melhorias Possíveis

1. **Editor Visual**
   - Arrastar e soltar campos
   - Pré-visualização em tempo real

2. **Temas Prontos**
   - Templates pré-configurados
   - Layouts diferentes

3. **A/B Testing**
   - Criar variações da mesma página
   - Comparar performance

4. **Integrações**
   - Google Analytics
   - Facebook Pixel
   - Google Tag Manager

5. **Campos Customizados**
   - Criar campos próprios
   - Validações personalizadas

6. **Email Marketing**
   - Enviar email além do WhatsApp
   - Templates de email

7. **Relatórios Avançados**
   - Gráficos de conversão por período
   - Origem do tráfego
   - Horários de pico

## 📝 Exemplo Prático Completo

### 1. Criar Landing Page

```
Título: "Cadastro VIP - Black Friday"
Descrição: "Garanta acesso antecipado às ofertas!"
Campos: [nome, email, telefone, cidade]
Mensagem: "🎉 Parabéns {nome}! Você está na lista VIP de {cidade}!
Enviaremos as ofertas exclusivas para {email} e {telefone}."
Cor: #8B5CF6 (roxo)
```

### 2. Sistema Gera

```
Slug: black-friday-2l4k8a9x
URL: https://seusite.com/f/black-friday-2l4k8a9x
```

### 3. Cliente Acessa e Preenche

```
Nome: Maria Silva
Email: maria@email.com
Telefone: 11987654321
Cidade: São Paulo
```

### 4. Sistema Processa

```
✅ Cliente criado/atualizado no banco
✅ Conversão registrada
✅ Contadores atualizados
✅ WhatsApp enviado:
   "🎉 Parabéns Maria Silva! Você está na lista VIP de São Paulo!
   Enviaremos as ofertas exclusivas para maria@email.com e 11987654321."
```

### 5. Você Vê no Dashboard

```
Black Friday VIP
Acessos: 234 → 235 (+1)
Conversões: 67 → 68 (+1)
Taxa: 29.1%
```

---

## ✨ Funcionalidades Principais

1. ✅ **URLs Únicas** - Cada página tem slug único
2. ✅ **Campos Customizáveis** - Escolha o que coletar
3. ✅ **WhatsApp Automático** - Envia mensagem após cadastro
4. ✅ **Salva no Banco** - Integra com tabela de clientes
5. ✅ **Métricas em Tempo Real** - Acompanhe performance
6. ✅ **Ativar/Desativar** - Controle quando está disponível
7. ✅ **Design Responsivo** - Funciona em todos dispositivos
8. ✅ **Personalização** - Cores e textos customizáveis

**Sistema completo e pronto para uso!** 🎉
