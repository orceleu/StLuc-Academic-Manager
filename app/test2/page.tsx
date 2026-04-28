"use client";

import { useState, useEffect, useRef } from "react";

// ============================================================
// TYPES
// ============================================================
type PlanId = "starter" | "pro" | "business";

interface Plan {
  id: PlanId;
  name: string;
  price: { monthly: number; yearly: number };
  credits: { monthly: number; yearly: number };
  badge?: string;
  features: string[];
  cta: string;
  highlight: boolean;
}

interface FAQ {
  q: string;
  a: string;
}

// ============================================================
// DATA
// ============================================================
const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: { monthly: 9, yearly: 7 },
    credits: { monthly: 50, yearly: 50 },
    features: [
      "50 crédits / mois",
      "Image to Video (Kling 3.0)",
      "Text to Video",
      "Résolution 720p",
      "Téléchargement MP4",
      "Support email",
    ],
    cta: "Commencer gratuitement",
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: { monthly: 29, yearly: 23 },
    credits: { monthly: 200, yearly: 200 },
    badge: "Le plus populaire",
    features: [
      "200 crédits / mois",
      "Image to Video (Kling 3.0)",
      "Text to Video",
      "Lip Sync IA inclus",
      "Résolution 1080p",
      "Génération prioritaire",
      "API Access",
      "Support prioritaire",
    ],
    cta: "Démarrer en Pro",
    highlight: true,
  },
  {
    id: "business",
    name: "Business",
    price: { monthly: 79, yearly: 63 },
    credits: { monthly: 600, yearly: 600 },
    features: [
      "600 crédits / mois",
      "Tous les modèles inclus",
      "Lip Sync haute fidélité",
      "Résolution 4K",
      "Génération ultra-prioritaire",
      "API Access + Webhooks",
      "Bulk generation (30 vidéos)",
      "Manager dédié",
    ],
    cta: "Contacter l'équipe",
    highlight: false,
  },
];

const FAQS: FAQ[] = [
  {
    q: "Qu'est-ce qu'un crédit ?",
    a: "1 crédit = 1 génération vidéo de ~4 secondes. Les vidéos plus longues consomment proportionnellement plus de crédits. Les crédits non utilisés ne sont pas reportés au mois suivant.",
  },
  {
    q: "Quelle est la durée maximale d'une vidéo ?",
    a: "Notre pipeline d'assemblage automatique permet de générer des vidéos jusqu'à 5 minutes en concaténant des clips de haute qualité. La voix off et les sous-titres sont synchronisés automatiquement.",
  },
  {
    q: "Puis-je annuler à tout moment ?",
    a: "Oui, absolument. Aucun engagement, aucun frais de résiliation. Vous pouvez annuler depuis votre dashboard en 2 clics. Votre accès reste actif jusqu'à la fin de la période payée.",
  },
  {
    q: "Quels modèles IA utilisez-vous ?",
    a: "Nous utilisons Kling 3.0 pour la génération vidéo (le meilleur rapport qualité/prix du marché), ElevenLabs pour les voix off, et Sync.so / VEED Fabric 1.0 pour le lip sync.",
  },
  {
    q: "Puis-je utiliser les vidéos commercialement ?",
    a: "Oui. Toutes les vidéos générées vous appartiennent entièrement. Vous pouvez les utiliser pour YouTube, TikTok, Instagram Reels, ou toute autre plateforme commerciale.",
  },
];

const STATS = [
  { value: "2M+", label: "Vidéos générées" },
  { value: "12K+", label: "Créateurs actifs" },
  { value: "4.9★", label: "Note moyenne" },
  { value: "60s", label: "Délai moyen de génération" },
];

