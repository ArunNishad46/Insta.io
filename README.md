
# Insta.io

[Live Demo](https://instagram-clone-project-two.vercel.app)

A modern full-featured social media platform that looks like Instagram using the MERN stack. Implemented secure user authentication with login, registration, password reset, and account management. Built core social features including profile management, post creation and deletion, likes, comments, and follow/unfollow functionality. Designed a responsive and interactive UI for a seamless user experience across devices. This project helped me improve my full-stack development skills and understand how social networking applications work.

## Features

### Core Authentication & Account
- User registration and login with JWT and Cookie-based authentication
- Email verification via Brevo
- Secure password reset functionality
- User profile management with customizable bios and avatars
- Account settings and privacy controls

### Social Features
- Create and delete posts
- Follow/unfollow users
- Like and comment on posts
- User discovery and search
- User feed with personalized content

### Media Management
- Upload images and videos with Cloudinary
- Image and video compression
- Multiple media per post
- Media galleries and collections
- Edit and delete posts

### State Management
- Redux for centralized state management
- Actions for user, posts, and feed operations
- Redux middleware for API calls

## Tech Stack

- **Frontend**: React.js, Redux, Tailwind CSS, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT and Cookie (Core Auth)
- **Email Service**: Brevo
- **Media Storage**: Cloudinary

## Installation

```bash
# Clone repository
git clone <repo-url>

# Install dependencies

## Start the backend:
cd server
npm install
npm start 
or
npm run dev #nodemon

## Start the frontend:
cd client
npm install
npm run dev #vite-react

# Configure environment variables
# Create .env files for both backend and frontend

## Environment Variables

Backend `.env`:
```
MONGODB_URI=
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
BREVO_API_KEY=
CLOUDINARY_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Getting Started

Create an account, build your profile, and start connecting with users today!
