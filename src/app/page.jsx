import { redirect } from 'next/navigation'

// The dashboard is the default landing screen — this route exists only to
// send "/" there so every real screen lives at its own address.
export default function RootPage() {
  redirect('/dashboard')
}
