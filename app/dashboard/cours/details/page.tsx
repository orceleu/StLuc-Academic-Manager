"use client";

import AssignmentTable from "@/app/clientComponents/assignment";
import CourseManagementPage from "@/app/clientComponents/courses";
import OfferingTable from "@/app/clientComponents/offeringCourses";
import ScheduleTable from "@/app/clientComponents/schedules";
import { useRouter } from "next/navigation";
import React from "react";
import { IoMdReturnLeft } from "react-icons/io";

export default function Page() {
  const router = useRouter();
  return (
    <>
      <div className="p-10">
        {" "}
        <button
          onClick={() => router.back()}
          className=" bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <IoMdReturnLeft size={18} />
        </button>
        <AssignmentTable />
        <OfferingTable />
      </div>
    </>
  );
}
