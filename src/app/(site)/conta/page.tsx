import type { Metadata } from 'next';
import { UserCog } from 'lucide-react';
import ComingSoon from '@/components/shared/coming-soon';

export const metadata: Metadata = {
  title: 'Minha Conta',
};

export default function MinhaContaPage() {
  return (
    <ComingSoon
      icon={UserCog}
      title="Minha Conta"
      description="Em breve você terá acesso ao seu painel pessoal com dados cadastrais, endereços e configurações da conta."
      features={[
        'Dados pessoais e da empresa',
        'Endereços de entrega salvos',
        'Alterar senha e preferências',
        'Nível de desconto atribuído',
      ]}
      ctaLabel="Voltar ao início"
      ctaHref="/"
    />
  );
}
