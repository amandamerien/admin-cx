import { Plus, Printer, Save, Trash2 } from 'lucide-react'
import { useState } from 'react'
import {
  type DadosInvoice,
  dataPorExtenso,
  EMISSOR,
  emReais,
  type ItemInvoice,
  novoItem,
  paraNumero,
  totalDoInvoice,
} from './invoice-dados'

const classeCampo =
  'h-10 w-full rounded-lg border border-white/8 bg-white/2 px-3 font-inter text-[#F4F5F5] text-sm outline-none placeholder:text-[#6F6F76] focus-visible:border-white/25'

function Campo({
  id,
  rotulo,
  children,
}: {
  id: string
  rotulo: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="font-inter font-medium text-[#ABABAB] text-xs"
      >
        {rotulo}
      </label>
      {children}
    </div>
  )
}

/* Linha do documento: mostra o texto digitado, ou um travessão enquanto o
 * campo está vazio — assim a prévia nunca fica com buraco. */
function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <p className="font-inter text-[13px] text-[#333] leading-relaxed">
      <span className="text-[#777]">{rotulo}: </span>
      {valor.trim() || '—'}
    </p>
  )
}

/* Editor do invoice — formulário de um lado, o documento montando do outro.
 *
 * Não puxa nada do cadastro de clientes de propósito: serve para emitir em
 * nome de quem for, inclusive de quem não está na carteira. */
