'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, getCurrentUser, signOut } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Car, DollarSign, Calendar, Star, Bell, LogOut, User,
  Settings, CheckCircle, Clock, XCircle, TrendingUp
} from 'lucide-react'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Booking } from '@/types'

export default function PartnerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [partner, setPartner] = useState<any>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [stats, setStats] = useState({
    total_jobs: 0,
    pending_jobs: 0,
    active_jobs: 0,
    completed_jobs: 0,
    total_vehicles: 0,
    total_earnings: 0,
    this_month_earnings: 0,
    rating: 0,
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

      // Get user and partner profile
      const { data: userData } = await supabase
        .from('users')
        .select('*, partner_profile:partner_profiles(*)')
        .eq('id', currentUser.id)
        .single()

      if (userData?.role !== 'partner') {
        toast.error('คุณไม่มีสิทธิ์เข้าถึงหน้านี้')
        router.push('/')
        return
      }

      setUser(userData)
      setPartner(userData.partner_profile)

      // Get bookings assigned to this partner
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`
          *,
          vehicle:vehicles(*),
          customer:users!customer_id(*)
        `)
        .eq('partner_id', userData.partner_profile.id)
        .order('created_at', { ascending: false })

      if (bookingsData) {
        setBookings(bookingsData)

        // Calculate stats
        const now = new Date()
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

        setStats({
          total_jobs: bookingsData.length,
          pending_jobs: bookingsData.filter(b => b.partner_response === 'pending').length,
          active_jobs: bookingsData.filter(b =>
            ['CONFIRMED', 'IN_PROGRESS', 'PICKED_UP'].includes(b.status)
          ).length,
          completed_jobs: bookingsData.filter(b => b.status === 'COMPLETED').length,
          total_vehicles: 0, // Will be updated below
          total_earnings: bookingsData
            .filter(b => b.status === 'COMPLETED')
            .reduce((sum, b) => sum + (b.base_price - (b.base_price * (userData.partner_profile.commission_rate / 100))), 0),
          this_month_earnings: bookingsData
            .filter(b => b.status === 'COMPLETED' && new Date(b.completed_at || b.updated_at) >= thisMonthStart)
            .reduce((sum, b) => sum + (b.base_price - (b.base_price * (userData.partner_profile.commission_rate / 100))), 0),
          rating: userData.partner_profile.rating_average || 0,
        })
      }

      // Get vehicles
      const { data: vehiclesData } = await supabase
        .from('vehicles')
        .select('*')
        .eq('partner_id', userData.partner_profile.id)

      if (vehiclesData) {
        setVehicles(vehiclesData)
        setStats(prev => ({ ...prev, total_vehicles: vehiclesData.length }))
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('ไม่สามารถโหลดข้อมูลได้')
    } finally {
      setLoading(false)
    }
  }

  const handleJobResponse = async (bookingId: string, response: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          partner_response: response,
          partner_response_at: new Date().toISOString(),
          status: response === 'accepted' ? 'CONFIRMED' : 'PENDING_ASSIGNMENT',
        })
        .eq('id', bookingId)

      if (error) throw error

      toast.success(response === 'accepted' ? 'ยืนยันรับงานสำเร็จ!' : 'ปฏิเสธงานสำเร็จ')
      loadData()
    } catch (error: any) {
      toast.error('ไม่สามารถดำเนินการได้: ' + error.message)
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Check if partner is approved
  if (partner?.approval_status !== 'approved') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">รอการอนุมัติ</h2>
            <p className="text-gray-600 mb-6">
              {partner?.approval_status === 'pending' && 'บัญชีของคุณกำลังรอการอนุมัติจาก Admin'}
              {partner?.approval_status === 'rejected' && 'บัญชีของคุณถูกปฏิเสธ กรุณาติดต่อ Admin'}
            </p>
            <Button onClick={handleLogout}>ออกจากระบบ</Button>
          </CardContent>
        </Card>
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
                <span className="text-xl font-bold">CarRental Partner</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/partner/jobs">
                <Button variant="ghost">งานของฉัน</Button>
              </Link>
              <Link href="/partner/vehicles">
                <Button variant="ghost">รถของฉัน</Button>
              </Link>
              <Link href="/partner/earnings">
                <Button variant="ghost">รายได้</Button>
              </Link>
              <Link href="/partner/notifications">
                <Button variant="ghost" className="relative">
                  <Bell className="h-5 w-5" />
                  {stats.pending_jobs > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {stats.pending_jobs}
                    </span>
                  )}
                </Button>
              </Link>
              <Link href="/partner/settings">
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
            สวัสดี, {partner?.business_name}!
          </h1>
          <p className="text-gray-600">ภาพรวมธุรกิจของคุณ</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">งานใหม่</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.pending_jobs}</p>
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
                  <p className="text-sm font-medium text-gray-600">กำลังดำเนินการ</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.active_jobs}</p>
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
                  <p className="text-sm font-medium text-gray-600">รายได้เดือนนี้</p>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(stats.this_month_earnings).split('.')[0]}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">คะแนนเฉลี่ย</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.rating.toFixed(1)}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">งานทั้งหมด</p>
                  <p className="text-2xl font-bold">{stats.total_jobs}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">รถทั้งหมด</p>
                  <p className="text-2xl font-bold">{stats.total_vehicles}</p>
                </div>
                <Car className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">รีวิวทั้งหมด</p>
                  <p className="text-2xl font-bold">{partner?.total_reviews || 0}</p>
                </div>
                <Star className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Jobs */}
          {stats.pending_jobs > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-orange-600" />
                    งานใหม่ที่รอยืนยัน
                  </CardTitle>
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
                    {stats.pending_jobs} งาน
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings
                    .filter(b => b.partner_response === 'pending')
                    .slice(0, 3)
                    .map((booking) => (
                      <div key={booking.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold">{booking.booking_number}</p>
                            <p className="text-sm text-gray-600">
                              {booking.customer?.first_name} {booking.customer?.last_name}
                            </p>
                          </div>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {booking.rental_type === 'self_drive' ? 'ขับเอง' : 'พร้อมคนขับ'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-3">
                          <div>📅 {formatDate(booking.pickup_date)} - {formatDate(booking.return_date)}</div>
                          <div>📍 {booking.pickup_location.address}</div>
                          <div className="font-semibold text-green-600 mt-2">
                            รายได้: {formatCurrency(booking.base_price * (1 - partner.commission_rate / 100))}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleJobResponse(booking.id, 'accepted')}
                            className="flex-1"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            ยืนยัน
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleJobResponse(booking.id, 'rejected')}
                            className="flex-1"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            ปฏิเสธ
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
                {stats.pending_jobs > 3 && (
                  <Link href="/partner/jobs">
                    <Button variant="ghost" className="w-full mt-4">
                      ดูทั้งหมด ({stats.pending_jobs} งาน) →
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}

          {/* Active Jobs */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>งานที่กำลังดำเนินการ</CardTitle>
                <Link href="/partner/jobs?status=active">
                  <Button variant="ghost" size="sm">ดูทั้งหมด →</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {bookings.filter(b => ['CONFIRMED', 'IN_PROGRESS', 'PICKED_UP'].includes(b.status)).length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">ยังไม่มีงานที่กำลังดำเนินการ</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings
                    .filter(b => ['CONFIRMED', 'IN_PROGRESS', 'PICKED_UP'].includes(b.status))
                    .slice(0, 5)
                    .map((booking) => (
                      <div key={booking.id} className="p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{booking.booking_number}</p>
                            <p className="text-xs text-gray-600">
                              {formatDate(booking.pickup_date)}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(booking.status)}`}>
                            {getStatusLabel(booking.status, 'th')}
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
    </div>
  )
}
