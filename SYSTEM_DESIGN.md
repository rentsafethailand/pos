# 🚗 ระบบจองรถเช่า & ทัวร์ - System Design Document

## 📊 ภาพรวมระบบ

ระบบนี้เป็น **Marketplace Platform** ที่เชื่อมโยง 3 ฝ่ายหลัก:
- **ลูกค้า** - คนที่ต้องการเช่ารถ/จองทัวร์
- **Partner** - ร้านรถเช่า/คนขับรถ ที่ให้บริการ
- **Admin** - ผู้ดูแลระบบ จับคู่งานและควบคุมคุณภาพ

---

## 👥 User Roles & Permissions

### 🔵 1. ลูกค้า (Customer)
**สิทธิ์การใช้งาน:**
- ✅ เข้าชมเว็บไซต์ได้โดยไม่ต้อง login
- ✅ ดูรถที่มีให้เช่า, สถานที่ท่องเที่ยว, กิจกรรม
- ✅ ต้อง login ถึงจะจองได้
- ✅ จัดการโปรไฟล์ส่วนตัว
- ✅ ดูประวัติการจอง
- ✅ รีวิวและให้คะแนน Partner

### 🟢 2. Partner (ร้านรถเช่า/คนขับ)
**สิทธิ์การใช้งาน:**
- ✅ ต้องสมัครและรอ Admin อนุมัติก่อนใช้งาน
- ✅ จัดการข้อมูลรถของตัวเอง (เพิ่ม/ลบ/แก้ไข)
- ✅ ดูงานที่ได้รับมอบหมาย
- ✅ ยืนยัน/ปฏิเสธงาน
- ✅ อัพเดทสถานะงาน (กำลังดำเนินการ/เสร็จสิ้น)
- ✅ ดูรายได้/สถิติของตัวเอง
- ✅ แชทกับลูกค้า

### 🔴 3. Admin
**สิทธิ์การใช้งาน:**
- ✅ ดูและจัดการคำจองทั้งหมด
- ✅ มอบหมายงานให้ Partner
- ✅ อนุมัติ/ปฏิเสธ/ระงับ Partner
- ✅ จัดการลูกค้า
- ✅ จัดการเนื้อหา (สถานที่ท่องเที่ยว/กิจกรรม/โปรโมชั่น)
- ✅ ตั้งค่าราคา/ค่าบริการ/ค่าคอมมิชชั่น
- ✅ ดูรายงานและสถิติทั้งหมด
- ✅ จัดการการชำระเงิน

---

## 🔄 User Flow & ฟีเจอร์ทั้งหมด

### 📱 1. ลูกค้าจอง (Customer Booking Flow)

```
[เข้าเว็บไซต์]
    ↓
[หน้าแรก - Landing Page]
├── ดูสถานที่ท่องเที่ยวแนะนำ (Recommended Attractions)
├── ดูกิจกรรมที่กำลังจะมาถึง (Upcoming Events)
├── ดูรีวิวจากลูกค้า (Customer Reviews)
└── [ฟอร์มค้นหารถด่วน - Quick Search Form]
    ├── เลือกวันที่รับรถ (Pickup Date)
    ├── เลือกวันที่คืนรถ (Return Date)
    ├── เลือกเวลารับ-คืน (Time)
    ├── เลือกประเภท (Rental Type)
    │   ├── 🚗 เช่ารถขับเอง (Self-Drive)
    │   └── 👨‍✈️ เช่าพร้อมคนขับ (With Driver)
    └── 🔍 [ปุ่มค้นหา]
        ↓
[หน้าผลลัพธ์การค้นหา - Search Results]
├── แสดงรถที่ว่าง (Available Vehicles)
├── Filter: ประเภทรถ, ราคา, ยี่ห้อ, rating
├── Sort: ราคา, rating, ความนิยม
└── [เลือกรถ]
    ↓
[รายละเอียดรถ - Vehicle Detail Page]
├── รูปภาพรถ (Photo Gallery)
├── รายละเอียดรถ (Specifications)
├── ข้อมูล Partner (Partner Info + Rating)
├── รีวิวจากลูกค้า (Customer Reviews)
├── ราคา (Pricing)
├── ปฏิทินความพร้อม (Availability Calendar)
└── [ปุ่มจองเลย - Book Now]
    ↓
[ตรวจสอบว่า Login หรือยัง?]
├── ❌ ยังไม่ได้ Login → [ไปหน้า Login/Register]
└── ✅ Login แล้ว → [หน้ากรอกรายละเอียดการจอง]
    ↓
[หน้ากรอกรายละเอียด - Booking Details]
├── สรุปรายการจอง (Booking Summary)
├── กรอกข้อมูลผู้จอง (Customer Info)
├── กรอกจุดรับ-ส่ง (Pickup/Return Location)
├── สำหรับเช่าพร้อมคนขับ:
│   ├── กรอกโปรแกรมทัวร์ (Itinerary)
│   └── ความต้องการพิเศษ (Special Requests)
├── เลือกบริการเสริม (Add-ons)
│   ├── GPS (+100฿/วัน)
│   ├── ที่นั่งเด็ก (+50฿/วัน)
│   ├── ประกันเพิ่มเติม (+200฿/วัน)
│   └── คนขับเสริม (+500฿/วัน)
└── [ยืนยันการจอง - Confirm Booking]
    ↓
[💰 หน้าชำระเงิน - Payment Page]
├── สรุปค่าใช้จ่ายทั้งหมด (Total Cost Breakdown)
├── เลือกวิธีชำระเงิน (Payment Method)
│   ├── 💳 บัตรเครดิต/เดบิต (Credit/Debit Card)
│   ├── 📱 QR PromptPay
│   ├── 🏦 โอนธนาคาร (Bank Transfer)
│   └── 💵 เงินสด (Cash - ชำระเมื่อรับรถ)
└── [ชำระเงินมัดจำ 30%]
    ↓
[✅ การจองสำเร็จ - Booking Confirmed]
├── แสดงเลขที่การจอง (Booking ID: #BK2024001)
├── รับอีเมลยืนยัน (Confirmation Email)
├── รับ SMS แจ้งเตือน (SMS Notification)
└── สถานะ: "รอ Admin มอบหมายงาน" (Pending Assignment)
```

