import AppSidebar from "@/components/app/AppSidebar";

export const metadata = {
  title: "App | Vista IA - Générateur de Mèmes IA",
  description: "Créez des mèmes et vidéos hilarantes avec Vista IA. Explorez, générez et partagez vos créations.",
};

export default function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <AppSidebar />
      <main className="app-main">
        <div className="app-content">
          {children}
        </div>
      </main>
    </div>
  );
}
