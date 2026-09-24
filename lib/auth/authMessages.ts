import { PASSWORD_RULE_BN } from '@/lib/validation/password';

const PHONE_MSG = 'সঠিক বাংলাদেশি ১১ ডিজিটের মোবাইল নাম্বার দিন (যেমন: 017XXXXXXXX)';

/** Why an auth attempt failed, in the same words the toast and the form show. */
export function authErrorText(code: string | undefined, mode: 'LOGIN' | 'REGISTER'): string {
  if (code && /[\u0980-\u09FF]/.test(code)) return code;
  switch (code) {
    case 'INVALID_BD_PHONE':
      return PHONE_MSG;
    case 'ACCOUNT_ALREADY_EXISTS':
      return 'এই নাম্বারে ইতোমধ্যে অ্যাকাউন্ট আছে। লগইন করুন।';
    case 'ACCOUNT_NOT_FOUND':
      return 'এই নাম্বারে কোনো অ্যাকাউন্ট নেই। রেজিস্ট্রেশন করুন।';
    case 'WRONG_PIN':
      return 'ভুল পাসওয়ার্ড। আবার চেষ্টা করুন।';
    case 'PIN_TOO_SHORT':
    case 'PIN_REQUIRED':
    case 'PIN_INVALID':
      return PASSWORD_RULE_BN;
    default:
      return mode === 'REGISTER' ? 'রেজিস্ট্রেশন হয়নি। আবার চেষ্টা করুন।' : 'লগইন হয়নি। আবার চেষ্টা করুন।';
  }
}

export const AUTH_COPY = {
  phone: PHONE_MSG,
  passwordRequired: 'পাসওয়ার্ড দিন।',
  nameRequired: 'আপনার সম্পূর্ণ নাম লিখুন।',
  passwordRule: PASSWORD_RULE_BN,
  loginOk: 'লগইন সফল হয়েছে।',
  registerOk: 'রেজিস্ট্রেশন সফল হয়েছে। স্বাগতম!',
};