**ฟีเจอร์ลูกค้า - หลังจองแล้ว:**
```
[Dashboard ลูกค้า - Customer Dashboard]
├── 📋 [การจองของฉัน - My Bookings]
│   ├── กำลังดำเนินการ (Active)
│   ├── เสร็จสิ้น (Completed)
│   └── ยกเลิก (Cancelled)
│
├── 🔔 [การแจ้งเตือน - Notifications]
│   ├── Admin มอบหมายงานแล้ว
│   ├── Partner ยืนยันงาน
│   ├── ใกล้ถึงวันรับรถ (24 ชั่วโมงก่อน)
│   ├── Partner รับรถแล้ว
│   ├── Partner คืนรถแล้ว
│   └── แจ้งชำระเงินส่วนที่เหลือ
│
├── 👤 [โปรไฟล์ - Profile]
│   ├── แก้ไขข้อมูลส่วนตัว
│   ├── เปลี่ยนรหัสผ่าน
│   └── ที่อยู่จัดส่งเอกสาร
│
├── 💬 [ข้อความ - Messages]
│   └── แชทกับ Partner/Admin
│
└── ⭐ [รีวิวของฉัน - My Reviews]
    └── ดูรีวิวที่เคยเขียนไว้
```

---

### 🏢 2. Partner (ผู้ให้บริการ)

```
[สมัครเป็น Partner - Partner Registration]
├── กรอกข้อมูลธุรกิจ (Business Info)
├── ใบอนุญาตขับขี่/ใบอนุญาตกิจการ (License)
├── ข้อมูลบัญชีธนาคาร (Bank Account)
└── [ส่งใบสมัคร]
    ↓
[รอ Admin อนุมัติ - Pending Approval]
    ↓
[✅ ได้รับการอนุมัติ - Approved]
    ↓
[Partner Dashboard]
├── 📊 [ภาพรวม - Overview]
│   ├── งานใหม่วันนี้ (Today's Jobs)
│   ├── รายได้เดือนนี้ (This Month Revenue)
│   ├── คะแนนเฉลี่ย (Average Rating)
│   └── จำนวนงานทั้งหมด (Total Jobs)
│
├── 🚗 [จัดการรถ - My Vehicles]
│   ├── [เพิ่มรถใหม่ - Add Vehicle]
│   │   ├── อัพโหลดรูปภาพรถ (Photos)
│   │   ├── กรอกรายละเอียดรถ (Details)
│   │   │   ├── ยี่ห้อ/รุ่น (Brand/Model)
│   │   │   ├── ปีรถ (Year)
│   │   │   ├── ทะเบียน (License Plate)
│   │   │   ├── จำนวนที่นั่ง (Seats)
│   │   │   ├── ประเภทเชื้อเพลิง (Fuel Type)
│   │   │   └── ระบบเกียร์ (Transmission)
│   │   ├── ตั้งราคา (Pricing)
│   │   │   ├── ราคาเช่าขับเอง/วัน
│   │   │   └── ราคาพร้อมคนขับ/วัน
│   │   └── ตั้งค่าความพร้อม (Availability)
│   │
│   ├── [แก้ไขรถ - Edit Vehicle]
│   └── [ลบรถ - Delete Vehicle]
│
├── 📋 [งานที่ได้รับ - Assigned Jobs]
│   ├── งานใหม่ (New) - ยังไม่ยืนยัน
│   │   └── [ยืนยัน / ปฏิเสธ]
│   ├── งานที่ยืนยันแล้ว (Confirmed)
│   ├── กำลังดำเนินการ (In Progress)
│   └── เสร็จสิ้น (Completed)
│
├── 🔔 [การแจ้งเตือน - Notifications]
│   ├── 🔔 มีงานใหม่! (New Job Assigned)
│   ├── ⏰ ใกล้ถึงเวลารับรถ (Upcoming Pickup)
│   ├── 💬 ข้อความจากลูกค้า (Customer Message)
│   └── ⭐ มีรีวิวใหม่ (New Review)
│
├── 💰 [รายได้ - Earnings]
│   ├── รายได้รอรับ (Pending)
│   ├── รายได้ที่ได้รับแล้ว (Paid)
│   ├── ประวัติการจ่ายเงิน (Payment History)
│   └── [ขอถอนเงิน - Withdraw]
│
├── 💬 [ข้อความ - Messages]
│   └── แชทกับลูกค้า/Admin
│
├── ⭐ [รีวิว - Reviews]
│   └── ดูรีวิวจากลูกค้า
│
└── ⚙️ [ตั้งค่า - Settings]
    ├── แก้ไขข้อมูลธุรกิจ
    ├── ข้อมูลบัญชีธนาคาร
    └── ตั้งค่าการแจ้งเตือน
```

