"use client";

import { useState } from "react";
import { TextField, Button, Checkbox, FormControlLabel } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { Google } from "@mui/icons-material";
import Link from "next/link";
import { createBrowserClient } from "@/src/lib/supabase-client";
import { useRouter } from "next/navigation";

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

  const router = useRouter();

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const supabase = await createBrowserClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
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
      return { error: error.message };
    }

    router.push("/dashboard");
    router.refresh();
  };

  const signInWithGoogle = async () => {
    setErrorMsg(null);

    try {
      const supabase = await createBrowserClient();

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/callback`,
        },
      });

      if (error) {
        setErrorMsg(error.message);
        return { error: error.message };
      }

      if (!data?.url) {
        setErrorMsg("No redirect URL returned from Supabase.");
        return { error: "No redirect URL returned from Supabase." };
      }

      window.location.assign(data.url);
    } catch (err) {
      console.error("Unexpected sign-in error:", err);
      setErrorMsg("Unexpected server error");
      return { error: "Unexpected server error" };
    }
  };

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

      <Button
        type="submit"
        variant="contained"
        size="medium"
        startIcon={<LogoutIcon />}
      >
        Create An Account
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
