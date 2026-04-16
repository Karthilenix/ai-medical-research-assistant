import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="h-8 bg-gray-200 rounded-md w-1/3 animate-pulse"></div>
      <div className="h-24 bg-gray-200 rounded-xl w-full animate-pulse"></div>
      <div className="h-24 bg-gray-200 rounded-xl w-full animate-pulse"></div>
      <div className="h-24 bg-gray-200 rounded-xl w-full animate-pulse"></div>
    </div>
  );
};

export default Loader;
