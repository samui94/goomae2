import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Lock, Mail, KeyRound, AlertCircle, CheckCircle2, Database, Code } from 'lucide-react';

interface AuthScreenProps {
  onBypassDemo: () => void;
  onOpenSqlModal: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onBypassDemo, onOpenSqlModal }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setErrorMsg('Supabase 환경 변수(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)가 설정되지 않았습니다.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setSuccessMsg('회원가입 요청이 완료되었습니다. 이메일 인증을 확인하시거나 로그인해주세요.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // Successful login will trigger onAuthStateChange in App.tsx
      }
    } catch (err: any) {
      setErrorMsg(err.message || '인증 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-800 w-full max-w-md overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="bg-slate-900 px-8 py-6 text-white text-center border-b border-slate-800">
          <div className="mx-auto w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white mb-3 shadow-lg shadow-blue-500/30">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">구매 견적 비교·납기 판정기</h1>
          <p className="text-xs text-slate-400 mt-1">Supabase 인가 사용자 로그인</p>
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} className="p-8 space-y-4">
          {!isSupabaseConfigured && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs space-y-1">
              <p className="font-semibold">⚠️ Supabase 미설정 상태</p>
              <p>환경변수 <code>VITE_SUPABASE_URL</code>과 <code>VITE_SUPABASE_ANON_KEY</code>가 비어있습니다. 데모 모드로 체험하시거나 설정을 완료해주세요.</p>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">이메일 계정</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="user@company.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">비밀번호</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !isSupabaseConfigured}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold rounded-xl text-sm transition-colors shadow-md shadow-blue-600/20"
          >
            {loading ? '처리 중...' : isSignUp ? '회원가입 (Sign Up)' : '로그인 (Sign In)'}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              {isSignUp ? '이미 계정이 있으신가요? 로그인' : '인가된 새 사용자 회원가입'}
            </button>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-2">
            <button
              type="button"
              onClick={onOpenSqlModal}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Code className="w-4 h-4 text-slate-500" />
              Supabase DB SQL 스키마 보기
            </button>

            <button
              type="button"
              onClick={onBypassDemo}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
            >
              <Database className="w-4 h-4 text-slate-400" />
              로컬(LocalStorage) 데모 모드로 바로 시작
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
