import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  
  return (
    <div>
      {children}
    </div>
  )
} 