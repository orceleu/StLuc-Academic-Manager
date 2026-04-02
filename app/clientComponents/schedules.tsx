"use client";

import { useState, useEffect } from "react";
import { getFullSchedules } from "@/app/neon/request";
import { Search, Calendar, Clock, MapPin, User, BookOpen } from "lucide-react";

export default function ScheduleTable() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // États des filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDay, setFilterDay] = useState("");
  const [filterTime, setFilterTime] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterDay, filterTime, schedules]);

  async function loadData() {
    setLoading(true);
    const data = await getFullSchedules();
    setSchedules(data);
    setLoading(false);
  }

  function applyFilters() {
    let temp = schedules.filter((s) => {
      const matchSearch =
        s.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.teacher_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.room.toLowerCase().includes(searchTerm.toLowerCase());

      const matchDay = filterDay === "" || s.day_of_week === filterDay;

      // Filtre par heure (si l'heure de début du cours est égale ou après l'heure choisie)
      const matchTime = filterTime === "" || s.start_time >= filterTime;

      return matchSearch && matchDay && matchTime;
    });
    setFiltered(temp);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-6">
      {/* 🔍 SEARCH + FILTERS */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
          {/* SEARCH */}
          <div className="relative w-full">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Rechercher cours, prof ou salle..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 transition"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* DAY FILTER */}
          <div className="relative w-full">
            <Calendar
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <select
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl outline-none appearance-none"
              onChange={(e) => setFilterDay(e.target.value)}
            >
              <option value="">Tous les jours</option>
              {["lundi", "mardi", "mercredi", "jeudi", "vendredi"].map((d) => (
                <option key={d} value={d}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* TIME FILTER */}
          <div className="relative w-full">
            <Clock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="time"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl outline-none"
              onChange={(e) => setFilterTime(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 📅 TABLE */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        {/* scroll horizontal sur mobile */}
        <div className="w-full overflow-x-auto">
          <table className="min-w-[700px] w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-4 text-xs font-bold text-gray-400 uppercase whitespace-nowrap">
                  Jour / Heure
                </th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase whitespace-nowrap">
                  Cours
                </th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase whitespace-nowrap">
                  Enseignant
                </th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase whitespace-nowrap">
                  Salle
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-10 text-center text-gray-400 italic"
                  >
                    Chargement du planning...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-10 text-center text-gray-400 italic"
                  >
                    Aucun cours trouvé.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-indigo-50/30 transition">
                    {/* DAY + TIME */}
                    <td className="p-4 align-middle">
                      <div className="flex flex-col leading-tight">
                        <span className="font-bold text-indigo-700 uppercase text-xs">
                          {s.day_of_week}
                        </span>
                        <span className="text-sm text-gray-600">
                          {s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}
                        </span>
                      </div>
                    </td>

                    {/* COURSE */}
                    <td className="p-4 align-middle">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-gray-800 flex items-center gap-2">
                          <BookOpen size={14} className="text-gray-400" />
                          {s.course_name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {s.filiere_name} • {s.session_name}
                        </span>
                      </div>
                    </td>

                    {/* TEACHER */}
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold">
                          {s.teacher_name.charAt(0)}
                        </div>
                        {s.teacher_name}
                      </div>
                    </td>

                    {/* ROOM */}
                    <td className="p-4 align-middle">
                      <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold border border-amber-100 flex items-center w-fit gap-1">
                        <MapPin size={12} />
                        {s.room}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
