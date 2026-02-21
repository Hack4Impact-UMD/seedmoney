/** Application/UI-friendly user model (camelCase). */
export type User = {
  userId: number;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
  isAdmin: boolean;
  createdAt: string;
};
