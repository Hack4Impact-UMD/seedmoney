export type Users = {
  id: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  email: string;
  phone_number?: string | null;
  is_admin: boolean;
  created_at: string;
};

export type NewUser = Omit<Users, "id" | "created_at" | "is_admin">;

// Optional: internal/admin-only creation shape (not for untrusted input)
export type NewUserInternal = NewUser & Partial<Pick<Users, "is_admin">>;
