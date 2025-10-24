import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
// (Optionnel Next.js) : décommente si tu utilises un basePath
// import { useRouter } from "next/router";

gsap.registerPlugin(ScrollTrigger);

type Brand = {
  name: string;
  src: string;      // ex: "/logos/bnp.png"
  href?: string;
  invertOnDark?: boolean;
};

const Brands: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const countersStartedRef = useRef<boolean>(false);

  // (Optionnel Next.js) si tu utilises basePath ou assetPrefix :
  // const { basePath = "" } = useRouter() as any;
  // const asset = (p: string) => `${basePath}${p}`;
  // Sinon, en React classique / Next sans basePath :
  const asset = (p: string) => p;

  const brands: Brand[] = [
    { name: "Bénin On Point", src: asset("/logos/bop.PNG") },
    { name: "Abriel Bijoux", src: asset("/logos/Abriel.jpg") },
    { name: "Irun", src: asset("/logos/Irun.jpg") },
    { name: "Miwakpon", src: asset("/logos/miwakpon.jpg") },
    { name: "La maison des bijoux", src: asset("/logos/bijoux.PNG") },
    { name: "Look update", src: asset("/logos/update.jpg") },
    { name: "Polaroid industry", src: asset("/logos/Polaroid.jpg") },
    { name: "Shine together", src: asset("/logos/Shine.PNG") },
    { name: "Omorfia", src: asset("/logos/Omorfia.jpg") },
    { name: "La flotte 229", src: asset("/logos/flotte.jpg") },
    { name: "Tantie Food", src: asset("/logos/Tantie.jpg") },
    { name: "Gogotinkpon", src: asset("/logos/gogo.jpg") },
    { name: "Mister Content", src: asset("/logos/mister.jpg") },
  ];

  const stats = [
    { display: "100+", target: 100, label: "Projets réalisés" },
    { display: "30+", target: 30, label: "Clients satisfaits" },
    { display: "2+", target: 2, label: "Années d'expérience" },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".brands-title", { opacity: 0, y: 50 }, {
        opacity: 1, y: 0, duration: 1,
        scrollTrigger: { trigger: ".brands-title", start: "top 80%", toggleActions: "play none none reverse" },
      });

      const startCounters = () => {
        if (countersStartedRef.current) return;
        countersStartedRef.current = true;
        const numbers = gsap.utils.toArray<HTMLSpanElement>(".stat-number");
        numbers.forEach((el) => {
          const targetValue = Number(el.dataset.target || "0");
          const hasPlus = el.dataset.hasPlus === "true";
          const counter = { value: 0 };
          gsap.to(counter, {
            value: targetValue, duration: 2, ease: "power2.out",
            onUpdate: () => { el.textContent = hasPlus ? `${Math.floor(counter.value)}+` : `${Math.floor(counter.value)}`; },
          });
        });
        gsap.fromTo(".stats-wrap", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" });
      };

      ScrollTrigger.create({ trigger: ".stats-wrap", start: "top 80%", once: true, onEnter: startCounters });

      const carousel = carouselRef.current;
      if (carousel) {
        const totalWidth = carousel.scrollWidth / 2;
        gsap.set(carousel, { x: 0 });
        gsap.to(carousel, { x: -totalWidth, duration: 20, ease: "none", repeat: -1 });
      }

      gsap.fromTo(".brand-logo", { opacity: 0, scale: 0.8, rotateY: -45 }, {
        opacity: 1, scale: 1, rotateY: 0, duration: 0.6, stagger: 0.1,
        scrollTrigger: { trigger: ".brands-carousel", start: "top 85%", toggleActions: "play none none reverse" },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const LogoImg: React.FC<{ brand: Brand }> = ({ brand }) => (
    <img
      src={brand.src}
      alt={brand.name}
      loading="lazy"
      decoding="async"
      width={160} height={160}
      // ⬇️ MODIF: enlever le padding pour que l'image prenne presque tout
      className="w-full h-full object-contain p-0 md:p-1 opacity-95 group-hover:opacity-100 transition-all duration-300"
      onError={(e) => {
        console.error("Logo failed to load:", brand.name, brand.src);
        const parent = (e.currentTarget.parentElement as HTMLElement | null);
        if (parent) {
          const initials = brand.name.split(" ").map(w => w[0] || "").join("").slice(0,3).toUpperCase();
          parent.innerHTML = `<span style="font-weight:700;color:#e5e7eb;font-size:20px">${initials}</span>`;
          parent.style.background = "rgba(255,255,255,0.06)";
          parent.style.border = "1px solid rgba(255,255,255,0.2)";
        }
      }}
    />
  );

  return (
    <section ref={sectionRef} className="relative py-20 px-6 bg-gradient-to-b from-soft-black to-dark overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-10 w-2 h-20 bg-gradient-to-b from-transparent via-primary to-transparent opacity-30" />
        <div className="absolute top-1/3 right-10 w-2 h-32 bg-gradient-to-b from-transparent via-soft-white/20 to-transparent opacity-30" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="brands-title text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-soft-white mb-4">
            Ils me font <span className="text-primary">confiance</span>
          </h2>
          <p className="text-xl text-soft-white/70 max-w-2xl mx-auto">
            Marques et créateurs qui ont choisi mon expertise pour leurs projets visuels.
          </p>
        </div>

        {/* Carrousel */}
        <div className="brands-carousel overflow-hidden">
          <div ref={carouselRef} className="flex items-center gap-16 w-max">
            {[...brands, ...brands].map((brand, index) => (
              <div key={`${brand.name}-${index}`} className="brand-logo flex-shrink-0 group cursor-pointer">
                {/* ⬇️ MODIF: conteneur plus grand = logo plus grand */}
                <div className="relative w-40 h-40 md:w-44 md:h-44 lg:w-48 lg:h-48 flex items-center justify-center">
                  <div className="w-full h-full bg-dark-light/40 backdrop-blur-md border border-soft-white/10 rounded-2xl overflow-hidden flex items-center justify-center shadow-lg group-hover:border-primary/40 group-hover:shadow-primary/10 transition-all duration-300 group-hover:scale-110">
                    <LogoImg brand={brand} />
                  </div>

                  {/* Effets */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-sm text-soft-white/60 whitespace-nowrap">{brand.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="stats-wrap mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center p-6 bg-dark-light/20 backdrop-blur-md border border-soft-white/10 rounded-2xl">
              <div className="text-4xl font-bold text-primary mb-2">
                <span className="stat-number inline-block" data-target={stat.target} data-has-plus={stat.display.endsWith("+") ? "true" : "false"}>
                  {stat.display.endsWith("+") ? "0+" : "0"}
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
