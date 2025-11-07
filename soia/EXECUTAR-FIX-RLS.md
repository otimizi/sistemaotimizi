# 🔧 GUIA: Executar Fix RLS - Passo a Passo

## 🎯 Objetivo
Corrigir as políticas de **Row-Level Security (RLS)** das tabelas:
- ✅ `clientes`
- ✅ `n8n_chat_histories`

## ❌ Erros Que Este Fix Resolve

```
1. code: "42501"
   message: "new row violates row-level security policy for table 'clientes'"

2. POST n8n_chat_histories 401 (Unauthorized)
```

## 📋 Passo a Passo

### 1️⃣ Abra o Supabase Dashboard

```
https://supabase.com/dashboard
```

### 2️⃣ Selecione Seu Projeto

Clique no projeto **SOIA** (ou o nome que você deu)

### 3️⃣ Vá para SQL Editor

No menu lateral esquerdo:
```
🔧 SQL Editor
```

### 4️⃣ Crie Nova Query

Clique em:
```
+ New query
```

### 5️⃣ Copie o Script

Abra o arquivo:
```
database-fix-rls-completo.sql
```

**Copie TODO o conteúdo** (Ctrl+A → Ctrl+C)

### 6️⃣ Cole no SQL Editor

Cole o script completo na área de texto do SQL Editor

### 7️⃣ Execute o Script

Clique no botão:
```
▶️ RUN
```

ou pressione:
```
Ctrl+Enter (Windows/Linux)
Cmd+Enter (Mac)
```

### 8️⃣ Aguarde Execução

Você verá mensagens como:
```
✅ DO
✅ ALTER TABLE
✅ CREATE POLICY
✅ CREATE POLICY
...
```

### 9️⃣ Veja os Resultados

No final, duas tabelas devem aparecer mostrando:

**Tabela 1: CLIENTES**
```
politica                    | comando | condicao | verificacao
----------------------------|---------|----------|------------
clientes_select_public      | SELECT  | true     | NULL
clientes_insert_public      | INSERT  | NULL     | true
clientes_update_public      | UPDATE  | true     | true
clientes_delete_public      | DELETE  | true     | NULL
```

**Tabela 2: N8N_CHAT_HISTORIES**
```
politica                        | comando | condicao | verificacao
--------------------------------|---------|----------|------------
chat_histories_select_public    | SELECT  | true     | NULL
chat_histories_insert_public    | INSERT  | NULL     | true
chat_histories_update_public    | UPDATE  | true     | true
chat_histories_delete_public    | DELETE  | true     | NULL
```

### 🔟 Teste (Opcional)

Se quiser testar diretamente no SQL, descomente as linhas finais do script:

```sql
-- Remova os /* e */ das linhas de teste:

-- Teste inserir cliente
INSERT INTO public.clientes (nome, telefone, email) 
VALUES ('Teste RLS', '27988491255', 'teste@rls.com')
RETURNING id, nome, telefone;

-- Teste inserir mensagem no chat
INSERT INTO public.n8n_chat_histories (session_id, message)
VALUES (
  '5527988491255',
  '{"type":"ai","content":"Teste RLS","tool_calls":[],"additional_kwargs":{},"response_metadata":{},"invalid_tool_calls":[]}'::jsonb
)
RETURNING id, session_id;
```

Se retornar os IDs, está funcionando! ✅

## ✅ Verificação Final

### No seu Aplicativo:

1. **Limpe o cache do browser**
   ```
   Ctrl+Shift+R (Windows/Linux)
   Cmd+Shift+R (Mac)
   ```

2. **Acesse sua landing page**
   ```
   http://localhost:3000/f/seu-slug
   ```

3. **Preencha o formulário**
   ```
   Nome: João Teste
   Telefone: (27) 98849-1255
   Email: teste@email.com
   ```

4. **Envie o cadastro**
   
   ✅ Deve mostrar: "Cadastro Realizado!"
   
   ❌ Se ainda der erro, veja troubleshooting abaixo

## 🐛 Troubleshooting

### ❌ Erro: "permission denied for schema public"

Execute antes:
```sql
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
```

### ❌ Erro: "relation does not exist"

As tabelas não foram criadas. Execute primeiro:
```sql
-- Criar tabela clientes (se não existir)
-- Criar tabela n8n_chat_histories (se não existir)
```

Veja: `database-setup.sql`

### ❌ Ainda dá erro 401/403

1. Verifique suas chaves do Supabase em `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=sua-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave
   ```

2. Reinicie o servidor:
   ```bash
   npm run dev
   ```

3. Limpe cache do browser

### ❌ Políticas não aparecem

Execute manualmente cada política uma por uma no SQL Editor

## 📊 Validação de Sucesso

### Teste 1: Ver Políticas
```sql
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('clientes', 'n8n_chat_histories')
ORDER BY tablename, cmd;
```

Deve retornar **8 políticas** (4 para cada tabela)

### Teste 2: Inserir Cliente
```sql
INSERT INTO public.clientes (nome, telefone) 
VALUES ('Teste', '11999999999')
RETURNING id;
```

Deve retornar um ID ✅

### Teste 3: Inserir Chat
```sql
INSERT INTO public.n8n_chat_histories (session_id, message)
VALUES ('test', '{"type":"ai","content":"test"}'::jsonb)
RETURNING id;
```

Deve retornar um ID ✅

## 🎉 Tudo Funcionando!

Se todos os testes passarem, suas landing pages agora podem:
- ✅ Criar novos clientes
- ✅ Atualizar clientes existentes
- ✅ Salvar mensagens no histórico de chat
- ✅ Enviar WhatsApp via API

## 📝 Checklist Final

- [ ] Script executado no Supabase SQL Editor
- [ ] 8 políticas criadas (4 + 4)
- [ ] Teste de inserção funcionou
- [ ] Cache do browser limpo
- [ ] Landing page testada
- [ ] Formulário enviado com sucesso
- [ ] Cliente aparece na tabela `clientes`
- [ ] Mensagem aparece em `n8n_chat_histories`
- [ ] WhatsApp enviado

---

**Execute o script e teste novamente!** 🚀
