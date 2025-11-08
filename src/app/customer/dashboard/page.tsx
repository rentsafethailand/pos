'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, getCurrentUser, signOut } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Car, Clock, Star, Bell, LogOut, User, Settings, MapPin } from 'lucide-react'
import { formatDate, formatCurrency, getStatusColor, getStatusLabel } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Booking } from '@/types'

export default function CustomerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }

      // Get user details
      const { data: userData } = await supabase
        .from('users')
        .select('*, customer_profile:customer_profiles(*)')
        .eq('id', currentUser.id)
        .single()

      setUser(userData)

      // Get bookings
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`
          *,
          vehicle:vehicles(*),
          partner:partner_profiles(*, user:users(*))
        `)
        .eq('customer_id', currentUser.id)
        .order('created_at', { ascending: false })

      if (bookingsData) {
        setBookings(bookingsData)
        setStats({
          total: bookingsData.length,
          active: bookingsData.filter(b =>
            ['CONFIRMED', 'IN_PROGRESS', 'PICKED_UP'].includes(b.status)
          ).length,
          completed: bookingsData.filter(b => b.status === 'COMPLETED').length,
          cancelled: bookingsData.filter(b => b.status === 'CANCELLED').length,
        })
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('ไม่สามารถโหลดข้อมูลได้')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/login')
      toast.success('ออกจากระบบสำเร็จ')
    } catch (error) {
      toast.error('ไม่สามารถออกจากระบบได้')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <Car className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold">CarRental</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost">หน้าแรก</Button>
              </Link>
              <Link href="/customer/bookings">
                <Button variant="ghost">การจองของฉัน</Button>
              </Link>
              <Link href="/customer/notifications">
                <Button variant="ghost" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    3
                  </span>
                </Button>
              </Link>
              <Link href="/customer/profile">
                <Button variant="ghost">
                  <User className="h-5 w-5 mr-2" />
                  {user?.first_name}
                </Button>
              </Link>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            สวัสดี, {user?.first_name} {user?.last_name}!
          </h1>
          <p className="text-gray-600">ยินดีต้อนรับกลับมาที่ Dashboard ของคุณ</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">การจองทั้งหมด</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">กำลังดำเนินการ</p>
                  <p className="text-3xl font-bold">{stats.active}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">เสร็จสิ้น</p>
                  <p className="text-3xl font-bold">{stats.completed}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Car className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">คะแนนเฉลี่ย</p>
                  <p className="text-3xl font-bold">4.8</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/search">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Car className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">จองรถใหม่</h3>
                  <p className="text-sm text-gray-600">ค้นหาและจองรถที่เหมาะกับคุณ</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/customer/bookings">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">การจองของฉัน</h3>
                  <p className="text-sm text-gray-600">ดูและจัดการการจองทั้งหมด</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/customer/profile">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Settings className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">ตั้งค่าบัญชี</h3>
                  <p className="text-sm text-gray-600">จัดการข้อมูลส่วนตัว</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>การจองล่าสุด</CardTitle>
              <Link href="/customer/bookings">
                <Button variant="ghost">ดูทั้งหมด →</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">ยังไม่มีการจอง</h3>
                <p className="text-gray-600 mb-4">เริ่มต้นเช่ารถกับเราวันนี้!</p>
                <Link href="/search">
                  <Button>ค้นหารถ</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.slice(0, 5).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                        {booking.vehicle?.images?.[0] ? (
                          <img
                            src={booking.vehicle.images[0]}
                            alt="Vehicle"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Car className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold">
                            {booking.vehicle?.brand} {booking.vehicle?.model}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(booking.status)}`}>
                            {getStatusLabel(booking.status, 'th')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          เลขที่จอง: {booking.booking_number}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(booking.pickup_date)}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {booking.pickup_location.address}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{formatCurrency(booking.total_price)}</p>
                      <Link href={`/customer/bookings/${booking.id}`}>
                        <Button size="sm" variant="outline" className="mt-2">
                          ดูรายละเอียด
                        </Button>
                      </Link>
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
