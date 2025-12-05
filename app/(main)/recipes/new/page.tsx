'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'

export default function NewRecipePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()
  
  // 중복 호출 방지를 위한 ref
  const creatingRef = useRef(false)
  const createdRef = useRef(false)

  const createNewRecipe = useCallback(async () => {
    // 이미 생성 중이거나 생성 완료되었으면 중단
    if (creatingRef.current || createdRef.current) {
      return
    }
    
    if (!user) {
      console.error('User is not authenticated')
      return
    }

    // 생성 시작 표시
    creatingRef.current = true
    console.log('Creating recipe for user:', user.id)

    try {
      // 먼저 사용자 세션 확인
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        console.error('Session error:', sessionError)
        throw new Error('세션 확인 실패: ' + sessionError.message)
      }
      if (!sessionData.session) {
        console.error('No active session')
        throw new Error('활성 세션이 없습니다. 다시 로그인해주세요.')
      }

      console.log('Session confirmed, inserting recipe...')

      const { data, error } = await supabase
        .from('recipes')
        .insert({
          title: '새 조리법',
          user_id: user.id,
        })
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        })
        
        // 일반적인 에러 코드에 대한 안내
        if (error.code === '42501') {
          throw new Error('권한 오류: RLS 정책을 확인해주세요. Supabase 스키마가 제대로 적용되었는지 확인하세요.')
        } else if (error.code === '42P01') {
          throw new Error('테이블이 존재하지 않습니다: Supabase 스키마를 실행해주세요.')
        } else if (error.code === '23503') {
          throw new Error('외래 키 제약 조건 오류: user_id가 유효하지 않습니다.')
        }
        
        throw error
      }
      
      if (data) {
        console.log('Recipe created successfully:', data.id)
        // 생성 완료 표시
        createdRef.current = true
        router.push(`/recipes/${data.id}`)
      } else {
        throw new Error('No data returned from insert')
      }
    } catch (error: unknown) {
      console.error('Error creating recipe:', error)
      // 에러 발생 시 생성 중 플래그 해제 (재시도 가능하도록)
      creatingRef.current = false
      
      const errorObj = error as { message?: string; details?: string; hint?: string; code?: string }
      const errorMessage = errorObj?.message || '알 수 없는 오류가 발생했습니다.'
      const errorDetails = errorObj?.details || errorObj?.hint || ''
      const errorCode = errorObj?.code || ''
      
      let fullMessage = `조리법 생성 중 오류가 발생했습니다.\n\n${errorMessage}`
      if (errorCode) {
        fullMessage += `\n\n에러 코드: ${errorCode}`
      }
      if (errorDetails) {
        fullMessage += `\n\n${errorDetails}`
      }
      fullMessage += '\n\n브라우저 콘솔을 확인해주세요.'
      
      alert(fullMessage)
      router.push('/recipes')
    }
  }, [user, supabase, router])

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    // 중복 호출 방지: 이미 생성 중이거나 생성 완료되었으면 실행하지 않음
    if (creatingRef.current || createdRef.current) {
      return
    }

    createNewRecipe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, authLoading]) // user 객체 참조가 아닌 user.id를 의존성으로 사용하여 중복 실행 방지

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">조리법 생성 중...</p>
    </div>
  )
}

