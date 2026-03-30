"use client";

import { useState } from "react";
import { addAcademicYear, addSession } from "../neon/request";

export default function SetupPage() {
  // États pour les modales
  const [showYearModal, setShowYearModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);

  // États pour les formulaires
  const [yearName, setYearName] = useState(""); // ex: 2025-2026
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sessionName, setSessionName] = useState(""); // ex: S1, S2

  // Handlers
  const handleYearSubmit = async () => {
    const res = await addAcademicYear(yearName, startDate, endDate);
    if (res.success) {
      setShowYearModal(false);
      setYearName("");
      setStartDate("");
      setEndDate("");
    } else alert(res.error);
  };

  const handleSessionSubmit = async () => {
    const res = await addSession(sessionName);
    if (res.success) {
      setShowSessionModal(false);
      setSessionName("");
    } else alert(res.error);
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Configuration du Système</h1>

      <div className="flex gap-4">
        <button
          onClick={() => setShowYearModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          + Année Académique
        </button>

        <button
          onClick={() => setShowSessionModal(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
        >
          + Nouvelle Session (S1, S2...)
        </button>
      </div>

      {/* --- MODALE ANNÉE ACADÉMIQUE --- */}
      {showYearModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4">
              Ajouter une Année Académique
            </h2>
            <div className="space-y-4">
              <input
                placeholder="Nom (ex: 2025-2026)"
                className="w-full border p-2 rounded"
                onChange={(e) => setYearName(e.target.value)}
              />
              <div>
                <label className="text-sm text-gray-500">Date de début</label>
                <input
                  type="date"
                  className="w-full border p-2 rounded"
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-gray-500">Date de fin</label>
                <input
                  type="date"
                  className="w-full border p-2 rounded"
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowYearModal(false)}
                className="text-gray-500"
              >
                Annuler
              </button>
              <button
                onClick={handleYearSubmit}
                className="bg-indigo-600 text-white px-4 py-2 rounded"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODALE SESSION --- */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Ajouter une Session</h2>
            <input
              placeholder="Nom de la session (ex: S1)"
              className="w-full border p-2 rounded mb-4"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSessionModal(false)}
                className="text-gray-500"
              >
                Annuler
              </button>
              <button
                onClick={handleSessionSubmit}
                className="bg-emerald-600 text-white px-4 py-2 rounded"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
