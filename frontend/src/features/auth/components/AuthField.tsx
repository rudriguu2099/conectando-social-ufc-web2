import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'

type AuthFieldProps = {
  id: string
  label: string
  children: ReactNode
}

export default function AuthField({ id, label, children }: AuthFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm text-neutral-700">
        {label}
      </Label>
      {children}
    </div>
  )
}
