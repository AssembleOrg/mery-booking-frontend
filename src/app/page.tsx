import { Header, WelcomeSection, Footer, ProblemReportWidget } from '@/presentation/components';
import PromoModal from '@/presentation/components/PromoModal/PromoModal';

export default function Home() {
  return (
    <>
      <Header />
      <WelcomeSection />
      <Footer />
      <PromoModal />
      <ProblemReportWidget />
    </>
  );
}
