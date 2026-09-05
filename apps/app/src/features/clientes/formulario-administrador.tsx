import { zodResolver } from '@hookform/resolvers/zod'
import * as Dialog from '@radix-ui/react-dialog'
import { cn } from '@repo/ui'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Switch } from '@/components/ui/switch'
import { Avatar } from './avatares'
import {
  type Administrador,
  AVATAR_LABEL,
  AVATARES,
  PAPEIS,
  PAPEL_DESCRICAO,
  PAPEL_LABEL,
} from './dados'

const schema = z.object({
  nome: z.string().trim().min(2, 'Informe o nome'),
  cargo: z.string().trim().min(2, 'Informe o cargo'),
  email: z.email('Informe um e-mail válido'),
  papel: z.enum(PAPEIS),
  ativo: z.boolean(),
  avatar: z.enum(AVATARES),
  /* Não há cadastro público: é esta senha que cria o acesso da pessoa.
     Cadastrar alguém na equipe é criar o acesso dela. */
  senha: z
    .string()
    .min(8, 'A senha precisa de ao menos 8 caracteres')
    .optional()
    .or(z.literal('')),
})

export type NovoAdministrador = z.infer<typeof schema>

/* Senha padrão de entrada da equipe: o administrador preenche com um clique e
 * avisa a pessoa. É a mesma para todo mundo, então serve como senha de
 * primeiro acesso — quem quiser algo só seu digita no lugar. */
const SENHA_PADRAO = 'clickmax@2026'

