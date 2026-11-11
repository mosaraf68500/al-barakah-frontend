import { redirect } from 'next/navigation';

/** Customer login temporarily disabled — guest checkout only. */
export default function Page() {
  redirect('/');
}
