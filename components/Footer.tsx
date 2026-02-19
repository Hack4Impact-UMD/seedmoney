'use client'
import { Box, Container, Typography, Link, Divider, Stack} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { Lato } from 'next/font/google';

const lato = Lato({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export default function Footer() {

  const linkStyle = {
    color: '#EEEEEE',
    fontFamily: lato.style.fontFamily,
    textDecoration: 'none',
    fontSize: '12px'
  }

  return (
    <Box component="footer" sx={{ bgcolor: '#333333', color: '#EEEEEE', fontFamily: lato.style.fontFamily}}>
      <Container>
        <Divider sx={{ "&::before, &::after": {borderColor: '#525252'}, pt: 3}}> <StarIcon fontSize='small' /> </Divider>

        <Box sx={{display: 'flex', justifyContent: 'center', position: 'relative', mb: 1, minHeight: '120px'}}>
          <Box sx={{position: 'absolute', right: 'calc(50% + 130px)', textAlign:'left'}}>
            <Typography sx={{color: '#76b852', fontWeight: 'bold', mb: 1, mt: 2, fontSize: '12px'}}>SeedMoney</Typography>
            <Stack spacing={0.5} sx={{mb: 2}}>
              <Link onClick={() => console.log('Navigate -> /')} sx={linkStyle}>Home</Link>
              <Link onClick={() => console.log('Navigate -> /contact')} sx={linkStyle}>Contact</Link>
              <Link onClick={() => console.log('Navigate -> /faq')} sx={linkStyle}>FAQ</Link>
            </Stack>
          </Box>
          <Box sx={{textAlign: 'left', position: 'absolute', left: 'calc(50% + 10px)'}}>
            <Typography sx={{color: '#76b852', fontWeight: 'bold', mb: 1, mt: 2, fontSize: '12px'}}>Need help?</Typography>
            <Stack spacing={0.5} sx={{mb: 2}}>
              <Link onClick={() => console.log('Navigate -> /faq')} sx={linkStyle}>FAQ</Link>
              <Link onClick={() => console.log('Navigate -> /terms')} sx={linkStyle}>Terms</Link>
              <Link onClick={() => console.log('Navigate -> /privacy')} sx={linkStyle}>Privacy Policy</Link>
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ bgcolor: "#525252", mb: 2}} />
        <Typography variant="body2" align="center" sx={{color: '#EEEEEE', fontFamily: lato.style.fontFamily, pb: 2}} >
          © {new Date().getFullYear()} SeedMoney All Rights Reserved.
        </Typography>
      </Container>
    </Box>
  )
}