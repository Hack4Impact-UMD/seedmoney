import { useQuery } from "@tanstack/react-query";
import { isExistingEmail } from "@/src/actions/db/users";
import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

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
