export interface ProfileAddress {
  street: string;
  zipCode: string;
  city: string;
  country: string;
}

export interface Profile {
  id: string;
  userId: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  phone: string | null;
  birthday: string | null;
  profession: string | null;
  address: ProfileAddress | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProfileInput {
  displayName: string;
  bio?: string | null;
  avatarUrl?: string | null;
}

export interface UpdateProfileInput {
  displayName?: string;
  bio?: string | null;
  avatarUrl?: string | null;
  phone?: string | null;
  birthday?: string | null;
  profession?: string | null;
  address?: ProfileAddress | null;
}
