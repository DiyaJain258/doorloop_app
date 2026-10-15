export function getFormattedRequestNumber(req: any, index?: number): string {
  if (index !== undefined && index !== null && index >= 0) {
    return `#${index + 1}`;
  }
  if (!req) return '#1';

  if (typeof req === 'number') {
    return `#${req}`;
  }

  if (typeof req === 'string') {
    if (/^\d+$/.test(req)) return `#${req}`;
    if (req.startsWith('#')) return req;
    if (req.startsWith('sr-') || req.startsWith('SR-')) {
      const num = req.replace(/sr-/i, '');
      if (/^\d+$/.test(num)) return `#${num}`;
    }
    return `#1`;
  }

  if (req.requestNumber) {
    return String(req.requestNumber).startsWith('#') ? String(req.requestNumber) : `#${req.requestNumber}`;
  }
  if (req.ticketNumber) {
    return String(req.ticketNumber).startsWith('#') ? String(req.ticketNumber) : `#${req.ticketNumber}`;
  }
  if (req.serialNumber || req.seqNo) {
    return `#${req.serialNumber || req.seqNo}`;
  }

  return '#1';
}