**Partner Job Flow:**
```
[ได้รับการแจ้งเตือน: มีงานใหม่!]
    ↓
[ดูรายละเอียดงาน]
├── ข้อมูลลูกค้า
├── วันเวลารับ-คืน
├── จุดรับ-ส่ง
├── โปรแกรมทัวร์ (ถ้ามี)
└── รายได้ที่คาดว่าจะได้รับ
    ↓
[ตัดสินใจ]
├── ✅ [ยืนยันรับงาน]
│   ↓
│   [ส่งการแจ้งเตือนให้ลูกค้า: Partner ยืนยันแล้ว]
│   ↓
│   [เตรียมรถ]
│   ↓
│   [วันรับรถ - อัพเดทสถานะ: "รับรถแล้ว"]
│   ↓
│   [ระหว่างใช้งาน - สถานะ: "กำลังใช้งาน"]
│   ↓
│   [คืนรถ - อัพเดทสถานะ: "คืนรถแล้ว"]
│   ↓
│   [✅ งานเสร็จสิ้น - รอรับเงิน]
│
└── ❌ [ปฏิเสธงาน]
    ↓
    [กรอกเหตุผล]
    ↓
    [Admin หา Partner คนอื่นแทน]
```

---

### 🛠️ 3. Admin (ผู้ดูแลระบบ)

