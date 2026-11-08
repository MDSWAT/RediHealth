export interface OtpEntry {
  otp: string;
  phone: string;
  expiresAt: number;
}

export const otpStore = new Map<string, OtpEntry>();
