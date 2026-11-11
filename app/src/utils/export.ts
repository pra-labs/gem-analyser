import { Bid } from '@/types/bid';

export function exportBidsToCSV(bids: Bid[], filename = 'gem-tenders-export.csv') {
  if (bids.length === 0) return;

  const headers = [
    'Bid Number',
    'Title',
    'Category',
    'Department',
    'Quantity',
    'Start Date',
    'End Date',
    'Reverse Auction',
    'BoQ',
    'Matched Keywords',
    'Document URL'
  ];

  const rows = bids.map((b) => [
    `"${(b.bid_number || '').replace(/"/g, '""')}"`,
    `"${(b.title || '').replace(/"/g, '""')}"`,
    `"${(b.category || '').replace(/"/g, '""')}"`,
    `"${(b.department || '').replace(/"/g, '""')}"`,
    b.quantity,
    `"${b.start_date || ''}"`,
    `"${b.end_date || ''}"`,
    b.reverse_auction ? 'YES' : 'NO',
    b.is_boq ? 'YES' : 'NO',
    `"${(b.matched_keywords || []).join('; ')}"`,
    `"${b.doc_url || ''}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportBidsToJSON(bids: Bid[], filename = 'gem-tenders-export.json') {
  if (bids.length === 0) return;
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(bids, null, 2)
  )}`;
  const link = document.createElement('a');
  link.setAttribute('href', jsonString);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
