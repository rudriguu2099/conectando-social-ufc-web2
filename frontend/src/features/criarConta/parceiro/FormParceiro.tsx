import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import AuthField from '@/features/auth/components/AuthField'
import AuthFormNotice from '@/features/auth/components/AuthFormNotice'
import AuthInput from '@/features/auth/components/AuthInput'
import AuthPasswordInput from '@/features/auth/components/AuthPasswordInput'
import AuthSelect from '@/features/auth/components/AuthSelect'
import {
  TIPOS_PARCEIRO,
  useFormParceiro,
  type FormParceiroData,
} from './useFormParceiro'

export default function FormParceiro() {
  const {
    form,
    errors,
    isSubmitting,
    submitError,
    updateField,
    handleSubmit,
  } = useFormParceiro()

  return (
    <form className="space-y-3" action={handleSubmit}>
      <AuthField
        id="parceiro-name"
        label="Nome do responsável"
        required
      >
        <AuthInput
          id="parceiro-name"
          name="name"
          autoComplete="name"
          placeholder="Maria Souza"
          required
          value={form.name}
          onChange={(event) => updateField('name', event.target.value)}
        />
        {errors.name && (
          <AuthFormNotice>{errors.name}</AuthFormNotice>
        )}
      </AuthField>

      <AuthField id="parceiro-email" label="E-mail">
        <AuthInput
          id="parceiro-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="maria@vidanova.org"
          required
          value={form.email}
          onChange={(event) => updateField('email', event.target.value)}
        />
        {errors.email && (
          <AuthFormNotice>{errors.email}</AuthFormNotice>
        )}
      </AuthField>

      <AuthField id="parceiro-password" label="Senha">
        <AuthPasswordInput
          id="parceiro-password"
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

      <AuthField
        id="parceiro-organization"
        label="Organização"
        required
      >
        <AuthInput
          id="parceiro-organization"
          name="organization"
          placeholder="Associação Vida Nova"
          required
          value={form.organization}
          onChange={(event) =>
            updateField('organization', event.target.value)
          }
        />
        {errors.organization && (
          <AuthFormNotice>{errors.organization}</AuthFormNotice>
        )}
      </AuthField>

      <AuthField id="parceiro-type" label="Tipo de parceiro">
        <AuthSelect
          id="parceiro-type"
          name="partnerType"
          value={form.partnerType}
          onChange={(event) =>
            updateField(
              'partnerType',
              event.target.value as FormParceiroData['partnerType'],
            )
          }
          required
        >
          <option value="" disabled>
            Selecione o tipo de parceiro
          </option>
          {TIPOS_PARCEIRO.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </AuthSelect>
        {errors.partnerType && (
          <AuthFormNotice>{errors.partnerType}</AuthFormNotice>
        )}
      </AuthField>

      <AuthField id="parceiro-phone" label="Telefone ou WhatsApp">
        <AuthInput
          id="parceiro-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="(85) 90000-0000"
          value={form.phone}
          onChange={(event) => updateField('phone', event.target.value)}
        />
      </AuthField>

      <div className="space-y-2 pt-1">
        <label
          htmlFor="terms"
          className="flex items-center gap-2 text-xs text-neutral-800"
        >
          <Checkbox
            id="terms"
            name="terms"
            required
            checked={form.termsAccepted}
            onCheckedChange={(checked) =>
              updateField('termsAccepted', checked === true)
            }
          />
          Li e aceito o termo de ciência
        </label>
        {errors.termsAccepted && (
          <AuthFormNotice>{errors.termsAccepted}</AuthFormNotice>
        )}
        <p className="text-xs leading-5 text-neutral-500">
          Os projetos são feitos por estudantes, sem custo, no ritmo do
          semestre e podem terminar como protótipo. Seus dados são tratados
          para aparecerem para professores e alunos.
        </p>
        <Link
          to="/termos"
          className="block text-xs font-medium text-neutral-800 underline"
        >
          Ler o termo completo
        </Link>
      </div>

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
