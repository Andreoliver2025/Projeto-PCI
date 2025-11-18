import type { Metadata } from 'next'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'

export const metadata: Metadata = {
  title: 'ProjetoPCI - Fit Comportamental',
  description: 'Plataforma de análise de compatibilidade comportamental para recrutamento',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="pt-BR">
        <body className="font-sans antialiased">{children}</body>
      </html>
    </ClerkProvider>
  )
}
