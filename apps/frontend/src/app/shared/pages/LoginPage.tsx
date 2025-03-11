import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';
import logo from '@/assets/logo/Team_formation-removebg.png';
import GithubIcon from '@/assets/icons/Github-icon.svg';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a code in the URL (callback from GitHub)
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      // Exchange the code for an access token
      fetch(`http://localhost:7071/api/auth?code=${code}`)
        .then(response => response.json())
        .then(data => {
          if (data.accessToken) {
            // Store the access token in localStorage
            //localStorage.setItem('accessToken', data.accessToken);
            // Redirect to the student dashboard (or admin if applicable)
            navigate('/student');
          }
        })
        .catch(error => {
          console.error('Error during GitHub login:', error);
        });
    }
  }, [navigate]);

  const handleLogin = () => {
    // Redirect the user to GitHub for authentication
    const clientId = 'Ov23ctYJiAt4UinW7HXi';
    const redirectUri = encodeURIComponent(`http://localhost:4200` + '/login');
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user`;
    window.location.href = githubAuthUrl;
  };

  return (
    <div className={styles.loginContainer}>
      <img src={logo} alt="Team Formation Logo" className={styles.loginImage} />
      <button className={styles.loginButton} onClick={handleLogin}>
        <img src={GithubIcon} alt="GitHub Icon" className={styles.githubIcon} />
        Login With Github
      </button>
    </div>
  );
};

export default LoginPage;