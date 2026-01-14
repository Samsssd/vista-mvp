"use client";

import { Twitter, Instagram, Youtube, Github } from "lucide-react";
import Image from "next/image";

const footerLinks = {
  produit: [
    { label: "Créer un mème", href: "#creer" },
    { label: "Templates", href: "#templates" },
    { label: "Galerie", href: "#galerie" },
    { label: "Nouveautés", href: "#nouveautes" },
  ],
  entreprise: [
    { label: "À propos", href: "#about" },
    { label: "Blog", href: "#blog" },
    { label: "Presse", href: "#presse" },
    { label: "Carrières", href: "#carrieres" },
  ],
  legal: [
    { label: "Confidentialité", href: "#confidentialite" },
    { label: "Conditions d'utilisation", href: "#conditions" },
    { label: "Mentions légales", href: "#mentions" },
    { label: "Cookies", href: "#cookies" },
  ],
  support: [
    { label: "Centre d'aide", href: "#aide" },
    { label: "Contact", href: "#contact" },
    { label: "FAQ", href: "#faq" },
    { label: "Status", href: "#status" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
  { icon: Github, href: "https://github.com", label: "GitHub" },
];

export default function Footer() {
  return (
    <footer className="bg-[var(--black)] text-[var(--white)] pt-16 pb-8">
      <div className="container-custom">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 pb-12 border-b border-[var(--gray-800)]">
          {/* Brand */}
          <div className="col-span-2">
            <a href="/" className="inline-block mb-4">
              <Image
                src="/images/vista-logo.png"
                alt="Vista IA"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </a>
            <p className="text-[var(--gray-400)] text-sm leading-relaxed mb-6 max-w-xs">
              Le générateur de mèmes IA le plus fun de France. Créez des mèmes
              personnalisés en quelques secondes.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-[var(--gray-800)] flex items-center justify-center text-[var(--gray-400)] hover:bg-[var(--lime)] hover:text-[var(--black)] transition-all duration-300"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4
              className="text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Produit
            </h4>
            <ul className="space-y-3">
              {footerLinks.produit.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-sm text-[var(--gray-400)] hover:text-[var(--lime)] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4
              className="text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Entreprise
            </h4>
            <ul className="space-y-3">
              {footerLinks.entreprise.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-sm text-[var(--gray-400)] hover:text-[var(--lime)] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4
              className="text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Légal
            </h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-sm text-[var(--gray-400)] hover:text-[var(--lime)] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4
              className="text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Support
            </h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-sm text-[var(--gray-400)] hover:text-[var(--lime)] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--gray-500)]">
            © 2026 Vista IA. Tous droits réservés. Fait avec ❤️ à Paris.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--gray-600)]">
              🇫🇷 Hébergé en France
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
