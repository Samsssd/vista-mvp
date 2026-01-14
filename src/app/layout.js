import { Sora, Nunito } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const nunito = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Vista IA - Générateur de Mèmes IA | Créez des mèmes hilarants",
  description:
    "Transformez vos photos en mèmes viraux avec Vista IA. Uploadez votre image et laissez notre IA vous insérer dans les mèmes les plus populaires du web. Gratuit et instantané !",
  keywords: [
    "générateur mèmes",
    "IA mèmes",
    "créer mèmes",
    "mèmes français",
    "intelligence artificielle",
  ],
  openGraph: {
    title: "Vista IA - Générateur de Mèmes IA",
    description: "Transformez vos photos en mèmes viraux avec l'IA",
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body
        className={`${sora.variable} ${nunito.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
