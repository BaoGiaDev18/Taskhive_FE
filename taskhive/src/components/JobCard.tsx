const JobCard = () => {
  return (
    <div className="p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all bg-white">
      {/* ⭐ Rating + Location */}
      <div className="flex items-center gap-2 text-yellow-400 mb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i}>★</span>
        ))}
        <span className="text-sm text-gray-600 ml-2">Nguyen Van A | Ho Chi Minh City</span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Creative Logo Design for Startups
      </h3>

      {/* Meta info: price - level - deadline */}
      <div className="flex justify-between text-sm text-gray-700 mb-2">
        <div>
          <p className="font-medium">$150</p>
          <p className="text-xs text-gray-500">Fixed price</p>
        </div>
        <div>
          <p className="font-medium">Intermediate</p>
          <p className="text-xs text-gray-500">Experience level</p>
        </div>
        <div>
          <p className="font-medium">26 days</p>
          <p className="text-xs text-gray-500">Application deadline</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
        Looking for a creative logo designer to craft a unique and modern logo for a new startup.
        Experience in brand identity and vector design is a plus.
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {['Brand guidelines', 'App dev', 'Image editing'].map((tag, i) => (
          <span
            key={i}
            className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-md"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Apply Button */}
      <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-md text-sm">
        Apply now
      </button>
    </div>
  );
};

export default JobCard;
