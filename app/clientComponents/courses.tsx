"use client";

import { useState, useEffect } from "react";
import {
  Book,
  UserCheck,
  Plus,
  Layers,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  addCourse,
  addCourseOffering,
  assignTeacher,
} from "@/app/neon/request";
import { useRouter } from "next/navigation";
import { GoArrowRight } from "react-icons/go";
import { Button } from "@/components/ui/button";
import { MdArrowBackIos } from "react-icons/md";
import { useAuth } from "@/app/clientComponents/AuthContext";

export default function CourseManagementPage({
  filieres,
  academicYears,
  sessions,
  courses,
  offerings,
  teachers,
}: any) {
  const { role, filiereName } = useAuth();
  const router = useRouter();

  // États pour les formulaires et feedbacks
  const [newCourse, setNewCourse] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // États de chargement distincts par action
  const [isCoursePending, setIsCoursePending] = useState(false);
  const [isOfferingPending, setIsOfferingPending] = useState(false);
  const [isAssignmentPending, setIsAssignmentPending] = useState(false);

  const [offering, setOffering] = useState({
    course_id: "",
    filiere_id: "",
    year_id: "",
    session_id: "",
    coefficient: 100,
    year_level: 1,
  });

  const [assignment, setAssignment] = useState({
    offering_id: "",
    teacher_id: "",
    day_of_week: "lundi",
    start_time: "08:00",
    end_time: "10:00",
    room: "",
  });

  // --- AUTOMATION & VERROUILLAGE RESPONSABLE ---

  // Si l'utilisateur est responsable, on pré-sélectionne et force sa filière dans l'état
  useEffect(() => {
    if (role === "responsable" && filiereName) {
      const userFiliere = filieres?.find(
        (f: any) =>
          f.name?.toLowerCase() === filiereName.toLowerCase() ||
          f.filiere_name?.toLowerCase() === filiereName.toLowerCase(),
      );
      if (userFiliere) {
        setOffering((prev) => ({ ...prev, filiere_id: userFiliere.id }));
      }
    }
  }, [role, filiereName, filieres]);

  // Trouver la filière actuellement sélectionnée pour connaître sa durée dynamique
  const selectedFiliere = filieres?.find(
    (f: any) => f.id === offering.filiere_id,
  );
  const maxYears =
    selectedFiliere?.duration || selectedFiliere?.duration_years || 4;

  // Filtrer la liste des "offerings" affichée dans la Section 3 si responsable
  const displayedOfferings = offerings?.filter((o: any) => {
    if (role === "responsable" && filiereName) {
      return o.filiere_name?.toLowerCase() === filiereName.toLowerCase();
    }
    return true;
  });

  // --- ACTIONS SOUUMISSIONS ---

  // 1. Créer un cours dans le catalogue général
  const handleCreateCourse = async () => {
    if (!newCourse.trim()) {
      alert("Le nom du cours ne peut pas être vide.");
      return;
    }
    setIsCoursePending(true);
    try {
      await addCourse(newCourse);
      setNewCourse("");
      setSuccess("Cours ajouté au catalogue avec succès !");
      router.refresh();
    } catch (err) {
      setError("Erreur lors de la création du cours.");
    } finally {
      setIsCoursePending(false);
    }
  };

  // 2. Programmer un cours (Offre Académique)
  const handleCreateOffering = async () => {
    if (
      !offering.course_id ||
      !offering.filiere_id ||
      !offering.year_id ||
      !offering.session_id
    ) {
      setError("Veuillez remplir tous les champs de l'offre académique.");
      return;
    }
    setIsOfferingPending(true);
    setError(null);
    setSuccess(null);
    try {
      await addCourseOffering(offering);
      setSuccess("Le cours a été programmé avec succès dans l'offre !");
      router.refresh();
    } catch (err) {
      setError("Erreur lors de la programmation du cours.");
    } finally {
      setIsOfferingPending(false);
    }
  };

  // 3. Affectation d'un enseignant et d'un horaire
  const handleFullAssignment = async () => {
    setError(null);
    setSuccess(null);

    if (
      !assignment.offering_id ||
      !assignment.teacher_id ||
      !assignment.room.trim()
    ) {
      setError(
        "Veuillez remplir tous les champs obligatoires pour l'affectation.",
      );
      return;
    }

    setIsAssignmentPending(true);
    try {
      const res = await assignTeacher(assignment);
      if (res.success) {
        setSuccess(
          "L'assignation et l'horaire ont été enregistrés avec succès !",
        );
        router.refresh();
      } else {
        setError(res.error || "Une erreur inconnue est survenue.");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur.");
    } finally {
      setIsAssignmentPending(false);
    }
  };

  return (
    <div className="mx-auto p-2 max-w-6xl md:p-6 space-y-16">
      <Button
        onClick={() => router.back()}
        variant="outline"
        className="my-2 mx-2 md:my-6"
      >
        <MdArrowBackIos />
      </Button>

      <div className="text-center my-2 md:my-6">
        <p className="text-2xl font-semibold underline">Section Cours</p>
        <p className="text-xs text-gray-500 mt-1">
          {role === "responsable"
            ? `Mode Responsable — Filière : ${filiereName}`
            : "Mode Administrateur"}
        </p>
      </div>

      {/* GLOBAL FEEDBACK MESSAGES */}
      {(error || success) && (
        <div className="space-y-2 max-w-xl mx-auto">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl">
              <AlertCircle size={18} /> {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-3 text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl">
              <CheckCircle2 size={18} /> {success}
            </div>
          )}
        </div>
      )}

      {/* SECTION 1: CATALOGUE DES COURS */}
      <section className="bg-white rounded-2xl border p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6 border-b pb-4">
          <Book className="text-blue-600" />
          <h2 className="text-xl font-bold">1. Catalogue des Cours</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            placeholder="Nom du cours (ex: Algèbre)"
            className="flex-1 p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-100"
            value={newCourse}
            onChange={(e) => setNewCourse(e.target.value)}
            disabled={isCoursePending}
          />
          <button
            onClick={handleCreateCourse}
            disabled={isCoursePending}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isCoursePending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Plus size={18} />
            )}
            Créer le cours
          </button>
        </div>
      </section>

      <div className="flex justify-center">
        <button
          onClick={() => router.push("/dashboard/cours/details")}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition"
        >
          Voir les horaires et affectations <GoArrowRight size={18} />
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* SECTION 2: COURSE OFFERINGS */}
        <section className="bg-white rounded-2xl border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <Layers className="text-emerald-600" />
            <h2 className="text-xl font-bold">2. Offre Académique</h2>
          </div>
          <div className="space-y-4">
            <select
              className="w-full p-3 border rounded-xl bg-gray-50 text-sm"
              value={offering.course_id}
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
              {/* Select Filière verrouillé si Responsable */}
              <select
                className="p-3 border rounded-xl bg-gray-50 text-sm disabled:bg-gray-100 disabled:text-gray-500 font-medium"
                value={offering.filiere_id}
                disabled={role === "responsable"}
                onChange={(e) =>
                  setOffering({
                    ...offering,
                    filiere_id: e.target.value,
                    year_level: 1,
                  })
                }
              >
                <option value="">Filière</option>
                {filieres?.map((f: any) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>

              {/* Sélecteur dynamique de niveau */}
              <select
                className="p-3 border rounded-xl bg-gray-50 text-sm disabled:opacity-50"
                disabled={!offering.filiere_id}
                value={offering.year_level}
                onChange={(e) =>
                  setOffering({
                    ...offering,
                    year_level: Number(e.target.value),
                  })
                }
              >
                {!offering.filiere_id ? (
                  <option value="">Niveau (Choisir filière)</option>
                ) : (
                  Array.from({ length: maxYears }, (_, i) => i + 1).map(
                    (year) => (
                      <option key={year} value={year}>
                        {year === 1 ? "1ère Année" : `${year}ème Année`}
                      </option>
                    ),
                  )
                )}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <select
                className="p-3 border rounded-xl bg-gray-50 text-sm"
                value={offering.year_id}
                onChange={(e) =>
                  setOffering({ ...offering, year_id: e.target.value })
                }
              >
                <option value="">Année Académique</option>
                {academicYears?.map((y: any) => (
                  <option key={y.id} value={y.id}>
                    {y.name}
                  </option>
                ))}
              </select>
              <select
                className="p-3 border rounded-xl bg-gray-50 text-sm"
                value={offering.session_id}
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
              <input
                type="number"
                placeholder="Coeff"
                min="50"
                className="p-3 border rounded-xl bg-gray-50 text-sm text-center"
                value={offering.coefficient}
                onChange={(e) =>
                  setOffering({
                    ...offering,
                    coefficient: Number(e.target.value),
                  })
                }
              />
            </div>

            <button
              onClick={handleCreateOffering}
              disabled={isOfferingPending}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition disabled:opacity-50 shadow-md shadow-emerald-50"
            >
              {isOfferingPending && (
                <Loader2 size={16} className="animate-spin" />
              )}
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
              {/* Liste filtrée selon le périmètre du responsable */}
              <select
                className="w-full p-3 border rounded-xl bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-orange-100"
                value={assignment.offering_id}
                onChange={(e) =>
                  setAssignment({ ...assignment, offering_id: e.target.value })
                }
              >
                <option value="">--- Sélectionner l'offre de cours ---</option>
                {displayedOfferings?.map((o: any) => (
                  <option key={o.id} value={o.id}>
                    {o.course_name} ({o.filiere_name} -{" "}
                    {o.year_level_name || `${o.year_level}e Année`} -{" "}
                    {o.session_name})
                  </option>
                ))}
              </select>

              <select
                className="w-full p-3 border rounded-xl bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-orange-100"
                value={assignment.teacher_id}
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
            <div className="p-4 bg-orange-50/40 rounded-2xl space-y-4 border border-orange-100/70">
              <div className="flex items-center gap-2 text-orange-700 font-bold text-xs mb-2">
                <Clock size={14} /> Détails de l'emploi du temps
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
                    Jour
                  </label>
                  <select
                    className="w-full p-2.5 bg-white border rounded-lg text-sm outline-none"
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
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 flex items-center gap-1">
                    <MapPin size={10} /> Salle
                  </label>
                  <input
                    placeholder="Ex: Salle 204"
                    className="w-full p-2.5 bg-white border rounded-lg text-sm outline-none"
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
                    className="w-full p-2.5 bg-white border rounded-lg text-sm outline-none"
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
                    className="w-full p-2.5 bg-white border rounded-lg text-sm outline-none"
                    value={assignment.end_time}
                    onChange={(e) =>
                      setAssignment({ ...assignment, end_time: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleFullAssignment}
              disabled={isAssignmentPending}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                isAssignmentPending
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-orange-600 text-white shadow-lg shadow-orange-50 hover:bg-orange-700"
              }`}
            >
              {isAssignmentPending && (
                <Loader2 size={16} className="animate-spin" />
              )}
              {isAssignmentPending
                ? "Vérification des conflits..."
                : "Confirmer l'affectation complète"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