const FEATURES = [
  {
    icon: "⚡",
    title: "Image to Video",
    desc: "Transformez n'importe quelle image en vidéo cinématique en quelques secondes avec Kling 3.0.",
  },
  {
    icon: "✍️",
    title: "Text to Video",
    desc: "Décrivez votre scène en texte, obtenez une vidéo prête à publier. Aucune compétence requise.",
  },
  {
    icon: "👄",
    title: "Lip Sync IA",
    desc: "Synchronisez n'importe quelle voix à un visage avec une précision phonème par phonème.",
  },
  {
    icon: "🎙️",
    title: "Voix off IA",
    desc: "100+ voix réalistes en 30+ langues via ElevenLabs. Jamais besoin d'un micro.",
  },
  {
    icon: "📹",
    title: "Vidéos longues",
    desc: "Pipeline d'assemblage automatique pour créer des vidéos jusqu'à 5 minutes, prêtes à uploader.",
  },
  {
    icon: "🚀",
    title: "Bulk Generation",
    desc: "Générez 30 variations d'une vidéo en une seule opération. Parfait pour les créateurs en masse.",
  },
];

// ============================================================
// HOOKS
// ============================================================
function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const handler = () => setY(window.scrollY);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return y;
}

function useInView(ref: React.RefObject<HTMLElement | null>, threshold = 0.15) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return inView;
}

// ============================================================
// SMALL COMPONENTS
// ============================================================
function AnimatedSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(32px)",
        transition: "opacity 0.7s ease, transform 0.7s ease",
      }}
    >
      {children}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 12px",
        borderRadius: "100px",
        fontSize: "12px",
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        background: "rgba(255,220,80,0.12)",
        color: "#FFDC50",
        border: "1px solid rgba(255,220,80,0.25)",
      }}
    >
      {children}
    </span>
  );
}

function GradientText({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        background:
          "linear-gradient(135deg, #fff 0%, #FFDC50 50%, #FF8C42 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      {children}
    </span>
  );
}

function PrimaryButton({
  children,
  large = false,
  onClick,
}: {
  children: React.ReactNode;
  large?: boolean;
  onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: large ? "16px 32px" : "12px 24px",
        fontSize: large ? "16px" : "14px",
        fontWeight: 700,
        fontFamily: "'DM Sans', sans-serif",
        background: hovered
          ? "linear-gradient(135deg, #FFE566 0%, #FF8C42 100%)"
          : "linear-gradient(135deg, #FFDC50 0%, #FF9D50 100%)",
        color: "#0A0A0A",
        border: "none",
        borderRadius: "12px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 12px 40px rgba(255,220,80,0.4)"
          : "0 4px 20px rgba(255,220,80,0.2)",
        letterSpacing: "-0.01em",
      }}
    >
      {children}
    </button>
  );
}

function GhostButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "12px 24px",
        fontSize: "14px",
        fontWeight: 600,
        fontFamily: "'DM Sans', sans-serif",
        background: hovered ? "rgba(255,255,255,0.08)" : "transparent",
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: "12px",
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
    >
      {children}
    </button>
  );
}

// ============================================================
// NAV
// ============================================================
function Nav({ scrollY }: { scrollY: number }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrolled = scrollY > 40;

  const links = [
    { label: "Fonctionnalités", href: "#features" },
    { label: "Tarifs", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: scrolled ? "12px 0" : "20px 0",
        background: scrolled ? "rgba(10,10,10,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <a
          href="#"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #FFDC50, #FF8C42)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              fontWeight: 900,
            }}
          >
            ▶
          </div>
          <span
            style={{
              fontSize: "18px",
              fontWeight: 800,
              color: "#fff",
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "-0.03em",
            }}
          >
            FrameForge
          </span>
        </a>

        {/* Desktop links */}
        <div
          style={{ display: "flex", gap: "32px", alignItems: "center" }}
          className="desktop-nav"
        >
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              style={{
                color: "rgba(255,255,255,0.65)",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: 500,
                fontFamily: "'DM Sans', sans-serif",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.65)")
              }
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <GhostButton>Se connecter</GhostButton>
          <PrimaryButton>Essai gratuit →</PrimaryButton>
        </div>
      </div>
    </nav>
  );
}

