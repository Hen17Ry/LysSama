import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ArrowLeft, Play, ExternalLink } from 'lucide-react';
import Navigation from '../components/Navigation';

const Works: React.FC = () => {
  const projects = [
    {
      id: 1,
      title: 'Campaign Luxe Fashion',
      category: 'Vidéo Publicitaire',
      year: '2024',
      description: 'Création complète d\'une campagne vidéo pour une marque de mode luxe, du concept à la post-production.',
      image: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=800',
      video: 'https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['Montage', 'Colorimétrie', 'Motion Design']
    },
    {
      id: 2,
      title: 'Série Documentaire',
      category: 'Contenu Digital',
      year: '2024',
      description: 'Production d\'une série documentaire en 5 épisodes sur l\'entrepreneuriat féminin.',
      image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
      video: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['Interview', 'Narration', 'Storytelling']
    },
    {
      id: 3,
      title: 'Brand Content Beauty',
      category: 'Photographie',
      year: '2023',
      description: 'Shooting photo et création de contenu pour le lancement d\'une nouvelle gamme cosmétique.',
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
      video: null,
      tags: ['Studio', 'Retouche', 'Art Direction']
    },
    {
      id: 4,
      title: 'Clip Musical Indé',
      category: 'Clip Musical',
      year: '2023',
      description: 'Réalisation et montage d\'un clip musical pour un artiste émergent, style cinématographique.',
      image: 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=800',
      video: 'https://images.pexels.com/photos/442540/pexels-photo-442540.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['Cinéma', 'Colorimétrie', 'Narration']
    },
    {
      id: 5,
      title: 'Corporate Tech',
      category: 'Vidéo Corporate',
      year: '2023',
      description: 'Présentation corporate pour une startup tech, alliant modernité et professionnalisme.',
      image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
      video: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['Corporate', 'Animation', 'Présentation']
    },
    {
      id: 6,
      title: 'Fashion Editorial',
      category: 'Photographie',
      year: '2022',
      description: 'Série photographique éditorial pour un magazine de mode, jeu sur les contrastes et textures.',
      image: 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=800',
      video: null,
      tags: ['Editorial', 'Mode', 'Créatif']
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
              Une sélection de projets qui racontent des histoires uniques à travers l'image et la vidéo.
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
                    
                    {/* Video Play Button */}
                    {project.video && (
                      <div className="absolute top-4 right-4 w-10 h-10 bg-primary/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play size={16} className="text-white ml-0.5" />
                      </div>
                    )}

                    {/* External Link */}
                    <div className="absolute top-4 left-4 w-10 h-10 bg-dark-light/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink size={16} className="text-soft-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-primary text-sm font-medium">{project.category}</span>
                      <span className="text-soft-white/50 text-sm">{project.year}</span>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-soft-white mb-3 group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    
                    <p className="text-soft-white/70 text-sm mb-4 line-clamp-3">
                      {project.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-dark-light/70 backdrop-blur-sm border border-soft-white/10 rounded-full text-xs text-soft-white/80"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
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