import { useRef, useState } from "react";
import { TextField, Button } from "@mui/material";
import { Google } from "@mui/icons-material";
import LogoutIcon from "@mui/icons-material/Logout";
import { createBrowserClient } from "@/src/lib/supabase-client";
import { signInWithGoogle } from "@/src/lib/google-auth";
import { useRouter, useSearchParams } from "next/navigation";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

const PENDING_SIGNUP_STORAGE_KEY = "seedmoney:pending-signup";

const clearPendingSignupState = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(PENDING_SIGNUP_STORAGE_KEY);
};

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const inFlight = useRef(false);
  const captcha = useRef<TurnstileInstance | undefined>(undefined);
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

  const displayedError = errorMsg || decodedQueryError;
  const displayedSuccess =
    queryConfirmed && !displayedError
      ? "Email confirmed. You can now log in."
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inFlight.current) return;
    setErrorMsg(null);

    if (!captchaToken) {
      setErrorMsg("Please complete the CAPTCHA.");
      return;
    }

    inFlight.current = true;
    setIsSigningIn(true);
    const token = captchaToken;
    setCaptchaToken(null);
    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
        options: { captchaToken: token },
      });

      if (error) {
        setErrorMsg(error.message);
        return { success: false, error: error.message };
      }

      clearPendingSignupState();
      router.push("/dashboard");
      router.refresh();
    } catch {
      setErrorMsg("Unable to log in. Please try again.");
    } finally {
      inFlight.current = false;
      setIsSigningIn(false);
      captcha.current?.reset();
    }
  };

  const handleGoogleLogin = async () => {
    if (inFlight.current || !captchaToken) return;
    inFlight.current = true;
    setIsSigningIn(true);
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
    } finally {
      inFlight.current = false;
      setIsSigningIn(false);
      setCaptchaToken(null);
      captcha.current?.reset();
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
        id="login-captcha"
        ref={captcha}
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        onSuccess={(token) => setCaptchaToken(token)}
        onExpire={() => setCaptchaToken(null)}
        onError={() => setCaptchaToken(null)}
        onTimeout={() => setCaptchaToken(null)}
      />

      <Button
        type="submit"
        variant="contained"
        startIcon={<LogoutIcon />}
        color="primary"
        size="medium"
        disabled={isSigningIn || !captchaToken}
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
        disabled={isSigningIn || !captchaToken}
      >
        Log in with Google
      </Button>

      {displayedError && <p className="text-red-500">{displayedError}</p>}
      {displayedSuccess && <p className="text-green-700">{displayedSuccess}</p>}
    </form>
  );
};

export default LoginForm;
