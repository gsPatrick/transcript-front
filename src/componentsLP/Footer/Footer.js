import Link from 'next/link';
import Image from 'next/image';
import styles from './Footer.module.css';
import { FaWhatsapp, FaInstagram, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerTop}>
          {/* Coluna da Marca */}
          <div className={styles.brandColumn}>
            <Link href="/" className={styles.logo}>
              <Image 
                src="/logo.png"
                alt="Ícone Conduta Medx"
                width={150}
                height={50}
              />
            </Link>
            <p className={styles.slogan}>
              Transformando a fala em cuidado inteligente.
            </p>
            <div className={styles.socialIcons}>
              <Link href="#" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><FaWhatsapp /></Link>
              <Link href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></Link>
              <Link href="#" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedin /></Link>
            </div>
          </div>

          {/* Coluna de Links de Navegação */}
          <div className={styles.linksColumn}>
            <h4>Navegação</h4>
            <ul>
              <li><Link href="#features">Como Funciona</Link></li>
              <li><Link href="#pricing">Planos</Link></li>
              <li><Link href="#contact">Contato</Link></li>
            </ul>
          </div>

          {/* Coluna de Links Legais */}
          <div className={styles.linksColumn}>
            <h4>Legal</h4>
            <ul>
              <li><Link href="/termos-de-servico">Termos de Serviço</Link></li>
              <li><Link href="/politica-de-privacidade">Política de Privacidade</Link></li>
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p className={styles.copyright}>
            © {currentYear} TranscriMedX. Todos os direitos reservados.
          </p>
          <p className={styles.developerCredit}>
            Desenvolvido por{' '}
            <Link href="https://codebypatrick.dev" target="_blank" rel="noopener noreferrer">
              Patrick.Developer
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}