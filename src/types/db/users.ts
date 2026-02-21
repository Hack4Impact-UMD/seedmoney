/** Row shape for the `users` table (DB columns, snake_case). */
export type DbUserRow = {
  user_id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  phone_number?: string | null;
  is_admin: boolean;
  created_at: string;
};
