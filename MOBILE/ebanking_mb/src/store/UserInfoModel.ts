export interface UserInfoModel {
  id: number;
  username: string;
  fullName: string;
  address: string;
  citizenId: string;
  birthday: string;
  createAt: string;
  isMale: string;
  email: string;
  phone: string;

  // ============ eKYC Integration (NEW) ============
  ekycStatus?: 'NOT_VERIFIED' | 'VERIFIED' | 'EXPIRED' | 'REJECTED';
  ekycSessionId?: string;
  ekycVerifiedAt?: string;

  // ============ Avatar ============
  avatarUrl?: string;
}

export interface EkycStatusResponse {
  status: 'NOT_VERIFIED' | 'VERIFIED' | 'EXPIRED' | 'REJECTED';
  sessionId: string | null;
  verifiedAt: string | null;
  canRetry: boolean;
}

export interface EkycDetailModel {
  // Session info
  sessionId: string;
  status: string;
  verifiedAt: number[] | string; // LocalDateTime serialized as [year, month, day, hour, minute, second, nano] or string

  // OCR data
  idNumber: string;
  fullName: string;
  dateOfBirth: number[] | string; // LocalDate serialized as [year, month, day] or string
  gender: string;
  address: string;
  issueDate: number[] | string; // LocalDate serialized as [year, month, day] or string
  expiryDate: number[] | string; // LocalDate serialized as [year, month, day] or string

  // Image URLs
  frontImageUrl: string;
  backImageUrl: string;
  portraitImageUrl?: string;

  // Verification scores
  ocrConfidence?: number;
  livenessConfidence?: number;
  faceMatchScore?: number;
  isLive?: boolean;
  faceMatched?: boolean;
}
