import React, {useState, useEffect} from 'react';
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
  idea_name,
  description,
  submitted_by,
  vote_count = 0,
  onVote,
  isVoted,
  remainingVotes,
  votingActive
}) => {
  const [submitterName, setSubmitterName] = useState<string>('Loading...');

  useEffect(() => {
    const fetchSubmitterName = async () => {
      try {
        if (submitted_by) {
          const response = await fetch(`http://localhost:7071/api/user?id=${submitted_by}`);
          
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
    fetchSubmitterName();
  }, [submitted_by]); 


  return (
    <div className={`${styles.card} ${isVoted ? styles.voted : ''}`}>
      <div className={styles.content}>
        <h3 className={styles.title}>{idea_name}</h3>
        <p className={styles.description}>{description}</p>
        <p className={styles.submitter}>Submitted by: {submitterName}</p>
      </div>
      
      <div className={styles.footer}>
        <div className={styles.voteCount}>
          <span className={styles.count}>{vote_count}</span>
          <span className={styles.label}>votes</span>
        </div>
        
        {votingActive ? (
          <Button 
            className={`${styles.voteButton} ${isVoted ? styles.votedButton : ''}`}
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