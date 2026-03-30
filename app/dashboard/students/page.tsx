"use client";

import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { Filiere } from "../department/page";
import { Cours } from "../cours/page";

/*type Student = {
  id: string;
  name: string;
  filiere: string;
  retakes: number; // 🔥 nombre de reprise
  grades: {
    [subject: string]: number; // 🔥 notes sur 100
  };*/
type Student = {
  id?: string;
  name: string;
  filiere: string;
  retakes: number;
  grades: {
    [coursId: string]: number;
  };
  lastUpdated: string;
};

//const subjects = ["Math", "Physique", "Electronique", "Programmation"];

export default function PalmaresPage() {
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [selectedFiliere, setSelectedFiliere] = useState<string>("");
  const [search, setSearch] = useState("");
  const [cours, setCours] = useState<Cours[]>([]);
  const filiereRef = collection(db, "filieres");
  const [students, setStudents] = useState<Student[]>([]);
  const [editData, setEditData] = useState<any>(null);
  const [deleteData, setDeleteData] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
  });
  const [name, setName] = useState("");

  async function fetchStudents() {
    const snapshot = await getDocs(collection(db, "students"));

    const list: Student[] = [];

    snapshot.forEach((doc) => {
      list.push({
        id: doc.id,
        ...(doc.data() as Student),
      });
    });

    setStudents(list);
  }
  // 🔥 Filtre + moyenne + tri
  useEffect(() => {
    fetchCours();
    fetchStudents();
  }, []);
  async function addStudent(student: Student) {
    await addDoc(collection(db, "students"), student);
    fetchStudents(); // refresh
  }

  async function updateStudent(id: string, data: Partial<Student>) {
    const ref = doc(db, "students", id);

    await updateDoc(ref, {
      ...data,
      lastUpdated: new Date().toISOString(), // 🔥 auto update date
    });
  }

  async function deleteStudent(id: string) {
    await deleteDoc(doc(db, "students", id));
    fetchStudents();
  }

  async function fetchCours() {
    const snapshot = await getDocs(collection(db, "cours"));

    const list: Cours[] = [];

    snapshot.forEach((doc) => {
      list.push({
        id: doc.id,
        ...(doc.data() as Cours),
      });
    });

    setCours(list);
  }
  useEffect(() => {
    fetchFilieres();
  }, []);
  const coursFiltres = useMemo(() => {
    return cours.filter((c) => c.filiere === selectedFiliere && c.active);
  }, [cours, selectedFiliere]);
  async function fetchFilieres() {
    const snapshot = await getDocs(collection(db, "filieres"));

    const list: Filiere[] = [];

    snapshot.forEach((docu) => {
      list.push({
        id: docu.id,
        ...docu.data(),
      } as Filiere);
    });

    setFilieres(list);

    // optionnel: sélectionner la première filière automatiquement
    if (list.length > 0) {
      setSelectedFiliere(list[0].nom); // adapte selon ton champ
    }
  }
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        return (
          s.filiere === selectedFiliere &&
          s.name.toLowerCase().includes(search.toLowerCase())
        );
      })
      .map((student) => {
        const grades = coursFiltres.map((c) => student.grades[c.nom] || 0);

        const total = grades.reduce((a, b) => a + b, 0);
        const average = coursFiltres.length ? total / coursFiltres.length : 0;

        // 🔥 calcul auto des reprises
        const retakes = grades.filter((g) => g < 70).length;
        return {
          ...student,
          average,
          total,
          retakes,
        };
      })
      .sort((a, b) => b.average - a.average);
  }, [selectedFiliere, search]); // ✅ IMPORTANT

  // ✅ Export individuel
  const exportToExcel = (student: any) => {
    const data = [
      ["Relevé de notes"],
      ["Filière", student.filiere],
      ["Nom", student.name],
      ["Reprises", student.retakes],
      [],
      ["Matière", "Note (/100)"],
      ...coursFiltres.map((s) => [s, student.grades[s.nom] || 0]),
      [],
      ["Total", `${student.total}/${coursFiltres.length * 100}`],
      ["Moyenne", `${student.average.toFixed(2)}/100`],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relevé");

    const buffer = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });
    XLSX.utils.book_append_sheet(wb, ws, selectedFiliere || "Filiere");

    saveAs(new Blob([buffer]), `Palmares_${selectedFiliere || "filiere"}.xlsx`);

    //saveAs(new Blob([buffer]), `Releve_${student.name}.xlsx`);
  };

  // ✅ Export filière
  const exportFiliereToExcel = () => {
    const header = [
      "Nom",
      ...coursFiltres,
      "Reprises",
      "Total",
      "Moyenne (/100)",
    ];

    const data = filteredStudents.map((s: any) => [
      s.name,
      ...coursFiltres.map((c) => s.grades[c.nom] || 0),
      s.retakes,
      `${s.total}/${coursFiltres.length * 100}`,
      `${s.average.toFixed(2)}/100`,
    ]);

    const ws = XLSX.utils.aoa_to_sheet([header, ...data]);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, selectedFiliere);

    const buffer = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(new Blob([buffer]), `Palmares_${selectedFiliere}.xlsx`);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Filière : {selectedFiliere}</h1>

        <button
          onClick={exportFiliereToExcel}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Exporter {selectedFiliere}
        </button>
      </div>
      {/* Filtres */}
      <div className="flex gap-4 mb-4">
        <select
          value={selectedFiliere}
          onChange={(e) => setSelectedFiliere(e.target.value)}
          className="border p-2 rounded"
        >
          {filieres.map((f) => (
            <option key={f.id} value={f.nom}>
              {f.nom}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Recherche par nom"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded"
        />
      </div>
      {/* Tableau */}
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Rang</th>
            <th className="border p-2">Nom</th>
            {coursFiltres.map((c) => (
              <th key={c.id} className="border p-2">
                {c.nom}
              </th>
            ))}
            <th className="border p-2">Reprises</th>
            <th className="border p-2">Total</th>
            <th className="border p-2">Moyenne</th>
            <th className="border p-2">Action</th>
            <th className="border p-2">Dernière modif</th>
          </tr>
        </thead>

        <tbody>
          {filteredStudents.map((s: any, i) => (
            <tr key={s.id} className="text-center">
              <td className="border p-2">{i + 1}</td>

              <td className="border p-2 font-semibold">{s.name}</td>

              {/* 🔥 Notes simples + rouge si <70 */}
              {coursFiltres.map((c) => {
                const grade = s.grades[c.nom] || 0;

                return (
                  <td
                    key={c.id}
                    className={`border p-2 ${
                      grade < 70 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {grade}
                  </td>
                );
              })}

              <td className="border p-2">{s.retakes}</td>

              <td className="border p-2 font-bold">
                {s.total}/{coursFiltres.length * 100}
              </td>

              <td
                className={`border p-2 font-bold ${
                  s.average < 70 ? "text-red-600" : "text-green-600"
                }`}
              >
                {s.average.toFixed(2)}/100
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => {
                      const newGrades = { ...s.grades };

                      coursFiltres.forEach((c) => {
                        if (newGrades[c.nom] === undefined) {
                          newGrades[c.nom] = 0;
                        }
                      });

                      setEditData({ ...s, grades: newGrades });
                    }}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Modifier
                  </button>

                  <button
                    onClick={() => setDeleteData(s)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Supprimer
                  </button>
                </div>
              </td>

              <td className="border p-2">
                <button
                  onClick={() => exportToExcel(s)}
                  className="bg-green-600 text-white px-2 py-1 rounded"
                >
                  Export
                </button>
              </td>
              <td className="border p-2 text-sm">
                {s.lastUpdated
                  ? new Date(s.lastUpdated).toLocaleDateString()
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* MODAL EDIT */}{" "}
      {editData && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-[500px]">
            <h2 className="text-xl font-semibold mb-4">Modifier étudiant</h2>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {/* Nom */}
              <input
                value={editData.name}
                onChange={(e) =>
                  setEditData({ ...editData, name: e.target.value })
                }
                className="border p-2 w-full"
                placeholder="Nom"
              />

              {/* 🔥 NOTES DYNAMIQUES */}
              <div>
                <h3 className="font-semibold mb-2">Notes</h3>

                {coursFiltres.map((c) => (
                  <div
                    key={c.id}
                    className="flex justify-between items-center mb-2"
                  >
                    <span>{c.nom}</span>

                    <input
                      type="number"
                      value={editData.grades[c.nom] || 0}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          grades: {
                            ...editData.grades,
                            [c.nom]: Number(e.target.value),
                          },
                        })
                      }
                      className="border p-1 w-20 text-center"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setEditData(null)}
                className="px-3 py-2 bg-gray-400 text-white rounded"
              >
                Annuler
              </button>

              <button
                onClick={() => {
                  updateStudent(editData.id, {
                    name: editData.name,
                    retakes: editData.retakes,
                    grades: editData.grades,
                  });
                  setEditData(null);
                }}
                className="px-3 py-2 bg-blue-600 text-white rounded"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Ajouter étudiant</h2>

            <input
              type="text"
              placeholder="Nom"
              value={newStudent.name}
              onChange={(e) =>
                setNewStudent({ ...newStudent, name: e.target.value })
              }
              className="border p-2 w-full mb-3"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="bg-gray-400 text-white px-3 py-2 rounded"
              >
                Annuler
              </button>

              <button
                onClick={async () => {
                  await addStudent({
                    name: newStudent.name,
                    filiere: selectedFiliere,
                    grades: {},
                    retakes: 0,
                    lastUpdated: new Date().toISOString(), // 🔥
                  });

                  setShowAddModal(false);
                  setNewStudent({ name: "" });
                }}
                className="bg-green-600 text-white px-3 py-2 rounded"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
      {deleteData && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-4 text-red-600">
              Confirmer suppression
            </h2>

            <p className="mb-4">
              Supprimer <strong>{deleteData.name}</strong> ?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteData(null)}
                className="bg-gray-400 text-white px-3 py-2 rounded"
              >
                Annuler
              </button>

              <button
                onClick={async () => {
                  await deleteStudent(deleteData.id);
                  setDeleteData(null);
                }}
                className="bg-red-600 text-white px-3 py-2 rounded"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
      <button
        onClick={() => setShowAddModal(true)}
        className="bg-green-600 text-white px-3 py-2 rounded"
      >
        Ajouter étudiant
      </button>
    </div>
  );
}
