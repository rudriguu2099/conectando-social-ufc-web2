import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

type AuthSelectProps = ComponentProps<'select'>

export default function AuthSelect({ className, children, ...props }: AuthSelectProps) {
  return (
    <select
      className={cn(
        'h-10 w-full rounded-sm border border-neutral-400 bg-white px-3',
        'text-sm text-neutral-900 outline-none',
        'focus:border-sky-800 focus:ring-3 focus:ring-sky-800/20',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}
