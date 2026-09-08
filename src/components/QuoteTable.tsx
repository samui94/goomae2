import React from 'react';
import { ProcessedQuoteItem } from '../types';
import { Award, ShieldAlert, AlertTriangle, Clock, CheckCircle2, FileText, ChevronRight, Edit2 } from 'lucide-react';

interface QuoteTableProps {
  quotes: ProcessedQuoteItem[];
  onSelectPr: (prNo: string) => void;
  onEditQuote: (quote: ProcessedQuoteItem) => void;
}

export const QuoteTable: React.FC<QuoteTableProps> = ({
  quotes,
  onSelectPr,
  onEditQuote,
}) => {
  if (quotes.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-2xs">
        <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">조회된 견적 데이터가 없습니다</h3>
        <p className="text-sm text-slate-500 mt-1">
          검색어나 필터 조건을 변경하거나, 파일 반입 및 샘플 초기화를 진행해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-4">견적ID / PR번호</th>
              <th className="py-3 px-4">품목코드 / 품목명</th>
              <th className="py-3 px-4">공급사</th>
              <th className="py-3 px-4 text-right">수량</th>
              <th className="py-3 px-4 text-right">단가 (KRW)</th>
              <th className="py-3 px-4 text-center">단가 판정</th>
              <th className="py-3 px-4 text-center">상태</th>
              <th className="py-3 px-4">약속 납기 (D-day)</th>
              <th className="py-3 px-4 text-center">납기 판정</th>
              <th className="py-3 px-4 text-right">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 text-xs sm:text-sm">
            {quotes.map(q => {
              return (
                <tr
                  key={q.quote_id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* ID & PR */}
                  <td className="py-3 px-4">
                    <div className="font-mono font-medium text-slate-900">{q.quote_id}</div>
                    <button
                      onClick={() => onSelectPr(q.pr_no)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-mono hover:underline inline-flex items-center gap-1 mt-0.5"
                    >
                      {q.pr_no}
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>

                  {/* Item Code & Name */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {q.item_code}
                      </span>
                      {q.hasNameDiscrepancy && (
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-700 border border-purple-200"
                          title="동일 품목코드 내 명칭 표기 상이 존재"
                        >
                          표기 상이
                        </span>
                      )}
                    </div>
                    <div className="font-medium text-slate-800 mt-1">{q.item_name}</div>
                  </td>

                  {/* Supplier */}
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {q.supplier}
                    {q.remark && <div className="text-[11px] text-slate-400 font-normal truncate max-w-[140px]">{q.remark}</div>}
                  </td>

                  {/* Qty */}
                  <td className="py-3 px-4 text-right font-mono text-slate-600">
                    {q.qty.toLocaleString()} {q.unit}
                  </td>

                  {/* Unit Price */}
                  <td className="py-3 px-4 text-right font-mono">
                    {q.unit_price !== null ? (
                      <span className="font-semibold text-slate-900">
                        {q.unit_price.toLocaleString()} 원
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">미기재</span>
                    )}
                    {q.deviationPercent !== null && (
                      <div
                        className={`text-[11px] ${
                          Math.abs(q.deviationPercent) > 30 ? 'text-rose-600 font-bold' : 'text-slate-500'
                        }`}
                      >
                        편차 {q.deviationPercent > 0 ? `+${q.deviationPercent}%` : `${q.deviationPercent}%`}
                      </div>
                    )}
                  </td>

                  {/* Price State & Lowest Price Badge */}
                  <td className="py-3 px-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      {q.isLowestPriceCandidate && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
                          <Award className="w-3 h-3 text-blue-600" />
                          최저가
                        </span>
                      )}
                      {q.priceState === '이상치' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
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
                      {q.priceState === '단가 미기재' && (
                        <span className="text-xs text-slate-400 italic">미기재</span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-xs font-semibold ${
                        q.status === '발주'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {q.status}
                    </span>
                  </td>

                  {/* Promised Date & D-day */}
                  <td className="py-3 px-4 font-mono text-xs">
                    {q.promised_date ? (
                      <div>
                        <div>{q.promised_date}</div>
                        {q.dDay !== null && (
                          <div
                            className={`inline-block font-bold mt-0.5 px-1.5 py-0.2 rounded text-[11px] ${
                              q.dDay < 0
                                ? 'bg-rose-100 text-rose-700'
                                : q.dDay <= 7
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {q.dDay === 0 ? 'D-DAY' : q.dDay < 0 ? `D+${Math.abs(q.dDay)} (지연)` : `D-${q.dDay}`}
                          </div>
                        )}
                        {q.exceedsRequiredDate && (
                          <div className="text-[10px] text-amber-600 font-sans mt-0.5">
                            ⚠️ 필요일({q.required_date}) 초과
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">미기재</span>
                    )}
                  </td>

                  {/* Delivery State */}
                  <td className="py-3 px-4 text-center">
                    {q.deliveryState === '지연' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        지연
                      </span>
                    )}
                    {q.deliveryState === '임박' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                        <Clock className="w-3 h-3 text-amber-600" />
                        임박
                      </span>
                    )}
                    {q.deliveryState === '정상' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        정상
                      </span>
                    )}
                    {q.deliveryState === '납기 미기재' && (
                      <span className="text-xs text-slate-400 italic">납기 미기재</span>
                    )}
                    {q.deliveryState === '판정 대상 아님' && (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onSelectPr(q.pr_no)}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                        title="PR 비교 상세 보기"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditQuote(q)}
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                        title="견적 수정"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
