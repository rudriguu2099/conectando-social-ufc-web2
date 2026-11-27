import type { ComponentProps } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type AuthInputProps = ComponentProps<typeof Input>

export default function AuthInput({ className, ...props }: AuthInputProps) {
  return (
    <Input
      className={cn(
        'h-10 rounded-sm border-neutral-400 px-3 text-sm shadow-none',
        'focus-visible:border-sky-800 focus-visible:ring-sky-800/20',
        className,
      )}
      {...props}
    />
  )
}
