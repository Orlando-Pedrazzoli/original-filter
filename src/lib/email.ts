import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface ContactEmailData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

const SUBJECT_LABELS: Record<string, string> = {
  duvidas: 'Dúvidas',
  orcamento: 'Orçamento',
  elogios: 'Elogios',
  sugestoes: 'Sugestões',
  reclamacoes: 'Reclamações',
};

/**
 * Send notification email to admin when a new contact form is submitted
 */
export async function sendContactNotification(data: ContactEmailData) {
  const subjectLabel = SUBJECT_LABELS[data.subject] || data.subject;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #000; padding: 20px; text-align: center;">
        <h1 style="color: #FFD700; margin: 0; font-size: 24px;">ORIGINAL FILTER</h1>
        <p style="color: #9CA3AF; margin: 4px 0 0; font-size: 12px;">Nova mensagem do site</p>
      </div>
      
      <div style="padding: 24px; background: #F5F5F5;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; color: #4B5563; width: 120px;">Nome:</td>
            <td style="padding: 8px 12px; color: #1A1A1A;">${data.name}</td>
          </tr>
          <tr style="background: #fff;">
            <td style="padding: 8px 12px; font-weight: bold; color: #4B5563;">E-mail:</td>
            <td style="padding: 8px 12px;"><a href="mailto:${data.email}" style="color: #2563EB;">${data.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; color: #4B5563;">Telefone:</td>
            <td style="padding: 8px 12px; color: #1A1A1A;">${data.phone || 'Não informado'}</td>
          </tr>
          <tr style="background: #fff;">
            <td style="padding: 8px 12px; font-weight: bold; color: #4B5563;">Assunto:</td>
            <td style="padding: 8px 12px; color: #1A1A1A;">${subjectLabel}</td>
          </tr>
        </table>
        
        <div style="margin-top: 16px; padding: 16px; background: #fff; border-radius: 8px; border-left: 4px solid #FFD700;">
          <p style="margin: 0 0 8px; font-weight: bold; color: #4B5563; font-size: 13px;">Mensagem:</p>
          <p style="margin: 0; color: #1A1A1A; line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
        </div>
      </div>
      
      <div style="padding: 16px; background: #000; text-align: center;">
        <p style="margin: 0; color: #9CA3AF; font-size: 11px;">
          Enviado via originalfilter.com — ${new Date().toLocaleDateString('pt-BR')}
        </p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'Original Filter <contato@originalfilter.com>',
    to: process.env.SMTP_USER || 'contato@originalfilter.com',
    subject: `[Site] ${subjectLabel} — ${data.name}`,
    html,
    replyTo: data.email,
  });
}

/**
 * Send confirmation email to the user who submitted the contact form
 */
export async function sendContactConfirmation(data: ContactEmailData) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #000; padding: 20px; text-align: center;">
        <h1 style="color: #FFD700; margin: 0; font-size: 24px;">ORIGINAL FILTER</h1>
      </div>
      
      <div style="padding: 32px 24px;">
        <h2 style="color: #1A1A1A; margin: 0 0 16px;">Olá, ${data.name}!</h2>
        <p style="color: #4B5563; line-height: 1.6; margin: 0 0 16px;">
          Recebemos sua mensagem e agradecemos o contato. Nossa equipe irá analisá-la e
          retornará em até <strong>48 horas úteis</strong>.
        </p>
        <p style="color: #4B5563; line-height: 1.6; margin: 0 0 24px;">
          Caso precise de atendimento imediato, entre em contato pelo nosso SAC:
        </p>
        <div style="text-align: center; padding: 16px; background: #F5F5F5; border-radius: 8px;">
          <p style="margin: 0; font-size: 20px; font-weight: bold; color: #1A1A1A;">0800 778 2000</p>
          <p style="margin: 4px 0 0; color: #9CA3AF; font-size: 13px;">Ligação gratuita</p>
        </div>
      </div>
      
      <div style="padding: 16px; background: #000; text-align: center;">
        <p style="margin: 0; color: #9CA3AF; font-size: 11px;">
          Original Filter — Especialista em Filtros Automotivos
        </p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'Original Filter <contato@originalfilter.com>',
    to: data.email,
    subject: 'Recebemos sua mensagem — Original Filter',
    html,
  });
}
