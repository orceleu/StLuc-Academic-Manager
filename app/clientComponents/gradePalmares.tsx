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
import {
  enrollStudentsInBulk,
  getAcademicYears,
  getFilieres,
  getPalmaresData,
  getSessions,
  saveBulkGrades,
  updateGrade,
} from "@/app/neon/request";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
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

  // 1. Modifier l'état initial
  const [filterFiliere, setFilterFiliere] = useState<string>("");
  const [sessions, setSessions] = useState<any[]>([]);
  const [years, setYears] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [yearId, setYearId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetFiliereId, setTargetFiliereId] = useState("");
  const [allFilieres, setAllFilieres] = useState<any[]>([]);
  useEffect(() => {
    async function loadFilters() {
      const s = await getSessions(); // API
      const y = await getAcademicYears();
      const f = await getFilieres(); // Récupère les filières via ton API
      setSessions(s);
      setYears(y);
      setAllFilieres(f);

      // Valeur par défaut
      if (s.length > 0) setSessionId(s[0].id);
      if (y.length > 0) setYearId(y[0].id);
      if (f.length > 0) setTargetFiliereId(f[0].id);
    }

    loadFilters();
  }, []);
  const handleFinalPromotion = async () => {
    setIsSaving(true);

    try {
      // 1. Filtrer les admis
      const admitted = filteredStudents.filter((s: any) => {
        const p = calculateFinalPercentage(s.enrollment_id, dynamicColumns);
        return parseFloat(p) >= 70;
      });

      if (admitted.length === 0) {
        alert("Aucun étudiant admissible (>= 70%)");
        return;
      }

      // 2. Préparer les données avec les IDs trouvés
      const dataToSave = admitted.map((s: any) => {
        // On cherche l'étudiant dans rawData pour être sûr d'avoir son student_id original

        return {
          student_id: s.student_id, // Utilise l'ID trouvé
          filiere_id: targetFiliereId, // L'ID sélectionné dans le popup
          academic_year_id: yearId, // L'ID sélectionné dans le header
          session_id: sessionId,
        };
      });

      const res = await enrollStudentsInBulk(dataToSave);
      if (res.success) {
        alert("Promotion réussie !");
        setIsModalOpen(false);
      }
    } catch (error) {
      alert("Erreur lors de la promotion");
    } finally {
      setIsSaving(false);
    }
  };
  // 2. Mettre à jour la filière par défaut quand rawData change
  useEffect(() => {
    if (rawData.courses.length > 0 && filterFiliere === "") {
      // Récupère la liste unique des noms de filières
      const uniqueFilieres = Array.from(
        new Set(rawData.courses.map((c: any) => c.filiere_name)),
      );
      if (uniqueFilieres.length > 0) {
        setFilterFiliere(uniqueFilieres[0] as string); // Sélectionne la première
      }
    }
  }, [rawData, filterFiliere]);
  useEffect(() => {
    loadData();
  }, []);

  /*async function loadData() {
    setLoading(true);
    const data = await getPalmaresData();
    setRawData(data);
    setLoading(false);
  }*/
  async function loadData() {
    if (!sessionId || !yearId) return;

    setLoading(true);

    const data = await getPalmaresData(sessionId, yearId);

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
  const formatLastUpdate = (enrollId: string, offId: string) => {
    // On cherche la note correspondante
    const grade = rawData.grades.find(
      (g: any) =>
        g.enrollment_id === enrollId && g.course_offering_id === offId,
    );

    if (!grade || !grade.updated_at) return null;

    const date = new Date(grade.updated_at);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
    // Autoriser vide (pour effacer)
    if (val === "") {
      setPendingChanges((prev) => ({
        ...prev,
        [`${enrollId}-${offId}`]: "",
      }));
      return;
    }

    const num = parseFloat(val);

    // Validation simple
    if (isNaN(num) || num < 0 || num > 100) return;

    setPendingChanges((prev) => ({
      ...prev,
      [`${enrollId}-${offId}`]: num,
    }));
  };
  const handlePromoteStudents = async () => {
    // 1. On vérifie si une année est bien sélectionnée
    if (!yearId) {
      alert("Veuillez sélectionner une année académique cible.");
      return;
    }

    // Confirmation visuelle avec le nom de l'année
    const selectedYearName = years.find((y) => y.id === yearId)?.name;
    if (
      !confirm(
        `Voulez-vous admettre les étudiants (>= 70%) en ${selectedYearName} ?`,
      )
    )
      return;

    setIsSaving(true);

    try {
      // 2. Filtrer les étudiants qui ont 70% ou plus
      const admittedStudents = filteredStudents.filter((student: any) => {
        const percent = calculateFinalPercentage(
          student.enrollment_id,
          dynamicColumns,
        );
        return parseFloat(percent) >= 70;
      });

      if (admittedStudents.length === 0) {
        alert("Aucun étudiant n'atteint les 70% requis pour la promotion.");
        setIsSaving(false);
        return;
      }

      // 3. Préparer les données en utilisant yearId du select
      const promotionData = admittedStudents.map((s: any) => ({
        student_id: s.student_id, // Récupéré via rawData
        filiere_id: s.filiere_id, // Récupéré via rawData
        academic_year_id: yearId, // <--- Voici l'ID de ton select !
        session_id: sessionId, // Session actuelle
      }));

      // 4. Appel de la fonction Neon
      const res = await enrollStudentsInBulk(promotionData);

      if (res.success) {
        alert(
          `Félicitations ! ${admittedStudents.length} étudiants ont été inscrits en ${selectedYearName}.`,
        );
      } else {
        alert("Erreur lors de l'inscription en base de données.");
      }
    } catch (error) {
      console.error("Promotion error:", error);
      alert("Une erreur critique est survenue.");
    } finally {
      setIsSaving(false);
    }
  };
  const exportToExcel = () => {
    // 1. Colonnes dynamiques (déjà filtrées par filière)
    const courses = dynamicColumns;

    // 2. Construire les données
    const data = filteredStudents.map((student: any) => {
      const row: any = {
        Etudiant: student.student_name,
        Filiere: student.filiere_name,
      };

      // Ajouter chaque cours
      courses.forEach((course: any) => {
        const score = getCurrentScore(
          student.enrollment_id,
          course.offering_id,
        );

        row[course.course_name] = score === "" ? "" : Number(score);
      });

      // Ajouter calculs
      const sumNotes = calculateSumNotes(student.enrollment_id, courses);
      const sumCoeff = calculateSumCoeff(courses);
      const percent = calculateFinalPercentage(student.enrollment_id, courses);

      row["Somme Notes"] = sumNotes.toFixed(2);
      row["Somme Coeff"] = sumCoeff;
      row["Moyenne (%)"] = percent;

      return row;
    });

    // 3. Créer feuille Excel
    const worksheet = XLSX.utils.json_to_sheet(data);

    // 4. Créer workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Palmares");

    // 5. Export fichier
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(blob, `palmares_${filterFiliere}.xlsx`);
  };
  const handleSave = async () => {
    setIsSaving(true);

    // 1. On transforme l'objet { "ID-ID": 15 } en un tableau d'entrées [ ["ID-ID", 15], ...]
    const updates = Object.entries(pendingChanges).map(([key, score]) => {
      // 2. On découpe la clé pour retrouver les IDs originaux
      const [enrollment_id, course_offering_id] = key.split("-");

      // 3. On prépare l'objet final pour la base de données
      if (score === "") {
        return {
          enrollment_id,
          course_offering_id,
          score: null, // Si l'input est vide, on envoie null pour effacer en DB
        };
      }

      return {
        enrollment_id,
        course_offering_id,
        score: Number(score), // On s'assure que c'est bien un nombre
      };
    });
    console.table(updates);
    // 4. On envoie tout d'un coup au serveur
    const res = await saveBulkGrades(updates);

    if (res.success) {
      setPendingChanges({}); // On vide les changements locaux (car ils sont maintenant en DB)
      await loadData(); // On rafraîchit l'affichage avec les données du serveur
    }

    setIsSaving(false);
  };

  useEffect(() => {
    loadData();
  }, [sessionId, yearId]);
  // --- FILTRAGE ---
  const dynamicColumns = rawData.courses.filter(
    (c: any) => c.filiere_name === filterFiliere,
  );
  const filteredStudents = rawData.students.filter(
    (s: any) =>
      (filterFiliere === "" || s.filiere_name === filterFiliere) &&
      s.student_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  // --- FONCTION UTILITAIRE (À ajouter avant le return) ---
  const getGradeUpdatedAt = (enrollId: string) => {
    // 1. Filtrer les notes de l'étudiant qui ont une date valide
    const studentGrades = rawData.grades.filter(
      (g: any) =>
        g.enrollment_id === enrollId && (g.updated_at || g.created_at),
    );

    if (studentGrades.length === 0) return "Aucune";

    // 2. Récupérer le timestamp le plus récent (en gérant les dates invalides)
    const timestamps = studentGrades.map((g: any) => {
      const d = new Date(g.updated_at || g.created_at);
      return isNaN(d.getTime()) ? 0 : d.getTime();
    });

    const lastTimestamp = Math.max(...timestamps);
    if (lastTimestamp === 0) return "Format date invalide";

    // 3. Calculer la différence de temps
    const now = new Date().getTime();
    const diffInSeconds = Math.floor((now - lastTimestamp) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    // 4. Retourner le format relatif "il y a X..."
    if (diffInSeconds < 60) return "À l'instant";
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInHours < 24) return `Il y a ${diffInHours} h`;
    if (diffInDays === 1) return "Hier";

    // Si c'est plus vieux, on affiche la date simple
    return new Date(lastTimestamp).toLocaleDateString();
  };
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

          <button
            onClick={() => {
              setIsModalOpen(true);
            }}
            disabled={isSaving || filteredStudents.length === 0}
            className="flex items-center gap-2 px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-30 transition-all shadow-xl shadow-indigo-200"
          >
            {isSaving ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <GraduationCap size={18} />
            )}
            Admettre en 2ème année
          </button>
        </div>
      </div>
      <button
        onClick={exportToExcel}
        className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200"
      >
        Export Excel
      </button>
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
                            {student.filiere_name}
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
                            <button
                              type="button"
                              className="text-[10px] text-indigo-600 font-bold hover:underline"
                              onClick={() => {
                                const val = getCurrentScore(
                                  student.enrollment_id,
                                  course.offering_id,
                                );
                                updateGrade(
                                  student.enrollment_id,
                                  course.offering_id,
                                  Number(val),
                                );
                              }}
                            >
                              Update
                            </button>
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
                          {lastModif !== "Aucune" && (
                            <span className="text-[8px] uppercase">
                              Aujourd'hui
                            </span>
                          )}
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
                Confirmer Admission
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                  Filière de destination
                </label>
                <select
                  value={targetFiliereId}
                  onChange={(e) => setTargetFiliereId(e.target.value)}
                  className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {allFilieres.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <p className="text-xs text-amber-700 font-medium italic">
                  Note: Seuls les étudiants ayant une moyenne supérieure ou
                  égale à **70%** seront transférés.
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
