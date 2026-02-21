import React, { useState } from "react";
import { TextField, Button } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    // TODO: implement submit logic
    e.preventDefault();
    console.log("Logging in with email/password...");
  };

  const handleGoogleLogin = () => {
    // TODO: implement Google login logic
    console.log("Logging in with Google...");
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
        slotProps={{
          inputLabel: {
            shrink: true,
          },
        }}
        className="w-full"
      />
      <TextField
        label="Password"
        variant="standard"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        slotProps={{
          inputLabel: {
            shrink: true,
          },
        }}
        className="w-full"
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        size="large"
        className="bg-[#5ABC61]! w-full"
      >
        Log in
      </Button>
      <Button
        type="button"
        onClick={handleGoogleLogin}
        variant="contained"
        color="primary"
        size="large"
        className="bg-[#E0E0E0]! text-black! w-full"
      >
        <StarIcon className="text-[rgba(0,0,0,0.6)] mr-1" /> Log in with Google
      </Button>
    </form>
  );
};

export default LoginForm;
