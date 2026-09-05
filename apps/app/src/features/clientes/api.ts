import {
  getPainelQueryKey,
  useDeleteAcessosId,
  useDeleteAdministradoresId,
  useDeleteAnotacoesId,
  useDeleteArquivosId,
  useDeleteClientesId,
  useDeleteFunisId,
  useDeleteNotasId,
  useGetPainel,
  usePatchAdministradoresId,
  usePatchAnotacoesId,
  usePatchChecklistId,
  usePatchClientesId,
  usePatchFunisId,
  usePostAcessos,
  usePostAdministradores,
  usePostAnotacoes,
  usePostArquivos,
  usePostClientes,
  usePostFunis,
  usePostNotas,
} from '@repo/api-client/hooks'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type {
  AcessoCliente,
  Administrador,
  Anotacao,
  ArquivoCliente,
  Cliente,
  Funil,
  ItemChecklist,
  NotaCliente,
} from './dados'

/* O painel inteiro vem de GET /painel numa chamada só, do mesmo jeito que a
 * tela sempre trabalhou: listas soltas em memória, filtradas na hora de
 * renderizar. Cada mutação invalida esse retrato e o React Query recarrega. */

const VAZIO = {
  clientes: [],
  funis: [],
  arquivos: [],
  acessos: [],
  notas: [],
  checklists: [],
  anotacoes: [],
  administradores: [],
}

/** Mostra o motivo real quando a API recusa (papel sem permissão, etc.). */
function aviso(erro: unknown, alternativa: string) {
  const resposta = (
    erro as { response?: { data?: { error?: string } } } | undefined
  )?.response
  toast.error(resposta?.data?.error ?? alternativa)
}

