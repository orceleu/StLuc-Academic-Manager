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
      <div className="flex flex-col lg:flex-row justify-between gap-6 bg-white p-6 rounded-md border shadow-sm items-center">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
            <Calculator size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 leading-none">
              Mon Palmarès Académique
            </h1>
            <p className="text-xs text-gray-400 font-bold uppercase mt-1 tracking-widest text-indigo-500">
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
              className="pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 text-sm w-56"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="px-4 py-2.5 bg-gray-50 border rounded-xl outline-none text-sm font-bold text-gray-600"
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
            className="px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-bold text-gray-600"
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
            className="px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-bold text-gray-600"
          >
            {years.map((y) => (
              <option key={y.id} value={y.id}>
                {y.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/*<div className="flex items-center gap-3">
        <Button variant={"outline"} size={"sm"} onClick={exportToExcel}>
          Exporter en Excel
        </Button>
      </div>*/}

      {/* TABLEAU DE RÉSULTATS */}
      <div className="bg-white rounded-md border overflow-hidden">
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
                    Synchronisation des notes...
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
                          className="p-4 text-center border-r text-sm font-bold text-gray-700 bg-gray-50/20"
                        >
                          {getCurrentScore(
                            student.enrollment_id,
                            course.offering_id,
                          )}
                        </td>
                      ))}

                      <td className="p-4 text-center bg-gray-50/50 font-mono font-bold text-slate-600">
                        {sNotes.toFixed(2)}
                      </td>

                      <td className="p-4 text-center bg-gray-50/50 font-mono text-slate-400 font-medium">
                        {sCoeff}
                      </td>

                      <td
                        className={`p-4 text-center font-black text-xl bg-indigo-50/30 ${
                          parseFloat(percent) >= 50
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
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
