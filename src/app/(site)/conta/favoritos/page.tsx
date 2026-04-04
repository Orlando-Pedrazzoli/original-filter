import type { Metadata } from 'next';
import { Heart } from 'lucide-react';
import ComingSoon from '@/components/shared/coming-soon';

export const metadata: Metadata = {
  title: 'Favoritos',
};

export default function FavoritosPage() {
  return (
    <ComingSoon
      icon={Heart}
      title="Favoritos"
      description="Em breve você poderá salvar seus filtros preferidos para encontrá-los rapidamente e facilitar recompras."
      features={[
        'Salvar produtos para consulta rápida',
        'Comparar filtros lado a lado',
        'Receber alertas de promoções',
        'Adicionar ao carrinho direto dos favoritos',
      ]}
      ctaLabel="Ver catálogo"
      ctaHref="/produtos"
    />
  );
}
