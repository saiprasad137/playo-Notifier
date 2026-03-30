require('dotenv').config();
const { fetchNewGames } = require('./playo');
const { sendNotification } = require('./notifier');
const { getSeenIds, markAsSeen } = require('./store');

async function checkForNewGames() {
 console.log(`[${new Date().toISOString()}] Checking for new badminton games...`);

 try {
 const games = await fetchNewGames();
 const seenIds = getSeenIds();

 const newGames = games.filter(g => g.id && !seenIds.has(String(g.id)));

 if (newGames.length > 0) {
 console.log(`Found ${newGames.length} new game(s)! Sending email...`);
 await sendNotification(newGames);
 newGames.forEach(g => markAsSeen(String(g.id)));
 } else {
 console.log(`No new games found (checked ${games.length} total nearby games).`);
 }
 } catch (err) {
 console.error('Error during check:', err.message);
 if (err.response) {
 console.error('API response status:', err.response.status);
 console.error('API response body:', JSON.stringify(err.response.data, null, 2));
 }
 process.exit(1);
 }
}

checkForNewGames();