export function usePainel() {
  const queryClient = useQueryClient()
  const { data, isPending } = useGetPainel()

  /* Toda mutação recarrega o painel — é uma chamada só e mantém as oito
     listas coerentes entre si (excluir cliente leva funis junto, por ex.). */
  const recarregar = {
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: getPainelQueryKey() }),
  }

  const criarClienteM = usePostClientes({ mutation: recarregar })
  const atualizarClienteM = usePatchClientesId({ mutation: recarregar })
  const excluirClienteM = useDeleteClientesId({ mutation: recarregar })
  const criarFunilM = usePostFunis({ mutation: recarregar })
  const atualizarFunilM = usePatchFunisId({ mutation: recarregar })
  const excluirFunilM = useDeleteFunisId({ mutation: recarregar })
  const criarArquivoM = usePostArquivos({ mutation: recarregar })
  const excluirArquivoM = useDeleteArquivosId({ mutation: recarregar })
  const criarAcessoM = usePostAcessos({ mutation: recarregar })
  const excluirAcessoM = useDeleteAcessosId({ mutation: recarregar })
  const criarNotaM = usePostNotas({ mutation: recarregar })
  const excluirNotaM = useDeleteNotasId({ mutation: recarregar })
  const atualizarItemM = usePatchChecklistId({ mutation: recarregar })
  const criarAnotacaoM = usePostAnotacoes({ mutation: recarregar })
  const atualizarAnotacaoM = usePatchAnotacoesId({ mutation: recarregar })
  const excluirAnotacaoM = useDeleteAnotacoesId({ mutation: recarregar })
  const criarAdminM = usePostAdministradores({ mutation: recarregar })
  const atualizarAdminM = usePatchAdministradoresId({ mutation: recarregar })
  const excluirAdminM = useDeleteAdministradoresId({ mutation: recarregar })

  const painel = data?.data ?? VAZIO

  return {
    carregando: isPending,

    clientes: painel.clientes as Cliente[],
    funis: painel.funis as Funil[],
    arquivos: painel.arquivos as ArquivoCliente[],
    acessos: painel.acessos as AcessoCliente[],
    notas: painel.notas as NotaCliente[],
    checklists: painel.checklists as ItemChecklist[],
    anotacoes: painel.anotacoes as Anotacao[],
    administradores: painel.administradores as Administrador[],

    // ─── Clientes ─────────────────────────────────────────────

    criarCliente: (dados: Omit<Cliente, 'id'>) =>
      criarClienteM.mutate(
        { data: dados },
        { onError: (erro) => aviso(erro, 'Não foi possível cadastrar') },
      ),

    atualizarCliente: (id: string, dados: Partial<Omit<Cliente, 'id'>>) =>
      atualizarClienteM.mutate(
        { id, data: dados },
        { onError: (erro) => aviso(erro, 'Não foi possível salvar') },
      ),

    excluirCliente: (id: string) =>
      excluirClienteM.mutate(
        { id },
        { onError: (erro) => aviso(erro, 'Não foi possível excluir') },
      ),

    // ─── Funis ────────────────────────────────────────────────

    criarFunil: (dados: Omit<Funil, 'id'>) =>
      criarFunilM.mutate(
        { data: dados },
        {
          onError: (erro) => aviso(erro, 'Não foi possível cadastrar o funil'),
        },
      ),

    atualizarFunil: (id: string, dados: Partial<Omit<Funil, 'id'>>) =>
      atualizarFunilM.mutate(
        { id, data: dados },
        { onError: (erro) => aviso(erro, 'Não foi possível salvar o funil') },
      ),

    excluirFunil: (id: string) =>
      excluirFunilM.mutate(
        { id },
        { onError: (erro) => aviso(erro, 'Não foi possível excluir o funil') },
      ),

    // ─── Arquivos e acessos ───────────────────────────────────

    criarArquivo: (dados: Omit<ArquivoCliente, 'id'>) =>
      criarArquivoM.mutate(
        { data: dados },
        { onError: (erro) => aviso(erro, 'Não foi possível adicionar o link') },
      ),

    excluirArquivo: (id: string) =>
      excluirArquivoM.mutate(
        { id },
        { onError: (erro) => aviso(erro, 'Não foi possível remover o link') },
      ),

    criarAcesso: (dados: Omit<AcessoCliente, 'id'>) =>
      criarAcessoM.mutate(
        { data: dados },
        { onError: (erro) => aviso(erro, 'Não foi possível salvar o acesso') },
      ),

    excluirAcesso: (id: string) =>
      excluirAcessoM.mutate(
        { id },
        { onError: (erro) => aviso(erro, 'Não foi possível remover o acesso') },
      ),

    // ─── Notas ────────────────────────────────────────────────

    criarNota: (clienteId: string, texto: string) =>
      criarNotaM.mutate(
        { data: { clienteId, texto } },
        { onError: (erro) => aviso(erro, 'Não foi possível salvar a nota') },
      ),

    excluirNota: (id: string) =>
      excluirNotaM.mutate(
        { id },
        { onError: (erro) => aviso(erro, 'Não foi possível apagar a nota') },
      ),

    // ─── Checklist ────────────────────────────────────────────

    atualizarItemChecklist: (
      id: string,
      mudanca: { recebido?: boolean; link?: string | null },
    ) =>
      atualizarItemM.mutate(
        { id, data: mudanca },
        { onError: (erro) => aviso(erro, 'Não foi possível atualizar o item') },
      ),

    // ─── Mural ────────────────────────────────────────────────

    criarAnotacao: async (
      dados: Omit<Anotacao, 'id' | 'autorId' | 'autor'>,
    ) => {
      try {
        const criada = await criarAnotacaoM.mutateAsync({ data: dados })
        return criada.data.id
      } catch (erro) {
        aviso(erro, 'Não foi possível criar a anotação')
        return null
      }
    },

    atualizarAnotacao: (id: string, mudanca: Partial<Anotacao>) =>
      atualizarAnotacaoM.mutate(
        {
          id,
          data: {
            ...(mudanca.x !== undefined ? { x: mudanca.x } : {}),
            ...(mudanca.y !== undefined ? { y: mudanca.y } : {}),
            ...(mudanca.texto !== undefined ? { texto: mudanca.texto } : {}),
            ...(mudanca.cor !== undefined ? { cor: mudanca.cor } : {}),
          },
        },
        {
          onError: (erro) => aviso(erro, 'Não foi possível salvar a anotação'),
        },
      ),

    excluirAnotacao: (id: string) =>
      excluirAnotacaoM.mutate(
        { id },
        { onError: (erro) => aviso(erro, 'Não foi possível excluir') },
      ),

    // ─── Equipe ───────────────────────────────────────────────

    /* Cadastrar alguém na equipe é criar o acesso dela: a senha vai junto e
       é obrigatória. */
    criarAdministrador: (
      dados: Omit<Administrador, 'id' | 'temAcesso'> & {
        email: string
        senha: string
      },
    ) =>
      criarAdminM.mutate(
        { data: dados },
        { onError: (erro) => aviso(erro, 'Não foi possível cadastrar') },
      ),

    atualizarAdministrador: (
      id: string,
      dados: Partial<Omit<Administrador, 'id' | 'temAcesso'>> & {
        senha?: string
      },
    ) =>
      atualizarAdminM.mutate(
        { id, data: dados },
        { onError: (erro) => aviso(erro, 'Não foi possível salvar') },
      ),

    excluirAdministrador: (id: string) =>
      excluirAdminM.mutate(
        { id },
        { onError: (erro) => aviso(erro, 'Não foi possível excluir') },
      ),
  }
}
