"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/src/components/Navbar";
import ChangeEmailModal from "@/src/components/settings-modals/ChangeEmailModal";
import ChangeNameModal from "@/src/components/settings-modals/ChangeNameModal";
import ChangePasswordModal from "@/src/components/settings-modals/ChangePasswordModal";
import { useAuth } from "@/src/context/AuthProvider";
import useUserByAuthId from "@/src/hooks/users/useUserByAuthId";
import { createBrowserClient } from "@/src/lib/supabase-client";
import useUpdateUser from "@/src/hooks/users/useUpdateUser";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

type ActiveModal = "name" | "email" | "password" | null;

function SettingsRow({
  label,
  onEdit,
  value,
}: {
  label: string;
  onEdit?: () => void;
  value: string;
}) {
  return (
    <div className="py-4">
      <p className="text-[18px] font-semibold text-[#1f2320]">{label}</p>
      <div className="mt-2 flex items-center justify-between gap-6">
        <p className="min-w-0 flex-1 break-words text-[18px] text-[#7b827d]">
          {value}
        </p>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="shrink-0 rounded-[10px] border border-[#2D7A45] px-4 py-2 text-[14px] font-semibold tracking-[0.03em] text-[#2D7A45] transition-colors hover:bg-[#f3faf4]"
          >
            EDIT
          </button>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const { data: userData } = useUserByAuthId(user?.id || "");
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [nameSaveError, setNameSaveError] = useState<string | null>(null);
  const [savedName, setSavedName] = useState<{
    firstName: string;
    lastName: string;
  } | null>(null);

  const isGoogleAuth =
    user?.app_metadata?.provider === "google" ||
    user?.app_metadata?.providers?.includes("google") === true ||
    user?.identities?.some((identity) => identity.provider === "google") === true;

  const firstName = savedName?.firstName || userData?.first_name || "SeedMoney";
  const lastName = savedName?.lastName || userData?.last_name || "User";
  const email = userData?.email || user?.email || "Could not fetch email.";
  const displayName = useMemo(() => {
    return [firstName, lastName].filter(Boolean).join(" ");
  }, [firstName, lastName]);

  const handleReauthenticate = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  const updateUser = useUpdateUser();

  const handleSave = async (nextFirstName: string, nextLastName: string) => {
    if (!userData?.id) {
      setNameSaveError("Unable to update name right now. Try again.");
      return false;
    }

    try {
      setNameSaveError(null);
      await updateUser.mutateAsync({
        userId: userData.id,
        userUpdateData: {
          first_name: nextFirstName,
          last_name: nextLastName,
        },
      });
      setSavedName({ firstName: nextFirstName, lastName: nextLastName });
      setActiveModal(null);
      return true;
    } catch {
      setNameSaveError("Unable to update name. Try again.");
      return false;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fbf8]">
      <Navbar />

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-8 sm:px-10 md:px-12">
        <div className="w-full max-w-[760px]">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="mb-6 flex items-center gap-1.5 text-[14px] text-[#6c736d] transition-colors hover:text-[#1f2320]"
          >
            <ArrowBackIcon className="!h-4 !w-4" />
            Back
          </button>

          <div className="overflow-hidden rounded-[18px] border border-[#dfe8df] bg-white px-8 py-8 shadow-[0_12px_30px_rgba(31,60,44,0.08)] sm:px-10">
            <h1 className="text-[20px] font-bold text-[#214E34]">Settings</h1>

            <div className="mt-6">
              <SettingsRow
                label="Name"
                value={displayName || "John Smith"}
                onEdit={() => setActiveModal("name")}
              />
              <SettingsRow
                label="Email"
                value={email}
                onEdit={isGoogleAuth ? undefined : () => setActiveModal("email")}
              />
              {!isGoogleAuth && (
                <SettingsRow
                  label="Password"
                  value="••••••••••••••••••"
                  onEdit={() => setActiveModal("password")}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {activeModal === "name" && (
        <ChangeNameModal
          open
          onClose={() => {
            setNameSaveError(null);
            setActiveModal(null);
          }}
          firstName={firstName}
          lastName={lastName}
          title={isGoogleAuth ? "Confirm Edit" : "Change Name"}
          onSave={handleSave}
          saveError={nameSaveError}
          isSaving={updateUser.isPending}
        />
      )}

      {activeModal === "email" && (
        <ChangeEmailModal
          open
          onClose={() => setActiveModal(null)}
          userEmail={email}
          onLogin={handleReauthenticate}
        />
      )}

      {activeModal === "password" && (
        <ChangePasswordModal
          open
          onClose={() => setActiveModal(null)}
          userEmail={email}
          onLogin={handleReauthenticate}
        />
      )}
    </div>
  );
}