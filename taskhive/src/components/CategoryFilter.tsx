import React from "react";

interface Category {
  categoryId: number;
  name: string;
  description: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategories: number[];
  onCategoryChange: (categoryIds: number[]) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategories,
  onCategoryChange,
}) => {
  const handleCategoryToggle = (categoryId: number) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];

    onCategoryChange(newCategories);
  };

  const handleClearAll = () => {
    onCategoryChange([]);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Filter by Category
        </h3>
        {selectedCategories.length > 0 && (
          <button
        onClick={handleClearAll}
        className="text-[10px] font-thin border border-black text-black bg-white px-2 py-0.5 rounded hover:bg-gray-50 transition-colors"
          >
        Clear all
          </button>
        )}
      </div>

      <div className="space-y-3">
        {categories.map((category) => (
          <label
            key={category.categoryId}
            className="flex items-start cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={selectedCategories.includes(category.categoryId)}
              onChange={() => handleCategoryToggle(category.categoryId)}
              className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500 mt-1 accent-orange-500"
            />
            <div className="ml-3 flex-1">
              <span className="text-sm font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
                {category.name}
              </span>
            </div>
          </label>
        ))}
      </div>

      {selectedCategories.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            {selectedCategories.length}{" "}
            {selectedCategories.length === 1 ? "category" : "categories"}{" "}
            selected
          </p>
        </div>
      )}
    </div>
  );
};

export default CategoryFilter;
