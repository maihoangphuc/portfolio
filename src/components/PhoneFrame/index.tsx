import { Box } from "@mui/material";

interface PhoneFrameProps {
  videoUrl: string;
}

const PhoneFrame = ({ videoUrl }: PhoneFrameProps) => {
  return (
    <Box
      sx={{
        position: "relative",
        width: "300px",
        height: "600px",
        margin: "0 auto",
      }}
    >
      {/* iPhone Frame */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          backgroundColor: "#1a1a1a",
          borderRadius: "50px",
          padding: "10px",
          boxShadow: "0 0 20px rgba(0,0,0,0.3)",
          border: "8px solid #2c2c2c",
        }}
      >
        {/* Notch */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "150px",
            height: "25px",
            backgroundColor: "#1a1a1a",
            borderBottomLeftRadius: "20px",
            borderBottomRightRadius: "20px",
            zIndex: 2,
          }}
        />

        {/* Screen */}
        <Box
          sx={{
            width: "100%",
            height: "100%",
            borderRadius: "40px",
            overflow: "hidden",
            position: "relative",
            backgroundColor: "#000",
          }}
        >
          {/* Video */}
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </Box>
      </Box>
    </Box>
  );
};

export default PhoneFrame;
