'use client';

interface SkeletonLoaderProps {
  count?: number;
  height?: string;
  className?: string;
  type?: 'job-card' | 'rectangle' | 'circle' | 'text';
}

export default function SkeletonLoader({ 
  count = 1, 
  height = 'h-32', 
  className = '', 
  type = 'rectangle' 
}: SkeletonLoaderProps) {
  const items = Array.from({ length: count }, (_, i) => i);
  
  const getSkeletonByType = () => {
    switch (type) {
      case 'job-card':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-start">
              <div className="animate-pulse bg-gray-200 h-12 w-12 rounded-md mr-4"></div>
              <div className="flex-1">
                <div className="animate-pulse bg-gray-200 h-5 w-3/4 rounded mb-2"></div>
                <div className="animate-pulse bg-gray-200 h-4 w-1/2 rounded mb-2"></div>
                <div className="animate-pulse bg-gray-200 h-4 w-1/4 rounded"></div>
              </div>
            </div>
            <div className="mt-4">
              <div className="animate-pulse bg-gray-200 h-3 rounded mb-2"></div>
              <div className="animate-pulse bg-gray-200 h-3 rounded mb-2"></div>
              <div className="animate-pulse bg-gray-200 h-3 w-3/4 rounded"></div>
            </div>
          </div>
        );
      case 'circle':
        return <div className={`animate-pulse bg-gray-200 rounded-full ${height} ${className}`}></div>;
      case 'text':
        return (
          <div className="space-y-2">
            <div className="animate-pulse bg-gray-200 h-4 w-3/4 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-4 w-1/2 rounded"></div>
          </div>
        );
      case 'rectangle':
      default:
        return <div className={`animate-pulse bg-gray-200 ${height} rounded-lg ${className}`}></div>;
    }
  };
  
  return (
    <div className="space-y-4">
      {items.map((i) => (
        <div key={i}>{getSkeletonByType()}</div>
      ))}
    </div>
  );
}
