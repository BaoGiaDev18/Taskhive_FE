import { Link } from "react-router-dom";
import Logoforblack from "../assets/Logo gốc trên nền đen.png";

export default function Navbar() {
  return (
    <nav className="bg-[#0F0E0E]/70 text-white px-10 py-5 flex justify-between items-center fixed top-0 w-full z-50">
      <div className="text-2xl font-bold">
        <Link to="/">
        <img src={Logoforblack} alt="TaskHive Logo" className="h-12" />
        </Link>
      </div>
      <div className="space-x-10 text-lg font-medium">
        <Link to="/hirefreelancer" className="text-white hover:text-yellow-400">Hire Freelancer</Link>
        <Link to="/find-work" className="text-white hover:text-yellow-400">Find Work</Link>
        <Link to="/about" className="text-white hover:text-yellow-400">Why TaskHive</Link>
      </div>
      <div className="space-x-6 text-lg">
        <button className="text-white hover:text-yellow-400">EN</button>
        <Link to="/login" className="text-white hover:text-yellow-400">Log in / Sign up</Link>
      </div>
    </nav>
  );
}
