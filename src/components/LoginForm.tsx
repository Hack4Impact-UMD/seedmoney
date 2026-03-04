import { useState } from "react";
import { TextField, Button } from "@mui/material";
import { Google } from "@mui/icons-material";
import LogoutIcon from "@mui/icons-material/Logout";
import { createBrowserClient } from "@/src/lib/supabase-client";
import { signInWithGoogle } from "@/src/lib/google-auth";
import { useRouter } from "next/navigation";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const supabase = await createBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
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

      {errorMsg && <p className="text-red-500">{errorMsg}</p>}
    </form>
  );
};

export default LoginForm;
