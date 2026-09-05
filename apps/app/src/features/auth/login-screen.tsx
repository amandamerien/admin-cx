import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input, Label } from '@repo/ui'
import { Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'
import { type LoginInput, loginSchema } from '@/lib/schemas'
import { AuthLayout } from './auth-layout'

export function LoginScreen() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(values: LoginInput) {
    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
    })
    if (error) {
      toast.error(error.message ?? 'Não foi possível entrar')
      return
    }
    navigate({ to: '/' })
  }

  return (
    <AuthLayout title="Entrar" subtitle="Acesse sua conta para continuar">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            error={!!errors.email}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            error={!!errors.password}
            {...register('password')}
          />
          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" loading={isSubmitting}>
          Entrar
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Não tem conta?{' '}
        <Link
          to="/register"
          className="font-medium text-primary hover:underline"
        >
          Criar conta
        </Link>
      </p>
    </AuthLayout>
  )
}
