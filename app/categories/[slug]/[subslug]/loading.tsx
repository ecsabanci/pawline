export default function SubCategoryLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb skeleton */}
      <div className="flex mb-8 animate-pulse">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
        <div className="mx-2">/</div>
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
        <div className="mx-2">/</div>
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
      </div>

      {/* Title skeleton */}
      <div className="h-8 w-64 bg-gray-200 rounded mb-8 animate-pulse"></div>

      {/* Products grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="border rounded-lg overflow-hidden animate-pulse">
            <div className="aspect-w-1 aspect-h-1 bg-gray-200"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
              <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
              <div className="flex justify-between items-center">
                <div className="h-6 w-20 bg-gray-200 rounded"></div>
                <div className="h-8 w-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 