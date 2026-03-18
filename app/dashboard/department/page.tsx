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
import { Router } from "lucide-react";
import { useRouter } from "next/navigation";

export type Responsable = {
  uid: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  filiere: string;
  role: string;
};

export type Filiere = {
  id?: string;
  nom: string;
  type: string;
};

export default function FilierePage() {
  const [responsables, setResponsables] = useState<Responsable[]>([]);
  const [filieres, setFilieres] = useState<Filiere[]>([]);

  const [deleteData, setDeleteData] = useState<any>(null);
  const [editData, setEditData] = useState<any>(null);

  const [filiere, setFiliere] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [password, setPassword] = useState("");
  const router = useRouter();
  const { role } = useAuth();

  const [filiereNom, setFiliereNom] = useState("");
  const [filiereType, setFiliereType] = useState("technique");

  const usersRef = collection(db, "users");
  const filiereRef = collection(db, "filieres");

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

  useEffect(() => {
    fetchResponsables();
    fetchFilieres();
  }, []);

  /* ======================== */
  async function addFiliere() {
    if (!filiereNom) return;

    await addDoc(filiereRef, {
      nom: filiereNom,
      type: filiereType,
    });

    setFiliereNom("");
    setFiliereType("technique");

    fetchFilieres();
  }

  /* ======================== */
  async function addResponsable() {
    if (!filiere) {
      alert("Choisissez une filière");
      return;
    }

    const exist = responsables.find((r) => r.filiere === filiere);

    if (exist) {
      alert("Cette filière possède déjà un responsable");
      return;
    }

    const cred = await createUserWithEmailAndPassword(auth, email, password);

    const uid = cred.user.uid;

    await setDoc(doc(db, "users", uid), {
      uid,
      name,
      email,
      phone,
      password,
      filiere,
      role: "responsable", // ✅ FIX
    });

    setFiliere("");
    setName("");
    setEmail("");
    setPhone("");

    setPassword("");

    fetchResponsables();
  }

  /* ======================== */
  async function updateResponsable() {
    await updateDoc(doc(db, "users", editData.uid), {
      name: editData.name,
      filiere: editData.filiere,
      phone: editData.phone,
    });

    setEditData(null);

    fetchResponsables();
  }

  /* ======================== */
  async function deleteResponsable(uid: string) {
    await deleteDoc(doc(db, "users", uid));

    fetchResponsables();
  }

  if (role !== "admin") {
    setTimeout(() => {
      router.push("/dashboard");
    }, 2000);

    return (
      <p className="text-center font-bold text-red-600 p-25">Non autorisé</p>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Gestion des Filières</h1>
      {/* AJOUT FILIERE */}
      <div className="bg-gray-100 p-6 rounded-lg mb-10">
        <h2 className="text-xl font-semibold mb-4">Ajouter Filière</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            placeholder="Nom de la filière"
            value={filiereNom}
            onChange={(e) => setFiliereNom(e.target.value)}
            className="border p-2 rounded"
          />

          <select
            value={filiereType}
            onChange={(e) => setFiliereType(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="technique">Technique</option>
            <option value="universite">Université</option>
          </select>
        </div>

        <button
          onClick={addFiliere}
          className="mt-4 bg-green-600 text-white px-6 py-2 rounded"
        >
          Ajouter Filière
        </button>
      </div>
      {/* AJOUT RESPONSABLE */}
      <div className="bg-gray-100 p-6 rounded-lg mb-10">
        <h2 className="text-xl font-semibold mb-4">Ajouter Responsable</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <select
            value={filiere}
            onChange={(e) => setFiliere(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">Choisir une filière</option>

            {filieres.map((f) => (
              <option key={f.id} value={f.nom}>
                {f.nom} ({f.type})
              </option>
            ))}
          </select>

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
            placeholder="Phone"
            value={phone}
            type="number"
            maxLength={8}
            onChange={(e) => setPhone(e.target.value)}
            className="border p-2 rounded"
          />

          <input
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded"
          />
        </div>

        <button
          onClick={addResponsable}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded"
        >
          Ajouter Responsable
        </button>
      </div>
      {/* TABLE */}
      <p className="mb-3">
        <span className="font-bold text-gray-500">Nombre :</span>
        <span className="text-green-500 ml-2">{responsables.length}</span>
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
          {/* HEADER */}
          <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
            <tr>
              <th className="px-4 py-3 text-center">Filière</th>
              <th className="px-4 py-3 text-left">Nom</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">TelePhone</th>
              <th className="px-4 py-3 text-center">Password</th>
              <th className="px-4 py-3 text-center">Role</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="text-gray-700 text-sm">
            {responsables.map((r, index) => (
              <tr
                key={r.uid}
                className={`border-t hover:bg-gray-50 transition ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                {/* FILIERE */}
                <td className="px-4 py-3 text-center font-medium">
                  {r.filiere}
                </td>

                {/* NOM */}
                <td className="px-4 py-3">{r.name}</td>

                {/* EMAIL */}
                <td className="px-4 py-3">{r.email}</td>
                {/* Phone */}
                <td className="px-4 py-3">{r.phone}</td>

                {/* PASSWORD */}
                <td className="px-4 py-3 text-center">
                  <span className="text-gray-400">{r.password}</span>
                </td>

                {/* ROLE */}
                <td className="px-4 py-3 text-center">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {r.role}
                  </span>
                </td>

                {/* ACTIONS */}
                <td className="px-4 py-3">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => setEditData(r)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Modifier
                    </button>

                    <button
                      onClick={() => setDeleteData(r)}
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
      {/* MODAL EDIT */}{" "}
      {editData && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          {" "}
          <div className="bg-white p-6 rounded-lg w-96">
            {" "}
            <h2 className="text-xl font-semibold mb-4">Modifier</h2>{" "}
            <div className="space-y-3">
              {" "}
              <input
                value={editData.name}
                onChange={(e) =>
                  setEditData({ ...editData, name: e.target.value })
                }
                className="border p-2 w-full"
              />{" "}
              <input
                type="number"
                value={editData.phone}
                onChange={(e) =>
                  setEditData({ ...editData, phone: e.target.value })
                }
                className="border p-2 w-full"
              />{" "}
              <select
                value={editData.filiere}
                onChange={(e) =>
                  setEditData({ ...editData, filiere: e.target.value })
                }
                className="border p-2 w-full"
              >
                {" "}
                {filieres.map((f) => (
                  <option key={f.id} value={f.nom}>
                    {" "}
                    {f.nom}{" "}
                  </option>
                ))}{" "}
              </select>{" "}
            </div>{" "}
            <div className="flex gap-3 mt-4">
              {" "}
              <button
                onClick={updateResponsable}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                {" "}
                Sauvegarder{" "}
              </button>{" "}
              <button
                onClick={() => setEditData(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                {" "}
                Annuler{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}
      {/* DELETE */}
      {deleteData && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-3">
              Confirmer la suppression
            </h2>

            <p className="mb-4">Supprimer {deleteData.name} ?</p>

            <div className="flex gap-3">
              <button
                onClick={async () => {
                  await deleteResponsable(deleteData.uid);
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
