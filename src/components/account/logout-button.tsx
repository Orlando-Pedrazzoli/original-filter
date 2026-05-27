/* ══════════════════════════════════════════
   LogOutButton — Original Filter
   ──────────────────────────────────────────
   Chama signOut do NextAuth e redireciona para home.
   ══════════════════════════════════════════ */

'use client';

import { signOut } from 'next-auth/react';
import { useState } from 'react';
import { LogOut, Loader2 } from 'lucide-react';

export function LogOutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await signOut({ callbackUrl: '/' });
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="font-display text-brand-iron hover:text-brand-black border-brand-mist hover:border-brand-iron inline-flex shrink-0 items-center gap-2 border px-4 py-2.5 text-xs font-semibold tracking-wide uppercase transition disabled:opacity-50"
      style={{ borderRadius: 'var(--radius-edge)' }}
    >
      {loading ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <LogOut className="size-3.5" strokeWidth={2.5} />
      )}
      {loading ? 'Saindo...' : 'Sair'}
    </button>
  );
}
