// web/lib/email.ts

type SendEmailInput = {
    to: string | string[];
    subject: string;
    html: string;
    from?: string;
  };
  
  type EmailResult =
    | { ok: true; id?: string }
    | { ok: false; skipped?: boolean; error?: string };
  
  /**
   * Safe email sender.
   * - If RESEND_API_KEY is missing, logs and no-ops (never throws during build).
   * - Lazily imports Resend so nothing runs at module load.
   */
  export async function sendEmail({
    to,
    subject,
    html,
    from,
  }: SendEmailInput): Promise<EmailResult> {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("[email] RESEND_API_KEY missing — skipping email send");
      return { ok: false, skipped: true };
    }
  
    // Lazy import (avoids constructor at build time)
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
  
    const fromAddr = from || process.env.RESEND_FROM || "no-reply@sugarpro.app";
  
    // The SDK returns { data: { id } | null, error: { message } | null }
    const result: { data: { id: string } | null; error: { message: string } | null } =
      await resend.emails.send({
        from: fromAddr,
        to,
        subject,
        html,
      });
  
    if (result.error) {
      console.error("[email] resend error:", result.error.message);
      return { ok: false, error: result.error.message };
    }
  
    return { ok: true, id: result.data?.id };
  }
  