import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthField from '@/features/auth/components/AuthField'
import AuthFormNotice from '@/features/auth/components/AuthFormNotice'
import AuthPasswordInput from '@/features/auth/components/AuthPasswordInput'
import AuthSubmitButton from '@/features/auth/components/AuthSubmitButton'
import {
  getResetPasswordErrorMessage,
  resetPassword,
} from '@/features/auth/auth.service'

export default function RedefinirSenhaPage() {
  const { hash } = useLocation()
  const navigate = useNavigate()
  const token = new URLSearchParams(hash.slice(1)).get('token')?.trim() ?? ''
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting || !token) return

    if (password.length < 8 || password.length > 128) {
      setError('A senha precisa ter entre 8 e 128 caracteres.')
      return
    }

    setError(null)
    setIsSubmitting(true)
    try {
      await resetPassword({ token, password })
      navigate('/', {
        replace: true,
        state: { passwordResetSuccess: true },
      })
    } catch (error) {
      setError(getResetPasswordErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Link to="/" className="inline-block text-base underline underline-offset-2 hover:text-sky-800">
        ← Entrar
      </Link>
      <h2 className="font-serif text-[30px] font-bold leading-tight">
        Crie uma senha nova
      </h2>

      {!token ? (
        <AuthFormNotice>
          Link inválido ou incompleto. Solicite um novo link para recuperar sua senha.
        </AuthFormNotice>
      ) : (
        <>
          <p className="font-serif text-xl leading-7">
            Escolha a senha nova da sua conta.
          </p>
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <AuthField id="new-password" label="Senha nova" required>
              <AuthPasswordInput
                id="new-password"
                name="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={128}
                value={password}
                disabled={isSubmitting}
                aria-describedby="password-help"
                aria-invalid={Boolean(error)}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setError(null)
                }}
              />
            </AuthField>
            <p id="password-help" className="text-sm text-neutral-500">
              Use pelo menos 8 caracteres.
            </p>
            {error && <AuthFormNotice>{error}</AuthFormNotice>}
            <AuthSubmitButton disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar senha nova'}
            </AuthSubmitButton>
          </form>
        </>
      )}

      <Link to="/esqueci-senha" className="inline-block text-sm underline underline-offset-2 hover:text-sky-800">
        Solicitar um novo link
      </Link>
    </div>
  )
}
