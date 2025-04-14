import { redirect } from 'next/navigation';

export default function Home() {
  // For server-side redirecting
  redirect('/login');
}