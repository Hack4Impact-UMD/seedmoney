"use client";

import { useState } from "react";
import { TextField, Button, Checkbox, FormControlLabel } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { Google } from "@mui/icons-material";
import Link from "next/link";
import { createBrowserClient } from "@/src/lib/supabase-client";
import { signInWithGoogle as startGoogleSignIn } from "@/src/lib/google-auth";
import { Turnstile } from "@marsidev/react-turnstile";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SignupForm = () => {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState<
    string | null
  >(null);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setPendingConfirmationEmail(null);

    const normalizedEmail = email.trim().toLowerCase();

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

    if (!captchaToken) {
      setErrorMsg("Please complete the CAPTCHA.");
      return;
    }

    setIsSubmitting(true);

    const supabase = await createBrowserClient();

    try {
      const { error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          captchaToken,
          emailRedirectTo: `${window.location.origin}/callback`,
          data: {
            first_name: firstName,
            middle_name: middleName,
            last_name: lastName,
            phone_number: phone,
            is_admin: false,
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      setPendingConfirmationEmail(normalizedEmail);
    } finally {
      setIsSubmitting(false);
    }
  };

  const signInWithGoogle = async () => {
    setErrorMsg(null);

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

  const passwordError = validatePassword(password);
  const confirmPasswordError = validateConfirmPassword(password, confirmPassword);

  if (pendingConfirmationEmail) {
    return (
      <div className="flex w-full flex-col gap-4 rounded-lg border border-[#d7e5df] bg-white p-5">
        <div>
          <h2 className="text-xl font-semibold text-[#214f3d]">
            Check your email
          </h2>
          <p className="mt-2 text-sm text-[rgba(0,0,0,0.7)]">
            We sent a verification link to {pendingConfirmationEmail}. Click it
            to finish creating your SeedMoney account.
          </p>
        </div>

        <Button component={Link} href="/" variant="contained" size="medium">
          Back to log in
        </Button>

        <Button
          type="button"
          onClick={() => setPendingConfirmationEmail(null)}
          variant="outlined"
          size="medium"
        >
          Use a different email
        </Button>
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
        error={!!email && !EMAIL_REGEX.test(email)}
        helperText={
          !!email && !EMAIL_REGEX.test(email)
            ? "Please enter a valid email address."
            : ""
        }
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

      {errorMsg && <div className="text-red-500">{errorMsg}</div>}
    </form>
  );
};

export default SignupForm;
