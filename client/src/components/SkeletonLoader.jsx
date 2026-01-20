import React from 'react';

export default function SkeletonLoader({ className }) {
  return <div className={`bg-gray-200 animate-pulse ${className}`} />;
}
