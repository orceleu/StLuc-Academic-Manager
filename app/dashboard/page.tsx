"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../clientComponents/AuthContext";
import NavBar from "../clientComponents/Navbar";
import { LoaderIcon } from "lucide-react";

export default function AdminOverview() {
  const router = useRouter();
  const { user, role, loading } = useAuth();
  console.log(role);
  if (loading)
    return (
      <div className="flex justify-center p-2">
        <LoaderIcon className="animate-spin" />
      </div>
    );
  return (
    <>
      {" "}
      <NavBar />
      <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-10 mt-25">
          Dashboard <span className="text-gray-600 font-bold">({role})</span>
        </h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* FILIERE */}
          {role !== "admin" ? null : (
            <div
              onClick={() => router.push("/dashboard/department")}
              className="cursor-pointer bg-white border rounded-xl p-6 shadow-sm hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold mb-2">Filières</h2>

              <p className="text-gray-500">
                Gérer les filières de l'établissement
              </p>
            </div>
          )}

          {/* ENSEIGNANTS */}

          <div
            onClick={() => router.push("/enseignants")}
            className="cursor-pointer bg-white border rounded-xl p-6 shadow-sm hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold mb-2">Enseignants</h2>

            <p className="text-gray-500">Ajouter et gérer les enseignants</p>
          </div>

          {/* ETUDIANTS */}

          <div
            onClick={() => router.push("/etudiants")}
            className="cursor-pointer bg-white border rounded-xl p-6 shadow-sm hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold mb-2">Étudiants</h2>

            <p className="text-gray-500">Consulter et gérer les notes</p>
          </div>
        </div>
      </div>
    </>
  );
}
