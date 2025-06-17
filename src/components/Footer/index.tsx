import { Container, Paper, Typography } from "@mui/material";

const Footer = () => {
  return (
    <Paper
      square
      component="footer"
      variant="outlined"
      sx={{
        py: 3,
        px: 2,
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" align="center">
          © {new Date().getFullYear()} Your Company Name. All rights reserved.
        </Typography>
      </Container>
    </Paper>
  );
};

export default Footer;
