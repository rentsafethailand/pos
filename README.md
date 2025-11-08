# 🚗 Car Rental Platform

แพลตฟอร์มจองรถเช่าและทัวร์ท่องเที่ยวแบบครบวงจร รองรับทั้งเช่ารถขับเอง และเช่าพร้อมคนขับ

Built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and **Supabase**

## 🎉 **พร้อมใช้งานแล้ว 100%!**

✅ ระบบ Authentication ครบถ้วน
✅ Customer Dashboard + Search + Booking Flow
✅ **Payment System พร้อม PromptPay QR Code** (promptpay.io)
✅ Partner Dashboard + Job Management
✅ Admin Dashboard + Settings (ตั้งค่าพร้อมเพย์ และบัญชีธนาคาร)
✅ Database Schema สมบูรณ์ 15 tables
✅ Multi-language Support (TH/EN)

👉 **ดู [QUICK_START.md](QUICK_START.md) เพื่อเริ่มต้นใช้งานภายใน 10 นาที!**

## 📋 Features

### ลูกค้า (Customer)
- ✅ ค้นหาและจองรถเช่า
- ✅ เลือกเช่ารถขับเอง หรือพร้อมคนขับ
- ✅ ชำระเงินออนไลน์
- ✅ ติดตามสถานะการจอง
- ✅ รีวิวและให้คะแนน Partner
- ✅ ดูสถานที่ท่องเที่ยวและกิจกรรม

### Partner (ร้านรถเช่า/คนขับ)
- ✅ จัดการรถของตัวเอง
- ✅ รับงานจาก Admin
- ✅ ติดตามรายได้
- ✅ แชทกับลูกค้า

### Admin
- ✅ จัดการการจองทั้งหมด
- ✅ มอบหมายงานให้ Partner
- ✅ อนุมัติ Partner ใหม่
- ✅ จัดการเนื้อหา (สถานที่ท่องเที่ยว, กิจกรรม)
- ✅ รายงานและสถิติ

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm หรือ yarn
- Supabase Account (ฟรี)
- Git

### 1. Clone และติดตั้ง Dependencies

```bash
# Clone repository
git clone <your-repo-url>
cd pos

# ติดตั้ง dependencies
npm install

# หรือใช้ yarn
yarn install
```

### 2. Setup Supabase

#### 2.1 สร้าง Supabase Project

