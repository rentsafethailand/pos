# 📦 คู่มือการติดตั้งและใช้งาน Car Rental Platform

## 📋 สิ่งที่ได้รับ

โปรเจคนี้มีฟีเจอร์หลักดังนี้:

### ✅ ที่สร้างเสร็จแล้ว

1. **โครงสร้างโปรเจค Next.js 14**
   - TypeScript สำหรับ type safety
   - Tailwind CSS สำหรับ styling
   - App Router (Next.js 14)

2. **Database Schema สมบูรณ์**
   - 15 ตารางครบถ้วน
   - Relations และ Foreign Keys
   - Triggers และ Functions
   - Row Level Security (RLS)

3. **Authentication System**
   - หน้า Login พร้อม role-based redirect
   - หน้า Register (Customer + Partner)
   - Middleware สำหรับป้องกัน route
   - Integration กับ Supabase Auth

4. **Landing Page**
   - Hero section พร้อมฟอร์มค้นหา
   - Popular destinations
   - Features showcase
   - Reviews section
   - Responsive design

5. **UI Components**
   - Button, Input, Card components
   - Reusable และ accessible
   - Variants support

6. **Multi-language Support**
   - ไทย/อังกฤษ
   - next-intl integration

7. **Documentation**
   - README ครบถ้วน
   - System Design Document
   - Code examples

### 🚧 ที่ต้องพัฒนาต่อ

1. Customer Dashboard
2. Partner Dashboard
3. Admin Dashboard
4. Booking Flow (search, vehicle detail, payment)
5. API Routes
6. Notification System

---

## 🚀 ขั้นตอนการติดตั้ง

### Step 1: ติดตั้ง Dependencies

```bash
npm install
```

หรือ

```bash
yarn install
```

**Dependencies ที่จำเป็น:**
- Next.js 14
- React 18
- Supabase
- Tailwind CSS
- TypeScript
- React Hook Form
- Zod (validation)
- Lucide Icons
- React Hot Toast
- date-fns
- และอื่นๆ (ดูใน package.json)

### Step 2: Setup Supabase

#### 2.1 สร้าง Supabase Project