export function EditorInvoice({
  inicial,
  salvando,
  onSalvar,
}: {
  inicial: DadosInvoice
  salvando: boolean
  onSalvar: (dados: DadosInvoice) => void
}) {
  const [dados, setDados] = useState<DadosInvoice>(inicial)

  function mudar<C extends keyof DadosInvoice>(
    campo: C,
    valor: DadosInvoice[C],
  ) {
    setDados((atual) => ({ ...atual, [campo]: valor }))
  }

  function mudarItem(id: string, campo: keyof ItemInvoice, valor: string) {
    setDados((atual) => ({
      ...atual,
      itens: atual.itens.map((item) =>
        item.id === id ? { ...item, [campo]: valor } : item,
      ),
    }))
  }

  const total = totalDoInvoice(dados.itens)

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      {/* ── Formulário ─────────────────────────────────────── */}
      <form
        onSubmit={(evento) => evento.preventDefault()}
        className="flex flex-col gap-4 rounded-xl border border-white/8 bg-white/2 p-5 print:hidden"
      >
        <div className="grid grid-cols-2 gap-3">
          <Campo id="inv-numero" rotulo="Número">
            <input
              id="inv-numero"
              placeholder="0001"
              className={classeCampo}
              value={dados.numero}
              onChange={(e) => mudar('numero', e.target.value)}
            />
          </Campo>

          <Campo id="inv-data" rotulo="Data">
            <input
              id="inv-data"
              type="date"
              className={classeCampo}
              value={dados.data}
              onChange={(e) => mudar('data', e.target.value)}
            />
          </Campo>
        </div>

        <div className="border-white/8 border-t pt-4">
          <p className="pb-3 font-inter font-medium text-[#F4F5F5] text-sm">
            Dados do cliente
          </p>

          <div className="flex flex-col gap-3">
            <Campo id="inv-nome" rotulo="Nome">
              <input
                id="inv-nome"
                placeholder="Nome completo"
                className={classeCampo}
                value={dados.nome}
                onChange={(e) => mudar('nome', e.target.value)}
              />
            </Campo>

            <Campo id="inv-cpf" rotulo="CPF">
              <input
                id="inv-cpf"
                placeholder="000.000.000-00"
                className={classeCampo}
                value={dados.cpf}
                onChange={(e) => mudar('cpf', e.target.value)}
              />
            </Campo>

            <Campo id="inv-endereco" rotulo="Endereço">
              <input
                id="inv-endereco"
                placeholder="Rua, número, bairro, cidade/UF"
                className={classeCampo}
                value={dados.endereco}
                onChange={(e) => mudar('endereco', e.target.value)}
              />
            </Campo>

            <Campo id="inv-email" rotulo="E-mail">
              <input
                id="inv-email"
                type="email"
                placeholder="pessoa@empresa.com.br"
                className={classeCampo}
                value={dados.email}
                onChange={(e) => mudar('email', e.target.value)}
              />
            </Campo>

            <Campo id="inv-telefone" rotulo="Número">
              <input
                id="inv-telefone"
                placeholder="(11) 90000-0000"
                className={classeCampo}
                value={dados.telefone}
                onChange={(e) => mudar('telefone', e.target.value)}
              />
            </Campo>
          </div>
        </div>

        <div className="border-white/8 border-t pt-4">
          <p className="pb-3 font-inter font-medium text-[#F4F5F5] text-sm">
            Descrição
          </p>

          <ul className="flex flex-col gap-3">
            {dados.itens.map((item, indice) => (
              <li
                key={item.id}
                className="flex flex-col gap-2 rounded-lg border border-white/8 bg-white/2 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-inter text-[#8A8A8F] text-xs">
                    Item {indice + 1}
                  </span>

                  {dados.itens.length > 1 && (
                    <button
                      type="button"
                      aria-label={`Remover item ${indice + 1}`}
                      onClick={() =>
                        setDados((atual) => ({
                          ...atual,
                          itens: atual.itens.filter((i) => i.id !== item.id),
                        }))
                      }
                      className="flex size-6 items-center justify-center rounded-md text-[#6F6F76] transition-colors hover:bg-rose-400/10 hover:text-rose-300"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>

                <input
                  aria-label={`Fornecedor do item ${indice + 1}`}
                  placeholder="Fornecedor"
                  className={classeCampo}
                  value={item.fornecedor}
                  onChange={(e) =>
                    mudarItem(item.id, 'fornecedor', e.target.value)
                  }
                />

                <div className="grid grid-cols-2 gap-2">
                  <input
                    aria-label={`Quantidade do item ${indice + 1}`}
                    placeholder="Qtd."
                    inputMode="numeric"
                    className={classeCampo}
                    value={item.quantidade}
                    onChange={(e) =>
                      mudarItem(item.id, 'quantidade', e.target.value)
                    }
                  />
                  <input
                    aria-label={`Valor total do item ${indice + 1}`}
                    placeholder="Valor total"
                    inputMode="decimal"
                    className={classeCampo}
                    value={item.valor}
                    onChange={(e) =>
                      mudarItem(item.id, 'valor', e.target.value)
                    }
                  />
                </div>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() =>
              setDados((atual) => ({
                ...atual,
                itens: [...atual.itens, novoItem()],
              }))
            }
            className="mt-3 flex h-9 items-center gap-2 rounded-full border border-white/8 px-4 font-inter font-medium text-[#F4F5F5] text-xs transition-colors hover:border-white/25"
          >
            <Plus className="size-3.5" />
            Adicionar item
          </button>
        </div>

        <div className="flex flex-col gap-2 border-white/8 border-t pt-4">
          <button
            type="button"
            disabled={salvando}
            onClick={() => onSalvar(dados)}
            className="flex h-10 items-center justify-center gap-2 rounded-full bg-white font-inter font-medium text-[#131316] text-sm transition-colors hover:bg-white/90 disabled:opacity-60"
          >
            <Save className="size-4" />
            {salvando ? 'Salvando…' : 'Salvar invoice'}
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex h-10 items-center justify-center gap-2 rounded-full border border-white/8 font-inter font-medium text-[#F4F5F5] text-sm transition-colors hover:border-white/25"
          >
            <Printer className="size-4" />
            Baixar PDF
          </button>
        </div>
      </form>

      {/* ── Documento ──────────────────────────────────────── */}
      <div
        data-invoice
        className="flex min-h-[40rem] flex-col rounded-xl bg-white p-10 text-black shadow-lg print:min-h-0 print:rounded-none print:p-0 print:shadow-none"
      >
        <header className="flex items-start justify-between gap-6 border-[#E5E5E5] border-b pb-6">
          <div>
            <h2 className="font-inter font-semibold text-2xl text-black tracking-tight">
              Invoice
            </h2>
            <p className="pt-1 font-inter text-[#777] text-[13px]">
              Nº {dados.numero.trim() || '—'} · {dataPorExtenso(dados.data)}
            </p>
          </div>

          <div className="text-right">
            <p className="font-inter font-medium text-[#777] text-xs uppercase tracking-wide">
              Total
            </p>
            <p className="pt-0.5 font-inter font-semibold text-black text-xl tabular-nums">
              {emReais(total)}
            </p>
          </div>
        </header>

        <section className="pt-6">
          <p className="pb-2 font-inter font-medium text-[#777] text-xs uppercase tracking-wide">
            Cobrar de
          </p>
          <p className="font-inter font-semibold text-base text-black">
            {dados.nome.trim() || 'Nome do cliente'}
          </p>
          <div className="pt-1">
            <Linha rotulo="CPF" valor={dados.cpf} />
            <Linha rotulo="Endereço" valor={dados.endereco} />
            <Linha rotulo="E-mail" valor={dados.email} />
            <Linha rotulo="Número" valor={dados.telefone} />
          </div>
        </section>

        <section className="pt-8">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-[#E5E5E5] border-b">
                <th className="pb-2 font-inter font-medium text-[#777] text-xs uppercase tracking-wide">
                  Fornecedor
                </th>
                <th className="pb-2 text-right font-inter font-medium text-[#777] text-xs uppercase tracking-wide">
                  Qtd.
                </th>
                <th className="pb-2 text-right font-inter font-medium text-[#777] text-xs uppercase tracking-wide">
                  Valor total
                </th>
              </tr>
            </thead>

            <tbody>
              {dados.itens.map((item) => (
                <tr key={item.id} className="border-[#F0F0F0] border-b">
                  <td className="py-2.5 font-inter text-[13px] text-black">
                    {item.fornecedor.trim() || '—'}
                  </td>
                  <td className="py-2.5 text-right font-inter text-[13px] text-black tabular-nums">
                    {item.quantidade.trim() || '—'}
                  </td>
                  <td className="py-2.5 text-right font-inter text-[13px] text-black tabular-nums">
                    {emReais(paraNumero(item.valor))}
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr>
                <td
                  colSpan={2}
                  className="pt-3 text-right font-inter font-medium text-[#777] text-xs uppercase tracking-wide"
                >
                  Total
                </td>
                <td className="pt-3 text-right font-inter font-semibold text-base text-black tabular-nums">
                  {emReais(total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </section>

        {/* Emissor no rodapé, com o logo — o mesmo lugar em qualquer invoice. */}
        <footer className="mt-auto border-[#E5E5E5] border-t pt-6">
          <img
            src="/images/logo-dark.webp"
            alt="Clickmax"
            className="h-5 w-auto"
          />
          <p className="pt-3 font-inter font-medium text-[13px] text-black">
            {EMISSOR.razaoSocial}
          </p>
          <p className="font-inter text-[#777] text-xs leading-relaxed">
            CNPJ {EMISSOR.cnpj}
            <br />
            {EMISSOR.endereco}
          </p>
        </footer>
      </div>
    </div>
  )
}
