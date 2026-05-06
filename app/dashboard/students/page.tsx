"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Calendar, BookOpen, Hash, User } from "lucide-react";
import { getDetailedStudents } from "@/app/neon/request";
import GradesPage from "@/app/clientComponents/gradePalmares";

export default function StudentTable() {
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // États des filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterFiliere, setFilterFiliere] = useState("");

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterYear, filterFiliere, students]);

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
      const matchYear = filterYear === "" || s.year_name === filterYear;
      const matchFiliere =
        filterFiliere === "" || s.filiere_name === filterFiliere;

      return (matchName || matchMatricule) && matchYear && matchFiliere;
    });
    setFilteredStudents(temp);
  }

  // Extraire les options uniques pour les sélecteurs
  const uniqueYears = Array.from(
    new Set(students.map((s) => s.year_name).filter(Boolean)),
  );
  const uniqueFilieres = Array.from(
    new Set(students.map((s) => s.filiere_name).filter(Boolean)),
  );

  return (
    <div className="space-y-6">
      {/* BARRE DE FILTRES */}
      <div className="p-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border shadow-sm">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Nom ou Matricule..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 transition"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="p-2 bg-gray-50 border rounded-xl outline-none"
            onChange={(e) => setFilterFiliere(e.target.value)}
          >
            <option value="">Toutes les filières</option>
            {uniqueFilieres.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          <select
            className="p-2 bg-gray-50 border rounded-xl outline-none"
            onChange={(e) => setFilterYear(e.target.value)}
          >
            <option value="">Toutes les années</option>
            {uniqueYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* TABLEAU */}
        <p className="p-4 mx-auto ">
          Nombre d'etudiants:{" "}
          <span className="text-semibold text-emerald-600">
            {filteredStudents.length}
          </span>
        </p>
        <div className="bg-white rounded-2xl mt-6 border shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Étudiant
                </th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Matricule
                </th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Filière
                </th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Session/Année
                </th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Date Inscription
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-400">
                    Chargement...
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition">
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
                      <span className="px-2 py-1 bg-gray-100 rounded-md text-xs font-mono text-gray-600">
                        {s.matricule || "Aucun"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <BookOpen size={14} className="text-emerald-500" />
                        {s.filiere_name || "N/A"}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-700">
                          {s.session_name}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {s.year_name}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-500 italic">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {!loading && filteredStudents.length === 0 && (
            <div className="p-10 text-center text-gray-400 italic">
              Aucun étudiant trouvé pour ces critères.
            </div>
          )}
        </div>
      </div>
      <GradesPage />
    </div>
  );
}
