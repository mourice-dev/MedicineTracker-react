import { Router } from "express";
import { query } from "../config/db.js";

const router = Router();

const CITY_FALLBACKS = {
  Kigali: { lat: -1.9441, lng: 30.0619 },
  Musanze: { lat: -1.4996, lng: 29.6344 },
  Huye: { lat: -2.5967, lng: 29.7394 },
};

function toRad(value) {
  return (value * Math.PI) / 180;
}

function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toNumber(input) {
  const value = Number(input);
  return Number.isFinite(value) ? value : null;
}

router.get("/cities", async (_req, res, next) => {
  try {
    const rows = await query("SELECT DISTINCT city FROM pharmacies ORDER BY city ASC");
    return res.json(rows.map((r) => r.city));
  } catch (error) {
    return next(error);
  }
});

router.get("/pharmacies", async (req, res, next) => {
  try {
    const { city } = req.query;
    let sql = "SELECT id, name, city, address, phone, latitude, longitude FROM pharmacies";
    const params = {};

    if (city) {
      sql += " WHERE city = :city";
      params.city = city;
    }

    sql += " ORDER BY city, name";

    const rows = await query(sql, params);
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
});

router.get("/search", async (req, res, next) => {
  try {
    const medicine = String(req.query.medicine || "").trim();
    const city = String(req.query.city || "").trim();
    const limit = Math.max(1, Math.min(25, Number(req.query.limit || 10)));

    if (!medicine) {
      return res.status(400).json({ message: "medicine query is required" });
    }

    let sql = `
      SELECT
        p.id AS pharmacy_id,
        p.name AS pharmacy_name,
        p.city,
        p.address,
        p.phone,
        p.latitude,
        p.longitude,
        m.id AS medicine_id,
        m.name AS medicine_name,
        m.description AS medicine_description,
        i.stock,
        i.price
      FROM pharmacy_inventory i
      JOIN pharmacies p ON p.id = i.pharmacy_id
      JOIN medicines m ON m.id = i.medicine_id
      WHERE i.stock > 0
        AND LOWER(m.name) LIKE LOWER(:medicine)
    `;

    const params = { medicine: `%${medicine}%` };

    if (city) {
      sql += " AND p.city = :city";
      params.city = city;
    }

    const rows = await query(sql, params);

    if (!rows.length) {
      return res.json({
        medicine,
        city: city || null,
        userLocation: null,
        nearestMedicine: null,
        results: [],
      });
    }

    let userLat = toNumber(req.query.lat);
    let userLng = toNumber(req.query.lng);
    let source = "geolocation";

    if (userLat === null || userLng === null) {
      source = "city";
      const cityFromData = city || rows[0].city;
      const fallback = CITY_FALLBACKS[cityFromData] || null;

      if (fallback) {
        userLat = fallback.lat;
        userLng = fallback.lng;
      } else {
        const avgLat = rows.reduce((acc, item) => acc + Number(item.latitude), 0) / rows.length;
        const avgLng = rows.reduce((acc, item) => acc + Number(item.longitude), 0) / rows.length;
        userLat = avgLat;
        userLng = avgLng;
      }
    }

    const withDistance = rows.map((item) => {
      const distance = distanceKm(userLat, userLng, Number(item.latitude), Number(item.longitude));
      return {
        ...item,
        distance_km: Number(distance.toFixed(2)),
      };
    });

    withDistance.sort((a, b) => {
      if (a.distance_km !== b.distance_km) return a.distance_km - b.distance_km;
      return b.stock - a.stock;
    });

    const results = withDistance.slice(0, limit);

    return res.json({
      medicine,
      city: city || null,
      userLocation: { lat: userLat, lng: userLng, source },
      nearestMedicine: results[0] || null,
      results,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
