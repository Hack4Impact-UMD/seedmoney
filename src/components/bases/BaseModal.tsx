import { Box } from "@mui/material";
import Modal from "@mui/material/Modal";

type BaseModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  containerClassName?: string;
  titleClassName?: string;
};

export default function BaseModal({
  open,
  onClose,
  children,
  title,
  containerClassName = "",
  titleClassName = "",
}: BaseModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        className={`absolute top-1/2 left-1/2 flex min-h-[191px] w-[90%] md:w-[600px] -translate-x-1/2 -translate-y-1/2 flex-col justify-between rounded-sm bg-white p-6 max-h-[90vh] overflow-y-auto ${containerClassName}`}
      >
        {title && (
          <h2
            className={`mb-4 text-xl font-semibold text-[#123A1E] ${titleClassName}`}
          >
            {title}
          </h2>
        )}
        {children}
      </Box>
    </Modal>
  );
}
