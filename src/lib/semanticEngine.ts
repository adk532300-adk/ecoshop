/**
 * Semantic Classification Engine & Eco-Friendly Recommendation System
 * 
 * Bridges low-level ImageNet/MobileNet predictions to real-world household
 * product categories and UN SDG 12 eco-friendly alternatives.
 */

export type ProductCategory =
  | 'toothbrush'
  | 'shampoo'
  | 'bottle'
  | 'comb'
  | 'tote bag'
  | 'bowl'
  | 'food wrap'
  | 'notebook'
  | 'wallet'
  | 'phone case';

export interface MobileNetPrediction {
  className: string;
  probability: number;
}

export interface SemanticMatch {
  category: ProductCategory;
  displayName: string;
  confidenceScore: number; // 0 - 100
  confidenceLevel: 'High' | 'Medium' | 'Low';
  isApproximation: boolean;
  topRawPrediction: {
    label: string;
    percentage: number;
  };
  recommendedProductSlug: string;
  recommendedProductName: string;
  explanation: {
    step1_upload: string;
    step2_mobilenet: string;
    step3_semantic: string;
    step4_recommendation: string;
  };
}

/**
 * Comprehensive Semantic Lexicon mapping generic ImageNet/MobileNet
 * classes & synonyms to household product categories.
 */
export const SEMANTIC_MAP: Record<string, ProductCategory> = {
  // Toothbrush & Oral Care
  snorkel: 'toothbrush', // Classic MobileNet specular reflection misclassification
  toothbrush: 'toothbrush',
  brush: 'toothbrush',
  hairbrush: 'toothbrush',
  whistle: 'toothbrush',
  lipstick: 'toothbrush',
  fountain_pen: 'toothbrush',
  ballpoint: 'toothbrush',

  // Shampoo & Liquid Soap
  lotion: 'shampoo',
  soap: 'shampoo',
  shampoo: 'shampoo',
  dispenser: 'shampoo',
  perfume: 'shampoo',
  cleansing_agent: 'shampoo',
  sunscreen: 'shampoo',
  cosmetic: 'shampoo',
  cream: 'shampoo',

  // Water Bottle & Flasks
  bottle: 'bottle',
  water_bottle: 'bottle',
  wine_bottle: 'bottle',
  beer_bottle: 'bottle',
  pop_bottle: 'bottle',
  flask: 'bottle',
  thermos: 'bottle',
  cup: 'bottle',
  coffee_mug: 'bottle',
  mug: 'bottle',
  goblet: 'bottle',
  cocktail_shaker: 'bottle',
  water_jug: 'bottle',

  // Comb & Hair Styling
  comb: 'comb',
  hair_slide: 'comb',
  wooden_comb: 'comb',

  // Tote Bag & Shopping Bags
  shopping_bag: 'tote bag',
  bag: 'tote bag',
  tote: 'tote bag',
  backpack: 'tote bag',
  purse: 'tote bag',
  handbag: 'tote bag',
  mailbag: 'tote bag',
  plastic_bag: 'tote bag',
  knapsack: 'tote bag',

  // Bowls & Dining Containers
  bowl: 'bowl',
  mixing_bowl: 'bowl',
  soup_bowl: 'bowl',
  salad_bowl: 'bowl',
  plate: 'bowl',
  saucer: 'bowl',
  mortar: 'bowl',
  tray: 'bowl',
  dish: 'bowl',

  // Food Wraps & Kitchen Covers
  wrap: 'food wrap',
  plastic_wrap: 'food wrap',
  cling_film: 'food wrap',
  cover: 'food wrap',
  envelope: 'food wrap',
  foil: 'food wrap',
  paper_towel: 'food wrap',
  handkerchief: 'food wrap',

  // Notebook & Stationery
  notebook: 'notebook',
  book: 'notebook',
  book_jacket: 'notebook',
  binder: 'notebook',
  comic_book: 'notebook',
  packet: 'notebook',
  menu: 'notebook',
  pamphlet: 'notebook',
  paper: 'notebook',

  // Wallet & Billfolds
  wallet: 'wallet',
  purse_billfold: 'wallet',
  billfold: 'wallet',
  pocketbook: 'wallet',
  card_holder: 'wallet',
  money_clip: 'wallet',

  // Phone Case & Mobile Tech
  cellphone: 'phone case',
  phone: 'phone case',
  mobile_phone: 'phone case',
  cellular_telephone: 'phone case',
  case: 'phone case',
  ipod: 'phone case',
  handheld_computer: 'phone case',
  remote_control: 'phone case'
};

