// Authentication related types
export type AuthMode = 'signin' | 'signup' | 'reset';

export type UserType = 'trekker' | 'micro_community' | 'admin';

export type SubscriptionType = 'community' | 'self_service';

export interface SignInFormData {
  email: string;
  password: string;
}

export interface SignUpFormData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  userType: UserType;
  subscriptionType: SubscriptionType;
  partnerId?: string;
  indemnityAccepted: boolean;
  verificationDocs?: File[];
}

export interface PasswordResetFormData {
  email: string;
}

export interface AuthFormErrors {
  email?: string;
  password?: string;
  fullName?: string;
  phone?: string;
  partnerId?: string;
  indemnityAccepted?: string;
  general?: string;
}

export interface AuthFormState {
  mode: AuthMode;
  loading: boolean;
  showReset: boolean;
  errors: AuthFormErrors;
}

// Auth API response types
export interface AuthSuccessResponse {
  success: true;
  message: string;
  redirectTo?: string;
}

export interface AuthErrorResponse {
  success: false;
  error: string;
  code?: string;
}

export type AuthResponse = AuthSuccessResponse | AuthErrorResponse;

// Subscription pricing
export const SUBSCRIPTION_PRICING = {
  community: {
    price: 0,
    duration: 'year',
    originalPrice: 499, // Future pricing when activated
    features: ['Community access', 'Basic trek booking', 'Group activities'],
    status: 'active' as const
  },
  self_service: {
    price: 0,
    duration: 'month',
    originalPrice: 99, // Future pricing when activated
    features: ['Self-service booking', 'Premium features', 'Priority support'],
    status: 'future' as const, // Not currently available
    note: 'May be activated in future for individual trekkers and intothewild direct members'
  }
} as const;

// User type descriptions
export const USER_TYPE_DESCRIPTIONS = {
  trekker: 'Individual adventurer looking for trek experiences',
  micro_community: 'Community organizer or group leader',
  admin: 'Administrative access to manage the platform'
} as const;

// Form field configurations
export const FORM_CONFIG = {
  passwordMinLength: 8,
  phoneLength: 10,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedFileTypes: ['image/jpeg', 'image/png', 'image/pdf'],
  maxFiles: 3
} as const;