// ============================================================
// HERO
// ============================================================
function Hero() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const cards = [
    { label: "Image → Vidéo", icon: "🖼️", time: "~12s" },
    { label: "Texte → Vidéo", icon: "✍️", time: "~18s" },
    { label: "Lip Sync", icon: "👄", time: "~8s" },
  ];

  return (
    <section
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        padding: "120px 24px 80px",
      }}
    >
      {/* Background effects */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "900px",
            height: "600px",
            background:
              "radial-gradient(ellipse, rgba(255,220,80,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            left: "-10%",
            width: "500px",
            height: "500px",
            background:
              "radial-gradient(circle, rgba(255,140,66,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        {/* Grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage:
              "radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%)",
          }}
        />
      </div>

      <div
        style={{
          maxWidth: "900px",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.6s ease 0.1s",
            marginBottom: "24px",
          }}
        >
          <Badge>✦ Nouvelle génération de contenu vidéo IA</Badge>
        </div>

        <h1
          style={{
            fontSize: "clamp(48px, 8vw, 88px)",
            fontWeight: 900,
            fontFamily: "'DM Sans', sans-serif",
            lineHeight: 1.02,
            letterSpacing: "-0.04em",
            color: "#fff",
            margin: "0 0 24px",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transition: "all 0.7s ease 0.2s",
          }}
        >
          Crée des vidéos virales
          <br />
          <GradientText>en 60 secondes.</GradientText>
        </h1>

        <p
          style={{
            fontSize: "clamp(16px, 2.5vw, 20px)",
            color: "rgba(255,255,255,0.55)",
            maxWidth: "600px",
            margin: "0 auto 40px",
            lineHeight: 1.6,
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 400,
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transition: "all 0.7s ease 0.35s",
          }}
        >
          Image to Video, Text to Video, Lip Sync IA. Le pipeline complet pour
          les créateurs de contenu faceless — sans studio, sans caméra, sans
          compétences techniques.
        </p>

        <div
          style={{
            display: "flex",
            gap: "16px",
            justifyContent: "center",
            flexWrap: "wrap",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transition: "all 0.7s ease 0.5s",
            marginBottom: "64px",
          }}
        >
          <PrimaryButton large>Commencer gratuitement →</PrimaryButton>
          <GhostButton>▶ Voir la démo</GhostButton>
        </div>

        {/* Demo cards */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            justifyContent: "center",
            flexWrap: "wrap",
            opacity: visible ? 1 : 0,
            transition: "all 0.8s ease 0.7s",
          }}
        >
          {cards.map((c, i) => (
            <div
              key={i}
              style={{
                padding: "16px 24px",
                borderRadius: "16px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                backdropFilter: "blur(10px)",
              }}
            >
              <span style={{ fontSize: "24px" }}>{c.icon}</span>
              <div style={{ textAlign: "left" }}>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#fff",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {c.label}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.4)",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Génération {c.time}
                </div>
              </div>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#22c55e",
                  boxShadow: "0 0 8px #22c55e",
                }}
              />
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div
          style={{
            marginTop: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            opacity: visible ? 1 : 0,
            transition: "all 0.8s ease 0.9s",
          }}
        >
          <div style={{ display: "flex" }}>
            {["👤", "👤", "👤", "👤", "👤"].map((_, i) => (
              <div
                key={i}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: `hsl(${i * 40 + 200}, 60%, 50%)`,
                  border: "2px solid #0A0A0A",
                  marginLeft: i === 0 ? 0 : "-8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                }}
              >
                {["😊", "🙂", "😎", "🤩", "😄"][i]}
              </div>
            ))}
          </div>
          <div style={{ textAlign: "left" }}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#fff",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              12 000+ créateurs actifs
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.4)",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              ⭐⭐⭐⭐⭐ 4.9/5 de moyenne
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// STATS
// ============================================================
function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);

  return (
    <section
      ref={ref}
      style={{
        padding: "40px 24px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "32px",
        }}
      >
        {STATS.map((s, i) => (
          <div
            key={i}
            style={{
              textAlign: "center",
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(20px)",
              transition: `all 0.5s ease ${i * 0.1}s`,
            }}
          >
            <div
              style={{
                fontSize: "40px",
                fontWeight: 900,
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: "-0.04em",
                background: "linear-gradient(135deg, #FFDC50, #FF8C42)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "rgba(255,255,255,0.45)",
                fontFamily: "'DM Sans', sans-serif",
                marginTop: "4px",
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ============================================================
// FEATURES
// ============================================================
function Features() {
  return (
    <section id="features" style={{ padding: "120px 24px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <Badge>✦ Fonctionnalités</Badge>
          <h2
            style={{
              fontSize: "clamp(32px, 5vw, 54px)",
              fontWeight: 900,
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "-0.04em",
              color: "#fff",
              margin: "16px 0 16px",
            }}
          >
            Tout ce qu'il faut pour
            <br />
            <GradientText>scaler votre contenu</GradientText>
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.45)",
              fontSize: "18px",
              fontFamily: "'DM Sans', sans-serif",
              maxWidth: "560px",
              margin: "0 auto",
            }}
          >
            Un pipeline complet pour générer, assembler et exporter des vidéos
            prêtes à publier.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "20px",
          }}
        >
          {FEATURES.map((f, i) => (
            <AnimatedSection key={i}>
              <FeatureCard {...f} delay={i * 0.08} />
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
  delay,
}: {
  icon: string;
  title: string;
  desc: string;
  delay: number;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "32px",
        borderRadius: "20px",
        background: hovered
          ? "rgba(255,255,255,0.06)"
          : "rgba(255,255,255,0.03)",
        border: hovered
          ? "1px solid rgba(255,220,80,0.2)"
          : "1px solid rgba(255,255,255,0.07)",
        transition: "all 0.25s ease",
        cursor: "default",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
      }}
    >
      <div style={{ fontSize: "32px", marginBottom: "16px" }}>{icon}</div>
      <h3
        style={{
          fontSize: "18px",
          fontWeight: 700,
          color: "#fff",
          fontFamily: "'DM Sans', sans-serif",
          marginBottom: "8px",
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: "14px",
          color: "rgba(255,255,255,0.45)",
          fontFamily: "'DM Sans', sans-serif",
          lineHeight: 1.6,
        }}
      >
        {desc}
      </p>
    </div>
  );
}

// ============================================================
// HOW IT WORKS
// ============================================================
function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Uploadez ou décrivez",
      desc: "Importez une image ou saisissez simplement votre prompt en texte.",
    },
    {
      num: "02",
      title: "L'IA génère",
      desc: "Kling 3.0 crée votre vidéo en quelques secondes. ElevenLabs ajoute la voix off.",
    },
    {
      num: "03",
      title: "Exportez & publiez",
      desc: "Téléchargez votre vidéo en HD, prête à uploader sur YouTube, TikTok ou Reels.",
    },
  ];

  return (
    <section
      style={{
        padding: "120px 24px",
        background: "rgba(255,255,255,0.015)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <Badge>✦ Comment ça marche</Badge>
          <h2
            style={{
              fontSize: "clamp(32px, 5vw, 54px)",
              fontWeight: 900,
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "-0.04em",
              color: "#fff",
              margin: "16px 0",
            }}
          >
            3 étapes, <GradientText>1 vidéo virale</GradientText>
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "32px",
            position: "relative",
          }}
        >
          {steps.map((s, i) => (
            <AnimatedSection key={i}>
              <div style={{ position: "relative" }}>
                {i < steps.length - 1 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "24px",
                      right: "-16px",
                      width: "32px",
                      height: "2px",
                      background:
                        "linear-gradient(90deg, rgba(255,220,80,0.4), transparent)",
                      display: "none",
                    }}
                    className="step-arrow"
                  />
                )}
                <div
                  style={{
                    fontSize: "56px",
                    fontWeight: 900,
                    fontFamily: "'DM Sans', sans-serif",
                    letterSpacing: "-0.06em",
                    background:
                      "linear-gradient(135deg, rgba(255,220,80,0.3), rgba(255,140,66,0.1))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    marginBottom: "16px",
                  }}
                >
                  {s.num}
                </div>
                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "#fff",
                    fontFamily: "'DM Sans', sans-serif",
                    marginBottom: "8px",
                  }}
                >
                  {s.title}
                </h3>
                <p
                  style={{
                    fontSize: "15px",
                    color: "rgba(255,255,255,0.45)",
                    fontFamily: "'DM Sans', sans-serif",
                    lineHeight: 1.6,
                  }}
                >
                  {s.desc}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// PRICING
// ============================================================
function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" style={{ padding: "120px 24px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <Badge>✦ Tarifs</Badge>
          <h2
            style={{
              fontSize: "clamp(32px, 5vw, 54px)",
              fontWeight: 900,
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "-0.04em",
              color: "#fff",
              margin: "16px 0 16px",
            }}
          >
            Simple, transparent,
            <br />
            <GradientText>sans surprise</GradientText>
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.45)",
              fontSize: "16px",
              fontFamily: "'DM Sans', sans-serif",
              marginBottom: "32px",
            }}
          >
            Commencez gratuitement avec 5 crédits offerts. Aucune carte requise.
          </p>

          {/* Toggle */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              padding: "4px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "100px",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <button
              onClick={() => setYearly(false)}
              style={{
                padding: "8px 20px",
                borderRadius: "100px",
                border: "none",
                cursor: "pointer",
                background: !yearly ? "rgba(255,220,80,0.15)" : "transparent",
                color: !yearly ? "#FFDC50" : "rgba(255,255,255,0.5)",
                fontSize: "13px",
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.2s",
              }}
            >
              Mensuel
            </button>
            <button
              onClick={() => setYearly(true)}
              style={{
                padding: "8px 20px",
                borderRadius: "100px",
                border: "none",
                cursor: "pointer",
                background: yearly ? "rgba(255,220,80,0.15)" : "transparent",
                color: yearly ? "#FFDC50" : "rgba(255,255,255,0.5)",
                fontSize: "13px",
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              Annuel
              <span
                style={{
                  fontSize: "10px",
                  padding: "2px 6px",
                  background: "rgba(34,197,94,0.2)",
                  color: "#22c55e",
                  borderRadius: "4px",
                }}
              >
                -20%
              </span>
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
            alignItems: "stretch",
          }}
        >
          {PLANS.map((plan, i) => (
            <AnimatedSection key={plan.id}>
              <PricingCard plan={plan} yearly={yearly} delay={i * 0.1} />
            </AnimatedSection>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "32px" }}>
          <p
            style={{
              fontSize: "13px",
              color: "rgba(255,255,255,0.3)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            ✓ Annulation à tout moment · ✓ Pas d'engagement · ✓ Support inclus ·
            ✓ Vidéos 100% vôtres
          </p>
        </div>
      </div>
    </section>
  );
}

function PricingCard({
  plan,
  yearly,
  delay,
}: {
  plan: Plan;
  yearly: boolean;
  delay: number;
}) {
  const [hovered, setHovered] = useState(false);
  const price = yearly ? plan.price.yearly : plan.price.monthly;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "32px",
        borderRadius: "24px",
        background: plan.highlight
          ? "linear-gradient(145deg, rgba(255,220,80,0.08) 0%, rgba(255,140,66,0.04) 100%)"
          : hovered
            ? "rgba(255,255,255,0.04)"
            : "rgba(255,255,255,0.025)",
        border: plan.highlight
          ? "1px solid rgba(255,220,80,0.3)"
          : hovered
            ? "1px solid rgba(255,255,255,0.12)"
            : "1px solid rgba(255,255,255,0.07)",
        position: "relative",
        transition: "all 0.25s ease",
        transform: plan.highlight
          ? "scale(1.02)"
          : hovered
            ? "translateY(-4px)"
            : "none",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {plan.badge && (
        <div
          style={{
            position: "absolute",
            top: "-14px",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "4px 16px",
            background: "linear-gradient(135deg, #FFDC50, #FF9D50)",
            borderRadius: "100px",
            fontSize: "11px",
            fontWeight: 700,
            color: "#0A0A0A",
            whiteSpace: "nowrap",
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: "0.04em",
          }}
        >
          {plan.badge}
        </div>
      )}

      <div style={{ marginBottom: "24px" }}>
        <div
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "rgba(255,255,255,0.5)",
            fontFamily: "'DM Sans', sans-serif",
            marginBottom: "8px",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {plan.name}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
          <span
            style={{
              fontSize: "52px",
              fontWeight: 900,
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "-0.04em",
              color: "#fff",
            }}
          >
            ${price}
          </span>
          <span
            style={{
              fontSize: "14px",
              color: "rgba(255,255,255,0.4)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            /mois
          </span>
        </div>
        {yearly && (
          <div
            style={{
              fontSize: "12px",
              color: "#22c55e",
              fontFamily: "'DM Sans', sans-serif",
              marginTop: "4px",
            }}
          >
            Économisez ${(plan.price.monthly - plan.price.yearly) * 12}/an
          </div>
        )}
      </div>

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: "0 0 32px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {plan.features.map((f, i) => (
          <li
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "14px",
              color: "rgba(255,255,255,0.65)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <span
              style={{
                color: plan.highlight ? "#FFDC50" : "#22c55e",
                fontSize: "16px",
                flexShrink: 0,
              }}
            >
              ✓
            </span>
            {f}
          </li>
        ))}
      </ul>

      {plan.highlight ? (
        <PrimaryButton large>{plan.cta}</PrimaryButton>
      ) : (
        <GhostButton>{plan.cta}</GhostButton>
      )}
    </div>
  );
}

