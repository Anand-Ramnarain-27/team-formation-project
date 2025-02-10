import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';
import logo from '@/assets/logo/Team_formation-removebg.png'
import GithubIcon from '@/assets/icons/Github-icon.svg'

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const isAdmin = true; 

  const handleLogin = () => {
    if (isAdmin) {
      navigate('/admin'); 
    } else {
      navigate('/student');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <img
        src={logo}
        alt="Team Formation Logo"
        className={styles.loginImage}
      />
      <button className={styles.loginButton} onClick={handleLogin} >
      <img src={GithubIcon} alt="GitHub Icon" className={styles.githubIcon} />
        Login With Github</button>
    </div>
  );
};

export default LoginPage;
