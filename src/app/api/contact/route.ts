/* ══════════════════════════════════════════
   POST /api/contact
   ──────────────────────────────────────────
   Recebe submissão do formulário de contato e envia email via Resend.

   STATUS: STUB PRONTO PARA RESEND
   ──────────────────────────────────────────
   Para ativar o envio real:

   1. Instalar dependência:
      npm install resend

   2. Adicionar no .env.local:
      RESEND_API_KEY=re_xxxxxxxxxx
      RESEND_FROM_EMAIL=contato@originalfilter.com   (email validado no Resend)
      RESEND_TO_EMAIL=contato@originalfilter.com     (destinatário interno)

   3. Descomentar o bloco "RESEND IMPLEMENTATION" abaixo

   4. Verificar domínio no painel Resend (DNS: SPF, DKIM, DMARC)

   Enquanto não configurado, a API loga no console e retorna sucesso —
   útil para validar UX do formulário sem envio real.
   ══════════════════════════════════════════ */

import { NextResponse, type NextRequest } from 'next/server';
import { CONTACT } from '@/lib/constants';

export const runtime = 'nodejs';

interface ContactPayload {
  subject: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  message: string;
  // Contexto opcional (vindo de query params em outras páginas)
  context?: {
    produto?: string;
    codigo?: string;
    page?: string;
  };
  // Honeypot anti-spam (campo invisível que humanos não preenchem)
  website?: string;
}

const SUBJECT_LABELS: Record<string, string> = {
  comercial: 'Atendimento Comercial',
  tecnico: 'Suporte Técnico',
  garantia: 'Solicitação de Garantia',
  'logistica-reversa': 'Logística Reversa',
  'programa-devolucao': 'Programa de Devolução',
  revendedor: 'Programa de Revendedor',
  cross_reference: 'Conversão de Código (Cross-Reference)',
  outro: 'Outro Assunto',
};

function validatePayload(data: unknown): data is ContactPayload {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.subject === 'string' &&
    typeof d.name === 'string' &&
    d.name.trim().length >= 2 &&
    typeof d.email === 'string' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email) &&
    typeof d.message === 'string' &&
    d.message.trim().length >= 10
  );
}

