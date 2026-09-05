import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from '@tanstack/react-router'
import { LoginScreen } from '@/features/auth/login-screen'
import { RegisterScreen } from '@/features/auth/register-screen'
import { Dashboard } from '@/features/dashboard/dashboard'
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

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  beforeLoad: async () => {
    if (await getSession()) throw redirect({ to: '/' })
  },
  component: RegisterScreen,
})

// Rota protegida: sem sessão, vai para o login.
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: async () => {
    if (!(await getSession())) throw redirect({ to: '/login' })
  },
  component: Dashboard,
})

const routeTree = rootRoute.addChildren([
  loginRoute,
  registerRoute,
  dashboardRoute,
])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
