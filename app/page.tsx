import { Button } from "@/components/ui/button";
import Image from "next/image";
import NavBar from "./clientComponents/Navbar";
import Footer from "./clientComponents/Footer";

export default function Home() {
  return (
    <>
      <NavBar />
      <div className="flex flex-col items-center justify-center text-center px-6 py-20">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mt-25">
          StLuc Academic Manager
        </h1>

        <p className="mt-2 text-lg text-gray-600">
          Système de gestion des notes
        </p>

        <p className="mt-4 max-w-xl text-gray-500">
          Plateforme officielle de{" "}
          <span className="font-semibold">Polytechnique St-Luc</span> permettant
          aux étudiants de consulter leurs résultats, aux enseignants de gérer
          et publier les notes, et aux responsables de filière de superviser
          l’ensemble des performances académiques et la progression des
          étudiants.
        </p>

        <div className="flex gap-4 mt-8">
          <a
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Se connecter
          </a>

          <button className="border border-gray-300 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium">
            Voir les résultats
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}
