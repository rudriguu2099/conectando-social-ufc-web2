import { Button } from '@/components/ui/button'
import AuthField from '@/features/auth/components/AuthField'
import AuthFormNotice from '@/features/auth/components/AuthFormNotice'
import AuthInput from '@/features/auth/components/AuthInput'
import AuthPasswordInput from '@/features/auth/components/AuthPasswordInput'
import AuthSelect from '@/features/auth/components/AuthSelect'
import { CURSOS, type FormAlunoData } from './types'
import { useFormAluno } from './useFormAluno'

export default function FormAluno() {
  const {
    form,
    errors,
    isSubmitting,
    submitError,
    updateField,
    handleSubmit,
  } = useFormAluno()

  return (
    <form className="space-y-3" action={handleSubmit}>
      <AuthField id="aluno-name" label="Nome completo" required>
        <AuthInput
          id="aluno-name"
          name="name"
          autoComplete="name"
          placeholder="Seu nome"
          required
          value={form.name}
          onChange={(event) => updateField('name', event.target.value)}
        />
        {errors.name && (
          <AuthFormNotice>{errors.name}</AuthFormNotice>
        )}
      </AuthField>

      <AuthField id="aluno-email" label="E-mail" required>
        <AuthInput
          id="aluno-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="seu.email@ufc.br"
          required
          value={form.email}
          onChange={(event) => updateField('email', event.target.value)}
        />
        {errors.email && (
          <AuthFormNotice>{errors.email}</AuthFormNotice>
        )}
      </AuthField>

      <AuthField id="aluno-password" label="Senha" required>
        <AuthPasswordInput
          id="aluno-password"
          name="password"
          autoComplete="new-password"
          minLength={8}
          placeholder="********"
          required
          value={form.password}
          onChange={(event) => updateField('password', event.target.value)}
        />
        {errors.password && (
          <AuthFormNotice>{errors.password}</AuthFormNotice>
        )}
      </AuthField>

      <AuthField id="aluno-course" label="Curso" required>
        <AuthSelect
          id="aluno-course"
          name="course"
          value={form.course}
          onChange={(event) =>
            updateField('course', event.target.value as FormAlunoData['course'])
          }
          required
        >
          <option value="" disabled>
            Selecione seu curso
          </option>
          {CURSOS.map((curso) => (
            <option key={curso} value={curso}>
              {curso}
            </option>
          ))}
        </AuthSelect>
        {errors.course && (
          <AuthFormNotice>{errors.course}</AuthFormNotice>
        )}
      </AuthField>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-10 w-full rounded-sm bg-sky-800 text-sm font-medium text-white hover:bg-sky-900"
      >
        {isSubmitting ? 'Criando conta...' : 'Criar conta'}
      </Button>

      {submitError && (
        <AuthFormNotice>{submitError}</AuthFormNotice>
      )}

    </form>
  )
}