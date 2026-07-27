/**
 * Utility functions for exporting data arrays to CSV and PDF formats client-side.
 */

interface ExportTransaction {
  id: string;
  name: string;
  merchantName: string | null;
  category: string;
  date: Date;
  status: string;
  amount: number;
  account: {
    name: string;
    bank: {
      institutionName: string;
    };
  };
}

/**
 * Compiles transactions into a standard CSV format and triggers a download.
 */
export function exportToCSV(transactions: ExportTransaction[]) {
  const headers = ['Merchant', 'Institution', 'Account Name', 'Category', 'Date', 'Status', 'Amount ($)'];
  
  const rows = transactions.map((tx) => [
    tx.merchantName || tx.name,
    tx.account.bank.institutionName,
    tx.account.name,
    tx.category,
    tx.date instanceof Date ? tx.date.toISOString().split('T')[0] : String(tx.date).split('T')[0],
    tx.status,
    tx.amount,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const formattedDate = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `astrabank_ledger_${formattedDate}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates a clean HTML transaction sheet in a separate window and triggers native OS PDF generation/printing.
 */
export function exportToPDF(transactions: ExportTransaction[]) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const rowsHtml = transactions
    .map((tx) => {
      const isIncome = tx.amount < 0;
      const amountStr = `${isIncome ? '+' : '-'}$${Math.abs(tx.amount).toFixed(2)}`;
      const textStyle = isIncome ? 'color: #06b6d4;' : 'color: #0f172a;';
      const formattedDate = tx.date instanceof Date ? tx.date.toISOString().split('T')[0] : String(tx.date).split('T')[0];

      return `
      <tr>
        <td>${tx.merchantName || tx.name}</td>
        <td>${tx.account.bank.institutionName} • ${tx.account.name}</td>
        <td>${tx.category}</td>
        <td>${formattedDate}</td>
        <td style="text-transform: capitalize;">${tx.status}</td>
        <td style="text-align: right; font-weight: bold; ${textStyle}">${amountStr}</td>
      </tr>
    `;
    })
    .join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>AstraBank Transaction Ledger Statement</title>
        <style>
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            padding: 40px;
            color: #0f172a;
            line-height: 1.5;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-b: 2px solid #e2e8f0;
            padding-bottom: 20px;
            margin-bottom: 20px;
          }
          h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 800;
            letter-spacing: -0.025em;
            color: #0f172a;
          }
          .logo-span {
            color: #3b82f6;
          }
          .meta {
            font-size: 12px;
            color: #64748b;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 12px;
          }
          th {
            background: #f8fafc;
            border-bottom: 2px solid #e2e8f0;
            font-weight: 600;
            text-align: left;
            color: #475569;
          }
          th, td {
            padding: 10px 12px;
            border-bottom: 1px solid #f1f5f9;
          }
          tr:hover {
            background: #fafafa;
          }
          @media print {
            body { padding: 20px; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>Astra<span class="logo-span">Bank</span></h1>
            <div class="meta">Ledger Transactions Statement</div>
          </div>
          <div style="text-align: right;" class="meta">
            Prepared: ${new Date().toLocaleDateString()}<br/>
            Scope: Connected Links
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Merchant / Ledger</th>
              <th>Account Link</th>
              <th>Category</th>
              <th>Date</th>
              <th>Status</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 300);
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
