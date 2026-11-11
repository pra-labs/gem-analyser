import { TenderExplorer } from '@/components/TenderExplorer';
import { Bid, BidsData } from '@/types/bid';
import bidsDataJson from '@/data/bids.json';

export default function Page() {
  const data = bidsDataJson as unknown as BidsData;
  const bids: Bid[] = data.bids || [];
  const updatedAt: string = data.updated_at || new Date().toISOString();

  return <TenderExplorer initialBids={bids} lastUpdated={updatedAt} />;
}
