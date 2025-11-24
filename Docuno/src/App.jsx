import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';

// Import Components
import Navbar from './components/Navbar';

// Import Pages
import Home from './pages/Home';
import Chat from './pages/Chat';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public Route: Home */}
        <Route path="/" element={<Home />} />

        {/* Auth Routes */}
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />

        {/* Protected Route: Chat */}
        <Route
          path="/chat"
          element={
            <>
              <SignedIn>
                <Chat />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;