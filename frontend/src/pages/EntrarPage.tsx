import { useState, type FormEvent } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import AuthField from '@/features/auth/components/AuthField'
import AuthFormNotice from '@/features/auth/components/AuthFormNotice'

export default function EntrarPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice('A autenticação ainda não está conectada ao backend.')
  }

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold tracking-tight">Entrar</h2>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <AuthField id="email" label="E-mail">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="seu.email@ufc.br"
            required
            className="h-10 rounded-sm border-neutral-400 px-3 text-sm shadow-none focus-visible:border-sky-800 focus-visible:ring-sky-800/20"
          />
        </AuthField>

        <AuthField id="password" label="Senha">
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Digite sua senha"
              required
              className="h-10 rounded-sm border-neutral-400 px-3 pr-11 text-sm shadow-none focus-visible:border-sky-800 focus-visible:ring-sky-800/20"
            />
            <button
              type="button"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-neutral-600 hover:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-sky-800"
            >
              {showPassword ? (
                <EyeOff aria-hidden="true" className="size-4" />
              ) : (
                <Eye aria-hidden="true" className="size-4" />
              )}
            </button>
          </div>
        </AuthField>

        <div className="flex justify-end pt-0.5">
          <Link
            to="/esqueci-senha"
            className="text-xs text-neutral-800 underline underline-offset-2 hover:text-sky-800"
          >
            Esqueci minha senha
          </Link>
        </div>

        <Button
          type="submit"
          className="h-10 w-full rounded-sm bg-sky-800 text-sm font-medium text-white hover:bg-sky-900"
        >
          Entrar
        </Button>

        {notice && <AuthFormNotice>{notice}</AuthFormNotice>}
      </form>

      <div className="space-y-5 text-center">
        <Link
          to="/criar-conta"
          className="inline-block text-sm font-medium text-neutral-900 hover:text-sky-800"
        >
          Criar conta
        </Link>
        <p className="text-xs leading-5 text-neutral-500">
          Professores recebem a conta da coordenação do curso.
        </p>
      </div>
    </div>
  )
}
