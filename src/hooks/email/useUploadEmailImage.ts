"use client";

import { useMutation } from "@tanstack/react-query";
import { uploadEmailImage } from "@/src/actions/db/email-images";

export default function useUploadEmailImage() {
  return useMutation<string, Error, File>({
    mutationFn: async (file: File) => uploadEmailImage(file),
  });
}
