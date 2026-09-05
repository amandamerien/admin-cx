import { zodResolver } from '@hookform/resolvers/zod'
import * as Dialog from '@radix-ui/react-dialog'
import { cn } from '@repo/ui'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  type Administrador,
  type Cliente,
  ETAPA_FUNIL_LABEL,
  ETAPAS_FUNIL,
  type Funil,
  nomeDoTipoDeFunil,
  STATUS_FUNIL,
  STATUS_FUNIL_LABEL,
  TIPO_FUNIL_OUTROS,
  TIPOS_FUNIL,
  tipoDoNomeDeFunil,
} from './dados'

const schema = z
  .object({
    clienteId: z.string().min(1, 'Selecione o cliente'),
    /* Um dos tipos prontos, ou "outros" para digitar. */
    tipo: z.string().min(1, 'Selecione o tipo do funil'),
    nomePersonalizado: z.string().trim(),
    etapa: z.enum(ETAPAS_FUNIL),
    status: z.enum(STATUS_FUNIL),
    responsavel: z.string().trim().min(2, 'Informe o responsável'),
    /* Campo vazio vira `null`: a data pode não estar combinada ainda. */
    dataEntrega: z.string().transform((valor) => (valor === '' ? null : valor)),
  })
  .superRefine((dados, ctx) => {
    if (
      dados.tipo === TIPO_FUNIL_OUTROS &&
      dados.nomePersonalizado.length < 2
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['nomePersonalizado'],
        message: 'Informe o nome da entrega',
      })
    }
  })
  /* O que é gravado é sempre `nome`: o tipo escolhido já com o prefixo
     "Funil", ou o texto digitado em Outros, sem prefixo. */
  .transform((dados) => ({
    ...dados,
    nome:
      dados.tipo === TIPO_FUNIL_OUTROS
        ? dados.nomePersonalizado
        : nomeDoTipoDeFunil(dados.tipo),
  }))

export type NovoFunilInput = z.input<typeof schema>
export type NovoFunil = z.output<typeof schema>

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

/* Nome gravado → o que o formulário mostra: se bate com um tipo pronto,
 * seleciona esse tipo; senão, cai em "Outros" com o texto preenchido. */
function valoresDoNome(nome: string) {
  const tipo = tipoDoNomeDeFunil(nome)
  return {
    tipo: tipo ?? TIPO_FUNIL_OUTROS,
    nomePersonalizado: tipo ? '' : nome,
  }
}

interface FormularioFunilProps {
  aberto: boolean
  onAbertoChange: (aberto: boolean) => void
  clientes: Cliente[]
  administradores: Administrador[]
  onSalvar: (funil: Omit<Funil, 'id'>) => void
  /* Quando vem preenchido, o formulário entra em modo de edição. */
  funil?: Funil | null
}

/* Cadastro de um funil em construção para um cliente. */
export function FormularioFunil({
  aberto,
  onAbertoChange,
  clientes,
  administradores,
  onSalvar,
  funil,
}: FormularioFunilProps) {
  const editando = Boolean(funil)
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<NovoFunilInput, unknown, NovoFunil>({
    resolver: zodResolver(schema),
    defaultValues: {
      clienteId: clientes[0]?.id ?? '',
      tipo: '',
      nomePersonalizado: '',
      etapa: 'onboarding',
      status: 'nao_iniciado',
      responsavel: administradores[0]?.nome ?? '',
      dataEntrega: '',
    },
  })

  const tipoEscolhido = watch('tipo')

  useEffect(() => {
    if (!aberto) return

    reset(
      funil
        ? {
            clienteId: funil.clienteId,
            ...valoresDoNome(funil.nome),
            etapa: funil.etapa,
            status: funil.status,
            responsavel: funil.responsavel,
            dataEntrega: funil.dataEntrega ?? '',
          }
        : {
            clienteId: clientes[0]?.id ?? '',
            tipo: '',
            nomePersonalizado: '',
            etapa: 'onboarding',
            status: 'nao_iniciado',
            responsavel: administradores[0]?.nome ?? '',
            dataEntrega: '',
          },
    )
  }, [aberto, clientes, administradores, funil, reset])

  function aoEnviar(dados: NovoFunil) {
    const {
      tipo: _tipo,
      nomePersonalizado: _nomePersonalizado,
      ...funilSalvo
    } = dados
    onSalvar(funilSalvo)
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
                {editando ? 'Editar entrega' : 'Adicionar entrega'}
              </Dialog.Title>
              <Dialog.Description className="pt-1 font-inter text-[#8A8A8F] text-sm">
                Uma entrega em construção com o time, e em que etapa ela está.
              </Dialog.Description>
            </div>

            <Dialog.Close
              type="button"
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
              id="funil-cliente"
              rotulo="Cliente"
              erro={errors.clienteId?.message}
            >
              <select
                id="funil-cliente"
                className={classeCampo}
                {...register('clienteId')}
              >
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </option>
                ))}
              </select>
            </Campo>

            <Campo
              id="funil-tipo"
              rotulo="Nome da entrega"
              erro={errors.tipo?.message}
            >
              <select
                id="funil-tipo"
                className={classeCampo}
                {...register('tipo')}
              >
                <option value="">Selecione</option>
                {TIPOS_FUNIL.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
                <option value={TIPO_FUNIL_OUTROS}>Outros</option>
              </select>
            </Campo>

            {tipoEscolhido === TIPO_FUNIL_OUTROS && (
              <Campo
                id="funil-nome"
                rotulo="Qual?"
                erro={errors.nomePersonalizado?.message}
              >
                <input
                  id="funil-nome"
                  placeholder="Nome do funil"
                  className={classeCampo}
                  {...register('nomePersonalizado')}
                />
              </Campo>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Campo
                id="funil-etapa"
                rotulo="Etapa"
                erro={errors.etapa?.message}
              >
                <select
                  id="funil-etapa"
                  className={classeCampo}
                  {...register('etapa')}
                >
                  {ETAPAS_FUNIL.map((etapa) => (
                    <option key={etapa} value={etapa}>
                      {ETAPA_FUNIL_LABEL[etapa]}
                    </option>
                  ))}
                </select>
              </Campo>

              <Campo
                id="funil-status"
                rotulo="Status"
                erro={errors.status?.message}
              >
                <select
                  id="funil-status"
                  className={classeCampo}
                  {...register('status')}
                >
                  {STATUS_FUNIL.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_FUNIL_LABEL[status]}
                    </option>
                  ))}
                </select>
              </Campo>
            </div>

            <Campo
              id="funil-responsavel"
              rotulo="Responsável"
              erro={errors.responsavel?.message}
            >
              <select
                id="funil-responsavel"
                className={classeCampo}
                {...register('responsavel')}
              >
                {administradores.map((administrador) => (
                  <option key={administrador.id} value={administrador.nome}>
                    {administrador.nome}
                  </option>
                ))}
              </select>
            </Campo>

            <Campo
              id="funil-entrega"
              rotulo="Data de entrega"
              erro={errors.dataEntrega?.message}
            >
              <input
                id="funil-entrega"
                type="date"
                className={classeCampo}
                {...register('dataEntrega')}
              />
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
                {editando ? 'Salvar alterações' : 'Adicionar funil'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
