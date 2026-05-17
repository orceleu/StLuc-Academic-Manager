"use client";

import { useState, useEffect } from "react";
import { Search, Trash } from "lucide-react";
import { getDetailedStudents } from "@/app/neon/request";
import GradesPage from "@/app/clientComponents/gradePalmares";
import { Button } from "@/components/ui/button";
import { MdArrowBackIos } from "react-icons/md";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/clientComponents/AuthContext";
import GradesPageTeachers from "@/app/clientComponents/teacherGradeTable";

export default function StudentTable() {
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // États des filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAcademicYear, setFilterAcademicYear] = useState(""); // Correspond à year_name (ex: 2025-2026)
  const [filterStudentYear, setFilterStudentYear] = useState(""); // Correspond à current_year (ex: 1, 2...)
  const [filterFiliere, setFilterFiliere] = useState("");

  // Récupération du contexte Auth
  const { user, role, filiereName, durationYears } = useAuth();

  useEffect(() => {
    loadStudents();
  }, []);

  // Fixer la filière si l'utilisateur est un responsable
  useEffect(() => {
    if (role === "responsable" && filiereName) {
      setFilterFiliere(filiereName);
    }
  }, [role, filiereName]);

  // Reset le niveau d'études si la filière change
  useEffect(() => {
    setFilterStudentYear("");
  }, [filterFiliere]);

  useEffect(() => {
    applyFilters();
  }, [
    searchTerm,
    filterAcademicYear,
    filterStudentYear,
    filterFiliere,
    students,
  ]);

  async function loadStudents() {
    setLoading(true);
    const data = await getDetailedStudents();
    setStudents(data);
    setLoading(false);
  }

  function applyFilters() {
    let temp = students.filter((s) => {
      const matchName = s.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchMatricule = s.matricule
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

      // Filtre 1 : Année Académique (ex: "2025-2026")
      const matchAcademicYear =
        filterAcademicYear === "" || s.year_name === filterAcademicYear;

      // Filtre 2 : Niveau d'études actuel (ex: 1, 2, 3)
      const matchStudentYear =
        filterStudentYear === "" ||
        String(s.current_year) === filterStudentYear;

      // Filtre 3 : Filière
      const matchFiliere =
        filterFiliere === "" || s.filiere_name === filterFiliere;

      return (
        (matchName || matchMatricule) &&
        matchAcademicYear &&
        matchStudentYear &&
        matchFiliere
      );
    });
    setFilteredStudents(temp);
  }

  // Génération dynamique de la liste des niveaux d'études (1, 2, 3...)
  const generatedStudentYears = (() => {
    if (role === "responsable" && durationYears) {
      return Array.from(
        { length: Number(durationYears) },
        (_, i) => `${i + 1}`,
      );
    }

    const baseStudents = filterFiliere
      ? students.filter((s) => s.filiere_name === filterFiliere)
      : students;

    return Array.from(
      new Set(baseStudents.map((s) => s.current_year).filter(Boolean)),
    )
      .sort((a, b) => Number(a) - Number(b))
      .map(String);
  })();

  const uniqueAcademicYears = Array.from(
    new Set(students.map((s) => s.year_name).filter(Boolean)),
  );

  const uniqueFilieres = Array.from(
    new Set(students.map((s) => s.filiere_name).filter(Boolean)),
  );

  if (!user)
    return (
      <p className="text-center text-3xl p-10 text-red-500">Non autorisé</p>
    );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="space-y-6">
        <Button
          onClick={() => router.back()}
          variant={"outline"}
          className="my-2 mx-2 md:my-6"
        >
          <MdArrowBackIos />
        </Button>

        <p className="text-2xl font-semibold text-center my-2 md:my-6 underline">
          Section étudiants.
        </p>

        {role !== "teacher" && (
          <div className="p-2 md:p-6">
            {/* GRILLE DES FILTRES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border shadow-sm">
              {/* BARRE DE RECHERCHE */}
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Nom ou Matricule..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 transition text-sm"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* FILTRE FILIÈRE */}
              <select
                className="p-2 bg-gray-50 border rounded-xl outline-none text-sm font-medium text-gray-600 disabled:bg-gray-100"
                value={filterFiliere}
                onChange={(e) => setFilterFiliere(e.target.value)}
                disabled={role === "responsable"}
              >
                {role !== "responsable" ? (
                  <>
                    <option value="">Toutes les filières</option>
                    {uniqueFilieres.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </>
                ) : (
                  <option value={filiereName || ""}>{filiereName}</option>
                )}
              </select>

              {/* FILTRE NIVEAU D'ÉTUDES DE L'ÉTUDIANT */}
              <select
                className="p-2 bg-gray-50 border rounded-xl outline-none text-sm font-medium text-gray-600"
                value={filterStudentYear}
                onChange={(e) => setFilterStudentYear(e.target.value)}
              >
                <option value="">Tous les niveaux (Années)</option>
                {generatedStudentYears.map((y) => (
                  <option key={y} value={y}>
                    {y}
                    {Number(y) === 1 ? "ère" : "ème"} année
                  </option>
                ))}
              </select>

              {/* FILTRE ANNÉE ACADÉMIQUE */}
              <select
                className="p-2 bg-gray-50 border rounded-xl outline-none text-sm font-medium text-gray-600"
                value={filterAcademicYear}
                onChange={(e) => setFilterAcademicYear(e.target.value)}
              >
                <option value="">Toutes les années académiques</option>
                {uniqueAcademicYears.map((ay) => (
                  <option key={ay} value={ay}>
                    {ay}
                  </option>
                ))}
              </select>
            </div>

            <p className="p-4 mx-auto">
              Nombre d'étudiants:{" "}
              <span className="text-semibold text-emerald-600">
                {filteredStudents.length}
              </span>
            </p>

            {/* TABLEAU PRINCIPAL */}
            <div className="bg-white rounded-2xl mt-6 border overflow-hidden">
              <div className="hidden md:block overflow-x-auto max-h-[70vh] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-10 bg-gray-50">
                    <tr className="border-b">
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">
                        Étudiant
                      </th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">
                        Matricule
                      </th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">
                        Filière
                      </th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">
                        Niveau actuel
                      </th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">
                        Année Académique
                      </th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">
                        Date
                      </th>
                      {role === "admin" && (
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">
                          Action
                        </th>
                      )}
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {loading ? (
                      <tr>
                        <td
                          colSpan={role === "admin" ? 7 : 6}
                          className="p-10 text-center text-gray-400"
                        >
                          Chargement...
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((s) => (
                        <tr
                          key={s.id + Math.random()}
                          className="hover:bg-gray-50 transition"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                {s.name.charAt(0)}
                              </div>
                              <span className="font-semibold text-gray-700">
                                {s.name}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-1 bg-gray-100 rounded-md text-xs font-mono">
                              {s.matricule || "Aucun"}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-gray-600">
                            {s.filiere_name || "N/A"}
                          </td>
                          <td className="p-4 text-sm font-semibold text-indigo-600">
                            {s.current_year
                              ? `${s.current_year}${s.current_year === 1 ? "ère" : "ème"} année`
                              : "N/A"}
                          </td>
                          <td className="p-4 text-sm">
                            <div className="font-medium text-gray-700">
                              {s.year_name}
                            </div>
                            <div className="text-gray-400 text-xs">
                              {s.session_name}
                            </div>
                          </td>
                          <td className="p-4 text-sm text-gray-500">
                            {new Date(s.created_at).toLocaleDateString()}
                          </td>
                          {role === "admin" && (
                            <td className="p-4 text-sm text-gray-500">
                              <Button variant={"destructive"}>
                                <Trash size={16} />
                              </Button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* VUE CARTE MOBILE */}
              <div className="md:hidden max-h-[70vh] overflow-y-auto divide-y">
                {loading ? (
                  <div className="p-10 text-center text-gray-400">
                    Chargement...
                  </div>
                ) : (
                  filteredStudents.map((s) => (
                    <div key={s.id + Math.random()} className="p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-700">
                            {s.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {s.matricule || "Aucun"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-400 text-xs">Filière</p>
                          <p className="text-gray-700 text-xs truncate">
                            {s.filiere_name || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Niveau</p>
                          <p className="text-indigo-600 font-semibold">
                            {s.current_year} année
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Année Acad.</p>
                          <p className="text-gray-700 text-xs">{s.year_name}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Date</p>
                          <p className="text-gray-500 text-xs">
                            {new Date(s.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {!loading && filteredStudents.length === 0 && (
                <div className="p-10 text-center text-gray-400 italic">
                  Aucun étudiant trouvé.
                </div>
              )}
            </div>
          </div>
        )}

        {role === "teacher" ? <GradesPageTeachers /> : <GradesPage />}
      </div>
    </div>
  );
}
