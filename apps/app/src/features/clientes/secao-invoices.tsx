import {
  getInvoicesQueryKey,
  useDeleteInvoicesId,
  useGetInvoices,
  usePostInvoices,
  usePutInvoicesId,
} from '@repo/api-client/hooks'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, FileText, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { EstadoVazio } from './estado-vazio'
import {
  type DadosInvoice,
  dataPorExtenso,
  emReais,
  invoiceEmBranco,
  novoItem,
  paraNumero,
  totalDoInvoice,
} from './invoice-dados'
import { EditorInvoice } from './secao-invoice'

/* O que vai para a API: os valores digitados viram número na hora de gravar. */
function paraEnvio(dados: DadosInvoice) {
  return {
    numero: dados.numero,
    data: dados.data,
    nome: dados.nome,
    cpf: dados.cpf,
    email: dados.email,
    telefone: dados.telefone,
    endereco: dados.endereco,
    itens: dados.itens.map((item) => ({
      fornecedor: item.fornecedor,
      quantidade: item.quantidade,
      valor: paraNumero(item.valor),
    })),
  }
}

/* O caminho de volta: o número guardado vira o texto do campo. Invoice sem
 * linha nenhuma abre com uma em branco, senão não há o que preencher. */
function paraFormulario(invoice: {
  numero: string
  data: string
  nome: string
  cpf: string
  email: string
  telefone: string
  endereco: string
  itens: { id: string; fornecedor: string; quantidade: string; valor: number }[]
}): DadosInvoice {
  return {
    numero: invoice.numero,
    data: invoice.data,
    nome: invoice.nome,
    cpf: invoice.cpf,
    email: invoice.email,
    telefone: invoice.telefone,
    endereco: invoice.endereco,
    itens:
      invoice.itens.length > 0
        ? invoice.itens.map((item) => ({
            id: item.id,
            fornecedor: item.fornecedor,
            quantidade: item.quantidade,
            valor: item.valor.toString().replace('.', ','),
          }))
        : [novoItem()],
  }
}

/* Invoices — a lista do que já foi emitido e o editor.
 *
 * Aberto um invoice, ele volta para o formulário do jeito que foi salvo: dá
 * para corrigir e exportar de novo, sem refazer do zero. */
export function SecaoInvoices({
  abertoId,
  onAbrir,
}: {
  /** `null` = lista. String vazia = invoice novo. Id = editando aquele. */
  abertoId: string | null
  onAbrir: (id: string | null) => void
}) {
  const queryClient = useQueryClient()
  const { data, isPending } = useGetInvoices()
  const invoices = data?.data.invoices ?? []

  const recarregar = {
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: getInvoicesQueryKey() }),
  }

  const criar = usePostInvoices({ mutation: recarregar })
  const atualizar = usePutInvoicesId({ mutation: recarregar })
  const excluir = useDeleteInvoicesId({ mutation: recarregar })

  const emEdicao = invoices.find((invoice) => invoice.id === abertoId)
  const salvando = criar.isPending || atualizar.isPending

  async function salvar(dados: DadosInvoice) {
    try {
      if (emEdicao) {
        await atualizar.mutateAsync({ id: emEdicao.id, data: paraEnvio(dados) })
        toast.success('Invoice atualizado')
      } else {
        const criado = await criar.mutateAsync({ data: paraEnvio(dados) })
        /* Continua no editor, agora apontando para o registro salvo — assim
           salvar de novo corrige em vez de duplicar. */
        onAbrir(criado.data.id)
        toast.success('Invoice salvo')
      }
    } catch {
      toast.error('Não foi possível salvar o invoice')
    }
  }

  if (abertoId !== null) {
    return (
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => onAbrir(null)}
          className="flex w-fit items-center gap-2 font-inter text-[#8A8A8F] text-sm transition-colors hover:text-white print:hidden"
        >
          <ArrowLeft className="size-4" />
          Voltar para a lista
        </button>

        <EditorInvoice
          /* Trocar de invoice remonta o formulário com os dados do outro. */
          key={abertoId || 'novo'}
          inicial={emEdicao ? paraFormulario(emEdicao) : invoiceEmBranco()}
          salvando={salvando}
          onSalvar={salvar}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {isPending ? (
        <p className="rounded-xl border border-white/8 border-dashed px-4 py-8 text-center font-inter text-[#6F6F76] text-xs">
          Carregando invoices…
        </p>
      ) : invoices.length === 0 ? (
        <EstadoVazio
          id="invoices"
          desenho="documentos"
          titulo="Nenhum invoice emitido"
          descricao="Os invoices que você gerar ficam aqui para reabrir, editar e exportar de novo."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {invoices.map((invoice) => (
            <li
              key={invoice.id}
              className="group flex items-center gap-4 rounded-xl border border-white/8 bg-white/3 px-4 py-3 transition-colors hover:border-white/16"
            >
              <FileText className="size-4 shrink-0 text-[#6F6F76]" />

              <button
                type="button"
                onClick={() => onAbrir(invoice.id)}
                className="min-w-0 flex-1 text-left"
              >
                <p className="truncate font-inter font-medium text-[#F4F5F5] text-sm">
                  {invoice.nome.trim() || 'Sem nome'}
                </p>
                <p className="truncate pt-0.5 font-inter text-[#8A8A8F] text-xs">
                  Nº {invoice.numero.trim() || '—'} ·{' '}
                  {dataPorExtenso(invoice.data)}
                </p>
              </button>

              <span className="shrink-0 font-inter font-medium text-[#F4F5F5] text-sm tabular-nums">
                {emReais(
                  totalDoInvoice(
                    invoice.itens.map((item) => ({
                      ...item,
                      valor: item.valor.toString(),
                    })),
                  ),
                )}
              </span>

              {/* Clicar na linha também abre, mas o lápis deixa isso à vista:
                  sem ele, só a lixeira aparecia e a edição ficava escondida. */}
              <div className="flex shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  aria-label={`Editar invoice de ${invoice.nome}`}
                  onClick={() => onAbrir(invoice.id)}
                  className="flex size-7 items-center justify-center rounded-md text-[#6F6F76] transition-colors hover:bg-white/6 hover:text-white"
                >
                  <Pencil className="size-3.5" />
                </button>

                <button
                  type="button"
                  aria-label={`Excluir invoice de ${invoice.nome}`}
                  onClick={() => excluir.mutate({ id: invoice.id })}
                  className="flex size-7 items-center justify-center rounded-md text-[#6F6F76] transition-colors hover:bg-rose-400/10 hover:text-rose-300"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
