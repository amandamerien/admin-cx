import * as Menu from '@radix-ui/react-dropdown-menu'
import { cn } from '@repo/ui'
import { Check, ChevronDown } from 'lucide-react'
import {
  CLASSES_STATUS_FUNIL,
  STATUS_FUNIL,
  STATUS_FUNIL_LABEL,
  type StatusFunil,
} from './dados'

interface SeletorStatusProps {
  status: StatusFunil
  /* Entra no rótulo acessível do gatilho. */
  rotulo: string
  onSelecionar: (status: StatusFunil) => void
}

/* O próprio badge de status abre o menu: trocar o status é um clique, sem
 * passar pelo formulário de edição. */
export function SeletorStatus({
  status,
  rotulo,
  onSelecionar,
}: SeletorStatusProps) {
  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label={`Status de ${rotulo}: ${STATUS_FUNIL_LABEL[status]}. Alterar`}
        className={cn(
          'inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-0.5 font-inter font-medium text-xs ring-1 ring-inset transition-opacity hover:opacity-80',
          CLASSES_STATUS_FUNIL[status],
        )}
      >
        {STATUS_FUNIL_LABEL[status]}
        <ChevronDown className="size-3 opacity-70" />
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Content
          align="start"
          sideOffset={6}
          className="data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 z-50 min-w-48 rounded-lg border border-white/10 bg-[#17171A] p-1 shadow-lg data-[state=open]:animate-in"
        >
          {STATUS_FUNIL.map((opcao) => (
            <Menu.Item
              key={opcao}
              onSelect={() => onSelecionar(opcao)}
              className="flex cursor-pointer select-none items-center justify-between gap-3 rounded-md px-2 py-1.5 font-inter text-[#F4F5F5] text-sm outline-none focus:bg-white/6"
            >
              <span className="flex items-center gap-2">
                <span
                  className={cn(
                    'size-2 rounded-full ring-1 ring-inset',
                    CLASSES_STATUS_FUNIL[opcao],
                  )}
                />
                {STATUS_FUNIL_LABEL[opcao]}
              </span>

              {opcao === status && (
                <Check className="size-3.5 shrink-0 text-[#6F6F76]" />
              )}
            </Menu.Item>
          ))}
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  )
}
