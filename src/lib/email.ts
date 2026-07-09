/**
 * Envio de e-mails via Resend (API REST, sem SDK).
 * Tolerante: se RESEND_API_KEY não estiver configurada, apenas registra e
 * segue — o app continua funcionando sem e-mail.
 */

const FROM = process.env.EMAIL_FROM || "Connexa <onboarding@resend.dev>";

type EmailInput = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: EmailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[email] (não enviado — sem RESEND_API_KEY) para ${to}: ${subject}`);
    return;
  }
  if (!to) return;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });
    if (!res.ok) {
      console.error("[email] falha ao enviar:", res.status, await res.text());
    }
  } catch (e) {
    console.error("[email] erro:", e);
  }
}

/** Layout HTML simples com a identidade Connexa */
export function emailLayout(titulo: string, corpo: string, cta?: { label: string; url: string }): string {
  return `
  <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 480px; margin: 0 auto; background:#f8fafc; padding: 24px; border-radius: 16px;">
    <div style="text-align:center; margin-bottom: 16px;">
      <span style="font-size: 22px; font-weight: 800; color:#6d28d9;">Connexa</span>
    </div>
    <div style="background:#fff; border-radius: 16px; padding: 24px;">
      <h1 style="font-size: 18px; color:#0f172a; margin: 0 0 12px;">${titulo}</h1>
      <div style="font-size: 14px; color:#475569; line-height: 1.5;">${corpo}</div>
      ${
        cta
          ? `<div style="margin-top: 20px;"><a href="${cta.url}" style="display:inline-block; background:#6d28d9; color:#fff; text-decoration:none; padding: 12px 20px; border-radius: 999px; font-size: 14px; font-weight: 600;">${cta.label}</a></div>`
          : ""
      }
    </div>
    <p style="text-align:center; font-size: 12px; color:#94a3b8; margin-top: 16px;">Conecta. Facilita. Transforma.</p>
  </div>`;
}
