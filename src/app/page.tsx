import { Header, WelcomeSection, Footer } from '@/presentation/components';
// import EpitesisPromoMayo from '@/presentation/components/EpitesisPromoMayo/EpitesisPromoMayo';
import MasterclassFlyer from '@/presentation/components/MasterclassFlyer/MasterclassFlyer';

export default function Home() {
  return (
    <>
      <Header />
      <WelcomeSection />
      <Footer />
      {/* <EpitesisPromoMayo /> */}
      <MasterclassFlyer />
    </>
  );
}
