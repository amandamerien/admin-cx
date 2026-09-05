import { Plus } from 'lucide-react'
import { useState } from 'react'
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
  notasDoCliente,
  type StatusFunil,
  type TipoAnotacao,
} from './dados'
import { FormularioAdministrador } from './formulario-administrador'
import { FormularioCliente } from './formulario-cliente'
import { FormularioFunil } from './formulario-funil'
import { PainelCliente } from './painel-cliente'
import { SecaoAdministradores } from './secao-administradores'
import { SecaoChecklist } from './secao-checklist'
import { SecaoClientes } from './secao-clientes'
import { type AbaConfiguracoes, AbasConfiguracoes } from './secao-configuracoes'
import { SecaoDashboard } from './secao-dashboard'
import { SecaoFunis } from './secao-funis'
import { SecaoMural } from './secao-mural'
import { SecaoPipeline } from './secao-pipeline'
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
      'As entregas cadastradas, coluna a coluna. Para criar um card, cadastre a entrega em Entregas.',
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
  clientes: {
    titulo: 'Clientes',
    descricao:
      'Clientes em processo de construção de funil com o time Clickmax.',
    acao: 'Adicionar cliente',
  },
  configuracoes: {
    titulo: 'Configurações',
    descricao: 'A equipe e o checklist que o time envia aos clientes.',
  },
}

/* /clientes — menu lateral e as seções da área de clientes. */
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

  const clienteAberto =
    clientes.find((cliente) => cliente.id === clienteAbertoId) ?? null
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
          if (funil.responsavel === adminEmEdicao.nome) {
            painel.atualizarFunil(funil.id, { responsavel: ficha.nome })
          }
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

  const podeCadastrar = secao !== 'funis' || clientes.length > 0

  /* A sessão ainda está sendo lida (ou acabou de cair): o guard da rota leva
     para o login, aqui só evitamos piscar a tela sem usuário. */
  if (!usuarioLogado) return null

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#131316] lg:flex-row">
      <BarraLateral ativo={secao} onSelecionar={setSecao} onSair={sair} />

      <main className="min-w-0 flex-1">
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
            />
          )}

          {secao === 'dashboard' && (
            <SecaoDashboard
              clientes={clientes}
              funis={funis}
              administradores={administradores}
            />
          )}

          {secao === 'configuracoes' && (
            <>
              <AbasConfiguracoes
                ativa={abaConfig}
                onSelecionar={setAbaConfig}
              />

              {abaConfig === 'administradores' ? (
                <SecaoAdministradores
                  administradores={administradores}
                  onAdicionar={abrirNovoAdmin}
                  onEditar={abrirEdicaoAdmin}
                  onExcluir={excluirAdmin}
                />
              ) : (
                <SecaoChecklist
                  clientes={clientes}
                  itens={checklists}
                  onAlternarRecebido={(item) =>
                    atualizarItem(item, { recebido: !item.recebido })
                  }
                  onDefinirLink={(item, link) => atualizarItem(item, { link })}
                />
              )}
            </>
          )}

          {secao === 'funis' && (
            <SecaoFunis
              clientes={clientes}
              funis={funis}
              administradores={administradores}
              onAdicionarFunil={abrirNovoFunil}
              onEditarFunil={abrirEdicaoFunil}
              onExcluirFunil={excluirFunil}
              onAlterarStatus={alterarStatusFunil}
            />
          )}

          {secao === 'clientes' && (
            <SecaoClientes
              clientes={clientes}
              onAdicionar={abrirNovoCliente}
              onAbrir={(cliente) => setClienteAbertoId(cliente.id)}
              onEditar={abrirEdicao}
              onExcluir={excluirCliente}
            />
          )}
        </div>
      </main>

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
