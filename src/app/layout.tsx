import ThemeToggle from '../components/ThemeToggle'
// @ts-ignore - Next.js handles global CSS imports at build time.
import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'Jeevan Geet',
  description: 'Digital Songbook',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-screen flex flex-col transition-colors duration-300">
        
        {/* Navigation Bar */}
        <nav className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 transition-colors duration-300">
          <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              जीवन गीत
            </Link>
            <div className="flex items-center gap-6 text-sm font-medium">
              <Link href="/songs" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition">All Songs</Link>
              <Link href="/donate" className="text-slate-600 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition">Donate</Link>
              <ThemeToggle />
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Footer */}
        <footer className="text-center py-6 text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 transition-colors duration-300">
          © {new Date().getFullYear()} Jeevan Geet. All rights reserved.
        </footer>
        
      </body>
    </html>
  )
}