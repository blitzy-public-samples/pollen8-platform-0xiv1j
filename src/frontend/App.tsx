import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Welcome } from 'src/frontend/pages/Welcome';
import { Onboarding } from 'src/frontend/pages/Onboarding';
import { Profile } from 'src/frontend/pages/Profile';
import { Invites } from 'src/frontend/pages/Invites';
import { Dashboard } from 'src/frontend/pages/Dashboard';
import { Header } from 'src/frontend/components/layout/Header';
import { Footer } from 'src/frontend/components/layout/Footer';
import { AuthProvider, ThemeProvider, NotificationProvider } from 'src/shared/contexts/index';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <BrowserRouter>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Welcome />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/profile/:userId" element={<Profile />} />
                  <Route path="/invites" element={<Invites />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  {/* Add more routes as needed */}
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};