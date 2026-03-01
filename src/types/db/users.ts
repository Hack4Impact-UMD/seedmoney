export type Users = {
  id: number;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  email: string;
  phone_number?: string | null;
  is_admin: boolean;
  created_at: string;
};

export type NewUser = Omit<Users, "id" | "created_at"> &
  Partial<Pick<Users, "id" | "created_at">>;
