'use client';
import React, {useState} from 'react';
import Link from "next/link";
import {Button, Checkbox, FormControlLabel, Stack, TextField} from "@mui/material";
import { Google } from "@mui/icons-material";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupForm() {

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreeToTerms, setAgreeToTerms] = useState(false);

    const signupWithGoogle = () => {
        // TODO: Implement Google sign-up logic
        console.log('Sign up with Google');
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // TODO: Implement form submission logic
        console.log('Form submitted:', { firstName, lastName, email, password, confirmPassword, agreeToTerms });
    }

    return (
        <form onSubmit={handleSubmit}>
            <Stack direction="column" spacing={2}>
                <TextField required variant="standard" type="text" fullWidth label="First Name" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)}/>
                <TextField required variant="standard" type="text" fullWidth label="Last Name" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)}/>
                <TextField required variant="standard" type="email" fullWidth label="Email" placeholder="name@email.com" value={email} onChange={(e) => setEmail(e.target.value)} error={!!email && !EMAIL_REGEX.test(email)} helperText={!!email && !EMAIL_REGEX.test(email) ? 'Please enter a valid email address.' : ''}/>
                <TextField required variant="standard" type="password" fullWidth label="Password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                <TextField required variant="standard" type="password" fullWidth label="Confirm Password" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>
                <FormControlLabel
                    control={<Checkbox checked={agreeToTerms} onChange={(e) => setAgreeToTerms(e.target.checked)} />}
                    label={
                        <span>
                            By checking this box, I agree to the <Link href="/terms" className="text-sky-600">Terms of Service</Link> & <Link href="/privacy" className="text-sky-600">Privacy Statement</Link>.
                        </span>
                    }
                />
                <Button type="button" variant="outlined" color="inherit" startIcon={<Google />} onClick={signupWithGoogle}>Sign Up With Google</Button>
                <Button type="submit" variant="contained" color="inherit" className="bg-[#5ABC61]! text-white!">Create An Account</Button>
            </Stack>
        </form>
    );
}
