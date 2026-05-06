"use client";

import { useState, useEffect } from "react";
import { Search, Calculator, Loader2 } from "lucide-react";
import {
  getAcademicYears,
  getFilieres,
  getPalmaresData,
  getSessions,
} from "@/app/neon/request";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";

export default function GradesPageStudents() {
  const [rawData, setRawData] = useState<any>({
    students: [],
    courses: [],
    grades: [],
  });
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  // 1. Filtres et sessions
  const [filterFiliere, setFilterFiliere] = useState<string>("");
  const [sessions, setSessions] = useState<any[]>([]);
  const [years, setYears] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [yearId, setYearId] = useState("");
  const [allFilieres, setAllFilieres] = useState<any[]>([]);

  useEffect(() => {
    async function loadFilters() {
      const s = await getSessions();
      const y = await getAcademicYears();
      const f = await getFilieres();
      setSessions(s);
      setYears(y);
      setAllFilieres(f);

      if (s.length > 0) setSessionId(s[0].id);
      if (y.length > 0) setYearId(y[0].id);
    }

    loadFilters();
  }, []);

  useEffect(() => {
    if (rawData.courses.length > 0 && filterFiliere === "") {
      const uniqueFilieres = Array.from(
        new Set(rawData.courses.map((c: any) => c.filiere_name)),
      );
      if (uniqueFilieres.length > 0) {
        setFilterFiliere(uniqueFilieres[0] as string);
      }
    }
  }, [rawData, filterFiliere]);

  useEffect(() => {
    loadData();
  }, [sessionId, yearId]);

  async function loadData() {
    if (!sessionId || !yearId) return;

    setLoading(true);
    const data = await getPalmaresData(sessionId, yearId);
    setRawData(data);
    setLoading(false);
  }

  // --- LOGIQUE DE CALCUL ---

  const getCurrentScore = (enrollId: string, offId: string) => {
    const grade = rawData.grades.find(
      (g: any) =>
        g.enrollment_id === enrollId && g.course_offering_id === offId,
    );
    return grade ? grade.score : "";
  };

  const calculateSumNotes = (enrollId: string, visibleCourses: any[]) => {
    return visibleCourses.reduce((acc: number, course: any) => {
      const score = getCurrentScore(enrollId, course.offering_id);
      return acc + (score !== "" ? parseFloat(score as string) : 0);
    }, 0);
  };

  const calculateSumCoeff = (visibleCourses: any[]) => {
    return visibleCourses.reduce(
      (acc: number, course: any) => acc + (course.coefficient || 0),
      0,
    );
  };

  const calculateFinalPercentage = (
    enrollId: string,
    visibleCourses: any[],
  ) => {
    const sumNotes = calculateSumNotes(enrollId, visibleCourses);
    const sumCoeff = calculateSumCoeff(visibleCourses);
    if (sumCoeff === 0) return "0.00";
    return ((sumNotes / sumCoeff) * 100).toFixed(2);
  };

  const formatLastUpdate = (enrollId: string, offId: string) => {
    const grade = rawData.grades.find(
      (g: any) =>
        g.enrollment_id === enrollId && g.course_offering_id === offId,
    );

    if (!grade || !grade.updated_at) return null;

    const date = new Date(grade.updated_at);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // --- EXPORT ---

  const exportToExcel = () => {
    const courses = dynamicColumns;

    const data = filteredStudents.map((student: any) => {
      const row: any = {
        Étudiant: student.student_name,
        Filière: student.filiere_name,
      };

      courses.forEach((course: any) => {
        const score = getCurrentScore(
          student.enrollment_id,
          course.offering_id,
        );

        row[course.course_name] = score === "" ? "" : Number(score);
      });

      const sumNotes = calculateSumNotes(student.enrollment_id, courses);
      const sumCoeff = calculateSumCoeff(courses);
      const percent = calculateFinalPercentage(student.enrollment_id, courses);

      row["Somme Notes"] = sumNotes.toFixed(2);
      row["Somme Coeff"] = sumCoeff;
      row["Moyenne (%)"] = percent;

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Palmares");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(blob, `palmares_${filterFiliere}.xlsx`);
  };

  // --- FILTRAGE ---

  const dynamicColumns = rawData.courses.filter(
    (c: any) => c.filiere_name === filterFiliere,
  );

  const filteredStudents = rawData.students.filter(
    (s: any) =>
      (filterFiliere === "" || s.filiere_name === filterFiliere) &&
      s.student_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-2 md:p-6 space-y-6 bg-gray-50 min-h-screen font-sans">
      {/* HEADER & CONTRÔLES */}
      <div className="flex flex-col lg:flex-row justify-between gap-6 bg-white p-6 rounded-xl border shadow-sm items-center">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg">
            <Calculator size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 leading-none">
              Mon Palmarès Académique
            </h1>
            <p className="text-xs text-slate-500 font-bold uppercase mt-1 tracking-widest">
              Consultation des résultats
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
              placeholder="Rechercher un étudiant..."
              className="pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-slate-200 text-sm w-56"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="px-4 py-2.5 bg-gray-50 border rounded-xl outline-none text-sm font-bold text-gray-700"
            value={filterFiliere}
            onChange={(e) => setFilterFiliere(e.target.value)}
          >
            {Array.from(
              new Set(rawData.courses.map((c: any) => c.filiere_name)),
            ).map((f: any) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          <select
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-bold text-gray-700"
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={yearId}
            onChange={(e) => setYearId(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-bold text-gray-700"
          >
            {years.map((y) => (
              <option key={y.id} value={y.id}>
                {y.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* AFFICHAGE DES RÉSULTATS (STYLE RELEVÉ DE NOTES) */}
      {loading ? (
        <div className="flex justify-center items-center h-64 w-full">
          <div className="text-center text-gray-400 font-bold italic animate-pulse flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-slate-400" size={32} />
            Synchronisation des notes...
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredStudents.length > 0 ? (
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
              const isPassing = parseFloat(percent) >= 50;

              return (
                <div
                  key={student.enrollment_id}
                  className="bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden flex flex-col"
                >
                  {/* En-tête du bulletin */}
                  <div className="p-5 border-b-4 border-slate-900 bg-gray-50">
                    <p className="text-[10px] text-slate-500 font-black tracking-widest uppercase mb-1">
                      Bulletin de notes
                    </p>
                    <h3 className="font-black text-gray-900 text-xl leading-tight">
                      {student.student_name}
                    </h3>
                    <p className="text-sm text-slate-600 font-medium mt-1">
                      {student.filiere_name}
                    </p>
                  </div>

                  {/* Corps du bulletin (Colonnes) */}
                  <div className="p-5 flex-grow bg-white">
                    {/* En-têtes de colonnes */}
                    <div className="grid grid-cols-12 gap-2 border-b-2 border-gray-800 pb-2 mb-3 text-[11px] font-black uppercase tracking-widest text-gray-500">
                      <div className="col-span-8">Matière</div>
                      <div className="col-span-2 text-center">Note</div>
                      <div className="col-span-2 text-center">Coef</div>
                    </div>

                    {/* Lignes de cours */}
                    <div className="space-y-1">
                      {dynamicColumns.map((course: any) => {
                        const score = getCurrentScore(
                          student.enrollment_id,
                          course.offering_id,
                        );

                        return (
                          <div
                            key={course.offering_id}
                            className="grid grid-cols-12 gap-2 items-center text-sm py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                          >
                            <div
                              className="col-span-8 font-medium text-gray-800 truncate pr-2"
                              title={course.course_name}
                            >
                              {course.course_name}
                            </div>
                            <div className="col-span-2 text-center font-bold text-slate-900">
                              {score !== "" ? score : "-"}
                            </div>
                            <div className="col-span-2 text-center text-gray-500 text-xs">
                              {course.coefficient}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pied de page du bulletin (Totaux) */}
                  <div className="bg-slate-50 border-t border-gray-200 p-5">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-gray-600 font-medium">
                        Somme des notes
                      </span>
                      <span className="font-bold text-gray-900 font-mono text-base">
                        {sNotes.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm mb-4">
                      <span className="text-gray-600 font-medium">
                        Somme des coefficients
                      </span>
                      <span className="font-bold text-gray-900 font-mono text-base">
                        {sCoeff}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t-2 border-slate-900">
                      <span className="text-sm font-black uppercase tracking-widest text-slate-900">
                        Moyenne Générale
                      </span>
                      <span
                        className={`text-2xl font-black ${
                          isPassing ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {percent}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full flex justify-center py-12">
              <p className="text-gray-400 font-medium">
                Aucun étudiant trouvé pour ces critères.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
