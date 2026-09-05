import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from '@tanstack/react-router'
import { LoginScreen } from '@/features/auth/login-screen'
import { ClientesPage } from '@/features/clientes/ClientesPage'
import { authClient } from '@/lib/auth-client'

/** Busca a sessão no servidor (guards de rota). */
async function getSession() {
  const { data } = await authClient.getSession()
  return data
}

const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

// Rotas públicas: se já logado, vai para o app.
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  beforeLoad: async () => {
    if (await getSession()) throw redirect({ to: '/' })
  },
  component: LoginScreen,
})

// Rota protegida: sem sessão, vai para o login. A área de clientes é a raiz
// do painel — é para isso que a aplicação existe.
const clientesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: async () => {
    if (!(await getSession())) throw redirect({ to: '/login' })
  },
  component: ClientesPage,
})

// Não há rota de cadastro: quem entra no painel foi cadastrado por um
// administrador em Configurações › Administradores.
const routeTree = rootRoute.addChildren([loginRoute, clientesRoute])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
