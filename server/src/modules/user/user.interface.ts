export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  bio: string | null;
  website: string | null;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserProfilePayload {
  name?: string;
  bio?: string;
  website?: string;
  timezone?: string;
}

export interface UploadAvatarPayload {
  image: string; // URL from Cloudinary
}
