import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import Navigation from '../components/Navigation';

const Works: React.FC = () => {
  const projects = [
    {
      id: 1,
      title: 'Unboxing & Vidéos Produits',
      description: "Mettons en valeur vos produits avec des vidéos d'unboxing accrocheuses et des présentations détaillées qui suscitent la curiosité et renforcent la confiance de vos clients.",
      image: 'https://img.freepik.com/photos-premium/jeune-influenceur-blogue-vetements-tout-restant-assis-maison_1048944-7659570.jpg',
      hasVideo: true,
      externalLink: 'https://www.instagram.com/reel/DImHTxio-qP/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==' 
    },
    {
      id: 2,
      title: 'Giveaway et Concours',
      description: "Faites plaisir à votre communauté tout en stimulant son engagement ! Grâce à des vidéos dynamiques, je conçois des contenus qui donnent envie de participer, partager et suivre l'évolution de votre marque.",
      image: "https://img.freepik.com/photos-gratuite/heureuse-femme-tenant-cadeaux-coup-moyen_23-2149386902.jpg?t=st=1761562556~exp=1761566156~hmac=07a185c0c09b2c634876047f736b309943f652441d56ad76fea9cb20efc2170a",
      hasVideo: true,
      externalLink: 'https://www.instagram.com/reel/DOmA8jHCL0n/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=='
    },
    {
      id: 3,
      title: 'Récapitulatif événementiel',
      description: "Revivez les moments forts de vos événements à travers des vidéos qui retranscrivent l'énergie sur place. Mariages, lancements, conférences, brunchs, expositions… faites-moi confiance !",
      image: 'https://img.freepik.com/photos-gratuite/photographe-taille-moyenne-couple-marie_23-2150264546.jpg?t=st=1761562844~exp=1761566444~hmac=c5a5a36ce81fe0e8096ece21b3b7c24867024850ae631992394b9c5f8e65b5ec',
      hasVideo: true,
      externalLink: 'https://www.instagram.com/reel/DLYVMkRo10W/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=='
    },
    {
      id: 4,
      title: 'Mode & portraits créatifs',
      description: 'Ma spécialité : des visuels avec une direction artistique affirmée pour mettre en valeur la mode. Chacune de mes créations mettent en avant la beauté et le message de la marque.',
      image: 'https://img.freepik.com/photos-gratuite/portrait-femme-souriante-qui-pose-studio_23-2150368003.jpg?t=st=1761562652~exp=1761566252~hmac=f0220b9eed4dc26409a2937e14640fd91932b23a493c973419b4af37392c930d',
      hasVideo: true,
      externalLink: 'https://www.instagram.com/reel/DNv7s5ZUBEn/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=='
    },
    {
      id: 5,
      title: 'Interviews & Podcast',
      description: "Et si je vous laissais la parole ? A travers des interviews qui révèlent votre personnalité et l'âme de votre marque, je vous mets à l'aise pour partager votre histoire.",
      image: 'https://img.freepik.com/photos-gratuite/point-vue-homme-femme-enregistrant-discussion-direct-camera-faisant-ensemble-episode-podcast-influenceur-style-vie-parlant-invitee-studio-neons-equipement-rpg_482257-48353.jpg?t=st=1761562701~exp=1761566301~hmac=f2bd0935bae1b72decd848298ecae48372e4daebec672b83e0113137c117784d',
      hasVideo: true,
      externalLink: 'https://www.instagram.com/reel/DPuXyYbDEoR/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=='
    },  
    {
      id: 6,
      title: 'Voyage & Découverte',
      description: "Des vidéos immersives qui racontent des destinations, des cultures ou des expériences. Adaptées aux agences de voyage, hôtels, restaurants ou initiatives touristiques, qui offrent de quoi s'évader.",
      image: 'https://img.freepik.com/photos-premium/gens-debout-cloture-bois-regardant-camera-generative-ai_1034463-72100.jpg',
      hasVideo: true,
      externalLink: 'https://www.instagram.com/reel/DBrSNI8NjAR/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=='
    }
  ];

  useEffect(() => {
    // Animation d'entrée des projets
    gsap.fromTo('.project-card',
      { opacity: 0, y: 100, scale: 0.8 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out'
      }
    );

    // Animation du titre principal
    gsap.fromTo('.main-title',
      { opacity: 0, y: -50 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    );
  }, []);

  const handleExternalLinkClick = (e: React.MouseEvent, link: string) => {
    e.stopPropagation(); // Empêche la propagation au parent
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-soft-black">
      <Navigation />
      
      {/* Header */}
      <section className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-soft-white/70 hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft size={20} />
            Retour à l'accueil
          </Link>
          
          <div className="main-title">
            <h1 className="text-4xl md:text-6xl font-bold text-soft-white mb-4">
              Mes <span className="text-primary">Réalisations</span>
            </h1>
            <p className="text-xl text-soft-white/70 max-w-2xl">
              À travers mes réalisations, je mets en lumière des marques, entrepreneurs et créateurs qui souhaitent faire rayonner leur univers. Je travaille sur des projets variés : mode, beauté, gastronomie, culture, artisanat, bien-être, et plus encore — toujours avec une approche humaine, esthétique et stratégique.
            </p>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div
                key={project.id}
                className="project-card group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-2xl bg-dark-light/50 backdrop-blur-md border border-soft-white/10">
                  {/* Image/Video Preview */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-soft-black/80 to-transparent" />
                    
                    {/* External Link Button */}
                    <button
                      onClick={(e) => handleExternalLinkClick(e, project.externalLink)}
                      className="absolute top-4 left-4 w-10 h-10 bg-dark-light/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:scale-110 duration-300"
                      aria-label={`Voir ${project.title}`}
                    >
                      <ExternalLink size={16} className="text-soft-white" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-soft-white mb-3 group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    
                    <p className="text-soft-white/70 text-sm mb-4 line-clamp-3">
                      {project.description}
                    </p>

                    {/* View Project Link */}
                    <a
                      href={project.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary text-sm font-medium hover:gap-3 transition-all"
                    >
                      Voir le projet
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Works;