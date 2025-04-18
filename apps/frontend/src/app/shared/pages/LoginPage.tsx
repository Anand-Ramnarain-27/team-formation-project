import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';
import logo from '@/assets/logo/Team_formation-removebg.png';
import GithubIcon from '@/assets/icons/Github-icon.svg';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      fetch(`http://localhost:7071/api/auth?code=${code}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.accessToken) {
            sessionStorage.setItem('accessToken', data.accessToken); 
            sessionStorage.setItem('currentUser', JSON.stringify(data.user));
            sessionStorage.setItem('userRole', data.user.role);

            if (data.user.role === 'Admin') {
              navigate('/admin'); 
            }else if (data.user.role === 'Student') {
              navigate('/student'); 
            }else {
              console.error('Unknown user role:', data.user.role);
              navigate('/login'); 
            }
          }
        })
        .catch((error) => {
          console.error('Error during GitHub login:', error);
        });
    }
  }, [navigate]);

  const handleLogin = () => {
    const clientId = process.env.CLIENT_ID;
    const redirectUri = encodeURIComponent(`http://localhost:4200/login`);
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
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
