"use client";

import { useState, useEffect } from "react";
import { getDetailedOfferings, deleteOffering } from "@/app/neon/request";
import {
  Search,
  Layers,
  Trash2,
  AlertCircle,
  X,
  GraduationCap,
  Calendar,
} from "lucide-react";

export default function OfferingTable() {
  const [offerings, setOfferings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // États des filtres
  const [search, setSearch] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterSession, setFilterSession] = useState("");

  // État Modale
  const [showModal, setShowModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    const data = await getDetailedOfferings();
    setOfferings(data);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!idToDelete) return;
    const res = await deleteOffering(idToDelete);
    if (res.success) {
      setShowModal(false);
      setIdToDelete(null);
      refreshData();
    } else {
      setErrorMessage(res.error || "Erreur lors de la suppression");
    }
  };

  // Filtrage
  const filtered = offerings.filter((o) => {
    const matchSearch =
      o.course_name.toLowerCase().includes(search.toLowerCase()) ||
      o.filiere_name.toLowerCase().includes(search.toLowerCase());
    const matchYear = filterYear === "" || o.year_name === filterYear;
    const matchSession =
      filterSession === "" || o.session_name === filterSession;
    return matchSearch && matchYear && matchSession;
  });

  const years = Array.from(new Set(offerings.map((o) => o.year_name)));
  const sessions = Array.from(new Set(offerings.map((o) => o.session_name)));

  return (
    <div className="space-y-6">
      {/* --- FILTRES --- */}
      <p className="text-3xl text-center m-10">Cours</p>
      <div className="bg-white p-4 rounded-2xl border shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative md:col-span-2">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Rechercher un cours ou une filière..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-100 transition text-sm"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="p-2.5 bg-gray-50 border rounded-xl outline-none text-sm"
          onChange={(e) => setFilterYear(e.target.value)}
        >
          <option value="">Toutes les années</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <select
          className="p-2.5 bg-gray-50 border rounded-xl outline-none text-sm"
          onChange={(e) => setFilterSession(e.target.value)}
        >
          <option value="">Toutes les sessions</option>
          {sessions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* --- TABLEAU --- */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b">
              <th className="p-4 text-xs font-bold text-gray-400 uppercase">
                Cours
              </th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase">
                Filière
              </th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase">
                Session / Année
              </th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase">
                Coeff.
              </th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-10 text-center text-gray-400 italic"
                >
                  Chargement des offres...
                </td>
              </tr>
            ) : (
              filtered.map((o) => (
                <tr
                  key={o.offering_id}
                  className="hover:bg-emerald-50/20 transition-colors group"
                >
                  <td className="p-4 font-bold text-gray-800">
                    {o.course_name}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <GraduationCap size={14} className="text-emerald-500" />{" "}
                      {o.filiere_name}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700">
                        {o.session_name}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        {o.year_name}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-black border border-emerald-100">
                      {o.coefficient}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => {
                        setIdToDelete(o.offering_id);
                        setShowModal(true);
                        setErrorMessage(null);
                      }}
                      className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODALE DE CONFIRMATION --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl scale-in-center">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-red-50 text-red-600 rounded-full mb-4">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Supprimer l'offre ?
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Voulez-vous retirer ce cours de la programmation académique ?
              </p>

              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-100 flex gap-2 items-start text-left">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  {errorMessage}
                </div>
              )}

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl transition"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-3 px-4 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-100 transition"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
