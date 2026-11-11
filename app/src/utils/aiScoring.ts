import { Bid } from '@/types/bid';

export interface FitAssessment {
  score: number;
  recommendation: 'HIGH FIT' | 'GOOD MATCH' | 'EXPLORE' | 'LOW FIT';
  reason: string;
  strengths: string[];
  risks: string[];
}

// Core PraLabs tech domain pillars
const CORE_PILLARS = [
  {
    name: 'Conversational AI & Chatbots',
    keywords: ['chatbot', 'whatsapp', 'bot', 'conversational', 'nlp', 'llm', 'speech', 'voice'],
    scoreBoost: 35,
    tag: 'Core Competency (AI/Chatbots)',
  },
  {
    name: 'Artificial Intelligence & ML',
    keywords: ['artificial intelligence', 'machine learning', 'deep learning', 'computer vision', 'neural'],
    scoreBoost: 30,
    tag: 'Core Competency (AI/ML Stack)',
  },
  {
    name: 'Data Analytics & Dashboards',
    keywords: ['data analytics', 'business intelligence', 'dashboard', 'analytics software', 'reporting', 'bi software'],
    scoreBoost: 25,
    tag: 'High Alignment (Analytics & Dashboards)',
  },
  {
    name: 'Smart Mobility, EV & IoT',
    keywords: ['parking', 'smart parking', 'ev charging', 'iot', 'sensors', 'mobility', 'edge'],
    scoreBoost: 25,
    tag: 'Strong Match (IoT & Smart Mobility)',
  },
  {
    name: 'EdTech & Learning Management',
    keywords: ['learning management', 'lms', 'language learning', 'e-learning', 'skill assessment'],
    scoreBoost: 20,
    tag: 'Good Fit (EdTech & Assessment)',
  },
  {
    name: 'Custom Software & Web Platforms',
    keywords: ['software development', 'custom software', 'web application', 'api', 'portal', 'saas'],
    scoreBoost: 20,
    tag: 'Direct Match (Software Engineering)',
  },
];

export function computeFitScore(bid: Bid): FitAssessment {
  let score = 30; // baseline
  const text = `${bid.title || ''} ${bid.category || ''} ${(bid.matched_keywords || []).join(' ')} ${bid.department || ''}`.toLowerCase();
  const matchedPillars: string[] = [];
  const strengths: string[] = [];
  const risks: string[] = [];

  // Evaluate pillar keywords
  for (const pillar of CORE_PILLARS) {
    const hits = pillar.keywords.filter((kw) => text.includes(kw));
    if (hits.length > 0) {
      score += pillar.scoreBoost;
      matchedPillars.push(pillar.name);
      strengths.push(pillar.tag);
    }
  }

  // Reverse Auction consideration
  if (bid.reverse_auction) {
    risks.push('Reverse Auction (RA) enabled — aggressive price competition expected');
  } else {
    strengths.push('Standard evaluation (No RA) — favorable technical qualification weight');
    score += 5;
  }

  // BoQ customization
  if (bid.is_boq) {
    strengths.push('Custom BoQ requirements — technical proposal differentiation possible');
    score += 5;
  }

  // Quantity factor: software & services tend to have smaller unit counts (1 to 50)
  if (bid.quantity >= 1 && bid.quantity <= 100) {
    strengths.push('Target scale suited for startup / MSE agile execution');
    score += 5;
  } else if (bid.quantity > 500) {
    risks.push('Large quantity batch — assess manufacturing / logistics overhead');
    score -= 10;
  }

  // Cap score between 35 and 98
  score = Math.min(98, Math.max(35, score));

  // Determine recommendation tier
  let recommendation: 'HIGH FIT' | 'GOOD MATCH' | 'EXPLORE' | 'LOW FIT' = 'EXPLORE';
  let reason = 'Moderate alignment with general software services.';

  if (score >= 80) {
    recommendation = 'HIGH FIT';
    reason = `Direct match with ${matchedPillars.slice(0, 2).join(' & ')}. Optimal MSE qualification window.`;
  } else if (score >= 65) {
    recommendation = 'GOOD MATCH';
    reason = `Strong synergy with ${matchedPillars[0] || 'our technology capabilities'}. Feasible bidding prospect.`;
  } else if (score >= 50) {
    recommendation = 'EXPLORE';
    reason = 'Related technology or infrastructure requirements. Review SoW details.';
  } else {
    recommendation = 'LOW FIT';
    reason = 'Specialized hardware or unrelated domain. Secondary priority.';
  }

  return {
    score,
    recommendation,
    reason,
    strengths: strengths.slice(0, 3),
    risks: risks.slice(0, 2),
  };
}
