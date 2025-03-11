import React, { useState, useEffect } from 'react';
import styles from './IdeaCard.module.css';
import { Idea } from '@/app/shared/utils/types';
import Button from '../Button/Button';
import useApi from '../../hooks/useApi';

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
  status,
}) => {
  const [submitterName, setSubmitterName] = useState<string>('Loading...');
  const [currentVoteCount, setCurrentVoteCount] = useState<number>(vote_count);
  const [isLoading, setIsLoading] = useState(true);
  const { get } = useApi('');

  const fetchSubmitterName = async () => {
    try {
      if (submitted_by) {
        const user = await get(`/user?id=${submitted_by}`);

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
      const votes = await get(`http://localhost:7071/api/vote?ideaId=${idea_id}`)
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

  const cardClassName = `${styles.ideaCard} ${status ? styles[status] : ''}`;

  return (
    <div className={cardClassName}>
      <div className={styles.cardHeader}>
        <div className={styles.headerContent}>
          <h3 className={styles.ideaName}>{idea_name}</h3>
          <p className={styles.submitter}>Submitted by: {submitterName}</p>
        </div>
        {status && (
          <div className={styles.statusBadge}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        )}
      </div>
      
      <div className={styles.cardContent}>
        <div className={styles.description}>{description}</div>
      </div>

      <div className={styles.cardFooter}>
        <div className={styles.voteCount}>
          <span>{currentVoteCount}</span>
          <span>votes</span>
        </div>

        {votingActive ? (
          <Button
            onClick={onVote}
            disabled={isVoted || remainingVotes <= 0}
            className={isVoted ? styles.votedButton : ''}
          >
            {isVoted ? 'Voted' : 'Vote'}
          </Button>
        ) : (
          <div>
            Voting {new Date() < new Date() ? 'not yet open' : 'closed'}
          </div>
        )}
      </div>
    </div>
  );
};

export default IdeaCard;