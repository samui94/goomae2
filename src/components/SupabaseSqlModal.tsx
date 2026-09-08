import React, { useState } from 'react';
import { X, Copy, Check, Code2 } from 'lucide-react';

interface SupabaseSqlModalProps {
  onClose: () => void;
}

const SUPABASE_SCHEMA_SQL = `-- ==========================================
-- 구매 견적 비교·납기 판정기 Supabase DB 스키마
-- ==========================================

create table if not exists public.purchase_quotes (
  id uuid default gen_random_uuid() primary key,
  quote_id text not null unique,
  pr_no text not null,
  item_code text not null,
  item_name text not null,
  supplier text not null,
  unit text not null,
  qty numeric not null,
  unit_price numeric,
  currency text not null default 'KRW',
  quote_date date not null,
  required_date date not null,
  promised_date date,
  status text not null default '견적',
  remark text,
  user_id uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) 활성화
alter table public.purchase_quotes enable row level security;

-- 인증된 사용자(Authenticated) 전체 CRUD 정책 설정
create policy "Allow authenticated users to read quotes"
  on public.purchase_quotes for select
  to authenticated
  using (true);

create policy "Allow authenticated users to insert quotes"
  on public.purchase_quotes for insert
  to authenticated
  with check (true);

create policy "Allow authenticated users to update quotes"
  on public.purchase_quotes for update
  to authenticated
  using (true);

create policy "Allow authenticated users to delete quotes"
  on public.purchase_quotes for delete
  to authenticated
  using (true);
`;

export const SupabaseSqlModal: React.FC<SupabaseSqlModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold">Supabase DB 생성 SQL 스크립트</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-sm text-slate-700">
          <p className="text-xs text-slate-500">
            Supabase 프로젝트 대시보드의 <strong className="text-slate-700">SQL Editor</strong>에 아래 스크립트를 붙여넣고 <strong className="text-slate-700">Run</strong> 버튼을 누르면 테이블과 RLS 정책이 생성됩니다.
          </p>

          <div className="relative">
            <button
              onClick={handleCopy}
              className="absolute right-3 top-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-white hover:bg-slate-700 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? '복사됨!' : 'SQL 복사하기'}
            </button>
            <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed max-h-96">
              {SUPABASE_SCHEMA_SQL}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-900 transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
