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
  getDoc,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/app/firebase/config";
import { useAuth } from "@/app/clientComponents/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Responsable } from "../department/page";

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
  const [responsables, setResponsables] = useState<Responsable[]>([]);
  const [userFiliere, setUserFiliere] = useState("");
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

  /*async function fetchCurrentUserFiliere() {
    const user = auth.currentUser;

    if (!user) return;

    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      setUserFiliere(data.filiere);
    }
  }*/
  async function fetchCurrentUserFiliere() {
    const user = auth.currentUser;
    if (!user) return;

    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      setUserFiliere(data.filiere);

      // ✅ AJOUT : On pré-remplit le champ filiere pour le formulaire d'ajout
      // Si ce n'est pas un directeur, on force la valeur
      if (data.filiere !== "directeur") {
        setFiliere(data.filiere);
      }
    }
  }
  /* ======================== */
  /* async function fetchTeachers() {
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
  }*/
  async function fetchTeachers() {
    const snapshot = await getDocs(usersRef);
    const list: any = [];

    snapshot.forEach((docu) => {
      const data = docu.data();

      if (data.role === "teacher") {
        // ✅ LOGIQUE MODIFIÉE :
        // Si l'utilisateur est "directeur", on ignore le filtre de filière.
        // Sinon, on vérifie que la filière du prof correspond à celle de l'utilisateur.
        const isDirecteur = userFiliere === "directeur";
        const matchesFiliere = data.filiere === userFiliere;

        if (isDirecteur || matchesFiliere) {
          list.push({
            uid: docu.id,
            ...data,
          });
        }
      }
    });

    setTeachers(list);
  }
  useEffect(() => {
    fetchTeachers();
    fetchFilieres();
    fetchResponsables();
    fetchCurrentUserFiliere();
  }, []);
  useEffect(() => {
    if (userFiliere) {
      fetchTeachers();
    }
  }, [userFiliere]);
  /* ======================== */
  async function addTeacher() {
    if (!filiere) {
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

      role: "teacher",
    });

    setName("");
    setEmail("");
    setPassword("");
    setFiliere("");
    setCours("");

    fetchTeachers();
  }

  async function fetchResponsables() {
    const snapshot = await getDocs(usersRef);

    const list: any = [];

    snapshot.forEach((docu) => {
      const data = docu.data();

      if (data.role === "responsable") {
        list.push({
          uid: docu.id,
          ...data,
        });
      }
    });

    setResponsables(list);
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

  if (role !== "admin" && role !== "responsable") {
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

          <select
            value={filiere}
            onChange={(e) => setFiliere(e.target.value)}
            className={`border p-2 rounded ${userFiliere !== "directeur" ? "bg-gray-200 cursor-not-allowed" : ""}`}
            // ✅ VERROUILLAGE : Si l'utilisateur n'est pas directeur, on désactive le choix
            disabled={userFiliere !== "" && userFiliere !== "directeur"}
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
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
          {/* HEADER */}
          <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Nom</th>
              <th className="px-4 py-3 text-left">Cours</th>
              <th className="px-4 py-3 text-center">Filière</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-center">Password</th>
              <th className="px-4 py-3 text-center">Role</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="text-gray-700 text-sm">
            {teachers.map((t, index) => (
              <tr
                key={t.uid}
                className={`border-t hover:bg-gray-50 transition ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                {/* NOM */}
                <td className="px-4 py-3 font-medium">{t.name}</td>

                {/* COURS */}
                <td className="px-4 py-3">
                  <Button
                    className="bg-gray-100"
                    variant="ghost"
                    onClick={() => router.push("/dashboard/cours")}
                  >
                    Gerer les cours
                  </Button>
                </td>

                {/* FILIERE */}
                <td className="px-4 py-3 text-center">{t.filiere}</td>

                {/* EMAIL */}
                <td className="px-4 py-3">{t.email}</td>

                {/* PASSWORD */}
                <td className="px-4 py-3 text-center">
                  <span className="text-gray-400">{t.password}</span>
                </td>

                {/* ROLE */}
                <td className="px-4 py-3 text-center">
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {t.role}
                  </span>
                </td>

                {/* ACTIONS */}
                <td className="px-4 py-3">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => setEditData(t)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Modifier
                    </button>

                    <button
                      onClick={() => setDeleteData(t)}
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
