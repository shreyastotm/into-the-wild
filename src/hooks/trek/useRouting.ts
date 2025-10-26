import { useState } from "react";

import { toast } from "@/components/ui/use-toast";
import { otpService } from "@/services/otpService";

interface Coordinates {
  lat: number;
  lon: number;
}

export function useRouting() {
  const [loading, setLoading] = useState(false);
  const [route, setRoute] = useState<any>(null);

  const calculateRoute = async (
    from: Coordinates,
    to: Coordinates,
    mode: "CAR" | "WALK" = "CAR",
  ) => {
    setLoading(true);
    try {
      const result = await otpService.planRoute({
        from,
        to,
        mode,
        date: new Date().toISOString().split("T")[0],
        time: new Date().toTimeString().split(" ")[0],
      });

      if (result.success && result.route) {
        setRoute(result.route);
        return result.route;
      } else {
        toast({
          title: "Route Planning Failed",
          description: "Could not calculate route. Please try again.",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      console.error("Routing error:", error);
      toast({
        title: "Route Planning Failed",
        description: "Could not calculate route. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const estimateTime = async (
    from: Coordinates,
    to: Coordinates,
    mode: "CAR" = "CAR",
  ) => {
    setLoading(true);
    try {
      const result = await otpService.estimateTime(from, to, mode);

      if (result.success && result.timeMinutes !== undefined) {
        return result;
      } else {
        toast({
          title: "Time Estimation Failed",
          description: "Could not estimate travel time.",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      console.error("Time estimation error:", error);
      toast({
        title: "Time Estimation Failed",
        description: "Could not estimate travel time.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const checkServiceHealth = async () => {
    try {
      return await otpService.checkHealth();
    } catch (error) {
      console.error("Service health check error:", error);
      return false;
    }
  };

  return {
    loading,
    route,
    calculateRoute,
    estimateTime,
    checkServiceHealth,
  };
}
