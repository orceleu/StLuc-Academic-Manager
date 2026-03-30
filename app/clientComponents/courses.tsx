"use client";

import { useState, useEffect } from "react";
import { Book, GraduationCap, UserCheck, Plus, Layers } from "lucide-react";
import {
  addCourse,
  addCourseOffering,
  assignTeacher,
} from "@/app/neon/request";

export default function CourseManagementPage({
  filieres,
  academicYears,
  sessions,
  courses,
  offerings,
  teachers,
}: any) {
  // États pour les formulaires
  const [newCourse, setNewCourse] = useState("");
  const [offering, setOffering] = useState({
    course_id: "",
    filiere_id: "",
    year_id: "",
    session_id: "",
    coefficient: 1,
  });
  const [assignment, setAssignment] = useState({
    offering_id: "",
    teacher_id: "",
  });

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-16">
      {/* SECTION 1: CATALOGUE DES COURS */}
      <section className="bg-white rounded-2xl border p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6 border-b pb-4">
          <Book className="text-blue-600" />
          <h2 className="text-xl font-bold">1. Catalogue des Cours</h2>
        </div>
        <div className="flex gap-4">
          <input
            placeholder="Nom du cours (ex: Algèbre)"
            className="flex-1 p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-100"
            value={newCourse}
            onChange={(e) => setNewCourse(e.target.value)}
          />
          <button
            onClick={() => {
              addCourse(newCourse);
              setNewCourse("");
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <Plus size={18} /> Créer le cours
          </button>
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-8">
        {/* SECTION 2: COURSE OFFERINGS (Programmation) */}
        <section className="bg-white rounded-2xl border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <Layers className="text-emerald-600" />
            <h2 className="text-xl font-bold">2. Offre Académique</h2>
          </div>
          <div className="space-y-4">
            <select
              className="w-full p-3 border rounded-xl bg-gray-50"
              onChange={(e) =>
                setOffering({ ...offering, course_id: e.target.value })
              }
            >
              <option value="">Sélectionner un cours</option>
              {courses?.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-4">
              <select
                className="p-3 border rounded-xl bg-gray-50"
                onChange={(e) =>
                  setOffering({ ...offering, filiere_id: e.target.value })
                }
              >
                <option value="">Filière</option>
                {filieres?.map((f: any) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Coeff"
                className="p-3 border rounded-xl bg-gray-50"
                onChange={(e) =>
                  setOffering({
                    ...offering,
                    coefficient: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <select
                className="p-3 border rounded-xl bg-gray-50"
                onChange={(e) =>
                  setOffering({ ...offering, year_id: e.target.value })
                }
              >
                <option value="">Année</option>
                {academicYears?.map((y: any) => (
                  <option key={y.id} value={y.id}>
                    {y.name}
                  </option>
                ))}
              </select>
              <select
                className="p-3 border rounded-xl bg-gray-50"
                onChange={(e) =>
                  setOffering({ ...offering, session_id: e.target.value })
                }
              >
                <option value="">Session</option>
                {sessions?.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => addCourseOffering(offering)}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition"
            >
              Programmer le cours
            </button>
          </div>
        </section>

        {/* SECTION 3: ASSIGNATION DES PROFS */}
        <section className="bg-white rounded-2xl border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <UserCheck className="text-orange-600" />
            <h2 className="text-xl font-bold">3. Affectation Enseignant</h2>
          </div>
          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-400 uppercase">
              Choisir une offre de cours
            </label>
            <select
              className="w-full p-3 border rounded-xl bg-gray-50"
              onChange={(e) =>
                setAssignment({ ...assignment, offering_id: e.target.value })
              }
            >
              <option value="">--- Sélectionner l'offre ---</option>
              {offerings?.map((o: any) => (
                <option key={o.id} value={o.id}>
                  {o.course_name} ({o.filiere_name} - {o.session_name})
                </option>
              ))}
            </select>

            <label className="text-xs font-bold text-gray-400 uppercase">
              Choisir le professeur
            </label>
            <select
              className="w-full p-3 border rounded-xl bg-gray-50"
              onChange={(e) =>
                setAssignment({ ...assignment, teacher_id: e.target.value })
              }
            >
              <option value="">--- Sélectionner le prof ---</option>
              {teachers?.map((t: any) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <button
              onClick={() =>
                assignTeacher(assignment.offering_id, assignment.teacher_id)
              }
              className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition mt-4"
            >
              Assigner le professeur
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
