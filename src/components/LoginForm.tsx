import { useState } from "react";
import { TextField, Button } from "@mui/material";
import { Google } from "@mui/icons-material";
import LogoutIcon from "@mui/icons-material/Logout";
import { createBrowserClient } from "@/src/lib/supabase-client";
import { signInWithGoogle } from "@/src/lib/google-auth";
import { useRouter, useSearchParams } from "next/navigation";
import { Turnstile } from "@marsidev/react-turnstile"; // 👈 added

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null); // 👈 added
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryError = searchParams.get("error");
  const queryConfirmed = searchParams.get("confirmed") === "1";
  let decodedQueryError: string | null = null;

  if (queryError) {
    try {
      decodedQueryError = decodeURIComponent(queryError);
    } catch {
      decodedQueryError = queryError;
    }
  }

  const displayedError = decodedQueryError || errorMsg;
  const displayedSuccess =
    queryConfirmed && !displayedError
      ? "Email confirmed. You can now log in."
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!captchaToken) {
      setErrorMsg("Please complete the CAPTCHA.");
      return;
    }

    const supabase = await createBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: { captchaToken },
    });

    if (error) {
      setErrorMsg(error.message);
      return { success: false, error: error.message };
    }

    router.push("/dashboard");
    router.refresh();
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);

    try {
      const { error } = await signInWithGoogle();

      if (error) {
        setErrorMsg(error);
        return { error };
      }
    } catch (err) {
      console.error("Unexpected sign-in error:", err);
      setErrorMsg("Unexpected server error");
      return { error: "Unexpected server error" };
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      <TextField
        label="Email"
        variant="standard"
        type="email"
        placeholder="name@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        slotProps={{ inputLabel: { shrink: true } }}
        className="w-full"
      />
      <TextField
        label="Password"
        variant="standard"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        slotProps={{ inputLabel: { shrink: true } }}
        className="w-full"
      />

      <Turnstile
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        onSuccess={(token) => setCaptchaToken(token)}
      />

      <Button
        type="submit"
        variant="contained"
        startIcon={<LogoutIcon />}
        color="primary"
        size="medium"
      >
        Log in
      </Button>
      <Button
        type="button"
        onClick={handleGoogleLogin}
        startIcon={<Google className="text-[rgba(0,0,0,0.6)]" />}
        variant="outlined"
        color="primary"
        size="medium"
      >
        Log in with Google
      </Button>

      {displayedError && <p className="text-red-500">{displayedError}</p>}
      {displayedSuccess && <p className="text-green-700">{displayedSuccess}</p>}
    </form>
  );
};

export default LoginForm;
