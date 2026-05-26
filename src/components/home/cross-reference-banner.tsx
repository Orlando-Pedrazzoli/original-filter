/* ══════════════════════════════════════════
   CrossReferenceBanner — Original Filter
   ──────────────────────────────────────────
   Banner destacando a ferramenta de busca por código (cross-reference).
   Input inline que já navega para /cross-reference?code=X
   ══════════════════════════════════════════ */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Hash, ArrowRight, Zap } from 'lucide-react';

export function CrossReferenceBanner() {
  const router = useRouter();
  const [code, setCode] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim().length < 3) return;
    router.push(`/cross-reference?code=${encodeURIComponent(code.trim())}`);
  }

  return (
    <section className="bg-brand-yellow relative overflow-hidden py-16 md:py-20">
      {/* Padrão diagonal sutil */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, transparent, transparent 16px, #000 16px, #000 17px)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 md:px-12">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-5">
          {/* Texto */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3"
          >
            <div className="mb-4 flex items-center gap-3">
              <Zap className="text-brand-black size-4" strokeWidth={2.5} fill="currentColor" />
              <span className="text-brand-black/70 font-mono text-[11px] tracking-[0.25em] uppercase">
                Cross-Reference · Conversor de Filtros
              </span>
            </div>
            <h2
              className="font-display text-brand-black leading-[0.95] font-black tracking-tight"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                letterSpacing: '-0.03em',
              }}
            >
              Já compra
              <br />
              outra marca?
            </h2>
            <p className="text-brand-black/80 mt-5 max-w-xl text-base md:text-lg">
              Digite o código original (Mann, Donaldson, Tecfil, Wega, Mahle ou da montadora) e
              descubra na hora qual Original Filter equivale.
            </p>
          </motion.div>

          {/* Formulário */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <form onSubmit={submit} className="bg-brand-black p-6 md:p-7">
              <label
                htmlFor="cross-ref-input"
                className="text-brand-yellow mb-3 block font-mono text-[10px] tracking-[0.22em] uppercase"
              >
                Código do filtro
              </label>
              <div className="relative">
                <Hash
                  className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-white/40"
                  strokeWidth={2}
                />
                <input
                  id="cross-ref-input"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Ex: W1170, OFA2023C..."
                  autoComplete="off"
                  spellCheck={false}
                  className="bg-brand-graphite focus:border-brand-yellow w-full border border-white/10 py-4 pr-4 pl-12 font-mono text-base font-medium tracking-wider text-white uppercase transition outline-none placeholder:text-white/30"
                  style={{ borderRadius: 'var(--radius-edge)' }}
                />
              </div>
              <button
                type="submit"
                disabled={code.trim().length < 3}
                className="btn-primary !bg-brand-yellow hover:!bg-brand-yellow-bright mt-4 w-full disabled:opacity-40"
              >
                Encontrar equivalência
                <ArrowRight className="size-4" />
              </button>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4 font-mono text-[9px] tracking-widest text-white/40 uppercase">
                <span className="text-brand-yellow">↳</span>
                <span>Mann</span>
                <span>·</span>
                <span>Donaldson</span>
                <span>·</span>
                <span>Tecfil</span>
                <span>·</span>
                <span>Wega</span>
                <span>·</span>
                <span>Mahle</span>
                <span>·</span>
                <span>OEM</span>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
