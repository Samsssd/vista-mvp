"use client";

import Image from "next/image";
import { motion } from "framer-motion";

// Example videos - showcase of Vista IA creations
const videos = [
  {
    id: 1,
    url: "https://vista-ia.s3.eu-north-1.amazonaws.com/vista_20260113_Motion_Control__314_0.mp4",
    title: "Mème Viral #1",
  },
  {
    id: 2,
    url: "https://vista-ia.s3.eu-north-1.amazonaws.com/vista_20260113_Motion_Control__314_0.mp4",
    title: "Mème Viral #2",
  },
  {
    id: 3,
    url: "https://vista-ia.s3.eu-north-1.amazonaws.com/vista_20260113_Motion_Control__314_0.mp4",
    title: "Mème Viral #3",
  },
  {
    id: 4,
    url: "https://vista-ia.s3.eu-north-1.amazonaws.com/vista_20260113_Motion_Control__314_0.mp4",
    title: "Mème Viral #4",
  },
  {
    id: 5,
    url: "https://vista-ia.s3.eu-north-1.amazonaws.com/vista_20260113_Motion_Control__314_0.mp4",
    title: "Mème Viral #5",
  },
  {
    id: 6,
    url: "https://vista-ia.s3.eu-north-1.amazonaws.com/vista_20260113_Motion_Control__314_0.mp4",
    title: "Mème Viral #6",
  },
];

function VideoCard({ video, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="relative group cursor-pointer"
    >
      <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-[var(--gray-100)] border-2 border-[var(--gray-200)] group-hover:border-[var(--lime)] transition-all duration-300 shadow-lg group-hover:shadow-2xl group-hover:shadow-[var(--lime)]/20 group-hover:scale-105">
        {/* Video */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          loop
          muted
          playsInline
          autoPlay
        >
          <source src={video.url} type="video/mp4" />
        </video>
      </div>
    </motion.div>
  );
}

export default function VideoShowcase() {
  return (
    <section className="section bg-[var(--white)]" id="memes">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block mb-4"
          >
            <Image
              src="/images/vista-avatar.png"
              alt="Vista IA Avatar"
              width={110}
              height={110}
              className="rounded-full"
            />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold italic mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Tout part d'un simple selfie
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[var(--gray-600)] text-lg"
          >
            Oui c'est aussi simple que ça ! Prends ton meilleur selfie, choisis un template et te voilà dans la vidéo que tu veux !
          </motion.p>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {videos.map((video, index) => (
            <VideoCard key={video.id} video={video} index={index} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <a href="#creer" className="btn-primary">
            Créer le mien
          </a>
        </motion.div>
      </div>
    </section>
  );
}
