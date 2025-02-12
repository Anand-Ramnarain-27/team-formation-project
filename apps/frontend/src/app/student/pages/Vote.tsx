// VotingScreen.tsx
import React, { useState, useEffect } from 'react';
import styles from './Voting.module.css';

interface Idea {
  idea_id: number;
  idea_name: string;
  description: string;
  submitted_by: string;
  votes_count: number;
}

const Voting: React.FC = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [remainingVotes, setRemainingVotes] = useState(3);
  const [votedIdeas, setVotedIdeas] = useState<Set<number>>(new Set());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Simulated data - replace with actual API call
  const mockIdeas: Idea[] = [
    {
      idea_id: 1,
      idea_name: "Project Management Tool",
      description: "A collaborative tool for student teams to manage projects effectively",
      submitted_by: "John Doe",
      votes_count: 12
    },
    {
      idea_id: 2,
      idea_name: "Study Group Matcher",
      description: "AI-powered platform to match students with compatible study partners",
      submitted_by: "Jane Smith",
      votes_count: 8
    },
    {
      idea_id: 3,
      idea_name: "Campus Event Hub",
      description: "Centralized platform for managing and discovering campus events",
      submitted_by: "Mike Johnson",
      votes_count: 15
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setIdeas(mockIdeas);
      setLoading(false);
    }, 1000);
  }, []);

  const handleVote = async (ideaId: number) => {
    try {
      if (remainingVotes <= 0) {
        setError('You have used all your votes!');
        return;
      }

      if (votedIdeas.has(ideaId)) {
        setError('You have already voted for this idea!');
        return;
      }

      // Simulate API call to submit vote
      // await fetch('/api/v1/votes', {
      //   method: 'POST',
      //   body: JSON.stringify({ idea_id: ideaId }),
      //   headers: { 'Content-Type': 'application/json' }
      // });

      setIdeas(ideas.map(idea => 
        idea.idea_id === ideaId 
          ? { ...idea, votes_count: idea.votes_count + 1 }
          : idea
      ));

      setVotedIdeas(new Set([...votedIdeas, ideaId]));
      setRemainingVotes(prev => prev - 1);
      setError('');
    } catch (err) {
      setError('Failed to submit vote. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Vote for Project Ideas</h1>
        <p>Choose your favorite ideas for the upcoming project. 
          You have <span className={styles.voteCount}>{remainingVotes}</span> votes remaining.
        </p>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>Loading ideas...</div>
      ) : (
        <div className={styles.ideaGrid}>
          {ideas.map((idea) => (
            <div 
              key={idea.idea_id} 
              className={`${styles.card} ${votedIdeas.has(idea.idea_id) ? styles.votedCard : ''}`}
            >
              <div className={styles.cardHeader}>
                <h2>{idea.idea_name}</h2>
                <p className={styles.submitter}>Submitted by: {idea.submitted_by}</p>
              </div>
              <div className={styles.cardContent}>
                <p>{idea.description}</p>
                <div className={styles.cardFooter}>
                  <div className={styles.voteCount}>
                    <svg 
                      className={styles.thumbsUp} 
                      viewBox="0 0 24 24" 
                      width="24" 
                      height="24"
                    >
                      <path 
                        fill="currentColor" 
                        d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3m7-2V4a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14"
                      />
                    </svg>
                    <span>{idea.votes_count} votes</span>
                  </div>
                  <button 
                    onClick={() => handleVote(idea.idea_id)}
                    disabled={votedIdeas.has(idea.idea_id) || remainingVotes <= 0}
                    className={`${styles.voteButton} ${
                      votedIdeas.has(idea.idea_id) ? styles.votedButton : ''
                    }`}
                  >
                    {votedIdeas.has(idea.idea_id) ? 'Voted' : 'Vote'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Voting;