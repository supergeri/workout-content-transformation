import { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import { User } from './types/auth';

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (email: string, password: string) => {
    const newUser: User = {
      id: '1',
      email,
      name: email.split('@')[0],
      subscription: 'free',
      workoutsThisWeek: 0,
      selectedDevices: ['garmin'],
      billingDate: undefined
    };
    setUser(newUser);
    toast.success(`Welcome back, ${newUser.name}!`);
  };

  const handleLogout = () => {
    setUser(null);
    toast.success('Logged out successfully');
  };

  if (!user) {
    return (
      <>
        <Toaster position="top-center" />
        <LoginPage onLogin={handleLogin} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <Toaster position="top-center" />
      <h1>Welcome, {user.name}!</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
