"use client";

import { useState } from "react";
import {
  Book,
  GraduationCap,
  UserCheck,
  Plus,
  Layers,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  addCourse,
  addCourseOffering,
  assignTeacher,
} from "@/app/neon/request";
import { useRouter } from "next/navigation";
import { GoArrowRight } from "react-icons/go";

export default function CourseManagementPage({
  filieres,
  academicYears,
  sessions,
  courses,
  offerings,
  teachers,
}: any) {
  // États pour les formulaires
  const [newCourse, setNewCourse] = useState("");
  const [offering, setOffering] = useState({
    course_id: "",
    filiere_id: "",
    year_id: "",
    session_id: "",
    coefficient: 1,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false); // Pour l'état de chargement
  const router = useRouter();
  const handleFullAssignment = async () => {
    // Réinitialiser les messages
    setError(null);
    setSuccess(null);

    if (!assignment.offering_id || !assignment.teacher_id || !assignment.room) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setIsPending(true);
    try {
      const res = await assignTeacher(assignment);

      if (res.success) {
        setSuccess("L'assignation a été enregistrée avec succès !");
        // Optionnel : réinitialiser le formulaire ici
      } else {
        // C'est ici qu'on récupère le message "Conflit détecté..." du serveur
        setError(res.error || "Une erreur inconnue est survenue.");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur.");
    } finally {
      setIsPending(false);
    }
  };
  // État d'assignation enrichi avec l'horaire
  const [assignment, setAssignment] = useState({
    offering_id: "",
    teacher_id: "",
    day_of_week: "lundi",
    start_time: "08:00",
    end_time: "10:00",
    room: "",
  });

  /*const handleFullAssignment = async () => {
    if (!assignment.offering_id || !assignment.teacher_id || !assignment.room) {
      alert("Veuillez remplir tous les champs (Offre, Professeur et Salle)");
      return;
    }

    // Appel de la Server Action qui gère la transaction SQL
    await assignTeacher(assignment);
    alert("Assignation et horaire enregistrés avec succès !");
  };*/

  return (
    <div className=" mx-auto p-2 max-w-6xl md:p-6 space-y-16">
      {/* SECTION 1: CATALOGUE DES COURS */}
      <section className="bg-white rounded-2xl border p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6 border-b pb-4">
          <Book className="text-blue-600" />
          <h2 className="text-xl font-bold">1. Catalogue des Cours</h2>
        </div>
        <div className="flex gap-4">
          <input
            placeholder="Nom du cours (ex: Algèbre)"
            className="flex-1 p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-100"
            value={newCourse}
            onChange={(e) => setNewCourse(e.target.value)}
          />
          <button
            onClick={() => {
              addCourse(newCourse);
              setNewCourse("");
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <Plus size={18} /> Créer le cours
          </button>
        </div>
      </section>

      <button
        onClick={() => {
          router.push("/dashboard/cours/details");
        }}
        className="bg-blue-600 mx-auto text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition"
      >
        <GoArrowRight size={18} /> Voir les horaires et affectation
      </button>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* SECTION 2: COURSE OFFERINGS */}
        <section className="bg-white rounded-2xl border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <Layers className="text-emerald-600" />
            <h2 className="text-xl font-bold">2. Offre Académique</h2>
          </div>
          <div className="space-y-4">
            <select
              className="w-full p-3 border rounded-xl bg-gray-50"
              onChange={(e) =>
                setOffering({ ...offering, course_id: e.target.value })
              }
            >
              <option value="">Sélectionner un cours</option>
              {courses?.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-4">
              <select
                className="p-3 border rounded-xl bg-gray-50"
                onChange={(e) =>
                  setOffering({ ...offering, filiere_id: e.target.value })
                }
              >
                <option value="">Filière</option>
                {filieres?.map((f: any) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Coeff"
                className="p-3 border rounded-xl bg-gray-50"
                onChange={(e) =>
                  setOffering({
                    ...offering,
                    coefficient: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <select
                className="p-3 border rounded-xl bg-gray-50"
                onChange={(e) =>
                  setOffering({ ...offering, year_id: e.target.value })
                }
              >
                <option value="">Année</option>
                {academicYears?.map((y: any) => (
                  <option key={y.id} value={y.id}>
                    {y.name}
                  </option>
                ))}
              </select>
              <select
                className="p-3 border rounded-xl bg-gray-50"
                onChange={(e) =>
                  setOffering({ ...offering, session_id: e.target.value })
                }
              >
                <option value="">Session</option>
                {sessions?.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => addCourseOffering(offering)}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition"
            >
              Programmer le cours
            </button>
          </div>
        </section>

        {/* SECTION 3: ASSIGNATION & PLANNING */}

        <section className="bg-white rounded-2xl border p-6 shadow-sm border-orange-100">
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <UserCheck className="text-orange-600" />
            <h2 className="text-xl font-bold">3. Affectation & Horaire</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <select
                className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-orange-100"
                onChange={(e) =>
                  setAssignment({ ...assignment, offering_id: e.target.value })
                }
              >
                <option value="">--- Sélectionner l'offre de cours ---</option>
                {offerings?.map((o: any) => (
                  <option key={o.id} value={o.id}>
                    {o.course_name} ({o.filiere_name} - {o.session_name})
                  </option>
                ))}
              </select>

              <select
                className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-orange-100"
                onChange={(e) =>
                  setAssignment({ ...assignment, teacher_id: e.target.value })
                }
              >
                <option value="">--- Sélectionner le professeur ---</option>
                {teachers?.map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* BLOC HORAIRE INTERNE */}
            <div className="p-4 bg-orange-50/50 rounded-2xl space-y-4 border border-orange-100">
              <div className="flex items-center gap-2 text-orange-700 font-bold text-sm mb-2">
                <Clock size={16} /> Détails de l'emploi du temps
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
                    Jour
                  </label>
                  <select
                    className="w-full p-2.5 bg-white border rounded-lg outline-none"
                    value={assignment.day_of_week}
                    onChange={(e) =>
                      setAssignment({
                        ...assignment,
                        day_of_week: e.target.value,
                      })
                    }
                  >
                    <option value="lundi">Lundi</option>
                    <option value="mardi">Mardi</option>
                    <option value="mercredi">Mercredi</option>
                    <option value="jeudi">Jeudi</option>
                    <option value="vendredi">Vendredi</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 text-flex items-center gap-1">
                    <MapPin size={10} /> Salle
                  </label>
                  <input
                    placeholder="Ex: Salle 204"
                    className="w-full p-2.5 bg-white border rounded-lg outline-none"
                    value={assignment.room}
                    onChange={(e) =>
                      setAssignment({ ...assignment, room: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
                    Heure Début
                  </label>
                  <input
                    type="time"
                    className="w-full p-2.5 bg-white border rounded-lg outline-none"
                    value={assignment.start_time}
                    onChange={(e) =>
                      setAssignment({
                        ...assignment,
                        start_time: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
                    Heure Fin
                  </label>
                  <input
                    type="time"
                    className="w-full p-2.5 bg-white border rounded-lg outline-none"
                    value={assignment.end_time}
                    onChange={(e) =>
                      setAssignment({ ...assignment, end_time: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* --- AFFICHAGE DES MESSAGES --- */}
              {error && (
                <div className="flex items-center gap-2 p-3 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl animate-shake">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 p-3 text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <CheckCircle2 size={18} />
                  {success}
                </div>
              )}

              <button
                onClick={handleFullAssignment}
                disabled={isPending}
                className={`w-full py-4 rounded-xl font-bold transition-all ${
                  isPending
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-orange-600 text-white shadow-lg hover:bg-orange-700"
                }`}
              >
                {isPending
                  ? "Vérification des conflits..."
                  : "Confirmer l'affectation complète"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
