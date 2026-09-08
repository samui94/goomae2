import React, { useState, useEffect, useMemo } from 'react';
import { QuoteItem, FilterState, ProcessedQuoteItem } from './types';
import { INITIAL_SAMPLE_QUOTES } from './data/sampleQuotes';
import { processQuotes, computeSummaryStats } from './utils/calculations';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Header } from './components/Header';
import { DashboardCards } from './components/DashboardCards';
import { FilterBar } from './components/FilterBar';
import { QuoteTable } from './components/QuoteTable';
import { PRComparisonModal } from './components/PRComparisonModal';
import { ImportExportModal } from './components/ImportExportModal';
import { QuoteEditModal } from './components/QuoteEditModal';
import { AuthScreen } from './components/AuthScreen';
import { SupabaseSqlModal } from './components/SupabaseSqlModal';
import { LogOut, Database, Code } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'exs02.quotes.v1';

export default function App() {
  // Auth state
  const [session, setSession] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [bypassDemo, setBypassDemo] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);

  // Quotes state
  const [quotes, setQuotes] = useState<QuoteItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SAMPLE_QUOTES;
  });

  const [syncing, setSyncing] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // Check Supabase session on mount
  useEffect(() => {
    if (!supabase) {
      setAuthChecked(true);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthChecked(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch quotes from Supabase when logged in
  useEffect(() => {
    if (session && supabase) {
      fetchQuotesFromSupabase();
    }
  }, [session]);

  const fetchQuotesFromSupabase = async () => {
    if (!supabase) return;
    setSyncing(true);
    setDbError(null);
    try {
      const { data, error } = await supabase
        .from('purchase_quotes')
        .select('*')
        .order('quote_id', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        // Map database fields to QuoteItem format
        const loaded: QuoteItem[] = data.map((d: any) => ({
          quote_id: d.quote_id,
          pr_no: d.pr_no,
          item_code: d.item_code,
          item_name: d.item_name,
          supplier: d.supplier,
          unit: d.unit,
          qty: Number(d.qty),
          unit_price: d.unit_price !== null && d.unit_price !== undefined ? Number(d.unit_price) : null,
          currency: d.currency || 'KRW',
          quote_date: d.quote_date,
          required_date: d.required_date,
          promised_date: d.promised_date || null,
          status: d.status || '견적',
          remark: d.remark || '',
        }));
        setQuotes(loaded);
      } else if (quotes.length === 0) {
        // If DB is empty, seed with sample quotes
        await saveQuotesToSupabase(INITIAL_SAMPLE_QUOTES);
        setQuotes(INITIAL_SAMPLE_QUOTES);
      }
    } catch (err: any) {
      console.error('Supabase fetch error:', err.message);
      setDbError(`Supabase 데이터 조회 실패 (SQL 테이블 생성 여부를 확인하세요): ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const saveQuotesToSupabase = async (items: QuoteItem[]) => {
    if (!supabase || !session) return;
    try {
      const payload = items.map(q => ({
        quote_id: q.quote_id,
        pr_no: q.pr_no,
        item_code: q.item_code,
        item_name: q.item_name,
        supplier: q.supplier,
        unit: q.unit,
        qty: q.qty,
        unit_price: q.unit_price,
        currency: q.currency,
        quote_date: q.quote_date,
        required_date: q.required_date,
        promised_date: q.promised_date,
        status: q.status,
        remark: q.remark,
        user_id: session.user.id,
      }));

      const { error } = await supabase
        .from('purchase_quotes')
        .upsert(payload, { onConflict: 'quote_id' });

      if (error) throw error;
    } catch (err: any) {
      console.error('Supabase upsert error:', err.message);
      setDbError(`Supabase 데이터 저장 오류: ${err.message}`);
    }
  };

  // Save to localStorage as backup
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(quotes));
    } catch (e) {
      console.error(e);
    }
  }, [quotes]);

  // Filter state
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

  // Modal states
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

    if (filters.statusFilter !== '전체') {
      result = result.filter(item => item.status === filters.statusFilter);
    }

    if (filters.deliveryFilter !== '전체') {
      result = result.filter(item => item.deliveryState === filters.deliveryFilter);
    }

    if (filters.priceStateFilter !== '전체') {
      result = result.filter(item => item.priceState === filters.priceStateFilter);
    }

    if (filters.discrepancyOnly) {
      result = result.filter(item => item.hasNameDiscrepancy);
    }

    if (filters.selectedItemCode !== '전체') {
      result = result.filter(item => item.item_code === filters.selectedItemCode);
    }

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

  const handleResetSample = async () => {
    if (confirm('모든 변경사항이 초기화되고 최초 80행 샘플 데이터로 복원됩니다. 계속하시겠습니까?')) {
      setQuotes(INITIAL_SAMPLE_QUOTES);
      if (session && supabase) {
        await saveQuotesToSupabase(INITIAL_SAMPLE_QUOTES);
      }
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

  const handleSaveQuote = async (savedItem: QuoteItem, isEditing: boolean) => {
    let updated: QuoteItem[];
    if (isEditing) {
      updated = quotes.map(q => (q.quote_id === savedItem.quote_id ? savedItem : q));
    } else {
      updated = [savedItem, ...quotes];
    }
    setQuotes(updated);
    if (session && supabase) {
      await saveQuotesToSupabase([savedItem]);
    }
  };

  const handleDeleteQuote = async (quoteId: string) => {
    setQuotes(prev => prev.filter(q => q.quote_id !== quoteId));
    if (supabase && session) {
      try {
        await supabase.from('purchase_quotes').delete().eq('quote_id', quoteId);
      } catch (err: any) {
        console.error('Delete error:', err);
      }
    }
  };

  const handleUpdateStatus = async (quoteId: string, newStatus: '견적' | '발주') => {
    const target = quotes.find(q => q.quote_id === quoteId);
    if (!target) return;
    const updatedItem = { ...target, status: newStatus };
    setQuotes(prev =>
      prev.map(q => (q.quote_id === quoteId ? updatedItem : q))
    );
    if (supabase && session) {
      await saveQuotesToSupabase([updatedItem]);
    }
  };

  const handleImportQuotes = async (imported: QuoteItem[]) => {
    // Accumulate imported quotes into existing quotes (or replace/merge by quote_id)
    const existingMap = new Map(quotes.map(q => [q.quote_id, q]));
    imported.forEach(imp => {
      existingMap.set(imp.quote_id, imp);
    });
    const merged = Array.from(existingMap.values());
    setQuotes(merged);

    if (supabase && session) {
      await saveQuotesToSupabase(imported);
    }
  };

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setSession(null);
  };

  // If Supabase is configured and user is not logged in and not in bypass demo mode, show AuthScreen
  if (authChecked && isSupabaseConfigured && !session && !bypassDemo) {
    return (
      <>
        <AuthScreen
          onBypassDemo={() => setBypassDemo(true)}
          onOpenSqlModal={() => setShowSqlModal(true)}
        />
        {showSqlModal && <SupabaseSqlModal onClose={() => setShowSqlModal(false)} />}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 selection:bg-blue-500 selection:text-white">
      {/* Top Supabase Session Banner */}
      <div className="bg-slate-900 text-slate-200 px-4 py-2 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-blue-400" />
          <span>
            {session ? (
              <>연결됨: <strong className="text-white">{session.user.email}</strong> (Supabase DB 누적 저장 활성화)</>
            ) : (
              <>데모 모드 (LocalStorage 단독 작동)</>
            )}
            {syncing && <span className="ml-2 text-blue-300 animate-pulse">동기화 중...</span>}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSqlModal(true)}
            className="inline-flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
          >
            <Code className="w-3.5 h-3.5" />
            SQL 스키마
          </button>
          {session && (
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1 text-rose-300 hover:text-rose-100 transition-colors font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              로그아웃
            </button>
          )}
        </div>
      </div>

      {dbError && (
        <div className="bg-rose-600 text-white px-4 py-2 text-xs text-center font-medium">
          {dbError} (상단 'SQL 스키마' 버튼을 눌러 Supabase에 테이블을 생성해주세요)
        </div>
      )}

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
        <DashboardCards stats={stats} filters={filters} onFilterChange={handleFilterChange} />
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          itemCodes={uniqueItemCodes}
        />
        <QuoteTable
          quotes={filteredAndSortedQuotes}
          onSelectPr={prNo => setSelectedPrForModal(prNo)}
          onEditQuote={q => {
            setQuoteToEdit(q);
            setShowEditModal(true);
          }}
        />
      </main>

      {selectedPrForModal && (
        <PRComparisonModal
          prNo={selectedPrForModal}
          allQuotes={processedQuotes}
          onClose={() => setSelectedPrForModal(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {showImportModal && (
        <ImportExportModal
          onClose={() => setShowImportModal(false)}
          onImportQuotes={handleImportQuotes}
        />
      )}

      {showEditModal && (
        <QuoteEditModal
          quoteToEdit={quoteToEdit}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveQuote}
          onDelete={handleDeleteQuote}
        />
      )}

      {showSqlModal && <SupabaseSqlModal onClose={() => setShowSqlModal(false)} />}

      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 mt-auto">
        <p>구매 견적 비교·납기 판정기 (PRD-S02) — Supabase DB 연동 및 인가 로그인 적용</p>
      </footer>
    </div>
  );
}
