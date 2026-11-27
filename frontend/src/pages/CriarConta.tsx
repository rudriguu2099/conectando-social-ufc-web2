import { useState } from 'react'
import { Link } from 'react-router-dom'
import FormAluno from '@/features/criarConta/aluno/FormAluno'
import FormParceiro from '@/features/criarConta/parceiro/FormParceiro'

type TipoConta = 'aluno' | 'parceiro'

export default function CriarConta() {
  const [conta, setConta] = useState<TipoConta>('aluno')

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">Criar conta</h2>

      <div className="grid grid-cols-2 border-b border-neutral-300">
        <button
          type="button"
          onClick={() => setConta('aluno')}
          className={
            conta === 'aluno'
              ? 'border-b-2 border-neutral-950 py-2.5 text-sm font-semibold text-neutral-950'
              : 'py-2.5 text-sm text-neutral-600'
          }
        >
          Sou aluno
        </button>
        <button
          type="button"
          onClick={() => setConta('parceiro')}
          className={
            conta === 'parceiro'
              ? 'border-b-2 border-neutral-950 py-2.5 text-sm font-semibold text-neutral-950'
              : 'py-2.5 text-sm text-neutral-600'
          }
        >
          Sou parceiro
        </button>
      </div>

      {conta === 'aluno' ? <FormAluno /> : <FormParceiro />}

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
