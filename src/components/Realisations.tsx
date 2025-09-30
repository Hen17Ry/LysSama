import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ExternalLink, Play } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Realisations: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  const projects = [
    {
      id: 1,
      title: 'Unboxing de produits',
      category: 'Mettons en valeur vos produits avec des vidéos qui accrochent',
      image: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=600',
      hasVideo: true
    },
    {
      id: 2,
      title: 'Giveaway et Concours',
      category: 'Faites plaisir à votre communauté en stimulant leur engagement',
      image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600',
      hasVideo: true
    },
    {
      id: 3,
      title: 'Récapitulatif Événementiel',
      category: 'Révivez les moments forts de vos événements',
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600',
      hasVideo: false
    },
    {
      id: 4,
      title: 'User Generated Content',
      category: 'Créons des vidéos authentiques pour parler directement à votre audience',
      image: 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=600',
      hasVideo: true
    },
    {
      id: 5,
      title: 'Fashion & Lifestyle',
      category: 'Partageons ensemble l élégance et lart de vivre',
      image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=600',
      hasVideo: true
    },  
    {
      id: 6,
      title: 'Carrousels & Visuels Réseaux Sociaux',
      category: 'Partageons vos messages à travers des visuels esthétiques',
      image: 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=600',
      hasVideo: false
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animation du titre de section
      gsap.fromTo('.section-title',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: '.section-title',
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Animation de la grille de projets
      gsap.fromTo('.project-item',
        { opacity: 0, y: 100, scale: 0.8 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.projects-grid',
            start: 'top 85%',
            end: 'bottom 15%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Parallax des éléments de fond
      gsap.to('.bg-element', {
        y: -50,
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

  return (
    <section 
      ref={sectionRef} 
      id="realisations" 
      className="relative py-20 px-6 bg-gradient-to-b from-soft-black to-dark overflow-hidden"
    >
      {/* Background Decorative Elements */}
      <div className="bg-element absolute top-10 right-10 w-40 h-40 bg-primary/5 backdrop-blur-sm rounded-full" />
      <div className="bg-element absolute bottom-20 left-10 w-32 h-32 bg-soft-white/5 backdrop-blur-sm rounded-2xl" />

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="section-title text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-soft-white mb-4">
            Mes <span className="text-primary">Réalisations</span>
          </h2>
          <p className="text-xl text-soft-white/70 max-w-2xl mx-auto">
            Une sélection de projets qui racontent des histoires uniques à travers l'image et la vidéo.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="projects-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {projects.map((project) => (
            <div
              key={project.id}
              className="project-item group relative cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-2xl bg-dark-light/30 backdrop-blur-md border border-soft-white/10 hover:border-primary/30 transition-all duration-500">
                {/* Image Container */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-soft-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                  
                  {/* Video Play Button */}
                  {project.hasVideo && (
                    <div className="absolute top-4 right-4 w-10 h-10 bg-primary/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110">
                      <Play size={16} className="text-white ml-0.5" />
                    </div>
                  )}

                  {/* External Link */}
                  <div className="absolute top-4 left-4 w-10 h-10 bg-dark-light/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110">
                    <ExternalLink size={16} className="text-soft-white" />
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="text-primary text-sm font-medium">{project.category}</span>
                    <h3 className="text-white text-lg font-semibold mt-1 group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                  </div>
                </div>

                {/* Glassmorphic Border Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            </div>
          ))}
        </div>

        {/* CTA to Works Page */}
        <div className="text-center">
          <Link
            to="/works"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary/10 hover:bg-primary/20 backdrop-blur-md border border-primary/30 rounded-2xl text-primary font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
          >
            Voir tous mes projets
            <ExternalLink size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Realisations;