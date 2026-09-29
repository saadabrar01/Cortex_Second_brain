import './globals.css'
import AppShell from '../components/layout/AppShell.jsx'

export const metadata = {
  title: 'Cortex — Personal Second Brain',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
