import React, {lazy, Suspense} from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import ProtectedRoute from '../components/ProtectedRoute.jsx';
const Login = lazy(() => import('../pages/Login.jsx'));
const SignUp = lazy(() => import('../pages/SignUp.jsx'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword.jsx'));
const ResetPassword = lazy(() => import('../pages/ResetPassword.jsx'));

const Home = lazy(() => import('../pages/Home.jsx'));
const Profile = lazy(() => import('../pages/Profile.jsx'));
const FollowingPost = lazy(() => import('../pages/FollowingPost.jsx'));
const CreatePost = lazy(() => import('../pages/CreatePost.jsx'));
const Settings = lazy(() => import('../pages/Settings.jsx'));
const FollowPage = lazy(() => import('../pages/FollowPage.jsx'));
const PostPreview = lazy(() => import('../pages/PostPreview.jsx'));

export default function AppRouter() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  return (
    <div>
      <Suspense fallback={<div className="p-4 text-center text-purple-700 text-lg font-semibold">Loading...</div>}>
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
                path="*"
                element={<Navigate to="/login" replace />}
              />
            </>
          )};
        </Routes>
      </Suspense>
    </div>
  )
}