```
[Admin Dashboard - ศูนย์ควบคุมหลัก]
├── 📊 [ภาพรวมระบบ - System Overview]
│   ├── 📈 สถิติวันนี้ (Today's Stats)
│   │   ├── จำนวนการจองใหม่
│   │   ├── การจองที่รอดำเนินการ
│   │   ├── รายได้วันนี้
│   │   └── Partner ออนไลน์
│   │
│   ├── 📊 กราฟสถิติ (Charts)
│   │   ├── รายได้รายเดือน
│   │   ├── การจองรายวัน
│   │   └── Partner ยอดนิยม
│   │
│   └── ⚠️ แจ้งเตือนเร่งด่วน (Alerts)
│       ├── การจองที่ยังไม่มอบหมาย
│       ├── Partner ที่รอการอนุมัติ
│       └── การร้องเรียน
│
├── 📋 [จัดการการจอง - Booking Management]
│   │
│   ├── [การจองใหม่ - New Bookings] 🔴
│   │   ↓
│   │   [คลิกดูรายละเอียด]
│   │   ├── ข้อมูลลูกค้า
│   │   ├── ประเภทรถที่ต้องการ
│   │   ├── วันเวลา
│   │   ├── จุดรับ-ส่ง
│   │   └── ความต้องการพิเศษ
│   │   ↓
│   │   [🔍 ค้นหา Partner ที่เหมาะสม]
│   │   ├── Filter: ประเภทรถ, พื้นที่, rating
│   │   ├── ดู Partner ที่ว่าง
│   │   └── ดูประวัติ Partner
│   │   ↓
│   │   [เลือก Partner + มอบหมายงาน]
│   │   ├── ส่ง Notification ให้ Partner
│   │   └── ส่ง Notification ให้ลูกค้า
│   │   ↓
│   │   [รอ Partner ยืนยัน]
│   │   ├── ✅ ยืนยัน → แจ้งลูกค้า
│   │   └── ❌ ปฏิเสธ → หา Partner อื่นแทน
│   │
│   ├── [กำลังดำเนินการ - Active Bookings]
│   │   └── ติดตามสถานะ
│   │
│   ├── [เสร็จสิ้น - Completed]
│   │   └── ดูรายงาน
│   │
│   └── [ยกเลิก - Cancelled]
│       └── จัดการคืนเงิน
│
├── 🤝 [จัดการ Partner - Partner Management]
│   │
│   ├── [รอการอนุมัติ - Pending Approval]
│   │   ├── ตรวจสอบเอกสาร
│   │   ├── ตรวจสอบใบอนุญาต
│   │   └── [อนุมัติ / ปฏิเสธ]
│   │
│   ├── [Partner ทั้งหมด - All Partners]
│   │   ├── ดูรายละเอียด
│   │   ├── ดูประวัติงาน
│   │   ├── ดูรีวิว
│   │   └── [ระงับ / เปิดใช้งาน]
│   │
│   ├── [Partner ยอดนิยม - Top Partners]
│   │   └── สถิติ & รางวัล
│   │
│   └── [Partner ที่มีปัญหา - Problem Partners]
│       ├── Rating ต่ำ
│       ├── มีการร้องเรียน
│       └── ปฏิเสธงานบ่อย
│
├── 👥 [จัดการลูกค้า - Customer Management]
│   ├── ลูกค้าทั้งหมด
│   ├── ลูกค้า VIP
│   ├── ลูกค้าที่มีปัญหา
│   └── ประวัติการจอง
│
├── 🚗 [จัดการรถ - Vehicle Management]
│   ├── รถทั้งหมด
│   ├── รออนุมัติ (ถ้ามีระบบอนุมัติรถ)
│   ├── ประเภทรถ (จัดการ categories)
│   └── ยี่ห้อรถ (จัดการ brands)
│
├── 🌍 [จัดการเนื้อหา - Content Management]
│   │
│   ├── [สถานที่ท่องเที่ยว - Attractions]
│   │   ├── [เพิ่มสถานที่ใหม่]
│   │   │   ├── อัพโหลดรูปภาพ
│   │   │   ├── กรอกรายละเอียด
│   │   │   ├── ตำแหน่งบนแผนที่
│   │   │   └── แนะนำหรือไม่?
│   │   ├── [แก้ไข]
│   │   └── [ลบ]
│   │
│   ├── [กิจกรรม - Events]
│   │   ├── [เพิ่มกิจกรรมใหม่]
│   │   │   ├── ชื่อกิจกรรม
│   │   │   ├── วันที่จัด
│   │   │   ├── สถานที่
│   │   │   └── รายละเอียด
│   │   ├── [แก้ไข]
│   │   └── [ลบ]
│   │
│   ├── [โปรโมชั่น - Promotions]
│   │   ├── สร้างโค้ดส่วนลด
│   │   ├── ตั้งค่าเงื่อนไข
│   │   └── กำหนดระยะเวลา
│   │
│   └── [หน้า Landing Page]
│       ├── แบนเนอร์ (Banners)
│       ├── Testimonials
│       └── FAQ
│
├── 💰 [จัดการการเงิน - Financial Management]
│   │
│   ├── [ภาพรวมรายได้ - Revenue Overview]
│   │   ├── รายได้รวม
│   │   ├── ค่าคอมมิชชั่น
│   │   └── กำไรสุทธิ
│   │
│   ├── [การชำระเงิน - Payments]
│   │   ├── รอตรวจสอบ (Pending)
│   │   ├── อนุมัติแล้ว (Approved)
│   │   └── คืนเงิน (Refunds)
│   │
│   ├── [จ่าย Partner - Partner Payouts]
│   │   ├── รอจ่าย
│   │   ├── จ่ายแล้ว
│   │   └── ประวัติการจ่าย
│   │
│   └── [รายงาน - Reports]
│       ├── รายงานรายวัน
│       ├── รายงานรายเดือน
│       └── รายงานรายปี
│
├── ⚙️ [ตั้งค่าระบบ - System Settings]
│   │
│   ├── [การตั้งค่าทั่วไป - General Settings]
│   │   ├── ชื่อเว็บไซต์
│   │   ├── โลโก้
│   │   ├── ข้อมูลติดต่อ
│   │   └── โซเชียลมีเดีย
│   │
│   ├── [ตั้งค่าการจอง - Booking Settings]
│   │   ├── เวลาขั้นต่ำในการจอง
│   │   ├── นโยบายการยกเลิก
│   │   └── ค่ามัดจำ (%)
│   │
│   ├── [ตั้งค่าราคา - Pricing Settings]
│   │   ├── ค่าบริการระบบ (%)
│   │   ├── ค่าคอมมิชชั่น Partner (%)
│   │   └── ค่าธรรมเนียมการยกเลิก
│   │
│   ├── [ตั้งค่าการแจ้งเตือน - Notification Settings]
│   │   ├── Email Templates
│   │   ├── SMS Templates
│   │   └── In-app Notifications
│   │
│   ├── [ตั้งค่าการชำระเงิน - Payment Settings]
│   │   ├── ข้อมูล Payment Gateway
│   │   ├── บัญชีธนาคารรับเงิน
│   │   └── QR PromptPay
│   │
│   └── [จัดการ Admins]
│       ├── เพิ่ม Admin
│       ├── กำหนดสิทธิ์
│       └── ลบ Admin
│
├── 📊 [รายงานและสถิติ - Reports & Analytics]
│   ├── Dashboard Analytics
│   ├── รายงานการจอง
│   ├── รายงาน Partner
│   ├── รายงานลูกค้า
│   ├── รายงานรายได้
│   └── Export ข้อมูล (Excel/PDF)
│
└── 💬 [ข้อความ - Messages]
    ├── แชทกับลูกค้า
    └── แชทกับ Partner
```

---

## 🔄 Flow การจองทั้งหมด (Complete Booking Flow)

### สถานะการจอง (Booking Status):

