# 🚀 Guia Rápido - Configuração de Autenticação

## ⚡ Execução Rápida (1 Script)

### Execute APENAS este arquivo no SQL Editor do Supabase:

```
setup-auth-complete.sql
```

Este script único irá:
- ✅ Configurar todas as políticas RLS
- ✅ Criar o usuário administrador
- ✅ Verificar se tudo foi configurado corretamente

---

## 📋 Credenciais do Admin

Após executar o script, você pode fazer login com:

- **Email:** `otimiziambientes@gmail.com`
- **Senha:** `otimizi2025#`
- **URL:** http://localhost:3000/login

---

## 🔧 Configurar Variáveis de Ambiente

Antes de iniciar o sistema, crie o arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

Obtenha as credenciais em:
https://app.supabase.com/project/_/settings/api

---

## 🎯 Iniciar o Sistema

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## 📁 Arquivos Disponíveis

### Scripts SQL:
- **`setup-auth-complete.sql`** ⭐ - Script completo (recomendado)
- `database-auth-policies.sql` - Apenas políticas RLS
- `create-admin-user.sql` - Apenas criação do usuário admin

### Documentação:
- `AUTH_SETUP.md` - Documentação completa do sistema
- `QUICK_START_AUTH.md` - Este guia rápido

---

## ✅ Verificação

Após executar o script, você verá duas tabelas de resultado:

### 1. Políticas Criadas
Deve mostrar todas as políticas RLS para as 5 tabelas principais.

### 2. Usuário Admin
Deve mostrar:
```
email: otimiziambientes@gmail.com
role: admin
full_name: Administrador SOIA
```

---

## 🆘 Problemas?

### Erro: "relation does not exist"
- ✅ **JÁ CORRIGIDO!** O script `setup-auth-complete.sql` não referencia tabelas inexistentes.

### Erro: "duplicate key value"
- O usuário admin já existe. Execute apenas a primeira parte do script (políticas RLS).

### Não consegue fazer login
1. Verifique se as variáveis de ambiente estão corretas
2. Confirme que o script foi executado com sucesso
3. Veja se há erros no console do navegador

---

## 📞 Suporte

Para mais detalhes, consulte `AUTH_SETUP.md` para documentação completa.
