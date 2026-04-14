import { useQuery } from "@tanstack/react-query";
import { isExistingEmail } from "@/src/actions/db/users";

export default function useIsExistingEmail(email: string) {
  return useQuery<boolean>({
    queryKey: [email, "email"],
    queryFn: async () => {
      const data = await isExistingEmail(email);
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
    enabled: !!email,
  });
}