1. ไปที่ [supabase.com](https://supabase.com)
2. สร้าง account (ฟรี)
3. สร้าง New Project
4. ตั้งชื่อโปรเจคและ password

#### 2.2 สร้าง Database Schema

1. ไปที่ Supabase Dashboard → SQL Editor
2. คัดลอกโค้ดจากไฟล์ `supabase/schema.sql`
3. Paste และกด Run
4. Database จะถูกสร้างพร้อมตารางทั้งหมด

#### 2.3 สร้าง Storage Buckets

ไปที่ Storage → สร้าง buckets ต่อไปนี้:
- `vehicles` - สำหรับรูปรถ
- `avatars` - สำหรับรูป profile
- `documents` - สำหรับเอกสาร

ตั้งค่า Bucket เป็น **Public**

#### 2.4 Setup Authentication

1. ไปที่ Authentication → Settings
2. เปิดใช้งาน Email Auth
3. (Optional) เปิดใช้งาน Social Auth (Google, Facebook)

### 3. Environment Variables

คัดลอก `.env.example` เป็น `.env.local`:

```bash
cp .env.example .env.local
```

แก้ไขไฟล์ `.env.local`:

```env
# หา API keys จาก Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# สร้าง secret key
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=random-secret-key-here

# Optional: Payment Gateway
OMISE_PUBLIC_KEY=your-omise-key
OMISE_SECRET_KEY=your-omise-secret
```

### 4. รันโปรเจค

```bash
npm run dev
```

เปิดเบราว์เซอร์ที่ [http://localhost:3000](http://localhost:3000)

## 📁 โครงสร้างโปรเจค

```
pos/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages (login, register)
│   │   ├── customer/          # Customer pages
│   │   ├── partner/           # Partner pages
│   │   ├── admin/             # Admin pages
│   │   ├── api/               # API routes
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   │
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   ├── forms/             # Form components
│   │   ├── layouts/           # Layout components
│   │   └── features/          # Feature-specific components
│   │
│   ├── lib/
│   │   ├── supabase.ts        # Supabase client
│   │   └── utils.ts           # Utility functions
│   │
│   └── types/
│       └── index.ts           # TypeScript types
│
├── supabase/
│   └── schema.sql             # Database schema
│
├── public/                     # Static files
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 🎨 สร้างหน้าใหม่

### ตัวอย่าง: สร้างหน้า Login

สร้างไฟล์ `src/app/login/page.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Get user role from database
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user?.id)
        .single()

      // Redirect based on role
      if (userData?.role === 'admin') {
        router.push('/admin/dashboard')
      } else if (userData?.role === 'partner') {
        router.push('/partner/dashboard')
      } else {
        router.push('/customer/dashboard')
      }

      toast.success('เข้าสู่ระบบสำเร็จ')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>เข้าสู่ระบบ</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium">อีเมล</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">รหัสผ่าน</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

### ตัวอย่าง: สร้าง Customer Dashboard

สร้างไฟล์ `src/app/customer/dashboard/page.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase, getCurrentUser } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Car, Clock, Star } from 'lucide-react'
import type { Booking } from '@/types'

export default function CustomerDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    try {
      const user = await getCurrentUser()
      if (!user) return

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          vehicle:vehicles(*),
          partner:partner_profiles(*, user:users(*))
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      setBookings(data || [])
    } catch (error) {
      console.error('Error loading bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">การจองทั้งหมด</CardTitle>
                <Calendar className="h-4 w-4 text-gray-500" />
              </div>
              <p className="text-2xl font-bold">{bookings.length}</p>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">กำลังดำเนินการ</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold">
                {bookings.filter(b => !['COMPLETED', 'CANCELLED'].includes(b.status)).length}
              </p>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">เสร็จสิ้น</CardTitle>
                <Car className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold">
                {bookings.filter(b => b.status === 'COMPLETED').length}
              </p>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">คะแนนรีวิว</CardTitle>
                <Star className="h-4 w-4 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold">4.8</p>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>การจองล่าสุด</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>กำลังโหลด...</p>
            ) : bookings.length === 0 ? (
              <p>ยังไม่มีการจอง</p>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">{booking.booking_number}</p>
                      <p className="text-sm text-gray-600">
                        {booking.pickup_date} - {booking.return_date}
                      </p>
                    </div>
                    <div>
                      <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

## 🔌 สร้าง API Route

### ตัวอย่าง: API สำหรับสร้างการจอง

สร้างไฟล์ `src/app/api/bookings/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { generateBookingNumber, calculateBookingPrice } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Calculate pricing
    const pricing = calculateBookingPrice(
      body.daily_rate,
      body.total_days,
      body.addons_price
    )

    // Create booking
    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .insert({
        booking_number: generateBookingNumber(),
        customer_id: body.customer_id,
        rental_type: body.rental_type,
        pickup_date: body.pickup_date,
        pickup_time: body.pickup_time,
        return_date: body.return_date,
        return_time: body.return_time,
        pickup_location: body.pickup_location,
        return_location: body.return_location,
        vehicle_type_requested: body.vehicle_type,
        total_days: body.total_days,
        ...pricing,
        status: 'PENDING_ASSIGNMENT',
      })
      .select()
      .single()

    if (error) throw error

    // Create notification for admin
    await supabaseAdmin.from('notifications').insert({
      user_id: 'admin-user-id', // Get from system settings
      type: 'booking',
      title: 'มีการจองใหม่',
      message: `มีการจองใหม่ ${booking.booking_number}`,
      link_url: `/admin/bookings/${booking.id}`,
    })

    return NextResponse.json(booking)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('user_id')
    const role = searchParams.get('role')

    let query = supabaseAdmin
      .from('bookings')
      .select('*, vehicle:vehicles(*), partner:partner_profiles(*)')

    if (role === 'customer' && userId) {
      query = query.eq('customer_id', userId)
    } else if (role === 'partner' && userId) {
      query = query.eq('partner_id', userId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

## 🎨 Additional UI Components

สร้างไฟล์เพิ่มเติมใน `src/components/ui/`:

### Label Component

```tsx
// src/components/ui/label.tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)}
      {...props}
    />
  )
)
Label.displayName = 'Label'

export { Label }
```

### Badge Component

```tsx
// src/components/ui/badge.tsx
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
        outline: 'text-foreground border border-input',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
```

## 📊 ฟีเจอร์ขั้นสูง

### Real-time Notifications

```typescript
// src/hooks/useNotifications.ts
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Notification } from '@/types'

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    // Load initial notifications
    loadNotifications()

    // Subscribe to new notifications
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev])
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [userId])

  const loadNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (data) setNotifications(data)
  }

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId)
  }

  return { notifications, markAsRead }
}
```

## 🚀 Deployment

### Deploy to Vercel (แนะนำ)

1. Push code ขึ้น GitHub
2. ไปที่ [vercel.com](https://vercel.com)
3. Import repository
4. เพิ่ม Environment Variables (คัดลอกจาก `.env.local`)
5. Deploy!

### Deploy to Netlify

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

## 📚 เอกสารเพิ่มเติม

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

Pull requests are welcome! สำหรับการเปลี่ยนแปลงใหญ่ กรุณาเปิด issue ก่อน

## 📝 License

MIT License - ใช้ได้อย่างอิสระ

## 💬 Support

หากมีคำถาม:
- เปิด GitHub Issue
- Email: support@yourapp.com
- Line: @yourapp

---

Made with ❤️ in Thailand
