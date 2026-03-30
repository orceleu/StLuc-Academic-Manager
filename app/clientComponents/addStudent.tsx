"use client";

import { useState } from "react";
import { UserPlus, X, Loader2, BookOpen, Calendar, Layers } from "lucide-react";
import { registerAndEnrollStudent } from "../neon/request";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  filieres: any[];
  academicYears: any[];
  sessions: any[];
}

export default function RegisterStudentModal({
  isOpen,
  onClose,
  filieres,
  academicYears,
  sessions,
}: Props) {
  const [isPending, setIsPending] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    matricule: "",
    filiere_id: "",
    academic_year_id: "",
    session_id: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    const res = await registerAndEnrollStudent(formData);
    if (res.success) {
      onClose();
      setFormData({
        name: "",
        matricule: "",
        filiere_id: "",
        academic_year_id: "",
        session_id: "",
      });
    } else {
      alert(res.error);
    }
    setIsPending(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <UserPlus size={20} /> Inscription & Enrôlement
          </h2>
          <button
            onClick={onClose}
            className="hover:rotate-90 transition-transform"
          >
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Section Étudiant */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">
                Nom de l'étudiant
              </label>
              <input
                required
                className="w-full p-2.5 bg-gray-50 border rounded-lg outline-none focus:border-indigo-500"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">
                Matricule{" "}
                <span className="text-gray-300 font-normal">(Optionnel)</span>
              </label>
              <input
                type="text"
                placeholder="ex: ST-001"
                className="w-full p-2.5 bg-gray-50 border rounded-lg outline-none focus:border-indigo-500"
                value={formData.matricule}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    matricule: e.target.value.toUpperCase(),
                  })
                }
                // Suppression de l'attribut required ici
              />
            </div>
          </div>

          <Separator />

          {/* Section Académique */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                <BookOpen size={12} /> Filière d'étude
              </label>
              <select
                required
                className="w-full p-2.5 bg-white border rounded-lg outline-none focus:ring-2 focus:ring-indigo-100"
                onChange={(e) =>
                  setFormData({ ...formData, filiere_id: e.target.value })
                }
              >
                <option value="">Sélectionner une filière</option>
                {filieres.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                  <Calendar size={12} /> Année Académique
                </label>
                <select
                  required
                  className="w-full p-2.5 bg-white border rounded-lg outline-none"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      academic_year_id: e.target.value,
                    })
                  }
                >
                  <option value="">Choisir l'année</option>
                  {academicYears.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                  <Layers size={12} /> Session
                </label>
                <select
                  required
                  className="w-full p-2.5 bg-white border rounded-lg outline-none"
                  onChange={(e) =>
                    setFormData({ ...formData, session_id: e.target.value })
                  }
                >
                  <option value="">Choisir la session</option>
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            disabled={isPending}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl mt-4 hover:bg-indigo-700 disabled:opacity-50 transition flex justify-center items-center gap-2"
          >
            {isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Confirmer l'inscription"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function Separator() {
  return <div className="h-px bg-gray-100 w-full my-2" />;
}
