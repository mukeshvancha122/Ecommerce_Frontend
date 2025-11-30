/**
 * Utility functions for managing recent searches
 */

const STORAGE_KEY = 'recentSearches_v1';
const MAX_RECENT_SEARCHES = 10;

/**
 * Get recent searches from localStorage
 * @returns {Array<string>} Array of recent search queries
 */
export const getRecentSearches = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (error) {
    console.error("Error reading recent searches:", error);
  }
  return [];
};

/**
 * Add a search query to recent searches
 * @param {string} query - Search query to add
 */
export const addRecentSearch = (query) => {
  if (!query || !query.trim()) return;
  
  try {
    const recent = getRecentSearches();
    const normalizedQuery = query.trim();
    
    // Remove if already exists (to move to top)
    const filtered = recent.filter(q => q.toLowerCase() !== normalizedQuery.toLowerCase());
    
    // Add to beginning
    const updated = [normalizedQuery, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Error saving recent search:", error);
  }
};

/**
 * Clear all recent searches
 */
export const clearRecentSearches = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing recent searches:", error);
  }
};

/**
 * Remove a specific search from recent searches
 * @param {string} query - Search query to remove
 */
export const removeRecentSearch = (query) => {
  try {
    const recent = getRecentSearches();
    const filtered = recent.filter(q => q.toLowerCase() !== query.toLowerCase());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error removing recent search:", error);
  }
};

