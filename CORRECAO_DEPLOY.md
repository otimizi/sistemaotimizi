# 🔧 Correção do Deploy - Base Directory

## ❌ Problema Identificado

O Netlify estava fazendo deploy da **pasta raiz** ao invés da pasta **`soia`** onde está o projeto Next.js.

## ✅ Solução Aplicada

Arquivo `netlify.toml` criado na raiz com:
```toml
[build]
  base = "soia"  ← Diretório base corrigido
```

---

## 🚀 Passos para Corrigir

### 1️⃣ Fazer Push da Correção

```bash
cd /Users/nicksonaleixo/Documents/GitHub/sistemaotimizi

git add netlify.toml
git commit -m "Fix: Configure Netlify base directory to soia folder"
git push origin main
```

O Netlify fará deploy **automaticamente** com a configuração correta!

---

### 2️⃣ Verificar o Deploy

1. Acesse: https://app.netlify.com
2. Vá no seu site: **gregarious-kheer-bba93f**
3. Clique em **"Deploys"**
4. Aguarde o novo deploy finalizar

**Status esperado:**
- 🟢 **Build:** Successful
- 🟢 **Published:** https://sistema.otimizi.com

---

## 🎯 Estrutura Correta

```
sistemaotimizi/                  ← Raiz do repositório
├── netlify.toml                 ← Arquivo de config (AQUI!)
└── soia/                        ← Base directory
    ├── package.json
    ├── next.config.js
    ├── app/
    ├── components/
    └── ...
```

---

## ⚙️ Alternativa: Configurar no Dashboard

Se preferir configurar direto no Netlify Dashboard:

**Caminho:**
```
Site settings → Build & deploy → Build settings
```

**Configure:**
- **Base directory:** `soia`
- **Build command:** `npm run build`
- **Publish directory:** `soia/.next`

---

## 🔍 Verificar se Funcionou

Após o deploy:

1. ✅ Acesse: https://sistema.otimizi.com
2. ✅ Deve aparecer a página de login do SOIA
3. ✅ Faça login com:
   - Email: `otimiziambientes@gmail.com`
   - Senha: `otimizi2025#`

---

## 📊 Logs do Build

Se quiser ver os logs:

**Netlify Dashboard:**
```
Deploys → [Latest Deploy] → Deploy log
```

**Procure por:**
- ✅ `Base directory: soia`
- ✅ `Building in /opt/build/repo/soia`
- ✅ `Next.js build successful`

---

## 🐛 Se Ainda Não Funcionar

### Opção 1: Limpar Cache
No Netlify Dashboard:
```
Deploys → Trigger deploy → Clear cache and deploy site
```

### Opção 2: Verificar Variáveis
```
Site settings → Environment variables
```

Confirme que tem:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Opção 3: Build Local
Teste localmente:
```bash
cd soia
npm run build
```

Se funcionar local mas falhar no Netlify, verifique os logs.

---

## ✅ Checklist Final

- [ ] Arquivo `netlify.toml` na raiz do repo
- [ ] `base = "soia"` configurado
- [ ] Commit e push feitos
- [ ] Deploy automático iniciado
- [ ] Deploy concluído com sucesso
- [ ] Site carrega corretamente
- [ ] Login funciona

---

## 🎉 Pronto!

Agora o Netlify vai:
1. ✅ Entrar na pasta `soia`
2. ✅ Rodar `npm install`
3. ✅ Rodar `npm run build`
4. ✅ Publicar a pasta `.next`

Tudo funcionando! 🚀
