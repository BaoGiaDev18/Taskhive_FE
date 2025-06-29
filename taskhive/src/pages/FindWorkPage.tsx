import JobCard from "../components/JobCard";
import hireimg1 from "../assets/hireimg1.jpg";
import BGImage from "../assets/BGhome.jpg";
import { Link } from "react-router-dom";
import Logo from "../assets/Logo gốc trên nền đen.png";
import facebook from "../assets/faceicon.jpg";
import { useState } from "react";
import CategoryFilter from "../components/CategoryFilter";

const FindWork = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  return (
    <div className="bg-white">
      {/* Hero */}
      <section
        className="relative h-screen bg-cover bg-center text-white flex flex-col justify-center items-center"
        style={{
          backgroundImage: `linear-gradient(270deg, rgba(83, 83, 83, 0.86) 0%, rgba(25, 25, 25, 0.688) 33.5%, rgba(25, 25, 25, 0.86) 100%), url(${BGImage})`,
        }}
      >
        <div className="max-w-4xl mx-auto px-6 space-y-6 text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-yellow-400 bg-clip-text text-transparent">
            Connect with the best job opportunities
          </h1>
          <p className="text-xl leading-relaxed">
            Need expert help? Discover top-rated freelancers for all your
            business needs. From design to development, find the right talent in
            minutes.
          </p>
          <button className="bg-gradient-to-r from-orange-500 to-yellow-400 text-black font-bold px-8 py-3 rounded-xl text-xl">
            Sign up now
          </button>
        </div>
      </section>

      {/* How to Hire Section */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-6xl mx-auto border-2 rounded-lg overflow-hidden shadow-lg grid grid-cols-1 md:grid-cols-2">
          {/* Left content */}
          <div className="p-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              How to Hire?
            </h2>

            <div className="mb-6">
              <h4 className="text-orange-500 font-semibold text-lg mb-1">
                Post a Job
              </h4>
              <p className="text-gray-700">
                Describe your project, set a budget, and attract top
                freelancers.
              </p>
            </div>

            <div className="mb-6">
              <h4 className="text-orange-500 font-semibold text-lg mb-1">
                Review & Hire
              </h4>
              <p className="text-gray-700">
                Compare proposals, check freelancer ratings, and select the best
                match.
              </p>
            </div>

            <div>
              <h4 className="text-orange-500 font-semibold text-lg mb-1">
                Work & Pay Securely
              </h4>
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

      {/* 🔍 Trending + Search bar */}
      <div className="mt-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Trending */}
          <div>
            <p className="text-sm mb-2 text-gray-700 font-semibold">
              Trendings:
            </p>
            <div className="flex gap-3 flex-wrap">
              <span className="bg-gray-100 text-gray-700 px-4 py-1 rounded-full text-sm">
                Logo design
              </span>
              <span className="bg-gray-100 text-gray-700 px-4 py-1 rounded-full text-sm">
                Website design
              </span>
              <span className="bg-gray-100 text-gray-700 px-4 py-1 rounded-full text-sm">
                Image editing
              </span>
            </div>
          </div>

          {/* Search */}
          <div>
            <div className="flex items-center bg-white rounded-full shadow-lg px-6 py-4">
              <svg
                className="w-5 h-5 text-gray-600 mr-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
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
      </div>

      {/* <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <JobCard key={idx} />
        ))}
      </div> */}

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8 px-4 mt-12">
        {/* Filter Sidebar */}
        <div>
          <CategoryFilter
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
          />
        </div>

        {/* Job List */}
        <div className="grid grid-cols-1 gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <JobCard key={idx} />
          ))}
        </div>
      </div>

      <div className="text-center py-8">
        <button className="bg-gradient-to-r from-orange-500 to-yellow-400 text-black font-bold px-8 py-3 rounded-xl text-xl">
          Load More
        </button>
      </div>

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
};

export default FindWork;
