import { Header, WelcomeSection, Footer } from '@/presentation/components';
import PromoModal from '@/presentation/components/PromoModal/PromoModal';

export default function Home() {
  return (
    <>
      <Header />
      <WelcomeSection />
      <Footer />
      <PromoModal />
    </>
  );
}
