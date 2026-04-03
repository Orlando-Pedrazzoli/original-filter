import { NextRequest, NextResponse } from 'next/server';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import dbConnect from '@/lib/db';
import Contact from '@/models/Contact';
import { contactSchema, formatZodErrors } from '@/utils/validators';
import { sendContactNotification, sendContactConfirmation } from '@/lib/email';

// Rate limiter: max 5 submissions per IP per 15 minutes
const rateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60 * 15,
});

export async function POST(request: NextRequest) {
  try {
    // ── Rate Limiting ──
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';

    try {
      await rateLimiter.consume(ip);
    } catch {
      return NextResponse.json(
        { error: 'Muitas tentativas. Aguarde alguns minutos.' },
        { status: 429 },
      );
    }

    // ── Parse Body ──
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Corpo da requisição inválido.' }, { status: 400 });
    }

    // ── Validate with Zod ──
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Dados inválidos.', fields: formatZodErrors(result.error) },
        { status: 422 },
      );
    }

    const data = result.data;

    // ── Save to MongoDB ──
    await dbConnect();

    const contact = await Contact.create({
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      subject: data.subject,
      message: data.message,
    });

    // ── Send Emails (non-blocking) ──
    // We don't await these — if email fails, the contact is still saved
    const emailPromises = [
      sendContactNotification(data).catch((err) =>
        console.error('[Contact API] Admin notification email failed:', err),
      ),
      sendContactConfirmation(data).catch((err) =>
        console.error('[Contact API] User confirmation email failed:', err),
      ),
    ];

    // Fire and forget, but still resolve in background
    Promise.allSettled(emailPromises);

    return NextResponse.json(
      {
        success: true,
        message: 'Mensagem enviada com sucesso!',
        id: contact._id,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('[Contact API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor. Tente novamente mais tarde.' },
      { status: 500 },
    );
  }
}
