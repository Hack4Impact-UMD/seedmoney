"use client";

interface DeleteUserModalProps {
  firstName: string;
  lastName: string;
  onCancel: () => void;
  onDelete: () => void;
}

const DeleteUserModal = ({
  firstName,
  lastName,
  onCancel,
  onDelete,
}: DeleteUserModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-sm shadow-xl max-w-2xl w-full mx-4 p-8">
        <h2 className="text-[#2E7D32] text-xl font-semibold mb-4">
          Confirm Deletion
        </h2>
        <p className="text-gray-700 mb-8">
          You are about to delete {firstName} {lastName}&apos;s account. This
          action is irreversible. Are you sure you would like to delete their
          account?
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 font-medium cursor-pointer hover:text-gray-800 transition-colors"
          >
            CANCEL
          </button>
          <div className="group/del">
            <button
              onClick={onDelete}
              className="px-5 py-2 bg-gray-300 text-gray-500 font-medium rounded pointer-events-none group-hover/del:pointer-events-auto group-hover/del:bg-red-500 group-hover/del:text-white transition-colors cursor-pointer"
            >
              DELETE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;
