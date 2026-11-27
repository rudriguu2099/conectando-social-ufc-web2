import { ArrowLeft, Info, Users } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import AppHeader from '@/components/layout/AppHeader'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const [notice, setNotice] = useState(false)

  return (
    <div className="min-h-screen bg-white font-serif text-slate-950">
      <AppHeader />

      <main className="mx-auto max-w-5xl px-5 py-7 sm:px-8 sm:py-9">
        <Link
          to="/home"
          className="mb-5 inline-flex items-center gap-1 text-sm text-slate-700 underline underline-offset-2 hover:text-sky-800"
        >
          <ArrowLeft aria-hidden="true" size={16} />
          Vitrine
        </Link>

        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-sky-800">Disponível</p>
        <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          Site para divulgar as oficinas da Associação Vida Nova
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Associação Vida Nova · ONG · atualizado há 2 dias
        </p>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(280px,1fr)]">
          <section
            aria-label="Detalhes do projeto"
            className="rounded-md border border-slate-200 p-5 sm:p-6"
          >
            <dl className="space-y-4 text-sm leading-6">
              <div>
                <dt className="font-semibold">Qual é o problema</dt>
                <dd className="text-slate-800">
                  As oficinas de artesanato e de reforço escolar são só divulgadas no boca a boca, e
                  muitas vagas ficam vazias.
                </dd>
              </div>
              <div>
                <dt className="font-semibold">Quem é afetado</dt>
                <dd className="text-slate-800">
                  Cerca de 120 famílias do bairro atendidas pela associação.
                </dd>
              </div>
              <div>
                <dt className="font-semibold">O que seria um bom resultado</dt>
                <dd className="text-slate-800">
                  Um site simples com a agenda das oficinas e um formulário de inscrição.
                </dd>
              </div>
              <div>
                <dt className="font-semibold">Disponibilidade para reuniões</dt>
                <dd className="text-slate-800">Terças e quintas à tarde.</dd>
              </div>
            </dl>

            <div className="mt-5 border-t border-slate-200 pt-4">
              <h2 className="text-sm font-semibold">Contato do parceiro</h2>
              <div className="mt-3 flex items-center gap-3">
                <div
                  aria-hidden="true"
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm text-white"
                >
                  MS
                </div>
                <div className="text-sm">
                  <p className="font-medium">Maria Souza</p>
                  <p className="text-xs text-slate-500">maria@vidanova.org · (85) 90000-0000</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">Visível só para alunos e professores.</p>
            </div>
          </section>

          <aside className="rounded-md border border-slate-200 p-5">
            <h2 className="text-sm font-semibold">Equipe</h2>
            <p className="mt-3 text-sm text-slate-600">Este projeto ainda não tem equipe.</p>

            <div className="mt-4 flex gap-3 bg-slate-100 p-3 font-sans text-sm leading-5 text-slate-800">
              <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <p>Para assumir este projeto, monte uma equipe e indique o professor responsável.</p>
            </div>

            <Button
              type="button"
              onClick={() => setNotice(true)}
              className="mt-4 h-10 w-full rounded-sm bg-sky-800 font-sans text-sm font-medium text-white hover:bg-sky-900"
            >
              <Users aria-hidden="true" />
              Candidatar equipe
            </Button>
            {notice && (
              <p role="status" className="mt-3 text-sm text-slate-600">
                A candidatura de equipes estará disponível em breve.
              </p>
            )}
          </aside>
        </div>
      </main>
    </div>
  )
}
