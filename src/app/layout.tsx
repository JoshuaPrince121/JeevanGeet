import ThemeToggle from '../components/ThemeToggle'
import InstallButton from '../components/InstallButton'
// @ts-ignore - Next.js handles global CSS imports at build time.
import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'Jeevan Geet',
  description: 'Digital Songbook',
  manifest: '/manifest.json',
  icons: { icon: '/icon.png', apple: '/icon.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-neutral-50 text-neutral-950 transition-colors duration-300 dark:bg-neutral-950 dark:text-neutral-100">
        
        <nav className="border-b border-neutral-200 bg-white transition-colors duration-300 dark:border-neutral-800 dark:bg-neutral-950">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
            <Link href="/" className="text-2xl font-bold text-neutral-950 dark:text-white">
              जीवन गीत
            </Link>
            <div className="flex items-center gap-3 text-sm font-medium md:gap-6">
              <Link href="/songs" className="text-neutral-600 transition hover:text-black dark:text-neutral-300 dark:hover:text-white">All Songs</Link>
              <Link href="/donate" className="text-neutral-600 transition hover:text-black dark:text-neutral-300 dark:hover:text-white">Donate</Link>
              <InstallButton />
              <ThemeToggle />
            </div>
          </div>
        </nav>

        <main className="flex-grow">
          {children}
        </main>

        <footer className="border-t border-neutral-200 py-6 text-center text-sm text-neutral-500 transition-colors duration-300 dark:border-neutral-800 dark:text-neutral-400 print:hidden">
          © {new Date().getFullYear()} Jeevan Geet. All rights reserved.
        </footer>
        
      </body>
    </html>
  )
}