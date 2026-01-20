import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import ProtectedRoute from '../components/ProtectedRoute.jsx';
import Login from '../pages/Login.jsx';
import SignUp from '../pages/SignUp.jsx';
import ForgotPassword from '../pages/ForgotPassword.jsx';
import ResetPassword from '../pages/ResetPassword.jsx';
import Home from '../pages/Home.jsx';
import Profile from '../pages/Profile.jsx';
import FollowingPost from '../pages/FollowingPost.jsx'; 
import CreatePost from "../pages/CreatePost.jsx";
import Settings from "../pages/Settings.jsx";
import FollowPage from '../pages/FollowPage.jsx';
import PostPreview from '../pages/PostPreview.jsx';

export default function AppRouter() {
  const { isAuthenticated, initialized } = useSelector((state) => state.auth);

  if (!initialized) return <div className='p-4 text-center'>Loading...</div>;
  
  return (
    <div>
      <Routes>
        {isAuthenticated ? (
          <>
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/me" 
              element={
                <ProtectedRoute>
                  <Profile isSelf={true} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/user/:username" 
              element={
                <ProtectedRoute>
                  <Profile isSelf={false} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/following-posts" 
              element={
                <ProtectedRoute>
                  <FollowingPost />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/create-post" 
              element={
                <ProtectedRoute>
                  <CreatePost />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/me/followers" 
              element={
                <ProtectedRoute>
                  <FollowPage tab="followers" isSelf={true} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/me/following" 
              element={
                <ProtectedRoute>
                  <FollowPage tab="following" isSelf={true} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/user/:username/followers" 
              element={
                <ProtectedRoute>
                  <FollowPage tab="followers" />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/user/:username/following" 
              element={
                <ProtectedRoute>
                  <FollowPage tab="following" />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/post-preview/:type" 
              element={
                <ProtectedRoute>
                  <PostPreview />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route
              path="*"
              element={
                <ProtectedRoute>
                  <Navigate to="/" replace />
                </ProtectedRoute>
            }
            />
          </>
        ) : (
          <>
            <Route 
              path="/login" 
              element={
                <Login />
              } 
            />
            <Route 
              path="/signup" 
              element={
                <SignUp />
              } 
            />
            <Route 
              path="/forgot-password" 
              element={
                <ForgotPassword />
              } 
            />
            <Route 
              path="/reset-password/:token" 
              element={
                <ResetPassword />
              } 
            />
            <Route
              path="/"
              element={<Navigate to="/login" replace />}
            />
            <Route
              path="*"
              element={<Navigate to="/login" replace />}
            />
          </>
        )};
      </Routes>
    </div>
  )
}