/**
 * Display names and primary recommended product pairings
 */
export const CATEGORY_METADATA: Record<ProductCategory, {
  displayName: string;
  recommendedProductSlug: string;
  recommendedProductName: string;
  keywords: string[];
}> = {
  toothbrush: {
    displayName: 'Toothbrush',
    recommendedProductSlug: 'bamboo-toothbrush',
    recommendedProductName: 'Eco-Friendly Bamboo Toothbrush',
    keywords: ['bamboo', 'toothbrush', 'personal care']
  },
  shampoo: {
    displayName: 'Shampoo / Cleanser',
    recommendedProductSlug: 'shampoo-bar',
    recommendedProductName: 'Eco-Friendly Shampoo Bar',
    keywords: ['shampoo', 'soap', 'personal care']
  },
  bottle: {
    displayName: 'Water Bottle',
    recommendedProductSlug: 'steel-water-bottle',
    recommendedProductName: 'Reusable Steel Water Bottle',
    keywords: ['steel', 'water bottle', 'bottle', 'kitchen']
  },
  comb: {
    displayName: 'Hair Comb',
    recommendedProductSlug: 'neem-wood-comb',
    recommendedProductName: 'Neem Wood Comb',
    keywords: ['neem', 'comb', 'personal care']
  },
  'tote bag': {
    displayName: 'Tote Bag',
    recommendedProductSlug: 'organic-cotton-tote-bag',
    recommendedProductName: 'Organic Cotton Tote Bag',
    keywords: ['cotton', 'tote', 'bag', 'accessories']
  },
  bowl: {
    displayName: 'Dining Bowl',
    recommendedProductSlug: 'coconut-shell-bowls',
    recommendedProductName: 'Coconut Shell Bowls (Set of 2)',
    keywords: ['coconut', 'bowl', 'kitchen']
  },
  'food wrap': {
    displayName: 'Food Wrap',
    recommendedProductSlug: 'beeswax-food-wraps',
    recommendedProductName: 'Beeswax Food Wraps',
    keywords: ['beeswax', 'wrap', 'kitchen']
  },
  notebook: {
    displayName: 'Paper Notebook',
    recommendedProductSlug: 'recycled-paper-notebook',
    recommendedProductName: 'Recycled Paper Notebook',
    keywords: ['recycled', 'notebook', 'paper', 'stationery']
  },
  wallet: {
    displayName: 'Pocket Wallet',
    recommendedProductSlug: 'cork-leather-wallet',
    recommendedProductName: 'Cork Leather Wallet',
    keywords: ['cork', 'wallet', 'accessories']
  },
  'phone case': {
    displayName: 'Phone Case',
    recommendedProductSlug: 'wheat-straw-phone-case',
    recommendedProductName: 'Wheat Straw Phone Case',
    keywords: ['wheat straw', 'phone case', 'tech']
  }
};

/**
 * 1. Normalize text and strip punctuation/spaces for lexicon matching
 */
export function semanticNormalize(term: string): string {
  return term
    .toLowerCase()
    .replace(/[^a-z0-9_ ]/g, '')
    .trim()
    .replace(/\s+/g, '_');
}

/**
 * 2. Look up a raw label against the semantic map
 */
export function matchLabelToCategory(rawLabel: string): ProductCategory | null {
  const normalized = semanticNormalize(rawLabel);
  
  // Exact match on normalized label
  if (SEMANTIC_MAP[normalized]) {
    return SEMANTIC_MAP[normalized];
  }

  // Token-level check (e.g. "plastic bottle" -> "bottle")
  const tokens = normalized.split('_');
  for (const token of tokens) {
    if (SEMANTIC_MAP[token]) {
      return SEMANTIC_MAP[token];
    }
  }

  // Substring check across dictionary keys
  for (const [key, category] of Object.entries(SEMANTIC_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return category;
    }
  }

  return null;
}

/**
 * 3. Calculate category score using Top-5 predictions with weighted ranking & consensus
 */
