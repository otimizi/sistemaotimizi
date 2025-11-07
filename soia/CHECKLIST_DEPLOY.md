# ✅ Checklist de Deploy - SOIA no Netlify

## 📋 Antes do Deploy

### Banco de Dados
- [ ] Executou `setup-auth-complete.sql` no Supabase
- [ ] Usuário admin criado com sucesso
- [ ] Tabelas com RLS configurado
- [ ] Obteve URL e Anon Key do Supabase

### Código Local
- [ ] Teste local funciona (`npm run dev`)
- [ ] Build funciona (`npm run build`)
- [ ] Arquivo `netlify.toml` criado
- [ ] `.env.local` configurado (não será enviado ao Git)

---

## 🚀 Durante o Deploy

### No Netlify Dashboard

**1. Configurar Variáveis de Ambiente**
```
Site settings → Environment variables → Add a variable
```

- [ ] `NEXT_PUBLIC_SUPABASE_URL` adicionado
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` adicionado

**2. Configurações de Build**
```
Site settings → Build & deploy → Build settings
```

- [ ] Build command: `npm run build`
- [ ] Publish directory: `.next`
- [ ] Node version: 18 ou superior

**3. Fazer Deploy**

- [ ] Push do código para GitHub
- [ ] Deploy iniciou automaticamente no Netlify
- [ ] Deploy concluído com sucesso (verde ✓)

---

## 🔧 Após o Deploy

### No Supabase

**Authentication → URL Configuration**

- [ ] Site URL: `https://seu-site.netlify.app`
- [ ] Redirect URLs: `https://seu-site.netlify.app/login`
- [ ] Configuração salva

### Testes

- [ ] Acessou a URL do Netlify
- [ ] Página de login carrega
- [ ] Consegue fazer login
- [ ] Dashboard carrega dados
- [ ] Sidebar funciona
- [ ] Conversas exibem corretamente
- [ ] Filtros funcionam

---

## 📊 Monitoramento

### Logs de Deploy

- [ ] Verificou logs no Netlify
- [ ] Sem erros críticos
- [ ] Build time aceitável (< 5 min)

### Performance

- [ ] Site carrega rápido
- [ ] Sem erros no console
- [ ] Autenticação funciona
- [ ] Dados carregam do Supabase

---

## 🎯 Credenciais de Teste

**Login Admin:**
- Email: `otimiziambientes@gmail.com`
- Senha: `otimizi2025#`

**Supabase:**
- Dashboard: https://app.supabase.com
- Projeto: [Seu Projeto]

**Netlify:**
- Dashboard: https://app.netlify.com
- Site: [Seu Site]

---

## 🐛 Troubleshooting

### Build Falhou?
- [ ] Verificou logs no Netlify
- [ ] Variáveis de ambiente corretas?
- [ ] Build local funciona?
- [ ] Node version compatível?

### Login Não Funciona?
- [ ] URL configurada no Supabase?
- [ ] Variáveis de ambiente no Netlify?
- [ ] SQL de autenticação executado?
- [ ] Usuário admin existe?

### Dados Não Carregam?
- [ ] RLS configurado corretamente?
- [ ] Usuário está autenticado?
- [ ] Políticas permitem acesso?
- [ ] Conexão com Supabase OK?

---

## 📝 Próximos Passos

Após deploy bem-sucedido:

- [ ] Configurar domínio personalizado (opcional)
- [ ] Compartilhar URL com equipe
- [ ] Criar usuários adicionais
- [ ] Configurar backups
- [ ] Monitorar uso do Supabase
- [ ] Configurar alertas

---

## 🎉 Deploy Completo!

**URL do Seu Site:**
```
https://_____________________.netlify.app
```

**Data do Deploy:**
```
___/___/2025
```

**Status:** [ ] Funcionando perfeitamente!

---

## 📞 Suporte

- **Netlify Docs:** https://docs.netlify.com
- **Supabase Docs:** https://supabase.com/docs
- **Guia Completo:** `DEPLOY_NETLIFY.md`
- **Guia Rápido:** `DEPLOY_RAPIDO.md`
