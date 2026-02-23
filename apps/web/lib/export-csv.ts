import { HistoryRecord } from './history-utils';

export function exportToCSV(data: HistoryRecord[], filename: string) {
  const headers = ['Timestamp', 'Transaction Hash', 'Type', 'Fee (Stroops)', 'Status'];
  const rows = data.map((r) => [r.timestamp, r.hash, r.opType, r.feePaid.toString(), r.result]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
