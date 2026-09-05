import { useNavigate } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'
import type { Administrador } from './dados'

/* A sessão do Better Auth traz id, nome e e-mail — cargo, papel e avatar
 * moram na ficha do administrador. Casamos os dois pelo e-mail, que é o
 * campo único dos dois lados. */
export function useUsuarioLogado(
  administradores: Administrador[],
): Administrador | null {
  const { data: sessao } = authClient.useSession()
  const usuario = sessao?.user
  if (!usuario) return null

  const email = usuario.email.toLowerCase()
  const ficha = administradores.find(
    (administrador) => administrador.email?.toLowerCase() === email,
  )
  if (ficha) return ficha

  /* Sessão válida sem ficha na equipe: mostra a pessoa mesmo assim, para o
   * painel não ficar sem assinatura nas notas. A ficha vem no cadastro. */
  return {
    id: usuario.id,
    nome: usuario.name,
    cargo: '',
    email: usuario.email,
    papel: 'visualizador',
    ativo: true,
    avatar: 'estrela',
  }
}

/* Encerra a sessão no servidor e devolve a pessoa para o login. */
export function useSair() {
  const navigate = useNavigate()
  return async () => {
    await authClient.signOut()
    navigate({ to: '/login' })
  }
}
