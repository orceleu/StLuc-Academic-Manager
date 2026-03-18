"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "@/app/firebase/config";
import { useAuth } from "@/app/clientComponents/AuthContext";
import { useRouter } from "next/navigation";

type Cours = {
  id?: string;
  nom: string;
  teacherName: string;
  teacherId: string;
  filiere: string;
  duree: string;
  jour: string;
  active: boolean;
};

type Filiere = {
  id: string;
  nom: string;
};

type Teacher = {
  uid: string;
  name: string;
  filiere: string; // Ajouté pour le filtrage
};

export default function CoursPage() {
  const { role } = useAuth();
  const router = useRouter();

  const [coursList, setCoursList] = useState<Cours[]>([]);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [userFiliere, setUserFiliere] = useState("");

  // États Formulaire
  const [nom, setNom] = useState("");
  const [filiere, setFiliere] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [duree, setDuree] = useState("");
  const [jour, setJour] = useState("");

  // États Filtres
  const [filterFiliere, setFilterFiliere] = useState("");
  const [filterTeacher, setFilterTeacher] = useState("");
  const [filterJour, setFilterJour] = useState("");
  const [filterDuree, setFilterDuree] = useState("");
  const [filterActive, setFilterActive] = useState("");

  const coursRef = collection(db, "cours");
  const filiereRef = collection(db, "filieres");
  const usersRef = collection(db, "users");

  // 1. Récupérer la filière de l'utilisateur connecté
  async function fetchCurrentUserFiliere() {
    const user = auth.currentUser;
    if (!user) return;

    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const laFiliere = data.filiere || "";
      setUserFiliere(laFiliere);

      // Verrouillage automatique si n'est pas directeur
      if (laFiliere !== "directeur" && laFiliere !== "") {
        setFiliere(laFiliere);
        setFilterFiliere(laFiliere);
      }
    }
  }

  async function fetchFilieres() {
    const snap = await getDocs(filiereRef);
    const list: any = [];
    snap.forEach((docu) => {
      list.push({ id: docu.id, ...docu.data() });
    });
    setFilieres(list);
  }

  async function fetchTeachers() {
    const snap = await getDocs(usersRef);
    const list: any = [];
    snap.forEach((docu) => {
      const data = docu.data();
      if (data.role === "teacher") {
        list.push({ uid: docu.id, name: data.name, filiere: data.filiere });
      }
    });
    setTeachers(list);
  }

  async function fetchCours() {
    const snap = await getDocs(coursRef);
    const list: any = [];
    snap.forEach((docu) => {
      list.push({ id: docu.id, ...docu.data() });
    });
    setCoursList(list);
  }

  useEffect(() => {
    const loadData = async () => {
      await fetchCurrentUserFiliere();
      fetchCours();
      fetchFilieres();
      fetchTeachers();
    };
    loadData();
  }, []);

  // 2. Filtrer les professeurs pour le SELECT (uniquement ceux de la filière)
  const availableTeachers = teachers.filter(
    (t) => userFiliere === "directeur" || t.filiere === userFiliere,
  );

  async function addCours() {
    if (!nom || !teacherId || !filiere) {
      alert("Remplir tous les champs");
      return;
    }
    const teacher = teachers.find((t) => t.uid === teacherId);
    await addDoc(coursRef, {
      nom,
      teacherName: teacher?.name || "",
      teacherId,
      filiere,
      duree,
      jour,
      active: true,
    });
    setNom("");
    setTeacherId("");
    if (userFiliere === "directeur") setFiliere("");
    setDuree("");
    setJour("");
    fetchCours();
  }

  async function toggleActive(cours: Cours) {
    await updateDoc(doc(db, "cours", cours.id!), { active: !cours.active });
    fetchCours();
  }

  async function deleteCours(id: string) {
    if (confirm("Supprimer ce cours ?")) {
      await deleteDoc(doc(db, "cours", id));
      fetchCours();
    }
  }

  // 3. Logique de filtrage de la TABLE
  const filteredCours = coursList.filter((c) => {
    const matchesFiliere =
      userFiliere === "directeur"
        ? !filterFiliere || c.filiere === filterFiliere
        : c.filiere === userFiliere;

    return (
      matchesFiliere &&
      (!filterTeacher || c.teacherName === filterTeacher) &&
      (!filterJour || c.jour === filterJour) &&
      (!filterDuree || c.duree.includes(filterDuree)) &&
      (!filterActive || String(c.active) === filterActive)
    );
  });

  if (role !== "admin" && role !== "responsable") {
    return (
      <p className="text-center text-red-600 font-bold p-10">Non autorisé</p>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Gestion des Cours</h1>

      {/* FORMULAIRE AJOUT */}
      <div className="bg-gray-100 p-6 rounded-lg mb-10">
        <h2 className="text-xl mb-4">Ajouter un cours</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input
            placeholder="Nom du cours"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            placeholder="Durée (ex: 2h)"
            value={duree}
            onChange={(e) => setDuree(e.target.value)}
            className="border p-2 rounded"
          />

          <select
            value={jour}
            onChange={(e) => setJour(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">Choisir un jour</option>
            {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"].map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>

          {/* SELECT FILIERE VERROUILLÉ */}
          <select
            value={filiere}
            onChange={(e) => setFiliere(e.target.value)}
            disabled={userFiliere !== "directeur" && userFiliere !== ""}
            className={`border p-2 rounded ${userFiliere !== "directeur" ? "bg-gray-200 cursor-not-allowed" : ""}`}
          >
            <option value="">Choisir filière</option>
            {filieres.map((f) => (
              <option key={f.id} value={f.nom}>
                {f.nom}
              </option>
            ))}
          </select>

          {/* SELECT ENSEIGNANT FILTRÉ */}
          <select
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">
              Choisir enseignant ({availableTeachers.length})
            </option>
            {availableTeachers.map((t) => (
              <option key={t.uid} value={t.uid}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={addCours}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Ajouter
        </button>
      </div>

      {/* SECTION FILTRES */}
      <div className="grid md:grid-cols-5 gap-4 mb-6">
        <select
          value={filterFiliere}
          onChange={(e) => setFilterFiliere(e.target.value)}
          disabled={userFiliere !== "directeur" && userFiliere !== ""}
          className={`border p-2 rounded ${userFiliere !== "directeur" ? "bg-gray-200" : ""}`}
        >
          <option value="">Toutes filières</option>
          {filieres.map((f) => (
            <option key={f.id} value={f.nom}>
              {f.nom}
            </option>
          ))}
        </select>

        <select
          value={filterTeacher}
          onChange={(e) => setFilterTeacher(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Tous enseignants</option>
          {availableTeachers.map((t) => (
            <option key={t.uid} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>

        <select
          value={filterJour}
          onChange={(e) => setFilterJour(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Tous jours</option>
          {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"].map((j) => (
            <option key={j} value={j}>
              {j}
            </option>
          ))}
        </select>

        <input
          placeholder="Filtrer durée"
          value={filterDuree}
          onChange={(e) => setFilterDuree(e.target.value)}
          className="border p-2 rounded"
        />

        <select
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Tous les statuts</option>
          <option value="true">Actif</option>
          <option value="false">Inactif</option>
        </select>
      </div>

      {/* TABLEAU DES RÉSULTATS */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-700 uppercase">
            <tr>
              <th className="px-4 py-3">Cours</th>
              <th className="px-4 py-3">Enseignant</th>
              <th className="px-4 py-3 text-center">Durée</th>
              <th className="px-4 py-3 text-center">Jour</th>
              <th className="px-4 py-3 text-center">Filière</th>
              <th className="px-4 py-3 text-center">Statut</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCours.map((c, index) => (
              <tr
                key={c.id}
                className={`border-b ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
              >
                <td className="px-4 py-3 font-medium">{c.nom}</td>
                <td className="px-4 py-3">{c.teacherName}</td>
                <td className="px-4 py-3 text-center">{c.duree}h</td>
                <td className="px-4 py-3 text-center">{c.jour}</td>
                <td className="px-4 py-3 text-center">{c.filiere}</td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${c.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                  >
                    {c.active ? "Actif" : "Inactif"}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => toggleActive(c)}
                    className="text-blue-600 mr-3 hover:underline"
                  >
                    Statut
                  </button>
                  <button
                    onClick={() => deleteCours(c.id!)}
                    className="text-red-600 hover:underline"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
