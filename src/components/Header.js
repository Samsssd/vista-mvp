"use client";

import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <>
      {/* Announcement Banner */}
      <div className="bg-[var(--lime)] py-2 px-4 text-center">
        <p className="text-sm font-medium text-[var(--black)] flex items-center justify-center gap-2">
          <span>🎉</span>
          <span>
            Nouveau ! Vista IA 2.0 est arrivé - Créez des mèmes encore plus fous !
          </span>
        </p>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-[var(--off-white)]/95 backdrop-blur-md border-b border-[var(--gray-200)]">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/images/vista-logo.png"
                alt="Vista IA"
                width={120}
                height={40}
                className="h-8 md:h-10 w-auto"
                priority
              />
            </Link>

            {/* CTAs - Visible on all screen sizes */}
            <div className="flex items-center gap-2 md:gap-3">
              <Link href="/app" className="btn-primary text-xs">
                Créer
              </Link>
              <Link href="/connexion" className="btn-secondary text-xs">
                Connexion
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
