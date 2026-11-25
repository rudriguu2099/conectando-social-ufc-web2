import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'

type AuthFieldProps = {
  id: string
  label: string
  children: ReactNode
  required?: boolean
}

export default function AuthField({
  id,
  label,
  children,
  required = false,
}: AuthFieldProps) {
  return (
    <div className="auth-field relative">
      <Label htmlFor={id} className="absolute -top-2 left-3 z-10 bg-white px-1 text-sm font-normal text-neutral-700">
        {label}
        {required && (
          <span aria-hidden="true" className="text-neutral-700">
            *
          </span>
        )}
      </Label>
      {children}
    </div>
  )
}
