import fs from 'fs';
import path from 'path';
import { TenderExplorer } from '@/components/TenderExplorer';
import { Bid, BidsData } from '@/types/bid';

async function getBids(): Promise<{ bids: Bid[]; updatedAt: string }> {
  try {
    // Primary path: repository data/bids.json
    const primaryPath = path.join(process.cwd(), '../data/bids.json');
    const fallbackPath = path.join(process.cwd(), 'public/data/bids.json');

    const filePath = fs.existsSync(primaryPath) ? primaryPath : fallbackPath;
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf-8');
      const parsed: BidsData = JSON.parse(fileData);
      return {
        bids: parsed.bids || [],
        updatedAt: parsed.updated_at || new Date().toISOString(),
      };
    }
  } catch (error) {
    console.error('Error reading tenders data:', error);
  }

  return { bids: [], updatedAt: new Date().toISOString() };
}

export default async function Page() {
  const { bids, updatedAt } = await getBids();

  return <TenderExplorer initialBids={bids} lastUpdated={updatedAt} />;
}
