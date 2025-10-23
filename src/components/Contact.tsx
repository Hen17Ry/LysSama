import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Send, Mail, Phone, MapPin, Instagram, Linkedin, Camera } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Contact: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    project: '',
    budget: '',
    message: ''
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animation du titre
      gsap.fromTo('.contact-title',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: '.contact-title',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Animation du formulaire
      gsap.fromTo('.contact-form',
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 1.2,
          scrollTrigger: {
            trigger: '.contact-form',
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Animation des infos de contact
      gsap.fromTo('.contact-info',
        { opacity: 0, x: 50 },
        {
          opacity: 1,
          x: 0,
          duration: 1.2,
          scrollTrigger: {
            trigger: '.contact-info',
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Animation des champs de formulaire
      gsap.fromTo('.form-field',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          scrollTrigger: {
            trigger: '.contact-form',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulation d'envoi de formulaire
    console.log('Form submitted:', formData);
    // Ici vous ajouteriez la logique d'envoi réel
    alert('Message envoyé ! Je vous répondrai rapidement.');
    setFormData({
      name: '',
      email: '',
      project: '',
      budget: '',
      message: ''
    });
  };

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'melyssa.kekeli@gmail.com',
      link: 'mailto:melyssa.kekeli@gmail.com'
    },
    {
      icon: Phone,
      label: 'Téléphone',
      value: '+2290151864239',
      link: 'tel:+2290151864239'
    },
    {
      icon: MapPin,
      label: 'Localisation',
      value: 'Bénin, Cotonou',
      link: '#'
    }
  ];

  const socialLinks = [
    {
      icon: Instagram,
      label: 'Instagram',
      link: 'https://www.instagram.com/lys__sama'
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      link: 'https://www.linkedin.com/in/melyssacossou'
    },
    {
      icon: Camera,
      label: 'Portfolio',
      link: '/works'
    }
  ];

  return (
    <section 
      ref={sectionRef}
      id="contact" 
      className="relative py-20 px-6 bg-gradient-to-b from-soft-black to-dark overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-soft-white/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="contact-title text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-soft-white mb-4">
            Discutons de votre <span className="text-primary">projet</span>
          </h2>
          <p className="text-xl text-soft-white/70 max-w-3xl mx-auto">
            Prête à transformer vos idées en réalité ? Contactez-moi pour créer ensemble 
            quelque chose d'exceptionnel qui marquera votre audience.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div className="contact-form">
            <div className="p-8 bg-dark-light/30 backdrop-blur-md border border-soft-white/10 rounded-3xl">
              <h3 className="text-2xl font-bold text-soft-white mb-6">
                Envoyez-moi un message
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nom */}
                <div className="form-field">
                  <label htmlFor="name" className="block text-sm font-medium text-soft-white/80 mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-soft-black/50 border border-soft-white/20 rounded-xl text-soft-white placeholder-soft-white/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                    placeholder="Votre nom"
                  />
                </div>

                {/* Email */}
                <div className="form-field">
                  <label htmlFor="email" className="block text-sm font-medium text-soft-white/80 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-soft-black/50 border border-soft-white/20 rounded-xl text-soft-white placeholder-soft-white/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                    placeholder="votre@email.com"
                  />
                </div>

                {/* Type de projet */}
                <div className="form-field">
                  <label htmlFor="project" className="block text-sm font-medium text-soft-white/80 mb-2">
                    Type de projet
                  </label>
                  <select
                    id="project"
                    name="project"
                    value={formData.project}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-soft-black/50 border border-soft-white/20 rounded-xl text-soft-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                  >
                    <option value="">Sélectionnez un type</option>
                    <option value="video-publicitaire">Vidéo Publicitaire</option>
                    <option value="photographie">Photographie</option>
                    <option value="contenu-digital">Contenu Digital</option>
                    <option value="clip-musical">Clip Musical</option>
                    <option value="corporate">Vidéo Corporate</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                {/* Budget */}
                <div className="form-field">
                  <label htmlFor="budget" className="block text-sm font-medium text-soft-white/80 mb-2">
                    Budget estimé
                  </label>
                  <select
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-soft-black/50 border border-soft-white/20 rounded-xl text-soft-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                  >
                    <option value="">Budget (optionnel)</option>
                    <option value="1000-3000">1 000€ - 3 000€</option>
                    <option value="3000-5000">3 000€ - 5 000€</option>
                    <option value="5000-10000">5 000€ - 10 000€</option>
                    <option value="10000+">10 000€+</option>
                  </select>
                </div>

                {/* Message */}
                <div className="form-field">
                  <label htmlFor="message" className="block text-sm font-medium text-soft-white/80 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 bg-soft-black/50 border border-soft-white/20 rounded-xl text-soft-white placeholder-soft-white/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors resize-none"
                    placeholder="Décrivez votre projet, vos objectifs, et vos attentes..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full group relative px-8 py-4 bg-primary hover:bg-primary-light rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
                >
                  <span className="flex items-center justify-center gap-2">
                    Envoyer le message
                    <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </form>
            </div>
          </div>

          {/* Contact Info */}
          <div className="contact-info space-y-8">
            {/* Contact Details */}
            <div className="p-8 bg-dark-light/30 backdrop-blur-md border border-soft-white/10 rounded-3xl">
              <h3 className="text-2xl font-bold text-soft-white mb-6">
                Informations de contact
              </h3>
              
              <div className="space-y-6">
                {contactInfo.map((info, index) => {
                  const IconComponent = info.icon;
                  return (
                    <a
                      key={index}
                      href={info.link}
                      className="group flex items-center gap-4 p-4 rounded-xl hover:bg-soft-white/5 transition-colors"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <IconComponent size={20} className="text-white" />
                      </div>
                      <div>
                        <div className="text-sm text-soft-white/60">{info.label}</div>
                        <div className="text-soft-white group-hover:text-primary transition-colors">
                          {info.value}
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Social Links */}
            <div className="p-8 bg-dark-light/30 backdrop-blur-md border border-soft-white/10 rounded-3xl">
              <h3 className="text-xl font-bold text-soft-white mb-6">
                Suivez-moi
              </h3>
              
              <div className="flex gap-4">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group w-12 h-12 bg-soft-black/50 border border-soft-white/20 rounded-xl flex items-center justify-center hover:border-primary hover:bg-primary/10 transition-all duration-300 hover:scale-110"
                      title={social.label}
                    >
                      <IconComponent size={18} className="text-soft-white/80 group-hover:text-primary transition-colors" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="p-8 bg-gradient-to-br from-primary/10 to-transparent backdrop-blur-md border border-primary/20 rounded-3xl">
              <h3 className="text-xl font-bold text-soft-white mb-4">
                Réponse rapide garantie
              </h3>
              <p className="text-soft-white/70 mb-4">
                Je m'engage à répondre à toutes les demandes dans les 24h ouvrées.
              </p>
              <div className="flex items-center gap-2 text-sm text-primary">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Actuellement disponible pour de nouveaux projets
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-20 pt-12 border-t border-soft-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center">
              <Camera size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-soft-white">Portfolio</span>
          </div>
          <p className="text-soft-white/50 text-sm">
            © 2024 Portfolio Créatrice. Tous droits réservés.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Contact;