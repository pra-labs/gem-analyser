import { Bid } from '@/types/bid';
import { computeFitScore } from './aiScoring';

export interface AIBrief {
  bidNumber: string;
  category: string;
  department: string;
  fitScore: number;
  recommendation: string;
  scopeOfWork: string[];
  mandatoryCriteria: string[];
  emdAndPbG: {
    estimatedEmd: string;
    pbGRequirement: string;
    relaxationNote: string;
  };
  risksAndSLA: string[];
}

export function generateAIBrief(bid: Bid): AIBrief {
  const assessment = computeFitScore(bid);
  const text = `${bid.title || ''} ${bid.category || ''} ${bid.department || ''}`.toLowerCase();

  // Extract simulated SoW bullets based on domain pattern
  const scopeOfWork: string[] = [];
  if (text.includes('chatbot') || text.includes('whatsapp')) {
    scopeOfWork.push('Design, develop, and integrate automated WhatsApp conversational chatbot workflow.');
    scopeOfWork.push('Connect backend API webhooks, escalation logic, and departmental FAQs.');
    scopeOfWork.push('Provide user analytics, reporting dashboard, and SLA-compliant maintenance support.');
  } else if (text.includes('analytics') || text.includes('data') || text.includes('intelligence')) {
    scopeOfWork.push('Supply, install, and configure Business Intelligence / Data Analytics software suite.');
    scopeOfWork.push('ETL pipeline integration with existing departmental database repositories.');
    scopeOfWork.push('Custom reporting dashboards, user role management, and 5-year support contract.');
  } else if (text.includes('language') || text.includes('learning') || text.includes('lms')) {
    scopeOfWork.push('Deployment of interactive multi-device Learning Management System / Language Lab.');
    scopeOfWork.push('Support for multi-language modules (Regional & International) with progress tracking.');
    scopeOfWork.push('On-premise / hybrid server setup, trainer onboarding, and licensing management.');
  } else if (text.includes('parking') || text.includes('ev') || text.includes('mobility')) {
    scopeOfWork.push('Hardware and software integration for Automated Parking Guidance / EV charging CMS.');
    scopeOfWork.push('Real-time occupancy tracking sensors, ticketing gate barriers, and payment gateway.');
    scopeOfWork.push('Centralized monitoring console with 24/7 SLA uptime requirements.');
  } else {
    scopeOfWork.push(`Supply, configuration, and commissioning of ${bid.category.slice(0, 60)}.`);
    scopeOfWork.push('End-to-end user acceptance testing (CRAC) and institutional training.');
    scopeOfWork.push('Warranty, maintenance, and technical support as mandated by GeM terms.');
  }

  // Mandatory Criteria
  const mandatoryCriteria = [
    'Valid GeM Seller Registration & OEM Authorization Form (MAF) if bidding as authorized reseller.',
    'GST Registration Certificate & Pan-India audited balance sheets for last 3 financial years.',
    'Compliance Certificate proving BoQ parameters and supporting technical brochures.',
  ];

  // EMD and ePBG estimations
  const emdAndPbG = {
    estimatedEmd: 'Exempted for registered MSE / DPIIT Startups (otherwise typically ~2% of bid value).',
    pbGRequirement: '3% to 5% Performance Bank Guarantee (ePBG) required upon contract placement.',
    relaxationNote: 'MSE and DPIIT Startups are eligible for turnover & past experience criteria waivers under GeM GTC.',
  };

  // Risks and SLAs
  const risksAndSLA: string[] = [];
  if (bid.reverse_auction) {
    risksAndSLA.push('Reverse Auction Risk: High probability of L1 price compression. Calculate strict margin floors.');
  }
  if (bid.is_boq) {
    risksAndSLA.push('BoQ Specification Risk: Ensure all custom parameters are explicitly documented in compliance sheet.');
  }
  risksAndSLA.push('Delivery & CRAC Risk: Consignee sign-off required within stipulated days to prevent GeM auto-penalty.');

  return {
    bidNumber: bid.bid_number,
    category: bid.category,
    department: bid.department || 'Govt Department',
    fitScore: assessment.score,
    recommendation: assessment.recommendation,
    scopeOfWork,
    mandatoryCriteria,
    emdAndPbG,
    risksAndSLA,
  };
}
