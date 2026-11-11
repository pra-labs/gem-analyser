export interface Bid {
  id: string;
  bid_number: string;
  category: string;
  full_categories?: string;
  title: string;
  department: string;
  start_date: string;
  end_date: string;
  quantity: number;
  reverse_auction: boolean;
  is_boq: boolean;
  doc_url: string;
  matched_keywords?: string[];
  scraped_at: string;
  // Computed AI Matchmaking & Intelligence fields
  fitScore?: number;
  fitRecommendation?: 'HIGH FIT' | 'GOOD MATCH' | 'EXPLORE' | 'LOW FIT';
  fitReason?: string;
  procurementType?: 'Software / SaaS' | 'Services / Manpower' | 'Hardware / Equipment' | 'Goods / Supply';
}

export interface BidsData {
  updated_at: string;
  total_bids: number;
  bids: Bid[];
}

export type SortOption =
  | 'fit_score_desc'
  | 'closing_soon'
  | 'closing_latest'
  | 'quantity_high'
  | 'quantity_low'
  | 'recent_start'
  | 'deadline_asc'
  | 'deadline_desc'
  | 'quantity_desc'
  | 'quantity_asc'
  | 'scraped_desc'
  | 'start_desc';

export interface FilterState {
  searchQuery: string;
  selectedDepartments: string[];
  selectedKeywords: string[];
  raFilter: 'all' | 'ra_only' | 'no_ra';
  boqFilter: 'all' | 'boq_only' | 'no_boq';
  urgencyFilter: 'all' | 'active_only' | 'closing_48h' | 'closing_7d' | 'expired_only' | 'active';
  procurementTypeFilter?: 'all' | 'software_only' | 'services_only' | 'hardware_only';
  sortBy: SortOption;
  minQuantity?: number;
}

export type PipelineStage =
  | 'saved'
  | 'review'
  | 'prep'
  | 'submitted'
  | 'won';

export interface PipelineItem {
  id: string;
  stage: PipelineStage;
  notes?: string;
  updatedAt: string;
}
