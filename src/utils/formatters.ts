export function formatINR(amount: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatCroreLakh(amount: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 10000000) {
    return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
  } else if (abs >= 100000) {
    return `${sign}₹${(abs / 100000).toFixed(2)} L`;
  } else {
    return `${sign}₹${abs.toLocaleString('en-IN')}`;
  }
}

/**
 * Standard ASCII-compatible INR formatter specifically for jsPDF documents
 * avoiding font encoding / character garbling issues with non-standard Unicode glyphs
 */
export function formatPdfCroreLakh(amount: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) return 'INR 0';
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 10000000) {
    return `${sign}INR ${(abs / 10000000).toFixed(2)} Cr`;
  } else if (abs >= 100000) {
    return `${sign}INR ${(abs / 100000).toFixed(2)} L`;
  } else {
    return `${sign}INR ${abs.toLocaleString('en-US')}`;
  }
}

export function formatPdfINR(amount: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) return 'INR 0';
  const sign = amount < 0 ? '-' : '';
  return `${sign}INR ${Math.abs(amount).toLocaleString('en-US')}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}
