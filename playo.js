/**
 * Playo API client
 *
 * HOW TO FIND YOUR API ENDPOINT (one-time setup):
 * ------------------------------------------------
 * 1. Open https://playo.co in Chrome
 * 2. Open DevTools → Network tab → filter by "Fetch/XHR"
 * 3. Search for badminton games near you
 * 4. Look for a request that returns a list of activities/games
 * 5. Copy:
 *    - The full Request URL (paste into PLAYO_API_URL in .env)
 *    - The "Cookie" or "Authorization" header value (paste into PLAYO_AUTH_HEADER in .env)
 * 6. The response JSON will show you the field names — update
 *    the extractGames() function below to match them.
 */
const axios = require('axios');
const { isPointWithinRadius } = require('geolib');
const config = require('./config');

const API_URL = process.env.PLAYO_API_URL;

async function fetchNewGames() {
  if (!API_URL) {
    throw new Error('PLAYO_API_URL is not set in .env — see playo.js for setup instructions.');
  }

  const response = await axios.post(API_URL, {
    lat: config.MY_LAT,
    lng: config.MY_LNG,
    cityRadius: 50,
    gameTimeActivities: false,
    page: 0,
    lastId: '',
    sportId: ['SP5'],
    booking: false,
  }, {
    headers: {
      'content-type': 'application/json',
      'devicetype': '99',
    },
  });

  const raw = response.data;
  return extractGames(raw);
}

/**
 * Parse the API response into a normalized list of games.
 * UPDATE THESE FIELD NAMES to match what you see in the actual API response.
 *
 * Each returned object must have at minimum: { id, title, venueName, lat, lng, date, url }
 */
function extractGames(raw) {
  // Common patterns — adjust based on actual response shape:
  const list = raw.data?.activities || raw.data || raw.activities || raw.games || raw.result || raw || [];

  return list
    .map(item => ({
      id: item.id || item._id || item.activityId,
      title: item.title || item.name || item.sportName || 'Badminton',
      venueName: item.venue?.name || item.venueName || item.venue || 'Unknown Venue',
      lat: parseFloat(item.venue?.lat || item.lat || item.latitude || 0),
      lng: parseFloat(item.venue?.lng || item.lng || item.longitude || 0),
      date: item.startTime || item.date || item.scheduledAt,
      rawDate: item.date,
      spotsLeft: item.spotsLeft || item.availableSpots || item.slotsAvailable || '?',
      price: item.price || item.amount || '?',
      url: item.url || `https://playo.co/activity/${item.id || item._id}`,
    }))
    .filter(game => {
      // Must be a badminton game
      const isBadminton =
        !game.title || game.title.toLowerCase().includes('badminton');

      // Must be within RADIUS_KM of your location
      const isNearby =
        game.lat &&
        game.lng &&
        isPointWithinRadius(
          { latitude: game.lat, longitude: game.lng },
          { latitude: config.MY_LAT, longitude: config.MY_LNG },
          config.RADIUS_KM * 1000 // geolib expects meters
        );

      // Must be today or in the future
      const gameDate = new Date(game.rawDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isFuture = !isNaN(gameDate) && gameDate >= today;

      return isBadminton && isNearby && isFuture;
    });
}

module.exports = { fetchNewGames };
