// Importe a nova fonte junto com a Inter
import { Inter, Roboto_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Configure a Roboto Mono
const roboto_mono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
});

export const metadata = {
  title: 'Conduta Medx - Transcrição e Análise por IA',
  description: 'Transforme áudio em insights valiosos com a precisão da inteligência artificial.',
};

export default function RootLayout({ children }) {
  // Adicione a variável da nova fonte ao body
  return (
    <html lang="pt-br">
      <body className={`${inter.variable} ${roboto_mono.variable}`}>{children}</body>
    </html>
  );
}