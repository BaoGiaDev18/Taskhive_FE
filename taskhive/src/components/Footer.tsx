import { Link } from "react-router-dom";
import Logo from "../assets/Logo gốc trên nền đen.png";

const Footer = () => {
  return (
    <footer className="bg-[#191919] text-white py-16 px-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div>
          <img src={Logo} alt="TaskHive Logo" className="h-12 mb-6" />

          {/* Company Information */}
          <div className="mb-6 space-y-2">
            <div className="flex items-center space-x-2 text-gray-300">
              <svg
                className="w-4 h-4 text-orange-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-sm">Quận 9, Vietnam</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <svg
                className="w-4 h-4 text-orange-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <a
                href="mailto:TaskHive.freelancer@gmail.com"
                className="text-sm hover:text-orange-400 transition-colors"
              >
                TaskHive.freelancer@gmail.com
              </a>
            </div>
          </div>

          {/* Social Media */}
          <a
            href="https://www.facebook.com/profile.php?id=61576616729344"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 hover:text-orange-400 transition-colors"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Facebook_logo_36x36.svg/1024px-Facebook_logo_36x36.svg.png"
              alt="Facebook"
              className="h-6 rounded"
            />
            <span>Facebook</span>
          </a>
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
                to="/find-work"
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
