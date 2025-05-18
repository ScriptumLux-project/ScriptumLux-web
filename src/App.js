import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import Home from './components/pages/user/Home';
import MovieDetails from './components/pages/user/MovieDetails';
import Account from './components/pages/user/Account';
import Playlists from './components/pages/user/Playlists';
import History from './components/pages/user/History';
import Dashboard from './components/pages/admin/Dashboard';
import { AuthProvider } from './components/context/AuthContext';
import { MovieProvider } from './components/context/MovieContext';
import { PlaylistProvider } from './components/context/PlaylistContext';
import PlaylistDetails from './components/pages/user/PlaylistDetails';

import UsersList from './components/pages/admin/UsersList';
import MovieList from './components/pages/admin/MovieList';
import CommentsList from './components/pages/admin/CommentsList';

function App() {
  const isAuthenticated = () => {
    return localStorage.getItem('accessToken') !== null;
  };

  //if user is an admin**
  const isAdmin = () => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        return userData.role === 'admin';
      } catch (error) {
        return false;
      }
    }
    return false;
  };

  //----------------------protection----------------------*
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/" />;
    }
    return children;
  };
  
  const AdminRoute = ({ children }) => {
    if (!isAuthenticated() || !isAdmin()) {
      return <Navigate to="/" />;
    }
    return children;
  };
  //------------------------------------------------------*

  return (
    <AuthProvider>
      <MovieProvider>
      <PlaylistProvider>
        <Router>
          <div className="App">
            <Routes>
              {/*"/" - Home page*/}
              <Route path="/" element={
                <>
                  <Navbar />
                  <Home />
                </>
              } />

              <Route path="/movies/:movieId" element={
                <>
                  <Navbar />
                  <MovieDetails />
                </>
              } />
              
              { /*----------------------protection----------------------*/}
              <Route path="/account" element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                     <Account />
                  </>
                </ProtectedRoute>
              } />

              <Route path="/history" element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                     <History />
                  </>
                </ProtectedRoute>
              } />

              <Route path="/playlists" element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <Playlists />
                  </>
                </ProtectedRoute>
              } />

               <Route path="/playlists/:playlistId" element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <PlaylistDetails />
                  </>
                </ProtectedRoute>
              } />
              
              <Route path="/timecodes" element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    {/*<Timecodes />*/}
                  </>
                </ProtectedRoute>
              } />

              { /*----------------------admin Only Routes----------------------*/}
              <Route path="/dashboard" element={
                <AdminRoute>
                  <>
                    <Navbar />
                    <Dashboard />
                  </>
                </AdminRoute>
              } />

              <Route path="/admin-users-list" element={
                <AdminRoute>
                 <>
                  <Navbar />
                  <UsersList />
                 </>
               </AdminRoute>
             } />

              <Route path="/admin-movies-list" element={
                <AdminRoute>
                 <>
                   <Navbar />
                   <MovieList />
                 </>
               </AdminRoute>
             } />

             <Route path="/admin-comments-list/:userId" element={
                <AdminRoute>
                 <>
                   <Navbar />
                   <CommentsList />
                 </>
               </AdminRoute>
             } />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router> 
        </PlaylistProvider>
      </MovieProvider>
    </AuthProvider>
  );
}

export default App;