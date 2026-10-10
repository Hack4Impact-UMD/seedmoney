import Image from "next/image";

export default function ReviewBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center bg-[#FDECEA] text-[#5F2120] px-4 py-3 rounded-md text-sm">
      <div className="flex items-center gap-2">
        <Image src="/icons/error.svg" width={18} height={18} alt="error" />
        <span>{message}</span>
      </div>
    </div>
  );
}
