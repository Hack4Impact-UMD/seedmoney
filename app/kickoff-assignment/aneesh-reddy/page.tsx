'use client';
import React from 'react';
import {Button, Card, CardContent, Container, Divider, Typography} from "@mui/material";

export default function Page() {
    return (
        <Container maxWidth="lg" className="mt-8">
            <Card>
                <CardContent>
                    <Typography variant="h1" textAlign="center">Aneesh Reddy</Typography>
                    <Typography variant="h5" textAlign="center" gutterBottom>Engineer @ SeedMoney</Typography>
                    <Divider className="my-2" />
                    <Typography gutterBottom>Hello! I am <b>Aneesh</b> and I am an engineer on the SeedMoney team for Hack4Impact!</Typography>
                    <Button variant="contained" size="large" color="secondary">Do Absolutely Nothing</Button>
                </CardContent>
            </Card>
        </Container>
    );
}