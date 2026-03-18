"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { useAuth } from "@/app/clientComponents/AuthContext";

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
};

export default function CoursPage() {
  const { role } = useAuth();

  const [coursList, setCoursList] = useState<Cours[]>([]);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const [filterTeacher, setFilterTeacher] = useState("");
  const [filterJour, setFilterJour] = useState("");
  const [filterDuree, setFilterDuree] = useState("");
  const [filterActive, setFilterActive] = useState("");

  const [nom, setNom] = useState("");
  const [filiere, setFiliere] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [duree, setDuree] = useState("");
  const [jour, setJour] = useState("");
  const [filterFiliere, setFilterFiliere] = useState("");

  const coursRef = collection(db, "cours");
  const filiereRef = collection(db, "filieres");
  const usersRef = collection(db, "users");

  /* ======================== */
  async function fetchFilieres() {
    const snap = await getDocs(filiereRef);
    const list: any = [];

    snap.forEach((docu) => {
      list.push({ id: docu.id, ...docu.data() });
    });

    setFilieres(list);
  }

  /* ======================== */
  async function fetchTeachers() {
    const snap = await getDocs(usersRef);
    const list: any = [];

    snap.forEach((docu) => {
      const data = docu.data();

      if (data.role === "teacher") {
        list.push({
          uid: docu.id,
          name: data.name,
        });
      }
    });

    setTeachers(list);
  }

  /* ======================== */
  async function fetchCours() {
    const snap = await getDocs(coursRef);
    const list: any = [];

    snap.forEach((docu) => {
      list.push({
        id: docu.id,
        ...docu.data(),
      });
    });

    setCoursList(list);
  }

  useEffect(() => {
    fetchCours();
    fetchFilieres();
    fetchTeachers();
  }, []);

  /* ======================== */
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
    setFiliere("");
    setDuree("");
    setJour("");

    fetchCours();
  }

  /* ======================== */
  async function toggleActive(cours: Cours) {
    await updateDoc(doc(db, "cours", cours.id!), {
      active: !cours.active,
    });

    fetchCours();
  }

  /* ======================== */
  async function deleteCours(id: string) {
    await deleteDoc(doc(db, "cours", id));
    fetchCours();
  }

  /* ======================== */
  const filteredCours = coursList.filter((c) => {
    return (
      (!filterFiliere || c.filiere === filterFiliere) &&
      (!filterTeacher || c.teacherName === filterTeacher) &&
      (!filterJour || c.jour === filterJour) &&
      (!filterDuree || c.duree.includes(filterDuree)) &&
      (!filterActive || String(c.active) === filterActive)
    );
  });

  if (role !== "admin") {
    return (
      <p className="text-center text-red-600 font-bold p-10">Non autorisé</p>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Gestion des Cours</h1>

      {/* AJOUT */}
      <div className="bg-gray-100 p-6 rounded-lg mb-10">
        <h2 className="text-xl mb-4">Ajouter un cours</h2>

        <div className="grid md:grid-cols-2 gap-4">
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
            <option value="Lundi">Lundi</option>
            <option value="Mardi">Mardi</option>
            <option value="Mercredi">Mercredi</option>
            <option value="Jeudi">Jeudi</option>
            <option value="Vendredi">Vendredi</option>
          </select>

          <select
            value={filiere}
            onChange={(e) => setFiliere(e.target.value)}
            className="border p-2 rounded"
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
            {teachers.map((t) => (
              <option key={t.uid} value={t.uid}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={addCours}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded"
        >
          Ajouter
        </button>
      </div>

      <div className="grid md:grid-cols-5 gap-4 mb-6">
        {/* FILTRE FILIERE */}
        <select
          value={filterFiliere}
          onChange={(e) => setFilterFiliere(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Toutes filières</option>
          {filieres.map((f) => (
            <option key={f.id} value={f.nom}>
              {f.nom}
            </option>
          ))}
        </select>

        {/* FILTRE ENSEIGNANT */}
        <select
          value={filterTeacher}
          onChange={(e) => setFilterTeacher(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Tous enseignants</option>
          {teachers.map((t) => (
            <option key={t.uid} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>

        {/* FILTRE JOUR */}
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

        {/* FILTRE DUREE */}
        <input
          placeholder="Durée (ex: 2h)"
          value={filterDuree}
          onChange={(e) => setFilterDuree(e.target.value)}
          className="border p-2 rounded"
        />

        {/* FILTRE ACTIF */}
        <select
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Tous</option>
          <option value="true">Actif</option>
          <option value="false">Inactif</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
          {/* HEADER */}
          <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Cours</th>
              <th className="px-4 py-3 text-left">Enseignant</th>
              <th className="px-4 py-3 text-center">Durée</th>
              <th className="px-4 py-3 text-center">Jour</th>
              <th className="px-4 py-3 text-center">Filière</th>
              <th className="px-4 py-3 text-center">Statut</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="text-gray-700 text-sm">
            {filteredCours.map((c, index) => (
              <tr
                key={c.id}
                className={`border-t hover:bg-gray-50 transition ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                {/* NOM */}
                <td className="px-4 py-3 font-medium">{c.nom}</td>

                {/* ENSEIGNANT */}
                <td className="px-4 py-3">{c.teacherName}</td>

                {/* DUREE */}
                <td className="px-4 py-3 text-center">{c.duree}</td>

                {/* JOUR */}
                <td className="px-4 py-3 text-center">{c.jour}</td>

                {/* FILIERE */}
                <td className="px-4 py-3 text-center">{c.filiere}</td>

                {/* STATUT */}
                <td className="px-4 py-3 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      c.active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {c.active ? "Actif" : "Inactif"}
                  </span>
                </td>

                {/* ACTIONS */}
                <td className="px-4 py-3">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => toggleActive(c)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Toggle
                    </button>

                    <button
                      onClick={() => deleteCours(c.id!)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
