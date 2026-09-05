import { prisma } from '@repo/database'

/**
 * Semeia a equipe inicial do painel.
 *
 * Não há cadastro público: a primeira ficha de administrador tem que nascer
 * por aqui, senão ninguém consegue cadastrar ninguém. Depois disso a equipe é
 * gerenciada pela tela, em Configurações › Administradores.
 *
 * A ficha é ligada à conta do Better Auth pelo e-mail, quando já existe uma.
 * Quem ainda não tem conta fica listado sem acesso até um administrador criar
 * a senha pela tela.
 *
 *   pnpm --filter @repo/api run seed:equipe
 */
const EQUIPE = [
  {
    nome: 'Amanda Merien',
    cargo: 'Head de Customer Experience',
    email: 'amanda@bilhon.com',
    papel: 'administrador',
    avatar: 'estrela',
  },
  {
    nome: 'Leandro Rezende',
    cargo: 'CEO Clickmax',
    email: 'leandro@bilhon.com',
    papel: 'administrador',
    avatar: 'capsula',
  },
  {
    nome: 'Thiago Finch',
    cargo: 'CEO Clickmax',
    email: 'contato@thiagofinch.com',
    papel: 'administrador',
    avatar: 'losango',
  },
] as const

async function semear() {
  for (const pessoa of EQUIPE) {
    const conta = await prisma.users.findUnique({
      where: { email: pessoa.email },
    })

    const ficha = await prisma.administrador.upsert({
      where: { email: pessoa.email },
      create: { ...pessoa, ativo: true, userId: conta?.id ?? null },
      /* Reexecutar não sobrescreve o que a equipe já ajustou na tela: só
         garante o vínculo com a conta, se ela apareceu no meio do caminho. */
      update: conta ? { userId: conta.id } : {},
    })

    const acesso = ficha.userId ? 'com acesso' : 'sem acesso (conta não criada)'
    console.log(`✓ ${ficha.nome} — ${ficha.papel}, ${acesso}`)
  }
}

semear()
  .catch((erro) => {
    console.error(erro)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
