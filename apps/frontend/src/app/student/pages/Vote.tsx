import React, { useState, useEffect } from 'react';
import styles from './Voting.module.css';
import { Idea, Vote, Theme } from '@/app/shared/utils/types';
import Button from '@/app/shared/components/Button/Button';
import {
  LoadingState,
  EmptyState,
} from '@/app/shared/components/States/States';
import IdeaCard from '@/app/shared/components/IdeaCard/IdeaCard';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7071/api';

const Voting: React.FC = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [theme, setTheme] = useState<Theme | null>(null);
  const [remainingVotes, setRemainingVotes] = useState(3);
  const [votedIdeas, setVotedIdeas] = useState<Set<number>>(new Set());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isVotingActive, setIsVotingActive] = useState(false);

  useEffect(() => {
    // Get the currently logged in user
    const getCurrentUser = async () => {
      try {
        // In a real app, you'd get this from your auth provider
        // This is a placeholder for your actual auth implementation
        // For example, if using Auth0, Microsoft Identity, etc.
        
        // For demo purposes, we'll use local storage or session
        const userJson = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        
        if (userJson) {
          const user = JSON.parse(userJson);
          setCurrentUser(user);
          return user;
        } else {
          // If no user in storage, you might redirect to login
          // window.location.href = '/login';
          throw new Error('User not logged in');
        }
      } catch (err) {
        console.error('Error getting current user:', err);
        setError('Please log in to view and vote for ideas.');
        return null;
      }
    };
    
    const fetchThemeAndIdeas = async () => {
      try {
        setLoading(true);
        
        // Get the current user
        const user = await getCurrentUser();
        if (!user) {
          setLoading(false);
          return;
        }
        
        // Get current theme ID (this could come from a route parameter)
        // For now, let's assume it's in the URL as a query parameter
        const urlParams = new URLSearchParams(window.location.search);
        const themeId = urlParams.get('themeId') || '1'; // Default to 1 if not specified
        
        // Fetch theme details
        const themeResponse = await fetch(`${API_BASE_URL}/theme?id=${themeId}`);
        if (!themeResponse.ok) {
          throw new Error('Failed to fetch theme details');
        }
        
        const themeData = await themeResponse.json();
        setTheme(themeData);
        
        // Check if voting is active
        const now = new Date();
        const submissionDeadline = new Date(themeData.submission_deadline);
        const votingDeadline = new Date(themeData.voting_deadline);
        
        // Voting is active if current date is between submission deadline and voting deadline
        const votingActive = now > submissionDeadline && now < votingDeadline;
        setIsVotingActive(votingActive);
        
        // Fetch ideas for this theme
        const ideasResponse = await fetch(`${API_BASE_URL}/idea?theme_id=${themeId}`);
        if (!ideasResponse.ok) {
          throw new Error('Failed to fetch ideas');
        }
        
        const ideasData = await ideasResponse.json();
        
        // Process ideas to include vote counts
        const ideasWithVotes = await Promise.all(
          ideasData.map(async (idea: Idea) => {
            // Get votes for this idea
            const votesResponse = await fetch(`${API_BASE_URL}/vote?ideaId=${idea.idea_id}`);
            if (!votesResponse.ok) {
              throw new Error(`Failed to fetch votes for idea ${idea.idea_id}`);
            }
            
            const votesData = await votesResponse.json();
            return {
              ...idea,
              vote_count: votesData.length
            };
          })
        );
        
        // Get approved ideas only
        const approvedIdeas = ideasWithVotes.filter((idea: Idea) => idea.status === 'Approved');
        setIdeas(approvedIdeas);
        
        // Get user's votes
        const votesResponse = await fetch(`${API_BASE_URL}/vote`);
        if (!votesResponse.ok) {
          throw new Error('Failed to fetch votes');
        }
        
        const votesData = await votesResponse.json();
        
        // Filter votes by this user
        const userVotes = votesData.filter((vote: Vote) => vote.voted_by === user.user_id);
        
        // More explicit way to ensure type safety
        const userVoteIds: number[] = userVotes.map((vote: Vote) => {
          // Ensure we're working with numbers
          return typeof vote.idea_id === 'number' ? vote.idea_id : Number(vote.idea_id);
        });
        
        // Create a Set from the explicitly typed array
        setVotedIdeas(new Set(userVoteIds));
        
        // Set remaining votes (assuming 3 max votes per user)
        setRemainingVotes(3 - userVoteIds.length);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load ideas. Please try again.');
        setLoading(false);
      }
    };

    fetchThemeAndIdeas();
  }, []);

  const handleVote = async (ideaId: number) => {
    if (!currentUser) {
      setError('You must be logged in to vote');
      return;
    }
    
    if (!isVotingActive) {
      setError('Voting is not currently active for this theme');
      return;
    }
    
    try {
      if (remainingVotes <= 0) {
        setError('You have used all your votes!');
        return;
      }

      if (votedIdeas.has(ideaId)) {
        setError('You have already voted for this idea!');
        return;
      }

      // Submit vote to API
      const response = await fetch(`${API_BASE_URL}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idea_id: ideaId,
          voted_by: currentUser.user_id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit vote');
      }

      // Update local state
      setIdeas((prevIdeas) =>
        prevIdeas.map((idea) =>
          idea.idea_id === ideaId
            ? { ...idea, vote_count: (idea.vote_count || 0) + 1 }
            : idea
        )
      );

      // Update voted ideas set with proper typing
      const newVotedIdeas = new Set(votedIdeas);
      newVotedIdeas.add(ideaId);
      setVotedIdeas(newVotedIdeas);
      
      setRemainingVotes((prev) => prev - 1);
      setError('');
    } catch (err) {
      console.error('Error submitting vote:', err);
      setError('Failed to submit vote. Please try again.');
    }
  };

  // Create a non-async wrapper function for onVote
  const handleVoteWrapper = (ideaId: number): void => {
    handleVote(ideaId).catch(error => {
      console.error('Error in vote handler:', error);
      setError('An unexpected error occurred while voting.');
    });
  };

  if (loading) {
    return (
      <main className={styles.container}>
        <LoadingState message="Loading ideas..." />
      </main>
    );
  }

  if (!currentUser) {
    return (
      <main className={styles.container}>
        <EmptyState
          title="Authentication Required"
          description="You need to log in to view and vote for project ideas."
          action={
            <Button onClick={() => window.location.href = '/login'}>
              Log In
            </Button>
          }
        />
      </main>
    );
  }

  if (ideas.length === 0) {
    return (
      <main className={styles.container}>
        <EmptyState
          title="No ideas available"
          description="There are no approved ideas available for voting at this time."
          action={
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          }
        />
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>Vote for Project Ideas</h1>
        {theme && (
          <h2 className={styles.themeTitle}>{theme.title}</h2>
        )}
        
        <div className={styles.votingStatus}>
          {isVotingActive ? (
            <p className={styles.votingActive}>
              Voting is open! You have{' '}
              <strong className={styles.votesRemaining}>{remainingVotes}</strong>{' '}
              votes remaining.
            </p>
          ) : (
            <p className={styles.votingClosed}>
              {theme && new Date() < new Date(theme.submission_deadline) 
                ? 'Voting has not started yet.' 
                : 'Voting has ended for this theme.'}
            </p>
          )}
        </div>
      </header>

      {error && (
        <aside role="alert" className={styles.error}>
          {error}
        </aside>
      )}

      <section className={styles.ideaGrid} aria-label="Project ideas">
        {ideas.map((idea) => (
          <IdeaCard
            key={idea.idea_id}
            {...idea}
            onVote={isVotingActive ? () => handleVoteWrapper(idea.idea_id) : () => {}}
            isVoted={votedIdeas.has(idea.idea_id)}
            remainingVotes={remainingVotes}
            votingActive={isVotingActive}
          />
        ))}
      </section>
    </main>
  );
};

export default Voting;