import { cn } from '@repo/ui'
import { GitBranch, Plus } from 'lucide-react'
import { ResponsaveisComAvatar } from './avatares'
import {
  type Administrador,
  CLASSES_STATUS_FUNIL,
  type Cliente,
  ETAPA_FUNIL_LABEL,
  ETAPAS_FUNIL,
  type Funil,
  formatarData,
  progressoDoFunil,
  responsaveisDoFunil,
  STATUS_FUNIL_LABEL,
  type StatusFunil,
} from './dados'
import { DonutEtapa } from './graficos'
import { MenuAcoes } from './menu-acoes'
import { SeletorStatus } from './seletor-status'

interface SecaoFunisProps {
  clientes: Cliente[]
  funis: Funil[]
  administradores: Administrador[]
  /** Sem isto a tabela é só leitura. */
  podeEditar: boolean
  onAdicionarFunil: () => void
  onEditarFunil: (funil: Funil) => void
  onExcluirFunil: (funil: Funil) => void
  onAlterarStatus: (funil: Funil, status: StatusFunil) => void
}

/* Funis — os funis em construção, com cliente, etapa e status. */
export function SecaoFunis({
  clientes,
  funis,
  administradores,
  podeEditar,
  onAdicionarFunil,
  onEditarFunil,
  onExcluirFunil,
  onAlterarStatus,
}: SecaoFunisProps) {
  const nomeDoCliente = (clienteId: string) =>
    clientes.find((cliente) => cliente.id === clienteId)?.nome ?? '—'

  if (funis.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-white/8 border-dashed px-6 py-16">
        <GitBranch className="size-6 text-[#5A5A61]" />
        <div className="text-center">
          <p className="font-inter font-medium text-sm text-white">
            Nenhuma entrega cadastrada
          </p>
          <p className="pt-1 font-inter text-[#6F6F76] text-xs">
            Cadastre as entregas em construção para acompanhar a etapa de cada
            uma.
          </p>
        </div>

        {podeEditar && (
          <button
            type="button"
            onClick={onAdicionarFunil}
            className="mt-1 flex h-10 items-center gap-2 rounded-full bg-white px-5 font-inter font-medium text-[#131316] text-sm transition-colors hover:bg-white/90"
          >
            <Plus className="size-4" />
            Adicionar entrega
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/8">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[42rem] border-collapse text-left">
          <thead className="border-white/8 border-b bg-white/2">
            <tr>
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
                  className="px-4 py-3 font-inter font-normal text-[#8A8A8F] text-xs"
                >
                  {titulo}
                </th>
              ))}
              <th scope="col" className="w-12 px-4 py-3">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>

          <tbody>
            {funis.map((funil) => (
              <tr
                key={funil.id}
                className="border-white/6 border-b last:border-b-0"
              >
                <td className="px-4 py-3 font-inter text-sm text-white">
                  {nomeDoCliente(funil.clienteId)}
                </td>

                <td className="px-4 py-3 font-inter font-medium text-sm text-white">
                  {funil.nome}
                </td>

                <td className="px-4 py-3 font-inter text-[#ABABAB] text-sm">
                  <ResponsaveisComAvatar
                    administradores={administradores}
                    nomes={responsaveisDoFunil(funil)}
                  />
                </td>

                <td className="px-4 py-3">
                  <DonutEtapa
                    progresso={progressoDoFunil(funil)}
                    rotulo={ETAPA_FUNIL_LABEL[funil.etapa]}
                    posicao={ETAPAS_FUNIL.indexOf(funil.etapa) + 1}
                    total={ETAPAS_FUNIL.length}
                    concluido={funil.status === 'concluido'}
                  />
                </td>

                <td className="px-4 py-3 font-inter text-[#ABABAB] text-sm tabular-nums">
                  {formatarData(funil.dataEntrega)}
                </td>

                <td className="px-4 py-3">
                  {podeEditar ? (
                    <SeletorStatus
                      status={funil.status}
                      rotulo={funil.nome}
                      onSelecionar={(status) => onAlterarStatus(funil, status)}
                    />
                  ) : (
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2 py-0.5 font-inter font-medium text-xs ring-1 ring-inset',
                        CLASSES_STATUS_FUNIL[funil.status],
                      )}
                    >
                      {STATUS_FUNIL_LABEL[funil.status]}
                    </span>
                  )}
                </td>

                <td className="px-4 py-3">
                  {podeEditar && (
                    <MenuAcoes
                      rotulo={funil.nome}
                      onEditar={() => onEditarFunil(funil)}
                      onExcluir={() => onExcluirFunil(funil)}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