```
1. ลูกค้าจอง
   ↓
   Status: "รอมอบหมายงาน" (PENDING_ASSIGNMENT)
   🔔 แจ้งเตือน Admin: มีการจองใหม่

2. Admin มอบหมายงานให้ Partner
   ↓
   Status: "รอ Partner ยืนยัน" (PENDING_PARTNER_CONFIRMATION)
   🔔 แจ้งเตือน Partner: คุณได้รับงานใหม่
   🔔 แจ้งเตือนลูกค้า: เรากำลังจัดการให้คุณ

3a. Partner ยืนยัน ✅
    ↓
    Status: "ยืนยันแล้ว" (CONFIRMED)
    🔔 แจ้งเตือนลูกค้า: Partner ยืนยันแล้ว พร้อมข้อมูล Partner
    🔔 แจ้งเตือน Admin: Partner ยืนยันงานแล้ว
    ↓
    [รอถึงวันรับรถ]
    ↓
    Status: "กำลังดำเนินการ" (IN_PROGRESS)
    🔔 แจ้งเตือนลูกค้า + Partner: วันพรุ่งนี้จะรับรถ (24h ก่อน)
    ↓
    [วันรับรถ - Partner อัพเดท]
    ↓
    Status: "รับรถแล้ว" (PICKED_UP)
    🔔 แจ้งเตือนลูกค้า: Partner รับรถแล้ว
    ↓
    [วันคืนรถ - Partner อัพเดท]
    ↓
    Status: "คืนรถแล้ว" (RETURNED)
    🔔 แจ้งเตือนลูกค้า: Partner คืนรถแล้ว กรุณาชำระเงินส่วนที่เหลือ
    ↓
    [ลูกค้าชำระเงินครบ]
    ↓
    Status: "เสร็จสิ้น" (COMPLETED)
    🔔 แจ้งเตือนลูกค้า: ขอบคุณ! กรุณารีวิว
    🔔 แจ้งเตือน Partner: งานเสร็จสิ้น เงินจะโอนภายใน 3-5 วัน

3b. Partner ปฏิเสธ ❌
    ↓
    Status: กลับไป "รอมอบหมายงาน" (PENDING_ASSIGNMENT)
    🔔 แจ้งเตือน Admin: Partner ปฏิเสธงาน ต้องหา Partner อื่น
    ↓
    [Admin เลือก Partner คนอื่น]
    ↓
    กลับไปขั้นตอนที่ 2

4. ลูกค้ายกเลิก
   ↓
   Status: "ยกเลิก" (CANCELLED)
   🔔 แจ้งเตือน Partner: การจองถูกยกเลิก
   🔔 แจ้งเตือน Admin: มีการยกเลิกการจอง
   ↓
   [คำนวณค่าคืนเงิน ตามนโยบาย]
```

---

## 🔔 ระบบแจ้งเตือนทั้งหมด (Notification System)

### 📧 ช่องทางการแจ้งเตือน:
1. **Email** - สำหรับแจ้งเตือนสำคัญทุกอย่าง
2. **SMS** - สำหรับแจ้งเตือนเร่งด่วน
3. **In-app Notification** - แจ้งเตือนในระบบ (real-time)
4. **Line Notify** (Optional) - สำหรับคนไทย

### 🔔 Notification Events:

#### ลูกค้า (Customer):
```
✉️ สมัครสมาชิกสำเร็จ
✉️ ยินดีต้อนรับ + ยืนยันอีเมล
✉️ จองสำเร็จ + เลขที่การจอง
📱 เรากำลังหา Partner ที่เหมาะสมให้คุณ
✉️📱 Partner ยืนยันแล้ว + ข้อมูล Partner
📱 แจ้งชำระเงินส่วนที่เหลือ (3 วันก่อนรับรถ)
📱 เตือนก่อนรับรถ 24 ชั่วโมง
✉️ Partner รับรถแล้ว
✉️ Partner คืนรถแล้ว + กรุณาชำระเงิน
✉️📱 ขอบคุณ! กรุณารีวิว
✉️ การยกเลิกสำเร็จ + รายละเอียดคืนเงิน
💬 มีข้อความใหม่จาก Partner
```

#### Partner:
```
✉️ สมัครสำเร็จ รอการอนุมัติ
✉️📱 คุณได้รับการอนุมัติแล้ว
✉️📱 🔴 คุณมีงานใหม่! (รอยืนยันภายใน 2 ชั่วโมง)
✉️ งานถูกยกเลิก
📱 เตือนก่อนรับรถ 24 ชั่วโมง
✉️ ลูกค้าชำระเงินครบแล้ว
✉️ งานเสร็จสิ้น เงินจะโอนภายใน 3-5 วัน
✉️ โอนเงินให้คุณแล้ว (พร้อมสลิป)
⭐ คุณมีรีวิวใหม่
💬 มีข้อความใหม่จากลูกค้า
```

#### Admin:
```
🔴 มีการจองใหม่ - รอมอบหมายงาน
✉️ Partner ยืนยันงาน
✉️ Partner ปฏิเสธงาน - ต้องหาคนอื่น
🔴 มี Partner สมัครใหม่ - รออนุมัติ
✉️ มีการยกเลิกการจอง
✉️ มีรถใหม่รอการอนุมัติ
⚠️ การจองที่ค้างนานกว่า 2 ชั่วโมง ยังไม่มอบหมาย
⚠️ Partner ไม่ตอบรับภายใน 2 ชั่วโมง
📊 รายงานประจำวัน (ส่งทุกเช้า 8:00)
```

---

## 💾 Database Schema (ตารางฐานข้อมูล)

### 1. users (ผู้ใช้ทั้งหมด)
```sql
- id (UUID, Primary Key)
- email (unique)
- password_hash
- role (customer / partner / admin)
- first_name
- last_name
- phone
- avatar_url
- email_verified (boolean)
- status (active / suspended / pending)
- created_at
- updated_at
```

### 2. customer_profiles
```sql
- id (UUID, Primary Key)
- user_id (Foreign Key → users)
- date_of_birth
- id_card_number (เลขบัตรประชาชน)
- address
- preferred_language (th / en)
- total_bookings (count)
```

