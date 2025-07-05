import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import BGImage from "../assets/BGhome.jpg";
import Logo from "../assets/Logo gốc trên nền đen.png";
import homeimg1 from "../assets/homeimg.jpg";
import facebook from "../assets/faceicon.jpg";
import aboutimg1 from "../assets/aboutimg1.jpg";
import aboutimg2 from "../assets/aboutimg2.jpg";
import aboutimg3 from "../assets/aboutimg3.jpg";
import aboutimg4 from "../assets/aboutimg4.jpg";
import aboutimg5 from "../assets/aboutimg5.jpg";
import api from "../services/api";

interface UserProfile {
  fullName: string;
  imageUrl?: string;
  role?: string;
  email?: string;
}

export default function WhyTaskhivePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      setIsLoggedIn(true);
      api
        .get("/api/User/me")
        .then((res) => {
          setUser(res.data);
        })
        .catch(() => {
          setUser(null);
          setIsLoggedIn(false);
          localStorage.removeItem("jwtToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("tokenExpiresAt");
        });
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  return (
    <div className=" bg-white">
      <section
        className="relative h-screen bg-cover bg-center text-white flex items-center"
        style={{
          backgroundImage: `linear-gradient(270deg, rgba(83, 83, 83, 0.86) 0%, rgba(25, 25, 25, 0.688) 33.5%, rgba(25, 25, 25, 0.86) 100%), url(${BGImage})`,
        }}
      >
        <div className="max-w-4xl mx-auto px-6 space-y-6">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-yellow-400 bg-clip-text text-transparent">
            Connect with the best job opportunities
          </h1>
          <p className="text-xl leading-relaxed">
            Need expert help? Discover top-rated freelancers for all your
            business needs. From design to development, find the right talent in
            minutes.
          </p>
          {!isLoggedIn && (
            <Link
              to="/register"
              className="inline-block bg-gradient-to-r from-orange-500 to-yellow-400 text-black font-bold px-8 py-3 rounded-xl text-xl hover:opacity-90 transition-opacity"
            >
              Sign up now
            </Link>
          )}
        </div>
      </section>

      <section className="bg-[#1a1a1a] text-yellow-400 font-semibold text-sm md:text-base h-20 px-6 flex items-center justify-center">
        <div className="flex flex-wrap justify-between items-center gap-6 w-full max-w-7xl mx-auto text-center">
          <span>Find top talents</span>
          <span>Post a job easily</span>
          <span>Secure & fast payments</span>
          <span>Work with professionals</span>
        </div>
      </section>

      <section className="w-full bg-[#FFF5E9] py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-12">
          {/* Left Images */}
          <div className="relative w-full md:w-1/2 h-[300px]">
            <img
              src={homeimg1}
              alt="Person smiling"
              className="absolute top-0 left-0 w-60 h-40 object-cover rounded-xl shadow-lg"
            />
            <img
              src={aboutimg5}
              alt="Teamwork"
              className="absolute bottom-0 left-12 w-72 h-48 object-cover rounded-xl shadow-lg"
            />
          </div>

          {/* Right Text */}
          <div className="w-full md:w-1/2 space-y-5">
            <h2 className="text-3xl font-bold text-gray-900">About us</h2>
            <p className="text-lg font-semibold text-gray-800">
              Connecting talent with opportunities.
            </p>
            <p className="text-gray-700">
              TaskHive is a dynamic job marketplace designed to connect
              professionals with companies seeking their expertise. Whether
              you’re a freelancer or a business, we make hiring and finding work
              effortless and secure.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Our Service
          </h2>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Top Left Image */}
            <img
              src={aboutimg3}
              className="w-full h-auto rounded-xl object-cover"
              alt="Freelancer working"
            />

            {/* Top Right Content */}
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="text-yellow-600 text-xl mt-1">💲</div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">
                    Competitive Rates
                  </h4>
                  <p className="text-gray-700">
                    Enjoy affordable pricing with top-quality freelance
                    services. Our platform ensures you get the best value for
                    your money while maintaining industry standards.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="text-yellow-600 text-xl mt-1">📝</div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">
                    Verified Professionals
                  </h4>
                  <p className="text-gray-700">
                    Connect with highly skilled freelancers who have been
                    carefully vetted. Every expert is reviewed and rated to
                    ensure top-tier service for your projects.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Left Content */}
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="text-yellow-600 text-xl mt-1">📋</div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">
                    Efficient Project Management
                  </h4>
                  <p className="text-gray-700">
                    Manage your freelance projects with ease using our
                    streamlined workflow. Keep track of progress, communicate
                    effectively, and achieve better results.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="text-yellow-600 text-xl mt-1">🔒</div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">
                    Secure Transactions
                  </h4>
                  <p className="text-gray-700">
                    Your payments and personal data are fully protected with our
                    advanced security measures. Work confidently, knowing your
                    information is safe.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Right Image */}
            <img
              src={aboutimg4}
              className="w-full h-auto rounded-xl object-cover"
              alt="Freelancer thinking"
            />
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-white to-[#FFF6EA] py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">About us</h2>
          <p className="text-gray-700 mb-10">
            At TaskHive, we connect businesses with top-tier freelancers
            worldwide. Our mission is to create a seamless platform where
            professionals and employers collaborate efficiently, ensuring
            quality and success.
          </p>
          <img
            src={aboutimg2}
            alt="People collaborating"
            className="w-full max-h-[400px] object-cover rounded-xl mx-auto"
          />
        </div>
      </section>

      <section
        className="relative bg-cover bg-center text-white flex items-center py-24 px-6"
        style={{
          backgroundImage: `linear-gradient(270deg, rgba(83, 83, 83, 0.86) 0%, rgba(25, 25, 25, 0.688) 33.5%, rgba(25, 25, 25, 0.86) 100%), url(${aboutimg1})`,
        }}
      >
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-4xl font-bold">Why Choose TaskHive?</h2>
          <p className="text-lg">
            Find top freelancers and grow your business effortlessly.
          </p>
          <ul className="space-y-2 text-white">
            <li className="flex items-start">
              <span className="mr-2 text-yellow-400 text-lg mt-1">✔</span>
              Vetted Professionals – Work with skilled and verified experts
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-yellow-400 text-lg mt-1">✔</span>
              Seamless Collaboration – Manage projects with ease
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-yellow-400 text-lg mt-1">✔</span>
              Fast & Secure Payments – Safe transactions, guaranteed
            </li>
          </ul>
          {!isLoggedIn ? (
            <Link
              to="/register"
              className="inline-block bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-8 py-3 rounded-xl text-lg mt-4 transition-colors"
            >
              Get Started
            </Link>
          ) : (
            <div className="mt-4">
              {user?.role === "Freelancer" ? (
                <Link
                  to="/find-work"
                  className="inline-block bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-8 py-3 rounded-xl text-lg transition-colors"
                >
                  Find Work
                </Link>
              ) : user?.role === "Client" ? (
                <Link
                  to="/hirefreelancer"
                  className="inline-block bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-8 py-3 rounded-xl text-lg transition-colors"
                >
                  Hire Freelancer
                </Link>
              ) : (
                <Link
                  to="/find-work"
                  className="inline-block bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-8 py-3 rounded-xl text-lg transition-colors"
                >
                  Explore Jobs
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

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
                <Link to="/how-to-hire" className="text-white">
                  How to Hire
                </Link>
              </li>
              <li>
                <Link to="/project-catalog" className="text-white">
                  Project Catalog
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-3">For Talents</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/how-to-find-work" className="text-white">
                  How to find work
                </Link>
              </li>
              <li>
                <Link to="/freelance-jobs" className="text-white">
                  Freelance Jobs in HCM
                </Link>
              </li>
              <li>
                <Link to="/ads" className="text-white">
                  Win work with ads
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-3">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/leadership" className="text-white">
                  Leadership
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-white">
                  Careers
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white mt-12 pt-6 text-sm flex justify-between">
          <p>© 2024 - 2025 TaskHive® Global Inc.</p>
          <div className="space-x-6">
            <Link to="/terms" className="text-white">
              Terms of Service
            </Link>
            <Link to="/privacy" className="text-white">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
