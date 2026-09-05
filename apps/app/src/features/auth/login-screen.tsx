import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { FundoEstrelas } from '@/features/clientes/fundo-estrelas'
import { authClient } from '@/lib/auth-client'
import { type LoginInput, loginSchema } from '@/lib/schemas'

/* Tela de acesso do painel.
 *
 * Mesmo visual da tela de entrada do site (fundo de estrelas, logo, campos
 * arredondados), mas a checagem agora é do Better Auth: e-mail e senha vão
 * para a API e a sessão volta em cookie. Não há cadastro público — quem entra
 * foi cadastrado por um administrador. */
export function LoginScreen() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  async function acessar(values: LoginInput) {
    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
    })

    if (error) {
      setError('root', {
        message:
          error.status === 401
            ? 'E-mail ou senha incorretos.'
            : (error.message ?? 'Não foi possível entrar.'),
      })
      return
    }

    navigate({ to: '/' })
  }

  const recado =
    errors.root?.message ?? errors.email?.message ?? errors.password?.message

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#0B0C0E] px-4">
      <FundoEstrelas />

      <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#131316]/80 p-8 shadow-2xl backdrop-blur-sm">
        <img
          src="/images/logo-white.webp"
          alt="Clickmax"
          className="mx-auto h-6 w-auto"
        />

        <form
          onSubmit={handleSubmit(acessar)}
          noValidate
          className="flex flex-col gap-4 pt-8"
        >
          <label
            htmlFor="login-email"
            className="text-center font-inter text-[#ABABAB] text-sm"
          >
            Entre com seu e-mail e senha
          </label>

          <input
            id="login-email"
            type="email"
            placeholder="voce@bilhon.com"
            autoComplete="email"
            className="h-11 w-full rounded-full border border-white/10 bg-white/4 px-4 text-center font-inter text-[#F4F5F5] text-sm outline-none placeholder:text-[#5A5A61] focus-visible:border-white/30"
            {...register('email')}
          />

          <input
            id="login-senha"
            type="password"
            placeholder="Sua senha"
            autoComplete="current-password"
            className="h-11 w-full rounded-full border border-white/10 bg-white/4 px-4 text-center font-inter text-[#F4F5F5] text-sm outline-none placeholder:text-[#5A5A61] focus-visible:border-white/30"
            {...register('password')}
          />

          {recado && (
            <p
              role="alert"
              className="text-center font-inter text-rose-300 text-xs"
            >
              {recado}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full rounded-full bg-white font-inter font-medium text-[#131316] text-sm transition-colors hover:bg-white/90 disabled:opacity-60"
          >
            {isSubmitting ? 'Entrando…' : 'Acessar'}
          </button>
        </form>
      </div>
    </main>
  )
}
