"use client";

import { useEffect, useState } from "react";
import { getTeacherAssignments } from "@/app/neon/request";
import {
  BookOpen,
  Layers,
  Calendar,
  GraduationCap,
  Loader2,
  ClipboardList,
  Clock, // Nouvelle icône
} from "lucide-react";
import { useAuth } from "@/app/clientComponents/AuthContext";
import { Button } from "@/components/ui/button";
import { MdArrowBackIos } from "react-icons/md";
import { useRouter } from "next/navigation";

export default function TeacherCoursesPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => {
    async function loadData() {
      if (!user?.uid) return;
      try {
        setLoading(true);
        const data = await getTeacherAssignments(user.uid);
        setAssignments(data);
      } catch (error) {
        console.error("Erreur chargement cours:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user?.uid]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Button
        onClick={() => {
          router.back();
        }}
        variant={"outline"}
        className="my-2 mx-2 md:my-6"
      >
        <MdArrowBackIos />
      </Button>

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
              Liste des cours et horaires d'enseignement.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-indigo-600">
            <Loader2 className="animate-spin mb-2" size={40} />
            <p className="font-medium">Chargement...</p>
          </div>
        ) : assignments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.map((item) => (
              <div
                key={item.assignment_id}
                className="bg-white border rounded-xl p-5 hover:border-indigo-300 transition-all shadow-sm"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <BookOpen size={20} />
                  </div>
                  <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-full uppercase">
                    Coeff: {item.coefficient}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  {item.course_name}
                </h3>

                {/* LISTE DES HORAIRES */}
                <div className="space-y-2 mb-4">
                  {item.schedules && item.schedules.length > 0 ? (
                    item.schedules.map((sched: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-100 text-sm"
                      >
                        <Clock size={14} className="text-indigo-500" />
                        <span className="font-semibold capitalize text-slate-700">
                          {sched.day}
                        </span>
                        <span className="text-indigo-600 font-medium">
                          {sched.start.slice(0, 5)} - {sched.end.slice(0, 5)}
                        </span>
                        {sched.room && (
                          <span className="ml-auto text-[10px] bg-white border px-1.5 py-0.5 rounded text-gray-400 font-mono">
                            {sched.room}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100">
                      Aucun horaire planifié
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <GraduationCap size={14} className="text-gray-400" />
                    <span className="font-medium">{item.filiere_name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} /> {item.year_name}
                    </div>
                    <div className="flex items-center gap-1">
                      <Layers size={14} /> {item.session_name}
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
          <div className="bg-white border-2 border-dashed rounded-2xl p-12 text-center text-gray-500">
            <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Aucun cours assigné pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
