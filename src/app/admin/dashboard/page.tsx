'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, getCurrentUser, signOut } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Users, Car, DollarSign, Calendar, TrendingUp, AlertCircle,
  Bell, LogOut, Settings, CheckCircle, Clock, UserCheck
} from 'lucide-react'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total_bookings: 0,
    pending_assignment: 0,
    active_bookings: 0,
    completed_bookings: 0,
    total_customers: 0,
    total_partners: 0,
    pending_partners: 0,
    total_vehicles: 0,
    total_revenue: 0,
    this_month_revenue: 0,
  })
  const [recentBookings, setRecentBookings] = useState<any[]>([])
  const [pendingPartners, setPendingPartners] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const checkAdmin = async () => {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return null
    }

    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', currentUser.id)
      .single()

    if (data?.role !== 'admin') {
      toast.error('คุณไม่มีสิทธิ์เข้าถึงหน้านี้')
      router.push('/')
      return null
    }

    return data
  }

  const loadData = async () => {
    try {
      const adminUser = await checkAdmin()
      if (!adminUser) return

      setUser(adminUser)

      // Load all data in parallel
      const [
        bookingsResult,
        customersResult,
        partnersResult,
        vehiclesResult
      ] = await Promise.all([
        supabase.from('bookings').select('*, customer:users!customer_id(*), partner:partner_profiles(*), vehicle:vehicles(*)'),
        supabase.from('users').select('id').eq('role', 'customer'),
        supabase.from('partner_profiles').select('*, user:users(*)'),
        supabase.from('vehicles').select('id')
      ])

      const bookings = bookingsResult.data || []
      const customers = customersResult.data || []
      const partners = partnersResult.data || []
      const vehicles = vehiclesResult.data || []

      // Calculate stats
      const now = new Date()
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

      setStats({
        total_bookings: bookings.length,
        pending_assignment: bookings.filter(b => b.status === 'PENDING_ASSIGNMENT').length,
        active_bookings: bookings.filter(b =>
          ['CONFIRMED', 'IN_PROGRESS', 'PICKED_UP'].includes(b.status)
        ).length,
        completed_bookings: bookings.filter(b => b.status === 'COMPLETED').length,
        total_customers: customers.length,
        total_partners: partners.filter(p => p.approval_status === 'approved').length,
        pending_partners: partners.filter(p => p.approval_status === 'pending').length,
        total_vehicles: vehicles.length,
        total_revenue: bookings
          .filter(b => b.status === 'COMPLETED')
          .reduce((sum, b) => sum + b.service_fee, 0),
        this_month_revenue: bookings
          .filter(b => b.status === 'COMPLETED' && new Date(b.updated_at) >= thisMonthStart)
          .reduce((sum, b) => sum + b.service_fee, 0),
      })

      // Set recent bookings
      setRecentBookings(bookings.slice(0, 10))

      // Set pending partners
      setPendingPartners(partners.filter(p => p.approval_status === 'pending'))
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('ไม่สามารถโหลดข้อมูลได้')
    } finally {
      setLoading(false)
    }
  }

  const handleApprovePartner = async (partnerId: string) => {
    try {
      const { error } = await supabase
        .from('partner_profiles')
        .update({
          approval_status: 'approved',
          approval_date: new Date().toISOString(),
          approved_by: user.id,
        })
        .eq('id', partnerId)

      if (error) throw error

      toast.success('อนุมัติ Partner สำเร็จ!')
      loadData()
    } catch (error: any) {
      toast.error('ไม่สามารถอนุมัติได้: ' + error.message)
    }
  }

  const handleAssignPartner = async (bookingId: string) => {
    router.push(`/admin/bookings/${bookingId}/assign`)
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard" className="flex items-center space-x-2">
                <Car className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold">Admin Panel</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin/bookings">
                <Button variant="ghost">การจอง</Button>
              </Link>
              <Link href="/admin/partners">
                <Button variant="ghost">
                  Partners
                  {stats.pending_partners > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                      {stats.pending_partners}
                    </span>
                  )}
                </Button>
              </Link>
              <Link href="/admin/customers">
                <Button variant="ghost">ลูกค้า</Button>
              </Link>
              <Link href="/admin/vehicles">
                <Button variant="ghost">รถ</Button>
              </Link>
              <Link href="/admin/content">
                <Button variant="ghost">เนื้อหา</Button>
              </Link>
              <Link href="/admin/settings">
                <Button variant="ghost">
                  <Settings className="h-5 w-5" />
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
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">ภาพรวมระบบทั้งหมด</p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">การจองทั้งหมด</p>
                  <p className="text-3xl font-bold">{stats.total_bookings}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.active_bookings} กำลังดำเนินการ
                  </p>
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
                    {formatCurrency(stats.this_month_revenue).split('.')[0]}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    ค่าบริการระบบ
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
                  <p className="text-sm font-medium text-gray-600">ลูกค้า</p>
                  <p className="text-3xl font-bold">{stats.total_customers}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    สมาชิกทั้งหมด
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Partners</p>
                  <p className="text-3xl font-bold">{stats.total_partners}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.pending_partners} รออนุมัติ
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/admin/bookings?status=pending">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">รอมอบหมายงาน</p>
                    <p className="text-3xl font-bold text-orange-600">{stats.pending_assignment}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">เสร็จสิ้น</p>
                  <p className="text-3xl font-bold text-green-600">{stats.completed_bookings}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">รถทั้งหมด</p>
                  <p className="text-3xl font-bold">{stats.total_vehicles}</p>
                </div>
                <Car className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Assignments */}
          {stats.pending_assignment > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-orange-600" />
                    การจองที่รอมอบหมาย
                  </CardTitle>
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
                    {stats.pending_assignment} รายการ
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentBookings
                    .filter(b => b.status === 'PENDING_ASSIGNMENT')
                    .slice(0, 5)
                    .map((booking) => (
                      <div key={booking.id} className="p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold">{booking.booking_number}</p>
                            <p className="text-sm text-gray-600">
                              {booking.customer?.first_name} {booking.customer?.last_name}
                            </p>
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDate(booking.created_at)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-3">
                          <div>📅 {formatDate(booking.pickup_date)}</div>
                          <div>🚗 {booking.vehicle_type_requested}</div>
                          <div className="text-green-600 font-semibold">
                            {formatCurrency(booking.total_price)}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => handleAssignPartner(booking.id)}
                        >
                          มอบหมายงาน
                        </Button>
                      </div>
                    ))}
                </div>
                {stats.pending_assignment > 5 && (
                  <Link href="/admin/bookings?status=pending">
                    <Button variant="ghost" className="w-full mt-4">
                      ดูทั้งหมด →
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}

          {/* Pending Partners */}
          {stats.pending_partners > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-blue-600" />
                    Partner รออนุมัติ
                  </CardTitle>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                    {stats.pending_partners} คน
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingPartners.slice(0, 5).map((partner) => (
                    <div key={partner.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold">{partner.business_name}</p>
                          <p className="text-sm text-gray-600">
                            {partner.user?.first_name} {partner.user?.last_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {partner.user?.email}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        {partner.tax_id && <div>เลขผู้เสียภาษี: {partner.tax_id}</div>}
                      </div>
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => handleApprovePartner(partner.id)}
                      >
                        อนุมัติ
                      </Button>
                    </div>
                  ))}
                </div>
                {stats.pending_partners > 5 && (
                  <Link href="/admin/partners?status=pending">
                    <Button variant="ghost" className="w-full mt-4">
                      ดูทั้งหมด →
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>การจองล่าสุด</CardTitle>
                <Link href="/admin/bookings">
                  <Button variant="ghost" size="sm">ดูทั้งหมด →</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentBookings.slice(0, 8).map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/admin/bookings/${booking.id}`}
                    className="block p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{booking.booking_number}</p>
                        <p className="text-xs text-gray-600">
                          {booking.customer?.first_name} → {booking.vehicle?.brand} {booking.vehicle?.model}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(booking.status)}`}>
                        {getStatusLabel(booking.status, 'th')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
