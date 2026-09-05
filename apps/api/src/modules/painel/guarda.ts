import type { Papel } from '@repo/database'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { toHeaders } from '@/utils/auth.js'
import type { FastifyTypeInstance } from '@/utils/fastify.js'

/** Quem está logado, já casado com a ficha da equipe. */
export interface Autor {
  id: string | null
  nome: string
  papel: Papel
}

/* Mesma matriz de PERMISSOES da tela. Lá ela esconde botões; aqui ela decide
 * de verdade — esconder o botão não impede ninguém de chamar a API na mão. */
const PERMISSOES: Record<Papel, { escreve: boolean; gerenciaEquipe: boolean }> =
  {
    administrador: { escreve: true, gerenciaEquipe: true },
    editor: { escreve: true, gerenciaEquipe: false },
    visualizador: { escreve: false, gerenciaEquipe: false },
  }

/**
 * Resolve a sessão e devolve o autor da ação. Responde 401 e devolve `null`
 * quando não há sessão válida.
 */
export async function exigirSessao(
  scope: FastifyTypeInstance,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<Autor | null> {
  const sessao = await scope.services.auth.auth.api.getSession({
    headers: toHeaders(request),
  })

  if (!sessao?.user) {
    await reply.status(401).send({ error: 'Não autenticado' })
    return null
  }

  const ficha = await scope.services.painel.fichaDoUsuario(sessao.user.id)

  /* Conta sem ficha na equipe entra só para ler — a ficha (com cargo e papel)
   * é criada por um administrador em Configurações › Administradores. */
  if (!ficha) {
    return { id: null, nome: sessao.user.name, papel: 'visualizador' }
  }

  if (!ficha.ativo) {
    await reply.status(403).send({ error: 'Acesso desativado' })
    return null
  }

  return { id: ficha.id, nome: ficha.nome, papel: ficha.papel }
}

/** Sessão + permissão de escrita (cliente, funil, arquivo, nota, mural). */
export async function exigirEscrita(
  scope: FastifyTypeInstance,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<Autor | null> {
  const autor = await exigirSessao(scope, request, reply)
  if (!autor) return null

  if (!PERMISSOES[autor.papel].escreve) {
    await reply.status(403).send({ error: 'Seu papel não permite alterar' })
    return null
  }

  return autor
}

/** Sessão + permissão de mexer na equipe (só administrador). */
export async function exigirGestaoDeEquipe(
  scope: FastifyTypeInstance,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<Autor | null> {
  const autor = await exigirSessao(scope, request, reply)
  if (!autor) return null

  if (!PERMISSOES[autor.papel].gerenciaEquipe) {
    await reply
      .status(403)
      .send({ error: 'Só administradores gerenciam a equipe' })
    return null
  }

  return autor
}
