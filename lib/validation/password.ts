/** Customer password: at least 6 characters, with upper, lower, a number, and a special character. */
export const PASSWORD_RULE_BN =
  'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে, এবং বড় হাতের অক্ষর, ছোট হাতের অক্ষর, সংখ্যা ও একটি স্পেশাল ক্যারেক্টার থাকতে হবে।';

export function isStrongPassword(pin: string): boolean {
  const p = pin.trim();
  return p.length >= 6 && p.length <= 128 && /[a-z]/.test(p) && /[A-Z]/.test(p) && /\d/.test(p) && /[^A-Za-z0-9]/.test(p);
}
