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
  filiere: string;
};

export default function CoursPage() {
  const { role } = useAuth();
  const router = useRouter();

  const [coursList, setCoursList] = useState<Cours[]>([]);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [userFiliere, setUserFiliere] = useState("");

  const [nom, setNom] = useState("");
  const [filiere, setFiliere] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [duree, setDuree] = useState("");
  const [jour, setJour] = useState("");

  const [filterFiliere, setFilterFiliere] = useState("");
  const [filterTeacher, setFilterTeacher] = useState("");
  const [filterJour, setFilterJour] = useState("");
  const [filterDuree, setFilterDuree] = useState("");
  const [filterActive, setFilterActive] = useState("");

  const coursRef = collection(db, "cours");
  const filiereRef = collection(db, "filieres");
  const usersRef = collection(db, "users");

  async function fetchCurrentUserFiliere() {
    const user = auth.currentUser;
    if (!user) return;
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const laFiliere = data.filiere || "";
      setUserFiliere(laFiliere);
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

  // ✅ CALCUL DU TOTAL D'HEURES PAR ENSEIGNANT
  const statsParProf = filteredCours.reduce((acc: any, curr) => {
    // Extraire le nombre de la chaîne (ex: "2h" -> 2)
    const heures = parseInt(curr.duree) || 0;
    if (!acc[curr.teacherName]) {
      acc[curr.teacherName] = 0;
    }
    acc[curr.teacherName] += heures;
    return acc;
  }, {});

  if (role !== "admin" && role !== "responsable") {
    return (
      <p className="text-center text-red-600 font-bold p-10">Non autorisé</p>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Gestion des Cours</h1>

      {/* FORMULAIRE AJOUT */}
      <div className="bg-white p-6 shadow-sm border rounded-lg mb-10">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">
          Ajouter un cours
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input
            placeholder="Nom du cours"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            placeholder="Durée (ex: 2h ou 2)"
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
          <select
            value={filiere}
            onChange={(e) => setFiliere(e.target.value)}
            disabled={userFiliere !== "directeur" && userFiliere !== ""}
            className={`border p-2 rounded ${userFiliere !== "directeur" ? "bg-gray-100 cursor-not-allowed" : ""}`}
          >
            <option value="">Choisir filière</option>
            {filieres.map((f) => (
              <option key={f.id} value={f.nom}>
                {f.nom}
              </option>
            ))}
          </select>
          <select
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">Choisir enseignant</option>
            {availableTeachers.map((t) => (
              <option key={t.uid} value={t.uid}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={addCours}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition shadow"
        >
          Ajouter
        </button>
      </div>

      {/* FILTRES */}
      <div className="grid md:grid-cols-5 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
        <select
          value={filterFiliere}
          onChange={(e) => setFilterFiliere(e.target.value)}
          disabled={userFiliere !== "directeur" && userFiliere !== ""}
          className={`border p-2 rounded ${userFiliere !== "directeur" ? "bg-gray-200" : "bg-white"}`}
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
          className="border p-2 rounded bg-white"
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
          className="border p-2 rounded bg-white"
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
          className="border p-2 rounded bg-white"
        />
        <select
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
          className="border p-2 rounded bg-white"
        >
          <option value="">Tous les statuts</option>
          <option value="true">Actif</option>
          <option value="false">Inactif</option>
        </select>
      </div>

      {/* TABLEAU */}
      <div className="overflow-x-auto bg-white shadow-sm border rounded-lg">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 border-b">
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
                className={`border-b hover:bg-blue-50/30 transition ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
              >
                <td className="px-4 py-3 font-medium">{c.nom}</td>
                <td className="px-4 py-3">{c.teacherName}</td>
                <td className="px-4 py-3 text-center font-semibold">
                  {c.duree}h
                </td>
                <td className="px-4 py-3 text-center">{c.jour}</td>
                <td className="px-4 py-3 text-center">{c.filiere}</td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold ${c.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                  >
                    {c.active ? "Actif" : "Inactif"}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => toggleActive(c)}
                    className="text-blue-600 mr-4 hover:text-blue-800 underline"
                  >
                    Statut
                  </button>
                  <button
                    onClick={() => deleteCours(c.id!)}
                    className="text-red-600 hover:text-red-800 underline"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ SECTION CALCUL TOTAL HEURES */}
      <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-300 text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-bold mb-4 border-b border-gray-200 pb-2">
            Récapitulatif des heures
          </h3>
          <div className="space-y-3">
            {Object.keys(statsParProf).length > 0 ? (
              Object.entries(statsParProf).map(([name, total]) => (
                <div
                  key={name}
                  className="flex justify-between items-center bg-blue-800 p-3 rounded-lg"
                >
                  <span className="font-medium">{name}</span>
                  <span className="bg-white text-gray-900 px-3 py-1 rounded-full font-black text-sm">
                    {total as number} Heures/semaine
                  </span>
                </div>
              ))
            ) : (
              <p className="text-blue-300 text-sm italic">
                Aucun cours trouvé pour ces critères.
              </p>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-blue-700 flex justify-between font-black uppercase text-xs tracking-wider">
            <span>Total Général</span>
            <span>
              {
                Object.values(statsParProf).reduce(
                  (a: any, b: any) => a + b,
                  0,
                ) as number
              }{" "}
              H
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