// ============================================================
// TESTIMONIALS
// ============================================================
function Testimonials() {
  const testimonials = [
    {
      name: "Alexia M.",
      role: "Créatrice faceless YouTube",
      avatar: "🎬",
      text: "J'uploadais 2 vidéos par semaine avant. Maintenant j'en produis 14 avec FrameForge. Mon channel est passé de 2K à 48K abonnés en 3 mois.",
      metric: "+2 300% de contenu",
    },
    {
      name: "Thomas R.",
      role: "E-commerce Shopify",
      avatar: "🛍️",
      text: "Les vidéos produits IA ont amélioré mon taux de conversion de 34%. J'ai économisé 3 000€/mois en production vidéo.",
      metric: "+34% de conversion",
    },
    {
      name: "Sonia K.",
      role: "Social Media Manager",
      avatar: "📱",
      text: "Je gère 8 comptes clients simultanément grâce au bulk generation. Ce qui prenait une semaine prend maintenant 2 heures.",
      metric: "-75% de temps",
    },
  ];

  return (
    <section
      style={{
        padding: "120px 24px",
        background: "rgba(255,255,255,0.015)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <Badge>✦ Témoignages</Badge>
          <h2
            style={{
              fontSize: "clamp(32px, 5vw, 54px)",
              fontWeight: 900,
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "-0.04em",
              color: "#fff",
              margin: "16px 0",
            }}
          >
            Ils ont transformé
            <br />
            <GradientText>leur création de contenu</GradientText>
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          {testimonials.map((t, i) => (
            <AnimatedSection key={i}>
              <div
                style={{
                  padding: "32px",
                  borderRadius: "20px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      background: "rgba(255,220,80,0.1)",
                      border: "1px solid rgba(255,220,80,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                    }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "#fff",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {t.name}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "rgba(255,255,255,0.4)",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {t.role}
                    </div>
                  </div>
                </div>
                <p
                  style={{
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.6)",
                    fontFamily: "'DM Sans', sans-serif",
                    lineHeight: 1.7,
                    fontStyle: "italic",
                  }}
                >
                  "{t.text}"
                </p>
                <div
                  style={{
                    padding: "8px 16px",
                    background: "rgba(255,220,80,0.08)",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,220,80,0.15)",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#FFDC50",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {t.metric}
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// FAQ
// ============================================================
function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" style={{ padding: "120px 24px" }}>
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <Badge>✦ FAQ</Badge>
          <h2
            style={{
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 900,
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "-0.04em",
              color: "#fff",
              margin: "16px 0",
            }}
          >
            Questions fréquentes
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {FAQS.map((f, i) => (
            <AnimatedSection key={i}>
              <div
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  padding: "24px",
                  borderRadius: "16px",
                  background:
                    open === i
                      ? "rgba(255,220,80,0.05)"
                      : "rgba(255,255,255,0.03)",
                  border:
                    open === i
                      ? "1px solid rgba(255,220,80,0.2)"
                      : "1px solid rgba(255,255,255,0.07)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#fff",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {f.q}
                  </span>
                  <span
                    style={{
                      fontSize: "18px",
                      color: "rgba(255,255,255,0.4)",
                      transform: open === i ? "rotate(45deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                      flexShrink: 0,
                    }}
                  >
                    +
                  </span>
                </div>
                {open === i && (
                  <p
                    style={{
                      fontSize: "14px",
                      color: "rgba(255,255,255,0.5)",
                      fontFamily: "'DM Sans', sans-serif",
                      lineHeight: 1.7,
                      marginTop: "12px",
                      marginBottom: 0,
                    }}
                  >
                    {f.a}
                  </p>
                )}
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// CTA FINAL
// ============================================================
function FinalCTA() {
  return (
    <section style={{ padding: "120px 24px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <AnimatedSection>
          <div
            style={{
              padding: "64px 48px",
              borderRadius: "32px",
              background:
                "linear-gradient(145deg, rgba(255,220,80,0.08) 0%, rgba(255,140,66,0.04) 100%)",
              border: "1px solid rgba(255,220,80,0.2)",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-50%",
                left: "50%",
                transform: "translateX(-50%)",
                width: "400px",
                height: "300px",
                background:
                  "radial-gradient(ellipse, rgba(255,220,80,0.12) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <Badge>✦ Démarrez maintenant</Badge>
            <h2
              style={{
                fontSize: "clamp(32px, 5vw, 52px)",
                fontWeight: 900,
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: "-0.04em",
                color: "#fff",
                margin: "20px 0 16px",
              }}
            >
              Votre premier vidéo virale
              <br />
              <GradientText>est à 60 secondes.</GradientText>
            </h2>
            <p
              style={{
                fontSize: "16px",
                color: "rgba(255,255,255,0.45)",
                fontFamily: "'DM Sans', sans-serif",
                marginBottom: "32px",
                lineHeight: 1.6,
              }}
            >
              5 crédits offerts. Aucune carte de crédit requise.
              <br />
              Rejoignez 12 000+ créateurs qui scalent leur contenu.
            </p>
            <div
              style={{
                display: "flex",
                gap: "16px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <PrimaryButton large>Créer mon compte gratuit →</PrimaryButton>
              <GhostButton>Voir les tarifs</GhostButton>
            </div>
            <p
              style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.25)",
                fontFamily: "'DM Sans', sans-serif",
                marginTop: "20px",
              }}
            >
              ✓ Sans engagement · ✓ Annulation en 1 clic · ✓ Support 7j/7
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

// ============================================================
// FOOTER
// ============================================================
function Footer() {
  const links = {
    Produit: ["Fonctionnalités", "Tarifs", "API", "Changelog"],
    Ressources: ["Documentation", "Tutoriels", "Blog", "Status"],
    Légal: ["CGU", "Confidentialité", "Cookies"],
  };

  return (
    <footer
      style={{
        padding: "64px 24px 32px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr repeat(3, 1fr)",
            gap: "48px",
            marginBottom: "48px",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #FFDC50, #FF8C42)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                }}
              >
                ▶
              </div>
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  color: "#fff",
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: "-0.03em",
                }}
              >
                FrameForge
              </span>
            </div>
            <p
              style={{
                fontSize: "14px",
                color: "rgba(255,255,255,0.35)",
                fontFamily: "'DM Sans', sans-serif",
                lineHeight: 1.6,
                maxWidth: "280px",
              }}
            >
              Le pipeline IA complet pour créateurs de contenu faceless. Image
              to Video, Text to Video, Lip Sync.
            </p>
          </div>
          {Object.entries(links).map(([cat, items]) => (
            <div key={cat}>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.4)",
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "16px",
                }}
              >
                {cat}
              </div>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      style={{
                        fontSize: "14px",
                        color: "rgba(255,255,255,0.45)",
                        fontFamily: "'DM Sans', sans-serif",
                        textDecoration: "none",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#fff")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "rgba(255,255,255,0.45)")
                      }
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <span
            style={{
              fontSize: "13px",
              color: "rgba(255,255,255,0.25)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            © 2026 FrameForge. Tous droits réservés.
          </span>
          <span
            style={{
              fontSize: "13px",
              color: "rgba(255,255,255,0.25)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Fait avec ⚡ pour les créateurs du futur
          </span>
        </div>
      </div>
    </footer>
  );
}

// ============================================================
// ROOT PAGE
// ============================================================
export default function LandingPage() {
  const scrollY = useScrollY();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900;1,9..40,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #0A0A0A; color: #fff; font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0A0A0A; }
        ::-webkit-scrollbar-thumb { background: rgba(255,220,80,0.3); border-radius: 3px; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
        }
      `}</style>

      <Nav scrollY={scrollY} />
      <main>
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
