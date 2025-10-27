import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Video, Camera, CreditCard as Edit3, Palette, Users, Sparkles, } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Services: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  const services = [
    {
      icon: Video,
      title: 'Création de contenu vidéo',
      description: 'De la conception à la réalisation, je vous accompagne dans tous vos projets créatifs avec une expertise technique et une vision artistique unique.',
      features: ['Tournage professionnel', 'Storytelling adapté', 'Optimisation pour chaque plateforme', 'Formats prêts à publier'],
      color: 'from-primary to-primary-light'
    },
    {
      icon: Camera,
      title: 'Montage vidéo & Post-production',
      description: 'Transformez vos rushes en contenus professionnels. Je donne vie à vos idées grâce à une post-production soignée et créative.',
      features: ['Montage de vidéos format short (Instagram, TikTok, YouTube Shorts)', 'Étalonnage colorimétrique', 'Intégration de sous-titres et habillage', 'Animation de textes et transitions', 'Sound design'],
      color: 'from-purple-600 to-purple-400'
    },
    {
      icon: Edit3,
      title: 'Consulting créatif',
      description: 'Accélérez votre croissance avec une stratégie de contenu sur-mesure.Vous avez besoin d une vision extérieure pour propulser votre présence digitale ? Pour les entrepreneurs, marques et créateur.ice.s qui veulent passer au niveau supérieur.',
      features: ['Audit de votre présence digitale actuelle', 'Stratégie de contenu adaptée à vos objectifs', 'Conseils sur les tendances sur lesquelles surfer', 'Optimisation de votre identité en ligne'],
      color: 'from-blue-600 to-blue-400'
    },
    {
      icon: Palette,
      title: 'Direction Artistique',
      description: 'Une vision créative qui sublime votre identité visuelle. Je conçois et orchestre l univers visuel complet de vos projets créatifs',
      features: ['Conception d univers visuels et moodboards', 'Direction de shootings photo et vidéo', 'Coordination avec stylistes, maquilleurs et photographes', 'Création d identité visuelle pour campagnes'],
      color: 'from-green-600 to-green-400'
    },
    {
      icon: Users,
      title: 'Partenariats & Collaborations de marque ',
      description: 'Je collabore avec des marques qui partagent de belles valeurs pour créer du contenu authentique. Forte d une communauté engagée dans l univers mode, lifestyle, beauté et bien-être, je donne vie à vos produits à travers des contenus qui stimulent les conversions.',
      features: ['Création de contenu UGC photo et vidéo', 'Intégration naturelle de vos produits dans mon contenu', 'Stories, posts et Reels sponsorisés sur Instagram et TikTok', 'Exposition auprès d,une audience qualifiée au Bénin et dans la diaspora', 'Respect strict de vos guidelines et de mes valeurs'],
      color: 'from-orange-600 to-orange-400'
    },
    {
      icon: Sparkles,
      title: 'Rédaction de Contenu & Copywriting',
      description: "Avec de l'expérience dans la rédaction web SEO, je rédige des textes qui donnent de la personnalité à votre marque. Chaque mot est choisi pour connecter avec votre audience et atteindre vos objectifs.",
      features: ['Articles de blog optimisés SEO', 'Captions créatives pour Instagram, TikTok et Facebook', 'Copywriting pour sites web et landing pages', 'Contenus adaptés à votre ton et vos valeurs'],
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