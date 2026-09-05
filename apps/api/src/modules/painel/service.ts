import { prisma } from '@repo/database'
import { MODELO_CHECKLIST } from './modelo-checklist.js'
import type {
  AcessoDTO,
  AdministradorDTO,
  AnotacaoDTO,
  ArquivoDTO,
  ClienteDTO,
  FunilDTO,
  ItemChecklistDTO,
  NotaDTO,
  Painel,
} from './schemas.js'

/** AAAA-MM-DD — o formato que a tela usa em todas as datas. */
function paraDiaIso(data: Date | null): string | null {
  return data ? data.toISOString().slice(0, 10) : null
}

/** Aceita a data como AAAA-MM-DD e guarda como Date, sem fuso no meio. */
function paraData(dia: string | null): Date | null {
  return dia ? new Date(`${dia}T00:00:00.000Z`) : null
}

/**
 * Camada de dados do painel de clientes.
 *
 * A tela trabalha com listas soltas (clientes, funis, arquivos...) e filtra em
 * memória, então `getPainel` devolve tudo de uma vez e as mutações são por
 * entidade. Cada método já entrega o shape que a tela espera.
 */
export class PainelService {
  // ─── Retrato completo ───────────────────────────────────────

  async getPainel(): Promise<Painel> {
    const [
      clientes,
      funis,
      arquivos,
      acessos,
      notas,
      checklists,
      anotacoes,
      administradores,
    ] = await Promise.all([
      prisma.cliente.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.funil.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.arquivoCliente.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.acessoCliente.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.notaCliente.findMany({ orderBy: { criadaEm: 'asc' } }),
      prisma.itemChecklist.findMany({ orderBy: { ordem: 'asc' } }),
      prisma.anotacao.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.administrador.findMany({ orderBy: { nome: 'asc' } }),
    ])

    return {
      clientes: clientes.map(this.paraClienteDTO),
      funis: funis.map(this.paraFunilDTO),
      arquivos: arquivos.map(this.paraArquivoDTO),
      acessos: acessos.map(this.paraAcessoDTO),
      notas: notas.map(this.paraNotaDTO),
      checklists: checklists.map(this.paraItemChecklistDTO),
      anotacoes: anotacoes.map(this.paraAnotacaoDTO),
      administradores: administradores.map(this.paraAdministradorDTO),
    }
  }

  // ─── Clientes ───────────────────────────────────────────────

  /* Cliente novo já nasce com o checklist de onboarding: a tela sempre teve o
   * checklist pronto para preencher, sem passo de "criar checklist". */
  async criarCliente(dados: Omit<ClienteDTO, 'id'>): Promise<ClienteDTO> {
    const cliente = await prisma.cliente.create({
      data: {
        nome: dados.nome,
        email: dados.email,
        status: dados.status,
        plano: dados.plano,
        cicloPlano: dados.cicloPlano,
        checklist: {
          create: MODELO_CHECKLIST.map((modelo, ordem) => ({
            grupo: modelo.grupo,
            titulo: modelo.titulo,
            descricao: modelo.descricao ?? null,
            ordem,
          })),
        },
      },
    })

    return this.paraClienteDTO(cliente)
  }

  async atualizarCliente(
    id: string,
    dados: Partial<Omit<ClienteDTO, 'id'>>,
  ): Promise<ClienteDTO | null> {
    const cliente = await prisma.cliente
      .update({ where: { id }, data: dados })
      .catch(() => null)

    return cliente && this.paraClienteDTO(cliente)
  }

  /* Excluir o cliente leva junto funis, arquivos, acessos, notas e checklist —
   * o cascade do schema faz o trabalho. */
  async excluirCliente(id: string): Promise<boolean> {
    const apagado = await prisma.cliente
      .delete({ where: { id } })
      .catch(() => null)

    return apagado !== null
  }

  // ─── Funis ──────────────────────────────────────────────────

  async criarFunil(dados: Omit<FunilDTO, 'id'>): Promise<FunilDTO> {
    const funil = await prisma.funil.create({
      data: {
        clienteId: dados.clienteId,
        nome: dados.nome,
        etapa: dados.etapa,
        status: dados.status,
        responsavel: dados.responsavel,
        dataEntrega: paraData(dados.dataEntrega),
      },
    })

    return this.paraFunilDTO(funil)
  }

  async atualizarFunil(
    id: string,
    dados: Partial<Omit<FunilDTO, 'id'>>,
  ): Promise<FunilDTO | null> {
    const { dataEntrega, ...resto } = dados
    const funil = await prisma.funil
      .update({
        where: { id },
        data: {
          ...resto,
          ...(dataEntrega !== undefined
            ? { dataEntrega: paraData(dataEntrega) }
            : {}),
        },
      })
      .catch(() => null)

    return funil && this.paraFunilDTO(funil)
  }

