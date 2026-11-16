import type { Request, Response } from 'express'
import { HttpError } from '../../lib/http-error.ts'
import * as authService from './auth.service.ts'
import { parseLogin, parseSignup } from './auth.validation.ts'
import { REFRESH_TTL_MS } from './tokens.ts'

const REFRESH_COOKIE = 'refreshToken'
const cookieOptions = {
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  path: '/api/auth',
} as const

// refresh token goes in an httpOnly cookie, the rest in the body
function sendSession(res: Response, { refreshToken, ...body }: authService.Session, status = 200) {
  res.cookie(REFRESH_COOKIE, refreshToken, { ...cookieOptions, maxAge: REFRESH_TTL_MS })
  res.status(status).json(body)
}

function readRefreshCookie(req: Request) {
  return req.headers.cookie?.match(new RegExp(`(?:^|;\\s*)${REFRESH_COOKIE}=([^;]+)`))?.[1]
}

export async function signup(req: Request, res: Response) {
  sendSession(res, await authService.signup(parseSignup(req.body ?? {})), 201)
}

export async function login(req: Request, res: Response) {
  const { email, password } = parseLogin(req.body ?? {})
  sendSession(res, await authService.login(email, password, req.ip ?? ''))
}

export async function refresh(req: Request, res: Response) {
  try {
    sendSession(res, await authService.refresh(readRefreshCookie(req)))
  } catch (e) {
    if (e instanceof HttpError) res.clearCookie(REFRESH_COOKIE, cookieOptions)
    throw e
  }
}

export async function logout(req: Request, res: Response) {
  await authService.logout(readRefreshCookie(req))
  res.clearCookie(REFRESH_COOKIE, cookieOptions)
  res.status(204).end()
}
