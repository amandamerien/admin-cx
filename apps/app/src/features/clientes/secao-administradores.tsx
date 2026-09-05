import { cn } from '@repo/ui'
import { Plus, ShieldCheck, Users } from 'lucide-react'
import { Avatar } from './avatares'
import { BotaoCopiar } from './botao-copiar'
import {
  type Administrador,
  CLASSES_PAPEL,
  ordenarAdministradores,
  PAPEL_DESCRICAO,
  PAPEL_LABEL,
} from './dados'
import { MenuAcoes } from './menu-acoes'

interface SecaoAdministradoresProps {
  administradores: Administrador[]
  /** Sem isto a lista é só leitura. */
  podeGerenciar: boolean
  onAdicionar: () => void
  onEditar: (administrador: Administrador) => void
  onExcluir: (administrador: Administrador) => void
}

/* Administradores — o time que aparece no campo "Responsável" dos funis. */
export function SecaoAdministradores({
  administradores,
  podeGerenciar,
  onAdicionar,
  onEditar,
  onExcluir,
}: SecaoAdministradoresProps) {
  const ordenados = ordenarAdministradores(administradores)

  if (administradores.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-white/8 border-dashed px-6 py-16">
        <Users className="size-6 text-[#5A5A61]" />
        <div className="text-center">
          <p className="font-inter font-medium text-sm text-white">
            Nenhum administrador cadastrado
          </p>
          <p className="pt-1 font-inter text-[#6F6F76] text-xs">
            Sem administrador não há quem escolher como responsável de um funil.
          </p>
        </div>

        <button
          type="button"
          onClick={onAdicionar}
          className="mt-1 flex h-10 items-center gap-2 rounded-full bg-white px-5 font-inter font-medium text-[#131316] text-sm transition-colors hover:bg-white/90"
        >
          <Plus className="size-4" />
          Adicionar administrador
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-xl border border-white/8">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-left">
            <thead className="border-white/8 border-b bg-white/2">
              <tr>
                {['Nome', 'Cargo', 'E-mail', 'Papel'].map((titulo) => (
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
              {ordenados.map((administrador) => (
                <tr
                  key={administrador.id}
                  className={cn(
                    'border-white/6 border-b last:border-b-0',
                    !administrador.ativo && 'opacity-50',
                  )}
                >
                  <td className="px-4 py-3 font-inter font-medium text-sm text-white">
                    <span className="flex items-center gap-2.5">
                      <Avatar
                        avatar={administrador.avatar}
                        rotulo={administrador.nome}
                        className="size-7"
                      />
                      {administrador.nome}
                    </span>
                  </td>

                  <td className="px-4 py-3 font-inter text-[#ABABAB] text-sm">
                    {administrador.cargo}
                  </td>

                  <td className="px-4 py-3 font-inter text-[#ABABAB] text-sm">
                    {administrador.email ? (
                      <span className="group/email flex min-w-0 items-center gap-1">
                        <a
                          href={`mailto:${administrador.email}`}
                          className="truncate hover:underline"
                        >
                          {administrador.email}
                        </a>
                        <BotaoCopiar
                          valor={administrador.email}
                          rotulo="e-mail"
                        />
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-inter font-medium text-xs ring-1 ring-inset',
                        CLASSES_PAPEL[administrador.papel],
                      )}
                      title={PAPEL_DESCRICAO[administrador.papel]}
                    >
                      {administrador.papel === 'administrador' && (
                        <ShieldCheck className="size-3" />
                      )}
                      {PAPEL_LABEL[administrador.papel]}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    {podeGerenciar && (
                      <MenuAcoes
                        rotulo={administrador.nome}
                        onEditar={() => onEditar(administrador)}
                        onExcluir={() => onExcluir(administrador)}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
