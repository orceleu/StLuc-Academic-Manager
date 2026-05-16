"use client";

import { useEffect, useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/app/firebase/config";
import { useAuth } from "@/app/clientComponents/AuthContext";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import {
  createFiliere,
  deleteUser,
  getFilieres,
  getResponsables,
  saveResponsable,
  updateResponsableData,
} from "@/app/neon/request";
import { Button } from "@/components/ui/button";
import { MdArrowBackIos } from "react-icons/md";

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
  duration_years: number; // Ajouté au type
};

export default function FilierePage() {
  const [responsables, setResponsables] = useState<any[]>([]);
  const [filieres, setFilieres] = useState<any[]>([]);
  const [deleteData, setDeleteData] = useState<any>(null);
  const [editData, setEditData] = useState<any>(null);

  // Form states
  const [selectedFiliereId, setSelectedFiliereId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [filiereNom, setFiliereNom] = useState("");
  const [filiereAnnee, setFiliereAnnee] = useState<number>(3); // État ajouté (par défaut 3 ans)

  const router = useRouter();
  const { role } = useAuth();

  useEffect(() => {
    refreshData();
  }, []);

  async function refreshData() {
    const f = await getFilieres();
    const r = await getResponsables();
    setFilieres(f);
    setResponsables(r);
  }

  // Modifié pour passer la durée au serveur
  async function handleAddFiliere() {
    if (!filiereNom) return;
    await createFiliere(filiereNom, filiereAnnee);
    setFiliereNom("");
    setFiliereAnnee(3); // Reset à la valeur par défaut
    refreshData();
  }

  async function handleAddResponsable() {
    if (!selectedFiliereId) return alert("Choisissez une filière");

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await saveResponsable({
        uid: cred.user.uid,
        name,
        email,
        phone,
        password,
        filiereId: selectedFiliereId,
      });

      setSelectedFiliereId("");
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      refreshData();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleUpdate() {
    if (!editData) return;
    await updateResponsableData(editData.id, editData.name, editData.phone);
    setEditData(null);
    refreshData();
  }

  async function handleDelete() {
    if (!deleteData) return;
    await deleteUser(deleteData.id);
    setDeleteData(null);
    refreshData();
  }

  if (role !== "admin") {
    return (
      <p className="text-center font-bold text-red-600 p-25">Non autorisé</p>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-2 md:p-6">
      <Button
        onClick={() => router.back()}
        variant={"outline"}
        className="my-2 mx-2 md:my-6"
      >
        <MdArrowBackIos />
      </Button>
      <p className="text-2xl font-semibold text-center my-2 md:my-6 underline">
        Gestion des Filières
      </p>

      {/* BLOC AJOUT FILIERE (Modifié pour inclure la durée) */}
      <div className="bg-gray-100 p-6 rounded-lg mb-10">
        <h2 className="text-xl font-semibold mb-4">Ajouter Filière</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            placeholder="Nom de la filière"
            value={filiereNom}
            onChange={(e) => setFiliereNom(e.target.value)}
            className="flex-1 p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-100"
          />
          <select
            value={filiereAnnee}
            onChange={(e) => setFiliereAnnee(Number(e.target.value))}
            className="p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-100 min-w-[150px]"
          >
            <option value={1}>1 An</option>
            <option value={2}>2 Ans</option>
            <option value={3}>3 Ans</option>
          </select>
          <button
            onClick={handleAddFiliere}
            className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition whitespace-nowrap"
          >
            Ajouter
          </button>
        </div>
      </div>

      {/* BLOC AJOUT RESPONSABLE */}
      <div className="bg-gray-100 p-6 rounded-lg mb-10">
        <h2 className="text-xl font-semibold mb-4">Ajouter Responsable</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <select
            value={selectedFiliereId}
            onChange={(e) => setSelectedFiliereId(e.target.value)}
            className="w-full p-3 border rounded-xl bg-gray-50"
          >
            <option value="">Choisir une filière</option>
            {filieres.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} {f.duration_years ? `(${f.duration_years} ans)` : ""}
              </option>
            ))}
          </select>
          <input
            placeholder="Nom prénom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-100"
          />
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-100"
          />
          <input
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="flex-1 p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-100"
          />
          <input
            placeholder="Password"
            value={password}
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            className="flex-1 p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <button
          onClick={handleAddResponsable}
          className="w-full bg-blue-600 mt-4 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition"
        >
          Ajouter Responsable
        </button>
      </div>

      {/* TABLEAU */}
      <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
        <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
            <tr>
              <th className="px-4 py-3">Filière</th>
              <th className="px-4 py-3 text-left">Responsable</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Téléphone</th>
              <th className="px-4 py-3 text-left">Mot de passe</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm">
            {responsables.map((r, index) => (
              <tr
                key={r.id}
                className={`border-t ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
              >
                <td className="px-4 py-3 text-center font-medium">
                  {r.filiere_name}{" "}
                  {r.duration_years ? `(${r.duration_years} ans)` : ""}
                </td>
                <td className="px-4 py-3">{r.name}</td>
                <td className="px-4 py-3">{r.email}</td>
                <td className="px-4 py-3">{r.phone}</td>
                <td className="px-4 py-3">{r.password}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-3">
                    <Button
                      size={"sm"}
                      variant={"outline"}
                      onClick={() => setEditData(r)}
                    >
                      Modifier
                    </Button>
                    <Button
                      size={"sm"}
                      variant={"destructive"}
                      onClick={() => setDeleteData(r)}
                    >
                      Supprimer
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODALE MODIFIER */}
      {editData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Modifier le Responsable
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <input
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={editData.name}
                  onChange={(e) =>
                    setEditData({ ...editData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  type="tel"
                  value={editData.phone}
                  onChange={(e) =>
                    setEditData({ ...editData, phone: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditData(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Enregistrer les modifications
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE SUPPRIMER */}
      {deleteData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Supprimer ?
            </h2>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer{" "}
              <strong>{deleteData.name}</strong> ? Cette action est
              irréversible.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleDelete}
                className="w-full py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Oui, supprimer
              </button>
              <button
                onClick={() => setDeleteData(null)}
                className="w-full py-2.5 text-gray-500 hover:bg-gray-50 rounded-lg transition"
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
