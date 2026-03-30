"use client";
import { useAuth } from "@/app/clientComponents/AuthContext";
import CourseManagementPage from "@/app/clientComponents/courses";
import {
  getAcademicYears,
  getCourseOfferings,
  getCourses,
  getFilieres,
  getSessions,
  getTeachers,
  getTeachers2,
} from "@/app/neon/request";
import React, { useEffect, useState } from "react";
interface AcademicData {
  filieres: any[];
  sessions: any[];
  years: any[];
  courses: any[];
  teacher: any[];
  offering: any[];
}
export default function Page() {
  const { role, user } = useAuth();
  const [data, setData] = useState<AcademicData>({
    filieres: [],
    sessions: [],
    years: [],
    courses: [],
    teacher: [],
    offering: [],
  });
  useEffect(() => {
    const fetchData = async () => {
      const [f, s, y, c, t, o] = await Promise.all([
        getFilieres(),
        getSessions(),
        getAcademicYears(),
        getCourses(),
        getTeachers2("teacher"),
        getCourseOfferings(),
      ]);
      setData({
        filieres: f || [],
        sessions: s || [],
        years: y || [],
        courses: c || [],
        teacher: t || [],
        offering: o || [],
      });
    };
    fetchData();
    //fetchCount();
  }, []);
  return (
    <div>
      <CourseManagementPage
        sessions={data.sessions || []}
        filieres={data.filieres || []}
        courses={data.courses || []}
        academicYears={data.years || []}
        teachers={data.teacher || []}
        offerings={data.offering || []}
      />
    </div>
  );
}
