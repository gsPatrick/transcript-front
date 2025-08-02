import Header from '@/componentsLP/Header/Header';
import Hero from '@/componentsLP/Hero/Hero';
import HowItWorks from '@/componentsLP/HowItWorks/HowItWorks';
import TrustSection from '@/componentsLP/TrustSection/TrustSection';
import CTASection from '@/componentsLP/CTASection/CTASection';
import Pricing from '@/componentsLP/Pricing/Pricing';
import ContactSection from '@/componentsLP/ContactSection/ContactSection';
import Footer from '@/componentsLP/Footer/Footer'; // Importe o novo componente
import styles from './page.module.css';

export default function Home() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <Hero />
        <HowItWorks />
        <Pricing />
        <TrustSection />
        <CTASection />
        <ContactSection />
      </main>
      <Footer /> {/* Adicione o Footer fora da tag <main> */}
    </>
  );
}