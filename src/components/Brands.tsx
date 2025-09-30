import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Brands: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const countersStartedRef = useRef(false);

  // Marques fictives pour démonstration
  const brands = [
    { name: 'Luxe Fashion', logo: 'LF' },
    { name: 'Creative Studio', logo: 'CS' },
    { name: 'Digital Agency', logo: 'DA' },
    { name: 'Beauty Brand', logo: 'BB' },
    { name: 'Tech Startup', logo: 'TS' },
    { name: 'Art Gallery', logo: 'AG' },
    { name: 'Music Label', logo: 'ML' },
    { name: 'Fashion House', logo: 'FH' },
    { name: 'Media Group', logo: 'MG' },
    { name: 'Creative Collective', logo: 'CC' }
  ];

  // Statistiques
  const stats = [
    { display: '50+', target: 50, label: 'Projets réalisés' },
    { display: '30+', target: 30, label: 'Clients satisfaits' },
    { display: '5+',  target: 5,  label: "Années d'expérience" }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animation du titre
      gsap.fromTo('.brands-title',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: '.brands-title',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Fonction d'animation des compteurs
      const startCounters = () => {
        if (countersStartedRef.current) return;
        countersStartedRef.current = true;

        const numbers = gsap.utils.toArray<HTMLSpanElement>('.stat-number');
        numbers.forEach((element) => {
          const targetValue = Number(element.dataset.target || '0');
          const hasPlus = element.dataset.hasPlus === 'true';
          const counter = { value: 0 };

          gsap.to(counter, {
            value: targetValue,
            duration: 2,
            ease: 'power2.out',
            onUpdate: () => {
              const currentValue = Math.floor(counter.value);
              element.textContent = hasPlus ? `${currentValue}+` : `${currentValue}`;
            }
          });
        });

        // Animation d'apparition du bloc stats
        gsap.fromTo('.stats-wrap',
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
        );
      };

      // Animation continue du carrousel (de droite vers gauche)
      const carousel = carouselRef.current;
      if (carousel) {
        const totalWidth = carousel.scrollWidth / 2;

        gsap.set(carousel, { x: 0 });

        gsap.to(carousel, {
          x: -totalWidth,
          duration: 20,
          ease: 'none',
          repeat: -1
        });
      }

      // Déclencher les compteurs quand la section stats devient visible
      ScrollTrigger.create({
        trigger: '.stats-wrap',
        start: 'top 80%',
        once: true,
        onEnter: () => {
          startCounters();
        }
      });

      // Animation des logos au scroll
      gsap.fromTo('.brand-logo',
        { opacity: 0, scale: 0.8, rotateY: -45 },
        {
          opacity: 1,
          scale: 1,
          rotateY: 0,
          duration: 0.6,
          stagger: 0.1,
          scrollTrigger: {
            trigger: '.brands-carousel',
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative py-20 px-6 bg-gradient-to-b from-soft-black to-dark overflow-hidden"
    >
      {/* Éléments décoratifs en arrière-plan */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-10 w-2 h-20 bg-gradient-to-b from-transparent via-primary to-transparent opacity-30" />
        <div className="absolute top-1/3 right-10 w-2 h-32 bg-gradient-to-b from-transparent via-soft-white/20 to-transparent opacity-30" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* En-tête de la section */}
        <div className="brands-title text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-soft-white mb-4">
            Ils me font <span className="text-primary">confiance</span>
          </h2>
          <p className="text-xl text-soft-white/70 max-w-2xl mx-auto">
            Marques et créateurs qui ont choisi mon expertise pour leurs projets visuels.
          </p>
        </div>

        {/* Carrousel des marques */}
        <div className="brands-carousel overflow-hidden">
          <div 
            ref={carouselRef}
            className="flex items-center gap-12 w-max"
          >
            {[...brands, ...brands].map((brand, index) => (
              <div
                key={`${brand.name}-${index}`}
                className="brand-logo flex-shrink-0 group cursor-pointer"
              >
                <div className="relative w-32 h-32 flex items-center justify-center">
                  {/* Container du logo */}
                  <div className="w-24 h-24 bg-dark-light/40 backdrop-blur-md border border-soft-white/10 rounded-2xl flex items-center justify-center group-hover:border-primary/30 transition-all duration-300 group-hover:scale-110">
                    <span className="text-2xl font-bold text-soft-white/80 group-hover:text-primary transition-colors">
                      {brand.logo}
                    </span>
                  </div>
                  
                  {/* Effet au survol */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Nom de la marque au survol */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-sm text-soft-white/60 whitespace-nowrap">
                      {brand.name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section des statistiques */}
        <div className="stats-wrap mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="text-center p-6 bg-dark-light/20 backdrop-blur-md border border-soft-white/10 rounded-2xl"
            >
              <div className="text-4xl font-bold text-primary mb-2">
                <span
                  className="stat-number inline-block"
                  data-target={stat.target}
                  data-has-plus={stat.display.endsWith('+') ? 'true' : 'false'}
                >
                  {stat.display.endsWith('+') ? '0+' : '0'}
                </span>
              </div>
              <div className="text-soft-white/70">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Brands;