'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Car, Users, Fuel, Settings as SettingsIcon, Star, MapPin } from 'lucide-react'
import { formatCurrency, getVehicleTypeLabel, calculateDays } from '@/lib/utils'
import type { Vehicle, RentalType, VehicleType } from '@/types'

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  // Search filters
  const [filters, setFilters] = useState({
    pickup_date: searchParams.get('pickup_date') || '',
    return_date: searchParams.get('return_date') || '',
    rental_type: (searchParams.get('rental_type') as RentalType) || 'self_drive',
    vehicle_type: searchParams.get('vehicle_type') || 'all',
    min_price: '',
    max_price: '',
    seats: '',
    brand: '',
  })

  useEffect(() => {
    loadVehicles()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [vehicles, filters])

  const loadVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          partner:partner_profiles(*, user:users(*))
        `)
        .eq('available', true)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) throw error
      setVehicles(data || [])
    } catch (error) {
      console.error('Error loading vehicles:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...vehicles]

    // Filter by vehicle type
    if (filters.vehicle_type !== 'all') {
      filtered = filtered.filter(v => v.vehicle_type === filters.vehicle_type)
    }

    // Filter by price
    if (filters.min_price) {
      const minPrice = parseFloat(filters.min_price)
      filtered = filtered.filter(v => {
        const price = filters.rental_type === 'self_drive'
          ? v.daily_rate_self_drive
          : v.daily_rate_with_driver
        return price >= minPrice
      })
    }

    if (filters.max_price) {
      const maxPrice = parseFloat(filters.max_price)
      filtered = filtered.filter(v => {
        const price = filters.rental_type === 'self_drive'
          ? v.daily_rate_self_drive
          : v.daily_rate_with_driver
        return price <= maxPrice
      })
    }

    // Filter by seats
    if (filters.seats) {
      const seats = parseInt(filters.seats)
      filtered = filtered.filter(v => v.seats >= seats)
    }

    // Filter by brand
    if (filters.brand) {
      filtered = filtered.filter(v =>
        v.brand.toLowerCase().includes(filters.brand.toLowerCase())
      )
    }

    setFilteredVehicles(filtered)
  }

  const calculateTotalDays = () => {
    if (!filters.pickup_date || !filters.return_date) return 1
    return calculateDays(filters.pickup_date, filters.return_date)
  }

  const getPrice = (vehicle: Vehicle) => {
    const days = calculateTotalDays()
    const dailyRate = filters.rental_type === 'self_drive'
      ? vehicle.daily_rate_self_drive
      : vehicle.daily_rate_with_driver
    return dailyRate * days
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
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold">CarRental</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outline">เข้าสู่ระบบ</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold mb-6">ตัวกรอง</h2>

                {/* Search Form */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">วันที่รับรถ</label>
                    <Input
                      type="date"
                      value={filters.pickup_date}
                      onChange={(e) => setFilters({ ...filters, pickup_date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">วันที่คืนรถ</label>
                    <Input
                      type="date"
                      value={filters.return_date}
                      onChange={(e) => setFilters({ ...filters, return_date: e.target.value })}
                      min={filters.pickup_date || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">ประเภทการเช่า</label>
                    <select
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                      value={filters.rental_type}
                      onChange={(e) => setFilters({ ...filters, rental_type: e.target.value as RentalType })}
                    >
                      <option value="self_drive">ขับเอง</option>
                      <option value="with_driver">พร้อมคนขับ</option>
                    </select>
                  </div>
                </div>

                {/* Vehicle Type */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">ประเภทรถ</h3>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'ทั้งหมด' },
                      { value: 'sedan', label: 'รถเก๋ง' },
                      { value: 'suv', label: 'SUV' },
                      { value: 'van', label: 'รถตู้' },
                      { value: 'pickup', label: 'กระบะ' },
                      { value: 'luxury', label: 'รถหรู' },
                    ].map((type) => (
                      <label key={type.value} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="vehicle_type"
                          value={type.value}
                          checked={filters.vehicle_type === type.value}
                          onChange={(e) => setFilters({ ...filters, vehicle_type: e.target.value })}
                          className="text-blue-600"
                        />
                        <span className="text-sm">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">ช่วงราคา (บาท/วัน)</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="ต่ำสุด"
                      value={filters.min_price}
                      onChange={(e) => setFilters({ ...filters, min_price: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="สูงสุด"
                      value={filters.max_price}
                      onChange={(e) => setFilters({ ...filters, max_price: e.target.value })}
                    />
                  </div>
                </div>

                {/* Seats */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">จำนวนที่นั่ง</h3>
                  <Input
                    type="number"
                    placeholder="จำนวนที่นั่งขั้นต่ำ"
                    value={filters.seats}
                    onChange={(e) => setFilters({ ...filters, seats: e.target.value })}
                  />
                </div>

                {/* Brand */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">ยี่ห้อรถ</h3>
                  <Input
                    type="text"
                    placeholder="ค้นหายี่ห้อ..."
                    value={filters.brand}
                    onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={() => setFilters({
                    ...filters,
                    vehicle_type: 'all',
                    min_price: '',
                    max_price: '',
                    seats: '',
                    brand: '',
                  })}
                  variant="outline"
                >
                  ล้างตัวกรอง
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">รถเช่าที่พร้อมให้บริการ</h1>
              <p className="text-gray-600">
                พบ {filteredVehicles.length} รถที่ตรงตามเงื่อนไข
                {filters.pickup_date && filters.return_date && (
                  <span> • {calculateTotalDays()} วัน</span>
                )}
              </p>
            </div>

            {filteredVehicles.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">ไม่พบรถที่ตรงตามเงื่อนไข</h3>
                    <p className="text-gray-600 mb-4">ลองปรับเงื่อนไขการค้นหาใหม่</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredVehicles.map((vehicle) => (
                  <Card key={vehicle.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Image */}
                        <div className="md:col-span-1">
                          <div className="h-64 md:h-full bg-gray-200 rounded-l-lg overflow-hidden">
                            {vehicle.images?.[0] ? (
                              <img
                                src={vehicle.images[0]}
                                alt={`${vehicle.brand} ${vehicle.model}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Car className="h-16 w-16 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Details */}
                        <div className="md:col-span-2 p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-2xl font-bold">
                                  {vehicle.brand} {vehicle.model}
                                </h3>
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                  {getVehicleTypeLabel(vehicle.vehicle_type, 'th')}
                                </span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600 mb-2">
                                <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                                <span className="font-semibold mr-1">
                                  {vehicle.partner?.rating_average || 0}
                                </span>
                                <span>({vehicle.partner?.total_reviews || 0} รีวิว)</span>
                                <span className="mx-2">•</span>
                                <span>{vehicle.partner?.user?.first_name}</span>
                              </div>
                            </div>
                          </div>

                          {/* Specs */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center space-x-2 text-sm">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span>{vehicle.seats} ที่นั่ง</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <SettingsIcon className="h-4 w-4 text-gray-400" />
                              <span>{vehicle.transmission === 'auto' ? 'อัตโนมัติ' : 'ธรรมดา'}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <Fuel className="h-4 w-4 text-gray-400" />
                              <span>
                                {vehicle.fuel_type === 'petrol' ? 'เบนซิน' :
                                 vehicle.fuel_type === 'diesel' ? 'ดีเซล' :
                                 vehicle.fuel_type === 'hybrid' ? 'ไฮบริด' : 'ไฟฟ้า'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span>{vehicle.year}</span>
                            </div>
                          </div>

                          {/* Features */}
                          {vehicle.features && vehicle.features.length > 0 && (
                            <div className="mb-4">
                              <div className="flex flex-wrap gap-2">
                                {vehicle.features.slice(0, 5).map((feature, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                                  >
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Price & Action */}
                          <div className="flex items-end justify-between pt-4 border-t">
                            <div>
                              <p className="text-sm text-gray-600 mb-1">
                                {filters.rental_type === 'self_drive' ? 'ขับเอง' : 'พร้อมคนขับ'}
                              </p>
                              <div className="flex items-baseline space-x-2">
                                <p className="text-3xl font-bold text-blue-600">
                                  {formatCurrency(
                                    filters.rental_type === 'self_drive'
                                      ? vehicle.daily_rate_self_drive
                                      : vehicle.daily_rate_with_driver
                                  )}
                                </p>
                                <span className="text-gray-600">/วัน</span>
                              </div>
                              {filters.pickup_date && filters.return_date && (
                                <p className="text-sm text-gray-600 mt-1">
                                  รวม {formatCurrency(getPrice(vehicle))} ({calculateTotalDays()} วัน)
                                </p>
                              )}
                            </div>
                            <Link
                              href={`/vehicles/${vehicle.id}?pickup_date=${filters.pickup_date}&return_date=${filters.return_date}&rental_type=${filters.rental_type}`}
                            >
                              <Button size="lg">ดูรายละเอียด</Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
