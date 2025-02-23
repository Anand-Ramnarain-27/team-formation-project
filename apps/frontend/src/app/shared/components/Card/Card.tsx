import styles from './Card.module.css';

type CardProps = {
  title?: string;
  children: React.ReactNode;
  className?: string;
};

const Card = ({ title, children, className }: CardProps) => (
  <article className={`${styles.card} ${className ?? ''}`}>
    {title && <h2 className={styles.title}>{title}</h2>}
    <section className={styles.content}>{children}</section>
  </article>
);

export default Card;
