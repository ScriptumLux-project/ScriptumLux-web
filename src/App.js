import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import Home from './components/pages/Home';
import MovieDetails from './components/pages/MovieDetails';
import Account from './components/pages/Account';
import { AuthProvider } from './components/context/AuthContext';
import { MovieProvider } from './components/context/MovieContext';

function App() {
  const isAuthenticated = () => {
    return localStorage.getItem('accessToken') !== null;
  };

  //----------------------Protection----------------------*
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/" />;
    }
    return children;
  };
  //------------------------------------------------------*

  return (
    <AuthProvider>
      <MovieProvider>
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
              
              { /*----------------------Protection----------------------*/}
              <Route path="/account" element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                     <Account />
                  </>
                </ProtectedRoute>
              } />

              <Route path="/playlists" element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    {/*/<Playlists />*/}
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

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router> 
      </MovieProvider>
    </AuthProvider>
  );
}

export default App;