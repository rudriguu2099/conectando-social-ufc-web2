import { escapeHtml, type Mail } from '../../lib/mailer.ts'

export function passwordResetEmail(user: { name: string; email: string }, link: string): Mail {
  const subject = 'Crie uma senha nova'
  const text = [
    `Olá, ${user.name}.`,
    `Recebemos um pedido para trocar a senha da conta ${user.email} no Conectando Social UFC.`,
    `Criar senha nova: ${link}`,
    'O link vale por 1 hora e só funciona uma vez.',
    'Não pediu a troca? Ignore este e-mail: sua senha continua a mesma.',
  ].join('\n\n')

  const html = `
<div style="font-family: Georgia, 'Times New Roman', serif; color: #333333; max-width: 480px">
  <div style="background: #01000D; color: #ffffff; padding: 16px; font-size: 18px; text-align: center">Conectando Social</div>
  <h1 style="color: #01000D; font-size: 22px">Crie uma senha nova</h1>
  <p>Olá, ${escapeHtml(user.name)}. Recebemos um pedido para trocar a senha da conta <b>${escapeHtml(user.email)}</b> no Conectando Social UFC.</p>
  <p><a href="${escapeHtml(link)}" style="display: inline-block; background: #005C8A; color: #ffffff; padding: 12px 24px; text-decoration: none; font-family: Roboto, Arial, sans-serif">Criar senha nova</a></p>
  <p style="color: #696969; font-size: 14px">O link vale por 1 hora e só funciona uma vez.</p>
  <hr style="border: none; border-top: 1px solid #CCCCCC">
  <p style="color: #696969; font-size: 14px">Não pediu a troca? Ignore este e-mail: sua senha continua a mesma.</p>
</div>`

  return { to: user.email, subject, text, html }
}
