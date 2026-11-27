import { Eye, EyeOff } from 'lucide-react'
import { type ComponentProps, useState } from 'react'
import AuthInput from './AuthInput'

type AuthPasswordInputProps = Omit<ComponentProps<typeof AuthInput>, 'type'>

export default function AuthPasswordInput(props: AuthPasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative">
      <AuthInput {...props} type={showPassword ? 'text' : 'password'} className="pr-11" />
      <button
        type="button"
        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
        aria-pressed={showPassword}
        onClick={() => setShowPassword((visible) => !visible)}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-neutral-600 hover:text-neutral-950"
      >
        {showPassword ? (
          <EyeOff aria-hidden="true" className="size-4" />
        ) : (
          <Eye aria-hidden="true" className="size-4" />
        )}
      </button>
    </div>
  )
}
