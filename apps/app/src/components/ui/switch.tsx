import * as SwitchPrimitive from '@radix-ui/react-switch'
import { cn } from '@repo/ui'
import type * as React from 'react'

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent p-0.5 outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=unchecked]:justify-start data-[state=checked]:justify-end data-[state=checked]:bg-[#84DDDB] data-[state=unchecked]:bg-[#F2F4F7]/15',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'pointer-events-none block size-5 rounded-full bg-white shadow-[0px_1.1388888359069824px_2.277777671813965px_0px_rgba(16,24,40,0.06),0px_1.1388888359069824px_3.4166665077209473px_0px_rgba(16,24,40,0.10)] ring-0 transition-transform',
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
