import React from 'react';

const categories = [
  'Logo Design',
  'Website Design',
  'Mobile App',
  'Branding',
  'Image Editing',
  'Social Media',
];

type CategoryFilterProps = {
  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
};

const CategoryFilter = ({ selectedCategories, setSelectedCategories }: CategoryFilterProps) => {
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="bg-white border rounded-xl p-6 shadow-md w-full">
      <h3 className="text-lg font-semibold mb-4">Filter by Category</h3>
      <div className="space-y-3">
        {categories.map((category) => (
          <label key={category} className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={selectedCategories.includes(category)}
              onChange={() => toggleCategory(category)}
              className="accent-yellow-500"
            />
            {category}
          </label>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
