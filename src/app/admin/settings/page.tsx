'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getCurrentUser } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Building2, Smartphone, Save, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    // Site Settings
    site_name: 'Car Rental Platform',
    deposit_percentage: 30,
    service_fee_percentage: 10,
    default_commission_rate: 15,

    // Payment Settings
    promptpay_number: '',
    bank_name: '',
    bank_account_number: '',
    account_name: '',

    // Contact Settings
    contact_email: '',
    contact_phone: '',
    contact_line: '',
  })

  useEffect(() => {
    checkAdmin()
    loadSettings()
  }, [])

  const checkAdmin = async () => {
    const user = await getCurrentUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (data?.role !== 'admin') {
      toast.error('คุณไม่มีสิทธิ์เข้าถึงหน้านี้')
      router.push('/')
    }
  }

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')

      if (error) throw error

      if (data) {
        const settingsObj: any = { ...settings }
        data.forEach(setting => {
          const key = setting.setting_key
          const value = setting.setting_value

          if (key === 'site_name') {
            settingsObj.site_name = value
          } else if (key === 'deposit_percentage') {
            settingsObj.deposit_percentage = parseInt(value)
          } else if (key === 'service_fee_percentage') {
            settingsObj.service_fee_percentage = parseInt(value)
          } else if (key === 'default_commission_rate') {
            settingsObj.default_commission_rate = parseInt(value)
          } else if (key === 'promptpay_number') {
            settingsObj.promptpay_number = value
          } else if (key === 'bank_account') {
            settingsObj.bank_name = value.bank_name || ''
            settingsObj.bank_account_number = value.account_number || ''
            settingsObj.account_name = value.account_name || ''
          } else if (key === 'contact_info') {
            settingsObj.contact_email = value.email || ''
            settingsObj.contact_phone = value.phone || ''
            settingsObj.contact_line = value.line || ''
          }
        })

        setSettings(settingsObj)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('ไม่สามารถโหลดการตั้งค่าได้')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)

    try {
      const user = await getCurrentUser()
      if (!user) throw new Error('Not authenticated')

      // Prepare settings to update
      const settingsToUpdate = [
        {
          setting_key: 'site_name',
          setting_value: settings.site_name,
          description: 'ชื่อเว็บไซต์',
          updated_by: user.id,
        },
        {
          setting_key: 'deposit_percentage',
          setting_value: settings.deposit_percentage.toString(),
          description: 'เปอร์เซ็นต์เงินมัดจำ',
          updated_by: user.id,
        },
        {
          setting_key: 'service_fee_percentage',
          setting_value: settings.service_fee_percentage.toString(),
          description: 'เปอร์เซ็นต์ค่าบริการระบบ',
          updated_by: user.id,
        },
        {
          setting_key: 'default_commission_rate',
          setting_value: settings.default_commission_rate.toString(),
          description: 'เปอร์เซ็นต์ค่าคอมมิชชั่น Partner',
          updated_by: user.id,
        },
        {
          setting_key: 'promptpay_number',
          setting_value: settings.promptpay_number,
          description: 'เลขพร้อมเพย์',
          updated_by: user.id,
        },
        {
          setting_key: 'bank_account',
          setting_value: JSON.stringify({
            bank_name: settings.bank_name,
            account_number: settings.bank_account_number,
            account_name: settings.account_name,
          }),
          description: 'ข้อมูลบัญชีธนาคาร',
          updated_by: user.id,
        },
        {
          setting_key: 'contact_info',
          setting_value: JSON.stringify({
            email: settings.contact_email,
            phone: settings.contact_phone,
            line: settings.contact_line,
          }),
          description: 'ข้อมูลติดต่อ',
          updated_by: user.id,
        },
      ]

      // Update each setting
      for (const setting of settingsToUpdate) {
        // Check if setting exists
        const { data: existing } = await supabase
          .from('system_settings')
          .select('id')
          .eq('setting_key', setting.setting_key)
          .single()

        if (existing) {
          // Update
          await supabase
            .from('system_settings')
            .update({
              setting_value: setting.setting_value,
              updated_by: setting.updated_by,
              updated_at: new Date().toISOString(),
            })
            .eq('setting_key', setting.setting_key)
        } else {
          // Insert
          await supabase
            .from('system_settings')
            .insert(setting)
        }
      }

      toast.success('บันทึกการตั้งค่าสำเร็จ!')
    } catch (error: any) {
      console.error('Error saving settings:', error)
      toast.error('ไม่สามารถบันทึกการตั้งค่าได้: ' + error.message)
    } finally {
      setSaving(false)
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
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">ตั้งค่าระบบ</h1>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle>ตั้งค่าทั่วไป</CardTitle>
              <CardDescription>ตั้งค่าพื้นฐานของระบบ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">ชื่อเว็บไซต์</label>
                <Input
                  value={settings.site_name}
                  onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                  placeholder="Car Rental Platform"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">เงินมัดจำ (%)</label>
                  <Input
                    type="number"
                    value={settings.deposit_percentage}
                    onChange={(e) => setSettings({ ...settings, deposit_percentage: parseInt(e.target.value) })}
                    min="0"
                    max="100"
                  />
                  <p className="text-xs text-gray-500 mt-1">เปอร์เซ็นต์เงินมัดจำที่ลูกค้าต้องจ่ายก่อน</p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">ค่าบริการระบบ (%)</label>
                  <Input
                    type="number"
                    value={settings.service_fee_percentage}
                    onChange={(e) => setSettings({ ...settings, service_fee_percentage: parseInt(e.target.value) })}
                    min="0"
                    max="100"
                  />
                  <p className="text-xs text-gray-500 mt-1">ค่าบริการที่เรียกเก็บจากลูกค้า</p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">ค่าคอมมิชชั่น (%)</label>
                  <Input
                    type="number"
                    value={settings.default_commission_rate}
                    onChange={(e) => setSettings({ ...settings, default_commission_rate: parseInt(e.target.value) })}
                    min="0"
                    max="100"
                  />
                  <p className="text-xs text-gray-500 mt-1">ค่าคอมมิชชั่นที่หักจาก Partner</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PromptPay Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5 text-blue-600" />
                <CardTitle>ตั้งค่า PromptPay</CardTitle>
              </div>
              <CardDescription>ตั้งค่าเลขพร้อมเพย์สำหรับรับชำระเงิน</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  เลขพร้อมเพย์ (เบอร์โทรศัพท์ หรือ เลขบัตรประชาชน)
                </label>
                <Input
                  value={settings.promptpay_number}
                  onChange={(e) => setSettings({ ...settings, promptpay_number: e.target.value })}
                  placeholder="0812345678 หรือ 1234567890123"
                  maxLength={13}
                />
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 flex items-start">
                    <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      เลขพร้อมเพย์นี้จะถูกใช้สร้าง QR Code สำหรับรับชำระเงินจากลูกค้า
                      กรุณาตรวจสอบให้แน่ใจว่าถูกต้อง
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank Account Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-green-600" />
                <CardTitle>ตั้งค่าบัญชีธนาคาร</CardTitle>
              </div>
              <CardDescription>ตั้งค่าบัญชีธนาคารสำหรับรับโอนเงิน</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">ธนาคาร</label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                  value={settings.bank_name}
                  onChange={(e) => setSettings({ ...settings, bank_name: e.target.value })}
                >
                  <option value="">เลือกธนาคาร</option>
                  <option value="ธนาคารกรุงเทพ">ธนาคารกรุงเทพ</option>
                  <option value="ธนาคารกสิกรไทย">ธนาคารกสิกรไทย</option>
                  <option value="ธนาคารกรุงไทย">ธนาคารกรุงไทย</option>
                  <option value="ธนาคารทหารไทยธนชาต">ธนาคารทหารไทยธนชาต</option>
                  <option value="ธนาคารไทยพาณิชย์">ธนาคารไทยพาณิชย์</option>
                  <option value="ธนาคารกรุงศรีอยุธยา">ธนาคารกรุงศรีอยุธยา</option>
                  <option value="ธนาคารเกียรตินาคินภัทร">ธนาคารเกียรตินาคินภัทร</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">เลขที่บัญชี</label>
                <Input
                  value={settings.bank_account_number}
                  onChange={(e) => setSettings({ ...settings, bank_account_number: e.target.value })}
                  placeholder="123-4-56789-0"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">ชื่อบัญชี</label>
                <Input
                  value={settings.account_name}
                  onChange={(e) => setSettings({ ...settings, account_name: e.target.value })}
                  placeholder="นาย/นาง... หรือ บริษัท..."
                />
              </div>

              {settings.bank_name && settings.bank_account_number && settings.account_name && (
                <div className="mt-4 p-4 bg-gray-50 border rounded-lg">
                  <p className="text-sm font-medium mb-2">ตัวอย่างที่แสดงให้ลูกค้าเห็น:</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ธนาคาร:</span>
                      <span className="font-semibold">{settings.bank_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">เลขที่บัญชี:</span>
                      <span className="font-semibold font-mono">{settings.bank_account_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ชื่อบัญชี:</span>
                      <span className="font-semibold">{settings.account_name}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Settings */}
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลติดต่อ</CardTitle>
              <CardDescription>ข้อมูลติดต่อที่จะแสดงบนเว็บไซต์</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">อีเมล</label>
                <Input
                  type="email"
                  value={settings.contact_email}
                  onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                  placeholder="info@carrental.com"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">เบอร์โทรศัพท์</label>
                <Input
                  value={settings.contact_phone}
                  onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                  placeholder="02-xxx-xxxx"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Line ID</label>
                <Input
                  value={settings.contact_line}
                  onChange={(e) => setSettings({ ...settings, contact_line: e.target.value })}
                  placeholder="@carrental"
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => router.push('/admin/dashboard')}>
              ยกเลิก
            </Button>
            <Button onClick={handleSave} disabled={saving} size="lg">
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  บันทึกการตั้งค่า
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
