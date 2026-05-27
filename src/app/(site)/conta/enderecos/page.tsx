/* ══════════════════════════════════════════
   /conta/enderecos — Gerenciar endereços
   ══════════════════════════════════════════ */

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { AddressesClient } from './addresses-client';

export const metadata: Metadata = {
  title: 'Endereços — Original Filter',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function ContaEnderecosPage() {
  const session = await auth();
  if (!session?.user) redirect('/conta/login');

  await dbConnect();

  const user = (await User.findById(session.user.id).select('addresses').lean()) as unknown as {
    addresses?: Array<{
      label: string;
      cep: string;
      logradouro: string;
      numero: string;
      complemento?: string;
      bairro: string;
      cidade: string;
      uf: string;
      isDefault: boolean;
    }>;
  } | null;

  const addresses = (user?.addresses ?? []).map((a, i) => ({
    id: i,
    ...a,
  }));

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-3 flex items-center gap-3">
          <MapPin className="text-brand-iron size-4" strokeWidth={2} />
          <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
            Locais de entrega
          </span>
        </div>
        <h2
          className="font-display text-brand-black leading-tight font-black tracking-tight"
          style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
            letterSpacing: '-0.035em',
          }}
        >
          Endereços<span className="text-brand-yellow-deep">.</span>
        </h2>
        <p className="text-brand-iron mt-1.5 text-sm">
          Salve até 10 endereços para checkout rápido. O endereço marcado como principal é usado por
          padrão.
        </p>
      </div>

      <AddressesClient initialAddresses={addresses} />
    </div>
  );
}
