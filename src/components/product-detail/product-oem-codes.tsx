/* ══════════════════════════════════════════
   ProductOemCodes — Original Filter
   ──────────────────────────────────────────
   Códigos OEM/concorrentes equivalentes ao produto.
   - Mostra os códigos como "pills" copiáveis
   - Estado "Em breve" quando ainda não populado (Gabriel não enviou)
   ══════════════════════════════════════════ */

'use client';

import { useState } from 'react';
import { Hash, Copy, Check } from 'lucide-react';

interface ProductOemCodesProps {
  oemCodes: string[];
  productSku: string;
}

export function ProductOemCodes({ oemCodes, productSku }: ProductOemCodesProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  async function handleCopy(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 1500);
    } catch {
      // Falha silenciosa em browsers antigos
    }
  }

  return (
    <section className="bg-brand-snow py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-12">
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <div className="bg-brand-yellow h-px w-8" />
            <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
              Códigos equivalentes
            </span>
          </div>
          <h2
            className="font-display text-brand-black font-black"
            style={{
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              letterSpacing: '-0.025em',
            }}
          >
            Já compra outra marca?
          </h2>
          <p className="text-brand-iron mt-3 max-w-2xl">
            Estes são os códigos equivalentes ao{' '}
            <span className="text-brand-yellow-deep font-mono font-bold">{productSku}</span> nos
            principais fabricantes do mercado.
          </p>
        </div>

        {oemCodes.length === 0 ? (
          <div
            className="bg-brand-white border-brand-mist border p-6 md:p-8"
            style={{ borderRadius: 'var(--radius-edge)' }}
          >
            <div className="flex items-start gap-4">
              <div className="bg-brand-yellow/10 text-brand-yellow-deep flex size-10 shrink-0 items-center justify-center">
                <Hash className="size-4" strokeWidth={2} />
              </div>
              <div>
                <div className="text-brand-iron mb-1 font-mono text-[10px] tracking-[0.22em] uppercase">
                  Tabela de equivalência em atualização
                </div>
                <div className="font-display text-brand-black text-lg leading-tight font-bold">
                  Estamos populando os códigos OEM.
                </div>
                <div className="text-brand-iron mt-2 max-w-xl text-sm leading-relaxed">
                  Em breve você poderá consultar aqui os códigos equivalentes Mann, Donaldson,
                  Tecfil, Wega, Mahle e códigos originais das montadoras (Volvo, Scania,
                  Mercedes-Benz, DAF, etc.). Para consultar agora, entre em contato.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {oemCodes.map((code) => {
              const isCopied = copiedCode === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleCopy(code)}
                  className={`group inline-flex items-center gap-2 border px-3 py-2 transition ${
                    isCopied
                      ? 'bg-brand-yellow text-brand-black border-brand-yellow'
                      : 'bg-brand-white border-brand-mist hover:border-brand-iron text-brand-black'
                  }`}
                  style={{ borderRadius: 'var(--radius-edge)' }}
                  aria-label={`Copiar código ${code}`}
                >
                  <span className="font-mono text-sm font-bold tracking-wider">{code}</span>
                  {isCopied ? (
                    <Check className="size-3.5" strokeWidth={2.5} />
                  ) : (
                    <Copy className="text-brand-steel group-hover:text-brand-iron size-3.5 transition" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