### 3. partner_profiles
```sql
- id (UUID, Primary Key)
- user_id (Foreign Key → users)
- business_name
- business_license (ใบอนุญาตกิจการ)
- tax_id (เลขผู้เสียภาษี)
- bank_account_name
- bank_account_number
- bank_name
- rating_average (decimal)
- total_jobs (count)
- total_reviews (count)
- approval_status (pending / approved / rejected)
- approval_date
- approved_by (Foreign Key → users - admin)
- commission_rate (ค่าคอมมิชชั่น %)
```

### 4. vehicles (รถ)
```sql
- id (UUID, Primary Key)
- partner_id (Foreign Key → partner_profiles)
- brand (ยี่ห้อ: Toyota, Honda, etc.)
- model (รุ่น: Camry, Civic, etc.)
- year (ปี: 2023, 2024)
- license_plate (ทะเบียน)
- vehicle_type (sedan / suv / van / pickup / luxury)
- seats (จำนวนที่นั่ง)
- transmission (auto / manual)
- fuel_type (petrol / diesel / hybrid / electric)
- color
- daily_rate_self_drive (ราคาเช่าขับเอง/วัน)
- daily_rate_with_driver (ราคาพร้อมคนขับ/วัน)
- description (รายละเอียด)
- features (JSON: GPS, Bluetooth, etc.)
- images (JSON array: URLs)
- available (boolean)
- status (active / inactive / maintenance)
- created_at
- updated_at
```

### 5. bookings (การจอง)
```sql
- id (UUID, Primary Key)
- booking_number (BK2024001 - unique)
- customer_id (Foreign Key → users)
- partner_id (Foreign Key → partner_profiles - nullable ตอนแรก)
- vehicle_id (Foreign Key → vehicles - nullable ตอนแรก)
- assigned_by (Foreign Key → users - admin id)
- rental_type (self_drive / with_driver)
- pickup_date
- pickup_time
- return_date
- return_time
- pickup_location (JSON: address, lat, lng)
- return_location (JSON: address, lat, lng)
- itinerary (โปรแกรมทัวร์ - text, nullable)
- special_requests (ความต้องการพิเศษ - text)
- vehicle_type_requested (ประเภทรถที่ต้องการ)
- total_days (จำนวนวัน)
- base_price (ราคาพื้นฐาน)
- addons_price (ราคาบริการเสริม)
- service_fee (ค่าบริการระบบ)
- total_price (ราคารวม)
- deposit_amount (เงินมัดจำ)
- deposit_paid (boolean)
- deposit_paid_at
- full_payment_paid (boolean)
- full_payment_paid_at
- status (Enum - ดูด้านล่าง)
- partner_response (accepted / rejected / pending)
- partner_response_at
- partner_reject_reason
- cancellation_reason
- cancelled_by (customer / admin / system)
- cancelled_at
- created_at
- updated_at
```

**Booking Status Values:**
- `PENDING_ASSIGNMENT` - รอ Admin มอบหมาย
- `PENDING_PARTNER_CONFIRMATION` - รอ Partner ยืนยัน
- `CONFIRMED` - Partner ยืนยันแล้ว
- `IN_PROGRESS` - กำลังดำเนินการ
- `PICKED_UP` - รับรถแล้ว
- `RETURNED` - คืนรถแล้ว
- `COMPLETED` - เสร็จสิ้น
- `CANCELLED` - ยกเลิก

### 6. booking_addons (บริการเสริม)
```sql
- id (UUID, Primary Key)
- booking_id (Foreign Key → bookings)
- addon_type (gps / child_seat / insurance / extra_driver)
- addon_name
- price_per_day
- quantity
- total_days
- total_price
```

### 7. payments (การชำระเงิน)
```sql
- id (UUID, Primary Key)
- booking_id (Foreign Key → bookings)
- user_id (Foreign Key → users)
- payment_type (deposit / full_payment / refund)
- amount
- payment_method (credit_card / qr_code / bank_transfer / cash)
- payment_status (pending / success / failed / refunded)
- transaction_id (จาก Payment Gateway)
- payment_proof_url (สลิปโอนเงิน)
- paid_at
- created_at
```

### 8. partner_payouts (จ่ายเงิน Partner)
```sql
- id (UUID, Primary Key)
- partner_id (Foreign Key → partner_profiles)
- booking_id (Foreign Key → bookings)
- amount (จำนวนเงินที่จ่าย)
- commission_amount (ค่าคอมมิชชั่นที่หัก)
- net_amount (เงินสุทธิที่ Partner ได้)
- payout_status (pending / processing / paid / failed)
- paid_at
- payment_slip_url
- created_at
```

### 9. reviews (รีวิว)
```sql
- id (UUID, Primary Key)
- booking_id (Foreign Key → bookings)
- customer_id (Foreign Key → users)
- partner_id (Foreign Key → partner_profiles)
- vehicle_id (Foreign Key → vehicles)
- rating (1-5)
- comment (text)
- reply (partner's reply - text, nullable)
- replied_at
- created_at
```

