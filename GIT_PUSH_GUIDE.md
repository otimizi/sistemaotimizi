# 🔑 Guia: Como Fazer Push no GitHub

## ❌ Erro Anterior

```
remote: Permission to otimizi/sistemaotimizi.git denied to onovotrafego.
fatal: unable to access 'https://github.com/otimizi/sistemaotimizi.git/': The requested URL returned error: 403
```

**Causa:** Você está autenticado com a conta `onovotrafego` mas precisa acessar o repositório `otimizi/sistemaotimizi`.

---

## ✅ Soluções

### Opção 1: Usar o GitHub CLI (Recomendado)

Se você tem o GitHub CLI instalado:

```bash
# Fazer login com a conta correta
gh auth login

# Fazer push
git push origin main
```

### Opção 2: Usar SSH ao invés de HTTPS

```bash
# Alterar remote para SSH
git remote set-url origin git@github.com:otimizi/sistemaotimizi.git

# Fazer push
git push origin main
```

**Nota:** Você precisa ter configurado SSH keys no GitHub.

### Opção 3: Usar Personal Access Token

```bash
# Fazer push com token
git push https://<SEU_TOKEN>@github.com/otimizi/sistemaotimizi.git main
```

**Como obter token:**
1. GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Selecione: `repo` scope
4. Copie o token

### Opção 4: Fazer Push pelo GitHub Desktop

Se você usa GitHub Desktop:
1. Abra o app
2. Selecione o repositório
3. Clique em "Push origin"

### Opção 5: Reconfigurar Credenciais

```bash
# Limpar credenciais antigas
git credential-osxkeychain erase
host=github.com
protocol=https

# Fazer push (vai pedir credenciais)
git push origin main
```

---

## 🚀 Comando Rápido (Se tiver SSH configurado)

```bash
cd /Users/nicksonaleixo/Documents/GitHub/sistemaotimizi

# Alterar para SSH
git remote set-url origin git@github.com:otimizi/sistemaotimizi.git

# Push
git push origin main
```

---

## 🔍 Verificar Remote Atual

```bash
git remote -v
```

**Deve mostrar:**
- HTTPS: `https://github.com/otimizi/sistemaotimizi.git`
- SSH: `git@github.com:otimizi/sistemaotimizi.git`

---

## 📝 Após Conseguir Fazer Push

O Netlify vai:
1. ✅ Detectar o novo commit
2. ✅ Iniciar build automaticamente
3. ✅ Deploy em 2-3 minutos
4. ✅ Site atualizado!

**Acompanhe em:**
https://app.netlify.com/sites/gregarious-kheer-bba93f/deploys

---

## 🆘 Se Nada Funcionar

**Opção Manual:**
1. Acesse: https://github.com/otimizi/sistemaotimizi
2. Clique em "Add file" → "Upload files"
3. Faça upload dos arquivos modificados:
   - `soia/middleware.ts`
   - `soia/app/diagnostico/page.tsx`
   - `soia/FIX_EDGE_RUNTIME.md`
4. Commit direto pelo GitHub

---

## ✅ Arquivos Prontos para Push

Os seguintes arquivos já foram commitados localmente:
- ✅ `soia/middleware.ts` - Edge Runtime fix
- ✅ `soia/app/diagnostico/page.tsx` - JSX escaping fix
- ✅ `soia/FIX_EDGE_RUNTIME.md` - Documentação

**Só falta fazer o push!**
