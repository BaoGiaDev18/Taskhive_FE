import { Link } from "react-router-dom";
import BGImage from "../assets/BGhome.jpg";
import Logo from "../assets/Logo gốc trên nền đen.png";
import homeimg4 from "../assets/homeimg4.jpg"; 
import homeimg5 from "../assets/homeimg5.jpg"; 
import homeimg6 from "../assets/homeimg6.jpg"; 
import homeimg7 from "../assets/homeimg7.jpg"; 
import hireimg1 from "../assets/hireimg1.jpg"; 
import facebook from "../assets/faceicon.jpg";

export default function HireFreelancerPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative h-screen bg-cover bg-center text-white flex flex-col justify-center items-center" style={{ backgroundImage: `linear-gradient(270deg, rgba(83, 83, 83, 0.86) 0%, rgba(25, 25, 25, 0.688) 33.5%, rgba(25, 25, 25, 0.86) 100%), url(${BGImage})` }}>
        <div className="max-w-4xl mx-auto px-6 space-y-6 text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-yellow-400 bg-clip-text text-transparent">
            Connect with the best job opportunities
          </h1>
          <p className="text-xl leading-relaxed">
            Need expert help? Discover top-rated freelancers for all your business needs. From design to development, find the right talent in minutes.
          </p>
          <button className="bg-gradient-to-r from-orange-500 to-yellow-400 text-black font-bold px-8 py-3 rounded-xl text-xl">
            Sign up now
          </button>
        </div>

        {/* 🔍 Trending + Search bar */}
        <div className="w-full flex flex-col items-center mt-12 px-4">
          <div className="max-w-4xl w-full text-white mb-4">
            <p className="text-sm mb-2">Trendings:</p>
            <div className="flex gap-3 flex-wrap">
              <span className="bg-white/20 text-white px-4 py-1 rounded-full text-sm">Logo design</span>
              <span className="bg-white/20 text-white px-4 py-1 rounded-full text-sm">Website design</span>
              <span className="bg-white/20 text-white px-4 py-1 rounded-full text-sm">Image editing</span>
            </div>
          </div>

          <div className="max-w-4xl w-full">
            <div className="flex items-center bg-white rounded-full shadow-lg px-6 py-4">
              <svg className="w-5 h-5 text-gray-600 mr-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 2a8 8 0 105.293 14.293l5.707 5.707-1.414 1.414-5.707-5.707A8 8 0 0010 2zm0 2a6 6 0 110 12A6 6 0 0110 4z" />
              </svg>
              <input
                type="text"
                placeholder="What are you looking for?"
                className="w-full outline-none text-gray-800 placeholder-gray-500 bg-transparent"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How to Hire Section */}
<section className="bg-white py-20 px-6">
  <div className="max-w-6xl mx-auto border-2 rounded-lg overflow-hidden shadow-lg grid grid-cols-1 md:grid-cols-2">
    {/* Left content */}
    <div className="p-10">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Hire?</h2>

      <div className="mb-6">
        <h4 className="text-orange-500 font-semibold text-lg mb-1">Post a Job</h4>
        <p className="text-gray-700">
          Describe your project, set a budget, and attract top freelancers.
        </p>
      </div>

      <div className="mb-6">
        <h4 className="text-orange-500 font-semibold text-lg mb-1">Review & Hire</h4>
        <p className="text-gray-700">
          Compare proposals, check freelancer ratings, and select the best match.
        </p>
      </div>

      <div>
        <h4 className="text-orange-500 font-semibold text-lg mb-1">Work & Pay Securely</h4>
        <p className="text-gray-700">
          Collaborate efficiently and complete payments with confidence.
        </p>
      </div>
    </div>

    {/* Right image */}
    <div className="w-full h-full">
      <img
        src={hireimg1}
        alt="How to Hire"
        className="w-full h-full object-cover"
      />
    </div>
  </div>
</section>

      {/* Explore Categories */}
<section className="bg-white py-20 px-6 max-w-7xl mx-auto">
  <h2 className="text-3xl font-bold text-gray-900 mb-8">Explore Categories</h2>

  <div>
    <h3 className="text-xl font-semibold text-gray-800 mb-4">Web Developer</h3>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      <div>
        <img src={homeimg4} alt="Frontend Dev" className="rounded-lg" />
        <p className="mt-2 font-medium text-sm">Frontend Development</p>
      </div>
      <div>
        <img src={homeimg5} alt="Backend Dev" className="rounded-lg" />
        <p className="mt-2 font-medium text-sm">Backend Development</p>
      </div>
      <div>
        <img src={homeimg6} alt="E-commerce" className="rounded-lg" />
        <p className="mt-2 font-medium text-sm">E-commerce Solutions</p>
      </div>
      <div>
        <img src={homeimg7} alt="CMS" className="rounded-lg" />
        <p className="mt-2 font-medium text-sm">WordPress & CMS</p>
      </div>
    </div>
    <p className="text-orange-500 mt-2 text-sm text-right">Details →</p>
  </div>
</section>

{/* Our Service */}
<section className="bg-gradient-to-br from-white via-[#FFF2E2] to-white py-20 px-6">
  <div className="max-w-7xl mx-auto">
    <h2 className="text-3xl font-bold text-gray-900 mb-12">Our Service</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-gray-800">
      <div>
        <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
          💲 Secure Payment
        </h4>
        <p>Enjoy a safe and reliable payment system that protects both parties.</p>
      </div>
      <div>
        <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
          🧑‍💼 Freelancer Marketplace
        </h4>
        <p>Connect with top professionals across various industries for your projects.</p>
      </div>
      <div>
        <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
          🔄 Flexible Hiring
        </h4>
        <p>Hire freelancers per project or hourly, tailored to your business needs.</p>
      </div>
      <div>
        <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
          ✅ Quality Assurance
        </h4>
        <p>Verified services ensure trust and high-quality work delivery.</p>
      </div>
    </div>
    <div className="text-center mt-12">
      <button className="px-8 py-3 border border-orange-400 text-orange-500 font-semibold rounded-full hover:bg-orange-50">
        Browse more
      </button>
    </div>
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
              <li><Link to="/how-to-hire" className="text-white">How to Hire</Link></li>
              <li><Link to="/project-catalog" className="text-white">Project Catalog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-3">For Talents</h4>
            <ul className="space-y-2">
              <li><Link to="/how-to-find-work" className="text-white">How to find work</Link></li>
              <li><Link to="/freelance-jobs" className="text-white">Freelance Jobs in HCM</Link></li>
              <li><Link to="/ads" className="text-white">Win work with ads</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-3">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-white">About Us</Link></li>
              <li><Link to="/leadership" className="text-white">Leadership</Link></li>
              <li><Link to="/careers" className="text-white">Careers</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white mt-12 pt-6 text-sm flex justify-between">
          <p>© 2024 - 2025 TaskHive® Global Inc.</p>
          <div className="space-x-6">
            <Link to="/terms" className="text-white">Terms of Service</Link>
            <Link to="/privacy" className="text-white">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