### 10. attractions (สถานที่ท่องเที่ยว)
```sql
- id (UUID, Primary Key)
- name (ชื่อสถานที่)
- description (รายละเอียด)
- location (JSON: address, lat, lng)
- category (beach / mountain / temple / market / etc.)
- images (JSON array)
- is_recommended (boolean)
- view_count
- created_by (Foreign Key → users - admin)
- created_at
- updated_at
```

### 11. events (กิจกรรม)
```sql
- id (UUID, Primary Key)
- title
- description
- event_date
- event_end_date (nullable)
- location (JSON: address, lat, lng)
- images (JSON array)
- is_featured (boolean)
- view_count
- created_by (Foreign Key → users - admin)
- created_at
- updated_at
```

### 12. notifications (การแจ้งเตือน)
```sql
- id (UUID, Primary Key)
- user_id (Foreign Key → users)
- type (booking / payment / review / system / etc.)
- title
- message
- link_url (ลิงก์ไปยังหน้าที่เกี่ยวข้อง)
- read (boolean)
- read_at
- created_at
```

### 13. messages (ข้อความ/แชท)
```sql
- id (UUID, Primary Key)
- conversation_id (UUID - group messages)
- sender_id (Foreign Key → users)
- receiver_id (Foreign Key → users)
- booking_id (Foreign Key → bookings - nullable)
- message_text
- attachment_url (nullable)
- read (boolean)
- read_at
- created_at
```

### 14. system_settings (ตั้งค่าระบบ)
```sql
- id (UUID, Primary Key)
- setting_key (unique)
- setting_value (JSON)
- description
- updated_by (Foreign Key → users - admin)
- updated_at
```

**ตัวอย่าง settings:**
- `site_name` - ชื่อเว็บไซต์
- `deposit_percentage` - % เงินมัดจำ (30)
- `service_fee_percentage` - % ค่าบริการระบบ (10)
- `default_commission_rate` - % ค่าคอมมิชชั่น Partner (15)
- `cancellation_policy` - นโยบายการยกเลิก
- `payment_methods` - วิธีชำระเงินที่เปิดใช้
- `notification_settings` - ตั้งค่าการแจ้งเตือน

### 15. promo_codes (โค้ดส่วนลด)
```sql
- id (UUID, Primary Key)
- code (unique)
- discount_type (percentage / fixed_amount)
- discount_value
- minimum_booking_amount
- max_discount_amount (nullable)
- usage_limit
- used_count
- valid_from
- valid_until
- status (active / inactive / expired)
- created_by (Foreign Key → users - admin)
- created_at
```

---

## 💳 ระบบการชำระเงิน (Payment Flow)

### ขั้นตอนการชำระเงิน:

```
[1] เงินมัดจำ 30% (Deposit)
    ↓
    เมื่อ: จองสำเร็จ
    จำนวน: 30% ของราคารวม
    วิธี: บัตรเครดิต / QR / โอน
    ↓
    ✅ ชำระสำเร็จ → Status: "รอ Admin มอบหมาย"

[2] ชำระเงินส่วนที่เหลือ 70%
    ↓
    เมื่อ: 3 วันก่อนรับรถ (หรือตอนคืนรถ)
    จำนวน: 70% ของราคารวม
    วิธี: บัตรเครดิต / QR / โอน / เงินสด
    ↓
    ✅ ชำระครบ → Status: "เสร็จสิ้น"

[3] จ่ายเงินให้ Partner
    ↓
    เมื่อ: งานเสร็จสิ้น + ชำระเงินครบ
    ระยะเวลา: 3-5 วันทำการ
    คำนวณ:
    - รายได้ Partner = ราคารถ x จำนวนวัน
    - หักค่าคอมมิชชั่น (15%)
    - เงินสุทธิที่ Partner ได้
    ↓
    โอนเข้าบัญชีธนาคาร Partner
```

### ตัวอย่างการคำนวณ:

```
รถเช่าพร้อมคนขับ 3 วัน
ราคา 2,000฿/วัน = 6,000฿

Add-ons:
- GPS: 100฿/วัน x 3 = 300฿
- ประกันเพิ่ม: 200฿/วัน x 3 = 600฿

รวม: 6,900฿
ค่าบริการระบบ (10%): 690฿
ราคารวมสุทธิ: 7,590฿

เงินมัดจำ 30%: 2,277฿
ชำระเมื่อรับรถ 70%: 5,313฿

------------------------------
รายได้แยก:
- Admin (ค่าบริการ + คอมมิชชั่น):
  690฿ + (6,000฿ x 15%) = 690฿ + 900฿ = 1,590฿

- Partner (สุทธิ):
  6,000฿ - 900฿ = 5,100฿
  + Add-ons: 900฿
  = 6,000฿
```

---

## 🎨 หน้าเว็บทั้งหมด (All Pages)

### 🌐 Public Pages (ไม่ต้อง Login)

1. **หน้าแรก (Landing Page)** - `/`
   - Hero section พร้อมฟอร์มค้นหาด่วน
   - สถานที่ท่องเที่ยวแนะนำ
   - กิจกรรมที่กำลังมาถึง
   - ประเภทรถ
   - How it works
   - Reviews
   - FAQ

2. **ผลการค้นหา (Search Results)** - `/search`
   - แสดงรถที่ตรงเงื่อนไข
   - Filter & Sort

3. **รายละเอียดรถ (Vehicle Detail)** - `/vehicles/[id]`
   - รูปภาพ
   - สเปค
   - ราคา
   - รีวิว
   - ปฏิทิน

