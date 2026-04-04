import type { Metadata } from 'next';
import { LogIn } from 'lucide-react';
import ComingSoon from '@/components/shared/coming-soon';

export const metadata: Metadata = {
  title: 'Entrar na sua conta',
};

export default function ContaLoginPage() {
  return (
    <ComingSoon
      icon={LogIn}
      title="Área do Cliente"
      description="Em breve você poderá acessar sua conta, acompanhar pedidos e gerenciar seus dados diretamente pelo nosso site."
      features={[
        'Login com e-mail e senha',
        'Preços personalizados para distribuidores',
        'Histórico completo de pedidos',
        'Recompra rápida com um clique',
      ]}
      ctaLabel="Voltar ao início"
      ctaHref="/"
    />
  );
}
