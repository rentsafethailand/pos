export type UserRole = 'customer' | 'partner' | 'admin'

export type BookingStatus =
  | 'PENDING_ASSIGNMENT'
  | 'PENDING_PARTNER_CONFIRMATION'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'PICKED_UP'
  | 'RETURNED'
  | 'COMPLETED'
  | 'CANCELLED'

export type RentalType = 'self_drive' | 'with_driver'

export type VehicleType = 'sedan' | 'suv' | 'van' | 'pickup' | 'luxury'

export type PaymentMethod = 'credit_card' | 'qr_code' | 'bank_transfer' | 'cash'

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded'

export type NotificationType = 'booking' | 'payment' | 'review' | 'system' | 'message'

export interface User {
  id: string
  email: string
  role: UserRole
  first_name: string
  last_name: string
  phone: string
  avatar_url?: string
  email_verified: boolean
  status: 'active' | 'suspended' | 'pending'
  created_at: string
  updated_at: string
}

export interface CustomerProfile {
  id: string
  user_id: string
  date_of_birth?: string
  id_card_number?: string
  address?: string
  preferred_language: 'th' | 'en'
  total_bookings: number
  user?: User
}

export interface PartnerProfile {
  id: string
  user_id: string
  business_name: string
  business_license?: string
  tax_id?: string
  bank_account_name?: string
  bank_account_number?: string
  bank_name?: string
  rating_average: number
  total_jobs: number
  total_reviews: number
  approval_status: 'pending' | 'approved' | 'rejected'
  approval_date?: string
  approved_by?: string
  commission_rate: number
  user?: User
}

export interface Vehicle {
  id: string
  partner_id: string
  brand: string
  model: string
  year: number
  license_plate: string
  vehicle_type: VehicleType
  seats: number
  transmission: 'auto' | 'manual'
  fuel_type: 'petrol' | 'diesel' | 'hybrid' | 'electric'
  color: string
  daily_rate_self_drive: number
  daily_rate_with_driver: number
  description?: string
  features: string[]
  images: string[]
  available: boolean
  status: 'active' | 'inactive' | 'maintenance'
  created_at: string
  updated_at: string
  partner?: PartnerProfile
}

export interface Booking {
  id: string
  booking_number: string
  customer_id: string
  partner_id?: string
  vehicle_id?: string
  assigned_by?: string
  rental_type: RentalType
  pickup_date: string
  pickup_time: string
  return_date: string
  return_time: string
  pickup_location: {
    address: string
    lat: number
    lng: number
  }
  return_location: {
    address: string
    lat: number
    lng: number
  }
  itinerary?: string
  special_requests?: string
  vehicle_type_requested: VehicleType
  total_days: number
  base_price: number
  addons_price: number
  service_fee: number
  total_price: number
  deposit_amount: number
  deposit_paid: boolean
  deposit_paid_at?: string
  full_payment_paid: boolean
  full_payment_paid_at?: string
  status: BookingStatus
  partner_response?: 'accepted' | 'rejected' | 'pending'
  partner_response_at?: string
  partner_reject_reason?: string
  cancellation_reason?: string
  cancelled_by?: 'customer' | 'admin' | 'system'
  cancelled_at?: string
  created_at: string
  updated_at: string
  customer?: User
  partner?: PartnerProfile
  vehicle?: Vehicle
  addons?: BookingAddon[]
}

export interface BookingAddon {
  id: string
  booking_id: string
  addon_type: 'gps' | 'child_seat' | 'insurance' | 'extra_driver'
  addon_name: string
  price_per_day: number
  quantity: number
  total_days: number
  total_price: number
}

export interface Payment {
  id: string
  booking_id: string
  user_id: string
  payment_type: 'deposit' | 'full_payment' | 'refund'
  amount: number
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  transaction_id?: string
  payment_proof_url?: string
  paid_at?: string
  created_at: string
  booking?: Booking
}

export interface PartnerPayout {
  id: string
  partner_id: string
  booking_id: string
  amount: number
  commission_amount: number
  net_amount: number
  payout_status: 'pending' | 'processing' | 'paid' | 'failed'
  paid_at?: string
  payment_slip_url?: string
  created_at: string
  partner?: PartnerProfile
  booking?: Booking
}

export interface Review {
  id: string
  booking_id: string
  customer_id: string
  partner_id: string
  vehicle_id: string
  rating: number
  comment: string
  reply?: string
  replied_at?: string
  created_at: string
  customer?: User
  partner?: PartnerProfile
  vehicle?: Vehicle
}

export interface Attraction {
  id: string
  name: string
  description: string
  location: {
    address: string
    lat: number
    lng: number
  }
  category: string
  images: string[]
  is_recommended: boolean
  view_count: number
  created_by: string
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  title: string
  description: string
  event_date: string
  event_end_date?: string
  location: {
    address: string
    lat: number
    lng: number
  }
  images: string[]
  is_featured: boolean
  view_count: number
  created_by: string
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  link_url?: string
  read: boolean
  read_at?: string
  created_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  receiver_id: string
  booking_id?: string
  message_text: string
  attachment_url?: string
  read: boolean
  read_at?: string
  created_at: string
  sender?: User
  receiver?: User
}

export interface SystemSetting {
  id: string
  setting_key: string
  setting_value: any
  description?: string
  updated_by?: string
  updated_at: string
}

export interface PromoCode {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed_amount'
  discount_value: number
  minimum_booking_amount: number
  max_discount_amount?: number
  usage_limit: number
  used_count: number
  valid_from: string
  valid_until: string
  status: 'active' | 'inactive' | 'expired'
  created_by: string
  created_at: string
}

// Form types
export interface SearchFormData {
  pickup_date: Date
  return_date: Date
  rental_type: RentalType
  pickup_location?: string
  return_location?: string
}

export interface BookingFormData {
  customer_info: {
    first_name: string
    last_name: string
    email: string
    phone: string
  }
  pickup_location: string
  return_location: string
  itinerary?: string
  special_requests?: string
  addons: {
    gps: boolean
    child_seat: boolean
    insurance: boolean
    extra_driver: boolean
  }
}

export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  email: string
  password: string
  confirm_password: string
  first_name: string
  last_name: string
  phone: string
  role: 'customer' | 'partner'
}

export interface PartnerRegistrationData extends RegisterFormData {
  business_name: string
  business_license?: string
  tax_id?: string
  bank_account_name?: string
  bank_account_number?: string
  bank_name?: string
}