4. **สถานที่ท่องเที่ยว (Attractions)** - `/attractions`
   - List + Filter

5. **กิจกรรม (Events)** - `/events`
   - List + Calendar view

6. **เกี่ยวกับเรา (About)** - `/about`

7. **ติดต่อเรา (Contact)** - `/contact`

8. **Login** - `/login`

9. **Register** - `/register`
   - Register as Customer
   - Register as Partner

---

### 👤 Customer Pages (ต้อง Login)

10. **กรอกข้อมูลการจอง** - `/booking/new`

11. **ชำระเงิน** - `/booking/[id]/payment`

12. **Dashboard** - `/customer/dashboard`

13. **การจองของฉัน** - `/customer/bookings`

14. **รายละเอียดการจอง** - `/customer/bookings/[id]`

15. **โปรไฟล์** - `/customer/profile`

16. **ข้อความ** - `/customer/messages`

17. **รีวิว** - `/customer/reviews`

---

### 🚗 Partner Pages (ต้อง Login + Approved)

18. **Partner Dashboard** - `/partner/dashboard`

19. **งานของฉัน** - `/partner/jobs`

20. **รายละเอียดงาน** - `/partner/jobs/[id]`

21. **รถของฉัน** - `/partner/vehicles`

22. **เพิ่ม/แก้ไขรถ** - `/partner/vehicles/new` | `/partner/vehicles/[id]/edit`

23. **รายได้** - `/partner/earnings`

24. **รีวิว** - `/partner/reviews`

25. **ข้อความ** - `/partner/messages`

26. **ตั้งค่า** - `/partner/settings`

---

### 🛠️ Admin Pages (ต้อง Login + Admin)

27. **Admin Dashboard** - `/admin/dashboard`

28. **จัดการการจอง** - `/admin/bookings`

29. **รายละเอียดการจอง** - `/admin/bookings/[id]`

30. **จัดการ Partners** - `/admin/partners`

31. **อนุมัติ Partner** - `/admin/partners/pending`

32. **จัดการลูกค้า** - `/admin/customers`

33. **จัดการรถ** - `/admin/vehicles`

34. **จัดการสถานที่** - `/admin/attractions`

35. **จัดการกิจกรรม** - `/admin/events`

36. **จัดการการเงิน** - `/admin/finance`

37. **จ่าย Partner** - `/admin/payouts`

38. **โปรโมชั่น** - `/admin/promotions`

39. **รายงาน** - `/admin/reports`

40. **ตั้งค่าระบบ** - `/admin/settings`

41. **ข้อความ** - `/admin/messages`

---

## 🔐 Security Features

- ✅ JWT Authentication
- ✅ Role-based Access Control (RBAC)
- ✅ Email Verification
- ✅ Password Reset
- ✅ Rate Limiting
- ✅ SQL Injection Prevention (Supabase handles)
- ✅ XSS Prevention
- ✅ CSRF Protection
- ✅ Secure File Upload (validation)
- ✅ HTTPS Only
- ✅ Input Sanitization

---

## 📱 Additional Features

### 1. Multi-language (TH/EN)
- ใช้ `next-i18next`
- ทุกเนื้อหาในฐานข้อมูลมี 2 ภาษา

### 2. Responsive Design
- Mobile-first approach
- ทำงานได้ทุกอุปกรณ์

### 3. SEO Optimization
- Meta tags
- Open Graph
- Sitemap
- Structured Data (JSON-LD)

### 4. Performance
- Image Optimization (Next.js Image)
- Code Splitting
- Lazy Loading
- Caching

### 5. PWA (Progressive Web App)
- ติดตั้งเป็น App ได้
- Offline support (บางส่วน)
- Push Notifications

### 6. Analytics
- Google Analytics
- Track user behavior
- Conversion tracking

---

## 🚀 Future Features (Phase 2)

- 📍 GPS Tracking แบบ Real-time
- 🗺️ แผนที่แสดงเส้นทาง
- 📹 Video call กับ Partner
- 🤖 Chatbot AI สำหรับตอบคำถาม
- 🏆 ระบบสะสมคะแนน/สมาชิก VIP
- 📊 Advanced Analytics Dashboard
- 🔗 API สำหรับ Third-party Integration
- 📲 Mobile App (React Native)

---

## ✅ สรุป

ระบบนี้เป็น **Marketplace Platform แบบครบวงจร** ที่:

✨ **ลูกค้า** สามารถค้นหาและจองรถได้ง่าย พร้อมข้อมูลครบถ้วน

🚗 **Partner** มี Dashboard จัดการงานและรถของตัวเอง รับแจ้งเตือนงานใหม่

🛠️ **Admin** ควบคุมระบบทั้งหมด จับคู่งาน จัดการคุณภาพ

💰 **ระบบการเงิน** โปร่งใส มีการหักค่าคอมมิชชั่นอัตโนมัติ

🔔 **การแจ้งเตือน** ครบทุกขั้นตอน ทุกฝ่ายรู้สถานะตลอด

📊 **รายงาน & สถิติ** เพื่อการตัดสินใจ

---

**ถัดไป: พร้อมให้ผมเริ่มสร้างโปรเจคไหมครับ?** 🎉
