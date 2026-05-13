"use client";

import { useState } from "react";
import {
  UserPlus,
  X,
  Loader2,
  BookOpen,
  Calendar,
  Layers,
  User,
} from "lucide-react";
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
    nom: "",
    prenom: "",
    sexe: "M", // Valeur par défaut
    matricule: "",
    filiere_id: "",
    academic_year_id: "",
    session_id: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    // On concatène le nom et le prénom pour l'API si nécessaire,
    // ou on envoie l'objet tel quel selon votre backend
    const payload = {
      ...formData,
      name: `${formData.nom} ${formData.prenom}`.trim(),
    };

    const res = await registerAndEnrollStudent(payload);
    if (res.success) {
      onClose();
      setFormData({
        nom: "",
        prenom: "",
        sexe: "M",
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
          {/* Section Identité */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">
                  Nom
                </label>
                <input
                  required
                  placeholder="Ex: Luma"
                  className="w-full p-2.5 bg-gray-50 border rounded-lg outline-none focus:border-indigo-500"
                  value={formData.nom}
                  onChange={(e) =>
                    setFormData({ ...formData, nom: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">
                  Prénom
                </label>
                <input
                  required
                  placeholder="Ex: Jean"
                  className="w-full p-2.5 bg-gray-50 border rounded-lg outline-none focus:border-indigo-500"
                  value={formData.prenom}
                  onChange={(e) =>
                    setFormData({ ...formData, prenom: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase">
                  Sexe
                </label>
                <div className="flex gap-4 p-1 bg-gray-50 border rounded-lg">
                  <label className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 cursor-pointer rounded-md has-[:checked]:bg-white has-[:checked]:text-indigo-600 has-[:checked]:shadow-sm transition-all text-sm font-medium text-gray-500">
                    <input
                      type="radio"
                      name="sexe"
                      value="M"
                      className="hidden"
                      checked={formData.sexe === "M"}
                      onChange={(e) =>
                        setFormData({ ...formData, sexe: e.target.value })
                      }
                    />
                    Masculin
                  </label>
                  <label className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 cursor-pointer rounded-md has-[:checked]:bg-white has-[:checked]:text-indigo-600 has-[:checked]:shadow-sm transition-all text-sm font-medium text-gray-500">
                    <input
                      type="radio"
                      name="sexe"
                      value="F"
                      className="hidden"
                      checked={formData.sexe === "F"}
                      onChange={(e) =>
                        setFormData({ ...formData, sexe: e.target.value })
                      }
                    />
                    Féminin
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">
                  Matricule{" "}
                  <span className="text-gray-300 font-normal">(Optionnel)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: ST-001"
                  className="w-full p-2.5 bg-gray-50 border rounded-lg outline-none focus:border-indigo-500"
                  value={formData.matricule}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      matricule: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>
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
                value={formData.filiere_id}
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
                  value={formData.academic_year_id}
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
                  value={formData.session_id}
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
