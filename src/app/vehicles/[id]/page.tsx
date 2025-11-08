'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, getCurrentUser } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Car, Users, Fuel, Settings as SettingsIcon, Star, MapPin,
  Calendar, ChevronLeft, Check, X
} from 'lucide-react'
import { formatCurrency, calculateDays, calculateBookingPrice, generateBookingNumber } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Vehicle, RentalType } from '@/types'

export default function VehicleDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Booking form
  const [bookingForm, setBookingForm] = useState({
    pickup_date: searchParams.get('pickup_date') || '',
    return_date: searchParams.get('return_date') || '',
    pickup_time: '09:00',
    return_time: '18:00',
    rental_type: (searchParams.get('rental_type') as RentalType) || 'self_drive',
    pickup_location: '',
    return_location: '',
    special_requests: '',
    itinerary: '',
    addons: {
      gps: false,
      child_seat: false,
      insurance: false,
      extra_driver: false,
    },
  })

  const addonPrices = {
    gps: 100,
    child_seat: 50,
    insurance: 200,
    extra_driver: 500,
  }

  useEffect(() => {
    loadVehicle()
    checkUser()
  }, [params.id])

  const checkUser = async () => {
    const user = await getCurrentUser()
    setCurrentUser(user)
  }

  const loadVehicle = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          partner:partner_profiles(*, user:users(*))
        `)
        .eq('id', params.id)
        .single()

      if (error) throw error
      setVehicle(data)
    } catch (error) {
      console.error('Error loading vehicle:', error)
      toast.error('ไม่พบรถที่ต้องการ')
    } finally {
      setLoading(false)
    }
  }

  const calculateTotal = () => {
    if (!vehicle || !bookingForm.pickup_date || !bookingForm.return_date) {
      return null
    }

    const days = calculateDays(bookingForm.pickup_date, bookingForm.return_date)
    const dailyRate = bookingForm.rental_type === 'self_drive'
      ? vehicle.daily_rate_self_drive
      : vehicle.daily_rate_with_driver

    let addonsTotal = 0
    Object.keys(bookingForm.addons).forEach((addon) => {
      if (bookingForm.addons[addon as keyof typeof bookingForm.addons]) {
        addonsTotal += addonPrices[addon as keyof typeof addonPrices] * days
      }
    })

    return calculateBookingPrice(dailyRate, days, addonsTotal)
  }

  const handleBooking = async () => {
    // Validate
    if (!currentUser) {
      toast.error('กรุณาเข้าสู่ระบบก่อนจองรถ')
      router.push('/login')
      return
    }

    if (!bookingForm.pickup_date || !bookingForm.return_date) {
      toast.error('กรุณาเลือกวันที่รับและคืนรถ')
      return
    }

    if (!bookingForm.pickup_location) {
      toast.error('กรุณากรอกสถานที่รับรถ')
      return
    }

    try {
      const pricing = calculateTotal()
      if (!pricing) return

      const days = calculateDays(bookingForm.pickup_date, bookingForm.return_date)

      // Create booking
      const { data: booking, error } = await supabase
        .from('bookings')
        .insert({
          booking_number: generateBookingNumber(),
          customer_id: currentUser.id,
          vehicle_id: vehicle?.id,
          rental_type: bookingForm.rental_type,
          pickup_date: bookingForm.pickup_date,
          pickup_time: bookingForm.pickup_time,
          return_date: bookingForm.return_date,
          return_time: bookingForm.return_time,
          pickup_location: {
            address: bookingForm.pickup_location,
            lat: 0,
            lng: 0,
          },
          return_location: {
            address: bookingForm.return_location || bookingForm.pickup_location,
            lat: 0,
            lng: 0,
          },
          itinerary: bookingForm.itinerary,
          special_requests: bookingForm.special_requests,
          vehicle_type_requested: vehicle?.vehicle_type,
          total_days: days,
          base_price: pricing.basePrice,
          addons_price: pricing.addonsPrice,
          service_fee: pricing.serviceFee,
          total_price: pricing.totalPrice,
          deposit_amount: pricing.depositAmount,
          status: 'PENDING_ASSIGNMENT',
        })
        .select()
        .single()

      if (error) throw error

      // Create add-ons
      const addonsToInsert = []
      Object.keys(bookingForm.addons).forEach((addon) => {
        if (bookingForm.addons[addon as keyof typeof bookingForm.addons]) {
          addonsToInsert.push({
            booking_id: booking.id,
            addon_type: addon,
            addon_name: addon === 'gps' ? 'GPS' :
                       addon === 'child_seat' ? 'ที่นั่งเด็ก' :
                       addon === 'insurance' ? 'ประกันเพิ่มเติม' : 'คนขับเสริม',
            price_per_day: addonPrices[addon as keyof typeof addonPrices],
            quantity: 1,
            total_days: days,
            total_price: addonPrices[addon as keyof typeof addonPrices] * days,
          })
        }
      })

      if (addonsToInsert.length > 0) {
        await supabase.from('booking_addons').insert(addonsToInsert)
      }

      toast.success('จองสำเร็จ! กำลังไปยังหน้าชำระเงิน...')
      router.push(`/customer/bookings/${booking.id}/payment`)
    } catch (error: any) {
      console.error('Booking error:', error)
      toast.error('ไม่สามารถจองได้: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">ไม่พบรถที่ต้องการ</h2>
          <Link href="/search">
            <Button>กลับไปค้นหา</Button>
          </Link>
        </div>
      </div>
    )
  }

  const pricing = calculateTotal()
  const days = bookingForm.pickup_date && bookingForm.return_date
    ? calculateDays(bookingForm.pickup_date, bookingForm.return_date)
    : 1

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/search" className="flex items-center text-gray-600 hover:text-gray-900">
            <ChevronLeft className="h-5 w-5 mr-1" />
            กลับไปค้นหา
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Vehicle Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                  {vehicle.images && vehicle.images.length > 0 ? (
                    <img
                      src={vehicle.images[selectedImageIndex]}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car className="h-24 w-24 text-gray-400" />
                    </div>
                  )}
                </div>
                {vehicle.images && vehicle.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 p-4">
                    {vehicle.images.map((image, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`aspect-video bg-gray-200 rounded-lg overflow-hidden ${
                          idx === selectedImageIndex ? 'ring-2 ring-blue-600' : ''
                        }`}
                      >
                        <img src={image} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Vehicle Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl mb-2">
                      {vehicle.brand} {vehicle.model}
                    </CardTitle>
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      <span className="font-semibold mr-1">
                        {vehicle.partner?.rating_average || 0}
                      </span>
                      <span>({vehicle.partner?.total_reviews || 0} รีวิว)</span>
                    </div>
                  </div>
                  <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-semibold">
                    {vehicle.vehicle_type === 'sedan' ? 'รถเก๋ง' :
                     vehicle.vehicle_type === 'suv' ? 'SUV' :
                     vehicle.vehicle_type === 'van' ? 'รถตู้' :
                     vehicle.vehicle_type === 'pickup' ? 'กระบะ' : 'รถหรู'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {/* Specs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Users className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{vehicle.seats}</p>
                    <p className="text-sm text-gray-600">ที่นั่ง</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <SettingsIcon className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold">
                      {vehicle.transmission === 'auto' ? 'อัตโนมัติ' : 'ธรรมดา'}
                    </p>
                    <p className="text-sm text-gray-600">เกียร์</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Fuel className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold">
                      {vehicle.fuel_type === 'petrol' ? 'เบนซิน' :
                       vehicle.fuel_type === 'diesel' ? 'ดีเซล' :
                       vehicle.fuel_type === 'hybrid' ? 'ไฮบริด' : 'ไฟฟ้า'}
                    </p>
                    <p className="text-sm text-gray-600">เชื้อเพลิง</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Calendar className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{vehicle.year}</p>
                    <p className="text-sm text-gray-600">ปี</p>
                  </div>
                </div>

                {/* Description */}
                {vehicle.description && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">รายละเอียด</h3>
                    <p className="text-gray-700">{vehicle.description}</p>
                  </div>
                )}

                {/* Features */}
                {vehicle.features && vehicle.features.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">คุณสมบัติ</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {vehicle.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <Check className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Partner Info */}
            <Card>
              <CardHeader>
                <CardTitle>เกี่ยวกับผู้ให้บริการ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{vehicle.partner?.business_name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        {vehicle.partner?.rating_average || 0}
                      </span>
                      <span>{vehicle.partner?.total_jobs || 0} งาน</span>
                      <span>{vehicle.partner?.total_reviews || 0} รีวิว</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>จองรถ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Date & Time */}
                <div>
                  <label className="text-sm font-medium mb-2 block">วันที่รับรถ</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={bookingForm.pickup_date}
                      onChange={(e) => setBookingForm({ ...bookingForm, pickup_date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <Input
                      type="time"
                      value={bookingForm.pickup_time}
                      onChange={(e) => setBookingForm({ ...bookingForm, pickup_time: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">วันที่คืนรถ</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={bookingForm.return_date}
                      onChange={(e) => setBookingForm({ ...bookingForm, return_date: e.target.value })}
                      min={bookingForm.pickup_date || new Date().toISOString().split('T')[0]}
                    />
                    <Input
                      type="time"
                      value={bookingForm.return_time}
                      onChange={(e) => setBookingForm({ ...bookingForm, return_time: e.target.value })}
                    />
                  </div>
                </div>

                {/* Rental Type */}
                <div>
                  <label className="text-sm font-medium mb-2 block">ประเภทการเช่า</label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={bookingForm.rental_type}
                    onChange={(e) => setBookingForm({ ...bookingForm, rental_type: e.target.value as RentalType })}
                  >
                    <option value="self_drive">ขับเอง</option>
                    <option value="with_driver">พร้อมคนขับ</option>
                  </select>
                </div>

                {/* Pickup Location */}
                <div>
                  <label className="text-sm font-medium mb-2 block">สถานที่รับรถ *</label>
                  <Input
                    placeholder="ที่อยู่หรือจุดนัดหมาย"
                    value={bookingForm.pickup_location}
                    onChange={(e) => setBookingForm({ ...bookingForm, pickup_location: e.target.value })}
                  />
                </div>

                {/* Return Location */}
                <div>
                  <label className="text-sm font-medium mb-2 block">สถานที่คืนรถ</label>
                  <Input
                    placeholder="เว้นว่างหากคืนที่เดียวกับรับ"
                    value={bookingForm.return_location}
                    onChange={(e) => setBookingForm({ ...bookingForm, return_location: e.target.value })}
                  />
                </div>

                {/* Itinerary (for with_driver) */}
                {bookingForm.rental_type === 'with_driver' && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">โปรแกรมทัวร์</label>
                    <textarea
                      className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2"
                      placeholder="ระบุสถานที่ที่ต้องการไป..."
                      value={bookingForm.itinerary}
                      onChange={(e) => setBookingForm({ ...bookingForm, itinerary: e.target.value })}
                    />
                  </div>
                )}

                {/* Add-ons */}
                <div>
                  <label className="text-sm font-medium mb-2 block">บริการเสริม</label>
                  <div className="space-y-2">
                    {[
                      { key: 'gps', label: 'GPS', price: addonPrices.gps },
                      { key: 'child_seat', label: 'ที่นั่งเด็ก', price: addonPrices.child_seat },
                      { key: 'insurance', label: 'ประกันเพิ่มเติม', price: addonPrices.insurance },
                    ].map((addon) => (
                      <label key={addon.key} className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-gray-50">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={bookingForm.addons[addon.key as keyof typeof bookingForm.addons]}
                            onChange={(e) => setBookingForm({
                              ...bookingForm,
                              addons: { ...bookingForm.addons, [addon.key]: e.target.checked }
                            })}
                          />
                          <span className="text-sm">{addon.label}</span>
                        </div>
                        <span className="text-sm text-gray-600">+{formatCurrency(addon.price)}/วัน</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Special Requests */}
                <div>
                  <label className="text-sm font-medium mb-2 block">ความต้องการพิเศษ</label>
                  <textarea
                    className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2"
                    placeholder="ระบุความต้องการเพิ่มเติม..."
                    value={bookingForm.special_requests}
                    onChange={(e) => setBookingForm({ ...bookingForm, special_requests: e.target.value })}
                  />
                </div>

                {/* Price Summary */}
                {pricing && (
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>ค่าเช่า ({days} วัน)</span>
                      <span>{formatCurrency(pricing.basePrice)}</span>
                    </div>
                    {pricing.addonsPrice > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>บริการเสริม</span>
                        <span>{formatCurrency(pricing.addonsPrice)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>ค่าบริการ (10%)</span>
                      <span>{formatCurrency(pricing.serviceFee)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>รวมทั้งสิ้น</span>
                      <span className="text-blue-600">{formatCurrency(pricing.totalPrice)}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>เงินมัดจำ 30%: {formatCurrency(pricing.depositAmount)}</p>
                      <p>ชำระเมื่อรับรถ: {formatCurrency(pricing.remainingAmount)}</p>
                    </div>
                  </div>
                )}

                <Button className="w-full" size="lg" onClick={handleBooking}>
                  จองเลย
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
