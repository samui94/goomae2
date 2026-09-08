import React, { useState } from 'react';
import { ProcessedQuoteItem } from '../types';
import { X, Award, ShieldAlert, Check, Copy, AlertTriangle, ArrowRight } from 'lucide-react';

interface PRComparisonModalProps {
  prNo: string;
  allQuotes: ProcessedQuoteItem[];
  onClose: () => void;
  onUpdateStatus: (quoteId: string, newStatus: '견적' | '발주') => void;
}

export const PRComparisonModal: React.FC<PRComparisonModalProps> = ({
  prNo,
  allQuotes,
  onClose,
  onUpdateStatus,
}) => {
  const [copied, setCopied] = useState(false);
  const prQuotes = allQuotes.filter(q => q.pr_no === prNo);

  if (prQuotes.length === 0) return null;

  const sampleItem = prQuotes[0];

  // Copy table to clipboard in tab-separated format
  const handleCopyTable = () => {
    const headers = ['견적ID', '품목코드', '품목명', '공급사', '수량', '단가(KRW)', '편차율', '단가판정', '상태', '약속납기', '납기판정'];
    const rows = prQuotes.map(q => [
      q.quote_id,
      q.item_code,
      q.item_name,
      q.supplier,
      `${q.qty} ${q.unit}`,
      q.unit_price !== null ? q.unit_price : '미기재',
      q.deviationPercent !== null ? `${q.deviationPercent}%` : '-',
      q.priceState,
      q.status,
      q.promised_date || '미기재',
      q.deliveryState,
    ]);

    const text = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">
                {prNo}
              </span>
              <span className="text-xs text-slate-500 font-mono">품목: {sampleItem.item_code} ({sampleItem.item_name})</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">구매요청(PR) 공급사별 견적 비교 및 발주 지정</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              해당 PR에 접수된 복수 공급사 견적을 비교하고 최저가 후보 및 발주 상태를 확인합니다.
            </p>
            <button
              onClick={handleCopyTable}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-slate-300"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              {copied ? '복사 완료!' : '비교표 클립보드 복사'}
            </button>
          </div>

          {/* Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 font-semibold text-slate-700">
                  <th className="py-3 px-4">견적ID</th>
                  <th className="py-3 px-4">공급사</th>
                  <th className="py-3 px-4 text-right">수량</th>
                  <th className="py-3 px-4 text-right">단가 (KRW)</th>
                  <th className="py-3 px-4 text-center">단가 판정</th>
                  <th className="py-3 px-4 text-center">상태 (발주/견적)</th>
                  <th className="py-3 px-4">약속 납기</th>
                  <th className="py-3 px-4 text-center">납기 판정</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {prQuotes.map(q => {
                  return (
                    <tr
                      key={q.quote_id}
                      className={`hover:bg-slate-50 transition-colors ${
                        q.status === '발주' ? 'bg-emerald-50/40 font-medium' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">{q.quote_id}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{q.supplier}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600">{q.qty} {q.unit}</td>
                      <td className="py-3 px-4 text-right font-mono">
                        {q.unit_price !== null ? (
                          <span className="font-bold text-slate-900">{q.unit_price.toLocaleString()} 원</span>
                        ) : (
                          <span className="text-slate-400 italic">미기재</span>
                        )}
                        {q.deviationPercent !== null && (
                          <div className={`text-[11px] ${Math.abs(q.deviationPercent) > 30 ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                            중앙값 대비 {q.deviationPercent > 0 ? `+${q.deviationPercent}%` : `${q.deviationPercent}%`}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          {q.isLowestPriceCandidate && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                              <Award className="w-3 h-3 text-blue-600" />
                              최저가 후보
                            </span>
                          )}
                          {q.priceState === '이상치' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                              <ShieldAlert className="w-3 h-3 text-purple-600" />
                              이상치
                            </span>
                          )}
                          {q.priceState === '정상' && !q.isLowestPriceCandidate && (
                            <span className="text-xs text-slate-500">정상</span>
                          )}
                          {q.priceState === '비교 불가' && (
                            <span className="text-xs text-slate-400">비교불가</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              q.status === '발주'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {q.status}
                          </span>
                          <button
                            onClick={() => onUpdateStatus(q.quote_id, q.status === '발주' ? '견적' : '발주')}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 transition-colors"
                          >
                            {q.status === '발주' ? '견적으로 변경' : '발주로 지정'}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">
                        {q.promised_date ? (
                          <div>
                            <div>{q.promised_date}</div>
                            {q.dDay !== null && (
                              <span
                                className={`inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                  q.dDay < 0
                                    ? 'bg-rose-100 text-rose-700'
                                    : q.dDay <= 7
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {q.dDay === 0 ? 'D-DAY' : q.dDay < 0 ? `지연(D+${Math.abs(q.dDay)})` : `D-${q.dDay}`}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">미기재</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            q.deliveryState === '지연'
                              ? 'bg-rose-100 text-rose-800'
                              : q.deliveryState === '임박'
                              ? 'bg-amber-100 text-amber-800'
                              : q.deliveryState === '정상'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'text-slate-400'
                          }`}
                        >
                          {q.deliveryState}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              💡 PR 비교 안내
            </p>
            <p>
              • 이상치로 판정된 견적은 최저가 후보 선정에서 자동으로 제외됩니다.
            </p>
            <p>
              • 발주 건의 납기가 기준일(2026-08-27)보다 이전인 경우 <b>납기 지연</b>으로 적색 표시됩니다.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-900 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
