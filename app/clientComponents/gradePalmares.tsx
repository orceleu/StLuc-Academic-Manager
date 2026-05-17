"use client";

import { useState, useEffect } from "react";
import { Search, Calculator, Loader2, GraduationCap } from "lucide-react";
import {
  enrollStudentsInBulk,
  getAcademicYears,
  getPalmaresData,
  getSessions,
  updateGrade,
  saveBulkGrades,
  getFiliereDurationByName, // Importé pour gérer la réinitialisation des notes
} from "@/app/neon/request";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { useAuth } from "./AuthContext";

export default function GradesPage() {
  const [rawData, setRawData] = useState<any>({
    students: [],
    courses: [],
    grades: [],
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [pendingChanges, setPendingChanges] = useState<
    Record<string, number | string>
  >({});
  const [filiereDuration, setFiliereDuration] = useState<number>(3);
  const [filterFiliere, setFilterFiliere] = useState<string>("");
  const [filterYearLevel, setFilterYearLevel] = useState<string>("1");

  // Liste des années disponibles pour la filière sélectionnée
  const [availableYearLevels, setAvailableYearLevels] = useState<number[]>([
    1, 2, 3, 4,
  ]);

  const [sessions, setSessions] = useState<any[]>([]);
  const [years, setYears] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [yearId, setYearId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Utilisation exclusive du contexte useAuth
  const { role, filiereName, durationYears } = useAuth();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadFilters() {
      const s = await getSessions();
      const y = await getAcademicYears();
      setSessions(s);
      setYears(y);

      if (s.length > 0) setSessionId(s[0].id);
      if (y.length > 0) setYearId(y[0].id);
    }

    loadFilters();
  }, []);

  useEffect(() => {
    if (role === "responsable" && filiereName) {
      setFilterFiliere(filiereName);
    }
  }, [role, filiereName]);

  // Ajuste les années disponibles dès que la filière ou durationYears change
  useEffect(() => {
    if (filterFiliere) {
      const levels = Array.from({ length: filiereDuration }, (_, i) => i + 1);

      setAvailableYearLevels(levels);

      if (!levels.includes(parseInt(filterYearLevel))) {
        setFilterYearLevel("1");
      }
    }
  }, [filterFiliere, filiereDuration]);
  useEffect(() => {
    const fetchDuration = async () => {
      if (!filterFiliere) return;

      const duration = await getFiliereDurationByName(filterFiliere);

      if (duration) {
        setFiliereDuration(duration);
      } else {
        setFiliereDuration(3);
      }
    };

    fetchDuration();
  }, [filterFiliere]);
  // Déterminer la limite en fonction des années / filières du contexte
  const maxDurationForCurrentFiliere = filiereDuration;
  const isLastYearOfFiliere =
    parseInt(filterYearLevel) >= maxDurationForCurrentFiliere;

  const handleFinalPromotion = async () => {
    setIsSaving(true);
    try {
      // Filtrer les étudiants qui ont strictement plus de 70
      const admitted = filteredStudents.filter((s: any) => {
        const p = calculateFinalPercentage(s.enrollment_id, dynamicColumns);
        return parseFloat(p) > 70;
      });

      if (admitted.length === 0) {
        alert("Aucun étudiant admissible (> 70%)");
        return;
      }

      // Trouver l'année académique courante sélectionnée
      const currentYearObj = years.find((y) => y.id === yearId);
      let nextAcademicYearId = yearId;

      if (currentYearObj && currentYearObj.name) {
        const currentYearMatch = currentYearObj.name.match(/\d+/);
        if (currentYearMatch) {
          const currentStartYear = parseInt(currentYearMatch[0]);
          const nextStartYear = currentStartYear + 1;
          const nextEndYear = nextStartYear + 1;
          const expectedNextYearName = currentYearObj.name.includes("-")
            ? `${nextStartYear}-${nextEndYear}`
            : `${nextStartYear}`;

          const foundNextYear = years.find((y) =>
            y.name.includes(expectedNextYearName),
          );
          if (foundNextYear) {
            nextAcademicYearId = foundNextYear.id;
          }
        }
      }
      const enrollmentData = admitted.map((s: any) => {
        return {
          student_id: s.student_id,
          filiere_id: s.filiere_id,
          academic_year_id: nextAcademicYearId,
          session_id: sessionId,
          current_year: Number(filterYearLevel) + 1,
        };
      });

      // 1. Inscription en bloc en 2ème Année
      const resEnroll = await enrollStudentsInBulk(enrollmentData);

      if (resEnroll.success) {
        // Optionnel : Si l'API renvoie les nouveaux identifiants d'inscription (enrollment_id)
        // et que vous devez initialiser explicitement les lignes de notes à vide (score: null ou 0)
        // dans la base de données pour les cours de la 2e année :

        // const newGradesData = resEnroll.insertedStudents.flatMap((newStudent: any) => {
        //   return dynamicColumns.map((course: any) => ({
        //     enrollment_id: newStudent.id,
        //     course_offering_id: course.offering_id,
        //     score: null // Notes réinitialisées / vides
        //   }));
        // });
        // await saveBulkGrades(newGradesData);

        // Réinitialisation locale des modifications en attente (UI)
        setPendingChanges({});

        alert(
          `Promotion réussie en 2ème Année ! Toutes les nouvelles notes ont été réinitialisées.`,
        );
        setIsModalOpen(false);
        await loadData();
      }
    } catch (error) {
      alert("Erreur lors de la promotion et de la réinitialisation");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (
      role !== "responsable" &&
      rawData.courses.length > 0 &&
      filterFiliere === ""
    ) {
      const uniqueFilieres = Array.from(
        new Set(rawData.courses.map((c: any) => c.filiere_name)),
      );
      if (uniqueFilieres.length > 0) {
        setFilterFiliere(uniqueFilieres[0] as string);
      }
    }
  }, [rawData, filterFiliere, role]);

  async function loadData() {
    if (!sessionId || !yearId) return;
    setLoading(true);
    const data = await getPalmaresData(sessionId, yearId);
    setRawData(data);
    setLoading(false);
  }

  const getCurrentScore = (enrollId: string, offId: string) => {
    const key = `${enrollId}-${offId}`;
    if (pendingChanges[key] !== undefined) return pendingChanges[key];
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

  const handleInputChange = (enrollId: string, offId: string, val: string) => {
    if (val === "") {
      setPendingChanges((prev) => ({
        ...prev,
        [`${enrollId}-${offId}`]: "",
      }));
      return;
    }
    const num = parseFloat(val);
    if (isNaN(num) || num < 0 || num > 100) return;

    setPendingChanges((prev) => ({
      ...prev,
      [`${enrollId}-${offId}`]: num,
    }));
  };

  const exportToExcel = () => {
    const courses = dynamicColumns;
    const data = filteredStudents.map((student: any) => {
      const row: any = {
        Etudiant: student.student_name,
        Filiere: student.filiere_name,
        Annee: student.year_level ? `${student.year_level}e Année` : "",
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

    saveAs(blob, `palmares_${filterFiliere}_Annee_${filterYearLevel}.xlsx`);
  };

  useEffect(() => {
    loadData();
  }, [sessionId, yearId]);

  const dynamicColumns = rawData.courses.filter(
    (c: any) =>
      c.filiere_name === filterFiliere &&
      String(c.year_level) === filterYearLevel,
  );

  const filteredStudents = rawData.students
    .filter((s: any) => {
      return (
        (filterFiliere === "" || s.filiere_name === filterFiliere) &&
        String(s.year_level) === filterYearLevel &&
        s.student_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })

    // SUPPRESSION DES DOUBLONS
    .reduce((acc: any[], current: any) => {
      const existing = acc.find((s) => s.student_id === current.student_id);

      if (!existing) {
        acc.push(current);
      } else {
        // garder l'inscription la plus récente
        const currentDate = new Date(current.created_at || 0).getTime();

        const existingDate = new Date(existing.created_at || 0).getTime();

        if (currentDate > existingDate) {
          const index = acc.indexOf(existing);
          acc[index] = current;
        }
      }

      return acc;
    }, []);

  const getGradeUpdatedAt = (enrollId: string) => {
    const studentGrades = rawData.grades.filter(
      (g: any) =>
        g.enrollment_id === enrollId && (g.updated_at || g.created_at),
    );

    if (studentGrades.length === 0) return "Aucune";

    const timestamps = studentGrades.map((g: any) => {
      const d = new Date(g.updated_at || g.created_at);
      return isNaN(d.getTime()) ? 0 : d.getTime();
    });

    const lastTimestamp = Math.max(...timestamps);
    if (lastTimestamp === 0) return "Format date invalide";

    const now = new Date().getTime();
    const diffInSeconds = Math.floor((now - lastTimestamp) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) return "À l'instant";
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInHours < 24) return `Il y a ${diffInHours} h`;
    if (diffInDays === 1) return "Hier";

    return new Date(lastTimestamp).toLocaleDateString();
  };

  const handleUpdate = async (
    enrollId: string,
    courseId: string,
    score: string,
  ) => {
    const uniqueId = `${enrollId}-${courseId}`;
    setUpdatingId(uniqueId);

    try {
      const result = await updateGrade(enrollId, courseId, Number(score));
      if (result.success) {
        await loadData();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

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
            className="px-4 py-2.5 bg-gray-50 border rounded-xl outline-none text-sm font-bold text-gray-600 disabled:bg-gray-100 disabled:text-gray-400"
            value={filterFiliere}
            onChange={(e) => setFilterFiliere(e.target.value)}
            disabled={role === "responsable"}
          >
            {role !== "responsable" ? (
              Array.from(
                new Set(rawData.courses.map((c: any) => c.filiere_name)),
              ).map((f: any) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))
            ) : (
              <option value={filiereName || ""}>{filiereName}</option>
            )}
          </select>

          <select
            value={filterYearLevel}
            onChange={(e) => setFilterYearLevel(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-bold text-gray-600 outline-none"
          >
            {availableYearLevels.map((lvl) => (
              <option key={lvl} value={String(lvl)}>
                {lvl}
                {lvl === 1 ? "ère" : "ème"} Année
              </option>
            ))}
          </select>
          <select
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-bold"
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
            className="px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-bold"
          >
            {years.map((y) => (
              <option key={y.id} value={y.id}>
                {y.name}
              </option>
            ))}
          </select>

          {role === "admin" && (
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={
                isSaving || filteredStudents.length === 0 || isLastYearOfFiliere
              }
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-40 disabled:bg-gray-300 disabled:text-gray-500 transition-all text-sm"
            >
              {isSaving ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <GraduationCap size={18} />
              )}
              {isLastYearOfFiliere
                ? "Dernière année atteinte"
                : "Admettre en 2e année"}
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant={"outline"} size={"sm"} onClick={exportToExcel}>
          Exporter en Excel
        </Button>
      </div>

      {/* TABLEAU DE RÉSULTATS */}
      <div className="bg-white rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-5 text-left sticky left-0 bg-slate-900 z-20 border-r border-slate-800 text-[10px] font-black uppercase tracking-widest">
                  Étudiant / Filière
                </th>
                {dynamicColumns.map((course: any) => (
                  <th
                    key={course.offering_id}
                    className="p-4 text-center border-r border-slate-800"
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
                <th className="p-4 text-center bg-slate-800 min-w-[120px] text-[10px] font-black uppercase">
                  Dernière Modif
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={dynamicColumns.length + 5}
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
                  const lastModif = getGradeUpdatedAt(student.enrollment_id);

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
                            {student.filiere_name} —{" "}
                            {student.year_level
                              ? `${student.year_level}e`
                              : filterYearLevel}{" "}
                            Année
                          </span>
                        </div>
                      </td>

                      {dynamicColumns.map((course: any) => (
                        <td
                          key={course.offering_id}
                          className="p-2 text-center border-r"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.5"
                              className={`w-16 p-2 text-center border-2 rounded-xl font-bold outline-none transition-all
                              ${
                                pendingChanges[
                                  `${student.enrollment_id}-${course.offering_id}`
                                ] !== undefined
                                  ? "border-indigo-500 bg-indigo-50"
                                  : "border-transparent bg-gray-50"
                              }`}
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
                            <Button
                              variant={"ghost"}
                              size="sm"
                              disabled={
                                updatingId ===
                                `${student.enrollment_id}-${course.offering_id}`
                              }
                              onClick={() => {
                                const val = getCurrentScore(
                                  student.enrollment_id,
                                  course.offering_id,
                                );
                                handleUpdate(
                                  student.enrollment_id,
                                  course.offering_id,
                                  val.toString(),
                                );
                              }}
                            >
                              {updatingId ===
                              `${student.enrollment_id}-${course.offering_id}` ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ...
                                </>
                              ) : (
                                "Update"
                              )}
                            </Button>
                          </div>
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

                      <td className="p-4 text-center bg-slate-50 font-medium text-xs text-slate-500">
                        <div className="flex flex-col items-center">
                          <span className="font-bold text-slate-700">
                            {lastModif}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE CONFIRMATION */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                <GraduationCap size={28} />
              </div>
              <h2 className="text-xl font-black text-slate-800">
                Admission en {Number(filterYearLevel) + 1} Année
              </h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <p className="text-xs text-amber-700 font-medium italic">
                  Note : Les étudiants sélectionnés ayant une moyenne supérieure
                  à 70% seront transférés en {Number(filterYearLevel) + 1}e
                  Année pour la nouvelle période académique.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-8">
              <button
                onClick={() => setIsModalOpen(false)}
                className="py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleFinalPromotion}
                disabled={isSaving}
                className="py-3 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                {isSaving && <Loader2 size={16} className="animate-spin" />}
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
