import React from 'react';
import styles from './LoginPage.module.css';
import logo from '@/assets/logo/Team_formation-removebg.png'
import GithubIcon from '@/assets/icons/Github-icon.svg'

const LoginPage: React.FC = () => {
  return (
    <div className={styles.loginContainer}>
      <img
        src={logo}
        alt="Team Formation Logo"
        className={styles.loginImage}
      />
      <button className={styles.loginButton} >
      <img src={GithubIcon} alt="GitHub Icon" className={styles.githubIcon} />
        Login With Github</button>
    </div>
  );
};

export default LoginPage;
