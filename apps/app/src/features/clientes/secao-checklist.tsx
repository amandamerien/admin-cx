import { cn } from '@repo/ui'
import { Check, Link2, Printer, Users } from 'lucide-react'
import { useState } from 'react'
import {
  type Cliente,
  checklistDoCliente,
  FECHAMENTO_CHECKLIST,
  GRUPO_CHECKLIST,
  GRUPOS_CHECKLIST,
  INTRO_CHECKLIST,
  type ItemChecklist,
  progressoDoChecklist,
} from './dados'

interface SecaoChecklistProps {
  clientes: Cliente[]
  itens: ItemChecklist[]
  onAlternarRecebido: (item: ItemChecklist) => void
  onDefinirLink: (item: ItemChecklist, link: string | null) => void
}

/* Uma linha do checklist: marcar como recebido e guardar onde o material está. */
function LinhaItem({
  item,
  onAlternarRecebido,
  onDefinirLink,
}: {
  item: ItemChecklist
  onAlternarRecebido: (item: ItemChecklist) => void
  onDefinirLink: (item: ItemChecklist, link: string | null) => void
}) {
  const [editandoLink, setEditandoLink] = useState(false)
  const [rascunho, setRascunho] = useState(item.link ?? '')

  function salvarLink() {
    const limpo = rascunho.trim()
    onDefinirLink(item, limpo === '' ? null : limpo)
    setEditandoLink(false)
  }

  return (
    <li className="flex items-start gap-3 py-3">
      <button
        type="button"
        onClick={() => onAlternarRecebido(item)}
        aria-pressed={item.recebido}
        aria-label={`${item.titulo}: marcar como recebido`}
        className={cn(
          'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors print:border-[#999]',
          item.recebido
            ? 'border-sky-400 bg-sky-500 text-white'
            : 'border-white/20 hover:border-white/40',
        )}
      >
        {item.recebido && <Check className="size-3.5" strokeWidth={3} />}
      </button>

      <div className="min-w-0 flex-1">
        <span
          className={cn(
            'block font-inter font-medium text-sm print:text-black',
            item.recebido ? 'text-[#6F6F76] line-through' : 'text-white',
          )}
        >
          {item.titulo}
        </span>

        {item.descricao && (
          <p className="pt-0.5 font-inter text-[#6F6F76] text-xs print:text-[#444]">
            {item.descricao}
          </p>
        )}

        <div className="pt-1.5 print:hidden">
          {editandoLink ? (
            <div className="flex items-center gap-2">
              <input
                value={rascunho}
                onChange={(evento) => setRascunho(evento.target.value)}
                onKeyDown={(evento) => evento.key === 'Enter' && salvarLink()}
                placeholder="Link do material"
                aria-label={`Link de ${item.titulo}`}
                // biome-ignore lint/a11y/noAutofocus: o campo só existe depois do clique
                autoFocus
                className="h-8 w-full max-w-sm rounded-md border border-white/8 bg-white/2 px-2.5 font-inter text-[#F4F5F5] text-xs outline-none focus-visible:border-white/25"
              />
              <button
                type="button"
                onClick={salvarLink}
                className="h-8 shrink-0 rounded-md border border-white/8 px-2.5 font-inter text-[#ABABAB] text-xs hover:border-white/20 hover:text-white"
              >
                Salvar
              </button>
            </div>
          ) : item.link ? (
            <div className="flex items-center gap-2">
              <a
                href={item.link}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-1.5 font-inter text-sky-300 text-xs hover:underline"
              >
                <Link2 className="size-3" />
                Abrir material
              </a>
              <button
                type="button"
                onClick={() => setEditandoLink(true)}
                className="font-inter text-[#6F6F76] text-xs hover:text-white"
              >
                Trocar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditandoLink(true)}
              className="font-inter text-[#6F6F76] text-xs hover:text-white"
            >
              + Anexar link
            </button>
          )}
        </div>
      </div>
    </li>
  )
}

