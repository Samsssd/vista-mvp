"use client";

import { motion } from "framer-motion";
import { Upload, Palette, Download, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Uploadez votre photo",
    description:
      "Prenez un selfie ou choisissez une photo de votre galerie. Notre IA fonctionne mieux avec un visage bien visible.",
  },
  {
    number: "02",
    icon: Palette,
    title: "Choisissez un mème",
    description:
      "Parcourez notre bibliothèque de mèmes populaires et sélectionnez celui qui vous fait le plus rire.",
  },
  {
    number: "03",
    icon: Download,
    title: "Téléchargez & Partagez",
    description:
      "En quelques secondes, votre mème personnalisé est prêt. Téléchargez-le et partagez-le avec vos amis !",
  },
];

export default function HowItWorks() {
  return (
    <section className="section" id="comment">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-semibold uppercase tracking-wider text-[var(--lime-dark)] mb-4"
          >
            Comment ça marche
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold italic mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <span className="lime-highlight">3 étapes</span> pour devenir une
            légende
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[var(--gray-600)] text-lg"
          >
            Pas besoin d&apos;être un pro de Photoshop. Vista IA fait tout le
            travail pour vous.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connection Line */}
          <div className="hidden md:block absolute top-24 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-[var(--lime)] via-[var(--lime-dark)] to-[var(--lime)]" />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative text-center"
            >
              {/* Step Number */}
              <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--lime)] mb-6 mx-auto">
                <span
                  className="text-3xl font-bold text-[var(--black)]"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {step.number}
                </span>
              </div>

              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-[var(--white)] border-2 border-[var(--gray-200)] flex items-center justify-center mx-auto mb-5 shadow-lg">
                <step.icon size={24} className="text-[var(--black)]" />
              </div>

              {/* Content */}
              <h3
                className="text-xl font-bold mb-3"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {step.title}
              </h3>
              <p className="text-[var(--gray-600)] leading-relaxed max-w-sm mx-auto">
                {step.description}
              </p>

              {/* Arrow (not on last item) */}
              {index < steps.length - 1 && (
                <div className="hidden md:flex absolute top-24 -right-4 w-8 h-8 items-center justify-center">
                  <ArrowRight className="text-[var(--lime-dark)]" size={24} />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <a
            href="#creer"
            className="btn-primary text-base px-10 py-4 inline-flex items-center gap-2 group"
          >
            <span>Commencer maintenant</span>
            <ArrowRight
              size={18}
              className="transition-transform group-hover:translate-x-1"
            />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
