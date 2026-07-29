import { Header, WelcomeSection, Footer } from '@/presentation/components';
import EpitesisPromoMayo from '@/presentation/components/EpitesisPromoMayo/EpitesisPromoMayo';
import AbhPromoModal from '@/presentation/components/AbhPromoModal/AbhPromoModal';

export default function Home() {
  return (
    <>
      <Header />
      <WelcomeSection />
      <Footer />
      {/* <EpitesisPromoMayo /> */}
      <AbhPromoModal />
    </>
  );
}
