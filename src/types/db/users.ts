export type Users = {
  user_id: number;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
  is_admin: boolean;
  created_at: string;
};