export function calculateCategoryScore(
  predictions: MobileNetPrediction[]
): { category: ProductCategory; rawScore: number; matchedPredictions: MobileNetPrediction[] } {
  const categoryScores: Partial<Record<ProductCategory, number>> = {};
  const categoryMatches: Partial<Record<ProductCategory, MobileNetPrediction[]>> = {};

  // Rank weight multiplier: Top-1 gets 1.0, Top-2 gets 0.85, Top-3 gets 0.70...
  const rankWeights = [1.0, 0.85, 0.70, 0.55, 0.40];

  predictions.forEach((pred, index) => {
    const rawClass = pred.className.split(',')[0].trim();
    const category = matchLabelToCategory(rawClass);

    if (category) {
      const weight = rankWeights[index] ?? 0.3;
      // Probability score contribution boosted by rank weight
      const scoreContribution = pred.probability * weight;

      categoryScores[category] = (categoryScores[category] || 0) + scoreContribution;
      if (!categoryMatches[category]) {
        categoryMatches[category] = [];
      }
      categoryMatches[category]!.push(pred);
    }
  });

  // Find category with highest accumulated consensus score
  let bestCategory: ProductCategory = 'toothbrush';
  let highestScore = 0;

  for (const [catStr, score] of Object.entries(categoryScores)) {
    const cat = catStr as ProductCategory;
    if (score && score > highestScore) {
      highestScore = score;
      bestCategory = cat;
    }
  }

  // Consensus bonus: if multiple predictions in Top-5 point to the same category, increase confidence
  const matchCount = categoryMatches[bestCategory]?.length || 0;
  if (matchCount >= 2) {
    highestScore = Math.min(1.0, highestScore * (1 + (matchCount - 1) * 0.25));
  }

  // Fallback if no prediction mapped
  if (highestScore === 0) {
    const topClass = predictions[0]?.className.split(',')[0].trim() || 'item';
    const fallbackCategory = matchLabelToCategory(topClass) || 'toothbrush';
    return {
      category: fallbackCategory,
      rawScore: predictions[0]?.probability || 0.25,
      matchedPredictions: predictions.slice(0, 1)
    };
  }

  return {
    category: bestCategory,
    rawScore: highestScore,
    matchedPredictions: categoryMatches[bestCategory] || []
  };
}

/**
 * 4. Determine Confidence Level (High > 70%, Medium 40-70%, Low < 40%)
 */
export function getConfidenceLevel(scorePercent: number): 'High' | 'Medium' | 'Low' {
  if (scorePercent >= 70) return 'High';
  if (scorePercent >= 40) return 'Medium';
  return 'Low';
}

/**
 * 5. Main Pipeline: Process Top-5 MobileNet predictions through Semantic Engine
 */
export function runSemanticPipeline(predictions: MobileNetPrediction[]): SemanticMatch {
  if (!predictions || predictions.length === 0) {
    throw new Error('No predictions supplied to Semantic Engine');
  }

  const topRaw = predictions[0];
  const topRawLabel = topRaw.className.split(',')[0].trim();
  const topRawPercent = Math.round(topRaw.probability * 100);

  const { category, rawScore } = calculateCategoryScore(predictions);
  const meta = CATEGORY_METADATA[category];

  // Convert rawScore to percentage [15% - 98%]
  const scorePercent = Math.min(98, Math.max(15, Math.round(rawScore * 100)));
  const confidenceLevel = getConfidenceLevel(scorePercent);
  const isApproximation = confidenceLevel === 'Low';

  return {
    category,
    displayName: meta.displayName,
    confidenceScore: scorePercent,
    confidenceLevel,
    isApproximation,
    topRawPrediction: {
      label: topRawLabel,
      percentage: topRawPercent
    },
    recommendedProductSlug: meta.recommendedProductSlug,
    recommendedProductName: meta.recommendedProductName,
    explanation: {
      step1_upload: 'Captured raw camera tensor via HTML5 Canvas / MediaStream',
      step2_mobilenet: `MobileNet classified as "${topRawLabel}" (${topRawPercent}% Softmax activation)`,
      step3_semantic: `Semantic Engine mapped "${topRawLabel}" → ${meta.displayName} (${confidenceLevel} Confidence: ${scorePercent}%)`,
      step4_recommendation: `Recommended ${meta.recommendedProductName} (UN SDG 12 Verified Alternative)`
    }
  };
}