  async excluirFunil(id: string): Promise<boolean> {
    const apagado = await prisma.funil
      .delete({ where: { id } })
      .catch(() => null)
    return apagado !== null
  }

  // ─── Arquivos ───────────────────────────────────────────────

  async criarArquivo(dados: Omit<ArquivoDTO, 'id'>): Promise<ArquivoDTO> {
    const arquivo = await prisma.arquivoCliente.create({ data: dados })
    return this.paraArquivoDTO(arquivo)
  }

  async excluirArquivo(id: string): Promise<boolean> {
    const apagado = await prisma.arquivoCliente
      .delete({ where: { id } })
      .catch(() => null)

    return apagado !== null
  }

  // ─── Acessos ────────────────────────────────────────────────

  async criarAcesso(dados: Omit<AcessoDTO, 'id'>): Promise<AcessoDTO> {
    const acesso = await prisma.acessoCliente.create({ data: dados })
    return this.paraAcessoDTO(acesso)
  }

  async excluirAcesso(id: string): Promise<boolean> {
    const apagado = await prisma.acessoCliente
      .delete({ where: { id } })
      .catch(() => null)

    return apagado !== null
  }

  // ─── Notas do cliente ───────────────────────────────────────

  /* O nome do autor é gravado junto com o id: se a pessoa sair da equipe, a
   * nota continua assinada. */
  async criarNota(
    clienteId: string,
    texto: string,
    autor: { id: string | null; nome: string },
  ): Promise<NotaDTO> {
    const nota = await prisma.notaCliente.create({
      data: { clienteId, texto, autorId: autor.id, autor: autor.nome },
    })

    return this.paraNotaDTO(nota)
  }

  async excluirNota(id: string): Promise<boolean> {
    const apagado = await prisma.notaCliente
      .delete({ where: { id } })
      .catch(() => null)

    return apagado !== null
  }

  // ─── Checklist ──────────────────────────────────────────────

  async atualizarItemChecklist(
    id: string,
    dados: { recebido?: boolean; link?: string | null },
  ): Promise<ItemChecklistDTO | null> {
    const item = await prisma.itemChecklist
      .update({ where: { id }, data: dados })
      .catch(() => null)

    return item && this.paraItemChecklistDTO(item)
  }

  // ─── Mural ──────────────────────────────────────────────────

  async criarAnotacao(
    dados: Omit<AnotacaoDTO, 'id' | 'autorId' | 'autor'>,
    autor: { id: string | null; nome: string },
  ): Promise<AnotacaoDTO> {
    const anotacao = await prisma.anotacao.create({
      data: { ...dados, autorId: autor.id, autor: autor.nome },
    })

    return this.paraAnotacaoDTO(anotacao)
  }

  async atualizarAnotacao(
    id: string,
    dados: Partial<Pick<AnotacaoDTO, 'x' | 'y' | 'texto' | 'cor'>>,
  ): Promise<AnotacaoDTO | null> {
    const anotacao = await prisma.anotacao
      .update({ where: { id }, data: dados })
      .catch(() => null)

    return anotacao && this.paraAnotacaoDTO(anotacao)
  }

  async excluirAnotacao(id: string): Promise<boolean> {
    const apagado = await prisma.anotacao
      .delete({ where: { id } })
      .catch(() => null)

    return apagado !== null
  }

  // ─── Equipe ─────────────────────────────────────────────────

  /* Toda pessoa cadastrada na equipe entra com uma conta: `userId` é
   * obrigatório aqui, e quem o cria é a rota, chamando o Better Auth. */
  async criarAdministrador(
    dados: Omit<AdministradorDTO, 'id' | 'temAcesso'>,
    userId: string,
  ): Promise<AdministradorDTO> {
    const administrador = await prisma.administrador.create({
      data: { ...dados, userId },
    })

    return this.paraAdministradorDTO(administrador)
  }

  /* Liga uma ficha antiga (cadastrada antes de a conta ser obrigatória) à
   * conta recém-criada para ela. */
  async vincularConta(id: string, userId: string) {
    return prisma.administrador.update({ where: { id }, data: { userId } })
  }

  /** Ficha pelo id, para saber se já tem acesso antes de editar. */
  async buscarAdministrador(id: string) {
    return prisma.administrador.findUnique({ where: { id } })
  }

