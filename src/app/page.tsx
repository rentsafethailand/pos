'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Car, Shield, Star, MapPin, Clock, Users } from 'lucide-react'

export default function LandingPage() {
  const [searchForm, setSearchForm] = useState({
    pickup_date: '',
    return_date: '',
    rental_type: 'self_drive',
  })

  const handleSearch = () => {
    // Navigate to search results
    window.location.href = `/search?pickup_date=${searchForm.pickup_date}&return_date=${searchForm.return_date}&rental_type=${searchForm.rental_type}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">CarRental</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-gray-700 hover:text-blue-600">หน้าแรก</Link>
              <Link href="/vehicles" className="text-gray-700 hover:text-blue-600">รถเช่า</Link>
              <Link href="/attractions" className="text-gray-700 hover:text-blue-600">สถานที่ท่องเที่ยว</Link>
              <Link href="/events" className="text-gray-700 hover:text-blue-600">กิจกรรม</Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600">เกี่ยวกับเรา</Link>
              <Link href="/contact" className="text-gray-700 hover:text-blue-600">ติดต่อเรา</Link>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/login">
                <Button variant="outline">เข้าสู่ระบบ</Button>
              </Link>
              <Link href="/register">
                <Button>สมัครสมาชิก</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            เช่ารถ จองทัวร์
            <span className="text-blue-600"> ง่ายๆ ไว้ใจได้</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            แพลตฟอร์มจองรถเช่าและทัวร์ท่องเที่ยว รองรับทั้งขับเองและพร้อมคนขับ
            เลือกรถได้หลากหลาย ราคายุติธรรม
          </p>

          {/* Quick Search Form */}
          <Card className="max-w-4xl mx-auto shadow-xl">
            <CardHeader>
              <CardTitle>ค้นหารถเช่าของคุณ</CardTitle>
              <CardDescription>กรอกข้อมูลเพื่อค้นหารถที่เหมาะกับคุณ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">วันที่รับรถ</label>
                  <Input
                    type="date"
                    value={searchForm.pickup_date}
                    onChange={(e) => setSearchForm({ ...searchForm, pickup_date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">วันที่คืนรถ</label>
                  <Input
                    type="date"
                    value={searchForm.return_date}
                    onChange={(e) => setSearchForm({ ...searchForm, return_date: e.target.value })}
                    min={searchForm.pickup_date || new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">ประเภทการเช่า</label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={searchForm.rental_type}
                    onChange={(e) => setSearchForm({ ...searchForm, rental_type: e.target.value })}
                  >
                    <option value="self_drive">ขับเอง</option>
                    <option value="with_driver">พร้อมคนขับ</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button onClick={handleSearch} className="w-full h-10" size="lg">
                    ค้นหา
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">ทำไมต้องเลือกเรา?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>ปลอดภัย มั่นใจ</CardTitle>
                <CardDescription>
                  รถทุกคันผ่านการตรวจสอบ พร้อมประกันภัยครบถ้วน
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>คุณภาพดี</CardTitle>
                <CardDescription>
                  Partner ผ่านการคัดสรร มีรีวิวจากลูกค้าจริง
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>จองง่าย รวดเร็ว</CardTitle>
                <CardDescription>
                  ระบบจองอัตโนมัติ ได้รับการยืนยันภายในไม่กี่นาที
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">สถานที่ท่องเที่ยวยอดนิยม</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'เชียงใหม่', image: '/attractions/chiangmai.jpg', trips: 245 },
              { name: 'ภูเก็ต', image: '/attractions/phuket.jpg', trips: 189 },
              { name: 'กระบี่', image: '/attractions/krabi.jpg', trips: 156 },
            ].map((destination) => (
              <Card key={destination.name} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <MapPin className="h-16 w-16 text-white" />
                </div>
                <CardHeader>
                  <CardTitle>{destination.name}</CardTitle>
                  <CardDescription>{destination.trips} ทริป</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">วิธีการใช้งาน</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'ค้นหารถ', desc: 'เลือกวันที่และประเภทรถที่ต้องการ' },
              { step: 2, title: 'เลือกรถ', desc: 'เปรียบเทียบราคาและรีวิว' },
              { step: 3, title: 'จองและชำระ', desc: 'กรอกข้อมูลและชำระเงินมัดจำ' },
              { step: 4, title: 'รับรถ', desc: 'รับรถตามวันเวลาที่นัดหมาย' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">รีวิวจากลูกค้า</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'คุณสมชาย', rating: 5, comment: 'บริการดีมาก รถสะอาด คนขับใจดี' },
              { name: 'คุณสมหญิง', rating: 5, comment: 'ราคายุติธรรม จองง่าย ได้รถตรงเวลา' },
              { name: 'คุณสมศรี', rating: 5, comment: 'ประทับใจมาก จะใช้บริการอีกแน่นอน' },
            ].map((review, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-center mb-2">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <CardDescription className="text-base">{review.comment}</CardDescription>
                  <CardTitle className="text-lg mt-4">{review.name}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">พร้อมเริ่มต้นการเดินทางแล้วหรือยัง?</h2>
          <p className="text-xl mb-8">สมัครสมาชิกวันนี้ รับส่วนลด 10% สำหรับการจองครั้งแรก</p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              สมัครสมาชิกเลย
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Car className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">CarRental</span>
            </div>
            <p className="text-sm">แพลตฟอร์มจองรถเช่าที่ดีที่สุดในประเทศไทย</p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">บริการ</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/vehicles">รถเช่า</Link></li>
              <li><Link href="/tours">ทัวร์</Link></li>
              <li><Link href="/driver">เช่าพร้อมคนขับ</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">ช่วยเหลือ</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/faq">คำถามที่พบบ่อย</Link></li>
              <li><Link href="/terms">ข้อกำหนดการใช้งาน</Link></li>
              <li><Link href="/privacy">นโยบายความเป็นส่วนตัว</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">ติดต่อเรา</h3>
            <ul className="space-y-2 text-sm">
              <li>โทร: 02-xxx-xxxx</li>
              <li>อีเมล: info@carrental.com</li>
              <li>Line: @carrental</li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-sm">
          <p>&copy; 2024 Car Rental Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
