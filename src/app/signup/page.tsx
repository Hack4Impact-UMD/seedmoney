'use client';
import React from 'react';
import {Box, Card, CardContent, Container, Grid, Typography} from "@mui/material";
import Image from "next/image";
import signupImage from '@/src/public/signup_bg.png';
import Link from "next/link";
import SignupForm from "@/components/SignupForm";
import LoginNavbar from "@/src/components/LoginNavbar";


export default function Page() {
    return (
      
        <LoginNavbar />;
      
        <Grid container columns={2} className="min-h-screen">
            <Grid size={{ xs: 0, xl: 1 }} className="hidden xl:block">
                <Box className="relative min-h-screen w-full">
                    <Image
                        src={signupImage}
                        alt="SeedMoney"
                        fill
                        priority
                        sizes="(min-width: 1280px) 50vw, 100vw"
                        className="object-cover"
                    />
                </Box>
            </Grid>
            <Grid size={{ xs: 2, xl: 1 }} className="flex min-h-screen items-center">
                <Card elevation={0} className="w-full py-10">
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
            </Grid>

        </Grid>
    );
}
