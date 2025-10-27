import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navigation from '../components/Navigation';
import Hero from '../components/Hero';
import Realisations from '../components/Realisations';
import Services from '../components/Services';
import Brands from '../components/Brands';
import About from '../components/About';
import Process from '../components/Process';
import Contact from '../components/Contact';

gsap.registerPlugin(ScrollTrigger);

const Home: React.FC = () => {
  useEffect(() => {
    // Configuration globale GSAP
    gsap.config({ nullTargetWarn: false });
    
    // Animation d'entrée générale
    gsap.fromTo('.animate-on-load', 
      { opacity: 0, y: 50 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 1.2, 
        stagger: 0.2,
        ease: 'power3.out'
      }
    );

    // Gestion du scroll vers les sections avec ancre
    const handleHashScroll = () => {
      const hash = window.location.hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
      }
    };

    handleHashScroll();
    window.addEventListener('hashchange', handleHashScroll);

    // Nettoyage des ScrollTriggers
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      window.removeEventListener('hashchange', handleHashScroll);
    };
  }, []);

  return (
    <div className="overflow-x-hidden">
      <Navigation />
      <Hero />
      <Realisations />
      <section id="services">
        <Services />
      </section>
      <Brands />
      <section id="about">
        <About />
      </section>
      <Process />
      <section id="contact">
        <Contact />
      </section>
    </div>
  );
};

export default Home;