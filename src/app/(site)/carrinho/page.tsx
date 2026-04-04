import type { Metadata } from 'next';
import { ShoppingCart } from 'lucide-react';
import ComingSoon from '@/components/shared/coming-soon';

export const metadata: Metadata = {
  title: 'Carrinho',
};

export default function CarrinhoPage() {
  return (
    <ComingSoon
      icon={ShoppingCart}
      title="Carrinho de Compras"
      description="Em breve você poderá montar seu pedido online com preços personalizados e calcular o frete em tempo real."
      features={[
        'Preços com desconto aplicado automaticamente',
        'Cálculo de frete via Melhor Envio',
        'Pagamento via PIX, boleto ou cartão',
        'Pedido mínimo e condições especiais',
      ]}
      ctaLabel="Ver catálogo"
      ctaHref="/produtos"
    />
  );
}
