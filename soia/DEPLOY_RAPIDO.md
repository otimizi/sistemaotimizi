# ⚡ Deploy Rápido no Netlify

## 🎯 Configuração em 3 Passos

### 1️⃣ Adicionar Variáveis de Ambiente

No Netlify Dashboard → Site settings → Environment variables:

```
NEXT_PUBLIC_SUPABASE_URL = https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = sua-chave-anonima
```

**Onde obter:**
https://app.supabase.com/project/_/settings/api

---

### 2️⃣ Fazer Push do Código

```bash
git add .
git commit -m "Add Netlify config"
git push origin main
```

O deploy inicia **automaticamente**!

---

### 3️⃣ Configurar URL no Supabase

Após o deploy, copie a URL do Netlify (ex: `https://soia-app.netlify.app`)

No Supabase → Authentication → URL Configuration:

- **Site URL:** `https://soia-app.netlify.app`
- **Redirect URLs:** `https://soia-app.netlify.app/login`

---

## ✅ Pronto!

Acesse sua URL do Netlify e faça login:

- Email: `otimiziambientes@gmail.com`
- Senha: `otimizi2025#`

---

## 🔍 Ver Status do Deploy

Netlify Dashboard → Deploys

**Cores:**
- 🟢 Verde = Deploy bem-sucedido
- 🟡 Amarelo = Em progresso
- 🔴 Vermelho = Falhou (veja os logs)

---

## 📝 Comandos Git

```bash
# Ver status
git status

# Adicionar alterações
git add .

# Commit
git commit -m "Sua mensagem"

# Push (dispara deploy)
git push origin main
```

---

## ⚠️ Problemas Comuns

### Deploy Falhou?

1. Verifique se as variáveis de ambiente estão corretas
2. Teste localmente: `npm run build`
3. Veja os logs no Netlify Dashboard

### Não consegue fazer login?

1. Verifique se adicionou a URL no Supabase
2. Verifique se executou o SQL de autenticação
3. Limpe o cache do navegador

---

## 📞 Ajuda Rápida

**Arquivo completo:** `DEPLOY_NETLIFY.md`

**Suporte Netlify:** https://answers.netlify.com/