  async atualizarAdministrador(
    id: string,
    dados: Partial<Omit<AdministradorDTO, 'id' | 'temAcesso'>>,
  ): Promise<AdministradorDTO | null> {
    const administrador = await prisma.administrador
      .update({ where: { id }, data: dados })
      .catch(() => null)

    if (!administrador) return null

    /* Desligar o "Acesso liberado" tira a pessoa na hora: o login já é barrado
       na porta, mas quem estava logado continuaria com a sessão de pé até ela
       expirar. */
    if (dados.ativo === false && administrador.userId) {
      await prisma.sessions.deleteMany({
        where: { userId: administrador.userId },
      })
    }

    return this.paraAdministradorDTO(administrador)
  }

  /* Excluir alguém da equipe leva a conta junto — senão o login continuaria
   * funcionando para quem não está mais no time. Apagar `users` derruba
   * sessões e senha por cascade. */
  async excluirAdministrador(id: string): Promise<boolean> {
    const apagado = await prisma.administrador
      .delete({ where: { id } })
      .catch(() => null)

    if (!apagado) return false

    if (apagado.userId) {
      await prisma.users
        .delete({ where: { id: apagado.userId } })
        .catch(() => null)
    }

    return true
  }

  /** Ficha da equipe correspondente a uma conta logada. */
  async fichaDoUsuario(userId: string) {
    return prisma.administrador.findUnique({ where: { userId } })
  }

  // ─── Conversões ─────────────────────────────────────────────

  private paraClienteDTO(c: {
    id: string
    nome: string
    email: string
    status: ClienteDTO['status']
    plano: ClienteDTO['plano']
    cicloPlano: ClienteDTO['cicloPlano']
  }): ClienteDTO {
    return {
      id: c.id,
      nome: c.nome,
      email: c.email,
      status: c.status,
      plano: c.plano,
      cicloPlano: c.cicloPlano,
    }
  }

  private paraFunilDTO(f: {
    id: string
    clienteId: string
    nome: string
    etapa: FunilDTO['etapa']
    status: FunilDTO['status']
    responsavel: string
    dataEntrega: Date | null
  }): FunilDTO {
    return {
      id: f.id,
      clienteId: f.clienteId,
      nome: f.nome,
      etapa: f.etapa,
      status: f.status,
      responsavel: f.responsavel,
      dataEntrega: paraDiaIso(f.dataEntrega),
    }
  }

  private paraArquivoDTO(a: {
    id: string
    clienteId: string
    tipo: ArquivoDTO['tipo']
    nome: string
    url: string
  }): ArquivoDTO {
    return {
      id: a.id,
      clienteId: a.clienteId,
      tipo: a.tipo,
      nome: a.nome,
      url: a.url,
    }
  }

  private paraAcessoDTO(a: {
    id: string
    clienteId: string
    plataforma: string
    email: string
    senha: string
    url: string | null
  }): AcessoDTO {
    return {
      id: a.id,
      clienteId: a.clienteId,
      plataforma: a.plataforma,
      email: a.email,
      senha: a.senha,
      url: a.url,
    }
  }

  private paraNotaDTO(n: {
    id: string
    clienteId: string
    autorId: string | null
    autor: string
    criadaEm: Date
    texto: string
  }): NotaDTO {
    return {
      id: n.id,
      clienteId: n.clienteId,
      autorId: n.autorId ?? '',
      autor: n.autor,
      criadaEm: paraDiaIso(n.criadaEm) ?? '',
      texto: n.texto,
    }
  }

  private paraItemChecklistDTO(i: {
    id: string
    clienteId: string
    grupo: ItemChecklistDTO['grupo']
    titulo: string
    descricao: string | null
    recebido: boolean
    link: string | null
  }): ItemChecklistDTO {
    return {
      id: i.id,
      clienteId: i.clienteId,
      grupo: i.grupo,
      titulo: i.titulo,
      ...(i.descricao ? { descricao: i.descricao } : {}),
      recebido: i.recebido,
      link: i.link,
    }
  }

  private paraAnotacaoDTO(a: {
    id: string
    tipo: AnotacaoDTO['tipo']
    x: number
    y: number
    texto: string
    cor: AnotacaoDTO['cor']
    autorId: string | null
    autor: string
  }): AnotacaoDTO {
    return {
      id: a.id,
      tipo: a.tipo,
      x: a.x,
      y: a.y,
      texto: a.texto,
      cor: a.cor,
      autorId: a.autorId ?? '',
      autor: a.autor,
    }
  }

  private paraAdministradorDTO(a: {
    id: string
    nome: string
    cargo: string
    email: string | null
    papel: AdministradorDTO['papel']
    ativo: boolean
    avatar: AdministradorDTO['avatar']
    userId: string | null
  }): AdministradorDTO {
    return {
      id: a.id,
      nome: a.nome,
      cargo: a.cargo,
      email: a.email,
      papel: a.papel,
      ativo: a.ativo,
      avatar: a.avatar,
      temAcesso: a.userId !== null,
    }
  }
}
