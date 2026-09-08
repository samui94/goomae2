import React from 'react';
import { FileSpreadsheet, Upload, PlusCircle, RotateCcw, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { SummaryStats } from '../types';

interface HeaderProps {
  stats: SummaryStats;
  onOpenImport: () => void;
  onOpenAdd: () => void;
  onResetSample: () => void;
  onExportCsv: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  onOpenImport,
  onOpenAdd,
  onResetSample,
  onExportCsv,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-100 text-blue-800">
                PRD-S02 기준
              </span>
              <span className="text-xs text-slate-500">기준일: 2026-08-27</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
              <FileSpreadsheet className="w-7 h-7 text-blue-600" />
              구매 견적 비교·납기 판정기
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              구매요청(PR)별 복수 공급사 견적 비교, 최저가 후보 선정, 단가 이상치 및 납기 3구간 자동 판정
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onExportCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors shadow-2xs"
              title="현재 견적 목록 CSV 내보내기"
            >
              CSV 내보내기
            </button>

            <button
              onClick={onOpenImport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Upload className="w-4 h-4 text-slate-500" />
              파일 반입 / 붙여넣기
            </button>

            <button
              onClick={onOpenAdd}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-2xs"
            >
              <PlusCircle className="w-4 h-4" />
              견적 추가
            </button>

            <button
              onClick={onResetSample}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors shadow-2xs"
              title="초기 샘플 데이터(80행)로 복원"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              샘플 초기화
            </button>
          </div>
        </div>

        {/* Quick summary status bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs text-slate-600">
          <span className="font-medium text-slate-900">총 견적 행: {stats.totalRows}건 ({stats.totalPrs}개 PR)</span>
          <span className="text-slate-300">|</span>
          <span className="inline-flex items-center gap-1 text-rose-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            납기 지연: {stats.delayedCount}건
          </span>
          <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            납기 임박: {stats.impendingCount}건
          </span>
          <span className="inline-flex items-center gap-1 text-purple-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            단가 이상치: {stats.outlierCount}건
          </span>
          <span className="inline-flex items-center gap-1 text-indigo-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            표기 상이: {stats.discrepancyCount}품목
          </span>
          <span className="inline-flex items-center gap-1 text-slate-500">
            결측 (단가 {stats.missingPriceCount}/납기 {stats.missingDeliveryCount})
          </span>
        </div>
      </div>
    </header>
  );
};
