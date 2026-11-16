import type { Request, Response, NextFunction } from 'express'

export class HttpError extends Error {
  status: number
  headers: Record<string, string>

  constructor(status: number, message: string, headers: Record<string, string> = {}) {
    super(message)
    this.status = status
    this.headers = headers
  }
}

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof HttpError) return res.status(err.status).set(err.headers).json({ error: err.message })
  // for malformed JSON, payload too large
  const status = (err as { status?: number }).status
  if (status && status < 500) return res.status(status).json({ error: 'Requisição inválida.' })
  console.error(err)
  res.status(500).json({ error: 'Erro interno. Tente de novo.' })
}
