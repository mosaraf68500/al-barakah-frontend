/** Customer password: at least 6 characters (no complexity rules). */
export const PASSWORD_RULE_BN = 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।';

export function isStrongPassword(pin: string): boolean {
  const p = pin.trim();
  return p.length >= 6 && p.length <= 128;
}
