import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "@/react-app/hooks/useGoogleAuth";
import HomePage from "@/react-app/pages/Home";
import PrivacyPolicy from "@/react-app/pages/PrivacyPolicy";
import TermsOfService from "@/react-app/pages/TermsOfService";
import ContactUs from "@/react-app/pages/ContactUs";
import ThankYou from "@/react-app/pages/ThankYou";
import SignUp from "@/react-app/pages/SignUp";
import Dashboard from "@/react-app/pages/Dashboard";
import Sitemap from "@/react-app/pages/Sitemap";
import Partners from "@/react-app/pages/Partners";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sitemap" element={<Sitemap />} />
          <Route path="/partners" element={<Partners />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
