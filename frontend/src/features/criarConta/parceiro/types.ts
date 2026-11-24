export const TIPOS_PARCEIRO = [
  'ONG',
  'Associação',
  'Coletivo',
  'Cooperativa',
  'Escola',
  'Pequeno negócio',
  'Empresa',
  'Setor da UFC',
  'Órgão público',
  'Outro',
] as const

export type TipoParceiro = (typeof TIPOS_PARCEIRO)[number]

export interface FormParceiroData {
  role: 'PARTNER'
  name: string
  email: string
  password: string
  organization: string
  partnerType: TipoParceiro | ''
  phone: string
  termsAccepted: boolean
}
