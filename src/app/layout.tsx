import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Car Rental Platform - เช่ารถ จองทัวร์ ง่ายๆ ไว้ใจได้',
  description: 'แพลตฟอร์มจองรถเช่าและทัวร์ท่องเที่ยว รองรับทั้งขับเองและพร้อมคนขับ',
  keywords: 'เช่ารถ, รถเช่า, ทัวร์, นำเที่ยว, พร้อมคนขับ, car rental, tour',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
