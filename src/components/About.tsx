import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Award, Heart, Target, Zap } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const About: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animation de révélation de l'image portrait
      gsap.fromTo(imageRef.current,
        { 
          opacity: 0, 
          scale: 0.8,
          rotateY: -20,
          filter: 'blur(10px)'
        },
        {
          opacity: 1,
          scale: 1,
          rotateY: 0,
          filter: 'blur(0px)',
          duration: 1.5,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: imageRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Animation du texte
      gsap.fromTo('.about-content',
        { opacity: 0, x: 50 },
        {
          opacity: 1,
          x: 0,
          duration: 1.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.about-content',
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Animation des valeurs
      gsap.fromTo('.value-card',
        { opacity: 0, y: 60, rotateX: -15 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.8,
          stagger: 0.2,
          scrollTrigger: {
            trigger: '.values-grid',
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Parallax de l'image
      gsap.to(imageRef.current, {
        y: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const values = [
    {
      icon: Heart,
      title: 'Passion',
      description: 'Chaque projet est une nouvelle aventure créative que j\'aborde avec enthousiasme et dévouement.'
    },
    {
      icon: Target,
      title: 'Précision',
      description: 'L\'attention aux détails et la recherche de la perfection technique sont au cœur de mon travail.'
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'J\'explore constamment de nouvelles techniques pour créer des contenus uniques et impactants.'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'Mon engagement pour la qualité se traduit par des résultats qui dépassent les attentes.'
    }
  ];

  return (
    <section 
      ref={sectionRef}
      id="about" 
      className="relative py-20 px-6 bg-gradient-to-b from-dark to-soft-black overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-48 h-48 bg-soft-white/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Portrait Section */}
          <div className="relative">
            <div 
              ref={imageRef}
              className="relative"
            >
              {/* Main Portrait - Taille augmentée */}
              <div className="relative w-full max-w-xl mx-auto">
                <div className="aspect-square rounded-3xl overflow-hidden bg-dark-light/30 backdrop-blur-md border border-soft-white/20">
                  <img
                    src="/sama0.jpg"
                    alt="Portrait créatrice"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary/20 backdrop-blur-sm rounded-2xl animate-float" />
                <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-soft-white/10 backdrop-blur-sm rounded-full animate-float" style={{ animationDelay: '2s' }} />
                
                {/* Glassmorphic Border */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 via-transparent to-soft-white/10 p-1">
                  <div className="w-full h-full rounded-3xl bg-transparent" />
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="about-content">
            <h2 className="text-4xl md:text-5xl font-bold text-soft-white mb-6">
              À propos de <span className="text-primary">moi</span>
            </h2>
            
            <div className="space-y-6 text-lg text-soft-white/80 leading-relaxed">
              <p>
                Bonjour ! Je suis une créatrice de contenu passionnée, spécialisée dans la vidéographie 
                et la photographie. Avec plus de 5 années d'expérience, j'ai eu l'opportunité de 
                travailler avec des marques prestigieuses et des créateurs talentueux.
              </p>
              
              <p>
                Mon approche combine <span className="text-primary font-semibold">technique maîtrisée</span> et 
                <span className="text-primary font-semibold"> vision artistique</span> pour créer des contenus 
                qui racontent des histoires authentiques et captivantes. Chaque projet est une nouvelle 
                opportunité d'explorer les limites de la créativité.
              </p>
              
              <p>
                Je crois profondément que l'image a le pouvoir de transmettre des émotions uniques et 
                de créer des connexions durables avec l'audience. C'est cette philosophie qui guide 
                chacune de mes créations.
              </p>
            </div>

            {/* CTA */}
            <div className="mt-8">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-light backdrop-blur-sm rounded-2xl text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
              >
                Collaborons ensemble
              </a>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mt-24">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-soft-white mb-4">
              Mes <span className="text-primary">valeurs</span>
            </h3>
            <p className="text-soft-white/70 max-w-2xl mx-auto">
              Les principes qui guident mon travail et définissent ma relation avec chaque client.
            </p>
          </div>

          <div className="values-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div
                  key={index}
                  className="value-card group text-center"
                >
                  <div className="relative p-6 bg-dark-light/30 backdrop-blur-md border border-soft-white/10 rounded-2xl hover:border-primary/30 transition-all duration-300 hover:scale-105">
                    {/* Icon */}
                    <div className="inline-flex p-4 bg-gradient-to-br from-primary to-primary-light rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent size={24} className="text-white" />
                    </div>
                    
                    {/* Content */}
                    <h4 className="text-xl font-semibold text-soft-white mb-3 group-hover:text-primary transition-colors">
                      {value.title}
                    </h4>
                    <p className="text-soft-white/70 text-sm leading-relaxed">
                      {value.description}
                    </p>

                    {/* Hover Effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;