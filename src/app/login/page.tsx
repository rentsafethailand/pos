'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Car } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (authError) throw authError

      // Get user role from database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, status, first_name')
        .eq('id', authData.user?.id)
        .single()

      if (userError) throw userError

      // Check if user is suspended
      if (userData.status === 'suspended') {
        await supabase.auth.signOut()
        throw new Error('บัญชีของคุณถูกระงับ กรุณาติดต่อผู้ดูแลระบบ')
      }

      // Redirect based on role
      toast.success(`ยินดีต้อนรับ ${userData.first_name}!`)

      if (userData.role === 'admin') {
        router.push('/admin/dashboard')
      } else if (userData.role === 'partner') {
        router.push('/partner/dashboard')
      } else {
        router.push('/customer/dashboard')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error.message || 'เข้าสู่ระบบไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-2">
            <Car className="h-10 w-10 text-blue-600" />
            <span className="text-3xl font-bold text-gray-900">CarRental</span>
          </div>
          <p className="text-gray-600">เข้าสู่ระบบเพื่อจัดการการจองของคุณ</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">เข้าสู่ระบบ</CardTitle>
            <CardDescription>กรอกอีเมลและรหัสผ่านของคุณ</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">อีเมล</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">รหัสผ่าน</label>
                  <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                    ลืมรหัสผ่าน?
                  </Link>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              </Button>
            </form>

            {/* Demo Accounts */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm">
              <p className="font-semibold mb-2">บัญชีทดสอบ:</p>
              <div className="space-y-1 text-xs text-gray-600">
                <p>Admin: admin@example.com / admin123</p>
                <p>Partner: partner@example.com / partner123</p>
                <p>Customer: customer@example.com / customer123</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-gray-600">
              ยังไม่มีบัญชี?{' '}
              <Link href="/register" className="text-blue-600 hover:underline font-medium">
                สมัครสมาชิก
              </Link>
            </div>
            <div className="text-center">
              <Link href="/" className="text-sm text-gray-600 hover:underline">
                ← กลับหน้าแรก
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Terms */}
        <p className="text-center text-xs text-gray-500 mt-6">
          การเข้าสู่ระบบถือว่าคุณยอมรับ{' '}
          <Link href="/terms" className="underline">
            ข้อกำหนดการใช้งาน
          </Link>{' '}
          และ{' '}
          <Link href="/privacy" className="underline">
            นโยบายความเป็นส่วนตัว
          </Link>
        </p>
      </div>
    </div>
  )
}
