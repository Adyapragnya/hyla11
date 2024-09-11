import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonInput from "components/ArgonInput";
import ArgonButton from "components/ArgonButton";
import IllustrationLayout from "layouts/authentication/components/IllustrationLayout";
import Swal from "sweetalert2";

const bgImage = "/HYLA-LBackground.png";
const logoImage = "/Hyla-logo.png"; // Replace with the path to your logo image

function Illustration() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Check credentials
    if (email === "hylauser@gmail.com" && password === "Hyla@12345") {
      // Show success alert and redirect
      await Swal.fire({
        title: "Success!",
        text: "You have successfully signed in.",
        icon: "success",
        confirmButtonText: "OK",
      });
      
      // Redirect to /Hyla2.0
      navigate("/Hyla2.0");
    } else {
      // Show error alert
      Swal.fire({
        title: "Error!",
        text: "Invalid email or password.",
        icon: "error",
        confirmButtonText: "Try Again",
      });
    }
  };

  return (
    <IllustrationLayout
      logo={logoImage} // Pass the logo prop
      title={<ArgonTypography variant="h3" color="white">HYLA</ArgonTypography>}
      description={<ArgonTypography variant="h6" color="white">Sign in with your email and password.</ArgonTypography>}
      illustration={{
        image: bgImage,
      }}
    >
      <ArgonBox component="form" role="form" onSubmit={handleSubmit}>
        <ArgonBox mb={2}>
          <ArgonInput
            type="email"
            placeholder="Email"
            size="large"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </ArgonBox>
        <ArgonBox mb={2}>
          <ArgonInput
            type="password"
            placeholder="Password"
            size="large"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </ArgonBox>
        <ArgonBox mt={4} mb={1}>
          <ArgonButton color="info" size="large" fullWidth type="submit">
            Sign In
          </ArgonButton>
        </ArgonBox>
        <ArgonBox mt={3} textAlign="center">
          <ArgonTypography variant="button" color="text" fontWeight="regular">
            Don&apos;t have an account?{" "}
            <ArgonTypography
              component={Link}
              to="/Hyla2.0"
              variant="button"
              color="info"
              fontWeight="medium"
            >
              Sign up
            </ArgonTypography>
          </ArgonTypography>
        </ArgonBox>
      </ArgonBox>
    </IllustrationLayout>
  );
}

export default Illustration;
