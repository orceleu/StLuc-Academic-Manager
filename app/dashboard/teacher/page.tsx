"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/app/firebase/config";
import { useAuth } from "@/app/clientComponents/AuthContext";
import { useRouter } from "next/navigation";

export type Teacher = {
  uid: string;
  name: string;
  email: string;
  password: string;
  filiere: string;
  cours: string;
  role: string;
};

type Filiere = {
  id?: string;
  nom: string;
  type: string;
};

export default function TeacherPage() {
  const { role } = useAuth();

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filieres, setFilieres] = useState<Filiere[]>([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [filiere, setFiliere] = useState("");
  const [cours, setCours] = useState("");

  const [editData, setEditData] = useState<any>(null);
  const [deleteData, setDeleteData] = useState<any>(null);

  const usersRef = collection(db, "users");
  const filiereRef = collection(db, "filieres");
  const router = useRouter();
  /* ======================== */
  async function fetchFilieres() {
    const snapshot = await getDocs(filiereRef);
    const list: any = [];

    snapshot.forEach((docu) => {
      list.push({
        id: docu.id,
        ...docu.data(),
      });
    });

    setFilieres(list);
  }

  /* ======================== */
  async function fetchTeachers() {
    const snapshot = await getDocs(usersRef);
    const list: any = [];

    snapshot.forEach((docu) => {
      const data = docu.data();

      if (data.role === "teacher") {
        list.push({
          uid: docu.id,
          ...data,
        });
      }
    });

    setTeachers(list);
  }

  useEffect(() => {
    fetchTeachers();
    fetchFilieres();
  }, []);

  /* ======================== */
  async function addTeacher() {
    if (!filiere || !cours) {
      alert("Remplir tous les champs");
      return;
    }

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    await setDoc(doc(db, "users", uid), {
      uid,
      name,
      email,
      password,
      filiere,
      cours,
      role: "teacher",
    });

    setName("");
    setEmail("");
    setPassword("");
    setFiliere("");
    setCours("");

    fetchTeachers();
  }

  /* ======================== */
  async function updateTeacher() {
    await updateDoc(doc(db, "users", editData.uid), {
      name: editData.name,
      filiere: editData.filiere,
      cours: editData.cours,
    });

    setEditData(null);
    fetchTeachers();
  }

  /* ======================== */
  async function deleteTeacher(uid: string) {
    await deleteDoc(doc(db, "users", uid));
    fetchTeachers();
  }

  if (role !== "admin") {
    setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
    return (
      <p className="text-center text-red-600 font-bold p-10">Non autorisé</p>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Gestion des Enseignants</h1>

      {/* AJOUT */}
      <div className="bg-gray-100 p-6 rounded-lg mb-10">
        <h2 className="text-xl font-semibold mb-4">Ajouter Enseignant</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            placeholder="Nom complet"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded"
          />

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded"
          />

          <input
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded"
          />

          <input
            placeholder="Cours (ex: Math, Physique)"
            value={cours}
            onChange={(e) => setCours(e.target.value)}
            className="border p-2 rounded"
          />

          <select
            value={filiere}
            onChange={(e) => setFiliere(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">Choisir filière</option>

            {filieres.map((f) => (
              <option key={f.id} value={f.nom}>
                {f.nom} ({f.type})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={addTeacher}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded"
        >
          Ajouter
        </button>
      </div>

      {/* TABLE */}
      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2">Nom</th>
            <th>Cours</th>
            <th>Filière</th>
            <th>Email</th>
            <th>Password</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {teachers.map((t) => (
            <tr key={t.uid} className="border-t">
              <td className="p-2">{t.name}</td>
              <td>{t.cours}</td>
              <td>{t.filiere}</td>
              <td>{t.email}</td>
              <td>{t.password}</td>
              <td>{t.role}</td>

              <td className="flex gap-3">
                <button
                  onClick={() => setEditData(t)}
                  className="text-blue-600"
                >
                  Modifier
                </button>

                <button
                  onClick={() => setDeleteData(t)}
                  className="text-red-600"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL EDIT */}
      {editData && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl mb-4">Modifier</h2>

            <input
              value={editData.name}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
              className="border p-2 w-full mb-2"
            />

            <input
              value={editData.cours}
              onChange={(e) =>
                setEditData({ ...editData, cours: e.target.value })
              }
              className="border p-2 w-full mb-2"
            />

            <select
              value={editData.filiere}
              onChange={(e) =>
                setEditData({ ...editData, filiere: e.target.value })
              }
              className="border p-2 w-full"
            >
              {filieres.map((f) => (
                <option key={f.id} value={f.nom}>
                  {f.nom}
                </option>
              ))}
            </select>

            <div className="flex gap-3 mt-4">
              <button
                onClick={updateTeacher}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Sauvegarder
              </button>

              <button
                onClick={() => setEditData(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE */}
      {deleteData && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl mb-4">Supprimer ?</h2>

            <p>{deleteData.name}</p>

            <div className="flex gap-3 mt-4">
              <button
                onClick={async () => {
                  await deleteTeacher(deleteData.uid);
                  setDeleteData(null);
                }}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Supprimer
              </button>

              <button
                onClick={() => setDeleteData(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
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
