interface Coordinates {
  lat: number;
  lon: number;
}

interface RoutePlanRequest {
  from: Coordinates;
  to: Coordinates;
  mode?: "CAR" | "WALK";
  date?: string;
  time?: string;
  arriveBy?: boolean;
}

interface RouteLeg {
  mode: string;
  from: {
    name: string;
    lat: number;
    lon: number;
  };
  to: {
    name: string;
    lat: number;
    lon: number;
  };
  distance: number;
  duration: number;
  steps?: any[];
}

interface RouteResponse {
  success: boolean;
  route?: {
    duration: number;
    durationMinutes: number;
    distance: number;
    distanceKm: number;
    startTime: string;
    endTime: string;
    legs: RouteLeg[];
  };
}

interface TimeEstimate {
  success: boolean;
  timeMinutes?: number;
  distanceKm?: number;
}

// Backend API URL (will be set via environment variable)
const BACKEND_API_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

export const otpService = {
  /**
   * Plan a route between two points for carpooling
   */
  async planRoute(request: RoutePlanRequest): Promise<RouteResponse> {
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/routing/plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("OTP Service Error:", error);
      return {
        success: false,
      };
    }
  },

  /**
   * Get estimated travel time between two points
   */
  async estimateTime(
    from: Coordinates,
    to: Coordinates,
    mode: "CAR" = "CAR",
  ): Promise<TimeEstimate> {
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/routing/time`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from, to, mode }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("OTP Time Estimation Error:", error);
      return {
        success: false,
      };
    }
  },

  /**
   * Check if OTP service is available
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/routing/health`, {
        method: "GET",
      });

      const data = await response.json();
      return data.otpConnected === true;
    } catch (error) {
      console.error("OTP Health Check Error:", error);
      return false;
    }
  },
};
