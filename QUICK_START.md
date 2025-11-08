# 🚀 Quick Start Guide

เริ่มต้นใช้งาน Car Rental Platform ภายใน 10 นาที!

## 📦 Step 1: ติดตั้ง Dependencies (2 นาที)

```bash
cd pos
npm install
```

## 🗄️ Step 2: Setup Supabase (3 นาที)

### 2.1 สร้าง Project
1. ไปที่ [supabase.com](https://supabase.com)
2. สมัครฟรี (ถ้ายังไม่มีบัญชี)
3. Create New Project
   - Name: `car-rental`
   - Database Password: ตั้งรหัสผ่านแข็งแรง
   - Region: Southeast Asia (Singapore)
4. รอ 1-2 นาที

### 2.2 สร้าง Database
1. ไปที่ SQL Editor
2. คัดลอกโค้ดจาก `supabase/schema.sql` ทั้งหมด
3. Paste และกด Run
4. เห็น "Success" = สำเร็จ!

### 2.3 สร้าง Storage Buckets
1. ไปที่ Storage
2. สร้าง 3 buckets:
   - `vehicles` (Public)
   - `avatars` (Public)
   - `documents` (Private)

### 2.4 เปิด Email Auth
1. ไปที่ Authentication → Settings
2. เปิดใช้งาน Email provider
3. Save

## 🔑 Step 3: Environment Variables (1 นาที)

```bash
cp .env.example .env.local
```

แก้ไขไฟล์ `.env.local`:

```env
# หา keys จาก Supabase → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Generate secret: openssl rand -base64 32
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=http://localhost:3000
```

## 🏃 Step 4: รันโปรเจค (30 วินาที)

```bash
npm run dev
```

เปิดเบราว์เซอร์: http://localhost:3000

## ✅ Step 5: ทดสอบระบบ (3 นาที)

### 5.1 สมัครสมาชิก Customer
1. คลิก "สมัครสมาชิก"
2. เลือก "ลูกค้า (Customer)"
3. กรอกข้อมูล:
   - Email: `test@example.com`
   - Password: `password123`
   - ชื่อ-นามสกุล
   - เบอร์โทร
4. กดสมัคร

### 5.2 Login
1. Login ด้วย email และ password ที่สมัคร
2. จะเข้าสู่ Customer Dashboard

### 5.3 สร้าง Admin Account
1. ไปที่ Supabase Dashboard → Table Editor → users
2. หา user ที่เพิ่งสมัคร
3. แก้ไข column `role` เป็น `admin`
4. Save
5. Logout และ Login อีกครั้ง
6. จะเข้าสู่ Admin Dashboard!

### 5.4 ตั้งค่า Payment
1. ใน Admin Dashboard → Settings
2. กรอก:
   - **เลขพร้อมเพย์**: `0812345678` (เบอร์จริงของคุณ)
   - **ธนาคาร**: เลือกธนาคาร
   - **เลขบัญชี**: `123-4-56789-0`
   - **ชื่อบัญชี**: ชื่อจริงของคุณ
3. กด "บันทึกการตั้งค่า"

## 🎉 เสร็จสิ้น!

ระบบพร้อมใช้งานแล้ว! ลองทำสิ่งเหล่านี้:

### ทดสอบ Customer Flow:
1. Logout จาก Admin
2. สมัครบัญชี Customer ใหม่
3. ไปที่หน้าแรก
4. ลองค้นหารถ (จะไม่มีรถเพราะยังไม่มี Partner)

### สร้าง Partner และรถ:
1. สมัครบัญชี Partner
2. ใน Admin Dashboard → อนุมัติ Partner
3. Login เป็น Partner
4. เพิ่มรถ (ต้องสร้างหน้านี้ หรือ ใส่ข้อมูลผ่าน Supabase Dashboard)

### ทดสอบการจอง:
1. Login เป็น Customer
2. ค้นหาและเลือกรถ
3. กรอกข้อมูลจอง
4. ไปที่หน้าชำระเงิน
5. เลือก "QR PromptPay"
6. จะเห็น QR Code! (ลองสแกนด้วยแอพธนาคารจริงๆ)
7. อัพโหลดสลิป
8. กด "ยืนยันการชำระเงิน"

### ทดสอบ Admin:
1. Login เป็น Admin
2. ดูการจองที่รอมอบหมาย
3. คลิก "มอบหมายงาน"
4. เลือก Partner
5. Partner จะได้รับงาน!

## 📚 เอกสารเพิ่มเติม

- **SYSTEM_DESIGN.md** - ออกแบบระบบทั้งหมด
- **INSTALLATION.md** - คู่มือติดตั้งละเอียด
- **FEATURES_COMPLETE.md** - รายการฟีเจอร์ทั้งหมด
- **README.md** - Documentation หลัก

## 🐛 แก้ปัญหา

### ปัญหา: Cannot connect to Supabase
**วิธีแก้:**
- ตรวจสอบ `.env.local` ว่า keys ถูกต้อง
- Restart dev server: `npm run dev`

### ปัญหา: Tables not found
**วิธีแก้:**
- ตรวจสอบว่ารัน `schema.sql` แล้ว
- ดูใน Supabase Table Editor ว่ามี tables หรือไม่

### ปัญหา: QR Code ไม่ขึ้น
**วิธีแก้:**
- ตรวจสอบว่าตั้งค่าเลขพร้อมเพย์ใน Admin Settings แล้ว
- ตรวจสอบ Network tab ว่ามี error หรือไม่

### ปัญหา: ชำระเงินแล้วสถานะไม่เปลี่ยน
**วิธีแก้:**
- ต้องให้ Admin อนุมัติ payment proof ก่อน
- ไปที่ Admin → Payments → อนุมัติ

## 💡 Tips

1. **ใช้ Chrome DevTools** - เปิด Console ดู errors
2. **ดู Supabase Logs** - Dashboard → Logs
3. **Test ทีละขั้นตอน** - อย่ารีบ
4. **Commit บ่อยๆ** - ป้องกันเสีย code
5. **อ่าน Error Messages** - มักจะบอกปัญหา

## 🎯 Next Steps

หลังจากทดสอบเรียบร้อยแล้ว:

1. **Deploy to Production**
   - Vercel (แนะนำ)
   - Netlify
   - ดูวิธีใน INSTALLATION.md

2. **เพิ่มข้อมูลจริง**
   - เพิ่มรถหลายๆ คัน
   - เพิ่มสถานที่ท่องเที่ยว
   - เพิ่มกิจกรรม

3. **Customize**
   - เปลี่ยนสี theme
   - เปลี่ยนโลโก้
   - เปลี่ยนข้อความ

4. **พัฒนาฟีเจอร์เพิ่ม**
   - Notification center
   - Chat system
   - Review system
   - Partner vehicle management

---

**Happy Coding! 🚗💨**

หากมีปัญหา สอบถามได้เลย!
