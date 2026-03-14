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

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth, db } from "@/app/firebase/config";
import { useRouter } from "next/navigation";

type Responsable = {
  id?: string;
  name: string;
  email: string;
  password: string;
  filiere: string;
  role: string;
};

export default function FilierePage() {
  const [responsables, setResponsables] = useState<Responsable[]>([]);
  const [deleteData, setDeleteData] = useState<any>(null);

  const [filiere, setFiliere] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("responsable");
  const router = useRouter();
  const [editData, setEditData] = useState<any>(null);

  const usersRef = collection(db, "users");

  async function fetchResponsables() {
    const snapshot = await getDocs(usersRef);

    const list: any = [];

    snapshot.forEach((docu) => {
      const data = docu.data();

      if (data.role === "responsable") {
        list.push({
          id: docu.id,
          ...data,
        });
      }
    });

    setResponsables(list);
  }

  useEffect(() => {
    fetchResponsables();
  }, []);

  // ajouter responsable
  async function addResponsable() {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    const uid = cred.user.uid;

    /* await addDoc(usersRef, {
      uid,
      name,
      email,
      password,
      filiere,
      role,
    });*/
    await setDoc(doc(db, "users", email), {
      uid,
      name,
      email,
      password,
      filiere,
      role,
    });

    setFiliere("");
    setName("");
    setEmail("");
    setPassword("");

    fetchResponsables();
  }

  // supprimer
  async function deleteResponsable(id: string) {
    await deleteDoc(doc(db, "users", id));

    fetchResponsables();
  }

  // modifier
  async function updateResponsable() {
    await updateDoc(doc(db, "users", editData.id), {
      name: editData.name,
      email: editData.email,
      password: editData.password,
      filiere: editData.filiere,
      role: editData.role,
    });

    setEditData(null);

    fetchResponsables();
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Gestion des Filières</h1>

      {/* FORMULAIRE */}

      <div className="bg-gray-100 p-6 rounded-lg mb-10">
        <h2 className="text-xl font-semibold mb-4">Ajouter Responsable</h2>
        <p>
          Les responsables pourront se connecter avec leur email et leur mot de
          passe. (Des restrictions d’accès sont appliquées selon le rôle de
          chaque utilisateur).{" "}
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <input
            placeholder="Filière"
            value={filiere}
            onChange={(e) => setFiliere(e.target.value)}
            className="border p-2 rounded"
          />

          <input
            placeholder="Nom prénom"
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
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border p-2 rounded bg-gray-200"
            disabled
          >
            <option value="admin">admin</option>
            <option value="responsable">responsable</option>
            <option value="student">student</option>
          </select>
        </div>

        <button
          onClick={addResponsable}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded"
        >
          Ajouter
        </button>
      </div>

      {/* TABLE */}

      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2">Filière</th>
            <th>Nom</th>
            <th>Email</th>
            <th>Password</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {responsables.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="p-2">{r.filiere}</td>
              <td>{r.name}</td>
              <td>{r.email}</td>
              <td>{r.password}</td>
              <td>{r.role}</td>

              <td className="flex gap-3">
                <button
                  onClick={() => setEditData(r)}
                  className="text-blue-600"
                >
                  Modifier
                </button>

                <button
                  onClick={() => setDeleteData(r)}
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
            <h2 className="text-xl font-semibold mb-4">Modifier</h2>

            <div className="space-y-3">
              <input
                value={editData.filiere}
                onChange={(e) =>
                  setEditData({ ...editData, filiere: e.target.value })
                }
                className="border p-2 w-full"
              />

              <input
                value={editData.name}
                onChange={(e) =>
                  setEditData({ ...editData, name: e.target.value })
                }
                className="border p-2 w-full"
              />

              <input
                value={editData.email}
                disabled
                onChange={(e) =>
                  setEditData({ ...editData, email: e.target.value })
                }
                className="border p-2 w-full bg-gray-100"
              />

              <input
                value={editData.password}
                disabled
                onChange={(e) =>
                  setEditData({ ...editData, password: e.target.value })
                }
                className="border p-2 w-full bg-gray-100"
              />

              <select
                value={editData.role}
                onChange={(e) =>
                  setEditData({ ...editData, role: e.target.value })
                }
                className="border p-2 w-full"
              >
                <option value="admin">admin</option>
                <option value="responsable">responsable</option>
                <option value="student">student</option>
              </select>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={updateResponsable}
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
      {deleteData && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-3">
              Confirmer la suppression
            </h2>

            <p className="text-gray-600 mb-4">
              Voulez-vous vraiment supprimer
              <span className="font-semibold"> {deleteData.name}</span> ?
            </p>

            <div className="flex gap-3">
              <button
                onClick={async () => {
                  await deleteDoc(doc(db, "users", deleteData.id));

                  setDeleteData(null);

                  fetchResponsables();
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
