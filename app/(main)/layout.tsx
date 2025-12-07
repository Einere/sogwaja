import { redirect } from 'next/navigation'
import { getServerUser } from '@/lib/supabase/auth'
import Navigation from '@/components/layout/Navigation'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getServerUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-md mx-auto bg-background min-h-screen">
        {children}
        
        <Navigation />
      </div>
    </div>
  )
}

