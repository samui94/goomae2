import { QuoteItem, ProcessedQuoteItem, PriceState, DeliveryState, SummaryStats } from '../types';

export const BASE_DATE_STR = '2026-08-27';
export const BASE_DATE = new Date(BASE_DATE_STR + 'T00:00:00');

export function parseDateOnly(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  const cleaned = dateStr.trim();
  if (!cleaned || cleaned === '-' || cleaned.toLowerCase() === 'n/a') return null;
  // match YYYY-MM-DD or YYYY/MM/DD
  const match = cleaned.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return isNaN(date.getTime()) ? null : date;
}

export function calculateDDay(promisedDateStr: string | null): number | null {
  const pDate = parseDateOnly(promisedDateStr);
  if (!pDate) return null;
  const diffTime = pDate.getTime() - BASE_DATE.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function processQuotes(rawQuotes: QuoteItem[]): ProcessedQuoteItem[] {
  // 1. Group by pr_no for median and lowest price calculation
  const prGroups: Record<string, QuoteItem[]> = {};
  rawQuotes.forEach(q => {
    if (!prGroups[q.pr_no]) {
      prGroups[q.pr_no] = [];
    }
    prGroups[q.pr_no].push(q);
  });

  // 2. Group by item_code for name discrepancy calculation
  const itemCodeNames: Record<string, Set<string>> = {};
  rawQuotes.forEach(q => {
    if (!itemCodeNames[q.item_code]) {
      itemCodeNames[q.item_code] = new Set();
    }
    itemCodeNames[q.item_code].add(q.item_name.trim());
  });

  const discrepancyItemCodes = new Set<string>();
  Object.entries(itemCodeNames).forEach(([code, names]) => {
    if (names.size >= 2) {
      discrepancyItemCodes.add(code);
    }
  });

  // Pre-calculate medians per PR
  const prMedians: Record<string, { median: number; validCount: number }> = {};
  Object.entries(prGroups).forEach(([prNo, items]) => {
    const validPrices = items
      .map(i => i.unit_price)
      .filter((p): p is number => p !== null && p !== undefined && !isNaN(p) && p > 0);
    
    if (validPrices.length === 0) {
      prMedians[prNo] = { median: 0, validCount: 0 };
      return;
    }

    const sorted = [...validPrices].sort((a, b) => a - b);
    let median = 0;
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      median = (sorted[mid - 1] + sorted[mid]) / 2;
    } else {
      median = sorted[mid];
    }
    prMedians[prNo] = { median, validCount: validPrices.length };
  });

  // Pre-calculate lowest price candidate per PR (excluding outliers & missing)
  // First pass to determine price states for candidate selection
  const tempProcessedFirstPass = rawQuotes.map(q => {
    if (q.unit_price === null || q.unit_price === undefined) {
      return { q, priceState: '단가 미기재' as PriceState, deviation: null };
    }
    const groupInfo = prMedians[q.pr_no];
    if (!groupInfo || groupInfo.validCount < 3) {
      return { q, priceState: '비교 불가' as PriceState, deviation: null };
    }
    const med = groupInfo.median;
    const deviation = ((q.unit_price - med) / med) * 100;
    const priceState: PriceState = Math.abs(deviation) > 30 ? '이상치' : '정상';
    return { q, priceState, deviation };
  });

  const prLowestCandidates: Record<string, string> = {}; // pr_no -> quote_id of lowest price
  const prFilteredGroups: Record<string, typeof tempProcessedFirstPass> = {};
  tempProcessedFirstPass.forEach(item => {
    if (!prFilteredGroups[item.q.pr_no]) prFilteredGroups[item.q.pr_no] = [];
    prFilteredGroups[item.q.pr_no].push(item);
  });

  Object.entries(prFilteredGroups).forEach(([prNo, items]) => {
    // Eligible for lowest price: priceState is '정상' or '비교 불가' (exclude '이상치', '단가 미기재')
    const eligible = items.filter(i => i.priceState === '정상' || i.priceState === '비교 불가');
    if (eligible.length === 0) return;

    // Find min unit_price
    let minPrice = Infinity;
    eligible.forEach(e => {
      if (e.q.unit_price !== null && e.q.unit_price < minPrice) {
        minPrice = e.q.unit_price;
      }
    });

    const candidates = eligible.filter(e => e.q.unit_price === minPrice);
    // Tie breaker: earliest quote_date, then quote_id ascending
    candidates.sort((a, b) => {
      const dateA = new Date(a.q.quote_date).getTime();
      const dateB = new Date(b.q.quote_date).getTime();
      if (dateA !== dateB) return dateA - dateB;
      return a.q.quote_id.localeCompare(b.q.quote_id);
    });

    if (candidates.length > 0) {
      prLowestCandidates[prNo] = candidates[0].q.quote_id;
    }
  });

  // Final mapping
  return rawQuotes.map(q => {
    const groupInfo = prMedians[q.pr_no] || { median: 0, validCount: 0 };
    let priceState: PriceState = '정상';
    let deviationPercent: number | null = null;

    if (q.unit_price === null || q.unit_price === undefined) {
      priceState = '단가 미기재';
    } else if (groupInfo.validCount < 3) {
      priceState = '비교 불가';
    } else {
      const med = groupInfo.median;
      deviationPercent = Number((((q.unit_price - med) / med) * 100).toFixed(1));
      priceState = Math.abs(deviationPercent) > 30 ? '이상치' : '정상';
    }

    const isLowestPriceCandidate = prLowestCandidates[q.pr_no] === q.quote_id;

    // Delivery assessment
    const dDay = calculateDDay(q.promised_date);
    let deliveryState: DeliveryState = '정상';

    if (q.status === '견적') {
      deliveryState = '판정 대상 아님';
    } else if (dDay === null) {
      deliveryState = '납기 미기재';
    } else if (dDay < 0) {
      deliveryState = '지연';
    } else if (dDay >= 0 && dDay <= 7) {
      deliveryState = '임박';
    } else {
      deliveryState = '정상';
    }

    // Exceeds required date flag
    let exceedsRequiredDate = false;
    const pDate = parseDateOnly(q.promised_date);
    const rDate = parseDateOnly(q.required_date);
    if (pDate && rDate && pDate.getTime() > rDate.getTime()) {
      exceedsRequiredDate = true;
    }

    const hasNameDiscrepancy = discrepancyItemCodes.has(q.item_code);

    return {
      ...q,
      medianPrice: groupInfo.validCount > 0 ? groupInfo.median : null,
      deviationPercent,
      priceState,
      isLowestPriceCandidate: isLowestPriceCandidate && priceState !== '이상치' && priceState !== '단가 미기재',
      dDay,
      deliveryState,
      exceedsRequiredDate,
      hasNameDiscrepancy,
    };
  });
}

