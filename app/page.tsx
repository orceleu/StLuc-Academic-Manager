"use client";
import { Button } from "@/components/ui/button";
import NavBar from "./clientComponents/Navbar";
import Footer from "./clientComponents/Footer";
import { useAuth } from "./clientComponents/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <>
      <NavBar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* BACKGROUND GRADIENT */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 opacity-90" />

        {/* GRID PATTERN */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* CONTENT */}
        <div className="relative max-w-7xl mx-auto px-6 py-28 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            POLYTECHNIQUE SAINT LUC TABARRE
          </h1>

          <p className="mt-4 text-lg md:text-xl text-white/80">
            Système Intelligent De Gestion Académique
          </p>

          <p className="mt-6 max-w-2xl mx-auto text-white/70">
            Plateforme officielle de la{" "}
            <span className="font-semibold text-white">
              LA POLYTECHNIQUE SAINT LUC TABARRE
            </span>{" "}
            pour gérer les notes, suivre la progression et centraliser toute
            l'activité académique en une seule interface moderne.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
            <a
              href="/login"
              className="bg-white text-indigo-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition shadow"
            >
              {user == null ? "Se connecter" : "Accéder au dashboard"}
            </a>

            <a
              href="/palmares"
              className="border border-white/30 backdrop-blur-md px-6 py-3 rounded-xl font-medium hover:bg-white/10 transition"
            >
              Palmares (etudiants)
            </a>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* CARD */}
          <div className="bg-white rounded-2xl p-6 border shadow-sm hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-2">
              Gestion des étudiants
            </h3>
            <p className="text-gray-500 text-sm">
              Ajout, suivi et consultation des étudiants en temps réel.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border shadow-sm hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-2">Gestion des notes</h3>
            <p className="text-gray-500 text-sm">
              Saisie, modification et calcul automatique des résultats.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border shadow-sm hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-2">Supervision globale</h3>
            <p className="text-gray-500 text-sm">
              Vue d’ensemble pour responsables et administration.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
