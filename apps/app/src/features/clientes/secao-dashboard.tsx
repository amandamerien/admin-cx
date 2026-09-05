import { cn } from '@repo/ui'
import {
  CircleCheckBig,
  GitBranch,
  Hammer,
  type LucideIcon,
  Users,
} from 'lucide-react'
import { NomeComAvatar } from './avatares'
import {
  type Administrador,
  avatarDoResponsavel,
  CLASSES_STATUS_FUNIL,
  type Cliente,
  ETAPA_FUNIL_LABEL,
  entreguesPorMes,
  type Funil,
  formatarData,
  funisPorResponsavel,
  STATUS_FUNIL_LABEL,
} from './dados'
import { Bloco, GraficoBarras, GraficoColunas } from './graficos'

function Cartao({
  titulo,
  valor,
  apoio,
  icone: Icone,
}: {
  titulo: string
  valor: number
  apoio: string
  icone: LucideIcon
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-white/8 bg-white/2 p-4">
      <div className="min-w-0">
        <p className="font-inter font-medium text-[#8A8A8F] text-xs uppercase tracking-wide">
          {titulo}
        </p>
        <p className="pt-1.5 font-inter font-medium text-3xl text-white tabular-nums leading-none">
          {valor}
        </p>
        <p className="pt-1.5 font-inter text-[#6F6F76] text-xs">{apoio}</p>
      </div>

      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sky-400/10 text-sky-300 ring-1 ring-sky-400/20 ring-inset">
        <Icone className="size-4.5" />
      </span>
    </div>
  )
}

/* Listagem dos funis, só para leitura: editar e excluir ficam na aba Funis. */
function ListagemFunis({
  clientes,
  funis,
  administradores,
}: {
  clientes: Cliente[]
  funis: Funil[]
  administradores: Administrador[]
}) {
  const nomeDoCliente = (clienteId: string) =>
    clientes.find((cliente) => cliente.id === clienteId)?.nome ?? '—'

  if (funis.length === 0) {
    return (
      <p className="pt-4 font-inter text-[#6F6F76] text-xs">
        Nenhuma entrega cadastrada ainda.
      </p>
    )
  }

  return (
    <div className="-mx-4 overflow-x-auto pt-4">
      <table className="w-full min-w-[42rem] border-collapse text-left">
        <thead>
          <tr className="border-white/8 border-b">
            {[
              'Cliente',
              'Entrega',
              'Responsável',
              'Etapa',
              'Prazo',
              'Status',
            ].map((titulo) => (
              <th
                key={titulo}
                scope="col"
                className="px-4 pb-2 font-inter font-normal text-[#8A8A8F] text-xs"
              >
                {titulo}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {funis.map((funil) => (
            <tr
              key={funil.id}
              className="border-white/6 border-b last:border-b-0"
            >
              <td className="px-4 py-2.5 font-inter text-sm text-white">
                {nomeDoCliente(funil.clienteId)}
              </td>
              <td className="px-4 py-2.5 font-inter font-medium text-sm text-white">
                {funil.nome}
              </td>
              <td className="px-4 py-2.5 font-inter text-[#ABABAB] text-sm">
                <NomeComAvatar
                  administradores={administradores}
                  nome={funil.responsavel}
                />
              </td>
              <td className="px-4 py-2.5 font-inter text-[#ABABAB] text-sm">
                {ETAPA_FUNIL_LABEL[funil.etapa]}
              </td>
              <td className="px-4 py-2.5 font-inter text-[#ABABAB] text-sm tabular-nums">
                {formatarData(funil.dataEntrega)}
              </td>
              <td className="px-4 py-2.5">
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 font-inter font-medium text-xs ring-1 ring-inset',
                    CLASSES_STATUS_FUNIL[funil.status],
                  )}
                >
                  {STATUS_FUNIL_LABEL[funil.status]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* Dashboard — os números da operação, todos derivados do que está cadastrado
 * em Clientes e Funis. */
export function SecaoDashboard({
  clientes,
  funis,
  administradores,
}: {
  clientes: Cliente[]
  funis: Funil[]
  administradores: Administrador[]
}) {
  const entregues = funis.filter((funil) => funil.status === 'concluido').length
  const emProgresso = funis.filter(
    (funil) => funil.status === 'em_andamento',
  ).length

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Cartao
          titulo="Clientes"
          valor={clientes.length}
          apoio="Contas na carteira"
          icone={Users}
        />
        <Cartao
          titulo="Entregas"
          valor={funis.length}
          apoio="Cadastrados no total"
          icone={GitBranch}
        />
        <Cartao
          titulo="Em progresso"
          valor={emProgresso}
          apoio="Sendo tocados agora"
          icone={Hammer}
        />
        <Cartao
          titulo="Entregues"
          valor={entregues}
          apoio={
            funis.length > 0
              ? `${Math.round((entregues / funis.length) * 100)}% do total`
              : 'Nenhuma entrega ainda'
          }
          icone={CircleCheckBig}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Bloco
          titulo="Entregas concluídas por mês"
          apoio="Últimos 6 meses, pela data de entrega"
        >
          <GraficoColunas dados={entreguesPorMes(funis)} />
        </Bloco>

        <Bloco titulo="Entregas por responsável" apoio="Carga atual de cada um">
          <GraficoBarras
            dados={funisPorResponsavel(funis).map((item) => ({
              rotulo: item.responsavel,
              total: item.total,
              avatar: avatarDoResponsavel(administradores, item.responsavel),
            }))}
            vazio="Nenhuma entrega atribuída ainda."
          />
        </Bloco>
      </div>

      <Bloco titulo="Entregas" apoio="Todas as entregas cadastradas">
        <ListagemFunis
          clientes={clientes}
          funis={funis}
          administradores={administradores}
        />
      </Bloco>
    </div>
  )
}
