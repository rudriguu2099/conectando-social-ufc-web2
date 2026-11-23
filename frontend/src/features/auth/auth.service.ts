import axios from 'axios'
import { httpClient } from '@/service/httpClient'
import { localStorageKeys } from '@/app/config/localStorageKeys'

export interface SignupSession {
  accessToken: string
}

export type StudentSignupPayload = {
  role: 'STUDENT'
  name: string
  email: string
  password: string
  course: string
}

export type PartnerSignupPayload = {
  role: 'PARTNER'
  name: string
  email: string
  password: string
  organization: string
  partnerType: string
  phone: string
  termsAccepted: true
}

export type SignupPayload =
  | StudentSignupPayload
  | PartnerSignupPayload

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

export function getSignupErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    return error.response?.data.error ?? 'Não foi possível criar a conta.'
  }
  return 'Não foi possível criar a conta. Tente novamente.'
}
