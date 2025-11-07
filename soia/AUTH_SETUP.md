# Sistema de Autenticação SOIA

## Configuração do Supabase

### 1. Configurar as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

Obtenha essas credenciais em: https://app.supabase.com/project/_/settings/api

### 2. Configurar políticas RLS (Row Level Security) no Supabase

Execute os seguintes comandos SQL no editor SQL do Supabase:

```sql
-- Habilitar RLS nas tabelas principais
ALTER TABLE mercadolivre_registro_comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE mercadolivre_registro_msgposvenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE registro_notificacao_mercadolivre ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso (exemplo para usuários autenticados)
-- Permitir leitura para usuários autenticados
CREATE POLICY "Permitir leitura para usuários autenticados"
ON mercadolivre_registro_comentarios
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir leitura para usuários autenticados"
ON mercadolivre_registro_msgposvenda
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir leitura para usuários autenticados"
ON registro_notificacao_mercadolivre
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir leitura para usuários autenticados"
ON clientes
FOR SELECT
TO authenticated
USING (true);
```

### 3. Configurar autenticação por e-mail no Supabase

1. Acesse: https://app.supabase.com/project/_/auth/providers
2. Habilite "Email" como provider de autenticação
3. Configure as URLs de redirecionamento:
   - Site URL: `http://localhost:3000` (desenvolvimento)
   - Redirect URLs: `http://localhost:3000/login`

### 4. Criar primeiro usuário

Você pode criar usuários de duas formas:

#### Opção 1: Via Interface da Aplicação
1. Inicie o servidor: `npm run dev`
2. Acesse: http://localhost:3000/login
3. Clique na aba "Cadastro"
4. Preencha o formulário e crie sua conta
5. Verifique seu e-mail para confirmar a conta

#### Opção 2: Via Dashboard do Supabase
1. Acesse: https://app.supabase.com/project/_/auth/users
2. Clique em "Add user" → "Create new user"
3. Preencha e-mail e senha
4. O usuário será criado automaticamente como confirmado

## Estrutura do Sistema de Autenticação

### Arquivos Criados

```
soia/
├── lib/
│   ├── supabase-client.ts      # Cliente Supabase para componentes client-side
│   ├── supabase-server.ts      # Cliente Supabase para Server Components
│   ├── supabase-middleware.ts  # Utilitário para middleware Next.js
│   └── supabase.ts            # Mantido para compatibilidade
├── contexts/
│   └── auth-context.tsx       # Context Provider de autenticação
├── components/
│   ├── auth-guard.tsx         # Componente de proteção de rotas
│   ├── ui/
│   │   ├── avatar.tsx         # Componente de avatar do usuário
│   │   ├── toast.tsx          # Sistema de notificações
│   │   └── toaster.tsx        # Container de toasts
│   └── sidebar.tsx            # Atualizado com perfil e logout
├── hooks/
│   └── use-toast.ts           # Hook para sistema de notificações
├── app/
│   ├── login/
│   │   └── page.tsx           # Página de login/cadastro
│   ├── layout.tsx             # Layout raiz com AuthProvider
│   └── page.tsx               # Dashboard protegido com AuthGuard
└── middleware.ts              # Middleware de autenticação Next.js
```

### Funcionalidades Implementadas

✅ **Sistema de Login e Cadastro**
- Interface moderna com tabs para Login/Cadastro
- Validação de formulários
- Feedback visual com toasts

✅ **Proteção de Rotas**
- Middleware Next.js para gerenciar sessões
- AuthGuard para proteger páginas específicas
- Redirecionamento automático para login

✅ **Gestão de Sessão**
- Context API para estado global de autenticação
- Persistência de sessão com cookies
- Refresh automático de token

✅ **Interface do Usuário**
- Avatar e informações do usuário na sidebar
- Botão de logout com confirmação visual
- Loading states durante autenticação

## Como Usar

### Proteger uma Página

Para proteger uma página, envolva o conteúdo com `AuthGuard`:

```tsx
import { AuthGuard } from "@/components/auth-guard"

export default function MinhaPage() {
  return (
    <AuthGuard>
      <div>Conteúdo protegido aqui</div>
    </AuthGuard>
  )
}
```

### Acessar Dados do Usuário

Use o hook `useAuth` para acessar dados do usuário autenticado:

```tsx
import { useAuth } from "@/contexts/auth-context"

export function MeuComponente() {
  const { user, signOut } = useAuth()
  
  return (
    <div>
      <p>E-mail: {user?.email}</p>
      <button onClick={signOut}>Sair</button>
    </div>
  )
}
```

### Fazer Logout

O logout pode ser feito de duas formas:

```tsx
// Opção 1: Via hook useAuth
const { signOut } = useAuth()
await signOut()

// Opção 2: Via sidebar (já implementado)
// O usuário pode clicar no botão "Sair" na sidebar
```

## Segurança

### Boas Práticas Implementadas

1. **Row Level Security (RLS)**: Todas as tabelas devem ter RLS habilitado
2. **Cookies HTTP-only**: Sessões armazenadas de forma segura
3. **Validação Server-side**: Middleware valida sessões no servidor
4. **HTTPS em Produção**: Sempre use HTTPS em ambiente de produção
5. **Tokens com Refresh**: Tokens são renovados automaticamente

### Próximos Passos de Segurança (Recomendados)

- [ ] Implementar autenticação de dois fatores (2FA)
- [ ] Adicionar rate limiting para tentativas de login
- [ ] Configurar políticas RLS mais granulares por usuário
- [ ] Implementar recuperação de senha
- [ ] Adicionar logs de auditoria de login

## Troubleshooting

### Erro: "Invalid API key"
- Verifique se as variáveis de ambiente estão corretas
- Certifique-se de que o arquivo `.env.local` existe
- Reinicie o servidor de desenvolvimento

### Usuário não consegue fazer login
- Verifique se o e-mail foi confirmado no Supabase
- Veja os logs de erro no console do navegador
- Verifique as políticas RLS no Supabase

### Redirecionamento infinito
- Verifique se a página de login não está protegida com AuthGuard
- Confirme que o middleware está configurado corretamente
- Limpe os cookies do navegador e tente novamente

## Suporte

Para mais informações sobre o Supabase Auth, consulte:
- [Documentação do Supabase Auth](https://supabase.com/docs/guides/auth)
- [Next.js com Supabase](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
