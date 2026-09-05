import { cn } from '@repo/ui'
import { Check, Copy, Eye, EyeOff, Plus, Users } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { CLASSES_STATUS, type Cliente, STATUS_LABEL } from './dados'
import { type ContagemPorFrente, SelosDoCliente } from './frentes-do-cliente'
import { AnelProgresso } from './graficos'
import { MenuAcoes } from './menu-acoes'

/* Copia o e-mail e confirma trocando o ícone por alguns segundos. */
function BotaoCopiarEmail({ email }: { email: string }) {
  const [copiado, setCopiado] = useState(false)
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (temporizador.current) clearTimeout(temporizador.current)
    },
    [],
  )

  async function copiar() {
    try {
      await navigator.clipboard.writeText(email)
    } catch {
      /* Sem permissão de área de transferência: não há o que confirmar. */
      return
    }

    setCopiado(true)
    if (temporizador.current) clearTimeout(temporizador.current)
    temporizador.current = setTimeout(() => setCopiado(false), 2000)
  }

  const Icone = copiado ? Check : Copy

  return (
    <button
      type="button"
      onClick={copiar}
      aria-label={copiado ? 'E-mail copiado' : 'Copiar e-mail'}
      title={copiado ? 'Copiado' : 'Copiar e-mail'}
      className={cn(
        'flex size-6 shrink-0 items-center justify-center rounded-md transition-colors',
        copiado
          ? 'text-emerald-300'
          : 'text-[#6F6F76] hover:bg-white/6 hover:text-white',
      )}
    >
      <Icone className="size-3.5" />
    </button>
  )
}

/* E-mail borrado por padrão.
 *
 * A lista de clientes costuma ficar aberta em reunião e em compartilhamento de
 * tela; o e-mail de um cliente não precisa aparecer para ver o de outro. O
 * borrão é medida visual — o texto continua no HTML da página —, e serve para
 * o olho de quem está do outro lado da chamada, não contra quem abre o
 * DevTools. Copiar continua funcionando sem revelar. */
function EmailDoCartao({ email }: { email: string }) {
  const [revelado, setRevelado] = useState(false)
  const Icone = revelado ? EyeOff : Eye

  return (
    <div className="flex min-w-0 items-center gap-1">
      <p
        className={cn(
          'truncate font-inter text-[#8A8A8F] text-xs transition-[filter]',
          !revelado && 'select-none blur-[3.5px]',
        )}
      >
        {email}
      </p>

      <div className="relative z-10 flex shrink-0 items-center">
        <button
          type="button"
          onClick={() => setRevelado((atual) => !atual)}
          aria-pressed={revelado}
          aria-label={revelado ? 'Ocultar e-mail' : 'Mostrar e-mail'}
          title={revelado ? 'Ocultar e-mail' : 'Mostrar e-mail'}
          className="flex size-6 items-center justify-center rounded-md text-[#6F6F76] transition-colors hover:bg-white/6 hover:text-white"
        >
          <Icone className="size-3.5" />
        </button>

        <BotaoCopiarEmail email={email} />
      </div>
    </div>
  )
}

function CartaoCliente({
  cliente,
  contagem,
  concluidas,
  podeEditar,
  onAbrir,
  onEditar,
  onExcluir,
}: {
  cliente: Cliente
  contagem: ContagemPorFrente
  /** Entregas já concluídas, para o anel de progresso. */
  concluidas: number
  /** Sem isto o cartão é só leitura: abre a ficha, mas não oferece ações. */
  podeEditar: boolean
  onAbrir: () => void
  onEditar: () => void
  onExcluir: () => void
}) {
  return (
    <article className="relative flex flex-col gap-3 rounded-xl border border-white/8 bg-white/2 p-4 transition-colors focus-within:border-white/25 hover:border-white/16">
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 font-inter font-medium text-sm text-white leading-tight">
          {/* O ::after cobre o cartão inteiro: o clique em qualquer ponto
              cai neste botão, que continua acessível pelo teclado. */}
          <button
            type="button"
            onClick={onAbrir}
            title={cliente.nome}
            className="block w-full truncate text-left outline-none after:absolute after:inset-0 after:content-[''] hover:underline focus-visible:underline"
          >
            {cliente.nome}
          </button>
        </h3>

        <div className="flex shrink-0 items-center gap-1">
          <span
            className={cn(
              'rounded-full px-2 py-0.5 font-inter font-medium text-xs ring-1 ring-inset',
              CLASSES_STATUS[cliente.status],
            )}
          >
            {STATUS_LABEL[cliente.status]}
          </span>

          {podeEditar && (
            <div className="relative z-10">
              <MenuAcoes
                rotulo={cliente.nome}
                onEditar={onEditar}
                onExcluir={onExcluir}
              />
            </div>
          )}
        </div>
      </div>

      <EmailDoCartao email={cliente.email} />

      {/* O que já existe na ficha, sem precisar abrir. */}
      {/* O que o cliente tem à esquerda; o progresso na ponta direita. */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <SelosDoCliente
          contagem={contagem}
          className="flex flex-wrap items-center gap-1"
        />

        {/* Sem rótulo aqui: no cartão o espaço é curto e o anel já diz o que
            é. O nome do campo fica no hover. */}
        {cliente.funisContratados > 0 && (
          <span title="Funis contratados" className="ml-auto shrink-0">
            <AnelProgresso
              compacto
              feito={concluidas}
              total={cliente.funisContratados}
              className="text-[#ABABAB]"
            />
          </span>
        )}
      </div>
    </article>
  )
}

export function SecaoClientes({
  clientes,
  contagens,
  podeEditar,
  onAdicionar,
  onAbrir,
  onEditar,
  onExcluir,
}: {
  clientes: Cliente[]
  /** Quantos itens cada cliente tem em cada frente, pelo id do cliente. */
  contagens: Record<string, ContagemPorFrente & { concluidas: number }>
  podeEditar: boolean
  onAdicionar: () => void
  onAbrir: (cliente: Cliente) => void
  onEditar: (cliente: Cliente) => void
  onExcluir: (cliente: Cliente) => void
}) {
  if (clientes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-white/8 border-dashed px-6 py-16">
        <Users className="size-6 text-[#5A5A61]" />
        <div className="text-center">
          <p className="font-inter font-medium text-sm text-white">
            Nenhum cliente cadastrado
          </p>
          <p className="pt-1 font-inter text-[#6F6F76] text-xs">
            Adicione a primeira conta para começar a acompanhar a carteira.
          </p>
        </div>

        {podeEditar && (
          <button
            type="button"
            onClick={onAdicionar}
            className="mt-1 flex h-10 items-center gap-2 rounded-full bg-white px-5 font-inter font-medium text-[#131316] text-sm transition-colors hover:bg-white/90"
          >
            <Plus className="size-4" />
            Adicionar cliente
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {clientes.map((cliente) => (
        <CartaoCliente
          key={cliente.id}
          cliente={cliente}
          concluidas={contagens[cliente.id]?.concluidas ?? 0}
          podeEditar={podeEditar}
          contagem={
            contagens[cliente.id] ?? {
              entregas: 0,
              anotacoes: 0,
              arquivos: 0,
              acessos: 0,
            }
          }
          onAbrir={() => onAbrir(cliente)}
          onEditar={() => onEditar(cliente)}
          onExcluir={() => onExcluir(cliente)}
        />
      ))}
    </div>
  )
}
