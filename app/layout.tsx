import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })

export const metadata: Metadata = { title: 'TUTIS Demo' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body style={{ margin: 0, height: '100vh', overflow: 'hidden', display: 'flex' }}>
        {children}
      </body>
    </html>
  )
}
