export interface QuoteItem {
  quote_id: string;
  pr_no: string;
  item_code: string;
  item_name: string;
  supplier: string;
  unit: string;
  qty: number;
  unit_price: number | null; // null if blank
  currency: string;
  quote_date: string;
  required_date: string;
  promised_date: string | null; // null if blank
  status: '견적' | '발주';
  remark?: string;
}

export type PriceState = '정상' | '이상치' | '비교 불가' | '단가 미기재';

export type DeliveryState = '지연' | '임박' | '정상' | '납기 미기재' | '판정 대상 아님';

export interface ProcessedQuoteItem extends QuoteItem {
  medianPrice: number | null;
  deviationPercent: number | null;
  priceState: PriceState;
  isLowestPriceCandidate: boolean;
  dDay: number | null;
  deliveryState: DeliveryState;
  exceedsRequiredDate: boolean;
  hasNameDiscrepancy: boolean;
}

export interface FilterState {
  searchQuery: string;
  statusFilter: '전체' | '견적' | '발주';
  deliveryFilter: '전체' | '지연' | '임박' | '정상' | '납기 미기재';
  priceStateFilter: '전체' | '정상' | '이상치' | '단가 미기재';
  discrepancyOnly: boolean;
  selectedItemCode: string;
  selectedPrNo: string;
  groupByPr: boolean;
  sortBy: 'default' | 'priceAsc' | 'deliveryUrgency' | 'prNo';
}

export interface SummaryStats {
  totalRows: number;
  totalPrs: number;
  delayedCount: number;
  impendingCount: number;
  normalDeliveryCount: number;
  outlierCount: number;
  discrepancyCount: number;
  missingPriceCount: number;
  missingDeliveryCount: number;
}
