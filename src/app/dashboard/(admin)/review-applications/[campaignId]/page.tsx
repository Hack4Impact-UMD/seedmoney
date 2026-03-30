import React from 'react';
import {reviewApplications} from "@/src/app/dashboard/(admin)/review-applications/mockReviewApplications";
import {notFound} from "next/navigation";
import {
    Box, Button,
    Card, CardContent,
    Checkbox, Chip, FormControl, FormControlLabel, MenuItem, Radio, RadioGroup, Stack, TextField, Typography
} from "@mui/material";

export default async function Page({ params }: { params: Promise<{ campaignId: string }> }) {

    const { campaignId } = await params;

    const application = reviewApplications.find(((a) => a.campaignId === parseInt(campaignId)));

    if (!application) {
        notFound();
    }

    return (
        <Stack direction="column" spacing={4} className="p-4">
            <Typography variant="h5" fontWeight="bold">Campaign Information</Typography>
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>Campaign Title</Typography>
                    <Typography gutterBottom>The name of your garden e.g. Fairview Community Garden, Pleasantville Primary School Garden, Holy Jalapeno Church Garden, etc.</Typography>
                    <TextField fullWidth type="text" variant="standard" label="Campaign Title" value={application.campaignTitle} />
                </CardContent>
            </Card>
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>Project Details & Impact</Typography>
                    <TextField fullWidth type="number" variant="standard" label="About how many people will benefit from this garden this year?" value="250" />
                    <Box className="my-2">
                        <FormControl>
                            <Typography variant="h6">Is this a new or existing garden?</Typography>
                            <RadioGroup>
                                <FormControlLabel value="new" control={<Radio />} label="New Garden" />
                                <FormControlLabel value="existing" control={<Radio />} label="Existing Garden" />
                            </RadioGroup>
                        </FormControl>
                    </Box>
                </CardContent>
            </Card>
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>Fundraising Goal</Typography>
                    <Typography gutterBottom>Most SeedMoney projects set goals between $500 and $5,000</Typography>
                    <TextField fullWidth type="number" variant="standard" label="Fundraising Goal (USD)" value="600" />
                </CardContent>
            </Card>
            <Typography variant="h5" fontWeight="bold">Garden Information</Typography>
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>Garden Location</Typography>
                    <Stack direction="column" spacing={2}>
                        <TextField fullWidth type="text" variant="standard" label="City" value="Scarborough" />
                        <TextField fullWidth type="text" variant="standard" label="State / Province" value="me" select>
                            <MenuItem value="me">Maine</MenuItem>
                        </TextField>
                        <TextField fullWidth type="text" variant="standard" label="Country" value="us" select>
                            <MenuItem value="us">United States</MenuItem>
                        </TextField>
                    </Stack>
                </CardContent>
            </Card>
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>Primary Project Category</Typography>
                    <Box className="mt-2">
                        <FormControl>
                            <Typography variant="h6">Select one:</Typography>
                            <RadioGroup>
                                <FormControlLabel value="0" control={<Radio />} label="Community Garden" />
                                <FormControlLabel value="1" control={<Radio />} label="School or Youth Garden" />
                                <FormControlLabel value="2" control={<Radio />} label="Food Pantry or Food Bank Garden" />
                                <FormControlLabel value="3" control={<Radio />} label="Urban Farm" />
                                <FormControlLabel value="4" control={<Radio />} label="Refugee or Immigrant Garden" />
                                <FormControlLabel value="5" control={<Radio />} label="Tribal or Indigenous Garden Project" />
                                <FormControlLabel value="6" control={<Radio />} label="Shelter or Transitional Housing Garden" />
                                <FormControlLabel value="7" control={<Radio />} label="Therapeutic or Healing Garden" />
                                <FormControlLabel value="8" control={<Radio />} label="Job Training or Vocational Garden" />
                                <FormControlLabel value="9" control={<Radio />} label="Demonstration or Education Garden" />
                                <FormControlLabel value="10" control={<Radio />} label="Multi-Site Garden Program" />
                                <FormControlLabel value="11" control={<Radio />} label="Other (please specify)" />
                            </RadioGroup>
                        </FormControl>
                    </Box>
                </CardContent>
            </Card>
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>Beneficiary Populations Served</Typography>
                    <Box className="mt-2">
                        <FormControl>
                            <Typography variant="h6">Select all that apply:</Typography>
                            <FormControlLabel value="0" control={<Checkbox />} label="Children (ages 0-12)" />
                            <FormControlLabel value="1" control={<Checkbox />} label="Youth / Adolescents (ages 13-18)" />
                            <FormControlLabel value="2" control={<Checkbox />} label="Families" />
                            <FormControlLabel value="3" control={<Checkbox />} label="Seniors / Older adults" />
                            <FormControlLabel value="4" control={<Checkbox />} label="Low-income individuals or households" />
                            <FormControlLabel value="5" control={<Checkbox />} label="Food-insecure individuals or households" />
                            <FormControlLabel value="6" control={<Checkbox />} label="Immigrants and refugees" />
                            <FormControlLabel value="7" control={<Checkbox />} label="Indigenous / Native communities" />
                            <FormControlLabel value="8" control={<Checkbox />} label="People with disabilities" />
                            <FormControlLabel value="9" control={<Checkbox />} label="Veterans and military families" />
                            <FormControlLabel value="10" control={<Checkbox />} label="People experiencing homelessness or housing insecurity" />
                            <FormControlLabel value="11" control={<Checkbox />} label="Unemployed or underemployed individuals" />
                            <FormControlLabel value="12" control={<Checkbox />} label="Justice-involved individuals" />
                            <FormControlLabel value="13" control={<Checkbox />} label="Rural communities" />
                            <FormControlLabel value="14" control={<Checkbox />} label="Urban communities" />
                            <FormControlLabel value="15" control={<Checkbox />} label="Other (please specify)" />
                        </FormControl>
                    </Box>
                </CardContent>
            </Card>
            <Typography variant="h5" fontWeight="bold">Garden Story</Typography>
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6" fontWeight="bold">Garden Story</Typography>
                    <Typography variant="subtitle2" className="pb-2">2-3 sentences each</Typography>
                    <Typography fontWeight="bold" gutterBottom>Where is your garden, and who does it serve?</Typography>
                    <Stack direction="column" spacing={2}>
                        <Stack direction="row" spacing={1}>
                            <Box className="w-45">
                                <Chip variant="outlined" label="Original Version"/>
                            </Box>
                            <TextField multiline fullWidth type="text" variant="standard" value="The Full Belly Community Garden in Scarborough, Maine, provide over 300 pounds of produce annually to local food-insecure families and seniors. Beyond its harvest, it serves as an education hub for at-risk youth and neighbors through nature exploration and hands-on workshops." />
                        </Stack>
                        <Stack direction="row" spacing={1}>
                            <Box className="w-45">
                                <Chip variant="outlined" label="AI Polished Version"/>
                            </Box>
                            <TextField multiline fullWidth type="text" variant="standard" value="The Full Belly Community Garden in Scarborough, Maine, provide over 300 pounds of produce annually to local food-insecure families and seniors. Beyond its harvest, it serves as an education hub for at-risk youth and neighbors through nature exploration and hands-on workshops." />
                        </Stack>
                        <Stack direction="row" spacing={1}>
                            <Box className="w-45">
                                <Chip variant="outlined" label="Final Version" />
                            </Box>
                            <TextField multiline fullWidth type="text" variant="standard" value="The Full Belly Community Garden in Scarborough, Maine, provide over 300 pounds of produce annually to local food-insecure families and seniors. Beyond its harvest, it serves as an education hub for at-risk youth and neighbors through nature exploration and hands-on workshops." />
                        </Stack>
                        <Stack alignItems="flex-end">
                            <Box>
                                <Button variant="outlined" size="small">Save</Button>
                            </Box>
                        </Stack>
                    </Stack>
                    <Typography fontWeight="bold" gutterBottom>What challenge does your garden help address, and why does it matter locally?</Typography>
                    <Stack direction="column" spacing={2}>
                        <Stack direction="row" spacing={1}>
                            <Box className="w-45">
                                <Chip variant="outlined" label="Original Version"/>
                            </Box>
                            <TextField multiline fullWidth type="text" variant="standard" value="The Full Belly Community Garden addresses the challenge of food insecurity, specifically the difficulty many local families and seniors face in accessing fresh, affordable organic produce." />
                        </Stack>
                        <Stack direction="row" spacing={1}>
                            <Box className="w-45">
                                <Chip variant="outlined" label="AI Polished Version"/>
                            </Box>
                            <TextField multiline fullWidth type="text" variant="standard" value="The Full Belly Community Garden addresses the challenge of food insecurity, specifically the difficulty many local families and seniors face in accessing fresh, affordable organic produce." />
                        </Stack>
                        <Stack direction="row" spacing={1}>
                            <Box className="w-45">
                                <Chip variant="outlined" label="Final Version" />
                            </Box>
                            <TextField multiline fullWidth type="text" variant="standard" value="The Full Belly Community Garden addresses the challenge of food insecurity, specifically the difficulty many local families and seniors face in accessing fresh, affordable organic produce." />
                        </Stack>
                        <Stack alignItems="flex-end">
                            <Box>
                                <Button variant="outlined" size="small">Save</Button>
                            </Box>
                        </Stack>
                    </Stack>
                    <Typography fontWeight="bold" gutterBottom>What happens in the garden during the growing season?</Typography>
                    <Stack direction="column" spacing={2}>
                        <Stack direction="row" spacing={1}>
                            <Box className="w-45">
                                <Chip variant="outlined" label="Original Version"/>
                            </Box>
                            <TextField multiline fullWidth type="text" variant="standard" value="During the growing season, it serves as a 'vibrant oasis'' where volunteers host monthly workshops to teach gardening skills and provide a safe space for at-risk youth to explore nature." />
                        </Stack>
                        <Stack direction="row" spacing={1}>
                            <Box className="w-45">
                                <Chip variant="outlined" label="AI Polished Version"/>
                            </Box>
                            <TextField multiline fullWidth type="text" variant="standard" value="During the growing season, it serves as a 'vibrant oasis' where volunteers host monthly workshops to teach gardening skills and provide a safe space for at-risk youth to explore nature." />
                        </Stack>
                        <Stack direction="row" spacing={1}>
                            <Box className="w-45">
                                <Chip variant="outlined" label="Final Version" />
                            </Box>
                            <TextField multiline fullWidth type="text" variant="standard" value="During the growing season, it serves as a 'vibrant oasis'' where volunteers host monthly workshops to teach gardening skills and provide a safe space for at-risk youth to explore nature." />
                        </Stack>
                        <Stack alignItems="flex-end">
                            <Box>
                                <Button disabled variant="outlined" size="small">Save</Button>
                            </Box>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>Main Photo</Typography>
                    <Typography variant="subtitle2" className="pb-2">Upload one clear, high-quality photo that best represents your project. This photo will appear at the top of your campaign page.</Typography>
                    <Typography variant="caption" fontWeight="bold">**DISPLAY MAIN PHOTO HERE**</Typography>
                </CardContent>
            </Card>
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>Supporting Photos</Typography>
                    <Typography variant="subtitle2" className="pb-2">You may upload up to five additional photos that help tell your garden’s story.
                        <br/>*Please choose real, authentic photos of your project — for example, people working in the garden, harvesting food, learning together, or the garden space itself.
                        <br/>*Do not upload logos, flyers, graphics, or AI-generated images. These photos should reflect real people and real places connected to your project.</Typography>
                    <Typography variant="caption" fontWeight="bold">**PHOTOS DISPLAY HERE**</Typography>
                </CardContent>
            </Card>
            <Typography variant="h5" fontWeight="bold">Contact Information</Typography>
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>Organization Information</Typography>
                    <Stack direction="column" spacing={2}>
                        <TextField fullWidth type="text" variant="standard" label="Legal Name of Beneficiary Organzation" value="Fully Belly Community Garden" />
                        <TextField fullWidth type="text" variant="standard" label="EIN or Public-Sector Identifier" value="Fully Belly Community Garden" />
                    </Stack>
                </CardContent>
            </Card>
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>Beneficiary Organization Mailing Address</Typography>
                    <Stack direction="column" spacing={2}>
                        <TextField fullWidth type="text" variant="standard" label="Street 1" value="123 Scarborough Dr" />
                        <TextField fullWidth type="text" variant="standard" label="Street 2" value="" />
                        <TextField fullWidth type="text" variant="standard" label="City" value="Scarborough" />
                        <TextField fullWidth type="text" variant="standard" label="State / Province" value="me" select>
                            <MenuItem value="me">Maine</MenuItem>
                        </TextField>
                        <TextField fullWidth type="number" variant="standard" label="ZIP/Postal Code" value="98921" />
                        <TextField fullWidth type="text" variant="standard" label="Country" value="us" select>
                            <MenuItem value="us">United States</MenuItem>
                        </TextField>
                    </Stack>
                </CardContent>
            </Card>
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>Primary Contact Information</Typography>
                    <Stack direction="column" spacing={2}>
                        <TextField fullWidth type="text" variant="standard" label="First Name" value="Roger" />
                        <TextField fullWidth type="text" variant="standard" label="Last Name" value="Doiron" />
                        <TextField fullWidth type="email" variant="standard" label="Email" value="rogerdoiron@gmail.com" />
                        <TextField fullWidth type="text" variant="standard" label="Role or Title" value="Director" />
                    </Stack>
                </CardContent>
            </Card>
        </Stack>

    );
}