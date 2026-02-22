"use client";

import { useState } from "react";
import { TextField, Button, Checkbox, FormControlLabel } from "@mui/material";
import { Google } from "@mui/icons-material";
import Form from "next/form";
import Link from "next/link";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SignupForm = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handleSubmit = () => {
    if (password !== confirmPassword) return;
    if (!agreeToTerms) return;
    console.log("Signing up...", {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      agreeToTerms,
    });
  };

  const signupWithGoogle = () => {
    console.log("Sign up with Google");
  };

  return (
    <Form action={handleSubmit} className="flex flex-col gap-4 w-full">
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
        size="large"
        className="bg-[#5ABC61]! w-full"
      >
        Create An Account
      </Button>

      <Button
        type="button"
        onClick={signupWithGoogle}
        variant="contained"
        size="large"
        className="bg-[#E0E0E0]! text-black! w-full"
        startIcon={<Google className="text-[rgba(0,0,0,0.6)]" />}
      >
        Sign Up with Google
      </Button>
    </Form>
  );
};

export default SignupForm;
