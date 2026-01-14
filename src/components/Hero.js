"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

// Typing animation component
function TypewriterText({ text, delay = 0, onComplete, highlightWord, bounceWord }) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (delay > 0) {
      const delayTimer = setTimeout(() => startTyping(), delay);
      return () => clearTimeout(delayTimer);
    } else {
      startTyping();
    }

    function startTyping() {
      let currentIndex = 0;
      const typingInterval = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          setIsComplete(true);
          onComplete?.();
        }
      }, 50);

      return () => clearInterval(typingInterval);
    }
  }, [text, delay]);

  // Render with highlights
  const renderText = () => {
    if (!highlightWord && !bounceWord) return displayedText;

    let result = displayedText;
    const elements = [];
    let lastIndex = 0;

    // Check for highlight word
    if (highlightWord && displayedText.includes(highlightWord)) {
      const highlightIndex = displayedText.indexOf(highlightWord);
      if (highlightIndex !== -1) {
        elements.push(displayedText.slice(0, highlightIndex));
        elements.push(
          <span key="highlight" className="lime-highlight">
            {highlightWord}
          </span>
        );
        lastIndex = highlightIndex + highlightWord.length;
        result = displayedText.slice(lastIndex);
      }
    }

    // Check for bounce word
    if (bounceWord && result.includes(bounceWord)) {
      const bounceIndex = result.indexOf(bounceWord);
      if (bounceIndex !== -1) {
        elements.push(result.slice(0, bounceIndex));
        elements.push(
          <span key="bounce" className="inline-block animate-bounce">
            {bounceWord}
          </span>
        );
        result = result.slice(bounceIndex + bounceWord.length);
      }
    }

    if (result) elements.push(result);

    return elements.length > 0 ? elements : displayedText;
  };

  return <>{renderText()}</>;
}

export default function Hero() {
  const [line1Complete, setLine1Complete] = useState(false);
  const [line2Complete, setLine2Complete] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);

  return (
    <section className="section relative overflow-hidden" style={{ paddingTop: '3rem' }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, var(--black) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="container-custom relative">
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto">

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold italic leading-[0.95] tracking-tight mb-6 min-h-[180px] sm:min-h-[220px] md:min-h-[280px] lg:min-h-[340px]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <span className="block">
              <TypewriterText 
                text="TECHNOLOGIE" 
                delay={200} 
                onComplete={() => setLine1Complete(true)} 
              />
            </span>
            <span className="block">
              {line1Complete && (
                <TypewriterText 
                  text="SÉRIEUSE," 
                  onComplete={() => setLine2Complete(true)} 
                />
              )}
            </span>
            <span className="block mt-2">
              {line2Complete && (
                <TypewriterText 
                  text="USAGE DÉLIRANT :)" 
                  highlightWord="USAGE"
                  bounceWord=":)"
                  onComplete={() => setShowSubtitle(true)} 
                />
              )}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={showSubtitle ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="text-lg md:text-xl text-[var(--gray-600)] max-w-2xl mb-10 leading-relaxed"
          >
            Uploadez votre photo et laissez notre IA vous transformer en star
            des memes les plus populaires du web !
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={showSubtitle ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <a
              href="#creer"
              className="btn-primary text-base px-8 py-4 group"
            >
              <span>Créer</span>
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </a>
            <a href="#memes" className="btn-secondary text-base px-8 py-4">
              Voir les Memes
            </a>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
