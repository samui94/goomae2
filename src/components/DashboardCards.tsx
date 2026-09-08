import React from 'react';
import { AlertTriangle, Clock, ShieldAlert, FileText, CheckCircle2, HelpCircle } from 'lucide-react';
import { SummaryStats, FilterState } from '../types';

interface DashboardCardsProps {
  stats: SummaryStats;
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({
  stats,
  filters,
  onFilterChange,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* Delayed */}
      <div
        onClick={() =>
          onFilterChange({
            deliveryFilter: filters.deliveryFilter === '지연' ? '전체' : '지연',
            statusFilter: '발주',
          })
        }
        className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-2xs hover:shadow-md ${
          filters.deliveryFilter === '지연' && filters.statusFilter === '발주'
            ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/30'
            : 'border-slate-200 hover:border-rose-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">납기 지연</span>
          <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-rose-600">{stats.delayedCount}</span>
          <span className="text-xs text-slate-400">발주 건 기준</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">D-DAY 경과</p>
      </div>

      {/* Impending */}
      <div
        onClick={() =>
          onFilterChange({
            deliveryFilter: filters.deliveryFilter === '임박' ? '전체' : '임박',
            statusFilter: '발주',
          })
        }
        className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-2xs hover:shadow-md ${
          filters.deliveryFilter === '임박' && filters.statusFilter === '발주'
            ? 'border-amber-500 ring-2 ring-amber-200 bg-amber-50/30'
            : 'border-slate-200 hover:border-amber-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">납기 임박</span>
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-amber-600">{stats.impendingCount}</span>
          <span className="text-xs text-slate-400">0~7일 이내</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">집중 관리 필요</p>
      </div>

      {/* Outlier */}
      <div
        onClick={() =>
          onFilterChange({
            priceStateFilter: filters.priceStateFilter === '이상치' ? '전체' : '이상치',
          })
        }
        className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-2xs hover:shadow-md ${
          filters.priceStateFilter === '이상치'
            ? 'border-purple-500 ring-2 ring-purple-200 bg-purple-50/30'
            : 'border-slate-200 hover:border-purple-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">단가 이상치</span>
          <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-purple-600">{stats.outlierCount}</span>
          <span className="text-xs text-slate-400">중앙값 ±30%초과</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">단가 오기 검토</p>
      </div>

      {/* Discrepancy */}
      <div
        onClick={() =>
          onFilterChange({
            discrepancyOnly: !filters.discrepancyOnly,
          })
        }
        className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-2xs hover:shadow-md ${
          filters.discrepancyOnly
            ? 'border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50/30'
            : 'border-slate-200 hover:border-indigo-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">표기 상이</span>
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-indigo-600">{stats.discrepancyCount}</span>
          <span className="text-xs text-slate-400">동일 품목코드</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">명칭 불일치 품목</p>
      </div>

      {/* Normal Delivery */}
      <div
        onClick={() =>
          onFilterChange({
            deliveryFilter: filters.deliveryFilter === '정상' ? '전체' : '정상',
            statusFilter: '발주',
          })
        }
        className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-2xs hover:shadow-md ${
          filters.deliveryFilter === '정상' && filters.statusFilter === '발주'
            ? 'border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50/30'
            : 'border-slate-200 hover:border-emerald-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">납기 정상</span>
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-emerald-600">{stats.normalDeliveryCount}</span>
          <span className="text-xs text-slate-400">D+8 이상</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">발주건 기준 안전</p>
      </div>

      {/* Missing data */}
      <div
        onClick={() =>
          onFilterChange({
            priceStateFilter: filters.priceStateFilter === '단가 미기재' ? '전체' : '단가 미기재',
          })
        }
        className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-2xs hover:shadow-md ${
          filters.priceStateFilter === '단가 미기재'
            ? 'border-slate-500 ring-2 ring-slate-200 bg-slate-100'
            : 'border-slate-200 hover:border-slate-400'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">결측 데이터</span>
          <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
            <HelpCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-slate-700">
            {stats.missingPriceCount + stats.missingDeliveryCount}
          </span>
          <span className="text-xs text-slate-400">공란 행</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">단가 {stats.missingPriceCount} / 납기 {stats.missingDeliveryCount}</p>
      </div>
    </div>
  );
};
