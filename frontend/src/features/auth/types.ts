export interface SignupSession {
  accessToken: string
}

export interface LoginSession {
  accessToken: string
}

export type LoginPayload = {
  email: string
  password: string
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

export type ResetPasswordPayload = {
  token: string
  password: string
}
