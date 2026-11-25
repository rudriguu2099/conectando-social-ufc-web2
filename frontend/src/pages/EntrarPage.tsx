import { Link, useLocation } from 'react-router-dom'
import AuthFormNotice from '@/features/auth/components/AuthFormNotice'
import FormEntrar from '@/features/entrar/FormEntrar'

export default function EntrarPage() {
  const { state } = useLocation()
  return (
    <div className="space-y-5">
      <h2 className="font-serif text-[30px] font-bold leading-tight">Entrar</h2>
      {state?.passwordResetSuccess === true && (
        <AuthFormNotice>Senha alterada com sucesso. Entre com sua nova senha.</AuthFormNotice>
      )}
      <FormEntrar />

      <div className="space-y-8 pt-2 text-center">
        <Link
          to="/criar-conta"
          className="inline-block text-base font-medium text-neutral-900 hover:text-sky-800"
        >
          Criar conta
        </Link>
        <p className="text-sm leading-6 text-neutral-500">
          Professores recebem a conta da coordenação do curso.
        </p>
      </div>
    </div>
  )
}
