import { Eye, EyeOff } from 'lucide-react'
import { type ComponentProps, useState } from 'react'
import { cn } from '@/lib/utils'
import AuthInput from './AuthInput'

type AuthPasswordInputProps = Omit<ComponentProps<typeof AuthInput>, 'type'>

export default function AuthPasswordInput({
  className,
  disabled,
  ...props
}: AuthPasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative">
      <AuthInput
        {...props}
        type={showPassword ? 'text' : 'password'}
        disabled={disabled}
        className={cn('pr-14', className)}
      />
      <button
        type="button"
        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
        aria-pressed={showPassword}
        disabled={disabled}
        onClick={() => setShowPassword((visible) => !visible)}
        className="absolute inset-y-0 right-0 flex w-14 items-center justify-center text-neutral-600 hover:text-neutral-950 focus-visible:outline-2 focus-visible:outline-sky-800 disabled:opacity-50"
      >
        {showPassword ? (
          <EyeOff aria-hidden="true" className="size-6" />
        ) : (
          <Eye aria-hidden="true" className="size-6" />
        )}
      </button>
    </div>
  )
}
