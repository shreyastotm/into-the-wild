import express from "express";
import axios from "axios";

const router = express.Router();

// OpenTripPlanner base URL (standalone server)
const OTP_BASE_URL = process.env.OTP_URL || "http://localhost:8080";

/**
 * Plan a route between two points for carpooling
 */
router.post("/plan", async (req, res) => {
  try {
    const { from, to, mode = "CAR", date, time, arriveBy = false } = req.body;

    // Validate required fields
    if (!from || !to) {
      return res.status(400).json({
        error: "from and to coordinates are required",
      });
    }

    console.log(
      `Planning route: ${from.lat},${from.lon} -> ${to.lat},${to.lon}`,
    );

    // Try to call OpenTripPlanner first
    try {
      const params = new URLSearchParams({
        fromPlace: `${from.lat},${from.lon}`,
        toPlace: `${to.lat},${to.lon}`,
        mode,
        date: date || new Date().toISOString().split("T")[0],
        time: time || "08:00:00",
        arriveBy: arriveBy.toString(),
        numItineraries: "1",
        locale: "en",
      });

      const response = await axios.get(
        `${OTP_BASE_URL}/otp/routers/default/plan?${params}`,
        { timeout: 10000 },
      );

      if (response.data?.plan?.itineraries?.[0]) {
        const itinerary = response.data.plan.itineraries[0];
        const transformed = {
          success: true,
          route: {
            duration: itinerary.duration,
            durationMinutes: Math.round(itinerary.duration / 60),
            distance: itinerary.walkDistance + (itinerary.transitDistance || 0),
            distanceKm:
              Math.round(
                ((itinerary.walkDistance + (itinerary.transitDistance || 0)) /
                  1000) *
                  10,
              ) / 10,
            startTime: new Date(itinerary.startTime).toLocaleString("en-IN"),
            endTime: new Date(itinerary.endTime).toLocaleString("en-IN"),
            legs:
              itinerary.legs?.map((leg: any) => ({
                mode: leg.mode,
                from: {
                  name: leg.from?.name || "Unknown",
                  lat: leg.from?.lat,
                  lon: leg.from?.lon,
                },
                to: {
                  name: leg.to?.name || "Unknown",
                  lat: leg.to?.lat,
                  lon: leg.to?.lon,
                },
                distance: leg.distance,
                duration: leg.duration,
                steps: leg.steps || [],
              })) || [],
          },
        };
        return res.json(transformed);
      }
    } catch (otpError) {
      console.log(
        "OTP not available, using fallback calculation:",
        otpError instanceof Error ? otpError.message : String(otpError),
      );
      
      // Calculate straight-line distance as fallback (only when needed)
      const distance = calculateHaversineDistance(from, to);
      const estimatedDuration = Math.round((distance / 40) * 60); // Assume 40 km/h average speed

    // Fallback: Use straight-line distance calculation
    const transformed = {
      success: true,
      route: {
        duration: estimatedDuration * 60, // Convert to seconds
        durationMinutes: estimatedDuration,
        distance: distance * 1000, // Convert to meters
        distanceKm: Math.round(distance * 10) / 10,
        startTime: new Date().toLocaleString("en-IN"),
        endTime: new Date(
          Date.now() + estimatedDuration * 60000,
        ).toLocaleString("en-IN"),
        legs: [
          {
            mode: mode.toLowerCase(),
            from: {
              name: "Start Point",
              lat: from.lat,
              lon: from.lon,
            },
            to: {
              name: "End Point",
              lat: to.lat,
              lon: to.lon,
            },
            distance: distance * 1000,
            duration: estimatedDuration * 60,
            steps: [],
          },
        ],
        fallback: true,
        note: "Using estimated distance calculation (OTP service not available)",
      },
    };

    return res.json(transformed);
    }

    // This should never be reached as we either return from the try block
    // or from the catch block, but TypeScript doesn't know that
    res.status(500).json({ error: "Unexpected route planning error" });
  } catch (error: any) {
    console.error("Routing error:", error.message);

    res.status(500).json({
      error: "Failed to plan route",
      details: error.message,
    });
  }
});

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateHaversineDistance(
  point1: { lat: number; lon: number },
  point2: { lat: number; lon: number },
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
  const dLon = ((point2.lon - point1.lon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((point1.lat * Math.PI) / 180) *
      Math.cos((point2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Get estimated travel time between two points
 */
router.post("/time", async (req, res) => {
  try {
    const { from, to, mode = "CAR" } = req.body;

    if (!from || !to) {
      return res.status(400).json({
        error: "from and to coordinates are required",
      });
    }

    // Try OTP first
    try {
      const params = new URLSearchParams({
        fromPlace: `${from.lat},${from.lon}`,
        toPlace: `${to.lat},${to.lon}`,
        mode,
        numItineraries: "1",
      });

      const response = await axios.get(
        `${OTP_BASE_URL}/otp/routers/default/plan?${params}`,
        { timeout: 5000 },
      );

      if (response.data?.plan?.itineraries?.[0]) {
        const itinerary = response.data.plan.itineraries[0];
        return res.json({
          success: true,
          timeMinutes: Math.round(itinerary.duration / 60),
          distanceKm:
            Math.round(
              ((itinerary.walkDistance + (itinerary.transitDistance || 0)) /
                1000) *
                10,
            ) / 10,
          otpUsed: true,
        });
      }
    } catch (otpError) {
      console.log(
        "OTP not available for time estimation, using fallback:",
        otpError instanceof Error ? otpError.message : String(otpError),
      );
      
      // Calculate distance using Haversine formula (only when needed)
      const distance = calculateHaversineDistance(from, to);
      const estimatedTimeMinutes = Math.round((distance / 40) * 60); // Assume 40 km/h average speed

    // Fallback calculation
      return res.json({
      success: true,
      timeMinutes: estimatedTimeMinutes,
      distanceKm: Math.round(distance * 10) / 10,
      otpUsed: false,
      fallback: true,
      note: "Using estimated calculation (OTP service not available)",
    });
    }
    
    // This should never be reached as we either return from the try block
    // or from the catch block, but TypeScript doesn't know that
    return res.status(500).json({ error: "Unexpected time estimation error" });
  } catch (error: any) {
    console.error("Time estimation error:", error.message);
    res.status(500).json({
      error: "Failed to estimate travel time",
      details: error.message,
    });
  }
});

/**
 * Health check for OTP service
 */
router.get("/health", async (req, res) => {
  try {
    const response = await axios.get(`${OTP_BASE_URL}/otp/routers/default`, {
      timeout: 3000,
    });
    res.json({
      status: "ok",
      otpConnected: true,
      router: "default",
    });
  } catch (error: any) {
    res.status(503).json({
      status: "error",
      otpConnected: false,
      error: error.message,
    });
  }
});

export { router as otpRouter };
