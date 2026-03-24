"use client";

import React, { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

type Student = {
  id: string;
  name: string;
  filiere: string;
  retakes: number; // 🔥 nombre de reprise
  grades: {
    [subject: string]: number; // 🔥 notes sur 100
  };
};

const subjects = ["Math", "Physique", "Electronique", "Programmation"];

const students: Student[] = [
  {
    id: "1",
    name: "Jean Pierre",
    filiere: "Telecom 1",
    retakes: 1,
    grades: {
      Math: 70,
      Physique: 65,
      Electronique: 80,
      Programmation: 75,
    },
  },
  {
    id: "2",
    name: "Marie Claude",
    filiere: "Telecom 1",
    retakes: 0,
    grades: {
      Math: 60,
      Physique: 79,
      Electronique: 68,
      Programmation: 90,
    },
  },
  {
    id: "3",
    name: "Paul Junior",
    filiere: "Electrotechnique",
    retakes: 2,
    grades: {
      Math: 85,
      Physique: 78,
      Electronique: 88,
      Programmation: 70,
    },
  },
];

export default function PalmaresPage() {
  const [selectedFiliere, setSelectedFiliere] = useState("Telecom 1");
  const [search, setSearch] = useState("");

  // 🔥 Filtre + moyenne + tri
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        return (
          s.filiere === selectedFiliere &&
          s.name.toLowerCase().includes(search.toLowerCase())
        );
      })
      .map((student) => {
        const grades = subjects.map((s) => student.grades[s] || 0);

        const average = grades.reduce((a, b) => a + b, 0) / subjects.length;

        const total = grades.reduce((a, b) => a + b, 0);

        return {
          ...student,
          average,
          total,
        };
      })
      .sort((a, b) => b.average - a.average);
  }, [selectedFiliere, search]);

  // ✅ Export individuel
  const exportToExcel = (student: any) => {
    const data = [
      ["Relevé de notes"],
      ["Filière", student.filiere],
      ["Nom", student.name],
      ["Reprises", student.retakes],
      [],
      ["Matière", "Note (/100)"],
      ...subjects.map((s) => [s, student.grades[s] || 0]),
      [],
      ["Total", `${student.total}/${subjects.length * 100}`],
      ["Moyenne", `${student.average.toFixed(2)}/100`],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relevé");

    const buffer = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(new Blob([buffer]), `Releve_${student.name}.xlsx`);
  };

  // ✅ Export filière
  const exportFiliereToExcel = () => {
    const header = ["Nom", ...subjects, "Reprises", "Total", "Moyenne (/100)"];

    const data = filteredStudents.map((s: any) => [
      s.name,
      ...subjects.map((sub) => s.grades[sub] || 0),
      s.retakes,
      `${s.total}/${subjects.length * 100}`,
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
          <option>Telecom 1</option>
          <option>Electrotechnique</option>
        </select>

        <input
          type="text"
          placeholder="Rechercher..."
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
            {subjects.map((s) => (
              <th key={s} className="border p-2">
                {s}
              </th>
            ))}
            <th className="border p-2">Reprises</th>
            <th className="border p-2">Total</th>
            <th className="border p-2">Moyenne</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredStudents.map((s: any, i) => (
            <tr key={s.id} className="text-center">
              <td className="border p-2">{i + 1}</td>

              <td className="border p-2 font-semibold">{s.name}</td>

              {/* 🔥 Notes simples + rouge si <70 */}
              {subjects.map((sub) => {
                const grade = s.grades[sub] || 0;

                return (
                  <td
                    key={sub}
                    className={`border p-2 ${
                      grade < 70 ? "text-red-600 font-bold" : "text-green-700"
                    }`}
                  >
                    {grade}
                  </td>
                );
              })}

              <td className="border p-2">{s.retakes}</td>

              <td className="border p-2 font-bold">
                {s.total}/{subjects.length * 100}
              </td>

              <td
                className={`border p-2 font-bold ${
                  s.average < 70 ? "text-red-600" : "text-green-600"
                }`}
              >
                {s.average.toFixed(2)}/100
              </td>

              <td className="border p-2">
                <button
                  onClick={() => exportToExcel(s)}
                  className="bg-green-600 text-white px-2 py-1 rounded"
                >
                  Export
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
