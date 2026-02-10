import { Box, Typography, Card, CardContent } from "@mui/material";

export default function NikolasBioPage() {
  return (
    <Box
      sx={{minHeight: "100vh", display: "flex", justifyContent: "center", 
        alignItems: "center",backgroundColor: "#3630E3"}}
    >
      <Card sx={{ maxWidth: 600, padding: 2, backgroundColor: "#C4D9F2"}}>
        <CardContent>
          <Typography variant="h2" gutterBottom sx={{fontFamily: "latin"}}>
            Nick Posavec
          </Typography>

          <Typography variant="h4" color="text.secondary" gutterBottom
          sx={{fontFamily: "latin"}}>
            Engineer on the SeedMoney Project
          </Typography>

          <Typography variant="body1" sx={{fontFamily: "latin"}}>
            Hey! I&apos;m Nick, an engineer on the SeedMoney Project. 
            I&apos;m a freshman CS major at UMD and outside of school I like to 
            watch+play sports, workout, and hangout with my friends.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
