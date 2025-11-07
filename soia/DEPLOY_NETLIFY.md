# 🚀 Guia de Deploy no Netlify - SOIA

## ✅ Pré-requisitos

- [x] Repositório GitHub com o código
- [x] Conta no Netlify conectada ao GitHub
- [x] Banco de dados Supabase configurado

---

## 📋 Passo a Passo

### 1️⃣ Configurar Variáveis de Ambiente no Netlify

Acesse seu projeto no Netlify Dashboard:

**Caminho:**
```
Site settings → Environment variables → Add a variable
```

**Adicione as seguintes variáveis:**

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://seu-projeto.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sua-chave-anonima` |

**Importante:** 
- ⚠️ Não compartilhe essas chaves publicamente
- ✅ Use as mesmas credenciais do seu `.env.local`
- 🔐 Obtenha em: https://app.supabase.com/project/_/settings/api

---

### 2️⃣ Configurações de Build

O Netlify deve detectar automaticamente que é um projeto Next.js.

**Verifique se as configurações estão assim:**

```
Build command:    npm run build
Publish directory: .next
```

Se não estiverem, configure em:
```
Site settings → Build & deploy → Build settings
```

---

### 3️⃣ Fazer Deploy

#### Opção A: Deploy Automático (Recomendado)

1. **Faça commit e push** das suas alterações:
   ```bash
   git add .
   git commit -m "Configure Netlify deployment"
   git push origin main
   ```

2. O Netlify fará deploy **automaticamente** a cada push!

#### Opção B: Deploy Manual

No Netlify Dashboard:
1. Clique em **"Trigger deploy"**
2. Selecione **"Deploy site"**

---

### 4️⃣ Configurar Domínio Personalizado (Opcional)

**Caminho:**
```
Site settings → Domain management → Add custom domain
```

1. Digite seu domínio (ex: `soia.seudominio.com.br`)
2. Siga as instruções para configurar DNS
3. Netlify fornecerá SSL/HTTPS automaticamente

---

### 5️⃣ Configurar Redirecionamentos de Autenticação

No Supabase Dashboard, adicione a URL do Netlify:

**Caminho:**
```
Authentication → URL Configuration
```

**Adicione:**
- **Site URL:** `https://seu-site.netlify.app`
- **Redirect URLs:** `https://seu-site.netlify.app/login`

---

## 🔧 Configurações Avançadas

### Otimização de Build

Adicione em `Site settings → Build & deploy → Environment variables`:

| Variable | Value | Descrição |
|----------|-------|-----------|
| `NODE_ENV` | `production` | Ambiente de produção |
| `NEXT_TELEMETRY_DISABLED` | `1` | Desabilitar telemetria |

### Cache do Node Modules

O Netlify já faz cache automaticamente do `node_modules` entre builds.

---

## 📊 Monitoramento

### Logs de Deploy

**Ver logs:**
```
Deploys → [Select deploy] → Deploy log
```

### Erros Comuns e Soluções

#### ❌ Erro: "Module not found"
**Solução:**
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

#### ❌ Erro: "Environment variables not defined"
**Solução:**
- Verifique se adicionou todas as variáveis no Netlify
- Certifique-se que os nomes estão corretos
- Faça um novo deploy após adicionar

#### ❌ Erro: "Build failed"
**Solução:**
```bash
# Teste o build localmente primeiro
npm run build

# Se funcionar localmente, verifique:
# 1. Node version no Netlify (deve ser 18+)
# 2. Variáveis de ambiente
# 3. Logs de build no Netlify
```

---

## 🎯 Checklist Final

Antes de fazer deploy, confirme:

- [ ] ✅ Variáveis de ambiente configuradas no Netlify
- [ ] ✅ Build funciona localmente (`npm run build`)
- [ ] ✅ Arquivo `netlify.toml` no repositório
- [ ] ✅ Código commitado e pushed para GitHub
- [ ] ✅ URL do Netlify adicionada no Supabase
- [ ] ✅ SQL de autenticação executado no Supabase

---

## 📱 Testar o Deploy

Após o deploy ser concluído:

1. **Acesse a URL** fornecida pelo Netlify
2. **Teste o login:**
   - Email: `otimiziambientes@gmail.com`
   - Senha: `otimizi2025#`
3. **Verifique:**
   - [ ] Login funciona
   - [ ] Dashboard carrega
   - [ ] Dados aparecem corretamente
   - [ ] Conversas exibem horários
   - [ ] Filtros funcionam

---

## 🔄 Atualizações Futuras

Para fazer deploy de novas atualizações:

```bash
# 1. Faça suas alterações
# 2. Commit
git add .
git commit -m "Descrição das alterações"

# 3. Push (deploy automático)
git push origin main
```

O Netlify fará deploy automaticamente!

---

## 🆘 Suporte

### Links Úteis

- **Netlify Status:** https://www.netlifystatus.com/
- **Netlify Docs:** https://docs.netlify.com/
- **Next.js on Netlify:** https://docs.netlify.com/integrations/frameworks/next-js/

### Comandos Úteis

```bash
# Ver status do deploy
netlify status

# Ver logs
netlify logs

# Abrir dashboard
netlify open
```

---

## 📈 Performance

### Otimizações Aplicadas

- ✅ **PWA desabilitado** em produção (opcional)
- ✅ **React Strict Mode** habilitado
- ✅ **Build otimizado** do Next.js
- ✅ **CDN global** do Netlify
- ✅ **SSL/HTTPS** automático

### Métricas Esperadas

- 🚀 **First Load:** < 3s
- ⚡ **Time to Interactive:** < 5s
- 📊 **Lighthouse Score:** 90+

---

## 🎉 Pronto!

Seu sistema SOIA está no ar! 

**URL do Deploy:**
```
https://seu-site.netlify.app
```

**Próximos Passos:**
1. Compartilhe a URL com sua equipe
2. Configure domínio personalizado
3. Monitore os logs de acesso
4. Configure alertas no Netlify (opcional)
