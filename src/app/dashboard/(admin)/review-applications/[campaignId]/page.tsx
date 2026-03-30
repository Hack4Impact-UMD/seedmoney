import React from 'react';
import {reviewApplications} from "@/src/app/dashboard/(admin)/review-applications/mockReviewApplications";
import {notFound} from "next/navigation";
import {Card, CardContent, Stack, TextField, Typography} from "@mui/material";

export default async function Page({ params }: { params: Promise<{ campaignId: string }> }) {

    const { campaignId } = await params;

    const application = reviewApplications.find(((a) => a.campaignId === parseInt(campaignId)));

    if (!application) {
        notFound();
    }

    return (
        <Stack direction="column" spacing={4}>
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6" gutterBottom>Campaign Title</Typography>
                    <Typography gutterBottom>The name of your garden e.g. Fairview Community Garden, Pleasantville Primary School Garden, Holy Jalapeno Church Garden, etc.</Typography>
                    <TextField fullWidth variant="standard" label="Campaign Title" disabled value={application.campaignTitle} />
                </CardContent>
            </Card>
        </Stack>
    );
}