import React from 'react';
import { Search, Filter, RotateCcw, Layers, ArrowUpDown } from 'lucide-react';
import { FilterState } from '../types';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  itemCodes: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  itemCodes,
}) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs mb-4 space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="PR번호, 견적ID, 품목명/코드, 공급사 검색..."
            value={filters.searchQuery}
            onChange={e => onFilterChange({ searchQuery: e.target.value })}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Action / Toggle buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* PR Group Toggle */}
          <button
            onClick={() => onFilterChange({ groupByPr: !filters.groupByPr })}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
              filters.groupByPr
                ? 'bg-blue-50 text-blue-700 border-blue-300'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            PR 그룹별 뷰
          </button>

          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            필터 초기화
          </button>
        </div>
      </div>

      {/* Select Filters Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100 text-xs">
        {/* Status Filter */}
        <div>
          <label className="block font-medium text-slate-600 mb-1">상태 (견적/발주)</label>
          <select
            value={filters.statusFilter}
            onChange={e => onFilterChange({ statusFilter: e.target.value as any })}
            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="전체">전체 상태</option>
            <option value="견적">견적 (비교중)</option>
            <option value="발주">발주 (확정)</option>
          </select>
        </div>

        {/* Delivery State Filter */}
        <div>
          <label className="block font-medium text-slate-600 mb-1">납기 판정</label>
          <select
            value={filters.deliveryFilter}
            onChange={e => onFilterChange({ deliveryFilter: e.target.value as any })}
            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="전체">전체 납기구간</option>
            <option value="지연">지연 (D &lt; 0)</option>
            <option value="임박">임박 (0~7일)</option>
            <option value="정상">정상 (8일이상)</option>
            <option value="납기 미기재">납기 미기재</option>
          </select>
        </div>

        {/* Price State Filter */}
        <div>
          <label className="block font-medium text-slate-600 mb-1">단가 이상치 여부</label>
          <select
            value={filters.priceStateFilter}
            onChange={e => onFilterChange({ priceStateFilter: e.target.value as any })}
            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="전체">전체 단가상태</option>
            <option value="정상">정상 단가</option>
            <option value="이상치">이상치 (&gt;±30%)</option>
            <option value="단가 미기재">단가 미기재</option>
          </select>
        </div>

        {/* Item Code Filter */}
        <div>
          <label className="block font-medium text-slate-600 mb-1">품목 코드</label>
          <select
            value={filters.selectedItemCode}
            onChange={e => onFilterChange({ selectedItemCode: e.target.value })}
            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="전체">전체 품목코드</option>
            {itemCodes.map(code => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block font-medium text-slate-600 mb-1">정렬 기준</label>
          <select
            value={filters.sortBy}
            onChange={e => onFilterChange({ sortBy: e.target.value as any })}
            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="default">기본 (지연순 → PR번호)</option>
            <option value="priceAsc">단가 낮은순 (오름차순)</option>
            <option value="deliveryUrgency">납기 임박/지연순</option>
            <option value="prNo">PR번호순</option>
          </select>
        </div>
      </div>
    </div>
  );
};
