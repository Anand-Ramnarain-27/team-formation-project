import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';
import logo from '@/assets/logo/Team_formation-removebg.png';
import GithubIcon from '@/assets/icons/Github-icon.svg';

interface User {
  user_id: number;
  name: string;
  email: string;
  role: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const availableUsers = [
    { user_id: 1, name: 'Admin', email: 'Admin@gmail.com', role: 'Admin' },
    { user_id: 2, name: 'Student One', email: 'student_one@gmail.com', role: 'Student' },
    { user_id: 3, name: 'Student Two', email: 'student_two@gmail.com', role: 'Student' },
    { user_id: 4, name: 'Student Three', email: 'student_three@gmail.com', role: 'Student' },
  ];

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUserId(e.target.value);
    setError(null);
  };

  const handleLogin = async () => {
    if (!selectedUserId) {
      setError('Please select a user');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let userData: User | null = null;
      
      try {
        const response = await fetch(`http://localhost:7071/api/user/${selectedUserId}`);
        
        if (!response.ok) {
          console.warn(`API returned status ${response.status}: ${response.statusText}`);
          throw new Error('API request failed');
        }

        userData = await response.json();
        console.log('User data from API:', userData);
        
      } catch (apiError) {
        console.error('API error:', apiError);
        
        console.log('Falling back to mock data');
        userData = availableUsers.find(user => user.user_id.toString() === selectedUserId) as User;
        
        if (!userData) {
          throw new Error('User not found in fallback data');
        }
      }
      
      if (userData?.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
      
      localStorage.setItem('currentUser', JSON.stringify(userData));
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <img src={logo} alt="Team Formation Logo" className={styles.loginImage} />
      
      <div className={styles.loginForm}>
        <h2>Select User for Testing</h2>
        
        <select 
          value={selectedUserId} 
          onChange={handleUserChange}
          className={styles.userSelect}
          disabled={isLoading}
        >
          <option value="">-- Select a user --</option>
          {availableUsers.map(user => (
            <option key={user.user_id} value={user.user_id}>
              {user.name} ({user.email}) - {user.role}
            </option>
          ))}
        </select>
        
        {error && <p className={styles.errorMessage}>{error}</p>}
        
        <button 
          className={styles.loginButton} 
          onClick={handleLogin}
          disabled={isLoading || !selectedUserId}
        >
          {isLoading ? (
            'Loading...'
          ) : (
            <>
              <img src={GithubIcon} alt="GitHub Icon" className={styles.githubIcon} />
              Login As Selected User
            </>
          )}
        </button>
        
        <p className={styles.note}>
          Note: This is a temporary login page for testing. GitHub authentication will be implemented later.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;