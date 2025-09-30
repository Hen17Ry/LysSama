import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Video, Camera, CreditCard as Edit3, Palette, Monitor, Sparkles } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Services: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  const services = [
    {
      icon: Video,
      title: 'Montage Vidéo',
      description: 'Création et montage de contenus vidéo professionnels, de la publicité aux documentaires.',
      features: ['Colorimétrie avancée', 'Motion Design', 'Sound Design', 'Effets visuels'],
      color: 'from-primary to-primary-light'
    },
    {
      icon: Camera,
      title: 'Photographie',
      description: 'Shooting photo créatif pour vos campagnes, portraits et contenus éditoriaux.',
      features: ['Studio & Extérieur', 'Retouche professionnelle', 'Direction artistique', 'Éclairage créatif'],
      color: 'from-purple-600 to-purple-400'
    },
    {
      icon: Edit3,
      title: 'Création de Contenu',
      description: 'Développement de contenus digitaux adaptés à vos plateformes et votre audience.',
      features: ['Stratégie de contenu', 'Réseaux sociaux', 'Storytelling', 'Brand Content'],
      color: 'from-blue-600 to-blue-400'
    },
    {
      icon: Palette,
      title: 'Direction Artistique',
      description: 'Conception et supervision créative de vos projets visuels de A à Z.',
      features: ['Concept créatif', 'Moodboard', 'Art direction', 'Supervision'],
      color: 'from-green-600 to-green-400'
    },
    {
      icon: Monitor,
      title: 'Post-Production',
      description: 'Finalisation technique et créative de vos contenus avec les derniers outils.',
      features: ['Étalonnage', 'Compositing', 'Animation 2D/3D', 'Optimisation'],
      color: 'from-orange-600 to-orange-400'
    },
    {
      icon: Sparkles,
      title: 'Consulting Créatif',
      description: 'Accompagnement stratégique pour optimiser votre communication visuelle.',
      features: ['Audit créatif', 'Stratégie visuelle', 'Formation équipe', 'Suivi projet'],
      color: 'from-pink-600 to-pink-400'
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animation du titre
      gsap.fromTo('.services-title',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: '.services-title',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Animation des cartes de service
      gsap.fromTo('.service-card',
        { opacity: 0, y: 80, rotateX: -15 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.services-grid',
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Pin section pendant le scroll
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 20%',
        end: 'bottom 80%',
        pin: false, // Désactivé pour éviter les conflits sur mobile
        pinSpacing: false
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="services" 
      className="relative py-20 px-6 bg-gradient-to-b from-dark to-soft-black overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="services-title text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-soft-white mb-4">
            Mes <span className="text-primary">Services</span>
          </h2>
          <p className="text-xl text-soft-white/70 max-w-3xl mx-auto">
            De la conception à la réalisation, je vous accompagne dans tous vos projets créatifs 
            avec une expertise technique et une vision artistique unique.
          </p>
        </div>

        {/* Services Grid */}
        <div className="services-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div
                key={index}
                className="service-card group relative"
              >
                <div className="relative h-full p-8 bg-dark-light/30 backdrop-blur-md border border-soft-white/10 rounded-2xl hover:border-primary/30 transition-all duration-500 hover:transform hover:scale-105">
                  {/* Icon */}
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${service.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent size={32} className="text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-soft-white mb-4 group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  
                  <p className="text-soft-white/70 mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li 
                        key={featureIndex}
                        className="flex items-center text-sm text-soft-white/60"
                      >
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Glassmorphic Hover Effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  
                  {/* Bottom Glow */}
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary/20 to-primary-light/20 backdrop-blur-md border border-primary/30 rounded-2xl">
            <Sparkles size={20} className="text-primary" />
            <span className="text-soft-white font-medium">
              Prête à donner vie à votre vision créative
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;