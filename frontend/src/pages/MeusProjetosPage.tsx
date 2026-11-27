import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import AppHeader from '@/components/layout/AppHeader'

export default function MeusProjetosPage() {
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

        <h1 className="mt-6 text-4xl font-bold">Meus projetos</h1>

        <p className="mt-3 text-base text-slate-600">Acompanhe os projetos que você participa.</p>

        <section
          aria-label="Lista de projetos"
          className="mt-8 rounded-md border border-slate-200 p-8 text-center"
        >
          <h2 className="text-xl font-semibold">Você ainda não participa de projetos</h2>

          <p className="mt-2 text-slate-600">
            Explore a aba de vitrine para conhecer as oportunidades disponíveis.
          </p>

          <Link
            to="/home"
            className="mt-6 inline-block bg-sky-800 px-6 py-3 font-sans text-sm font-medium text-white hover:bg-sky-900"
          >
            Explorar vitrine
          </Link>
        </section>
      </main>
    </div>
  )
}
