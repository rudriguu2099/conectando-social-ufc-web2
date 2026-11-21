
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import AuthField from '@/features/auth/components/AuthField'
import AuthFormNotice from '@/features/auth/components/AuthFormNotice'

function CriarConta() {
  const [notice, setNotice] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    if (formData.get('password') !== formData.get('confirmPassword')) {
      setNotice('As senhas informadas não coincidem.')
      return
    }

    setNotice('A criação de conta ainda não está conectada ao backend.')
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">Criar conta</h2>
        <p className="text-sm text-neutral-500">
          Preencha seus dados para se cadastrar.
        </p>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <AuthField id="name" label="Nome completo">
          <Input
            id="name"
            name="name"
            autoComplete="name"
            placeholder="Seu nome"
            required
            className="h-10 rounded-sm border-neutral-400 px-3 text-sm shadow-none focus-visible:border-sky-800 focus-visible:ring-sky-800/20"
          />
        </AuthField>

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
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            placeholder="Mínimo de 8 caracteres"
            required
            className="h-10 rounded-sm border-neutral-400 px-3 text-sm shadow-none focus-visible:border-sky-800 focus-visible:ring-sky-800/20"
          />
        </AuthField>

        <AuthField id="confirmPassword" label="Confirmar senha">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            placeholder="Digite a senha novamente"
            required
            className="h-10 rounded-sm border-neutral-400 px-3 text-sm shadow-none focus-visible:border-sky-800 focus-visible:ring-sky-800/20"
          />
        </AuthField>

        <Button
          type="submit"
          className="h-10 w-full rounded-sm bg-sky-800 text-sm font-medium text-white hover:bg-sky-900"
        >
          Criar conta
        </Button>

        {notice && <AuthFormNotice>{notice}</AuthFormNotice>}
      </form>

      <p className="text-center text-sm text-neutral-600">
        Já tem uma conta?{' '}
        <Link
          to="/"
          className="font-medium text-neutral-900 underline underline-offset-2 hover:text-sky-800"
        >
          Entrar
        </Link>
      </p>
    </div>
  )
}

export default CriarConta