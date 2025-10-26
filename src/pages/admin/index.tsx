import { Route, Routes } from "react-router-dom";

import AdminLayout from "../AdminLayout";
import AdminPanel from "../AdminPanel";

import CarouselImagesAdmin from "./CarouselImagesAdmin";
import CreatePastEvent from "./CreatePastEvent";
import EventRegistrations from "./EventRegistrations";
import ForumAdmin from "./ForumAdmin";
import TrekEventsAdmin from "./TrekEventsAdmin";

import UserVerificationPanel from "@/components/admin/UserVerificationPanel";

export default function AdminHome() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminPanel />} />
        <Route path="/events" element={<TrekEventsAdmin />} />
        <Route path="/past-events/create" element={<CreatePastEvent />} />
        <Route path="/id" element={<UserVerificationPanel />} />
        <Route path="/event-registrations" element={<EventRegistrations />} />
        <Route path="/forum" element={<ForumAdmin />} />
        <Route path="/carousel-images" element={<CarouselImagesAdmin />} />
      </Routes>
    </AdminLayout>
  );
}
