import React, { useState } from 'react';
import { getSupabaseClient, isSupabaseConfigured, saveSupabaseConfig, getStoredUrl, getStoredKey } from '../lib/supabase';
import { Lock, Mail, KeyRound, AlertCircle, CheckCircle2, Database, Code, Settings, Globe, Shield } from 'lucide-react';

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

  // Supabase dynamic config state
  const [showConfig, setShowConfig] = useState(!isSupabaseConfigured());
  const [inputUrl, setInputUrl] = useState(getStoredUrl());
  const [inputKey, setInputKey] = useState(getStoredKey());

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl || !inputKey) {
      setErrorMsg('Supabase URL과 Anon Key를 모두 입력해주세요.');
      return;
    }
    saveSupabaseConfig(inputUrl, inputKey);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = getSupabaseClient();
    if (!client) {
      setErrorMsg('Supabase 설정이 완료되지 않았습니다. 아래 [Supabase 설정]에서 URL과 Key를 입력해주세요.');
      setShowConfig(true);
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isSignUp) {
        const { error } = await client.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setSuccessMsg('회원가입 요청이 완료되었습니다. 이메일 인증을 확인하시거나 로그인해주세요.');
      } else {
        const { error } = await client.auth.signInWithPassword({
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

        {/* Config Toggle or Form */}
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-blue-600" />
              Supabase 연동 설정
            </span>
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              {showConfig ? '설정 닫기' : isSupabaseConfigured() ? '설정 수정' : '설정 입력하기'}
            </button>
          </div>

          {showConfig ? (
            <form onSubmit={handleSaveConfig} className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Supabase URL</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="url"
                    required
                    value={inputUrl}
                    onChange={e => setInputUrl(e.target.value)}
                    placeholder="https://xyzproject.supabase.co"
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Supabase Anon Key</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={inputKey}
                    onChange={e => setInputKey(e.target.value)}
                    placeholder="eyJhbGciOi..."
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium transition-colors shadow-2xs"
              >
                Supabase 설정 저장 및 적용
              </button>
            </form>
          ) : (
            <div className="text-xs text-slate-600 flex items-center justify-between">
              <span>연결 상태: {isSupabaseConfigured() ? <strong className="text-emerald-600">설정 완료됨</strong> : <strong className="text-amber-600">미설정</strong>}</span>
              <span className="font-mono text-[10px] text-slate-400 truncate max-w-[200px]">{getStoredUrl() || 'URL 없음'}</span>
            </div>
          )}
        </div>

        {/* Login Form */}
        <form onSubmit={handleAuth} className="p-6 space-y-4">
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
            disabled={loading || !isSupabaseConfigured()}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold rounded-xl text-sm transition-colors shadow-md shadow-blue-600/20"
          >
            {loading ? '처리 중...' : isSignUp ? '회원가입 (Sign Up)' : '로그인 (Sign In)'}
          </button>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              {isSignUp ? '이미 계정이 있으신가요? 로그인' : '인가된 새 사용자 회원가입'}
            </button>
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-2">
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
