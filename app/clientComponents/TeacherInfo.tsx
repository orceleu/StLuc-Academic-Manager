"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase/config";

// Ton typage exact
export type Cours = {
  id?: string;
  nom: string;
  teacherName: string;
  teacherId: string;
  filiere: string;
  duree: string; // ex: "2" ou "8-10"
  jour: string;
  active: boolean;
};

interface TeacherCourseListProps {
  teacherId: string; // L'ID passé en prop pour le filtrage
}

export default function TeacherReadOnlyView({
  teacherId,
}: TeacherCourseListProps) {
  const [courses, setCourses] = useState<Cours[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeacherCourses() {
      if (!teacherId) return;

      setLoading(true);
      try {
        // 1. Référence à la collection "cours"
        const coursRef = collection(db, "cours");

        // 2. Requête filtrée sur teacherId
        const q = query(coursRef, where("teacherId", "==", teacherId));

        const querySnapshot = await getDocs(q);
        const list: Cours[] = [];

        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Cours);
        });

        setCourses(list);
      } catch (error) {
        console.error("Erreur lors de la récupération des cours:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTeacherCourses();
  }, [teacherId]);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 animate-pulse">
        Chargement du programme...
      </div>
    );
  }

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 bg-slate-50 border-b border-gray-200">
        <h3 className="font-bold text-lg text-slate-800">
          Liste des Cours assignés
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-xs font-bold">
              <th className="px-6 py-4">Nom du Cours</th>
              <th className="px-6 py-4">Filière</th>
              <th className="px-6 py-4">Jour</th>
              <th className="px-6 py-4 text-center">Durée</th>
              <th className="px-6 py-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {courses.length > 0 ? (
              courses.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-blue-50/30 transition-colors"
                >
                  <td className="px-6 py-4 font-semibold text-blue-900">
                    {c.nom}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{c.filiere}</td>
                  <td className="px-6 py-4 text-gray-600 font-medium">
                    {c.jour}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md font-mono border border-slate-200">
                      {c.duree}h
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        c.active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 mr-1.5 rounded-full ${c.active ? "bg-green-500" : "bg-red-500"}`}
                      ></span>
                      {c.active ? "Actif" : "Inactif"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-gray-400"
                >
                  <p>Aucun cours trouvé pour cet identifiant.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
