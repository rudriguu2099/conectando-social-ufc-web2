import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import AuthField from '@/features/auth/components/AuthField'
import AuthFormNotice from '@/features/auth/components/AuthFormNotice'
import AuthInput from '@/features/auth/components/AuthInput'
import AuthPasswordInput from '@/features/auth/components/AuthPasswordInput'
import { useFormEntrar } from './useFormEntrar'

export default function FormEntrar() {
  const {
    form,
    errors,
    isSubmitting,
    submitError,
    updateField,
    handleSubmit,
  } = useFormEntrar()

  return (
    <form className="space-y-3" action={handleSubmit}>
      <AuthField id="email" label="E-mail" required>
        <AuthInput
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="seu.email@ufc.br"
          required
          value={form.email}
          onChange={(event) => updateField('email', event.target.value)}
        />
        {errors.email && <AuthFormNotice>{errors.email}</AuthFormNotice>}
      </AuthField>

      <AuthField id="password" label="Senha" required>
        <AuthPasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          placeholder="Digite sua senha"
          required
          value={form.password}
          onChange={(event) => updateField('password', event.target.value)}
        />
        {errors.password && <AuthFormNotice>{errors.password}</AuthFormNotice>}
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
        disabled={isSubmitting}
        className="h-10 w-full rounded-sm bg-sky-800 text-sm font-medium text-white hover:bg-sky-900"
      >
        {isSubmitting ? 'Entrando...' : 'Entrar'}
      </Button>

      {submitError && <AuthFormNotice>{submitError}</AuthFormNotice>}
    </form>
  )
}
