import { Link } from 'react-router-dom'
import AuthSubmitButton from '@/features/auth/components/AuthSubmitButton'
import { Checkbox } from '@/components/ui/checkbox'
import AuthField from '@/features/auth/components/AuthField'
import AuthFormNotice from '@/features/auth/components/AuthFormNotice'
import AuthInput from '@/features/auth/components/AuthInput'
import AuthPasswordInput from '@/features/auth/components/AuthPasswordInput'
import AuthSelect from '@/features/auth/components/AuthSelect'
import {
  TIPOS_PARCEIRO,
  type FormParceiroData,
} from './types'
import { useFormParceiro } from './useFormParceiro'

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
    <form className="space-y-5" action={handleSubmit}>
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

      <AuthField id="parceiro-email" label="E-mail" required>
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

      <AuthField id="parceiro-password" label="Senha" required>
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

      <AuthField id="parceiro-type" label="Tipo de parceiro" required>
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

      <div className="space-y-3 pt-2">
        <label
          htmlFor="terms"
          className="flex items-center gap-3 text-lg text-neutral-800"
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
        <p className="font-serif text-base leading-6 text-neutral-700">
          Os projetos são feitos por estudantes, sem custo, no ritmo do
          semestre e podem terminar como protótipo. Seus dados são tratados
          para aparecerem para professores e alunos.
        </p>
        <Link
          to="/termos"
          className="block font-serif text-base text-neutral-800 underline"
        >
          Ler o termo completo
        </Link>
      </div>

      <AuthSubmitButton
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Criando conta...' : 'Criar conta'}
      </AuthSubmitButton>

      {submitError && (
        <AuthFormNotice>{submitError}</AuthFormNotice>
      )}

    </form>
  )
}
