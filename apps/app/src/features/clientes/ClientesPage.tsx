import { ChevronDown, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { usePainel } from './api'
import { Baloes } from './baloes'
import { BarraLateral, type SecaoMenu } from './barra-lateral'
import { Confete } from './confete'
import {
  type AcessoCliente,
  type Administrador,
  type Anotacao,
  type ArquivoCliente,
  acessosDoCliente,
  arquivosDoCliente,
  type Cliente,
  COLUNAS_PIPELINE,
  type ColunaPipeline,
  type Funil,
  type ItemChecklist,
  mesesDoFiltro,
  notasDoCliente,
  PERMISSOES,
  type StatusFunil,
  type TipoAnotacao,
} from './dados'
import { EstadoVazio } from './estado-vazio'
import { FormularioAdministrador } from './formulario-administrador'
import { FormularioCliente } from './formulario-cliente'
import { FormularioFunil } from './formulario-funil'
import { PainelCliente } from './painel-cliente'
import { CursoresPresentes } from './presenca'
import { SecaoAcessosEquipe } from './secao-acessos-equipe'
import { SecaoAdministradores } from './secao-administradores'
import { SecaoChecklist } from './secao-checklist'
import { SecaoClientes } from './secao-clientes'
import { type AbaConfiguracoes, AbasConfiguracoes } from './secao-configuracoes'
import { SecaoDashboard } from './secao-dashboard'
import { SecaoFunis } from './secao-funis'
import { SecaoIndicacoes } from './secao-indicacoes'
import { SecaoInvoices } from './secao-invoices'
import { SecaoMural } from './secao-mural'
import { SecaoPipeline } from './secao-pipeline'
import { SinoAtividades } from './sino-atividades'
import { useSair, useUsuarioLogado } from './usuario-logado'

/* Título, descrição e ação de cada seção do menu. `acao` ausente = a seção
 * não tem botão de cadastro no cabeçalho. */
const CABECALHO: Record<
  SecaoMenu,
  { titulo: string; descricao?: string; acao?: string }
> = {
  dashboard: { titulo: 'Dashboard' },
  pipeline: {
    titulo: 'Pipeline',
    descricao:
      'As entregas cadastradas, agrupadas por status. Para criar um card, cadastre a entrega em Entregas.',
  },
  mural: {
    titulo: 'Anotações',
    descricao: 'Quadro do time: post-its, emojis e comentários que todos veem.',
  },
  funis: {
    titulo: 'Entregas',
    descricao: 'As entregas em construção, com a etapa e o status de cada uma.',
    acao: 'Adicionar entrega',
  },
  playbooks: {
    titulo: 'Playbooks',
    descricao: 'Os roteiros que o time segue em cada frente do trabalho.',
  },
  clientes: {
    titulo: 'Clientes',
    descricao:
      'Clientes em processo de construção de funil com o time Clickmax.',
    acao: 'Adicionar cliente',
  },
  documentacao: {
    titulo: 'Documentação',
    descricao: 'O checklist de onboarding que o time envia aos clientes.',
  },
  invoices: {
    titulo: 'Invoices',
    descricao:
      'Os invoices emitidos. Abra um para corrigir e exportar de novo.',
    acao: 'Novo invoice',
  },
  contrato: {
    titulo: 'Contrato',
    descricao: 'Os modelos de contrato que o time envia ao cliente.',
  },
  indicacoes: {
    titulo: 'Indique e ganhe',
    descricao:
      'O programa de indicação do Clickmax, para apresentar ao cliente na conversa.',
  },
  configuracoes: {
    titulo: 'Configurações',
    descricao: 'A equipe e quem entrou no painel.',
  },
}

/* /clientes — menu lateral e as seções da área de clientes. */
/* Os doze meses do filtro, calculados uma vez: eles não mudam enquanto a
 * pessoa está com a tela aberta. */
const MESES_DO_FILTRO = mesesDoFiltro()

export function ClientesPage() {
  /* Os dados do painel vêm do servidor (GET /painel) e cada alteração é uma
     chamada à API — nada mais mora só na memória do navegador. */
  const painel = usePainel()
  const {
    clientes,
    funis,
    anotacoes,
    notas,
    arquivos,
    acessos,
    checklists,
    administradores,
  } = painel

  const [secao, setSecao] = useState<SecaoMenu>('dashboard')
  const [abaConfig, setAbaConfig] =
    useState<AbaConfiguracoes>('administradores')
  /* Quem está logado vem da sessão do servidor — o guard da rota já barrou
     quem não tem sessão, então aqui só falta casar com a ficha da equipe. */
  const usuarioLogado = useUsuarioLogado(administradores)
  const sair = useSair()

  const [formularioCliente, setFormularioCliente] = useState(false)
  const [clienteEmEdicao, setClienteEmEdicao] = useState<Cliente | null>(null)
  /* Guarda o id, não o objeto: assim a ficha aberta acompanha o que voltou da
     API depois de uma edição, em vez de congelar no estado antigo. */
  const [clienteAbertoId, setClienteAbertoId] = useState<string | null>(null)
  const [formularioFunil, setFormularioFunil] = useState(false)
  const [funilEmEdicao, setFunilEmEdicao] = useState<Funil | null>(null)
  /* Cada incremento dispara a comemoração correspondente. */
  const [disparoConfete, setDisparoConfete] = useState(0)
  const [disparoBaloes, setDisparoBaloes] = useState(0)
  const [formularioAdmin, setFormularioAdmin] = useState(false)
  const [adminEmEdicao, setAdminEmEdicao] = useState<Administrador | null>(null)
  /* Qual invoice está aberto no editor. Mora aqui para o botão do cabeçalho
     conseguir abrir um novo, como nas outras seções. */
  const [invoiceAberto, setInvoiceAberto] = useState<string | null>(null)
  /* Vazio = todos os meses. O filtro é do Dashboard e recorta as entregas
     pela data prevista. */
  const [mesDoDashboard, setMesDoDashboard] = useState('')

  const clienteAberto =
    clientes.find((cliente) => cliente.id === clienteAbertoId) ?? null

  /* Quanto cada cliente tem de cada frente, para os selos do cartão. Uma
     passada por lista em vez de um filtro por cliente dentro do render. */
  const contagensPorCliente = useMemo(() => {
    const vazio = () => ({
      entregas: 0,
      anotacoes: 0,
      arquivos: 0,
      acessos: 0,
      /* Fora das frentes: alimenta o anel de progresso do cartão. */
      concluidas: 0,
    })
    const mapa: Record<string, ReturnType<typeof vazio>> = {}
    for (const cliente of clientes) mapa[cliente.id] = vazio()

    for (const funil of funis) {
      const alvo = mapa[funil.clienteId]
      if (!alvo) continue

      alvo.entregas += 1
      if (funil.status === 'concluido') alvo.concluidas += 1
    }
    for (const nota of notas) {
      const alvo = mapa[nota.clienteId]
      if (alvo) alvo.anotacoes += 1
    }
    for (const arquivo of arquivos) {
      const alvo = mapa[arquivo.clienteId]
      if (alvo) alvo.arquivos += 1
    }
    for (const acesso of acessos) {
      const alvo = mapa[acesso.clienteId]
      if (alvo) alvo.acessos += 1
    }

    return mapa
  }, [clientes, funis, notas, arquivos, acessos])
  const cabecalho = CABECALHO[secao]

  function abrirNovoCliente() {
    setClienteEmEdicao(null)
    setFormularioCliente(true)
  }

  function abrirEdicao(cliente: Cliente) {
    setClienteEmEdicao(cliente)
    setFormularioCliente(true)
  }

  /* O mesmo formulário cadastra e edita: se há cliente em edição, atualiza. */
  function salvarCliente(dados: Omit<Cliente, 'id'>) {
    if (clienteEmEdicao) {
      painel.atualizarCliente(clienteEmEdicao.id, dados)
      setClienteEmEdicao(null)
      return
    }

    painel.criarCliente(dados)
    setDisparoBaloes((atual) => atual + 1)
    setSecao('clientes')
  }

  /* Excluir o cliente leva junto os funis, arquivos, acessos, notas e o
     checklist dele — quem faz essa limpeza agora é o cascade do banco. */
  function excluirCliente(cliente: Cliente) {
    painel.excluirCliente(cliente.id)
    if (clienteAbertoId === cliente.id) setClienteAbertoId(null)
  }

  function adicionarArquivo(dados: Omit<ArquivoCliente, 'id'>) {
    painel.criarArquivo(dados)
  }

  function excluirArquivo(id: string) {
    painel.excluirArquivo(id)
  }

  function adicionarAcesso(dados: Omit<AcessoCliente, 'id'>) {
    painel.criarAcesso(dados)
  }

  function excluirAcesso(id: string) {
    painel.excluirAcesso(id)
  }

  /* A assinatura da nota é resolvida no servidor, pela sessão. */
  function adicionarNota(clienteId: string, texto: string) {
    painel.criarNota(clienteId, texto)
  }

  function excluirNota(id: string) {
    painel.excluirNota(id)
  }

  function abrirNovoFunil() {
    setFunilEmEdicao(null)
    setFormularioFunil(true)
  }

  function abrirEdicaoFunil(funil: Funil) {
    setFunilEmEdicao(funil)
    setFormularioFunil(true)
  }

  function salvarFunil(dados: Omit<Funil, 'id'>) {
    if (funilEmEdicao) {
      painel.atualizarFunil(funilEmEdicao.id, dados)

      /* Só a virada para "entregue" comemora — reeditar um funil já entregue
         não solta confete de novo. */
      if (
        dados.status === 'concluido' &&
        funilEmEdicao.status !== 'concluido'
      ) {
        setDisparoConfete((atual) => atual + 1)
      }

      setFunilEmEdicao(null)
      return
    }

    painel.criarFunil(dados)
    setSecao('funis')
  }

  /* Troca direta pelo badge da tabela, sem abrir o formulário. Comemora do
     mesmo jeito quando o funil vira "entregue". */
  function alterarStatusFunil(funil: Funil, status: StatusFunil) {
    if (status === funil.status) return

    painel.atualizarFunil(funil.id, { status })
    if (status === 'concluido') setDisparoConfete((atual) => atual + 1)
  }

  /* Move o funil uma coluna para o lado no quadro. Chegar em "Completo"
     comemora. */
  function moverFunilNaPipeline(funil: Funil, direcao: -1 | 1) {
    const destino = COLUNAS_PIPELINE[
      COLUNAS_PIPELINE.indexOf(funil.status) + direcao
    ] as ColunaPipeline | undefined

    if (!destino) return

    painel.atualizarFunil(funil.id, { status: destino })
    if (destino === 'concluido') setDisparoConfete((atual) => atual + 1)
  }

  /* O id só existe depois que o servidor responde — o mural aguarda para pôr
     o item recém-colado em edição. */
  function criarAnotacao(
    tipo: TipoAnotacao,
    x: number,
    y: number,
    texto: string,
  ) {
    return painel.criarAnotacao({ tipo, x, y, texto, cor: 'amarelo' })
  }

  function atualizarAnotacao(anotacao: Anotacao, mudanca: Partial<Anotacao>) {
    painel.atualizarAnotacao(anotacao.id, mudanca)
  }

  function excluirAnotacao(anotacao: Anotacao) {
    painel.excluirAnotacao(anotacao.id)
  }

  function excluirFunil(funil: Funil) {
    painel.excluirFunil(funil.id)
  }

  /* O checklist nasce junto com o cliente, do lado do servidor: aqui é sempre
     uma atualização de item existente. */
  function atualizarItem(item: ItemChecklist, mudanca: Partial<ItemChecklist>) {
    painel.atualizarItemChecklist(item.id, {
      ...(mudanca.recebido !== undefined ? { recebido: mudanca.recebido } : {}),
      ...(mudanca.link !== undefined ? { link: mudanca.link } : {}),
    })
  }

  function abrirNovoAdmin() {
    setAdminEmEdicao(null)
    setFormularioAdmin(true)
  }

  function abrirEdicaoAdmin(administrador: Administrador) {
    setAdminEmEdicao(administrador)
    setFormularioAdmin(true)
  }

  /* Renomear um administrador acompanha os funis que apontam para ele — o
     vínculo é pelo nome, então cada funil afetado é atualizado junto. */
  function salvarAdmin(
    dados: Omit<Administrador, 'id' | 'temAcesso'> & {
      email: string
      senha?: string
    },
  ) {
    if (adminEmEdicao) {
      const { senha, ...ficha } = dados
      /* A senha só vem preenchida para quem ainda não tinha conta — nesse
         caso ela cria o acesso que faltava. */
      painel.atualizarAdministrador(adminEmEdicao.id, {
        ...ficha,
        ...(senha ? { senha } : {}),
      })

      if (ficha.nome !== adminEmEdicao.nome) {
        for (const funil of funis) {
          if (!funil.responsaveis.includes(adminEmEdicao.nome)) continue

          painel.atualizarFunil(funil.id, {
            responsaveis: funil.responsaveis.map((nome) =>
              nome === adminEmEdicao.nome ? ficha.nome : nome,
            ),
          })
        }
      }

      setAdminEmEdicao(null)
      return
    }

    painel.criarAdministrador({ ...dados, senha: dados.senha ?? '' })
    setSecao('configuracoes')
    setAbaConfig('administradores')
  }

  function excluirAdmin(administrador: Administrador) {
    painel.excluirAdministrador(administrador.id)
  }

  function abrirCadastro() {
    if (secao === 'clientes') abrirNovoCliente()
    else if (secao === 'configuracoes') abrirNovoAdmin()
    else if (secao === 'invoices') setInvoiceAberto('')
    else abrirNovoFunil()
  }

  /* Sem cliente não há a quem vincular um funil. */
  /* Em Configurações só a aba de administradores cadastra algo. */
  const acaoDoCabecalho =
    secao === 'configuracoes'
      ? abaConfig === 'administradores'
        ? 'Adicionar administrador'
        : undefined
      : CABECALHO[secao].acao

  /* O que este papel pode fazer. O servidor recusa de todo jeito; aqui o
     ponto é não oferecer botão que vai dar erro na cara da pessoa. */
  const permissoes = PERMISSOES[usuarioLogado?.papel ?? 'visualizador']

  /* Sem cliente não há a quem vincular uma entrega; no editor de invoice o
     botão de "novo" sairia do lugar, então some enquanto ele está aberto. */
  const temOndeCadastrar =
    secao === 'invoices'
      ? invoiceAberto === null
      : secao !== 'funis' || clientes.length > 0

  const podeCadastrarNaSecao =
    secao === 'clientes'
      ? permissoes.adicionarCliente
      : secao === 'configuracoes'
        ? permissoes.gerenciarEquipe
        : secao === 'funis' || secao === 'invoices'
          ? permissoes.adicionarFunil
          : true

  const podeCadastrar = temOndeCadastrar && podeCadastrarNaSecao

  /* A sessão ainda está sendo lida (ou acabou de cair): o guard da rota leva
     para o login, aqui só evitamos piscar a tela sem usuário. */
  if (!usuarioLogado) return null

  return (
    /* No desktop a janela não rola: o menu fica parado e quem rola é o
       conteúdo. No mobile o menu vira uma faixa no topo, então a página volta
       a rolar inteira — prender ali só esconderia o menu atrás do conteúdo. */
    <div className="flex min-h-screen w-full flex-col bg-[#131316] lg:h-screen lg:min-h-0 lg:flex-row lg:overflow-hidden">
      <BarraLateral ativo={secao} onSelecionar={setSecao} onSair={sair} />

      <main className="min-w-0 flex-1 lg:h-screen lg:overflow-y-auto">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-8 sm:px-8 sm:py-10">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="font-inter font-medium text-2xl text-white leading-tight">
                {cabecalho.titulo}
              </h1>
              {cabecalho.descricao && (
                <p className="max-w-[60ch] pt-1.5 font-inter text-[#8A8A8F] text-sm">
                  {cabecalho.descricao}
                </p>
              )}
            </div>

            {/* Recorte do Dashboard, no canto direito do cabeçalho, onde
                mora a ação das outras seções.
                A seta é desenhada aqui: a nativa do select cola na borda e
                não aceita margem. */}
            {secao === 'dashboard' && (
              <div className="relative w-fit shrink-0">
                <select
                  value={mesDoDashboard}
                  onChange={(evento) => setMesDoDashboard(evento.target.value)}
                  aria-label="Filtrar por mês"
                  className="h-9 appearance-none rounded-lg border border-white/8 bg-white/2 pr-9 pl-3 font-inter text-[#ABABAB] text-xs outline-none focus-visible:border-white/25"
                >
                  <option value="">Todos os meses</option>
                  {MESES_DO_FILTRO.map((mes) => (
                    <option key={mes.valor} value={mes.valor}>
                      {mes.rotulo}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  aria-hidden
                  className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-3 size-3.5 text-[#6F6F76]"
                />
              </div>
            )}

            {acaoDoCabecalho && podeCadastrar && (
              <button
                type="button"
                onClick={abrirCadastro}
                className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-white px-5 font-inter font-medium text-[#131316] text-sm transition-colors hover:bg-white/90"
              >
                <Plus className="size-4" />
                {acaoDoCabecalho}
              </button>
            )}
          </header>

          {secao === 'mural' && (
            <SecaoMural
              anotacoes={anotacoes}
              administradores={administradores}
              usuario={usuarioLogado}
              onCriar={criarAnotacao}
              onAtualizar={atualizarAnotacao}
              onExcluir={excluirAnotacao}
            />
          )}

          {secao === 'pipeline' && (
            <SecaoPipeline
              funis={funis}
              clientes={clientes}
              administradores={administradores}
              onMover={moverFunilNaPipeline}
              onAlterarStatus={alterarStatusFunil}
            />
          )}

          {secao === 'dashboard' && (
            <SecaoDashboard
              clientes={clientes}
              funis={funis}
              administradores={administradores}
              mes={mesDoDashboard}
            />
          )}

          {secao === 'configuracoes' && (
            <>
              <AbasConfiguracoes
                ativa={abaConfig}
                podeVerAcessos={permissoes.gerenciarEquipe}
                onSelecionar={setAbaConfig}
              />

              {abaConfig === 'administradores' && (
                <SecaoAdministradores
                  administradores={administradores}
                  podeGerenciar={permissoes.gerenciarEquipe}
                  onAdicionar={abrirNovoAdmin}
                  onEditar={abrirEdicaoAdmin}
                  onExcluir={excluirAdmin}
                />
              )}

              {abaConfig === 'acessos' && (
                <SecaoAcessosEquipe administradores={administradores} />
              )}
            </>
          )}

          {secao === 'invoices' && (
            <SecaoInvoices
              abertoId={invoiceAberto}
              onAbrir={setInvoiceAberto}
            />
          )}

          {secao === 'indicacoes' && <SecaoIndicacoes />}

          {secao === 'playbooks' && (
            <EstadoVazio
              id="playbooks"
              desenho="documentos"
              titulo="Em breve"
              descricao="Aqui vão ficar os roteiros do time. Ainda não há nada para mostrar."
            />
          )}

          {secao === 'contrato' && (
            <EstadoVazio
              id="contrato"
              titulo="Em breve"
              descricao="Aqui vão ficar os modelos de contrato do time. Ainda não há nada para mostrar."
            />
          )}

          {secao === 'documentacao' && (
            <SecaoChecklist
              clientes={clientes}
              itens={checklists}
              onAlternarRecebido={(item) =>
                atualizarItem(item, { recebido: !item.recebido })
              }
              onDefinirLink={(item, link) => atualizarItem(item, { link })}
            />
          )}

          {secao === 'funis' && (
            <SecaoFunis
              clientes={clientes}
              funis={funis}
              administradores={administradores}
              podeEditar={permissoes.adicionarFunil}
              onAdicionarFunil={abrirNovoFunil}
              onEditarFunil={abrirEdicaoFunil}
              onExcluirFunil={excluirFunil}
              onAlterarStatus={alterarStatusFunil}
            />
          )}

          {secao === 'clientes' && (
            <SecaoClientes
              clientes={clientes}
              contagens={contagensPorCliente}
              podeEditar={permissoes.editarCliente}
              onAdicionar={abrirNovoCliente}
              onAbrir={(cliente) => setClienteAbertoId(cliente.id)}
              onEditar={abrirEdicao}
              onExcluir={excluirCliente}
            />
          )}
        </div>
      </main>

      <SinoAtividades administradores={administradores} />

      <CursoresPresentes secao={secao} />

      <Confete disparo={disparoConfete} />
      <Baloes disparo={disparoBaloes} />

      <PainelCliente
        cliente={clienteAberto}
        funis={
          clienteAberto
            ? funis.filter((funil) => funil.clienteId === clienteAberto.id)
            : []
        }
        arquivos={
          clienteAberto ? arquivosDoCliente(arquivos, clienteAberto.id) : []
        }
        acessos={
          clienteAberto ? acessosDoCliente(acessos, clienteAberto.id) : []
        }
        notas={clienteAberto ? notasDoCliente(notas, clienteAberto.id) : []}
        administradores={administradores}
        onFechar={() => setClienteAbertoId(null)}
        onAdicionarArquivo={adicionarArquivo}
        onExcluirArquivo={excluirArquivo}
        onAdicionarAcesso={adicionarAcesso}
        onExcluirAcesso={excluirAcesso}
        onEditarCliente={(dados) => {
          if (clienteAberto) painel.atualizarCliente(clienteAberto.id, dados)
        }}
        onAdicionarNota={adicionarNota}
        onExcluirNota={excluirNota}
      />

      <FormularioCliente
        aberto={formularioCliente}
        onAbertoChange={setFormularioCliente}
        cliente={clienteEmEdicao}
        onSalvar={salvarCliente}
      />

      <FormularioAdministrador
        aberto={formularioAdmin}
        onAbertoChange={setFormularioAdmin}
        administrador={adminEmEdicao}
        onSalvar={salvarAdmin}
      />

      <FormularioFunil
        aberto={formularioFunil}
        onAbertoChange={setFormularioFunil}
        clientes={clientes}
        administradores={administradores}
        funil={funilEmEdicao}
        onSalvar={salvarFunil}
      />
    </div>
  )
}
