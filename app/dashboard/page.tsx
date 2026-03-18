"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../clientComponents/AuthContext";
import NavBar from "../clientComponents/Navbar";
import { LoaderIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Responsable } from "./department/page";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { Teacher } from "./teacher/page";

export default function AdminOverview() {
  const router = useRouter();
  const [responsables, setResponsables] = useState<Responsable[]>([]);
  const [teacher, setTeacher] = useState<Teacher[]>([]);

  const { user, role, loading, currentFiliere } = useAuth();
  console.log(role);
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
  async function fetchTeacher() {
    const snapshot = await getDocs(usersRef);

    const list: any = [];

    snapshot.forEach((docu) => {
      const data = docu.data();

      if (data.role === "teacher") {
        list.push({
          id: docu.id,
          ...data,
        });
      }
    });

    setTeacher(list);
  }

  useEffect(() => {
    fetchTeacher();
    fetchResponsables();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center p-2">
        <LoaderIcon className="animate-spin" />
      </div>
    );
  return (
    <>
      {" "}
      <NavBar />
      <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-10 mt-25">
          Dashboard <span className="text-gray-600 font-bold">({role})</span>
        </h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* FILIERE */}
          {role !== "admin" ? null : (
            <div
              onClick={() => router.push("/dashboard/department")}
              className="cursor-pointer bg-white border rounded-xl p-6 shadow-sm hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold mb-2">Filières</h2>

              <p className="text-gray-500">
                Gérer les filières de l'établissement
              </p>
              <p>
                Responsable:{" "}
                <span className="text-green-600 font-bold">
                  {responsables.length}
                </span>
              </p>
            </div>
          )}
          {/* ENSEIGNANTS */}

          {role !== "admin" && role !== "responsable" ? null : (
            <div
              onClick={() => router.push("/dashboard/teacher")}
              className="cursor-pointer bg-white border rounded-xl p-6 shadow-sm hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold mb-2">Enseignants</h2>

              <p className="text-gray-500">Ajouter et gérer les enseignants</p>
              <p>
                Enseignant:{" "}
                <span className="text-green-600 font-bold">
                  {
                    teacher.filter(
                      (t) =>
                        currentFiliere === "directeur" ||
                        t.filiere === currentFiliere,
                    ).length
                  }{" "}
                </span>
              </p>
            </div>
          )}

          {/* ETUDIANTS */}

          <div
            onClick={() => router.push("/dashboard/students")}
            className="cursor-pointer bg-white border rounded-xl p-6 shadow-sm hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold mb-2">Étudiants</h2>

            <p className="text-gray-500">Consulter et gérer les notes</p>
          </div>
          {/* COURS */}

          <div
            onClick={() => router.push("/dashboard/cours")}
            className="cursor-pointer bg-white border rounded-xl p-6 shadow-sm hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold mb-2">Cours</h2>

            <p className="text-gray-500">
              Ajouter, Consulter et gérer les Cours plus facilement
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
