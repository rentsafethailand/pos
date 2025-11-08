'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, getCurrentUser } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  CheckCircle, QrCode, CreditCard, Smartphone, Building2,
  Upload, Clock, AlertCircle, ChevronLeft
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Booking, PaymentMethod } from '@/types'

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('qr_code')
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const [paymentProofUrl, setPaymentProofUrl] = useState('')
  const [processing, setProcessing] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState('')

  // System settings (should be loaded from database)
  const [systemSettings, setSystemSettings] = useState({
    promptpay_number: '0812345678', // Default, will be loaded from database
    bank_account_number: '123-4-56789-0',
    bank_name: 'ธนาคารกสิกรไทย',
    account_name: 'CarRental Platform',
  })

  useEffect(() => {
    loadBooking()
    loadSystemSettings()
  }, [params.id])

  useEffect(() => {
    if (booking && paymentMethod === 'qr_code') {
      generateQRCode()
    }
  }, [booking, paymentMethod])

  const loadSystemSettings = async () => {
    try {
      const { data } = await supabase
        .from('system_settings')
        .select('*')
        .in('setting_key', ['promptpay_number', 'bank_account', 'bank_name'])

      if (data) {
        const settings: any = {}
        data.forEach(setting => {
          if (setting.setting_key === 'promptpay_number') {
            settings.promptpay_number = setting.setting_value
          } else if (setting.setting_key === 'bank_account') {
            const bankData = setting.setting_value
            settings.bank_account_number = bankData.account_number
            settings.bank_name = bankData.bank_name
            settings.account_name = bankData.account_name
          }
        })
        setSystemSettings({ ...systemSettings, ...settings })
      }
    } catch (error) {
      console.error('Error loading system settings:', error)
    }
  }

  const loadBooking = async () => {
    try {
      const user = await getCurrentUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          vehicle:vehicles(*),
          partner:partner_profiles(*, user:users(*)),
          addons:booking_addons(*)
        `)
        .eq('id', params.id)
        .eq('customer_id', user.id)
        .single()

      if (error) throw error
      setBooking(data)
    } catch (error) {
      console.error('Error loading booking:', error)
      toast.error('ไม่พบข้อมูลการจอง')
      router.push('/customer/bookings')
    } finally {
      setLoading(false)
    }
  }

  const generateQRCode = async () => {
    if (!booking) return

    // Generate PromptPay QR Code using promptpay.io
    const amount = booking.deposit_paid ? booking.total_price - booking.deposit_amount : booking.deposit_amount

    // PromptPay format: remove dashes and spaces from phone number
    const promptPayId = systemSettings.promptpay_number.replace(/[-\s]/g, '')

    // Using promptpay.io API
    const qrUrl = `https://promptpay.io/${promptPayId}/${amount.toFixed(2)}.png`
    setQrCodeUrl(qrUrl)
  }

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('กรุณาอัพโหลดไฟล์รูปภาพ')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('ไฟล์ใหญ่เกิน 5MB')
      return
    }

    setPaymentProof(file)

    // Preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPaymentProofUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handlePayment = async () => {
    if (!booking) return

    // Validate payment proof for bank transfer
    if (paymentMethod === 'bank_transfer' && !paymentProof) {
      toast.error('กรุณาอัพโหลดหลักฐานการโอนเงิน')
      return
    }

    if (paymentMethod === 'qr_code' && !paymentProof) {
      toast.error('กรุณาอัพโหลดหลักฐานการชำระเงิน')
      return
    }

    setProcessing(true)

    try {
      let uploadedUrl = ''

      // Upload payment proof if exists
      if (paymentProof) {
        const fileName = `${booking.id}-${Date.now()}.${paymentProof.name.split('.').pop()}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(`payments/${fileName}`, paymentProof)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(`payments/${fileName}`)

        uploadedUrl = publicUrl
      }

      // Determine payment type
      const paymentType = booking.deposit_paid ? 'full_payment' : 'deposit'
      const amount = booking.deposit_paid
        ? booking.total_price - booking.deposit_amount
        : booking.deposit_amount

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          booking_id: booking.id,
          user_id: booking.customer_id,
          payment_type: paymentType,
          amount: amount,
          payment_method: paymentMethod,
          payment_status: 'pending', // Will be approved by admin
          payment_proof_url: uploadedUrl,
        })

      if (paymentError) throw paymentError

      // Update booking status
      const updateData: any = {}
      if (!booking.deposit_paid) {
        updateData.deposit_paid = true
        updateData.deposit_paid_at = new Date().toISOString()
      } else {
        updateData.full_payment_paid = true
        updateData.full_payment_paid_at = new Date().toISOString()
        updateData.status = 'COMPLETED'
      }

      await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', booking.id)

      // Create notification for admin
      const adminUsers = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin')

      if (adminUsers.data && adminUsers.data.length > 0) {
        const notifications = adminUsers.data.map(admin => ({
          user_id: admin.id,
          type: 'payment',
          title: 'มีการชำระเงินใหม่',
          message: `การจอง ${booking.booking_number} ได้รับการชำระเงิน${paymentType === 'deposit' ? 'มัดจำ' : 'ส่วนที่เหลือ'}แล้ว`,
          link_url: `/admin/payments`,
        }))

        await supabase.from('notifications').insert(notifications)
      }

      toast.success('ส่งหลักฐานการชำระเงินสำเร็จ!')
      router.push(`/customer/bookings/${booking.id}`)
    } catch (error: any) {
      console.error('Payment error:', error)
      toast.error('ไม่สามารถบันทึกการชำระเงินได้: ' + error.message)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>ไม่พบข้อมูลการจอง</p>
          <Link href="/customer/bookings">
            <Button className="mt-4">กลับไปดูการจอง</Button>
          </Link>
        </div>
      </div>
    )
  }

  const amountToPay = booking.deposit_paid
    ? booking.total_price - booking.deposit_amount
    : booking.deposit_amount

  const paymentTypeName = booking.deposit_paid ? 'ชำระส่วนที่เหลือ' : 'ชำระเงินมัดจำ'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href={`/customer/bookings/${booking.id}`} className="flex items-center text-gray-600 hover:text-gray-900">
            <ChevronLeft className="h-5 w-5 mr-1" />
            กลับไปดูการจอง
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">ชำระเงิน</h1>
          <p className="text-gray-600">การจอง: {booking.booking_number}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Payment Methods */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle>เลือกวิธีชำระเงิน</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button
                  onClick={() => setPaymentMethod('qr_code')}
                  className={`w-full p-4 border-2 rounded-lg flex items-center space-x-4 transition-all ${
                    paymentMethod === 'qr_code' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    paymentMethod === 'qr_code' ? 'bg-blue-600' : 'bg-gray-200'
                  }`}>
                    <QrCode className={`h-6 w-6 ${paymentMethod === 'qr_code' ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold">QR PromptPay</p>
                    <p className="text-sm text-gray-600">สแกน QR Code เพื่อชำระเงิน</p>
                  </div>
                  {paymentMethod === 'qr_code' && (
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  )}
                </button>

                <button
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`w-full p-4 border-2 rounded-lg flex items-center space-x-4 transition-all ${
                    paymentMethod === 'bank_transfer' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    paymentMethod === 'bank_transfer' ? 'bg-blue-600' : 'bg-gray-200'
                  }`}>
                    <Building2 className={`h-6 w-6 ${paymentMethod === 'bank_transfer' ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold">โอนเงินผ่านธนาคาร</p>
                    <p className="text-sm text-gray-600">โอนเงินเข้าบัญชีธนาคาร</p>
                  </div>
                  {paymentMethod === 'bank_transfer' && (
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  )}
                </button>

                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`w-full p-4 border-2 rounded-lg flex items-center space-x-4 transition-all ${
                    paymentMethod === 'cash' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    paymentMethod === 'cash' ? 'bg-blue-600' : 'bg-gray-200'
                  }`}>
                    <Smartphone className={`h-6 w-6 ${paymentMethod === 'cash' ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold">เงินสด</p>
                    <p className="text-sm text-gray-600">ชำระเมื่อรับรถ</p>
                  </div>
                  {paymentMethod === 'cash' && (
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  )}
                </button>
              </CardContent>
            </Card>

            {/* Payment Details */}
            {paymentMethod === 'qr_code' && (
              <Card>
                <CardHeader>
                  <CardTitle>สแกน QR Code</CardTitle>
                  <CardDescription>สแกนด้วยแอพธนาคารหรือแอพ Mobile Banking</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    {qrCodeUrl ? (
                      <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                        <img src={qrCodeUrl} alt="PromptPay QR Code" className="w-64 h-64 mx-auto" />
                      </div>
                    ) : (
                      <div className="w-64 h-64 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium">ยอดชำระ</p>
                      <p className="text-2xl font-bold text-blue-600">{formatCurrency(amountToPay)}</p>
                      <p className="text-sm text-gray-600 mt-2">พร้อมเพย์: {systemSettings.promptpay_number}</p>
                    </div>

                    {/* Upload Payment Proof */}
                    <div className="border-t pt-4">
                      <p className="font-medium mb-2">อัพโหลดหลักฐานการชำระเงิน</p>
                      <div className="space-y-2">
                        {paymentProofUrl ? (
                          <div className="relative">
                            <img src={paymentProofUrl} alt="Payment Proof" className="w-full rounded-lg" />
                            <button
                              onClick={() => {
                                setPaymentProof(null)
                                setPaymentProofUrl('')
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600">คลิกเพื่ออัพโหลดสลิป</p>
                            <p className="text-xs text-gray-400">รองรับไฟล์ภาพ (สูงสุด 5MB)</p>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {paymentMethod === 'bank_transfer' && (
              <Card>
                <CardHeader>
                  <CardTitle>ข้อมูลบัญชีธนาคาร</CardTitle>
                  <CardDescription>โอนเงินเข้าบัญชีนี้</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ธนาคาร:</span>
                      <span className="font-semibold">{systemSettings.bank_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">เลขที่บัญชี:</span>
                      <span className="font-semibold font-mono">{systemSettings.bank_account_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ชื่อบัญชี:</span>
                      <span className="font-semibold">{systemSettings.account_name}</span>
                    </div>
                    <div className="flex justify-between border-t pt-3">
                      <span className="text-gray-600">ยอดที่ต้องโอน:</span>
                      <span className="font-bold text-xl text-blue-600">{formatCurrency(amountToPay)}</span>
                    </div>
                  </div>

                  {/* Upload Payment Proof */}
                  <div>
                    <p className="font-medium mb-2">อัพโหลดหลักฐานการโอนเงิน *</p>
                    {paymentProofUrl ? (
                      <div className="relative">
                        <img src={paymentProofUrl} alt="Payment Proof" className="w-full rounded-lg" />
                        <button
                          onClick={() => {
                            setPaymentProof(null)
                            setPaymentProofUrl('')
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">คลิกเพื่ออัพโหลดสลิป</p>
                        <p className="text-xs text-gray-400">รองรับไฟล์ภาพ (สูงสุด 5MB)</p>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                        />
                      </label>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {paymentMethod === 'cash' && (
              <Card>
                <CardHeader>
                  <CardTitle>ชำระเงินสด</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-lg font-semibold mb-2">ชำระเมื่อรับรถ</p>
                    <p className="text-gray-600 mb-4">
                      คุณสามารถชำระเงินสดได้เมื่อรับรถ
                    </p>
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg inline-block">
                      <p className="text-sm text-yellow-800">
                        <AlertCircle className="h-4 w-4 inline mr-1" />
                        กรุณาเตรียมเงินสดจำนวน {formatCurrency(amountToPay)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>สรุปการชำระเงิน</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">เลขที่จอง</span>
                    <span className="font-semibold">{booking.booking_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">รถ</span>
                    <span className="font-semibold">
                      {booking.vehicle?.brand} {booking.vehicle?.model}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">วันรับรถ</span>
                    <span>{formatDate(booking.pickup_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">วันคืนรถ</span>
                    <span>{formatDate(booking.return_date)}</span>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>ยอดรวมทั้งหมด</span>
                    <span className="font-semibold">{formatCurrency(booking.total_price)}</span>
                  </div>
                  {!booking.deposit_paid && (
                    <div className="flex justify-between text-blue-600">
                      <span>เงินมัดจำ (30%)</span>
                      <span className="font-semibold">{formatCurrency(booking.deposit_amount)}</span>
                    </div>
                  )}
                  {booking.deposit_paid && (
                    <div className="flex justify-between text-green-600">
                      <span>✓ ชำระมัดจำแล้ว</span>
                      <span className="font-semibold">{formatCurrency(booking.deposit_amount)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold">{paymentTypeName}</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatCurrency(amountToPay)}
                    </span>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handlePayment}
                    disabled={processing || (paymentMethod !== 'cash' && !paymentProof)}
                  >
                    {processing ? (
                      <>
                        <Clock className="h-5 w-5 mr-2 animate-spin" />
                        กำลังดำเนินการ...
                      </>
                    ) : (
                      'ยืนยันการชำระเงิน'
                    )}
                  </Button>

                  {paymentMethod !== 'cash' && (
                    <p className="text-xs text-center text-gray-500 mt-2">
                      การชำระเงินจะได้รับการตรวจสอบภายใน 1-2 ชั่วโมง
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
