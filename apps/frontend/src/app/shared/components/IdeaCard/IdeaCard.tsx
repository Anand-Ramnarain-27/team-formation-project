// IdeaCard.tsx
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
}) => {
  const cardClassName = `${styles.ideaCard} ${styles[status.toLowerCase()]} ${
    className || ''
  }`;

  return (
    <Card>
      <div className={styles.cardHeader}>
        <div className={styles.headerContent}>
          <h2 className={styles.ideaName}>{idea_name}</h2>
          <p className={styles.submitter}>Submitted by: {submitter_name}</p>
        </div>
        <StatusBadge
          status={status.toLowerCase()}
          label={status}
          className={styles.statusBadge}
        />
      </div>
      <div className={styles.cardContent}>
        <p className={styles.description}>{description}</p>
        <div className={styles.cardFooter}>
          <div className={styles.voteCount}>
            <span>👍 {vote_count} votes</span>
          </div>
          {onVote && (
            <Button
              onClick={onVote}
              disabled={isVoted || remainingVotes <= 0}
              className={`${styles.voteButton} ${
                isVoted ? styles.votedButton : ''
              }`}
            >
              {isVoted ? 'Voted' : 'Vote'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default IdeaCard;
