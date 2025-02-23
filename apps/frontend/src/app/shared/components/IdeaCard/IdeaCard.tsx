import React from 'react';
import styles from './IdeaCard.module.css';
import StatusBadge from '@/app/shared/components/StatusBadge/StatusBadge';
import { Idea } from '@/app/shared/utils/types';
import Card from '../Card/Card';
import Button from '@/app/shared/components/Button/Button';

const IdeaCard: React.FC<Idea> = ({
  idea_name,
  description,
  submitter_name,
  vote_count,
  status,
  className,
  onVote,
  isVoted = false,
  remainingVotes = 0,
}) => (
  <Card>
    <article
      className={`${styles.ideaCard} ${styles[status.toLowerCase()]} ${
        className || ''
      }`}
    >
      <header className={styles.cardHeader}>
        <section className={styles.headerContent}>
          <h2 className={styles.ideaName}>{idea_name}</h2>
          <address className={styles.submitter}>
            Submitted by: {submitter_name}
          </address>
        </section>
        <StatusBadge
          status={status.toLowerCase()}
          label={status}
          className={styles.statusBadge}
        />
      </header>

      <section className={styles.cardContent}>
        <p className={styles.description}>{description}</p>
        <footer className={styles.cardFooter}>
          <span className={styles.voteCount}>👍 {vote_count} votes</span>
          {onVote && (
            <Button
              onClick={onVote}
              disabled={isVoted || remainingVotes <= 0}
              className={isVoted ? styles.votedButton : ''}
            >
              {isVoted ? 'Voted' : 'Vote'}
            </Button>
          )}
        </footer>
      </section>
    </article>
  </Card>
);

export default IdeaCard;
