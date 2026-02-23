import { useState } from "react";
import { TextField, Button } from "@mui/material";
import { Google } from "@mui/icons-material";
import Form from "next/form";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    // TODO: implement submit logic
    console.log("Logging in with email/password...");
  };

  const handleGoogleLogin = () => {
    // TODO: implement Google login logic
    console.log("Logging in with Google...");
  };

  return (
    <Form action={handleSubmit} className="flex flex-col gap-4 w-full">
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
        <Google className="text-[rgba(0,0,0,0.6)] mr-1" /> Log in with Google
      </Button>
    </Form>
  );
};

export default LoginForm;
