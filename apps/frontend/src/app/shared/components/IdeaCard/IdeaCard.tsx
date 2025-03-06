import React, { useState, useEffect } from 'react';
import styles from './IdeaCard.module.css';
import { Idea, User } from '@/app/shared/utils/types';
import Button from '../Button/Button';

interface IdeaCardProps extends Idea {
  onVote: () => void;
  isVoted: boolean;
  remainingVotes: number;
  votingActive: boolean;
}

const IdeaCard: React.FC<IdeaCardProps> = ({
  idea_id,
  idea_name,
  description,
  submitted_by,
  vote_count = 0,
  onVote,
  isVoted,
  remainingVotes,
  votingActive,
}) => {
  const [submitterName, setSubmitterName] = useState<string>('Loading...');
  const [currentVoteCount, setCurrentVoteCount] = useState<number>(vote_count);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubmitterName = async () => {
    try {
      if (submitted_by) {
        const response = await fetch(
          `http://localhost:7071/api/user?id=${submitted_by}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }

        const user = await response.json();

        if (user) {
          setSubmitterName(user.name);
        } else {
          setSubmitterName('Unknown User');
        }
      }
    } catch (error) {
      console.error('Error fetching submitter name:', error);
      setSubmitterName('Unknown User');
    }
  };

  const fetchVoteCount = async () => {
    try {
      const response = await fetch(`http://localhost:7071/api/vote?ideaId=${idea_id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch vote count');
      }

      const votes = await response.json();
      setCurrentVoteCount(votes.length);
    } catch (error) {
      console.error('Error fetching vote count:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchSubmitterName(),
        fetchVoteCount(),
      ]);
      setIsLoading(false);
    };

    if (submitted_by && idea_id) {
      loadData();
    }
  }, [submitted_by, idea_id]);

  return (
    <div className={`${styles.card} ${isVoted ? styles.voted : ''}`}>
      <div className={styles.content}>
        <h3 className={styles.title}>{idea_name}</h3>
        <p className={styles.description}>{description}</p>
        <p className={styles.submitter}>Submitted by: {submitterName}</p>
      </div>

      <div className={styles.footer}>
        <div className={styles.voteCount}>
          <span className={styles.count}>{currentVoteCount}</span>
          <span className={styles.label}>votes</span>
        </div>

        {votingActive ? (
          <Button
            className={`${styles.voteButton} ${
              isVoted ? styles.votedButton : ''
            }`}
            onClick={onVote}
            disabled={isVoted || remainingVotes <= 0}
          >
            {isVoted ? 'Voted' : 'Vote'}
          </Button>
        ) : (
          <div className={styles.votingClosedInfo}>
            Voting {new Date() < new Date() ? 'not yet open' : 'closed'}
          </div>
        )}
      </div>
    </div>
  );
};

export default IdeaCard;
