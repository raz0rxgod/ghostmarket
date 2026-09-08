import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AuthProvider } from '@/components/AuthProvider';
import { CartProvider } from '@/components/CartProvider';
import { FavoritesProvider } from '@/components/FavoritesProvider';
import { SiteEditModeProvider } from '@/components/SiteEditModeProvider';
import { EditModeToggle } from '@/components/EditModeToggle';
import { getSettings, getPages, SiteSettings, Page } from '@/lib/api';
import './globals.css';

export const metadata: Metadata = {
  title: 'GhostMarket — boutique en ligne',
  description: 'GhostMarket — boutique d\u2019électronique nouvelle génération',
};

// Solution de repli si le backend est indisponible au moment du rendu du
// layout — le site ne doit pas planter entièrement si /settings échoue.
const FALLBACK_SETTINGS: SiteSettings = {
  shop_name: 'GhostMarket',
  phone: '',
  email: '',
  address: '',
  hero_title: 'Bienvenue chez GhostMarket',
  hero_subtitle:
    'High-tech et électronique, sans complications. Choisissez, ajoutez au panier et passez commande en quelques clics.',
  footer_description: "Prototype de boutique en ligne. Ne constitue pas une offre publique.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let settings: SiteSettings = FALLBACK_SETTINGS;
  let pages: Page[] = [];

  try {
    [settings, pages] = await Promise.all([getSettings(), getPages()]);
  } catch {
    // textes du site — non bloquant, on garde les valeurs par défaut
  }

  return (
    <html lang="fr">
      <body className="min-h-screen font-sans antialiased flex flex-col">
        <div className="app-backdrop" />
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <SiteEditModeProvider>
                <Header />
                <div className="flex-1">{children}</div>
                <Footer settings={settings} pages={pages} />
                <EditModeToggle />
              </SiteEditModeProvider>
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
