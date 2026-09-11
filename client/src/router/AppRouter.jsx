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
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-purple-600" />
        </div>
      }>
        <Routes>
          {/* Public Routes */}
          {!isAuthenticated && (
            <>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route
                path="/forgot-password"
                element={<ForgotPassword />}
              />
              <Route
                path="/reset-password/:token"
                element={<ResetPassword />}
              />

              <Route
                path="*"
                element={<Navigate to="/login" replace />}
              />
            </>
          )}

          {/* Protected Routes */}
          {isAuthenticated && (
            <Route element={<ProtectedRoute />}>
              
              <Route path="/" element={<Home />} />
              
              <Route
                path="/me"
                element={<Profile isSelf={true} />}
              />

              <Route
                path="/user/:username"
                element={<Profile isSelf={false} />}
              />

              <Route
                path="/following-posts"
                element={<FollowingPost />}
              />

              <Route
                path="/create-post"
                element={<CreatePost />}
              />

              <Route
                path="/me/followers"
                element={
                  <FollowPage
                    tab="followers"
                    isSelf={true}
                  />
                }
              />

              <Route
                path="/me/following"
                element={
                  <FollowPage
                    tab="following"
                    isSelf={true}
                  />
                }
              />

              <Route
                path="/user/:username/followers"
                element={<FollowPage tab="followers" />}
              />

              <Route
                path="/user/:username/following"
                element={<FollowPage tab="following" />}
              />

              <Route
                path="/post-preview/:type"
                element={<PostPreview />}
              />

              <Route
                path="/settings"
                element={<Settings />}
              />

              <Route
                path="*"
                element={<Navigate to="/" replace />}
              />

            </Route>
          )}
        </Routes>
      </Suspense>
    </div>
  )
}
