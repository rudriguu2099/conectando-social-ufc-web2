import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-4xl font-bold">Página não encontrada</h1>
      <p className="text-muted-foreground">O endereço acessado não corresponde a uma página.</p>
      <Link to="/" className="text-primary underline underline-offset-4">
        Voltar ao início
      </Link>
    </main>
  )
}
