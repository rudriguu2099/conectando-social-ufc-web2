import axios from 'axios'
import { httpClient } from '@/service/httpClient'
import { localStorageKeys } from '@/app/config/localStorageKeys'
import type {
  LoginPayload,
  LoginSession,
  ResetPasswordPayload,
  SignupPayload,
  SignupSession,
} from './types'

export async function login(payload: LoginPayload) {
  const { data: session } = await httpClient.post<LoginSession>(
    '/auth/login',
    payload,
    { withCredentials: true },
  )
  localStorage.setItem(
    localStorageKeys.ACCESS_TOKEN,
    session.accessToken,
  )
  return session
}

export async function signup(payload: SignupPayload) {
  const { data: session } = await httpClient.post<SignupSession>(
    '/auth/signup',
    payload,
    { withCredentials: true },
  )
  localStorage.setItem(
    localStorageKeys.ACCESS_TOKEN,
    session.accessToken,
  )
  return session
}

export function getLoginErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    if (error.response?.data.error) {
      return error.response.data.error
    }
    if (error.response?.status === 401) {
      return 'E-mail ou senha incorretos.'
    }
    if (error.response?.status === 429) {
      return 'Muitas tentativas. Tente novamente mais tarde.'
    }
  }
  return 'Não foi possível entrar. Tente novamente.'
}

export function getSignupErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    return error.response?.data.error ?? 'Não foi possível criar a conta.'
  }
  return 'Não foi possível criar a conta. Tente novamente.'
}

export async function resetPassword(payload: ResetPasswordPayload) {
  await httpClient.post('/auth/reset-password', payload)
  localStorage.removeItem(localStorageKeys.ACCESS_TOKEN)
}

export function getResetPasswordErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    return error.response?.data.error ??
      'Não foi possível salvar a senha. Tente novamente.'
  }
  return 'Não foi possível salvar a senha. Verifique sua conexão e tente novamente.'
}

export async function forgotPassword(email: string) {
  await httpClient.post('/auth/forgot-password', { email })
}
