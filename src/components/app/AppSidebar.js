"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Compass, 
  Video, 
  Bot, 
  Menu, 
  X,
  ChevronLeft,
  Sparkles,
  FolderOpen
} from "lucide-react";

const navItems = [
  {
    label: "Explorer",
    href: "/app",
    icon: Compass,
    description: "Parcourir les mèmes tendance"
  },
  {
    label: "Générateur de vidéo",
    href: "/app/generateur",
    icon: Video,
    description: "Créer des vidéos avec l'IA"
  },
  {
    label: "Acteur IA",
    href: "/app/acteur",
    icon: Bot,
    description: "Votre avatar intelligent"
  },
  {
    label: "Mes Créations",
    href: "/app/mes-creations",
    icon: FolderOpen,
    description: "Vos vidéos générées"
  }
];

export default function AppSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isActive = (href) => {
    if (href === "/app") {
      return pathname === "/app";
    }
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <>
      {/* Logo Section */}
      <div className="sidebar-header">
        <Link href="/" className="sidebar-logo">
          <Image
            src="/images/vista-logo.png"
            alt="Vista IA"
            width={120}
            height={40}
            className={`transition-all duration-300 ${isCollapsed ? "w-8 h-8 object-contain" : "h-8 w-auto"}`}
            priority
          />
        </Link>
        
        {/* Collapse Button - Desktop only */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="sidebar-collapse-btn hidden lg:flex"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft 
            size={18} 
            className={`transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section">
          {!isCollapsed && (
            <span className="nav-section-label">Menu</span>
          )}
          <ul className="nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`nav-item ${active ? "nav-item-active" : ""}`}
                    onClick={() => setIsMobileOpen(false)}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <span className="nav-icon">
                      <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                    </span>
                    {!isCollapsed && (
                      <span className="nav-label">{item.label}</span>
                    )}
                    {active && !isCollapsed && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="nav-active-indicator"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {!isCollapsed && (
          <div className="sidebar-upgrade-card">
            <div className="upgrade-icon">
              <Sparkles size={20} />
            </div>
            <div className="upgrade-content">
              <span className="upgrade-title">Vista Pro</span>
              <span className="upgrade-desc">Accès illimité</span>
            </div>
            <button className="upgrade-btn">
              Upgrade
            </button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="mobile-menu-btn lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>

      {/* Desktop Sidebar */}
      <aside 
        className={`app-sidebar hidden lg:flex ${isCollapsed ? "sidebar-collapsed" : ""}`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mobile-overlay lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="app-sidebar mobile-sidebar lg:hidden"
            >
              <button
                onClick={() => setIsMobileOpen(false)}
                className="mobile-close-btn"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
