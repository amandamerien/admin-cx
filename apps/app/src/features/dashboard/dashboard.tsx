import { useGetMe } from '@repo/api-client/hooks'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { useNavigate } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'

export function Dashboard() {
  const navigate = useNavigate()

  // Hook GERADO pelo Kubb a partir do GET /me da API. Tipagem 100% derivada
  // do schema Zod do backend — sem escrever fetch/tipos à mão.
  const { data, isPending } = useGetMe()
  const me = data?.data

  async function handleLogout() {
    await authClient.signOut()
    navigate({ to: '/login' })
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="flex items-center justify-between border-b border-border bg-background px-6 py-4">
        <span className="font-heading text-lg font-bold">Boilerplate</span>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Sair
        </Button>
      </header>

      <main className="mx-auto max-w-2xl p-6">
        <Card>
          <CardHeader>
            <CardTitle>Você está autenticado 🎉</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {isPending ? (
              <p className="text-muted-foreground">Carregando perfil…</p>
            ) : (
              <div className="flex flex-col gap-1 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Nome:</strong> {me?.name}
                </p>
                <p>
                  <strong className="text-foreground">E-mail:</strong>{' '}
                  {me?.email}
                </p>
                <p>
                  <strong className="text-foreground">ID:</strong> {me?.id}
                </p>
              </div>
            )}
            <p className="mt-4 text-muted-foreground">
              Os dados acima vêm do <code>GET /me</code> via o hook{' '}
              <code>useGetMe</code> gerado pelo Kubb. Comece sua feature a
              partir daqui.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
