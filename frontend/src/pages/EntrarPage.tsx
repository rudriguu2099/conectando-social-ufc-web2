import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import AuthField from '@/features/auth/components/AuthField'
import AuthFormNotice from '@/features/auth/components/AuthFormNotice'
import AuthInput from '@/features/auth/components/AuthInput'
import AuthPasswordInput from '@/features/auth/components/AuthPasswordInput'

export default function EntrarPage() {
  const [notice, setNotice] = useState<string | null>(null)

  function handleSubmit() {
    setNotice('A autenticação ainda não está conectada ao backend.')
  }

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold tracking-tight">Entrar</h2>

      <form className="space-y-3" action={handleSubmit}>
        <AuthField id="email" label="E-mail">
          <AuthInput
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="seu.email@ufc.br"
            required
          />
        </AuthField>

        <AuthField id="password" label="Senha">
          <AuthPasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            placeholder="Digite sua senha"
            required
          />
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
