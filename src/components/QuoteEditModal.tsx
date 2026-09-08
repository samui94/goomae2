import React, { useState, useEffect } from 'react';
import { QuoteItem } from '../types';
import { X, Save, Trash2 } from 'lucide-react';

interface QuoteEditModalProps {
  quoteToEdit: QuoteItem | null;
  onClose: () => void;
  onSave: (quote: QuoteItem, isEditing: boolean) => void;
  onDelete?: (quoteId: string) => void;
}

export const QuoteEditModal: React.FC<QuoteEditModalProps> = ({
  quoteToEdit,
  onClose,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState<QuoteItem>({
    quote_id: `QT-${Math.floor(Math.random() * 900 + 100)}`,
    pr_no: 'PR-2026-050',
    item_code: 'IT-001',
    item_name: '고순도 톨루엔',
    supplier: '대한케미칼',
    unit: 't',
    qty: 10,
    unit_price: 1200000,
    currency: 'KRW',
    quote_date: '2026-08-01',
    required_date: '2026-09-15',
    promised_date: '2026-08-28',
    status: '견적',
    remark: '',
  });

  const isEditing = !!quoteToEdit;

  useEffect(() => {
    if (quoteToEdit) {
      setFormData(quoteToEdit);
    }
  }, [quoteToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, isEditing);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">
            {isEditing ? `견적 수정 (${formData.quote_id})` : '신규 견적 단건 등록'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">견적 ID</label>
              <input
                type="text"
                required
                disabled={isEditing}
                value={formData.quote_id}
                onChange={e => setFormData({ ...formData, quote_id: e.target.value })}
                className="w-full p-2 bg-slate-100 border border-slate-300 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">PR 번호 (구매요청)</label>
              <input
                type="text"
                required
                value={formData.pr_no}
                onChange={e => setFormData({ ...formData, pr_no: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">품목 코드</label>
              <input
                type="text"
                required
                value={formData.item_code}
                onChange={e => setFormData({ ...formData, item_code: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">품목명</label>
              <input
                type="text"
                required
                value={formData.item_name}
                onChange={e => setFormData({ ...formData, item_name: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block font-medium text-slate-700 mb-1">공급사</label>
              <input
                type="text"
                required
                value={formData.supplier}
                onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">수량 / 단위</label>
              <div className="flex gap-1">
                <input
                  type="number"
                  required
                  min="0.01"
                  step="any"
                  value={formData.qty}
                  onChange={e => setFormData({ ...formData, qty: Number(e.target.value) })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  required
                  value={formData.unit}
                  onChange={e => setFormData({ ...formData, unit: e.target.value })}
                  className="w-16 p-2 bg-slate-50 border border-slate-300 rounded-lg text-center"
                />
              </div>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">단가 (KRW)</label>
              <input
                type="number"
                min="0"
                value={formData.unit_price !== null ? formData.unit_price : ''}
                onChange={e =>
                  setFormData({
                    ...formData,
                    unit_price: e.target.value === '' ? null : Number(e.target.value),
                  })
                }
                placeholder="공란 가능"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">견적 접수일</label>
              <input
                type="date"
                required
                value={formData.quote_date}
                onChange={e => setFormData({ ...formData, quote_date: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">요청 필요일</label>
              <input
                type="date"
                required
                value={formData.required_date}
                onChange={e => setFormData({ ...formData, required_date: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">약속 납기일</label>
              <input
                type="date"
                value={formData.promised_date || ''}
                onChange={e =>
                  setFormData({
                    ...formData,
                    promised_date: e.target.value === '' ? null : e.target.value,
                  })
                }
                placeholder="공란 가능"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">진행 상태</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
              >
                <option value="견적">견적 (비교중)</option>
                <option value="발주">발주 (확정)</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">비고</label>
              <input
                type="text"
                value={formData.remark || ''}
                onChange={e => setFormData({ ...formData, remark: e.target.value })}
                placeholder="특이사항 입력"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Footer inside form */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('정말 이 견적 항목을 삭제하시겠습니까?')) {
                    onDelete(formData.quote_id);
                    onClose();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                삭제
              </button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 font-medium hover:bg-slate-300 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-2xs"
              >
                <Save className="w-4 h-4" />
                저장
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
