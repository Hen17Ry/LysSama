import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Search, Lightbulb, Video, CheckCircle } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Process: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const steps = [
    {
      number: '01',
      icon: Search,
      title: 'Découverte',
      description: 'Échange approfondi sur vos objectifs, votre vision et vos besoins spécifiques.',
      details: [
        'Brief détaillé du projet',
        'Analyse de votre marque',
        'Définition des objectifs',
        'Planning et budget'
      ],
      color: 'from-blue-600 to-blue-400'
    },
    {
      number: '02',
      icon: Lightbulb,
      title: 'Concept',
      description: 'Développement créatif et conception de l\'univers visuel de votre projet.',
      details: [
        'Moodboard et références',
        'Direction artistique',
        'Storyboard si besoin',
        'Validation du concept'
      ],
      color: 'from-purple-600 to-purple-400'
    },
    {
      number: '03',
      icon: Video,
      title: 'Production',
      description: 'Réalisation technique avec le plus haut niveau de qualité et de professionnalisme.',
      details: [
        'Tournage/Shooting',
        'Direction artistique',
        'Capture optimale',
        'Coordination équipe'
      ],
      color: 'from-primary to-primary-light'
    },
    {
      number: '04',
      icon: CheckCircle,
      title: 'Livraison',
      description: 'Finalisation, post-production et livraison de votre projet dans les délais convenus.',
      details: [
        'Montage/Retouche',
        'Validation client',
        'Ajustements finaux',
        'Livraison formats'
      ],
      color: 'from-green-600 to-green-400'
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animation du titre
      gsap.fromTo('.process-title',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: '.process-title',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Animation de la ligne de timeline
      gsap.fromTo('.timeline-line',
        { scaleY: 0, transformOrigin: 'top' },
        {
          scaleY: 1,
          duration: 2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: timelineRef.current,
            start: 'top 80%',
            end: 'bottom 20%',
            scrub: 1
          }
        }
      );

      // Animation des étapes
      steps.forEach((_, index) => {
        gsap.fromTo(`.step-${index}`,
          { 
            opacity: 0, 
            x: index % 2 === 0 ? -100 : 100,
            scale: 0.8
          },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: `.step-${index}`,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      });

      // Pin section pour effet immersif
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 10%',
        end: 'bottom 90%',
        pin: false, // Désactivé sur mobile
        pinSpacing: false
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative py-20 px-6 bg-gradient-to-b from-soft-black via-dark to-soft-black overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-blue-600/3 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="process-title text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-soft-white mb-4">
            Mon <span className="text-primary">Process</span>
          </h2>
          <p className="text-xl text-soft-white/70 max-w-3xl mx-auto">
            Une méthodologie éprouvée en 4 étapes pour transformer vos idées en réalisations 
            exceptionnelles, de la conception à la livraison finale.
          </p>
        </div>

        {/* Timeline */}
        <div ref={timelineRef} className="relative">
          {/* Timeline Line */}
          <div className="timeline-line absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary via-purple-500 to-green-500 rounded-full" />

          {/* Steps */}
          <div className="space-y-24">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              const isEven = index % 2 === 0;
              
              return (
                <div
                  key={index}
                  className={`step-${index} relative flex items-center ${
                    isEven ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  {/* Content Card */}
                  <div className={`w-full lg:w-5/12 ${isEven ? 'pr-8 lg:pr-16' : 'pl-8 lg:pl-16'}`}>
                    <div className="group relative p-8 bg-dark-light/40 backdrop-blur-md border border-soft-white/10 rounded-2xl hover:border-primary/30 transition-all duration-500 hover:scale-105">
                      {/* Step Number */}
                      <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        <span className="text-white font-bold text-xl">{step.number}</span>
                      </div>

                      {/* Content */}
                      <h3 className="text-2xl font-bold text-soft-white mb-4 group-hover:text-primary transition-colors">
                        {step.title}
                      </h3>
                      
                      <p className="text-soft-white/70 mb-6 leading-relaxed">
                        {step.description}
                      </p>

                      {/* Details List */}
                      <ul className="space-y-2">
                        {step.details.map((detail, detailIndex) => (
                          <li 
                            key={detailIndex}
                            className="flex items-center text-sm text-soft-white/60"
                          >
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 flex-shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>

                      {/* Hover Effect */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                  </div>

                  {/* Timeline Dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                    <div className="relative">
                      <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center border-4 border-soft-black shadow-xl`}>
                        <IconComponent size={24} className="text-white" />
                      </div>
                      <div className="absolute inset-0 w-16 h-16 bg-gradient-to-br from-soft-white/20 to-transparent rounded-full animate-ping" />
                    </div>
                  </div>

                  {/* Empty Space for Layout */}
                  <div className="w-full lg:w-5/12" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <div className="inline-flex flex-col items-center gap-4 p-8 bg-gradient-to-br from-primary/10 to-transparent backdrop-blur-md border border-primary/20 rounded-3xl">
            <h3 className="text-2xl font-bold text-soft-white">
              Prêt.e à démarrer votre projet ?
            </h3>
            <p className="text-soft-white/70 max-w-lg">
              Chaque grand projet commence par une simple conversation. 
              Parlons de votre vision et donnons-lui vie ensemble.
            </p>
            <a
              href="#contact"
              className="px-8 py-4 bg-primary hover:bg-primary-light rounded-2xl text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
            >
              Commencer maintenant
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;