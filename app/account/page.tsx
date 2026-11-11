import { redirect } from 'next/navigation';

/** Customer dashboard temporarily disabled — guest checkout only. */
export default function Page() {
  redirect('/');
}
