import { Link } from "react-router-dom";
import Logo from "../assets/Logo gốc trên nền đen.png";
import facebook from "../assets/faceicon.jpg";

const Footer = () => {
  return (
    <footer className="bg-[#191919] text-white py-16 px-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div>
          <img src={Logo} alt="TaskHive Logo" className="h-12 mb-6" />
          <div className="flex space-x-4">
            <img src={facebook} alt="fb" className="h-6" />
            <img src="/twitter-icon.png" alt="twitter" className="h-6" />
            <img src="/linkedin-icon.png" alt="linkedin" className="h-6" />
          </div>
        </div>
        <div>
          <h4 className="font-bold text-lg mb-3">For Clients</h4>
          <ul className="space-y-2">
            <li>
              <Link
                to="/how-to-hire"
                className="text-white hover:text-orange-400"
              >
                How to Hire
              </Link>
            </li>
            <li>
              <Link
                to="/project-catalog"
                className="text-white hover:text-orange-400"
              >
                Project Catalog
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-lg mb-3">For Talents</h4>
          <ul className="space-y-2">
            <li>
              <Link
                to="/how-to-find-work"
                className="text-white hover:text-orange-400"
              >
                How to find work
              </Link>
            </li>
            <li>
              <Link
                to="/freelance-jobs"
                className="text-white hover:text-orange-400"
              >
                Freelance Jobs in HCM
              </Link>
            </li>
            <li>
              <Link to="/ads" className="text-white hover:text-orange-400">
                Win work with ads
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-lg mb-3">Company</h4>
          <ul className="space-y-2">
            <li>
              <Link to="/about" className="text-white hover:text-orange-400">
                About Us
              </Link>
            </li>
            <li>
              <Link
                to="/leadership"
                className="text-white hover:text-orange-400"
              >
                Leadership
              </Link>
            </li>
            <li>
              <Link to="/careers" className="text-white hover:text-orange-400">
                Careers
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white mt-12 pt-6 text-sm flex justify-between">
        <p>© 2024 - 2025 TaskHive® Global Inc.</p>
        <div className="space-x-6">
          <Link to="/terms" className="text-white hover:text-orange-400">
            Terms of Service
          </Link>
          <Link to="/privacy" className="text-white hover:text-orange-400">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
