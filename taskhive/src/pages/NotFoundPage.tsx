import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative">
            <h1 className="text-9xl font-bold text-orange-500/20 select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-24 h-24 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m6 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 text-lg mb-2">
            Oops! The page you're looking for doesn't exist.
          </p>
          <p className="text-gray-500">
            It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleGoHome}
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-400 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            Go to Homepage
          </button>

          <button
            onClick={handleGoBack}
            className="w-full border-2 border-orange-500 text-orange-500 font-semibold py-3 px-6 rounded-lg hover:bg-orange-50 transition-all duration-300"
          >
            Go Back
          </button>
        </div>

        {/* Help Links */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            Looking for something specific?
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <button
              onClick={() => navigate("/find-work")}
              className="text-orange-500 hover:text-orange-600 hover:underline transition-colors"
            >
              Find Work
            </button>
            <button
              onClick={() => navigate("/hirefreelancer")}
              className="text-orange-500 hover:text-orange-600 hover:underline transition-colors"
            >
              Hire Freelancer
            </button>
            <button
              onClick={() => navigate("/about")}
              className="text-orange-500 hover:text-orange-600 hover:underline transition-colors"
            >
              About Us
            </button>
            <button
              onClick={() => navigate("/blogposts")}
              className="text-orange-500 hover:text-orange-600 hover:underline transition-colors"
            >
              Blog
            </button>
          </div>
        </div>

        {/* TaskHive Branding */}
        <div className="mt-8">
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
            </svg>
            <span className="text-sm font-medium">TaskHive</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Connect with opportunities
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
