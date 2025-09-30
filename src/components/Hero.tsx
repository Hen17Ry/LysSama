import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Play } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Hero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Titres + CTA
      gsap.fromTo('.hero-title',
        { opacity: 0, y: 100, scale: 0.8 },
        { opacity: 1, y: 0, scale: 1, duration: 1.5, ease: 'power3.out', delay: 0.8 }
      );

      gsap.fromTo('.hero-subtitle',
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out', delay: 1.2 }
      );

      gsap.fromTo('.hero-cta',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: 'power2.out', delay: 1.6 }
      );

      // Parallax du background (animation du background-position)
      if (heroRef.current) {
        // Assure une position de départ
        (heroRef.current.style as any).backgroundPosition = '50% 50%';
        gsap.to(heroRef.current, {
          backgroundPositionY: '20%',
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        });
      }

      // Overlay qui se renforce au scroll
      gsap.fromTo('.hero-overlay',
        { opacity: 0.6 },
        {
          opacity: 0.85,
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-center bg-cover"
      // ✅ Image en background directement sur la section
      style={{
        backgroundImage: "url('/Sama.jpg')",
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundColor: '#f5e6d3',
      }}
    >
      {/* Overlay gradient (fondu par-dessus l'image mais elle reste visible) */}
      <div className="hero-overlay absolute inset-0 bg-gradient-to-b from-soft-black/60 via-soft-black/55 to-soft-black/85 pointer-events-none" />

      {/* Éléments décoratifs glassmorphiques */}
      <div className="absolute top-1/4 left-10 w-32 h-32 bg-primary/20 backdrop-blur-sm rounded-full animate-float" />
      <div className="absolute bottom-1/3 right-16 w-24 h-24 bg-soft-white/10 backdrop-blur-sm rounded-2xl animate-float" style={{ animationDelay: '2s' }} />

      {/* Contenu */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <h1 className="hero-title text-5xl md:text-7xl lg:text-8xl font-bold text-soft-white mb-6">
          Créatrice de
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-light to-primary">
            Contenus
          </span>
        </h1>

        <p className="hero-subtitle text-xl md:text-2xl text-soft-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
          Vidéaste & Photographe passionnée, je transforme vos idées en histoires visuelles
          captivantes qui marquent et inspirent votre audience.
        </p>

        <div className="hero-cta flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="#contact"
            className="group relative px-8 py-4 bg-primary hover:bg-primary-light backdrop-blur-sm rounded-2xl text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/25"
          >
            <span className="flex items-center gap-2">
              Discuter d&apos;un projet
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            to="/works"
            className="group px-8 py-4 bg-soft-white/10 hover:bg-soft-white/20 backdrop-blur-md border border-soft-white/20 rounded-2xl text-soft-white font-semibold transition-all duration-300 hover:scale-105"
          >
            <span className="flex items-center gap-2">
              <Play size={18} />
              Voir mes réalisations
            </span>
          </Link>
        </div>

        {/* Indicateur de scroll */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-soft-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-soft-white/50 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Traits décoratifs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-0 w-1 h-32 bg-gradient-to-b from-transparent via-primary to-transparent animate-pulse" />
        <div className="absolute top-1/3 right-0 w-1 h-40 bg-gradient-to-b from-transparent via-soft-white/30 to-transparent animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
    </section>
  );
};

export default Hero;
