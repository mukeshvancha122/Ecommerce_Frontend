/**
 * Intelligent search utilities
 * Maps keywords to categories and provides related product suggestions
 */

// Keyword to category mapping for intelligent search
const KEYWORD_TO_CATEGORY = {
  // Footwear
  shoe: ['footwear', 'shoes', 'sneakers', 'boots'],
  shoes: ['footwear', 'shoes', 'sneakers', 'boots'],
  sneaker: ['footwear', 'shoes', 'sneakers'],
  sneakers: ['footwear', 'shoes', 'sneakers'],
  boot: ['footwear', 'shoes', 'boots'],
  boots: ['footwear', 'shoes', 'boots'],
  sandal: ['footwear', 'shoes', 'sandals'],
  sandals: ['footwear', 'shoes', 'sandals'],
  
  // Clothing
  dress: ['clothing', 'fashion', 'womens-clothing', 'mens-clothing'],
  dresses: ['clothing', 'fashion', 'womens-clothing'],
  shirt: ['clothing', 'mens-clothing', 'fashion'],
  shirts: ['clothing', 'mens-clothing', 'fashion'],
  tshirt: ['clothing', 'mens-clothing', 'fashion'],
  tshirts: ['clothing', 'mens-clothing', 'fashion'],
  jeans: ['clothing', 'mens-clothing', 'womens-clothing', 'fashion'],
  pant: ['clothing', 'mens-clothing', 'womens-clothing', 'fashion'],
  pants: ['clothing', 'mens-clothing', 'womens-clothing', 'fashion'],
  trouser: ['clothing', 'mens-clothing', 'fashion'],
  trousers: ['clothing', 'mens-clothing', 'fashion'],
  
  // Fitness/Gym
  dumbell: ['sports-fitness', 'fitness', 'gym', 'sports'],
  dumbbell: ['sports-fitness', 'fitness', 'gym', 'sports'],
  dumbbells: ['sports-fitness', 'fitness', 'gym', 'sports'],
  gym: ['sports-fitness', 'fitness', 'sports'],
  fitness: ['sports-fitness', 'fitness', 'sports'],
  workout: ['sports-fitness', 'fitness', 'sports'],
  exercise: ['sports-fitness', 'fitness', 'sports'],
  weights: ['sports-fitness', 'fitness', 'gym', 'sports'],
  barbell: ['sports-fitness', 'fitness', 'gym', 'sports'],
  
  // Electronics
  phone: ['smartphones', 'electronics', 'mobile'],
  smartphone: ['smartphones', 'electronics', 'mobile'],
  mobile: ['smartphones', 'electronics', 'mobile'],
  laptop: ['laptops-computers', 'electronics', 'computers'],
  computer: ['laptops-computers', 'electronics', 'computers'],
  tablet: ['electronics', 'tablets'],
  headphone: ['electronics', 'audio', 'headphones'],
  headphones: ['electronics', 'audio', 'headphones'],
  
  // Home & Kitchen
  kitchen: ['home-kitchen', 'kitchen', 'home'],
  cookware: ['home-kitchen', 'kitchen'],
  appliance: ['home-kitchen', 'kitchen', 'home'],
  furniture: ['home-kitchen', 'home'],
  
  // Beauty
  makeup: ['beauty', 'cosmetics'],
  cosmetic: ['beauty', 'cosmetics'],
  perfume: ['beauty', 'fragrance'],
  fragrance: ['beauty', 'fragrance'],
};

// Category relationships for related products
const RELATED_CATEGORIES = {
  'footwear': ['sports-fitness', 'fashion', 'mens-clothing', 'womens-clothing'],
  'shoes': ['sports-fitness', 'fashion', 'mens-clothing', 'womens-clothing'],
  'clothing': ['fashion', 'mens-clothing', 'womens-clothing', 'footwear'],
  'fashion': ['mens-clothing', 'womens-clothing', 'footwear', 'jewelry'],
  'sports-fitness': ['fitness', 'gym', 'sports', 'footwear'],
  'fitness': ['sports-fitness', 'gym', 'sports'],
  'gym': ['sports-fitness', 'fitness', 'sports'],
  'smartphones': ['electronics', 'mobile', 'accessories'],
  'electronics': ['smartphones', 'laptops-computers', 'audio'],
  'laptops-computers': ['electronics', 'computers', 'accessories'],
  'home-kitchen': ['home', 'kitchen', 'appliances'],
  'beauty': ['cosmetics', 'fragrance', 'personal-care'],
};

/**
 * Extract keywords from search query
 * @param {string} query - Search query
 * @returns {Array<string>} Array of keywords
 */
export const extractKeywords = (query) => {
  if (!query) return [];
  const normalized = query.toLowerCase().trim();
  const words = normalized.split(/\s+/);
  return words.filter(word => word.length > 2);
};

/**
 * Find matching categories for a search query
 * @param {string} query - Search query
 * @returns {Array<string>} Array of category slugs/names
 */
export const findCategoriesForQuery = (query) => {
  if (!query) return [];
  
  const keywords = extractKeywords(query);
  const matchedCategories = new Set();
  
  keywords.forEach(keyword => {
    const categories = KEYWORD_TO_CATEGORY[keyword.toLowerCase()];
    if (categories) {
      categories.forEach(cat => matchedCategories.add(cat));
    }
  });
  
  return Array.from(matchedCategories);
};

/**
 * Get related categories for fallback search
 * @param {string} category - Category slug/name
 * @returns {Array<string>} Array of related category slugs/names
 */
export const getRelatedCategories = (category) => {
  if (!category) return [];
  return RELATED_CATEGORIES[category.toLowerCase()] || [];
};

/**
 * Intelligent search strategy
 * 1. Try exact search
 * 2. If no results, try category-based search
 * 3. If still no results, try related categories
 * @param {string} query - Search query
 * @param {string} selectedCategory - Selected category from dropdown
 * @returns {Object} Search strategy with category suggestions
 */
export const getIntelligentSearchStrategy = (query, selectedCategory = "all") => {
  const keywords = extractKeywords(query);
  const queryLower = query.toLowerCase().trim();
  
  // Strategy 1: Use selected category if not "all"
  if (selectedCategory !== "all") {
    return {
      primaryCategory: selectedCategory,
      fallbackCategories: getRelatedCategories(selectedCategory),
      searchType: 'category',
    };
  }
  
  // Strategy 2: Find categories from keywords
  const keywordCategories = findCategoriesForQuery(query);
  if (keywordCategories.length > 0) {
    return {
      primaryCategory: keywordCategories[0],
      fallbackCategories: [
        ...keywordCategories.slice(1),
        ...getRelatedCategories(keywordCategories[0]),
      ],
      searchType: 'keyword-category',
    };
  }
  
  // Strategy 3: Default to broad search
  return {
    primaryCategory: null,
    fallbackCategories: [],
    searchType: 'broad',
  };
};

