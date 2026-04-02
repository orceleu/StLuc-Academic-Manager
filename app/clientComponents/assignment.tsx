"use client";

import { useState, useEffect } from "react";
import {
  getAssignmentsWithSchedules,
  deleteAssignment,
} from "@/app/neon/request";
import {
  Search,
  Calendar,
  MapPin,
  Clock,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";

export default function AssignmentTable() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // États des Filtres
  const [search, setSearch] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  // État pour la Modale de Confirmation
  const [showModal, setShowModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    const res = await getAssignmentsWithSchedules();
    setData(res);
    setLoading(false);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      await deleteAssignment(itemToDelete);
      setShowModal(false);
      setItemToDelete(null);
      refreshData();
    }
  };

  // Logique de filtrage
  const filteredData = data.filter((item) => {
    const matchSearch =
      item.teacher_name.toLowerCase().includes(search.toLowerCase()) ||
      item.course_name.toLowerCase().includes(search.toLowerCase());

    const matchDay = selectedDay === "" || item.day_of_week === selectedDay;
    const matchYear = selectedYear === "" || item.year_name === selectedYear;

    // Filtre Heure : affiche les cours qui commencent à ou après l'heure choisie
    const matchTime =
      selectedTime === "" ||
      (item.start_time && item.start_time >= selectedTime);

    return matchSearch && matchDay && matchYear && matchTime;
  });

  const uniqueYears = Array.from(new Set(data.map((item) => item.year_name)));

  return (
    <div className="space-y-4 ">
      {/* --- BARRE DE FILTRES --- */}
      <p className="text-3xl text-center m-10">Horaire & affectation</p>
      <div className="bg-white p-4 rounded-2xl border shadow-sm grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="relative col-span-1 md:col-span-2">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Rechercher un prof ou un cours..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-orange-100 transition text-sm"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="p-2.5 bg-gray-50 border rounded-xl outline-none text-sm font-medium"
          onChange={(e) => setSelectedDay(e.target.value)}
        >
          <option value="">Tous les jours</option>
          {["lundi", "mardi", "mercredi", "jeudi", "vendredi"].map((d) => (
            <option key={d} value={d}>
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </option>
          ))}
        </select>

        <div className="relative">
          <Clock
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="time"
            className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border rounded-xl outline-none text-sm"
            onChange={(e) => setSelectedTime(e.target.value)}
          />
        </div>

        <select
          className="p-2.5 bg-gray-50 border rounded-xl outline-none text-sm font-medium"
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="">Toutes les années</option>
          {uniqueYears.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* --- TABLEAU --- */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b">
                <th className="p-4 text-xs font-bold text-gray-400 uppercase">
                  Enseignant
                </th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase">
                  Cours & Filière
                </th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase">
                  Horaire
                </th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase">
                  Salle
                </th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase text-right">
                  Action
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
                    Chargement...
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr
                    key={item.assignment_id}
                    className="hover:bg-orange-50/20 transition-colors"
                  >
                    <td className="p-4 font-semibold text-gray-900">
                      {item.teacher_name}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-indigo-600">
                            {item.course_name}
                          </span>
                          <span className="text-[11px] text-gray-500 uppercase">
                            {item.filiere_name} •{item.session_name}• (
                            {item.year_name})
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {item.day_of_week ? (
                        <div className="text-xs">
                          <span className="font-bold text-gray-700 capitalize">
                            {item.day_of_week}
                          </span>
                          <div className="text-gray-500">
                            {item.start_time.slice(0, 5)} -{" "}
                            {item.end_time.slice(0, 5)}
                          </div>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-4">
                      {item.room && (
                        <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-md text-[10px] font-bold border border-amber-100 flex items-center gap-1 w-fit">
                          <MapPin size={10} /> {item.room}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setItemToDelete(item.assignment_id);
                          setShowModal(true);
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
      </div>

      {/* --- MODALE DE CONFIRMATION --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-red-50 text-red-600 rounded-full mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Confirmer la suppression ?
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Cette action est irréversible. L'affectation et l'horaire
                associé seront définitivement effacés.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-100 transition"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