export function computeSummaryStats(processed: ProcessedQuoteItem[]): SummaryStats {
  const totalRows = processed.length;
  const prs = new Set(processed.map(p => p.pr_no));
  
  let delayedCount = 0;
  let impendingCount = 0;
  let normalDeliveryCount = 0;
  let outlierCount = 0;
  let discrepancyCount = 0;
  let missingPriceCount = 0;
  let missingDeliveryCount = 0;

  const discrepancyCodesChecked = new Set<string>();

  processed.forEach(p => {
    if (p.status === '발주') {
      if (p.deliveryState === '지연') delayedCount++;
      else if (p.deliveryState === '임박') impendingCount++;
      else if (p.deliveryState === '정상') normalDeliveryCount++;
      else if (p.deliveryState === '납기 미기재') missingDeliveryCount++;
    }
    if (p.priceState === '이상치') outlierCount++;
    if (p.priceState === '단가 미기재') missingPriceCount++;
    if (p.hasNameDiscrepancy && !discrepancyCodesChecked.has(p.item_code)) {
      discrepancyCodesChecked.add(p.item_code);
      discrepancyCount++;
    }
  });

  return {
    totalRows,
    totalPrs: prs.size,
    delayedCount,
    impendingCount,
    normalDeliveryCount,
    outlierCount,
    discrepancyCount,
    missingPriceCount,
    missingDeliveryCount,
  };
}
