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
}

export interface BidsData {
  updated_at: string;
  total_bids: number;
  bids: Bid[];
}

export type SortOption =
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
  urgencyFilter: 'all' | 'closing_48h' | 'closing_7d' | 'active';
  sortBy: SortOption;
  minQuantity?: number;
}
