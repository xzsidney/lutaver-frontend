# LUTAVER Frontend - Sistema de Autenticação

Frontend React da plataforma educacional gamificada LUTAVER.

## 🚀 Tecnologias

- **React 18** + **TypeScript**
- **Vite** (dev server rápido)
- **Apollo Client** (GraphQL)
- **React Router** (navegação)
- **React Hook Form** + **Zod** (formulários e validação)

## 🔐 Segurança

- ✅ Access token armazenado em localStorage (apenas para comunicação)
- ✅ Refresh token em httpOnly cookie (gerenciado pelo backend)
- ✅ Refresh automático quando access token expira
- ✅ Mutex para evitar múltiplos refreshes simultâneos
- ✅ Reidratação de sessão ao recarregar página
- ✅ CORS configurado com credentials

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Copiar .env.example para .env.local
copy .env.example .env.local

# Se necessário, editar .env.local com a URL do backend
```

## 🏃 Executar

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build de produção
npm run preview
```

## 📂 Estrutura

```
frontend/
├── src/
│   ├── components/
│   │   └── ProtectedRoute.tsx    # Componente para rotas protegidas
│   ├── context/
│   │   └── AuthContext.tsx       # Context de autenticação
│   ├── graphql/
│   │   ├── mutations.ts          # Mutations GraphQL
│   │   └── queries.ts            # Queries GraphQL
│   ├── pages/
│   │   ├── LoginPage.tsx         # Página de login
│   │   ├── RegisterPage.tsx      # Página de registro
│   │   └── DashboardPage.tsx     # Dashboard do usuário
│   ├── routes/
│   │   └── AppRoutes.tsx         # Configuração de rotas
│   ├── services/
│   │   ├── apolloClient.ts       # Apollo Client configurado
│   │   └── refreshMutex.ts       # Mutex para refresh tokens
│   ├── styles/
│   │   └── global.css            # Estilos globais
│   ├── App.tsx                   # Componente principal
│   └── main.tsx                  # Entry point
└── package.json
```

## 🔄 Fluxo de Autenticação

### 1. Login/Registro
- Usuário preenche formulário
- Chamada GraphQL mutation
- Access token recebido e salvo em localStorage
- Refresh token definido automaticamente em cookie pelo backend
- Redirecionamento para dashboard

### 2. Requisições Autenticadas
- Apollo Client anexa access token no header
- Backend valida token
- Retorna dados

### 3. Refresh Automático
- Quando access token expira (15min)
- Apollo Client intercepta erro UNAUTHENTICATED
- Mutex garante que apenas um refresh aconteça
- Mutation refreshToken chamada (usa cookie automaticamente)
- Novo access token recebido e salvo
- Requisição original é repetida

### 4. Reidratação
- Ao recarregar página
- AuthContext verifica localStorage
- Chama query `me` para validar token
- Se válido, restaura sessão
- Se inválido, tenta refresh automático

### 5. Logout
- **Logout Single**: Revoga refresh token atual
- **Logout All**: Revoga todos os tokens de todos os dispositivos

## 🛡️ Rotas

- `/login` - Página de login
- `/register` - Página de cadastro
- `/dashboard` - Dashboard (protegida)
- `/` - Redireciona para dashboard
- `/*` - Redireciona para login

## 🎨 Customização

Os estilos são inline por simplicidade nesta v1. Para produção, considere:
- CSS Modules
- Styled Components
- Tailwind CSS
- Material-UI ou outra biblioteca de componentes

## ⚠️ Produção

Antes de deploy:
1. Configure `VITE_GRAPHQL_URL` com URL real do backend
2. Execute `npm run build`
3. Sirva pasta `dist` com servidor estático (Nginx, Vercel, Netlify, etc.)
4. Certifique-se de que backend está em HTTPS para cookies secure
