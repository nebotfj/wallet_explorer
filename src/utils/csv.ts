import { Transaction, Network } from '../api';
import { format } from 'date-fns';

export function generateTransactionCSV(transactions: Transaction[], network: Network): string {
  const headers = [
    'Hash',
    'Network',
    'Method',
    'From',
    'To',
    'Value',
    'Token Transfers',
    'Status',
    'Gas Used',
    'Block Number',
    'Timestamp',
    'Explorer URL'
  ].join(',');

  const rows = transactions.map(tx => {
    const tokenTransfers = tx.tokenTransfers?.map(t => 
      `${t.value} ${t.token.symbol} from ${t.from} to ${t.to}`
    ).join('; ') || '';

    return [
      tx.hash,
      network.name,
      tx.method || '',
      tx.from,
      tx.to,
      `${tx.value} ${network.symbol}`,
      tokenTransfers,
      tx.status ? 'Success' : 'Failed',
      tx.gasUsed,
      tx.blockNumber,
      format(new Date(tx.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      tx.explorerUrl
    ].map(field => `"${field.replace(/"/g, '""')}"`).join(',');
  });

  return [headers, ...rows].join('\n');
}

export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}