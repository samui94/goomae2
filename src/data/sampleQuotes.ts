import { QuoteItem } from '../types';

export const INITIAL_SAMPLE_QUOTES: QuoteItem[] = [
  // PR-2026-001 (IT-001)
  { quote_id: 'QT-001', pr_no: 'PR-2026-001', item_code: 'IT-001', item_name: '고순도 톨루엔', supplier: '대한케미칼', unit: 't', qty: 10, unit_price: 1250000, currency: 'KRW', quote_date: '2026-08-01', required_date: '2026-09-10', promised_date: '2026-08-25', status: '견적', remark: '정상 견적' },
  { quote_id: 'QT-002', pr_no: 'PR-2026-001', item_code: 'IT-001', item_name: '고순도 톨루엔', supplier: '한국폴리머', unit: 't', qty: 10, unit_price: 1220000, currency: 'KRW', quote_date: '2026-08-02', required_date: '2026-09-10', promised_date: '2026-08-30', status: '발주', remark: '납기 D+3 (지연)' },
  { quote_id: 'QT-003', pr_no: 'PR-2026-001', item_code: 'IT-001', item_name: '고순도 톨루엔', supplier: '한화정밀화학', unit: 't', qty: 10, unit_price: 1780000, currency: 'KRW', quote_date: '2026-08-03', required_date: '2026-09-10', promised_date: '2026-08-20', status: '견적', remark: '단가 이상치 (+47.1%)' },

  // PR-2026-002 (IT-002)
  { quote_id: 'QT-004', pr_no: 'PR-2026-002', item_code: 'IT-002', item_name: '공업용 아세톤', supplier: '태성케미칼', unit: 'kg', qty: 500, unit_price: 2400, currency: 'KRW', quote_date: '2026-08-01', required_date: '2026-09-05', promised_date: '2026-08-26', status: '견적', remark: '' },
  { quote_id: 'QT-005', pr_no: 'PR-2026-002', item_code: 'IT-002', item_name: '공업용 아세톤', supplier: '삼영하이텍', unit: 'kg', qty: 500, unit_price: 2300, currency: 'KRW', quote_date: '2026-08-02', required_date: '2026-09-05', promised_date: '2026-08-27', status: '발주', remark: '최저가 & D-DAY (임박)' },
  { quote_id: 'QT-006', pr_no: 'PR-2026-002', item_code: 'IT-002', item_name: '공업용 아세톤', supplier: '대한케미칼', unit: 'kg', qty: 500, unit_price: 2450, currency: 'KRW', quote_date: '2026-08-03', required_date: '2026-09-05', promised_date: '2026-09-03', status: '견적', remark: '' },

  // PR-2026-003 (IT-003) - with item name discrepancy AIBN 개시제 vs AIBN 개시제(25kg) and outlier QT-007 (-39.6%)
  { quote_id: 'QT-007', pr_no: 'PR-2026-003', item_code: 'IT-003', item_name: 'AIBN 개시제', supplier: '한국폴리머', unit: 'kg', qty: 50, unit_price: 520000, currency: 'KRW', quote_date: '2026-08-01', required_date: '2026-09-15', promised_date: '2026-08-20', status: '견적', remark: '단가 이상치 (-39.6%)' },
  { quote_id: 'QT-008', pr_no: 'PR-2026-003', item_code: 'IT-003', item_name: 'AIBN 개시제(25kg)', supplier: '한화정밀화학', unit: 'kg', qty: 50, unit_price: 860000, currency: 'KRW', quote_date: '2026-08-02', required_date: '2026-09-15', promised_date: '2026-08-27', status: '발주', remark: '표기 상이 발생품목' },
  { quote_id: 'QT-009', pr_no: 'PR-2026-003', item_code: 'IT-003', item_name: 'AIBN 개시제', supplier: '태성케미칼', unit: 'kg', qty: 50, unit_price: 890000, currency: 'KRW', quote_date: '2026-08-03', required_date: '2026-09-15', promised_date: '2026-09-01', status: '견적', remark: '' },

  // PR-2026-004 (IT-004)
  { quote_id: 'QT-010', pr_no: 'PR-2026-004', item_code: 'IT-004', item_name: '메탄올 특급', supplier: 'LG화학파트너', unit: 't', qty: 20, unit_price: 950000, currency: 'KRW', quote_date: '2026-08-01', required_date: '2026-09-20', promised_date: '2026-09-04', status: '발주', remark: 'D-8 (정상)' },
  { quote_id: 'QT-011', pr_no: 'PR-2026-004', item_code: 'IT-004', item_name: '메탄올 특급', supplier: '삼영하이텍', unit: 't', qty: 20, unit_price: 930000, currency: 'KRW', quote_date: '2026-08-02', required_date: '2026-09-20', promised_date: '2026-09-05', status: '견적', remark: '최저가 후보' },

  // PR-2026-005 (IT-005) - with blank unit price and blank promised date
  { quote_id: 'QT-012', pr_no: 'PR-2026-005', item_code: 'IT-005', item_name: '정제 에탄올', supplier: '대한케미칼', unit: 't', qty: 15, unit_price: null, currency: 'KRW', quote_date: '2026-08-01', required_date: '2026-09-10', promised_date: null, status: '견적', remark: '단가·납기 미기재' },
  { quote_id: 'QT-013', pr_no: 'PR-2026-005', item_code: 'IT-005', item_name: '정제 에탄올', supplier: '한국폴리머', unit: 't', qty: 15, unit_price: 1100000, currency: 'KRW', quote_date: '2026-08-02', required_date: '2026-09-10', promised_date: '2026-08-31', status: '발주', remark: '' },
  { quote_id: 'QT-014', pr_no: 'PR-2026-005', item_code: 'IT-005', item_name: '정제 에탄올', supplier: '태성케미칼', unit: 't', qty: 15, unit_price: 1120000, currency: 'KRW', quote_date: '2026-08-03', required_date: '2026-09-10', promised_date: '2026-09-02', status: '견적', remark: '' },

  // Generating additional PRs (PR-2026-006 to PR-2026-032) to reach 80 rows total
  ...Array.from({ length: 27 }, (_, i) => {
    const prNum = i + 6;
    const prNo = `PR-2026-${prNum.toString().padStart(3, '0')}`;
    const itemIdx = (i % 8) + 1;
    const itemCode = `IT-00${itemIdx > 8 ? 8 : itemIdx}`;
    const itemNames = [
      '고순도 톨루엔',
      '공업용 아세톤',
      i % 2 === 0 ? 'AIBN 개시제' : 'AIBN 개시제(25kg)', // discrepancy for IT-003
      '메탄올 특급',
      '정제 에탄올',
      i % 2 === 0 ? '산화방지제 AO-11' : '산화방지제 AO‑11', // discrepancy for IT-006 (U+2011 hyphen)
      '실리콘 오일',
      '활성탄소',
    ];
    const itemName = itemNames[itemIdx - 1];
    const suppliers = ['대한케미칼', '한국폴리머', '한화정밀화학', '태성케미칼', '삼영하이텍', 'LG화학파트너'];
    const sup1 = suppliers[i % suppliers.length];
    const sup2 = suppliers[(i + 1) % suppliers.length];
    
    const basePrice = 500000 + (i * 25000);
    const isValju1 = i % 2 === 0;
    
    const dayOffset = (i % 15) - 5; // some delayed (<0), some impending (0-7), some normal (>7)
    const promisedDateStr = `2026-08-${Math.max(1, Math.min(31, 27 + dayOffset)).toString().padStart(2, '0')}`;

    return [
      {
        quote_id: `QT-${(i * 2 + 15).toString().padStart(3, '0')}`,
        pr_no: prNo,
        item_code: itemCode,
        item_name: itemName,
        supplier: sup1,
        unit: itemIdx <= 2 ? 't' : 'kg',
        qty: 10 + (i % 5) * 5,
        unit_price: basePrice,
        currency: 'KRW',
        quote_date: '2026-08-02',
        required_date: '2026-09-15',
        promised_date: promisedDateStr,
        status: isValju1 ? ('발주' as const) : ('견적' as const),
        remark: dayOffset < 0 ? '납기 지연 건' : '정상 진행',
      },
      {
        quote_id: `QT-${(i * 2 + 16).toString().padStart(3, '0')}`,
        pr_no: prNo,
        item_code: itemCode,
        item_name: itemName,
        supplier: sup2,
        unit: itemIdx <= 2 ? 't' : 'kg',
        qty: 10 + (i % 5) * 5,
        unit_price: basePrice + 35000,
        currency: 'KRW',
        quote_date: '2026-08-03',
        required_date: '2026-09-15',
        promised_date: '2026-09-02',
        status: !isValju1 ? ('발주' as const) : ('견적' as const),
        remark: '복수견적 비교용',
      }
    ];
  }).flat(),
];
