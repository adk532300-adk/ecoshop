export interface TechnicalSpecs {
  dimensions: string;
  weight: string;
  materialComposition: string;
  biodegradationTime: string;
  carbonOffset: string;
  plasticDiverted: string;
  certifications: string[];
}

export interface ProductDetailsData {
  specs: TechnicalSpecs;
  highlights: string[];
}

export const PRODUCT_SPECS: Record<string, ProductDetailsData> = {
  'bamboo-toothbrush': {
    specs: {
      dimensions: '19.2 cm × 1.4 cm × 1.2 cm',
      weight: '18 grams',
      materialComposition: '100% Organic Moso Bamboo + Castor Oil Polymer Bristles',
      biodegradationTime: '6 Months (Industrial Compost) / 12 Months (Home Soil)',
      carbonOffset: '88g CO₂e per unit vs. plastic brushes',
      plasticDiverted: '24g virgin polypropylene diverted',
      certifications: ['FSC Certified Wood', 'USDA 100% Biobased', 'PETA Cruelty-Free', 'BPA-Free Tested']
    },
    highlights: [
      'Replaces 3-4 commercial plastic toothbrushes per year',
      'Charcoal infused for naturally brighter smile without harsh abrasives',
      'Naturally antibacterial and anti-fungal bamboo grain'
    ]
  },

  'steel-water-bottle': {
    specs: {
      dimensions: '26.5 cm Height × 7.3 cm Diameter',
      weight: '340 grams (empty)',
      materialComposition: '18/8 Food-Grade Stainless Steel (SUS 304)',
      biodegradationTime: 'Infinitely Recyclable Metal Core',
      carbonOffset: '14.2 kg CO₂e saved annually vs. single-use PET bottles',
      plasticDiverted: '1,460 single-use plastic bottles avoided over 5 years',
      certifications: ['FDA Approved', 'LFGB German Food Safety', 'BPA/BPS Free', 'Climate Neutral Certified']
    },
    highlights: [
      '24 Hours Cold / 12 Hours Hot TempShield insulation',
      'Zero condensation: keeps your backpack and desk completely dry',
      'Non-toxic interior coating that never retains odor or flavor'
    ]
  },

  'coconut-shell-bowls': {
    specs: {
      dimensions: '14 cm Diameter × 6.5 cm Depth (Average)',
      weight: '120 grams per bowl',
      materialComposition: '100% Upcycled Discarded Coconut Shells',
      biodegradationTime: '100% Compostable (Home Garden in 8-12 Months)',
      carbonOffset: '350g CO₂e avoided by preventing agricultural crop burning',
      plasticDiverted: 'Replaces plastic/melamine serving dishware',
      certifications: ['Fair Trade Sourced', 'Zero Chemical Leaching', '100% Biodegradable', 'Vegan Certified']
    },
    highlights: [
      'Saves millions of coconut shells from landfill incinerators each year',
      'Handcrafted by artisan communities supporting rural fair-trade livelihoods',
      'Naturally sturdy, leakproof, and wash-friendly with mild soap'
    ]
  },

  'neem-wood-comb': {
    specs: {
      dimensions: '19.5 cm × 5.0 cm × 0.8 cm',
      weight: '45 grams',
      materialComposition: '100% Pure Aged Indian Neem Heartwood',
      biodegradationTime: 'Completely Biodegradable in 3-6 Months',
      carbonOffset: '55g CO₂e per unit',
      plasticDiverted: '40g molded plastic comb diverted',
      certifications: ['Ayurvedic Herbal Certified', 'Cruelty Free', 'Plastic-Free Packaging', 'Zero Microplastics']
    },
    highlights: [
      'Naturally antibacterial and anti-dandruff properties from neem bark',
      'Prevents hair breakage and static frizz during winter seasons',
      'Improves blood circulation with smooth hand-buffed rounded tips'
    ]
  },

  'cork-leather-wallet': {
    specs: {
      dimensions: '11.0 cm × 8.5 cm × 0.8 cm (Folded)',
      weight: '38 grams (Ultra-light)',
      materialComposition: '100% Natural Bark Cork + Organic Cotton Lining',
      biodegradationTime: 'Bark Biodegrades in 24 Months / Recyclable',
      carbonOffset: 'Cork Oak trees absorb 5x more carbon when harvested for bark',
      plasticDiverted: 'Replaces polyurethane/PVC synthetic leathers',
      certifications: ['PETA-Approved Vegan', 'FSC Forest Certified', 'RFID Shield Certified', 'Zero Animal Harm']
    },
    highlights: [
      'Zero trees are cut down — only outer bark is peeled every 9 years',
      'Naturally elastic, puncture-resistant, and flame-retardant',
      'Ultra-lightweight: weighs less than half of animal hide wallets'
    ]
  },

  'wheat-straw-phone-case': {
    specs: {
      dimensions: 'Custom Fit for iPhone & Samsung Models',
      weight: '24 grams',
      materialComposition: '65% Wheat Straw Fiber + 35% Biodegradable PLA/PBAT',
      biodegradationTime: '12-24 Months in Composting Environment',
      carbonOffset: '60g CO₂e per case vs. TPU/silicone plastic cases',
      plasticDiverted: '35g non-recyclable TPU plastic eliminated',
      certifications: ['EN 13432 Compostable Certified', 'BPA/Lead Free', 'RoHS Compliant', 'Military Drop Tested (6ft)']
    },
    highlights: [
      'Drop-tested protection from 6 feet with impact-cushioning edges',
      'Supports fast MagSafe and Qi wireless charging without removal',
      'Transforms farm crop waste that would otherwise be burned into clean tech'
    ]
  },

  'shampoo-bar': {
    specs: {
      dimensions: '6.5 cm Diameter × 2.8 cm Thickness',
      weight: '85 grams (Yields 70-80 washes)',
      materialComposition: 'Sodium Cocoyl Isethionate (Coconut), Argan Oil, Shikakai, Cocoa Butter',
      biodegradationTime: '100% Waterway Safe & Gray-Water Friendly',
      carbonOffset: '420g CO₂e saved per bar by eliminating bottled water transport',
      plasticDiverted: '3 single-use HDPE plastic shampoo bottles eliminated',
      certifications: ['Cruelty-Free Leaping Bunny', 'Sulfate & Paraben Free', 'Reef Safe', 'Vegan Society Approved']
    },
    highlights: [
      'Equivalent to 3 full 250ml bottles of liquid shampoo (80 washes)',
      'TSA carry-on compliant: zero risk of leaks in travel bags',
      '100% soap-free syndet formula: gentle on color-treated hair'
    ]
  },

  'beeswax-food-wraps': {
    specs: {
      dimensions: 'Small (20×20cm), Medium (26×26cm), Large (33×33cm)',
      weight: '90 grams (Set of 3)',
      materialComposition: 'Organic Cotton, Pure Beeswax, Jojoba Oil, Tree Resin',
      biodegradationTime: '100% Backyard Compostable (Takes 2-4 Months)',
      carbonOffset: '120g CO₂e avoided per set',
      plasticDiverted: 'Replaces ~100 meters of cling film / Saran wrap per year',
      certifications: ['Food Safe Grade (FDA & LFGB)', 'GOTS Organic Cotton', 'Cruelty-Free Apiary Sourced', 'Zero PVC']
    },
    highlights: [
      'Replaces over 100 meters of disposable plastic cling wrap per year',
      'Breathable natural barrier keeps vegetables, cheese, and bread fresher',
      'Washable in cold water: re-waxable and fully compostable at end of life'
    ]
  },

  'recycled-paper-notebook': {
    specs: {
      dimensions: 'A5 Size: 21.0 cm × 14.8 cm × 1.6 cm',
      weight: '320 grams',
      materialComposition: '100% Post-Consumer Recycled Paper (100 gsm) + Organic Cotton Bookmark',
      biodegradationTime: '100% Biodegradable & Pulp-Recyclable',
      carbonOffset: '1.2 kg CO₂e saved per notebook vs. virgin wood paper',
      plasticDiverted: 'Zero plastic shrink-wrapping used',
      certifications: ['FSC Recycled 100%', 'Acid-Free Archival Grade', 'Soy Ink Certified', 'EU Ecolabel']
    },
    highlights: [
      '192 pages of smooth, non-bleed 100gsm fountain-pen friendly paper',
      'Opens 180° flat with durable Smythe sewn cotton bookbinding',
      'Zero virgin tree pulp: 100% circular post-consumer recycled paper'
    ]
  },

  'organic-cotton-tote-bag': {
    specs: {
      dimensions: '42 cm Height × 38 cm Width × 10 cm Gusset Depth',
      weight: '160 grams',
      materialComposition: '100% GOTS-Certified Unbleached Organic Cotton (12 oz)',
      biodegradationTime: '100% Biodegradable (5-8 Months in soil)',
      carbonOffset: 'Replaces ~700 single-use plastic grocery bags over its lifetime',
      plasticDiverted: 'Over 4.5 kg of thin-film polyethylene waste prevented',
      certifications: ['GOTS Certified Organic', 'OEKO-TEX Standard 100', 'Fairtrade Cotton', 'Zero Toxic Bleach']
    },
    highlights: [
      'Washable and pre-shrunk: machine wash cold and air dry',
      'Supports 20 kg payload for heavy groceries, laptops, and books',
      'Comes with plantable wildflower seed hangtag'
    ]
  }
};

// Aliases for slug flexibility
PRODUCT_SPECS['neem-comb'] = PRODUCT_SPECS['neem-wood-comb'];

export function getProductSpecs(slug: string): ProductDetailsData {
  if (PRODUCT_SPECS[slug]) {
    return PRODUCT_SPECS[slug];
  }

  return {
    specs: {
      dimensions: 'Standard Eco Size',
      weight: 'Lightweight & Ergonomic',
      materialComposition: '100% Natural & Biodegradable',
      biodegradationTime: 'Fully Compostable (6-12 Months)',
      carbonOffset: 'Significantly reduces carbon lifecycle footprint',
      plasticDiverted: 'Eliminates single-use non-biodegradable plastics',
      certifications: ['FSC Certified', 'BPA Free', 'Zero Plastic', 'Vegan Friendly']
    },
    highlights: [
      'Durable, sustainable, and 100% certified eco-friendly',
      'Helps divert non-biodegradable plastic from oceans and landfills',
      'Plastic-free shipment in compostable unbleached packaging'
    ]
  };
}
