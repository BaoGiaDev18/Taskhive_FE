import { Link } from "react-router-dom";
import BGImage from "../assets/BGhome.jpg";
import homeimg1 from "../assets/homeimg.jpg";
import homeimg2 from "../assets/homeimg2.jpg";
import homeimg3 from "../assets/homeimg3.jpg";
import homeimg4 from "../assets/homeimg4.jpg";
import homeimg5 from "../assets/homeimg5.jpg";
import homeimg6 from "../assets/homeimg6.jpg";
import homeimg7 from "../assets/homeimg7.jpg";

export default function HomePage() {
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
          <button className="bg-gradient-to-r from-orange-500 to-yellow-400 text-black font-bold px-8 py-3 rounded-xl text-xl">
            Sign up now
          </button>
        </div>
      </section>

      <section className="py-20 px-6 bg-white flex flex-col md:flex-row items-center max-w-7xl mx-auto">
        <div className="w-full md:w-1/2 mb-10 md:mb-0">
          <img
            src={homeimg1}
            alt="Job Search"
            className="rounded-2xl shadow-xl"
          />
        </div>
        <div className="w-full md:w-1/2 md:pl-10 space-y-6">
          <h2 className="text-4xl font-bold text-gray-800">
            Job Searching Made Easy
          </h2>
          <p className="text-lg text-gray-600">
            Find the perfect job effortlessly with TaskHive.
          </p>
          <ul className="text-gray-700 space-y-2">
            <li>✓ Access over 10,000 job listings from leading companies</li>
            <li>✓ Connect with employers quickly and efficiently</li>
            <li>✓ Simple and seamless application process</li>
          </ul>
          <button className="mt-4 bg-gradient-to-r from-orange-500 to-yellow-400 text-black font-bold px-6 py-3 rounded-xl">
            Get Started
          </button>
        </div>
      </section>

      <section className="bg-[rgba(15,15,15,0.88)] py-20 px-6 text-white">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-transparent bg-gradient-to-r from-orange-500 to-yellow-400 bg-clip-text">
            Find the right match for you
          </h2>
        </div>
        <div className="flex flex-col md:flex-row justify-center gap-12 max-w-7xl mx-auto">
          {/* Clients Card */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg max-w-sm">
            <img
              src={homeimg2}
              alt="Clients"
              className="w-full h-56 object-cover"
            />
            <div className="p-6 text-black">
              <h3 className="text-lg font-semibold mb-2">Clients</h3>
              <p className="mb-4 text-sm">
                Looking for skilled professionals? Connect with top freelancers
                to get your projects done efficiently.
              </p>
              <Link
                to="/hire-freelancer"
                className="text-orange-500 font-semibold"
              >
                Hire Freelancer →
              </Link>
            </div>
          </div>

          {/* Freelancers Card */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg max-w-sm">
            <img
              src={homeimg3}
              alt="Freelancers"
              className="w-full h-56 object-cover"
            />
            <div className="p-6 text-black">
              <h3 className="text-lg font-semibold mb-2">Freelancers</h3>
              <p className="mb-4 text-sm">
                Find job opportunities that match your skills and work on
                projects you love. Join TaskHive today!
              </p>
              <Link to="/find-work" className="text-orange-500 font-semibold">
                Find Work →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Categories */}
      <section className="bg-white py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Explore Categories
        </h2>

        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Web Developer
          </h3>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            Our Service
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-gray-800">
            <div>
              <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                💲 Secure Payment
              </h4>
              <p>
                Enjoy a safe and reliable payment system that protects both
                parties.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                🧑‍💼 Freelancer Marketplace
              </h4>
              <p>
                Connect with top professionals across various industries for
                your projects.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                🔄 Flexible Hiring
              </h4>
              <p>
                Hire freelancers per project or hourly, tailored to your
                business needs.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                ✅ Quality Assurance
              </h4>
              <p>
                Verified services ensure trust and high-quality work delivery.
              </p>
            </div>
          </div>
          <div className="text-center mt-12">
            <button className="px-8 py-3 border border-orange-400 text-orange-500 font-semibold rounded-full hover:bg-orange-50">
              Browse more
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
