'use client';
import React from 'react';
import {Box, Card, CardContent, Container, Typography} from "@mui/material";
import Image from "next/image";
import signupImage from '@/src/public/signup_bg.png';
import Link from "next/link";
import SignupForm from "@/components/SignupForm";

export default function Page() {
    return (
        <Box className="relative">
            <Box className="absolute top-0 left-0 w-[993px] h-[799px]">
                <Image src={signupImage} alt="SeedMoney" fill />
            </Box>
            <Card elevation={0} className="absolute right-0 w-full max-w-[58rem] min-h-[799px] py-30">
                <CardContent>
                    <Container maxWidth="xs">
                        <Typography variant="h5">New to SeedMoney?</Typography>
                        <Typography color="rgba(0, 0, 0, 0.6)">Create an account so you can get started setting up your fundraising campaign.</Typography>
                        <Box className="py-4">
                            <SignupForm />
                        </Box>
                        <Typography color="rgba(0, 0, 0, 0.6)" textAlign="center">Already have an account? <Link href="/" className="font-bold text-sky-600">Log in here</Link>.</Typography>
                    </Container>
                </CardContent>
            </Card>
        </Box>
    );
}