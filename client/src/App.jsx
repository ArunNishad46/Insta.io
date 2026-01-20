import React from 'react';
import AppRouter from './router/AppRouter.jsx';
import Navbar from './components/Navbar.jsx';
import { useSelector } from 'react-redux';
import SkeletonLoader from './components/SkeletonLoader.jsx';

export default function App() {
  const { initialized } = useSelector((state) => state.auth);

  if (!initialized) {
    return (
      <div className="bg-gray-100 min-h-screen">
  
        {/* NAVBAR SKELETON */}
        <div className="w-full bg-white shadow px-4 py-3 flex items-center gap-4">
          <SkeletonLoader className="h-6 w-24" /> {/* Logo */}
          <SkeletonLoader className="h-9 flex-1 rounded-full" /> {/* Search */}
          <div className="flex items-center gap-3">
            <SkeletonLoader className="h-8 w-20 rounded-full" /> {/* Feed btn */}
            <SkeletonLoader className="h-8 w-20 rounded-full" /> {/* Create btn */}
            <SkeletonLoader className="h-8 w-8 rounded-full" /> {/* Profile */}
          </div>
        </div>
  
        {/* FEED SKELETON */}
        <div className="flex flex-col items-center mt-4 space-y-6 w-full">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-full max-w-xl bg-white shadow rounded-lg p-3">
  
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <SkeletonLoader className="w-10 h-10 rounded-full" />
                <div className="flex flex-col gap-1">
                  <SkeletonLoader className="h-4 w-24" />
                  <SkeletonLoader className="h-3 w-16" />
                </div>
                <SkeletonLoader className="h-6 w-20 ml-auto rounded" />
              </div>
  
              {/* Image */}
              <SkeletonLoader className="w-full h-64 rounded" />
  
              {/* Actions */}
              <div className="flex gap-4 mt-3">
                <SkeletonLoader className="h-6 w-6 rounded" />
                <SkeletonLoader className="h-6 w-6 rounded" />
                <SkeletonLoader className="h-6 w-6 rounded" />
              </div>
  
              {/* Stats */}
              <div className="flex gap-4 mt-2">
                <SkeletonLoader className="h-4 w-16" />
                <SkeletonLoader className="h-4 w-24" />
              </div>
  
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="pt-15">
        <AppRouter />
      </div>
    </div>
  )
}
