import { endOfMonth, startOfMonth } from "date-fns";
import React, { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export default function AdminPanel() {
  const { userProfile } = useAuth();
  const [upcomingTreksCount, setUpcomingTreksCount] = useState<number | null>(
    null,
  );
  const [pendingVerificationsCount, setPendingVerificationsCount] = useState<
    number | null
  >(null);
  const [pendingPaymentVerificationCount, setPendingPaymentVerificationCount] =
    useState<number | null>(null);
  const [totalUsersCount, setTotalUsersCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);

        // Fetch upcoming treks count (events starting today or later, excluding DRAFT and CANCELLED)
        const now = new Date();
        const { count: treksCount, error: treksError } = await supabase
          .from("trek_events")
          .select("*", { count: "exact", head: true })
          .gte("start_datetime", now.toISOString())
          .not("status", "in", "(DRAFT,CANCELLED)");

        if (treksError) {
          console.error("Error fetching upcoming treks count:", treksError);
        } else {
          setUpcomingTreksCount(treksCount || 0);
        }

        // Fetch pending ID verifications
        const { count: idVerificationsCount, error: idError } = await supabase
          .from("trek_registrations")
          .select("*", { count: "exact", head: true })
          .eq("id_verification_status", "pending");

        if (idError) {
          console.error("Error fetching pending ID verifications:", idError);
          setPendingVerificationsCount(0);
        } else {
          setPendingVerificationsCount(idVerificationsCount || 0);
        }

        // Fetch pending payment verifications (proof_uploaded status)
        const { count: paymentVerificationsCount, error: paymentError } =
          await supabase
            .from("trek_registrations")
            .select("*", { count: "exact", head: true })
            .eq("payment_status", "proof_uploaded");

        if (paymentError) {
          console.error(
            "Error fetching pending payment verifications:",
            paymentError,
          );
          setPendingPaymentVerificationCount(0);
        } else {
          setPendingPaymentVerificationCount(paymentVerificationsCount || 0);
        }

        // Fetch total users count
        const { count: usersCount, error: usersError } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true });

        if (usersError) {
          console.error("Error fetching total users count:", usersError);
        } else {
          setTotalUsersCount(usersCount || 0);
        }
      } catch (error) {
        console.error("Error fetching dashboard statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header Section with Glass Morphism */}
      <div className="bg-white/10 dark:bg-gray-900/20 backdrop-blur-md rounded-2xl p-6 lg:p-8 border border-white/20 dark:border-gray-700/30 shadow-xl">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-sm lg:text-base">
          Welcome, {userProfile?.full_name || "Admin"}. From here you can manage
          all aspects of the platform.
        </p>
      </div>

      {/* Stats Cards Grid - Enhanced for Desktop */}
      <div className="grid gap-6 lg:gap-8 md:grid-cols-2 xl:grid-cols-4">
        <Card className="bg-white/10 dark:bg-gray-900/20 backdrop-blur-md border-white/20 dark:border-gray-700/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex flex-col h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white line-clamp-2 min-h-[3.5rem]">
              Upcoming Treks
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col pt-0">
            <p className="text-sm lg:text-base text-gray-700 dark:text-gray-300 mb-4">
              Manage trek details, participants, and logistics.
            </p>
            <div className="mt-auto p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-200/30 dark:border-blue-800/30">
              <div className="text-2xl lg:text-3xl font-bold text-blue-600 dark:text-blue-400">
                {loading ? "..." : (upcomingTreksCount ?? 0)}
              </div>
              <div className="text-xs lg:text-sm text-blue-600/70 dark:text-blue-400/70">
                Upcoming Events
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 dark:bg-gray-900/20 backdrop-blur-md border-white/20 dark:border-gray-700/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex flex-col h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white line-clamp-2 min-h-[3.5rem]">
              Pending Verifications
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col pt-0">
            <p className="text-sm lg:text-base text-gray-700 dark:text-gray-300 mb-4">
              Review and approve new user identity documents.
            </p>
            <div className="mt-auto p-4 bg-orange-50/50 dark:bg-orange-900/20 rounded-lg border border-orange-200/30 dark:border-orange-800/30">
              <div className="text-2xl lg:text-3xl font-bold text-orange-600 dark:text-orange-400">
                {loading ? "..." : (pendingVerificationsCount ?? 0)}
              </div>
              <div className="text-xs lg:text-sm text-orange-600/70 dark:text-orange-400/70">
                Awaiting Review
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 dark:bg-gray-900/20 backdrop-blur-md border-white/20 dark:border-gray-700/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex flex-col h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white line-clamp-2 min-h-[3.5rem]">
              Payment Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col pt-0">
            <p className="text-sm lg:text-base text-gray-700 dark:text-gray-300 mb-4">
              Review and verify payment proofs for registrations.
            </p>
            <div className="mt-auto p-4 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg border border-purple-200/30 dark:border-purple-800/30">
              <div className="text-2xl lg:text-3xl font-bold text-purple-600 dark:text-purple-400">
                {loading ? "..." : (pendingPaymentVerificationCount ?? 0)}
              </div>
              <div className="text-xs lg:text-sm text-purple-600/70 dark:text-purple-400/70">
                Awaiting Review
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 dark:bg-gray-900/20 backdrop-blur-md border-white/20 dark:border-gray-700/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex flex-col h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white line-clamp-2 min-h-[3.5rem]">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col pt-0">
            <p className="text-sm lg:text-base text-gray-700 dark:text-gray-300 mb-4">
              View user statistics and manage user roles.
            </p>
            <div className="mt-auto p-4 bg-green-50/50 dark:bg-green-900/20 rounded-lg border border-green-200/30 dark:border-green-800/30">
              <div className="text-2xl lg:text-3xl font-bold text-green-600 dark:text-green-400">
                {loading ? "..." : (totalUsersCount ?? 0)}
              </div>
              <div className="text-xs lg:text-sm text-green-600/70 dark:text-green-400/70">
                Registered
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
