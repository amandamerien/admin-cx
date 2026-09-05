import * as Menu from '@radix-ui/react-dropdown-menu'
import { cn } from '@repo/ui'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'

const classeItem =
  'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 font-inter text-sm outline-none select-none'

interface MenuAcoesProps {
  /* Entra no rótulo acessível do gatilho: "Ações de <rotulo>". */
  rotulo: string
  onEditar: () => void
  onExcluir: () => void
}

/* Três pontinhos na vertical, com editar e excluir. Usado no cartão de
 * cliente e na tabela de funis. */
export function MenuAcoes({ rotulo, onEditar, onExcluir }: MenuAcoesProps) {
  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label={`Ações de ${rotulo}`}
        className="flex size-7 shrink-0 items-center justify-center rounded-md text-[#6F6F76] transition-colors hover:bg-white/6 hover:text-white data-[state=open]:bg-white/6 data-[state=open]:text-white"
      >
        <MoreVertical className="size-4" />
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Content
          align="end"
          sideOffset={6}
          className="data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 z-50 min-w-36 rounded-lg border border-white/10 bg-[#17171A] p-1 shadow-lg data-[state=open]:animate-in"
        >
          <Menu.Item
            onSelect={onEditar}
            className={cn(classeItem, 'text-[#F4F5F5] focus:bg-white/6')}
          >
            <Pencil className="size-3.5" />
            Editar
          </Menu.Item>

          <Menu.Item
            onSelect={onExcluir}
            className={cn(classeItem, 'text-rose-300 focus:bg-rose-400/10')}
          >
            <Trash2 className="size-3.5" />
            Excluir
          </Menu.Item>
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  )
}
