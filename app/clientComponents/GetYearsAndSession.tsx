"use client";

import { useEffect, useState } from "react";
import { Calendar, Layers, Plus, Trash2, AlertCircle } from "lucide-react";
import {
  addAcademicYear,
  addSession,
  deleteSession,
  getAcademicYears,
  getSessions,
} from "../neon/request";

export default function SetupPage2() {
  const [years, setYears] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modales & Formulaires (états précédents conservés)
  const [showYearModal, setShowYearModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [yearName, setYearName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sessionName, setSessionName] = useState("");

  const refreshData = async () => {
    setLoading(true);
    const [y, s] = await Promise.all([getAcademicYears(), getSessions()]);
    setYears(y);
    setSessions(s);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // --- LOGIQUE DE FILTRE ANNÉE EN COURS ---
  const currentYear = years.find((y) => {
    const now = new Date();
    return now >= new Date(y.start_date) && now <= new Date(y.end_date);
  });

  // --- HANDLER SUPPRESSION ---
  const handleDeleteSession = async (id: string) => {
    if (confirm("Supprimer cette session définivement ?")) {
      const res = await deleteSession(id);
      if (res.success) refreshData();
      else alert(res.error);
    }
  };

  const handleYearSubmit = async () => {
    const res = await addAcademicYear(yearName, startDate, endDate);
    if (res.success) {
      setShowYearModal(false);
      refreshData();
    }
  };

  const handleSessionSubmit = async () => {
    const res = await addSession(sessionName);
    if (res.success) {
      setShowSessionModal(false);
      setSessionName("");
      refreshData();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-12">
      <header className="grid grid-cols-1 md:grid-cols-2 border-b pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Dashboard Académique
          </h1>
          <p className="text-gray-500 mb-5">
            Configuration temps réel de l'établissement.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={() => setShowYearModal(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            <Calendar size={18} /> Nouvelle Année
          </button>
          <button
            onClick={() => setShowSessionModal(true)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
          >
            <Plus size={18} /> Nouvelle Session
          </button>
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-10">
        {/* SECTION ANNÉE ACTUELLE */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-700">
            <Calendar className="text-indigo-500" /> Année en cours
          </h2>
          {currentYear ? (
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl">
              <div className="relative z-10">
                <span className="bg-white/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  Période Active
                </span>
                <h3 className="text-4xl font-black mt-2">{currentYear.name}</h3>
                <p className="text-indigo-100 mt-1 opacity-80 font-medium">
                  Du {new Date(currentYear.start_date).toLocaleDateString()} au{" "}
                  {new Date(currentYear.end_date).toLocaleDateString()}
                </p>
              </div>
              <Calendar className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 rotate-12" />
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-2xl p-8 text-center text-gray-400">
              <AlertCircle className="mx-auto mb-2 opacity-20" size={40} />
              <p>
                Aucune année académique ne correspond à la date d'aujourd'hui.
              </p>
            </div>
          )}
        </section>

        {/* SECTION SESSIONS AVEC SUPPRESSION */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-700">
            <Layers className="text-emerald-500" /> Sessions de cours
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="group bg-white border rounded-xl p-4 flex justify-between items-center hover:shadow-md transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center font-black text-xl">
                    {s.name}
                  </div>
                  <span className="font-semibold text-gray-700">
                    Session {s.name}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteSession(s.id)}
                  className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Supprimer la session"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
            {sessions.length === 0 && (
              <p className="text-gray-400 italic">Aucune session créée.</p>
            )}
          </div>
        </section>
      </div>

      {/* --- MODALE ANNÉE --- */}
      {showYearModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold mb-6">Nouvelle Année</h2>
            <div className="space-y-4">
              <input
                placeholder="Libellé (ex: 2025-2026)"
                className="w-full border-2 border-gray-100 focus:border-indigo-500 p-3 rounded-xl outline-none transition"
                onChange={(e) => setYearName(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">
                    Début
                  </label>
                  <input
                    type="date"
                    className="w-full border-2 border-gray-100 p-3 rounded-xl"
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">
                    Fin
                  </label>
                  <input
                    type="date"
                    className="w-full border-2 border-gray-100 p-3 rounded-xl"
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setShowYearModal(false)}
                className="px-5 py-2 text-gray-500 font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleYearSubmit}
                className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-indigo-200"
              >
                Créer l'année
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODALE SESSION --- */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold mb-2">Ajouter Session</h2>
            <p className="text-sm text-gray-500 mb-6">
              Identifiant court type S1, S2, Rattrapage...
            </p>
            <input
              placeholder="Nom (ex: S1)"
              className="w-full border-2 border-gray-100 focus:border-emerald-500 p-4 rounded-xl outline-none text-center text-2xl font-bold uppercase"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value.toUpperCase())}
            />
            <div className="flex flex-col gap-2 mt-8">
              <button
                onClick={handleSessionSubmit}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-100"
              >
                Confirmer
              </button>
              <button
                onClick={() => setShowSessionModal(false)}
                className="w-full py-2 text-gray-400 text-sm"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
