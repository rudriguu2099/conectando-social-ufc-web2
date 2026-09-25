import { useEffect, useState } from 'react'

export default function App() {
  const [status, setStatus] = useState<string>('...')

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((d) => setStatus(d.ok ? 'ok' : 'erro'))
      .catch(() => setStatus('erro'))
  }, [])

  return (
    <main>
      <h1>Conectando Social UFC</h1>
      <p>API: {status}</p>
    </main>
  )
}