/* Checklist de onboarding — o que o cliente precisa enviar para o time
 * começar. Um checklist por cliente. */
export function SecaoChecklist({
  clientes,
  itens,
  onAlternarRecebido,
  onDefinirLink,
}: SecaoChecklistProps) {
  const [clienteId, setClienteId] = useState(clientes[0]?.id ?? '')

  const [primeiroCliente] = clientes

  if (!primeiroCliente) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-white/8 border-dashed px-6 py-16">
        <Users className="size-6 text-[#5A5A61]" />
        <p className="font-inter font-medium text-sm text-white">
          Nenhum cliente cadastrado
        </p>
        <p className="font-inter text-[#6F6F76] text-xs">
          O checklist é por cliente. Cadastre um para começar.
        </p>
      </div>
    )
  }

  const cliente =
    clientes.find((item) => item.id === clienteId) ?? primeiroCliente
  const doCliente = checklistDoCliente(itens, cliente.id)
  const progresso = progressoDoChecklist(doCliente)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-xl border border-white/8 bg-white/2 p-5 print:border-none print:bg-transparent">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <select
            value={cliente.id}
            onChange={(evento) => setClienteId(evento.target.value)}
            aria-label="Cliente do checklist"
            className="h-10 min-w-56 rounded-lg border border-white/8 bg-white/2 px-3 font-inter text-[#F4F5F5] text-sm outline-none focus-visible:border-white/25 print:hidden"
          >
            {clientes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nome}
              </option>
            ))}
          </select>

          <h2 className="hidden font-inter font-semibold text-black text-xl print:block">
            Checklist de onboarding — {cliente.nome}
          </h2>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex h-10 items-center gap-2 rounded-full bg-white px-5 font-inter font-medium text-[#131316] text-sm transition-colors hover:bg-white/90 print:hidden"
          >
            <Printer className="size-4" />
            Baixar PDF
          </button>
        </div>

        <div className="flex items-center gap-3 print:hidden">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/6">
            <div
              className="h-full rounded-full bg-sky-500 transition-[width] duration-300"
              style={{ width: `${progresso.percentual}%` }}
            />
          </div>
          <span className="font-inter text-[#ABABAB] text-sm tabular-nums">
            {progresso.recebidos} de {progresso.total}
          </span>
        </div>

        <p className="font-inter text-[#8A8A8F] text-sm leading-relaxed print:text-black">
          {INTRO_CHECKLIST}
        </p>
      </div>

      {GRUPOS_CHECKLIST.map((grupo, indice) => {
        const doGrupo = doCliente.filter((item) => item.grupo === grupo)
        if (doGrupo.length === 0) return null

        const definicao = GRUPO_CHECKLIST[grupo]

        return (
          <div
            key={grupo}
            className="rounded-xl border border-white/8 bg-white/2 p-5 print:break-inside-avoid print:border-none print:bg-transparent"
          >
            <h3 className="font-inter font-medium text-base text-white print:text-black">
              {indice + 1}. {definicao.titulo}
            </h3>

            <p className="max-w-[80ch] pt-1 font-inter text-[#8A8A8F] text-sm leading-relaxed print:text-[#333]">
              {definicao.descricao}
            </p>

            {definicao.nota && (
              <p className="max-w-[80ch] pt-2 font-inter text-[#6F6F76] text-xs leading-relaxed print:text-[#555]">
                {definicao.nota}
              </p>
            )}

            <ul className="divide-y divide-white/6 pt-3">
              {doGrupo.map((item) => (
                <LinhaItem
                  key={item.id}
                  item={item}
                  onAlternarRecebido={onAlternarRecebido}
                  onDefinirLink={onDefinirLink}
                />
              ))}
            </ul>
          </div>
        )
      })}

      <p className="rounded-xl border border-white/8 bg-white/2 p-5 font-inter text-[#8A8A8F] text-sm leading-relaxed print:border-none print:bg-transparent print:text-black">
        {FECHAMENTO_CHECKLIST}
      </p>
    </div>
  )
}
