import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'

type AuthFieldProps = {
  id: string
  label: string
  children: ReactNode
  required?: boolean
}

export default function AuthField({ id, label, children, required = false }: AuthFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm text-neutral-700">
        {label}
        {required && (
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        )}
      </Label>
      {children}
    </div>
  )
}