1. ไปที่ [supabase.com](https://supabase.com)
2. Sign up / Login
3. Create New Project
   - Organization: สร้างใหม่ หรือเลือกที่มีอยู่
   - Name: `car-rental-platform` (หรือชื่อที่คุณต้องการ)
   - Database Password: ตั้งรหัสผ่านที่แข็งแรง (เก็บไว้ใช้ภายหลัง)
   - Region: เลือก Southeast Asia (Singapore)
4. รอประมาณ 2-3 นาที จนโปรเจคสร้างเสร็จ

#### 2.2 สร้าง Database Tables

1. ไปที่ Supabase Dashboard
2. เลือก SQL Editor (เมนูด้านซ้าย)
3. New Query
4. คัดลอกโค้ดทั้งหมดจาก `supabase/schema.sql`
5. Paste ลงใน Query Editor
6. กด Run หรือ Ctrl+Enter
7. ควรเห็นข้อความ "Success" และมี 15 tables ถูกสร้าง

**ตรวจสอบว่า Tables ถูกสร้าง:**
- ไปที่ Table Editor
- ควรเห็นตาราง: users, customer_profiles, partner_profiles, vehicles, bookings, etc.

#### 2.3 สร้าง Storage Buckets

1. ไปที่ Storage (เมนูด้านซ้าย)
2. Create bucket ทั้งหมด 3 buckets:

**Bucket 1: vehicles**
- Name: `vehicles`
- Public bucket: ✅ (เปิด)
- File size limit: 5MB
- Allowed MIME types: `image/*`

**Bucket 2: avatars**
- Name: `avatars`
- Public bucket: ✅ (เปิด)
- File size limit: 2MB
- Allowed MIME types: `image/*`

**Bucket 3: documents**
- Name: `documents`
- Public bucket: ❌ (ปิด - private)
- File size limit: 10MB
- Allowed MIME types: `application/pdf,image/*`

#### 2.4 Setup Authentication

1. ไปที่ Authentication → Settings
2. เปิดใช้งาน **Email** provider
3. (Optional) เปิดใช้งาน Social providers:
   - Google
   - Facebook
   - Line
4. Configure Email Templates ตามต้องการ

### Step 3: Environment Variables

1. คัดลอกไฟล์ `.env.example` เป็น `.env.local`:

```bash
cp .env.example .env.local
```

2. แก้ไขไฟล์ `.env.local`:

```env
# ไปที่ Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# สร้าง secret key
# วิธี: เรียกใช้ในเทอร์มินัล: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-here

# Optional: Payment Gateway
OMISE_PUBLIC_KEY=pkey_test_xxxxx
OMISE_SECRET_KEY=skey_test_xxxxx
```

**วิธีหา Supabase Keys:**
1. ไปที่ Supabase Dashboard
2. คลิกที่โปรเจคของคุณ
3. ไปที่ Settings → API
4. คัดลอก:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role → `SUPABASE_SERVICE_ROLE_KEY`

### Step 4: รันโปรเจค

```bash
npm run dev
```

เปิดเบราว์เซอร์ที่: [http://localhost:3000](http://localhost:3000)

---

## 🧪 การทดสอบระบบ

### 1. ทดสอบหน้า Landing Page

- เปิด http://localhost:3000
- ควรเห็นหน้า Landing Page พร้อมฟอร์มค้นหา
- ลองกรอกวันที่และเลือกประเภทการเช่า
- กดปุ่มค้นหา (จะไปหน้า /search แต่ยังไม่มีหน้านี้)

### 2. ทดสอบการสมัครสมาชิก

1. คลิก "สมัครสมาชิก"
2. เลือกประเภทบัญชี (ลูกค้า หรือ Partner)
3. กรอกข้อมูล:
   - อีเมล: test@example.com
   - รหัสผ่าน: password123
   - ชื่อ-นามสกุล
   - เบอร์โทร
4. กดสมัครสมาชิก
5. ควรสำเร็จและ redirect ไปหน้า Login

### 3. ทดสอบการเข้าสู่ระบบ

1. คลิก "เข้าสู่ระบบ"
2. กรอกอีเมลและรหัสผ่านที่สมัครไว้
3. กดเข้าสู่ระบบ
4. ถ้าเป็น Customer → จะไป /customer/dashboard (ยังไม่มีหน้านี้)
5. ถ้าเป็น Partner → จะไป /partner/dashboard (ยังไม่มีหน้านี้)

### 4. ตรวจสอบ Database

ไปที่ Supabase Dashboard → Table Editor → users

ควรเห็นข้อมูล user ที่เพิ่งสมัครสมาชิก

---

## 📊 ตรวจสอบข้อมูลใน Database

### Admin User (Default)

Database มี admin user ตั้งต้นอยู่แล้ว:
- Email: admin@example.com
- Password: (ต้อง hash ด้วย bcrypt)

**วิธีสร้าง Admin user:**

1. ไปที่ Supabase Dashboard → SQL Editor
2. รันคำสั่ง:

```sql
-- สร้าง admin user ใน Auth
-- ทำผ่าน Supabase Dashboard → Authentication → Add User
-- Email: admin@example.com
-- Password: admin123

-- จากนั้นรัน SQL นี้ (แทน USER_ID ด้วย ID ที่ได้)
INSERT INTO users (id, email, role, first_name, last_name, phone, email_verified, status)
VALUES
('USER_ID_FROM_AUTH', 'admin@example.com', 'admin', 'Admin', 'User', '0812345678', TRUE, 'active');
```

---

## 🎨 การพัฒนาต่อ

### สร้าง Customer Dashboard

สร้างไฟล์ `src/app/customer/dashboard/page.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase, getCurrentUser } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function CustomerDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const currentUser = await getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        <Card>
          <CardHeader>
            <CardTitle>ยินดีต้อนรับ {user?.email}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>นี่คือ Customer Dashboard</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

### สร้าง API Route

สร้างไฟล์ `src/app/api/bookings/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .insert(body)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

---

## 🐛 การแก้ปัญหาที่พบบ่อย

### 1. Cannot connect to Supabase

**ปัญหา:** Error "Invalid API key" หรือ "Failed to fetch"

**วิธีแก้:**
- ตรวจสอบ `.env.local` ว่ามี keys ครบ
- ตรวจสอบว่า keys ถูกต้อง (ไม่มีช่องว่างหน้า-หลัง)
- Restart dev server (`npm run dev`)

### 2. Tables not found

**ปัญหา:** Error "relation does not exist"

**วิธีแก้:**
- ตรวจสอบว่ารัน `schema.sql` แล้ว
- ไปที่ Supabase → Table Editor ดูว่ามี tables หรือไม่
- ลองรัน schema.sql อีกครั้ง

### 3. Authentication error

**ปัญหา:** ล็อกอินไม่ได้ หรือ register ไม่ได้

**วิธีแก้:**
- ตรวจสอบว่า Email provider เปิดอยู่ใน Supabase Auth settings
- ตรวจสอบ password (ต้องมีอย่างน้อย 6 ตัวอักษร)
- ดู Console log เพื่อหา error message

### 4. Styles ไม่ขึ้น

**ปัญหา:** หน้าเว็บดูไม่สวย, ไม่มี styling

**วิธีแก้:**
- ตรวจสอบว่ามี `globals.css` ใน `src/app/globals.css`
- ตรวจสอบว่า import `globals.css` ใน `layout.tsx`
- Restart dev server

### 5. TypeScript errors

**ปัญหา:** TypeScript แจ้งเตือน error

**วิธีแก้:**
- รัน `npm run type-check` เพื่อดู errors ทั้งหมด
- ตรวจสอบว่า import types ถูกต้อง
- ตรวจสอบว่า `@/*` path alias ทำงานหรือไม่

---

## 📦 Dependencies เพิ่มเติมที่อาจต้องใช้

ถ้าต้องการฟีเจอร์เพิ่มเติม:

```bash
# Image Upload
npm install react-dropzone

# Charts/Graphs
npm install recharts

# Date Picker
npm install react-datepicker @types/react-datepicker

# Rich Text Editor
npm install @tiptap/react @tiptap/starter-kit

# Payment (Omise)
npm install omise

# PDF Generation
npm install jspdf html2canvas
```

---

## 🚀 Deployment

### Deploy to Vercel (แนะนำ)

1. Push code ขึ้น GitHub
2. ไปที่ [vercel.com](https://vercel.com)
3. Import repository
4. เพิ่ม Environment Variables ทั้งหมดจาก `.env.local`
5. Deploy!

**Environment Variables ที่ต้องเพิ่มใน Vercel:**
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXTAUTH_SECRET
- NEXTAUTH_URL (เปลี่ยนเป็น production URL)

### Deploy to Netlify

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

---

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

## 🎯 Next Steps

1. **ติดตั้ง Dependencies**
   ```bash
   npm install
   ```

2. **Setup Supabase** (ตามขั้นตอนด้านบน)

3. **รันโปรเจค**
   ```bash
   npm run dev
   ```

4. **สร้างหน้า Dashboards:**
   - Customer Dashboard
   - Partner Dashboard
   - Admin Dashboard

5. **สร้าง API Routes:**
   - Bookings API
   - Vehicles API
   - Payments API

6. **Implement Booking Flow:**
   - Search Page
   - Vehicle Detail Page
   - Booking Form
   - Payment Page

7. **Deploy to Production**

---

## 💡 Tips

- ใช้ TypeScript อย่างเต็มที่ เพื่อหลีกเลี่ยง bugs
- ทดสอบบน Supabase Dashboard ก่อนเขียนโค้ด
- ใช้ git commit บ่อยๆ
- อ่าน Error messages ให้ละเอียด
- ใช้ Console.log() เพื่อ debug

---

สำเร็จ! ตอนนี้คุณมีโปรเจค Car Rental Platform พร้อมใช้งานแล้ว 🎉

หากมีคำถาม หรือพบปัญหา สามารถสอบถามได้เลยครับ!
