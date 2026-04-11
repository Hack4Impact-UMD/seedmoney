
import { Box } from "@mui/material";
import Modal from "@mui/material/Modal";


type BaseModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
};

export default function BaseModal({ open, onClose, children, title }: BaseModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <Box className="flex flex-col justify-between absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-sm p-6 w-[600px] h-[191px]">
        {title && <h2 className="text-xl font-semibold mb-4 text-[#123A1E]">{title}</h2>}
        {children}
      </Box>
    </Modal>
  );
}