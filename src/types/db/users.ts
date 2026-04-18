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
export type EditableUser = Pick<
  Users,
  "first_name" | "middle_name" | "last_name" | "email" | "phone_number"
>;

// Optional: internal/admin-only creation shape (not for untrusted input)
export type NewUserInternal = NewUser & Partial<Pick<Users, "is_admin">>;
