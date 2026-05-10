"use client";

import AssignmentTable from "@/app/clientComponents/assignment";
import CourseManagementPage from "@/app/clientComponents/courses";
import OfferingTable from "@/app/clientComponents/offeringCourses";
import ScheduleTable from "@/app/clientComponents/schedules";
import { Button } from "@/components/ui/button";
import { ArrowBigLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { IoMdReturnLeft } from "react-icons/io";
import { MdArrowBackIos } from "react-icons/md";

export default function Page() {
  const router = useRouter();
  return (
    <>
      <div className="p-2 md:p-6 max-w-6xl mx-auto">
        <Button
          onClick={() => {
            router.back();
          }}
          variant={"outline"}
          className="my-2 mx-2 md:my-6"
        >
          <MdArrowBackIos />
        </Button>

        <AssignmentTable />
        <OfferingTable />
      </div>
    </>
  );
}
