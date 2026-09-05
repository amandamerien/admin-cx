import { zodResolver } from '@hookform/resolvers/zod'
import * as Dialog from '@radix-ui/react-dialog'
import { cn } from '@repo/ui'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  CICLO_PLANO_LABEL,
  CICLOS_PLANO,
  type Cliente,
  PLANO_LABEL,
  PLANOS_CLIENTE,
  STATUS_CLIENTE,
  STATUS_LABEL,
} from './dados'

const schema = z.object({
  nome: z.string().trim().min(2, 'Informe o nome do cliente'),
  email: z.email('Informe um e-mail válido'),
  status: z.enum(STATUS_CLIENTE),
  /* String vazia = "ainda não sei", e vira null na hora de salvar. Sem essa
     opção, editar um cliente antigo para trocar só o e-mail atribuiria um
     plano a ele sem ninguém escolher. */
  plano: z.enum(PLANOS_CLIENTE).or(z.literal('')),
  /* Texto no formulário, número ao salvar: campo numérico devolve string, e
     vazio precisa virar zero em vez de NaN. */
  funisContratados: z.string(),
  cicloPlano: z.enum(CICLOS_PLANO).or(z.literal('')),
})

export type NovoClienteInput = z.input<typeof schema>
export type NovoCliente = z.output<typeof schema>

const VALORES_PADRAO: NovoClienteInput = {
  nome: '',
  email: '',
  status: 'onboarding',
  funisContratados: '',
  plano: '',
  cicloPlano: '',
}

const classeCampo =
  'h-10 w-full rounded-lg border border-white/8 bg-white/2 px-3 font-inter text-[#F4F5F5] text-sm outline-none placeholder:text-[#6F6F76] focus-visible:border-white/25'

function Campo({
  id,
  rotulo,
  erro,
  children,
}: {
  id: string
  rotulo: string
  erro?: string
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
      {erro && (
        <p className="font-inter text-rose-300 text-xs" role="alert">
          {erro}
        </p>
      )}
    </div>
  )
}

interface FormularioProps {
  aberto: boolean
  onAbertoChange: (aberto: boolean) => void
  onSalvar: (cliente: Omit<Cliente, 'id'>) => void
  /* Quando vem preenchido, o formulário entra em modo de edição. */
  cliente?: Cliente | null
}

/* Modal de cadastro e edição de cliente. */
export function FormularioCliente({
  aberto,
  onAbertoChange,
  onSalvar,
  cliente,
}: FormularioProps) {
  const editando = Boolean(cliente)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NovoClienteInput, unknown, NovoCliente>({
    resolver: zodResolver(schema),
    defaultValues: VALORES_PADRAO,
  })

  /* Cada abertura recarrega os valores: os do cliente em edição, ou os
     padrões de um cadastro novo. */
  useEffect(() => {
    if (!aberto) return

    reset(
      cliente
        ? {
            nome: cliente.nome,
            email: cliente.email,
            status: cliente.status,
            funisContratados: cliente.funisContratados
              ? String(cliente.funisContratados)
              : '',
            plano: cliente.plano ?? '',
            cicloPlano: cliente.cicloPlano ?? '',
          }
        : VALORES_PADRAO,
    )
  }, [aberto, cliente, reset])

  function aoEnviar(dados: NovoCliente) {
    onSalvar({
      ...dados,
      funisContratados: Number.parseInt(dados.funisContratados, 10) || 0,
      plano: dados.plano === '' ? null : dados.plano,
      cicloPlano: dados.cicloPlano === '' ? null : dados.cicloPlano,
    })
    onAbertoChange(false)
  }

  return (
    <Dialog.Root open={aberto} onOpenChange={onAbertoChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] data-[state=open]:animate-in" />

        <Dialog.Content className="-translate-x-1/2 -translate-y-1/2 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 fixed top-1/2 left-1/2 z-50 flex max-h-[90svh] w-[calc(100%-2rem)] max-w-lg flex-col overflow-y-auto rounded-xl border border-white/10 bg-[#17171A] p-6 data-[state=open]:animate-in">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="font-inter font-medium text-lg text-white leading-tight">
                {editando ? 'Editar cliente' : 'Adicionar cliente'}
              </Dialog.Title>
              <Dialog.Description className="pt-1 font-inter text-[#8A8A8F] text-sm">
                Informações básicas da conta. O resto pode ser completado
                depois.
              </Dialog.Description>
            </div>

            <Dialog.Close
              aria-label="Fechar"
              className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/8 text-[#ABABAB] transition-colors hover:border-white/20 hover:text-white"
            >
              <X className="size-4" />
            </Dialog.Close>
          </div>

          <form
            onSubmit={handleSubmit(aoEnviar)}
            noValidate
            className="flex flex-col gap-4 pt-6"
          >
            <Campo
              id="nome"
              rotulo="Nome do cliente"
              erro={errors.nome?.message}
            >
              <input
                id="nome"
                placeholder="Método Corpo Livre"
                className={classeCampo}
                {...register('nome')}
              />
            </Campo>

            <Campo id="email" rotulo="E-mail" erro={errors.email?.message}>
              <input
                id="email"
                type="email"
                placeholder="contato@empresa.com.br"
                className={classeCampo}
                {...register('email')}
              />
            </Campo>

            <Campo
              id="funisContratados"
              rotulo="Funis contratados"
              erro={errors.funisContratados?.message}
            >
              <input
                id="funisContratados"
                type="number"
                min="0"
                inputMode="numeric"
                placeholder="0"
                className={classeCampo}
                {...register('funisContratados')}
              />
            </Campo>

            {/* Plano e ciclo andam juntos: dividem a linha. */}
            <div className="grid grid-cols-2 gap-4">
              <Campo id="plano" rotulo="Plano" erro={errors.plano?.message}>
                <select
                  id="plano"
                  className={classeCampo}
                  {...register('plano')}
                >
                  <option value="">Sem plano definido</option>
                  {PLANOS_CLIENTE.map((plano) => (
                    <option key={plano} value={plano}>
                      {PLANO_LABEL[plano]}
                    </option>
                  ))}
                </select>
              </Campo>

              <Campo
                id="cicloPlano"
                rotulo="Cobrança"
                erro={errors.cicloPlano?.message}
              >
                <select
                  id="cicloPlano"
                  className={classeCampo}
                  {...register('cicloPlano')}
                >
                  <option value="">—</option>
                  {CICLOS_PLANO.map((ciclo) => (
                    <option key={ciclo} value={ciclo}>
                      {CICLO_PLANO_LABEL[ciclo]}
                    </option>
                  ))}
                </select>
              </Campo>
            </div>

            <Campo id="status" rotulo="Status" erro={errors.status?.message}>
              <select
                id="status"
                className={classeCampo}
                {...register('status')}
              >
                {STATUS_CLIENTE.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABEL[status]}
                  </option>
                ))}
              </select>
            </Campo>

            <div className="flex justify-end gap-2 pt-2">
              <Dialog.Close
                type="button"
                className="h-10 rounded-lg border border-white/8 px-4 font-inter font-medium text-[#ABABAB] text-sm transition-colors hover:border-white/20 hover:text-white"
              >
                Cancelar
              </Dialog.Close>

              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  'h-10 rounded-full bg-white px-5 font-inter font-medium text-[#131316] text-sm transition-colors hover:bg-white/90',
                  isSubmitting && 'opacity-60',
                )}
              >
                {editando ? 'Salvar alterações' : 'Adicionar cliente'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
