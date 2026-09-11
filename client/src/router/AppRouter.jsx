import React, { lazy, Suspense } from 'react';
import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { useSelector } from 'react-redux';

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
  const {
    isAuthenticated,
    initialized,
  } = useSelector((state) => state.auth);

  // Authentication is still being checked
  if (!initialized) {
    return <AuthLoader />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>

        {isAuthenticated ? (
          <>

            {/* Protected routes */}

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

            {/* If logged-in user visits /login */}
            <Route
              path="/login"
              element={<Navigate to="/" replace />}
            />

            <Route
              path="/signup"
              element={<Navigate to="/" replace />}
            />

            <Route
              path="/forgot-password"
              element={<Navigate to="/" replace />}
            />

            <Route
              path="/reset-password/:token"
              element={<Navigate to="/" replace />}
            />

            {/* Unknown authenticated route */}
            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />

          </>
        ) : (
          <>

            {/* Public routes */}

            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/signup"
              element={<SignUp />}
            />

            <Route
              path="/forgot-password"
              element={<ForgotPassword />}
            />

            <Route
              path="/reset-password/:token"
              element={<ResetPassword />}
            />

            {/* Unknown public route */}
            <Route
              path="*"
              element={<Navigate to="/login" replace />}
            />

          </>
        )}

      </Routes>
    </Suspense>
  );
}


function AuthLoader() {
  return (
    <div className="min-h-[calc(100vh-60px)] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto" />

        <p className="mt-3 text-purple-700 font-semibold">
          Checking authentication...
        </p>
      </div>
    </div>
  );
}


function PageLoader() {
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"
          aria-label="Loading"
        />
      </div>
    );
  }
}
