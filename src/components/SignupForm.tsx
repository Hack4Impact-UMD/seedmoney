"use client";

import { useEffect, useState } from "react";
import { TextField, Button, Checkbox, FormControlLabel } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { Google } from "@mui/icons-material";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/src/lib/supabase-client";
import { signInWithGoogle as startGoogleSignIn } from "@/src/lib/google-auth";
import { Turnstile } from "@marsidev/react-turnstile";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PENDING_SIGNUP_STORAGE_KEY = "seedmoney:pending-signup";
const RESEND_COOLDOWN_SECONDS = 60;
const RESEND_COOLDOWN_MS = RESEND_COOLDOWN_SECONDS * 1000;

type PendingSignupState = {
  email: string;
  createdAt: number;
  lastSentAt: number;
  lastResentAt?: number;
};

type AuthErrorKind =
  | "alreadyRegistered"
  | "rateLimited"
  | "captcha"
  | "expired"
  | "generic";

const normalizeEmail = (value: string) => value.trim().toLowerCase();

const isPendingSignupState = (value: unknown): value is PendingSignupState => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<PendingSignupState>;
  return (
    typeof candidate.email === "string" &&
    EMAIL_REGEX.test(candidate.email) &&
    typeof candidate.createdAt === "number" &&
    typeof candidate.lastSentAt === "number"
  );
};

const readPendingSignupState = (): PendingSignupState | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(PENDING_SIGNUP_STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue);

    if (!isPendingSignupState(parsedValue)) {
      window.localStorage.removeItem(PENDING_SIGNUP_STORAGE_KEY);
      return null;
    }

    return {
      ...parsedValue,
      email: normalizeEmail(parsedValue.email),
    };
  } catch {
    window.localStorage.removeItem(PENDING_SIGNUP_STORAGE_KEY);
    return null;
  }
};

const writePendingSignupState = (state: PendingSignupState) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    PENDING_SIGNUP_STORAGE_KEY,
    JSON.stringify(state),
  );
};

const clearPendingSignupState = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(PENDING_SIGNUP_STORAGE_KEY);
};

const getResendRemainingSeconds = (
  pendingSignup: PendingSignupState,
  now: number,
) =>
  Math.max(
    0,
    Math.ceil((pendingSignup.lastSentAt + RESEND_COOLDOWN_MS - now) / 1000),
  );

const classifyAuthError = (message: string): AuthErrorKind => {
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("already registered") ||
    normalizedMessage.includes("already been registered") ||
    normalizedMessage.includes("already confirmed") ||
    normalizedMessage.includes("user already exists") ||
    normalizedMessage.includes("user exists")
  ) {
    return "alreadyRegistered";
  }

  if (
    normalizedMessage.includes("rate limit") ||
    normalizedMessage.includes("too many") ||
    normalizedMessage.includes("over email send rate") ||
    normalizedMessage.includes("security purposes")
  ) {
    return "rateLimited";
  }

  if (
    normalizedMessage.includes("captcha") ||
    normalizedMessage.includes("turnstile")
  ) {
    return "captcha";
  }

  if (
    normalizedMessage.includes("expired") ||
    normalizedMessage.includes("invalid token") ||
    normalizedMessage.includes("invalid link")
  ) {
    return "expired";
  }

  return "generic";
};

const getAuthErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message?: unknown }).message ?? "");
  }

  return "";
};

const getSignupErrorMessage = (message: string) => {
  switch (classifyAuthError(message)) {
    case "alreadyRegistered":
      return "If you already started signup, check your email or resend the confirmation link. If this email is already confirmed, log in instead.";
    case "rateLimited":
      return `Please wait ${RESEND_COOLDOWN_SECONDS} seconds before requesting another confirmation email.`;
    case "captcha":
      return "Please complete the CAPTCHA again.";
    case "expired":
      return "That confirmation link expired or is invalid. Resend the email to get a fresh link.";
    default:
      return (
        message || "We could not send the confirmation email. Please try again."
      );
  }
};

const validatePassword = (password: string) => {
  if (!password) {
    return null;
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must include at least one capital letter.";
  }

  if (!/\d/.test(password)) {
    return "Password must include at least one number.";
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Password must include at least one special character.";
  }

  return null;
};

const validateConfirmPassword = (
  password: string,
  confirmPassword: string,
) => {
  if (!confirmPassword) {
    return null;
  }

  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }

  return null;
};

const SignupForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaWidgetKey, setCaptchaWidgetKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [pendingSignup, setPendingSignup] =
    useState<PendingSignupState | null>(null);

  const confirmationState = searchParams.get("confirmation");
  const resendRemainingSeconds = pendingSignup
    ? getResendRemainingSeconds(pendingSignup, now)
    : 0;

  useEffect(() => {
    const restoredPendingSignup = readPendingSignupState();

    if (restoredPendingSignup) {
      setPendingSignup(restoredPendingSignup);
      setEmail(restoredPendingSignup.email);
    }

    if (confirmationState === "expired") {
      setErrorMsg(
        "That confirmation link expired or is invalid. Resend the email to get a fresh link.",
      );
    }
  }, [confirmationState]);

  useEffect(() => {
    if (!pendingSignup) {
      return;
    }

    setNow(Date.now());

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [pendingSignup]);

  const resetCaptcha = () => {
    setCaptchaToken(null);
    setCaptchaWidgetKey((currentKey) => currentKey + 1);
  };

  const storePendingSignup = (nextPendingSignup: PendingSignupState) => {
    writePendingSignupState(nextPendingSignup);
    setPendingSignup(nextPendingSignup);
    setEmail(nextPendingSignup.email);
    setNow(Date.now());
  };

  const showExistingSignupState = (normalizedEmail: string, message: string) => {
    const existingPendingSignup = readPendingSignupState();
    const nextPendingSignup =
      existingPendingSignup?.email === normalizedEmail
        ? existingPendingSignup
        : {
            email: normalizedEmail,
            createdAt: Date.now(),
            lastSentAt: 0,
          };

    storePendingSignup(nextPendingSignup);
    setStatusMsg(message);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setStatusMsg(null);

    const normalizedEmail = normalizeEmail(email);

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(password, confirmPassword);

    if (passwordError || confirmPasswordError) {
      setErrorMsg(passwordError || confirmPasswordError);
      return;
    }

    if (!agreeToTerms) {
      setErrorMsg("Please agree to the Terms of Service and Privacy Statement.");
      return;
    }

    const existingPendingSignup = readPendingSignupState();

    if (existingPendingSignup?.email === normalizedEmail) {
      showExistingSignupState(
        normalizedEmail,
        "We already sent a confirmation link. You can resend it from here if you need a fresh one.",
      );
      resetCaptcha();
      return;
    }

    if (!captchaToken) {
      setErrorMsg("Please complete the CAPTCHA.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          captchaToken,
          emailRedirectTo: `${window.location.origin}/callback`,
          data: {
            first_name: firstName,
            middle_name: "",
            last_name: lastName,
            phone_number: "",
            is_admin: false,
          },
        },
      });

      if (error) {
        const message = getAuthErrorMessage(error);

        if (classifyAuthError(message) === "alreadyRegistered") {
          showExistingSignupState(
            normalizedEmail,
            "If this signup is still pending, resend the confirmation email from here. If the account is already confirmed, log in instead.",
          );
          return;
        }

        setErrorMsg(getSignupErrorMessage(message));
        return;
      }

      if (data.session?.user) {
        clearPendingSignupState();
        router.push("/dashboard");
        router.refresh();
        return;
      }

      if (data.user?.identities?.length === 0) {
        showExistingSignupState(
          normalizedEmail,
          "If this signup is still pending, resend the confirmation email from here. If the account is already confirmed, log in instead.",
        );
        return;
      }

      const sentAt = Date.now();
      storePendingSignup({
        email: normalizedEmail,
        createdAt: sentAt,
        lastSentAt: sentAt,
      });
    } catch (err) {
      console.error("Unexpected signup error:", err);
      setErrorMsg("Unexpected server error");
    } finally {
      setIsSubmitting(false);
      resetCaptcha();
    }
  };

  const handleResendConfirmation = async () => {
    if (!pendingSignup) {
      return;
    }

    setErrorMsg(null);
    setStatusMsg(null);

    if (resendRemainingSeconds > 0) {
      setErrorMsg(
        `Please wait ${resendRemainingSeconds} seconds before requesting another confirmation email.`,
      );
      return;
    }

    if (!captchaToken) {
      setErrorMsg("Please complete the CAPTCHA before resending.");
      return;
    }

    setIsResending(true);

    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: pendingSignup.email,
        options: {
          captchaToken,
          emailRedirectTo: `${window.location.origin}/callback`,
        },
      });

      if (error) {
        const message = getAuthErrorMessage(error);

        if (classifyAuthError(message) === "rateLimited") {
          storePendingSignup({
            ...pendingSignup,
            lastSentAt: Date.now(),
          });
        }

        setErrorMsg(getSignupErrorMessage(message));
        return;
      }

      const resentAt = Date.now();
      storePendingSignup({
        ...pendingSignup,
        lastSentAt: resentAt,
        lastResentAt: resentAt,
      });
      setStatusMsg("We sent a new confirmation link.");
    } catch (err) {
      console.error("Unexpected signup resend error:", err);
      setErrorMsg("Unexpected server error");
    } finally {
      setIsResending(false);
      resetCaptcha();
    }
  };

  const signInWithGoogle = async () => {
    setErrorMsg(null);
    setStatusMsg(null);

    try {
      const { error } = await startGoogleSignIn();

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

  const passwordError = validatePassword(password);
  const confirmPasswordError = validateConfirmPassword(password, confirmPassword);
  const normalizedEmail = normalizeEmail(email);
  const emailError = !!email && !EMAIL_REGEX.test(normalizedEmail);

  if (pendingSignup) {
    return (
      <div className="flex w-full flex-col gap-4 rounded-lg border border-[#d7e5df] bg-white p-5">
        <div>
          <h2 className="text-xl font-semibold text-[#214f3d]">
            Check your email
          </h2>
          <p className="mt-2 text-sm text-[rgba(0,0,0,0.7)]">
            We sent a verification link to {pendingSignup.email}. Click it to
            finish creating your SeedMoney account.
          </p>
          <p className="mt-2 text-sm text-[rgba(0,0,0,0.55)]">
            If the link expired or you cannot find the email, complete the
            CAPTCHA and resend it from here.
          </p>
        </div>

        <Turnstile
          key={captchaWidgetKey}
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
          onSuccess={(token) => setCaptchaToken(token)}
          onExpire={() => setCaptchaToken(null)}
          onError={() => setCaptchaToken(null)}
        />

        <Button
          type="button"
          onClick={handleResendConfirmation}
          variant="contained"
          size="medium"
          disabled={isResending || resendRemainingSeconds > 0 || !captchaToken}
        >
          {isResending
            ? "Resending..."
            : resendRemainingSeconds > 0
              ? `Resend in ${resendRemainingSeconds}s`
              : "Resend email"}
        </Button>

        {resendRemainingSeconds === 0 && !captchaToken && (
          <p className="text-sm text-[rgba(0,0,0,0.55)]">
            Complete the CAPTCHA to resend the confirmation email.
          </p>
        )}

        <Button component={Link} href="/" variant="outlined" size="medium">
          Back to log in
        </Button>

        <Button
          type="button"
          onClick={() => {
            clearPendingSignupState();
            setPendingSignup(null);
            setEmail("");
            setErrorMsg(null);
            setStatusMsg(null);
            resetCaptcha();
          }}
          variant="outlined"
          size="medium"
        >
          Use a different email
        </Button>

        <p className="text-sm text-[rgba(0,0,0,0.55)]">
          If this email is already confirmed, log in instead.
        </p>

        {statusMsg && <p className="text-sm text-green-700">{statusMsg}</p>}
        {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      <TextField
        label="First Name"
        required
        variant="standard"
        type="text"
        placeholder="First name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        slotProps={{ inputLabel: { shrink: true } }}
        className="w-full"
      />

      <TextField
        label="Last Name"
        required
        variant="standard"
        type="text"
        placeholder="Last name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        slotProps={{ inputLabel: { shrink: true } }}
        className="w-full"
      />

      <TextField
        label="Email"
        required
        variant="standard"
        type="email"
        placeholder="name@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={emailError}
        helperText={emailError ? "Please enter a valid email address." : ""}
        slotProps={{ inputLabel: { shrink: true } }}
        className="w-full"
      />

      <TextField
        label="Password"
        required
        variant="standard"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={!!passwordError}
        helperText={passwordError || ""}
        slotProps={{ inputLabel: { shrink: true } }}
        className="w-full"
      />

      <TextField
        label="Confirm Password"
        required
        variant="standard"
        type="password"
        placeholder="Confirm password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={!!confirmPasswordError}
        helperText={confirmPasswordError || ""}
        slotProps={{ inputLabel: { shrink: true } }}
        className="w-full"
      />

      <FormControlLabel
        required
        control={
          <Checkbox
            checked={agreeToTerms}
            onChange={(e) => setAgreeToTerms(e.target.checked)}
          />
        }
        label={
          <span className="text-sm text-[rgba(0,0,0,0.6)]">
            By checking this box, I agree to the{" "}
            <Link href="/terms" className="text-[#1976D2] underline">
              Terms of Service
            </Link>{" "}
            &{" "}
            <Link href="/privacy" className="text-[#1976D2] underline">
              Privacy Statement
            </Link>
            .
          </span>
        }
      />

      <Turnstile
        key={captchaWidgetKey}
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        onSuccess={(token) => setCaptchaToken(token)}
        onExpire={() => setCaptchaToken(null)}
        onError={() => setCaptchaToken(null)}
      />

      <Button
        type="submit"
        variant="contained"
        size="medium"
        startIcon={<LogoutIcon />}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating account..." : "Create An Account"}
      </Button>

      <Button
        type="button"
        onClick={signInWithGoogle}
        variant="outlined"
        size="medium"
        startIcon={<Google className="text-[rgba(0,0,0,0.6)]" />}
      >
        Sign Up with Google
      </Button>

      {statusMsg && <div className="text-green-700">{statusMsg}</div>}
      {errorMsg && <div className="text-red-500">{errorMsg}</div>}
    </form>
  );
};

export default SignupForm;
