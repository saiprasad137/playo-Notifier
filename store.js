/**
 * Persists seen game IDs to a local JSON file so we don't
 * re-notify for the same game across restarts.
 */
const fs = require('fs');
const path = require('path');

const STORE_FILE = path.join(__dirname, 'seen-games.json');

function load() {
  if (!fs.existsSync(STORE_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function save(ids) {
  fs.writeFileSync(STORE_FILE, JSON.stringify(ids, null, 2));
}

function getSeenIds() {
  return new Set(load());
}

function markAsSeen(id) {
  const ids = load();
  if (!ids.includes(id)) {
    ids.push(id);
    // Keep only the last 500 to prevent unbounded growth
    const trimmed = ids.slice(-500);
    save(trimmed);
  }
}

module.exports = { getSeenIds, markAsSeen };
