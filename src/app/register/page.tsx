'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Car, User, Store } from 'lucide-react'
import toast from 'react-hot-toast'
import type { UserRole } from '@/types'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: Choose role, 2: Fill form
  const [role, setRole] = useState<UserRole>('customer')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    phone: '',
    // Partner specific
    business_name: '',
    tax_id: '',
  })
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate
    if (formData.password !== formData.confirm_password) {
      toast.error('รหัสผ่านไม่ตรงกัน')
      return
    }

    if (formData.password.length < 6) {
      toast.error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
      return
    }

    setLoading(true)

    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('ไม่สามารถสร้างบัญชีได้')

      // 2. Create user record in database
      const { error: userError } = await supabase.from('users').insert({
        id: authData.user.id,
        email: formData.email,
        role: role,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        status: role === 'partner' ? 'pending' : 'active',
      })

      if (userError) throw userError

      // 3. Create role-specific profile
      if (role === 'customer') {
        const { error: profileError } = await supabase.from('customer_profiles').insert({
          user_id: authData.user.id,
          preferred_language: 'th',
        })
        if (profileError) throw profileError
      } else if (role === 'partner') {
        const { error: profileError } = await supabase.from('partner_profiles').insert({
          user_id: authData.user.id,
          business_name: formData.business_name || `${formData.first_name} ${formData.last_name}`,
          tax_id: formData.tax_id,
          approval_status: 'pending',
        })
        if (profileError) throw profileError
      }

      toast.success('สมัครสมาชิกสำเร็จ!')

      if (role === 'partner') {
        toast.success('กรุณารอการอนุมัติจากผู้ดูแลระบบ')
      }

      // Redirect to login
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (error: any) {
      console.error('Registration error:', error)
      toast.error(error.message || 'สมัครสมาชิกไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }

  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="w-full max-w-4xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 mb-2">
              <Car className="h-10 w-10 text-blue-600" />
              <span className="text-3xl font-bold text-gray-900">CarRental</span>
            </div>
            <p className="text-gray-600">เลือกประเภทบัญชีที่คุณต้องการ</p>
          </div>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-center">สมัครสมาชิก</CardTitle>
              <CardDescription className="text-center">เลือกประเภทบัญชี</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer */}
                <button
                  onClick={() => {
                    setRole('customer')
                    setStep(2)
                  }}
                  className="p-8 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                      <User className="h-6 w-6 text-blue-600 group-hover:text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">ลูกค้า (Customer)</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        สำหรับผู้ที่ต้องการเช่ารถและจองทัวร์
                      </p>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>✓ ค้นหาและจองรถเช่า</li>
                        <li>✓ ชำระเงินออนไลน์</li>
                        <li>✓ ติดตามสถานะการจอง</li>
                        <li>✓ รีวิวและให้คะแนน</li>
                      </ul>
                    </div>
                  </div>
                </button>

                {/* Partner */}
                <button
                  onClick={() => {
                    setRole('partner')
                    setStep(2)
                  }}
                  className="p-8 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left group"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-600 transition-colors">
                      <Store className="h-6 w-6 text-green-600 group-hover:text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">Partner</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        สำหรับร้านรถเช่าและคนขับรถ
                      </p>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>✓ จัดการรถของคุณ</li>
                        <li>✓ รับงานจาก Admin</li>
                        <li>✓ ติดตามรายได้</li>
                        <li>✓ แชทกับลูกค้า</li>
                      </ul>
                      <div className="mt-4 p-2 bg-yellow-100 rounded text-xs text-yellow-800">
                        ⚠️ ต้องรอการอนุมัติจาก Admin
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center text-sm text-gray-600">
                มีบัญชีอยู่แล้ว?{' '}
                <Link href="/login" className="text-blue-600 hover:underline font-medium">
                  เข้าสู่ระบบ
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
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
          <p className="text-gray-600">
            สมัครเป็น {role === 'customer' ? 'ลูกค้า' : 'Partner'}
          </p>
        </div>

        {/* Registration Form */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">กรอกข้อมูล</CardTitle>
            <CardDescription>กรุณากรอกข้อมูลให้ครบถ้วน</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">ชื่อ *</label>
                  <Input
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">นามสกุล *</label>
                  <Input
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">อีเมล *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">เบอร์โทรศัพท์ *</label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0812345678"
                  required
                  disabled={loading}
                />
              </div>

              {role === 'partner' && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">ชื่อธุรกิจ *</label>
                    <Input
                      value={formData.business_name}
                      onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">เลขผู้เสียภาษี (ถ้ามี)</label>
                    <Input
                      value={formData.tax_id}
                      onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">รหัสผ่าน *</label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">ยืนยันรหัสผ่าน *</label>
                <Input
                  type="password"
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="flex-1"
                >
                  ย้อนกลับ
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-gray-600">
              มีบัญชีอยู่แล้ว?{' '}
              <Link href="/login" className="text-blue-600 hover:underline font-medium">
                เข้าสู่ระบบ
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
