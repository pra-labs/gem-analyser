import { Bid } from '@/types/bid';

export interface FitAssessment {
  score: number;
  recommendation: 'HIGH FIT' | 'GOOD MATCH' | 'EXPLORE' | 'LOW FIT';
  reason: string;
  procurementType: 'Software / SaaS' | 'Services / Manpower' | 'Hardware / Equipment' | 'Goods / Supply';
  strengths: string[];
  risks: string[];
  isFalsePositive: boolean;
}

// Negative keywords that frequently trigger false positives in GeM for non-tech goods
const NON_TECH_EXCLUSIONS = [
  'washing machine',
  'smoke dispenser',
  'fogging machine',
  'cryostorage',
  'nitrogen vapour',
  'artificial flower',
  'flower',
  'plastic pvc',
  'pvc conduit',
  'lead acid battery',
  'ecg roll',
  'drinking water cooler',
  'canon ink',
  'bp machine',
  'choona',
  'flex board',
  'books for library',
  'uniform',
  'stationery',
  'furniture',
  'sanitary',
];

// Core PraLabs tech domain pillars
const CORE_PILLARS = [
  {
    name: 'Conversational AI & Chatbots',
    keywords: ['chatbot', 'whatsapp chatbot', 'conversational ai', 'nlp', 'llm', 'speech recognition', 'voice assistant'],
    scoreBoost: 40,
    tag: 'Core Competency (AI/Chatbots)',
  },
  {
    name: 'Artificial Intelligence & ML',
    keywords: ['artificial intelligence', 'machine learning', 'deep learning', 'computer vision', 'video analytics', 'neural network'],
    scoreBoost: 35,
    tag: 'Core Competency (AI/ML Stack)',
  },
  {
    name: 'Data Analytics & Dashboards',
    keywords: ['data analytics', 'business intelligence', 'analytics software', 'reporting dashboard', 'bi software', 'data platform'],
    scoreBoost: 30,
    tag: 'High Alignment (Analytics & BI)',
  },
  {
    name: 'Smart Mobility, EV & IoT',
    keywords: ['smart parking', 'parking guidance', 'ev charging', 'iot hardware', 'sensors', 'mobility solution'],
    scoreBoost: 30,
    tag: 'Strong Match (IoT & Smart Mobility)',
  },
  {
    name: 'EdTech & Learning Management',
    keywords: ['learning management system', 'lms', 'language learning software', 'digital language lab', 'skill assessment software'],
    scoreBoost: 25,
    tag: 'Good Fit (EdTech & Assessment)',
  },
  {
    name: 'Custom Software & Web Platforms',
    keywords: ['software development', 'custom software', 'web application', 'api integration', 'custom bid for services - software', 'cloud computing'],
    scoreBoost: 25,
    tag: 'Direct Match (Software Engineering)',
  },
];

export function computeFitScore(bid: Bid): FitAssessment {
  const text = `${bid.title || ''} ${bid.category || ''} ${bid.full_categories || ''} ${bid.department || ''}`.toLowerCase();
  
  // 1. Detect False Positives (e.g. "washing machine", "artificial flower")
  const hasNonTechMatch = NON_TECH_EXCLUSIONS.some((term) => text.includes(term));

  // Determine Procurement Type
  let procurementType: 'Software / SaaS' | 'Services / Manpower' | 'Hardware / Equipment' | 'Goods / Supply' = 'Goods / Supply';
  if (text.includes('software') || text.includes('saas') || text.includes('chatbot') || text.includes('platform') || text.includes('application')) {
    procurementType = 'Software / SaaS';
  } else if (text.includes('service') || text.includes('manpower') || text.includes('consultancy') || text.includes('maintenance')) {
    procurementType = 'Services / Manpower';
  } else if (text.includes('camera') || text.includes('server') || text.includes('iot') || text.includes('switch') || text.includes('device')) {
    procurementType = 'Hardware / Equipment';
  } else {
    procurementType = 'Goods / Supply';
  }

  // If item is clearly a non-tech physical good (e.g. washing machine), penalize score immediately
  if (hasNonTechMatch && procurementType !== 'Software / SaaS') {
    return {
      score: 15,
      recommendation: 'LOW FIT',
      reason: 'Physical hardware / non-tech item detected (low algorithmic match).',
      procurementType,
      strengths: [],
      risks: ['Non-software physical good — not matching core PraLabs software capabilities.'],
      isFalsePositive: true,
    };
  }

  let score = 25; // baseline
  const matchedPillars: string[] = [];
  const strengths: string[] = [];
  const risks: string[] = [];

  // Evaluate pillar keywords strictly
  for (const pillar of CORE_PILLARS) {
    const hits = pillar.keywords.filter((kw) => text.includes(kw));
    if (hits.length > 0) {
      score += pillar.scoreBoost;
      matchedPillars.push(pillar.name);
      strengths.push(pillar.tag);
    }
  }

  // Software & Services bonus
  if (procurementType === 'Software / SaaS') {
    score += 15;
    strengths.push('Software/SaaS Procurement: High operating leverage for agile teams.');
  }

  // Reverse Auction consideration
  if (bid.reverse_auction) {
    risks.push('Reverse Auction (RA) enabled — margin compression risk.');
  } else {
    score += 5;
  }

  // Quantity factor: software & services tend to have smaller unit counts (1 to 50)
  if (bid.quantity >= 1 && bid.quantity <= 100) {
    score += 5;
  } else if (bid.quantity > 500) {
    score -= 15;
    risks.push('Large volume batch — verify fulfillment scope.');
  }

  // Cap score between 15 and 98
  score = Math.min(98, Math.max(15, score));

  // Determine recommendation tier
  let recommendation: 'HIGH FIT' | 'GOOD MATCH' | 'EXPLORE' | 'LOW FIT' = 'EXPLORE';
  let reason = 'General technology procurement. Review SoW details.';

  if (score >= 80) {
    recommendation = 'HIGH FIT';
    reason = `Direct match with ${matchedPillars.slice(0, 2).join(' & ') || 'Core Stack'}. Optimal MSE window.`;
  } else if (score >= 60) {
    recommendation = 'GOOD MATCH';
    reason = `Strong synergy with ${matchedPillars[0] || 'software capabilities'}. Feasible bidding prospect.`;
  } else if (score >= 40) {
    recommendation = 'EXPLORE';
    reason = 'Related IT / infrastructure tender. Review specification sheet.';
  } else {
    recommendation = 'LOW FIT';
    reason = 'Peripheral hardware or low technical alignment.';
  }

  return {
    score,
    recommendation,
    reason,
    procurementType,
    strengths: strengths.slice(0, 3),
    risks: risks.slice(0, 2),
    isFalsePositive: false,
  };
}
