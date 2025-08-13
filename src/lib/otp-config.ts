// OTP Configuration utilities
export interface OTPConfig {
  enableEmail: boolean;
  enablePhone: boolean;
  defaultMethod: 'email' | 'phone';
}

export function getOTPConfig(): OTPConfig {
  return {
    enableEmail: process.env.NEXT_PUBLIC_ENABLE_EMAIL_OTP !== 'false',
    enablePhone: process.env.NEXT_PUBLIC_ENABLE_PHONE_OTP === 'true',
    defaultMethod: (process.env.NEXT_PUBLIC_DEFAULT_CONTACT_METHOD as 'email' | 'phone') || 'email'
  };
}

// Validate that at least one method is enabled
export function isOTPConfigValid(config: OTPConfig): boolean {
  return config.enableEmail || config.enablePhone;
}