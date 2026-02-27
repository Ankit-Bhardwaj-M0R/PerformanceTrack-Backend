import React, { ReactNode } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

// ─── LAYOUT ────────────────────────────────────────────────────────────────────
// The main app layout: [Sidebar | Header + Content Area]
// Every authenticated page is wrapped inside this Layout.
//
// Structure:
//   ┌──────────┬──────────────────────┐
//   │          │      Header          │
//   │ Sidebar  ├──────────────────────┤
//   │          │   Page Content       │
//   │          │   (children)         │
//   └──────────┴──────────────────────┘
// ─────────────────────────────────────────────────────────────────────────────

interface LayoutProps {
  children: ReactNode
  title?: string
}

export default function Layout({ children, title = 'Dashboard' }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left: Navigation Sidebar */}
      <Sidebar />

      {/* Right: Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <Header title={title} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
