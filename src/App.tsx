import React, { useState, useEffect, useMemo } from 'react';
import { QuoteItem, FilterState, ProcessedQuoteItem } from './types';
import { INITIAL_SAMPLE_QUOTES } from './data/sampleQuotes';
import { processQuotes, computeSummaryStats } from './utils/calculations';
import { Header } from './components/Header';
import { DashboardCards } from './components/DashboardCards';
import { FilterBar } from './components/FilterBar';
import { QuoteTable } from './components/QuoteTable';
import { PRComparisonModal } from './components/PRComparisonModal';
import { ImportExportModal } from './components/ImportExportModal';
import { QuoteEditModal } from './components/QuoteEditModal';

const LOCAL_STORAGE_KEY = 'exs02.quotes.v1';

export default function App() {
  // 1. Load initial quotes from localStorage or sample
  const [quotes, setQuotes] = useState<QuoteItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
    }
    return INITIAL_SAMPLE_QUOTES;
  });

  // 2. Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(quotes));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [quotes]);

  // 3. Filter state
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    statusFilter: '전체',
    deliveryFilter: '전체',
    priceStateFilter: '전체',
    discrepancyOnly: false,
    selectedItemCode: '전체',
    selectedPrNo: '',
    groupByPr: false,
    sortBy: 'default',
  });

  // 4. Modal states
  const [selectedPrForModal, setSelectedPrForModal] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [quoteToEdit, setQuoteToEdit] = useState<QuoteItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Process quotes with business logic
  const processedQuotes = useMemo(() => processQuotes(quotes), [quotes]);
  const stats = useMemo(() => computeSummaryStats(processedQuotes), [processedQuotes]);

  // Unique item codes for filter dropdown
  const uniqueItemCodes = useMemo(() => {
    const set = new Set<string>();
    quotes.forEach(q => set.add(q.item_code));
    return Array.from(set).sort();
  }, [quotes]);

  // Filter and sort quotes
  const filteredAndSortedQuotes = useMemo(() => {
    let result = [...processedQuotes];

    // Search query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        item =>
          item.quote_id.toLowerCase().includes(q) ||
          item.pr_no.toLowerCase().includes(q) ||
          item.item_code.toLowerCase().includes(q) ||
          item.item_name.toLowerCase().includes(q) ||
          item.supplier.toLowerCase().includes(q) ||
          (item.remark && item.remark.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (filters.statusFilter !== '전체') {
      result = result.filter(item => item.status === filters.statusFilter);
    }

    // Delivery filter
    if (filters.deliveryFilter !== '전체') {
      result = result.filter(item => item.deliveryState === filters.deliveryFilter);
    }

    // Price state filter
    if (filters.priceStateFilter !== '전체') {
      result = result.filter(item => item.priceState === filters.priceStateFilter);
    }

    // Discrepancy only filter
    if (filters.discrepancyOnly) {
      result = result.filter(item => item.hasNameDiscrepancy);
    }

    // Item code filter
    if (filters.selectedItemCode !== '전체') {
      result = result.filter(item => item.item_code === filters.selectedItemCode);
    }

    // Sorting
    result.sort((a, b) => {
      if (filters.sortBy === 'priceAsc') {
        const priceA = a.unit_price ?? Infinity;
        const priceB = b.unit_price ?? Infinity;
        return priceA - priceB;
      }
      if (filters.sortBy === 'deliveryUrgency') {
        const rankA = a.deliveryState === '지연' ? 0 : a.deliveryState === '임박' ? 1 : 2;
        const rankB = b.deliveryState === '지연' ? 0 : b.deliveryState === '임박' ? 1 : 2;
        if (rankA !== rankB) return rankA - rankB;
        return (a.dDay ?? 999) - (b.dDay ?? 999);
      }
      if (filters.sortBy === 'prNo') {
        return a.pr_no.localeCompare(b.pr_no);
      }
      // Default PRD sorting rule: delivery rank (지연 0, 임박 1, 정상 2, 납기미기재 3, 판정대상아님 4), then D ascending, pr_no, unit_price ascending
      const getDeliveryRank = (s: string) => {
        if (s === '지연') return 0;
        if (s === '임박') return 1;
        if (s === '정상') return 2;
        if (s === '납기 미기재') return 3;
        return 4;
      };
      const rankA = getDeliveryRank(a.deliveryState);
      const rankB = getDeliveryRank(b.deliveryState);
      if (rankA !== rankB) return rankA - rankB;

      const dDayA = a.dDay ?? 999;
      const dDayB = b.dDay ?? 999;
      if (dDayA !== dDayB) return dDayA - dDayB;

      if (a.pr_no !== b.pr_no) return a.pr_no.localeCompare(b.pr_no);
      return (a.unit_price ?? 0) - (b.unit_price ?? 0);
    });

    return result;
  }, [processedQuotes, filters]);

  // Handlers
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      statusFilter: '전체',
      deliveryFilter: '전체',
      priceStateFilter: '전체',
      discrepancyOnly: false,
      selectedItemCode: '전체',
      selectedPrNo: '',
      groupByPr: false,
      sortBy: 'default',
    });
  };

  const handleResetSample = () => {
    if (confirm('모든 변경사항이 초기화되고 최초 80행 샘플 데이터로 복원됩니다. 계속하시겠습니까?')) {
      setQuotes(INITIAL_SAMPLE_QUOTES);
      handleResetFilters();
    }
  };

  const handleExportCsv = () => {
    const headers = ['quote_id', 'pr_no', 'item_code', 'item_name', 'supplier', 'unit', 'qty', 'unit_price', 'currency', 'quote_date', 'required_date', 'promised_date', 'status', 'remark'];
    const rows = processedQuotes.map(q => [
      q.quote_id,
      q.pr_no,
      q.item_code,
      `"${q.item_name}"`,
      `"${q.supplier}"`,
      q.unit,
      q.qty,
      q.unit_price !== null ? q.unit_price : '',
      q.currency,
      q.quote_date,
      q.required_date,
      q.promised_date || '',
      q.status,
      `"${q.remark || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `purchase_quotes_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveQuote = (savedItem: QuoteItem, isEditing: boolean) => {
    if (isEditing) {
      setQuotes(prev => prev.map(q => (q.quote_id === savedItem.quote_id ? savedItem : q)));
    } else {
      setQuotes(prev => [savedItem, ...prev]);
    }
  };

  const handleDeleteQuote = (quoteId: string) => {
    setQuotes(prev => prev.filter(q => q.quote_id !== quoteId));
  };

  const handleUpdateStatus = (quoteId: string, newStatus: '견적' | '발주') => {
    setQuotes(prev =>
      prev.map(q => (q.quote_id === quoteId ? { ...q, status: newStatus } : q))
    );
  };

  const handleImportQuotes = (imported: QuoteItem[]) => {
    setQuotes(imported);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 selection:bg-blue-500 selection:text-white">
      <Header
        stats={stats}
        onOpenImport={() => setShowImportModal(true)}
        onOpenAdd={() => {
          setQuoteToEdit(null);
          setShowEditModal(true);
        }}
        onResetSample={handleResetSample}
        onExportCsv={handleExportCsv}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Warning Summary Dashboard Cards */}
        <DashboardCards stats={stats} filters={filters} onFilterChange={handleFilterChange} />

        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          itemCodes={uniqueItemCodes}
        />

        {/* Main Table */}
        <QuoteTable
          quotes={filteredAndSortedQuotes}
          onSelectPr={prNo => setSelectedPrForModal(prNo)}
          onEditQuote={q => {
            setQuoteToEdit(q);
            setShowEditModal(true);
          }}
        />
      </main>

      {/* PR Comparison Modal */}
      {selectedPrForModal && (
        <PRComparisonModal
          prNo={selectedPrForModal}
          allQuotes={processedQuotes}
          onClose={() => setSelectedPrForModal(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {/* Import Modal */}
      {showImportModal && (
        <ImportExportModal
          onClose={() => setShowImportModal(false)}
          onImportQuotes={handleImportQuotes}
        />
      )}

      {/* Edit / Add Modal */}
      {showEditModal && (
        <QuoteEditModal
          quoteToEdit={quoteToEdit}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveQuote}
          onDelete={handleDeleteQuote}
        />
      )}

      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 mt-auto">
        <p>구매 견적 비교·납기 판정기 (PRD-S02) — Google AI Studio Build</p>
      </footer>
    </div>
  );
}
