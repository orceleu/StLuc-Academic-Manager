"use client";

import { useEffect, useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/app/firebase/config";
import { useAuth } from "@/app/clientComponents/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  deleteTeacherDb,
  getTeachers,
  getUserRoleAndFiliere,
  saveTeacher,
  updateTeacherData,
} from "@/app/neon/request";
export type Teacher = {
  uid: string;

  name: string;

  email: string;

  phone: string;

  password: string;

  filiere: string;

  cours: string;

  role: string;
};
export default function TeacherPage() {
  const { role, user } = useAuth();
  const router = useRouter();

  const [teachers, setTeachers] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [userFiliere, setUserFiliere] = useState("");

  const [editData, setEditData] = useState<any>(null);
  const [deleteData, setDeleteData] = useState<any>(null);

  // Charger les données initiales
  useEffect(() => {
    async function init() {
      if (user) {
        const profile = await getUserRoleAndFiliere(user.uid);
        if (profile) setUserFiliere(profile.filiere || "admin");
      }
    }
    init();
  }, [user]);

  useEffect(() => {
    refreshTeachers();
  }, [userFiliere]);

  async function refreshTeachers() {
    const data = await getTeachers(userFiliere);
    setTeachers(data);
  }

  /* ======================== */
  async function handleAddTeacher() {
    if (!name || !email || !password)
      return alert("Remplir les champs obligatoires");

    try {
      // 1. Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // 2. Neon DB
      await saveTeacher({
        uid: cred.user.uid,
        name,
        email,
        phone,
        password,
      });

      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      refreshTeachers();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleUpdate() {
    await updateTeacherData(editData.id, editData.name, editData.phone);
    setEditData(null);
    refreshTeachers();
  }

  async function handleDelete(uid: string) {
    await deleteTeacherDb(uid);
    setDeleteData(null);
    refreshTeachers();
  }

  if (role !== "admin" && role !== "responsable") {
    return (
      <p className="text-center text-red-600 font-bold p-10">Non autorisé</p>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Gestion des Enseignants</h1>

      {/* FORMULAIRE D'AJOUT */}
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
            placeholder="Telephone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <button
          onClick={handleAddTeacher}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded"
        >
          Ajouter
        </button>
      </div>

      {/* TABLEAU */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Nom</th>
              <th className="px-4 py-3 text-left">Cours</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Mot de passe</th>
              <th className="px-4 py-3 text-left">Telephone</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm">
            {teachers.map((t, index) => (
              <tr
                key={t.id}
                className={`border-t hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
              >
                <td className="px-4 py-3 font-medium">{t.name}</td>
                <td className="px-4 py-3">
                  <Button
                    className="bg-gray-100"
                    variant="ghost"
                    onClick={() => router.push("/dashboard/cours")}
                  >
                    Gerer les cours
                  </Button>
                </td>
                <td className="px-4 py-3">{t.email}</td>
                <td className="px-4 py-3">{t.password}</td>
                <td className="px-4 py-3">{t.phone}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => setEditData(t)}
                      className="text-blue-600 hover:underline"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => setDeleteData(t)}
                      className="text-red-600 hover:underline"
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

      {/* MODAL EDIT */}
      {editData && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Modifier Enseignant</h2>
            <input
              value={editData.name}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
              className="border p-2 w-full mb-3 rounded"
              placeholder="Nom"
            />
            <input
              value={editData.phone}
              onChange={(e) =>
                setEditData({ ...editData, phone: e.target.value })
              }
              className="border p-2 w-full mb-4 rounded"
              placeholder="Téléphone"
            />
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                className="bg-green-600 text-white px-4 py-2 rounded flex-1"
              >
                Sauvegarder
              </button>
              <button
                onClick={() => setEditData(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded flex-1"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DELETE */}
      {deleteData && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-xl text-center">
            <h2 className="text-xl font-bold mb-2">Supprimer ?</h2>
            <p className="mb-6 text-gray-600">{deleteData.name}</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleDelete(deleteData.id)}
                className="bg-red-600 text-white px-4 py-2 rounded flex-1"
              >
                Supprimer
              </button>
              <button
                onClick={() => setDeleteData(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded flex-1"
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
