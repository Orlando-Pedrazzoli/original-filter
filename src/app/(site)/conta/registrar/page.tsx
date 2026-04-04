import type { Metadata } from 'next';
import { UserPlus } from 'lucide-react';
import ComingSoon from '@/components/shared/coming-soon';

export const metadata: Metadata = {
  title: 'Criar conta',
};

export default function ContaRegistrarPage() {
  return (
    <ComingSoon
      icon={UserPlus}
      title="Criar Conta"
      description="Em breve distribuidores e clientes poderão se cadastrar para acessar preços exclusivos e fazer pedidos online."
      features={[
        'Cadastro rápido com CNPJ',
        'Aprovação e desconto personalizado',
        'Acesso imediato ao catálogo completo',
        'Gestão de múltiplos endereços de entrega',
      ]}
      ctaLabel="Voltar ao início"
      ctaHref="/"
    />
  );
}
