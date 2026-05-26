/* ══════════════════════════════════════════
   POST /api/admin/upload/signature
   ──────────────────────────────────────────
   Gera assinatura segura para upload direto do Cliente → Cloudinary.

   O CLOUDINARY_API_SECRET NUNCA sai do servidor.
   O cliente recebe apenas: signature, timestamp, apiKey, cloudName, folder.

   Segurança: NextAuth + role 'admin' obrigatório.
   ══════════════════════════════════════════ */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { signUpload, CLOUDINARY_FOLDER } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso restrito' }, { status: 403 });
    }

    // Confere se as variáveis de ambiente estão setadas
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      console.error('[upload/signature] Cloudinary não configurado');
      return NextResponse.json(
        {
          error: 'Cloudinary não configurado no servidor. Verifique as variáveis de ambiente.',
        },
        { status: 500 },
      );
    }

    const sig = signUpload({ folder: CLOUDINARY_FOLDER });

    return NextResponse.json(sig);
  } catch (err) {
    console.error('[upload/signature] error:', err);
    return NextResponse.json({ error: 'Erro ao gerar assinatura de upload' }, { status: 500 });
  }
}
