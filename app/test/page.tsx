"use client";

import { useEffect, useRef, useState } from "react";
import { getTeacherAssignments } from "@/app/neon/request";
import {
  BookOpen,
  Layers,
  Calendar,
  GraduationCap,
  Loader2,
  ClipboardList,
} from "lucide-react";
import { useAuth } from "../clientComponents/AuthContext";

export default function TeacherCoursesPage({
  params,
}: {
  params: { id: string };
}) {
  // Note: Dans un vrai scénario, l'ID viendrait de la session (Auth)
  // Ici on simule ou on récupère via les params de l'URL
  const teacherId = "XUgVtX3rgifawekXprgv4Ajjmpz1";

  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { role, user } = useAuth();
  useEffect(() => {
    async function loadData() {
      // 1. On vérifie si l'utilisateur existe avant de lancer la requête
      if (!user?.uid) return;

      try {
        setLoading(true);
        // 2. On utilise l'ID de l'utilisateur connecté
        const data = await getTeacherAssignments(user.uid);
        setAssignments(data);
      } catch (error) {
        console.error("Erreur chargement cours:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user?.uid]); // Le useEffect se relancera dès que user.uid passera de null à une valeur

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border shadow-sm">
          <div className="p-3 bg-indigo-600 text-white rounded-xl">
            <ClipboardList size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Mes Assignations
            </h1>
            <p className="text-gray-500 text-sm">
              Liste des cours que vous enseignez pour cette période.
            </p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-indigo-600">
            <Loader2 className="animate-spin mb-2" size={40} />
            <p className="font-medium">Chargement de vos cours...</p>
          </div>
        ) : assignments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.map((item) => (
              <div
                key={item.assignment_id}
                className="bg-white border rounded-xl p-5 hover:border-indigo-300 transition-all shadow-sm group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <BookOpen size={20} />
                  </div>
                  <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-full uppercase">
                    Coeff: {item.coefficient}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  {item.course_name}
                </h3>

                <div className="space-y-2 mt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <GraduationCap size={14} className="text-gray-400" />
                    <span className="font-medium">{item.filiere_name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar size={14} />
                      {item.year_name}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Layers size={14} />
                      {item.session_name}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t flex justify-end">
                  <button className="text-xs font-bold text-indigo-600 hover:underline">
                    Gérer les notes →
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed rounded-2xl p-12 text-center">
            <div className="text-gray-300 mb-4 flex justify-center">
              <BookOpen size={48} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              Aucun cours assigné
            </h3>
            <p className="text-gray-500">
              Vous n'avez pas encore de cours répertoriés pour cette session.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
