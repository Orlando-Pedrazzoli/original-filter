/* ══════════════════════════════════════════
   /conta/perfil — Editar dados pessoais
   ══════════════════════════════════════════ */

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { UserRound } from 'lucide-react';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { ProfileForm } from './profile-form';

export const metadata: Metadata = {
  title: 'Perfil — Original Filter',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function ContaPerfilPage() {
  const session = await auth();
  if (!session?.user) redirect('/conta/login');

  await dbConnect();

  const user = (await User.findById(session.user.id)
    .select('name email phone whatsapp cpf company role')
    .lean()) as unknown as {
    name?: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
    cpf?: string;
    company?: {
      razaoSocial?: string;
      cnpj?: string;
      nomeFantasia?: string;
      inscricaoEstadual?: string;
    };
    role?: string;
  } | null;

  if (!user) redirect('/conta/login');

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-3 flex items-center gap-3">
          <UserRound className="text-brand-iron size-4" strokeWidth={2} />
          <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
            Meus dados
          </span>
        </div>
        <h2
          className="font-display text-brand-black leading-tight font-black tracking-tight"
          style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
            letterSpacing: '-0.035em',
          }}
        >
          Perfil<span className="text-brand-yellow-deep">.</span>
        </h2>
        <p className="text-brand-iron mt-1.5 text-sm">
          Atualize seus dados pessoais e, se for revendedor, dados da empresa.
        </p>
      </div>

      <ProfileForm
        initial={{
          name: user.name ?? '',
          email: user.email ?? '',
          phone: user.phone ?? '',
          whatsapp: user.whatsapp ?? '',
          cpf: user.cpf ?? '',
          company: user.company ?? null,
        }}
        role={user.role ?? 'retail'}
      />
    </div>
  );
}
