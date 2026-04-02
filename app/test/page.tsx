"use client";

import { useState, useEffect } from "react";
import { getFullSchedules } from "@/app/neon/request";
import { Search, Calendar, Clock, MapPin, User, BookOpen } from "lucide-react";
import ScheduleTable from "../clientComponents/schedules";
import AssignmentList from "../clientComponents/assignment";
import OfferingTable from "../clientComponents/offeringCourses";
import GradesPage from "../clientComponents/gradePalmares";

export default function Page() {
  return (
    <div className="p-16 space-y-9">
      <AssignmentList />
      <OfferingTable />
      <GradesPage />
    </div>
  );
}
