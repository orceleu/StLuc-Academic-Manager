"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Save,
  Calculator,
  Loader2,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { getPalmaresData, saveBulkGrades } from "@/app/neon/request";

export default function GradesPage() {
  const [rawData, setRawData] = useState<any>({
    students: [],
    courses: [],
    grades: [],
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [filterFiliere, setFilterFiliere] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingChanges, setPendingChanges] = useState<
    Record<string, number | string>
  >({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const data = await getPalmaresData();
    setRawData(data);
    setLoading(false);
  }

  // --- LOGIQUE DE CALCUL ---

  const getCurrentScore = (enrollId: string, offId: string) => {
    const key = `${enrollId}-${offId}`;
    if (pendingChanges[key] !== undefined) return pendingChanges[key];
    const grade = rawData.grades.find(
      (g: any) =>
        g.enrollment_id === enrollId && g.course_offering_id === offId,
    );
    return grade ? grade.score : "";
  };

  // Somme brute de toutes les notes
  const calculateSumNotes = (enrollId: string, visibleCourses: any[]) => {
    return visibleCourses.reduce((acc: number, course: any) => {
      const score = getCurrentScore(enrollId, course.offering_id);
      return acc + (score !== "" ? parseFloat(score as string) : 0);
    }, 0);
  };

  // Somme de tous les coefficients
  const calculateSumCoeff = (visibleCourses: any[]) => {
    return visibleCourses.reduce(
      (acc: number, course: any) => acc + (course.coefficient || 0),
      0,
    );
  };

  // Moyenne % = (Somme Notes / Somme Coeff) * 100
  const calculateFinalPercentage = (
    enrollId: string,
    visibleCourses: any[],
  ) => {
    const sumNotes = calculateSumNotes(enrollId, visibleCourses);
    const sumCoeff = calculateSumCoeff(visibleCourses);
    if (sumCoeff === 0) return "0.00";
    return ((sumNotes / sumCoeff) * 100).toFixed(2);
  };

  // --- ACTIONS ---

  const handleInputChange = (enrollId: string, offId: string, val: string) => {
    setPendingChanges((prev) => ({ ...prev, [`${enrollId}-${offId}`]: val }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const updates = Object.entries(pendingChanges).map(([key, score]) => ({
      enrollment_id: key.split("-")[0],
      course_offering_id: key.split("-")[1],
      score: parseFloat(score as string) || 0,
    }));

    const res = await saveBulkGrades(updates);
    if (res.success) {
      setPendingChanges({});
      await loadData();
      alert("Palmarès mis à jour avec succès !");
    }
    setIsSaving(false);
  };

  // --- FILTRAGE ---
  const dynamicColumns = rawData.courses.filter(
    (c: any) => filterFiliere === "" || c.filiere_name === filterFiliere,
  );
  const filteredStudents = rawData.students.filter(
    (s: any) =>
      (filterFiliere === "" || s.filiere_name === filterFiliere) &&
      s.student_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen font-sans">
      {/* HEADER & CONTRÔLES */}
      <div className="flex flex-col lg:flex-row justify-between gap-6 bg-white p-6 rounded-[2rem] border shadow-sm items-center">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
            <Calculator size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 leading-none">
              Palmarès Académique
            </h1>
            <p className="text-xs text-gray-400 font-bold uppercase mt-1 tracking-widest text-indigo-500">
              Calcul des résultats en temps réel
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 w-full lg:w-auto">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Étudiant..."
              className="pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 text-sm w-48"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2.5 bg-gray-50 border rounded-xl outline-none text-sm font-bold text-gray-600"
            onChange={(e) => setFilterFiliere(e.target.value)}
          >
            <option value="">Toutes les filières</option>
            {Array.from(
              new Set(rawData.courses.map((c: any) => c.filiere_name)),
            ).map((f: any) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <button
            onClick={handleSave}
            disabled={Object.keys(pendingChanges).length === 0 || isSaving}
            className="flex items-center gap-2 px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-30 transition-all shadow-xl shadow-indigo-200"
          >
            {isSaving ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            Sauvegarder les notes
          </button>
        </div>
      </div>

      {/* TABLEAU DE RÉSULTATS */}
      <div className="bg-white rounded-[2rem] border shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-5 text-left sticky left-0 bg-slate-900 z-20 min-w-[240px] border-r border-slate-800 text-[10px] font-black uppercase tracking-widest">
                  Étudiant / Filière
                </th>
                {dynamicColumns.map((course: any) => (
                  <th
                    key={course.offering_id}
                    className="p-4 text-center border-r border-slate-800 min-w-[110px]"
                  >
                    <div className="text-[10px] font-medium text-slate-400 truncate mb-1">
                      {course.course_name}
                    </div>
                    <div className="text-indigo-400 font-black text-xs">
                      C: {course.coefficient}
                    </div>
                  </th>
                ))}
                <th className="p-4 text-center bg-slate-800 min-w-[120px] text-[10px] font-black uppercase">
                  Somme Notes
                </th>
                <th className="p-4 text-center bg-slate-800 min-w-[100px] text-[10px] font-black uppercase">
                  Somme Coeff
                </th>
                <th className="p-4 text-center bg-indigo-600 min-w-[140px] text-[10px] font-black uppercase">
                  Moyenne (%)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={dynamicColumns.length + 4}
                    className="p-32 text-center text-gray-300 font-bold italic animate-pulse"
                  >
                    Synchronisation des données...
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student: any) => {
                  const sNotes = calculateSumNotes(
                    student.enrollment_id,
                    dynamicColumns,
                  );
                  const sCoeff = calculateSumCoeff(dynamicColumns);
                  const percent = calculateFinalPercentage(
                    student.enrollment_id,
                    dynamicColumns,
                  );

                  return (
                    <tr
                      key={student.enrollment_id}
                      className="hover:bg-indigo-50/20 transition-all group"
                    >
                      <td className="p-5 sticky left-0 bg-white z-10 border-r font-bold text-gray-800 group-hover:bg-indigo-50 transition-colors">
                        <div className="flex flex-col">
                          <span className="text-sm">
                            {student.student_name}
                          </span>
                          <span className="text-[9px] text-indigo-500 font-black tracking-tighter uppercase">
                            {student.filiere_name}
                          </span>
                        </div>
                      </td>

                      {dynamicColumns.map((course: any) => (
                        <td
                          key={course.offering_id}
                          className="p-2 text-center border-r"
                        >
                          <input
                            type="number"
                            step="0.5"
                            className="w-16 p-2 text-center bg-gray-50 border-2 border-transparent rounded-xl font-bold focus:border-indigo-400 focus:bg-white outline-none transition-all text-gray-700"
                            value={getCurrentScore(
                              student.enrollment_id,
                              course.offering_id,
                            )}
                            onChange={(e) =>
                              handleInputChange(
                                student.enrollment_id,
                                course.offering_id,
                                e.target.value,
                              )
                            }
                          />
                        </td>
                      ))}

                      <td className="p-4 text-center bg-gray-50/50 font-mono font-bold text-slate-600">
                        {sNotes.toFixed(2)}
                      </td>

                      <td className="p-4 text-center bg-gray-50/50 font-mono text-slate-400 font-medium">
                        {sCoeff}
                      </td>

                      <td
                        className={`p-4 text-center font-black text-xl bg-indigo-50/30 ${parseFloat(percent) >= 50 ? "text-emerald-600" : "text-rose-600"}`}
                      >
                        {percent}%
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
