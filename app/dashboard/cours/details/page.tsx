"use client";

import AssignmentTable from "@/app/clientComponents/assignment";
import CourseManagementPage from "@/app/clientComponents/courses";
import OfferingTable from "@/app/clientComponents/offeringCourses";
import ScheduleTable from "@/app/clientComponents/schedules";
import { ArrowBigLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { IoMdReturnLeft } from "react-icons/io";

export default function Page() {
  const router = useRouter();
  return (
    <>
      <div className="p-2 md:p-6 max-w-6xl mx-auto">
        {" "}
        <button
          onClick={() => router.back()}
          className=" bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <ArrowBigLeftIcon size={18} />
        </button>
        <AssignmentTable />
        <OfferingTable />
      </div>
    </>
  );
}
