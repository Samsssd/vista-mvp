import Header from "@/components/Header";
import Hero from "@/components/Hero";
import VideoShowcase from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <VideoShowcase />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
