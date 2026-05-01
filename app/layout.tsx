import './globals.css';

export const metadata = {
  title: 'ElectiGuide AI',
  description: 'An agentic assistant for voter lifecycle management.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log("[SECURITY_CHECK] API Key Detected:", !!process.env.VISUAL_CROSSING_KEY);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
