import { useGetAcessosEquipe } from '@repo/api-client/hooks'
import { cn } from '@repo/ui'
import { Monitor } from 'lucide-react'
import { NomeComAvatar } from './avatares'
import type { Administrador } from './dados'
import { EstadoVazio } from './estado-vazio'

/* "Chrome · macOS", ou só o que deu para descobrir. */
function descreverDispositivo(
  navegador: string | null,
  sistema: string | null,
) {
  return [navegador, sistema].filter(Boolean).join(' · ') || 'Desconhecido'
}

/* 5 de setembro, 04:12 — data e hora no fuso de quem está lendo. */
function formatarMomento(iso: string) {
  const data = new Date(iso)
  if (Number.isNaN(data.getTime())) return '—'

  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/* Acessos — o histórico de entradas no painel: quem entrou, quando, de qual
 * dispositivo e de qual IP. Uma linha por login. */
export function SecaoAcessosEquipe({
  administradores,
}: {
  administradores: Administrador[]
}) {
  const { data, isPending } = useGetAcessosEquipe()
  const acessos = data?.data.acessos ?? []

  if (isPending) {
    return (
      <p className="rounded-xl border border-white/8 border-dashed px-4 py-8 text-center font-inter text-[#6F6F76] text-xs">
        Carregando acessos…
      </p>
    )
  }

  if (acessos.length === 0) {
    return (
      <EstadoVazio
        id="acessos-equipe"
        desenho="cadeado"
        titulo="Nenhum acesso registrado"
        descricao="Cada entrada no painel é marcada aqui, com dispositivo e IP."
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-xl border border-white/8">
        <table className="w-full min-w-[46rem] border-collapse text-left">
          <thead className="border-white/8 border-b bg-white/2">
            <tr>
              {['Pessoa', 'Entrada', 'Dispositivo', 'IP'].map((titulo) => (
                <th
                  key={titulo}
                  scope="col"
                  className="px-4 py-2.5 font-inter font-normal text-[#8A8A8F] text-xs"
                >
                  {titulo}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {acessos.map((acesso) => (
              <tr
                key={acesso.id}
                className="border-white/8 border-b last:border-b-0"
              >
                <td className="px-4 py-3 font-inter text-[#F4F5F5] text-sm">
                  <span className="flex items-center gap-2">
                    <NomeComAvatar
                      administradores={administradores}
                      nome={acesso.nome}
                    />
                  </span>
                  <span className="block pt-0.5 font-inter text-[#6F6F76] text-xs">
                    {acesso.email}
                  </span>
                </td>

                <td className="px-4 py-3 font-inter text-[#ABABAB] text-sm tabular-nums">
                  {formatarMomento(acesso.entradaEm)}
                </td>

                <td className="px-4 py-3 font-inter text-[#ABABAB] text-sm">
                  <span className="flex items-center gap-2">
                    <Monitor className="size-3.5 shrink-0 text-[#6F6F76]" />
                    {descreverDispositivo(acesso.navegador, acesso.sistema)}
                  </span>
                </td>

                <td
                  className={cn(
                    'px-4 py-3 font-inter text-sm tabular-nums',
                    acesso.ip ? 'text-[#ABABAB]' : 'text-[#6F6F76]',
                  )}
                >
                  {acesso.ip ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="font-inter text-[#6F6F76] text-xs leading-relaxed">
        Uma linha por entrada no painel. O registro fica mesmo depois de a
        pessoa sair.
      </p>
    </div>
  )
}
