import React, { useState, useEffect } from 'react';
import styles from './Voting.module.css';
import { Idea, Vote } from '@/app/shared/utils/types';

const Voting: React.FC = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [remainingVotes, setRemainingVotes] = useState(3);
  const [votedIdeas, setVotedIdeas] = useState<Set<number>>(new Set());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Mock data based on your database schema
  const mockIdeas: Idea[] = [
    {
      idea_id: 1,
      theme_id: 1,
      submitted_by: 101,
      idea_name: "Project Management Tool",
      description: "A collaborative tool for student teams to manage projects effectively",
      status: "Approved",
      created_at: new Date().toISOString(),
      submitter_name: "John Doe",
      vote_count: 12
    },
    {
      idea_id: 2,
      theme_id: 1,
      submitted_by: 102,
      idea_name: "Study Group Matcher",
      description: "AI-powered platform to match students with compatible study partners",
      status: "Approved",
      created_at: new Date().toISOString(),
      submitter_name: "Jane Smith",
      vote_count: 8
    }
  ];

  useEffect(() => {
    const fetchIdeasAndVotes = async () => {
      try {
        // Replace with actual API calls
        // Example SQL query:
        // SELECT i.*, u.name as submitter_name, COUNT(v.vote_id) as vote_count
        // FROM ideas i
        // JOIN users u ON i.submitted_by = u.user_id
        // LEFT JOIN votes v ON i.idea_id = v.idea_id
        // WHERE i.theme_id = [current_theme_id] AND i.status = 'Approved'
        // GROUP BY i.idea_id, u.name
        
        setIdeas(mockIdeas);
        
        // Fetch user's existing votes
        // Example SQL query:
        // SELECT idea_id FROM votes
        // WHERE voted_by = [current_user_id] AND idea_id IN (SELECT idea_id FROM ideas WHERE theme_id = [current_theme_id])
        
        const userVotes = new Set([/* existing votes */]);
        setVotedIdeas(userVotes);
        setRemainingVotes(3 - userVotes.size);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load ideas. Please try again.');
        setLoading(false);
      }
    };

    fetchIdeasAndVotes();
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

      // Example SQL insert:
      // INSERT INTO votes (idea_id, voted_by, created_at)
      // VALUES ([ideaId], [current_user_id], CURRENT_TIMESTAMP)
      
      setIdeas(ideas.map(idea => 
        idea.idea_id === ideaId 
          ? { ...idea, vote_count: (idea.vote_count || 0) + 1 }
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
                <p className={styles.submitter}>Submitted by: {idea.submitter_name}</p>
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
                    <span>{idea.vote_count || 0} votes</span>
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