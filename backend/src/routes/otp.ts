import express from 'express';
import axios from 'axios';

const router = express.Router();

// OpenTripPlanner base URL (standalone server)
const OTP_BASE_URL = process.env.OTP_URL || 'http://localhost:8082';

/**
 * Plan a route between two points for carpooling
 */
router.post('/plan', async (req, res) => {
  try {
    const {
      from,
      to,
      mode = 'CAR',
      date,
      time,
      arriveBy = false
    } = req.body;

    // Validate required fields
    if (!from || !to) {
      return res.status(400).json({
        error: 'from and to coordinates are required'
      });
    }

    // Build OTP query parameters
    const params = new URLSearchParams({
      fromPlace: `${from.lat},${from.lon}`,
      toPlace: `${to.lat},${to.lon}`,
      mode,
      date: date || new Date().toISOString().split('T')[0],
      time: time || '08:00:00',
      arriveBy: arriveBy.toString(),
      numItineraries: '1', // Keep it simple for MVP
      locale: 'en'
    });

    console.log(`Planning route: ${from.lat},${from.lon} -> ${to.lat},${to.lon}`);

    // Call OpenTripPlanner
    const response = await axios.get(
      `${OTP_BASE_URL}/otp/routers/default/plan?${params}`,
      { timeout: 10000 }
    );

    if (!response.data || !response.data.plan || !response.data.plan.itineraries) {
      return res.status(404).json({
        error: 'No route found between these locations'
      });
    }

    // Transform response for frontend
    const itinerary = response.data.plan.itineraries[0];
    if (!itinerary) {
      return res.status(404).json({
        error: 'No route found between these locations'
      });
    }

    const transformed = {
      success: true,
      route: {
        duration: itinerary.duration,
        durationMinutes: Math.round(itinerary.duration / 60),
        distance: itinerary.walkDistance + (itinerary.transitDistance || 0),
        distanceKm: Math.round((itinerary.walkDistance + (itinerary.transitDistance || 0)) / 1000 * 10) / 10,
        startTime: new Date(itinerary.startTime).toLocaleString('en-IN'),
        endTime: new Date(itinerary.endTime).toLocaleString('en-IN'),
        legs: itinerary.legs?.map((leg: any) => ({
          mode: leg.mode,
          from: {
            name: leg.from?.name || 'Unknown',
            lat: leg.from?.lat,
            lon: leg.from?.lon
          },
          to: {
            name: leg.to?.name || 'Unknown',
            lat: leg.to?.lat,
            lon: leg.to?.lon
          },
          distance: leg.distance,
          duration: leg.duration,
          steps: leg.steps || []
        })) || []
      }
    };

    res.json(transformed);
  } catch (error: any) {
    console.error('OTP routing error:', error.message);

    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'Route planning service is not available',
        details: 'OpenTripPlanner is not running'
      });
    }

    if (error.response?.status === 404) {
      return res.status(404).json({
        error: 'No route found between these locations'
      });
    }

    res.status(500).json({
      error: 'Failed to plan route',
      details: error.response?.data?.message || error.message
    });
  }
});

/**
 * Get estimated travel time between two points
 */
router.post('/time', async (req, res) => {
  try {
    const { from, to, mode = 'CAR' } = req.body;

    if (!from || !to) {
      return res.status(400).json({
        error: 'from and to coordinates are required'
      });
    }

    // Build OTP query for time estimation
    const params = new URLSearchParams({
      fromPlace: `${from.lat},${from.lon}`,
      toPlace: `${to.lat},${to.lon}`,
      mode,
      numItineraries: '1'
    });

    const response = await axios.get(
      `${OTP_BASE_URL}/otp/routers/default/plan?${params}`,
      { timeout: 5000 }
    );

    if (response.data?.plan?.itineraries?.[0]) {
      const itinerary = response.data.plan.itineraries[0];
      res.json({
        success: true,
        timeMinutes: Math.round(itinerary.duration / 60),
        distanceKm: Math.round((itinerary.walkDistance + (itinerary.transitDistance || 0)) / 1000 * 10) / 10
      });
    } else {
      res.status(404).json({
        error: 'No route found between these locations'
      });
    }
  } catch (error: any) {
    console.error('OTP time estimation error:', error.message);
    res.status(500).json({
      error: 'Failed to estimate travel time',
      details: error.message
    });
  }
});

/**
 * Health check for OTP service
 */
router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${OTP_BASE_URL}/otp/routers/default`, { timeout: 3000 });
    res.json({
      status: 'ok',
      otpConnected: true,
      router: 'default'
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'error',
      otpConnected: false,
      error: error.message
    });
  }
});

export { router as otpRouter };

