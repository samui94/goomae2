import React, { useState } from 'react';
import { QuoteItem } from '../types';
import { X, Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface ImportExportModalProps {
  onClose: () => void;
  onImportQuotes: (quotes: QuoteItem[]) => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  onClose,
  onImportQuotes,
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'paste'>('file');
  const [pastedText, setPastedText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Handle file upload (CSV or XLSX)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const parsed = parseRawRows(results.data as any[]);
            if (parsed.length === 0) {
              setErrorMsg('유효한 데이터 행을 찾을 수 없습니다.');
              return;
            }
            onImportQuotes(parsed);
            setSuccessMsg(`총 ${parsed.length}건의 견적 데이터가 성공적으로 반입되었습니다.`);
            setTimeout(() => onClose(), 1500);
          } catch (err: any) {
            setErrorMsg(`CSV 파싱 오류: ${err.message}`);
          }
        },
        error: (err) => {
          setErrorMsg(`CSV 읽기 오류: ${err.message}`);
        }
      });
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);
          const parsed = parseRawRows(data as any[]);
          if (parsed.length === 0) {
            setErrorMsg('엑셀 시트에서 유효한 데이터를 찾을 수 없습니다.');
            return;
          }
          onImportQuotes(parsed);
          setSuccessMsg(`총 ${parsed.length}건의 엑셀 견적 데이터가 성공적으로 반입되었습니다.`);
          setTimeout(() => onClose(), 1500);
        } catch (err: any) {
          setErrorMsg(`엑셀 파싱 오류: ${err.message}`);
        }
      };
      reader.readAsBinaryString(file);
    } else {
      setErrorMsg('지원하지 않는 파일 형식입니다. CSV 또는 XLSX 파일을 업로드해주세요.');
    }
  };

  // Handle text paste import (CSV / Tab separated)
  const handlePasteImport = () => {
    if (!pastedText.trim()) {
      setErrorMsg('붙여넣을 텍스트가 비어 있습니다.');
      return;
    }
    setErrorMsg(null);
    setSuccessMsg(null);

    // Try parsing as CSV / TSV with PapaParse
    Papa.parse(pastedText, {
      header: true,
      skipEmptyLines: true,
      delimiter: pastedText.includes('\t') ? '\t' : ',',
      complete: (results) => {
        try {
          const parsed = parseRawRows(results.data as any[]);
          if (parsed.length === 0) {
            setErrorMsg('유효한 데이터 행을 찾을 수 없습니다. 컬럼 헤더를 확인해주세요.');
            return;
          }
          onImportQuotes(parsed);
          setSuccessMsg(`총 ${parsed.length}건의 견적 데이터가 붙여넣기를 통해 반입되었습니다.`);
          setTimeout(() => onClose(), 1500);
        } catch (err: any) {
          setErrorMsg(`텍스트 파싱 오류: ${err.message}`);
        }
      },
      error: (err) => {
        setErrorMsg(`파싱 오류: ${err.message}`);
      }
    });
  };

  // Helper to map and sanitize raw imported row objects into QuoteItem
  const parseRawRows = (rows: any[]): QuoteItem[] => {
    return rows.map((row, idx) => {
      // Handle flexible header names (Korean or English)
      const quote_id = row.quote_id || row['견적ID'] || `QT-${(idx + 100).toString().padStart(3, '0')}`;
      const pr_no = row.pr_no || row['PR번호'] || row['PR No'] || 'PR-2026-999';
      const item_code = row.item_code || row['품목코드'] || 'IT-999';
      const item_name = row.item_name || row['품목명'] || '기타 품목';
      const supplier = row.supplier || row['공급사'] || '기타 공급사';
      const unit = row.unit || row['단위'] || 'EA';
      
      const qtyRaw = row.qty !== undefined ? row.qty : row['수량'];
      const qty = Number(qtyRaw) > 0 ? Number(qtyRaw) : 1;

      const priceRaw = row.unit_price !== undefined ? row.unit_price : (row['단가'] || row['unit_price']);
      let unit_price: number | null = null;
      if (priceRaw !== null && priceRaw !== undefined && priceRaw !== '' && priceRaw !== '-') {
        const cleanedPrice = Number(String(priceRaw).replace(/[^0-9.-]+/g, ''));
        unit_price = isNaN(cleanedPrice) ? null : cleanedPrice;
      }

      const currency = row.currency || row['통화'] || 'KRW';
      const quote_date = row.quote_date || row['견적일자'] || '2026-08-01';
      const required_date = row.required_date || row['필요일자'] || '2026-09-15';
      
      const promisedRaw = row.promised_date !== undefined ? row.promised_date : (row['약속납기'] || row['promised_date']);
      let promised_date: string | null = null;
      if (promisedRaw !== null && promisedRaw !== undefined && String(promisedRaw).trim() !== '' && String(promisedRaw).trim() !== '-') {
        promised_date = String(promisedRaw).trim();
      }

      const statusRaw = row.status || row['상태'] || '견적';
      const status = String(statusRaw).includes('발주') ? '발주' : '견적';

      const remark = row.remark || row['비고'] || '';

      return {
        quote_id: String(quote_id).trim(),
        pr_no: String(pr_no).trim(),
        item_code: String(item_code).trim(),
        item_name: String(item_name).trim(),
        supplier: String(supplier).trim(),
        unit: String(unit).trim(),
        qty,
        unit_price,
        currency: String(currency).trim(),
        quote_date: String(quote_date).trim(),
        required_date: String(required_date).trim(),
        promised_date,
        status,
        remark: String(remark).trim(),
      };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">견적 데이터 반입 (CSV / XLSX / 붙여넣기)</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6">
          <button
            onClick={() => setActiveTab('file')}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'file'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            파일 업로드 (CSV / XLSX)
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'paste'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            텍스트 붙여넣기
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === 'file' ? (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors bg-slate-50/50">
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-700">CSV 또는 Excel (.xlsx) 파일을 선택하세요</p>
                <p className="text-xs text-slate-400 mt-1">ERP 내보내기 파일 및 지정 포맷 지원</p>
                <label className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg cursor-pointer hover:bg-blue-700 transition-colors shadow-2xs">
                  파일 선택
                  <input
                    type="file"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="text-xs text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700">필수 컬럼 헤더 안내:</p>
                <p><code>quote_id</code>, <code>pr_no</code>, <code>item_code</code>, <code>item_name</code>, <code>supplier</code>, <code>unit</code>, <code>qty</code>, <code>unit_price</code>, <code>currency</code>, <code>quote_date</code>, <code>required_date</code>, <code>promised_date</code>, <code>status</code></p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                탭(Tab) 또는 쉼표(,)로 구분된 견적 데이터를 붙여넣으세요:
              </label>
              <textarea
                rows={8}
                value={pastedText}
                onChange={e => setPastedText(e.target.value)}
                placeholder="quote_id,pr_no,item_code,item_name,supplier,unit,qty,unit_price,currency,quote_date,required_date,promised_date,status&#10;QT-001,PR-2026-001,IT-001,고순도 톨루엔,대한케미칼,t,10,1250000,KRW,2026-08-01,2026-09-10,2026-08-25,견적"
                className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end">
                <button
                  onClick={handlePasteImport}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-2xs"
                >
                  붙여넣기 데이터 반입
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-300 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