function buildEmailHtml(payload: ContactPayload): string {
  const subjectLabel = SUBJECT_LABELS[payload.subject] ?? payload.subject;
  const ctx = payload.context ?? {};

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Novo contato — Original Filter</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #e5e5e5;">
          <!-- Header -->
          <tr>
            <td style="background:#0A0A0A;padding:24px 32px;border-bottom:4px solid #FFD700;">
              <div style="color:#FFD700;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-family:'Courier New',monospace;font-weight:700;">
                Novo contato recebido
              </div>
              <div style="color:#ffffff;font-size:22px;font-weight:900;margin-top:8px;letter-spacing:-0.5px;">
                ${subjectLabel}
              </div>
            </td>
          </tr>

          <!-- Dados do contato -->
          <tr>
            <td style="padding:32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#6b6b6b;font-family:'Courier New',monospace;padding-bottom:4px;">Nome</td>
                </tr>
                <tr>
                  <td style="font-size:16px;color:#0A0A0A;padding-bottom:20px;border-bottom:1px solid #f0f0f0;">${escapeHtml(payload.name)}</td>
                </tr>

                ${
                  payload.company
                    ? `
                <tr>
                  <td style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#6b6b6b;font-family:'Courier New',monospace;padding-top:16px;padding-bottom:4px;">Empresa</td>
                </tr>
                <tr>
                  <td style="font-size:16px;color:#0A0A0A;padding-bottom:20px;border-bottom:1px solid #f0f0f0;">${escapeHtml(payload.company)}</td>
                </tr>`
                    : ''
                }

                <tr>
                  <td style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#6b6b6b;font-family:'Courier New',monospace;padding-top:16px;padding-bottom:4px;">Email</td>
                </tr>
                <tr>
                  <td style="font-size:16px;color:#0A0A0A;padding-bottom:20px;border-bottom:1px solid #f0f0f0;">
                    <a href="mailto:${escapeHtml(payload.email)}" style="color:#0A0A0A;text-decoration:none;">${escapeHtml(payload.email)}</a>
                  </td>
                </tr>

                ${
                  payload.phone
                    ? `
                <tr>
                  <td style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#6b6b6b;font-family:'Courier New',monospace;padding-top:16px;padding-bottom:4px;">Telefone</td>
                </tr>
                <tr>
                  <td style="font-size:16px;color:#0A0A0A;padding-bottom:20px;border-bottom:1px solid #f0f0f0;font-family:'Courier New',monospace;">${escapeHtml(payload.phone)}</td>
                </tr>`
                    : ''
                }

                ${
                  ctx.produto
                    ? `
                <tr>
                  <td style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#6b6b6b;font-family:'Courier New',monospace;padding-top:16px;padding-bottom:4px;">Produto consultado</td>
                </tr>
                <tr>
                  <td style="font-size:16px;color:#FFD700;background:#0A0A0A;padding:8px 12px;font-family:'Courier New',monospace;font-weight:700;">${escapeHtml(ctx.produto)}</td>
                </tr>`
                    : ''
                }

                ${
                  ctx.codigo
                    ? `
                <tr>
                  <td style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#6b6b6b;font-family:'Courier New',monospace;padding-top:16px;padding-bottom:4px;">Código pesquisado</td>
                </tr>
                <tr>
                  <td style="font-size:16px;color:#FFD700;background:#0A0A0A;padding:8px 12px;font-family:'Courier New',monospace;font-weight:700;">${escapeHtml(ctx.codigo)}</td>
                </tr>`
                    : ''
                }

                <tr>
                  <td style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#6b6b6b;font-family:'Courier New',monospace;padding-top:24px;padding-bottom:8px;">Mensagem</td>
                </tr>
                <tr>
                  <td style="font-size:15px;line-height:1.6;color:#0A0A0A;padding:16px;background:#fafafa;border-left:3px solid #FFD700;white-space:pre-wrap;">${escapeHtml(payload.message)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#fafafa;padding:20px 32px;border-top:1px solid #e5e5e5;font-size:11px;color:#6b6b6b;text-align:center;letter-spacing:1px;text-transform:uppercase;font-family:'Courier New',monospace;">
              Original Filter · Cotia · SP · Brasil
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Honeypot anti-spam: se preencheu o campo "website" (invisível), é bot
    if (data?.website && typeof data.website === 'string' && data.website.length > 0) {
      // Retorna sucesso falso para não dar pista pro bot
      return NextResponse.json({ success: true });
    }

    if (!validatePayload(data)) {
      return NextResponse.json(
        { error: 'Dados inválidos. Verifique nome, email e mensagem.' },
        { status: 400 },
      );
    }

    const html = buildEmailHtml(data);
    const subjectLabel = SUBJECT_LABELS[data.subject] ?? data.subject;
    const emailSubject = `[${subjectLabel}] Contato — ${data.name}`;

    // ─── RESEND IMPLEMENTATION ──────────────────────────────
    // Descomente o bloco abaixo após:
    //  1. npm install resend
    //  2. configurar RESEND_API_KEY, RESEND_FROM_EMAIL, RESEND_TO_EMAIL no .env.local
    //  3. verificar domínio no painel Resend (DNS SPF/DKIM)
    //
    // import { Resend } from 'resend';
    //
    // if (process.env.RESEND_API_KEY) {
    //   const resend = new Resend(process.env.RESEND_API_KEY);
    //   const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'contato@originalfilter.com';
    //   const toEmail = process.env.RESEND_TO_EMAIL ?? CONTACT.email;
    //
    //   const { error: resendError } = await resend.emails.send({
    //     from: `Original Filter <${fromEmail}>`,
    //     to: [toEmail],
    //     replyTo: data.email,
    //     subject: emailSubject,
    //     html,
    //   });
    //
    //   if (resendError) {
    //     console.error('[contact] Resend error:', resendError);
    //     return NextResponse.json(
    //       { error: 'Falha ao enviar email. Tente novamente.' },
    //       { status: 500 },
    //     );
    //   }
    // }
    // ────────────────────────────────────────────────────────

    // Modo desenvolvimento / sem Resend: log no console
    console.log('[contact] STUB — submission received:', {
      to: CONTACT.email,
      subject: emailSubject,
      from: data.email,
      name: data.name,
      message: data.message.slice(0, 100) + '...',
    });
    console.log('[contact] HTML preview (first 200 chars):', html.slice(0, 200));

    return NextResponse.json({
      success: true,
      message: 'Mensagem recebida. Em breve nossa equipe entrará em contato.',
    });
  } catch (err) {
    console.error('[contact] error:', err);
    return NextResponse.json({ error: 'Erro ao processar solicitação.' }, { status: 500 });
  }
}
