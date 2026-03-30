"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../clientComponents/AuthContext";
import NavBar from "../clientComponents/Navbar";
import {
  LoaderIcon,
  Users,
  BookOpen,
  GraduationCap,
  Layers,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Responsable } from "./department/page";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { Teacher } from "./teacher/page";
import SetupPage2 from "../clientComponents/GetYearsAndSession";
import RegisterStudentModal from "../clientComponents/addStudent";
import {
  getAcademicYears,
  getFilieres,
  getSessions,
  getTotalStudentsCount,
} from "../neon/request";

interface AcademicData {
  filieres: any[];
  sessions: any[];
  years: any[];
}

export default function AdminOverview() {
  const router = useRouter();
  const { user, role, loading, currentFiliere } = useAuth();

  const [responsables, setResponsables] = useState<Responsable[]>([]);
  const [teacher, setTeacher] = useState<Teacher[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [count, setCount] = useState<number | null>(null);

  const [data, setData] = useState<AcademicData>({
    filieres: [],
    sessions: [],
    years: [],
  });

  const usersRef = collection(db, "users");

  async function fetchResponsables() {
    const snapshot = await getDocs(usersRef);
    const list: any = [];

    snapshot.forEach((docu) => {
      const data = docu.data();
      if (data.role === "responsable") {
        list.push({ id: docu.id, ...data });
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
        list.push({ id: docu.id, ...data });
      }
    });

    setTeacher(list);
  }

  const fetchCount = async () => {
    const total = await getTotalStudentsCount();
    setCount(total);
  };

  useEffect(() => {
    const fetchData = async () => {
      const [f, s, y] = await Promise.all([
        getFilieres(),
        getSessions(),
        getAcademicYears(),
      ]);

      setData({
        filieres: f || [],
        sessions: s || [],
        years: y || [],
      });
    };

    fetchData();
    fetchCount();
  }, []);

  useEffect(() => {
    fetchTeacher();
    fetchResponsables();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <LoaderIcon className="animate-spin w-8 h-8 text-indigo-600" />
      </div>
    );

  return (
    <>
      <NavBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">
              Rôle : <span className="font-semibold">{role}</span>
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition shadow-sm"
          >
            + Nouvel étudiant {count !== null && `(${count})`}
          </button>
        </div>

        {/* MODAL */}
        <RegisterStudentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          filieres={data.filieres}
          sessions={data.sessions}
          academicYears={data.years}
        />

        <SetupPage2 />

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {/* FILIERES */}
          {role === "admin" && (
            <div
              onClick={() => router.push("/dashboard/department")}
              className="group bg-white rounded-2xl p-5 border hover:shadow-lg transition cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <Layers className="text-indigo-600" />
                <span className="text-sm text-gray-400">Filières</span>
              </div>

              <h2 className="text-lg font-semibold mb-1">Départements</h2>

              <p className="text-sm text-gray-500 mb-3">Gérer les filières</p>

              <p className="text-sm">
                Responsables :{" "}
                <span className="font-bold text-green-600">
                  {responsables.length}
                </span>
              </p>
            </div>
          )}

          {/* TEACHERS */}
          {(role === "admin" || role === "responsable") && (
            <div
              onClick={() => router.push("/dashboard/teacher")}
              className="group bg-white rounded-2xl p-5 border hover:shadow-lg transition cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <Users className="text-indigo-600" />
                <span className="text-sm text-gray-400">Enseignants</span>
              </div>

              <h2 className="text-lg font-semibold mb-1">Professeurs</h2>

              <p className="text-sm text-gray-500 mb-3">
                Gérer les enseignants
              </p>

              <p className="text-sm">
                Total :{" "}
                <span className="font-bold text-green-600">
                  {
                    teacher.filter(
                      (t) =>
                        currentFiliere === "directeur" ||
                        t.filiere === currentFiliere,
                    ).length
                  }
                </span>
              </p>
            </div>
          )}

          {/* STUDENTS */}
          <div
            onClick={() => router.push("/dashboard/students")}
            className="group bg-white rounded-2xl p-5 border hover:shadow-lg transition cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <GraduationCap className="text-indigo-600" />
              <span className="text-sm text-gray-400">Étudiants</span>
            </div>

            <h2 className="text-lg font-semibold mb-1">Étudiants</h2>

            <p className="text-sm text-gray-500">Notes & gestion</p>
          </div>

          {/* COURS */}
          <div
            onClick={() => router.push("/dashboard/cours")}
            className="group bg-white rounded-2xl p-5 border hover:shadow-lg transition cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="text-indigo-600" />
              <span className="text-sm text-gray-400">Cours</span>
            </div>

            <h2 className="text-lg font-semibold mb-1">Cours</h2>

            <p className="text-sm text-gray-500">Gérer les cours</p>
          </div>
        </div>
      </div>
    </>
  );
}