const VALORES_PADRAO: NovoAdministrador = {
  nome: '',
  cargo: '',
  email: '',
  papel: 'editor',
  ativo: true,
  avatar: 'estrela',
  senha: '',
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

interface FormularioAdministradorProps {
  aberto: boolean
  onAbertoChange: (aberto: boolean) => void
  onSalvar: (
    administrador: Omit<Administrador, 'id' | 'temAcesso'> & {
      email: string
      senha?: string
    },
  ) => void
  /* Quando vem preenchido, o formulário entra em modo de edição. */
  administrador?: Administrador | null
}

/* Cadastro e edição de administrador. */
export function FormularioAdministrador({
  aberto,
  onAbertoChange,
  onSalvar,
  administrador,
}: FormularioAdministradorProps) {
  const editando = Boolean(administrador)
  /* Cadastro novo sempre cria o acesso. Na edição o campo só aparece para
     quem ficou sem conta (equipe cadastrada antes desta regra). */
  const pedeSenha = !editando || administrador?.temAcesso === false

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<NovoAdministrador>({
    resolver: zodResolver(
      pedeSenha
        ? schema.extend({
            senha: z
              .string()
              .min(8, 'A senha precisa de ao menos 8 caracteres'),
          })
        : schema,
    ),
    defaultValues: VALORES_PADRAO,
  })

  useEffect(() => {
    if (!aberto) return

    reset(
      administrador
        ? {
            nome: administrador.nome,
            cargo: administrador.cargo,
            email: administrador.email ?? '',
            papel: administrador.papel,
            ativo: administrador.ativo,
            avatar: administrador.avatar,
            senha: '',
          }
        : VALORES_PADRAO,
    )
  }, [aberto, administrador, reset])

  const escolhido = watch('avatar')

  function aoEnviar(dados: NovoAdministrador) {
    onSalvar(dados)
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
                {editando ? 'Editar administrador' : 'Adicionar administrador'}
              </Dialog.Title>
              <Dialog.Description className="pt-1 font-inter text-[#8A8A8F] text-sm">
                Quem entra aqui aparece na lista de responsáveis dos funis.
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
            <Campo id="admin-nome" rotulo="Nome" erro={errors.nome?.message}>
              <input
                id="admin-nome"
                placeholder="Amanda Merien"
                className={classeCampo}
                {...register('nome')}
              />
            </Campo>

            <Campo id="admin-cargo" rotulo="Cargo" erro={errors.cargo?.message}>
              <input
                id="admin-cargo"
                placeholder="Head de Customer Experience"
                className={classeCampo}
                {...register('cargo')}
              />
            </Campo>

            <Campo
              id="admin-email"
              rotulo="E-mail"
              erro={errors.email?.message}
            >
              <input
                id="admin-email"
                type="email"
                placeholder="pessoa@clickmax.io"
                className={classeCampo}
                {...register('email')}
              />
            </Campo>

            {pedeSenha && (
              <Campo
                id="admin-senha"
                rotulo="Senha de acesso"
                erro={errors.senha?.message}
              >
                <div className="flex gap-2">
                  <input
                    id="admin-senha"
                    type="text"
                    autoComplete="off"
                    placeholder="Ao menos 8 caracteres"
                    className={classeCampo}
                    {...register('senha')}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setValue('senha', SENHA_PADRAO, { shouldValidate: true })
                    }
                    className="h-10 shrink-0 whitespace-nowrap rounded-lg border border-white/8 bg-white/2 px-3 font-inter font-medium text-[#F4F5F5] text-xs transition-colors hover:bg-white/6"
                  >
                    Gerar senha padrão
                  </button>
                </div>
                <p className="font-inter text-[#6F6F76] text-xs">
                  A pessoa entra com o e-mail acima e esta senha. Depois de
                  salvar, ela não aparece de novo.
                </p>
              </Campo>
            )}

            <fieldset>
              <legend className="pb-1.5 font-inter font-medium text-[#ABABAB] text-xs">
                Avatar
              </legend>

              <div className="flex flex-wrap gap-2">
                {AVATARES.map((avatar) => (
                  <label
                    key={avatar}
                    htmlFor={`admin-avatar-${avatar}`}
                    title={AVATAR_LABEL[avatar]}
                    className={cn(
                      'cursor-pointer rounded-xl border p-1 transition-colors',
                      escolhido === avatar
                        ? 'border-white/40 bg-white/8'
                        : 'border-white/8 hover:border-white/20',
                    )}
                  >
                    <input
                      id={`admin-avatar-${avatar}`}
                      type="radio"
                      value={avatar}
                      className="sr-only"
                      {...register('avatar')}
                    />
                    <Avatar avatar={avatar} className="size-10 rounded-lg" />
                    <span className="sr-only">{AVATAR_LABEL[avatar]}</span>
                  </label>
                ))}
              </div>

              <p className="pt-2 font-inter text-[#6F6F76] text-xs">
                É o bichinho que identifica a pessoa nos comentários do mural.
              </p>
            </fieldset>

            <fieldset className="flex flex-col gap-2">
              <legend className="pb-1.5 font-inter font-medium text-[#ABABAB] text-xs">
                Papel
              </legend>

              {PAPEIS.map((papel) => (
                <label
                  key={papel}
                  htmlFor={`admin-papel-${papel}`}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/8 bg-white/2 p-3"
                >
                  <input
                    id={`admin-papel-${papel}`}
                    type="radio"
                    value={papel}
                    className="mt-0.5 size-4 accent-white"
                    {...register('papel')}
                  />
                  <span>
                    <span className="block font-inter font-medium text-[#F4F5F5] text-sm">
                      {PAPEL_LABEL[papel]}
                    </span>
                    <span className="block pt-0.5 font-inter text-[#6F6F76] text-xs">
                      {PAPEL_DESCRICAO[papel]}
                    </span>
                  </span>
                </label>
              ))}

              <p className="font-inter text-[#6F6F76] text-xs">
                O papel fica registrado para quando houver login — hoje nada na
                tela é bloqueado por ele.
              </p>
            </fieldset>

            <div className="flex items-start justify-between gap-3 rounded-lg border border-white/8 bg-white/2 p-3">
              <div>
                <span className="block font-inter font-medium text-[#F4F5F5] text-sm">
                  Acesso liberado
                </span>
                <span className="block pt-0.5 font-inter text-[#6F6F76] text-xs">
                  Desligue para suspender a pessoa sem excluir o cadastro.
                </span>
              </div>

              <Switch
                checked={Boolean(watch('ativo'))}
                onCheckedChange={(valor) => setValue('ativo', valor)}
                aria-label="Acesso liberado"
                className="mt-0.5 shrink-0 data-[state=checked]:bg-sky-500"
              />
            </div>

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
                {editando ? 'Salvar alterações' : 'Adicionar administrador'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
