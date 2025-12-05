'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { GoogleIcon, AppleIcon } from '@/components/icons'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    try {
      setLoading(true)
      
      // Check if Supabase URL is configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        throw new Error('Supabase URL이 설정되지 않았습니다. 환경 변수를 확인해주세요.')
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })
      
      if (error) {
        console.error('OAuth error:', error)
        throw error
      }
      
      // OAuth는 리디렉션을 수행하므로 여기서는 성공으로 간주
      // 실제 인증은 콜백 URL에서 처리됩니다
    } catch (error) {
      console.error('Error signing in:', error)
      const errorMessage = error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.'
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-center mb-8">구움과자 조리법</h1>
          <p className="text-center text-gray-600 mb-8">
            조리법을 저장하고 관리하려면 로그인이 필요합니다.
          </p>

          <div className="space-y-4">
            <button
              onClick={() => handleSocialLogin('google')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <GoogleIcon />
              Google로 로그인
            </button>


            <button
              onClick={() => handleSocialLogin('apple')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-black rounded-lg px-4 py-3 text-white font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <AppleIcon />
              Apple로 로그인
            </button>
          </div>

          <p className="text-xs text-center text-gray-500 mt-6">
            로그인 시 조리법 저장 및 관리 기능을 사용할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  )
}

