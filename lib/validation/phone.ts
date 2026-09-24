/**
 * Validates Bangladeshi 11-digit mobile numbers
 * Accepts: 013, 014, 015, 016, 017, 018, 019
 */
export function isValidBdMobile(phone: string): boolean {
  if (!phone) return false;
  // Clean all non-digit characters
  let digits = phone.replace(/\D/g, '');
  
  // If starts with 880, strip 88
  if (digits.startsWith('880')) {
    digits = digits.slice(2);
  }
  
  // Regex for valid BD operators: 013, 014, 015, 016, 017, 018, 019 followed by 8 digits (total 11)
  const bdMobileRegex = /^01[3-9]\d{8}$/;
  return bdMobileRegex.test(digits);
}

/**
 * Standardizes BD phone to 11 digits format: 01XXXXXXXXX
 */
export function formatBdMobile(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('880')) {
    digits = digits.slice(2);
  }
  return digits;
}
