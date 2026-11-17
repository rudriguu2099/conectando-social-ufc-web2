import nodemailer, { type Transporter } from 'nodemailer'

export type Mail = { to: string; subject: string; text: string; html: string }

// without SMTP_HOST (tests, or dev without email) mails are only printed and kept here
export const devOutbox: Mail[] = []

let transport: Transporter | undefined

export async function sendMail(mail: Mail) {
  const { SMTP_HOST, SMTP_PORT = '465', SMTP_USER, SMTP_PASS, MAIL_FROM = SMTP_USER } = process.env
  if (!SMTP_HOST) {
    devOutbox.push(mail)
    console.log(`[mail] para ${mail.to}: ${mail.subject}\n${mail.text}`)
    return
  }
  transport ??= nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_PORT === '465',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })
  await transport.sendMail({ from: MAIL_FROM, ...mail })
}

const HTML_ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
export const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c])
