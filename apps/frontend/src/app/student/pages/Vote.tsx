import React, { useState, useEffect } from 'react';
import styles from './Voting.module.css';
import { Idea, Vote, Theme } from '@/app/shared/utils/types';
import Button from '@/app/shared/components/Button/Button';
import SelectInput from '@/app/shared/components/SelectInput/SelectInput';
import {
  LoadingState,
  EmptyState,
} from '@/app/shared/components/States/States';
import IdeaCard from '@/app/shared/components/IdeaCard/IdeaCard';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7071/api';

const Voting: React.FC = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [theme, setTheme] = useState<Theme | null>(null);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedThemeId, setSelectedThemeId] = useState('');
  const [remainingVotes, setRemainingVotes] = useState(3);
  const [votedIdeas, setVotedIdeas] = useState<Set<number>>(new Set());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isVotingActive, setIsVotingActive] = useState(false);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const userJson =
          localStorage.getItem('currentUser') ||
          sessionStorage.getItem('currentUser');

        if (userJson) {
          const user = JSON.parse(userJson);
          setCurrentUser(user);
          return user;
        } else {
          throw new Error('User not logged in');
        }
      } catch (err) {
        console.error('Error getting current user:', err);
        setError('Please log in to view and vote for ideas.');
        return null;
      }
    };

    const fetchThemes = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/theme`);
        if (!response.ok) {
          throw new Error('Failed to fetch themes');
        }

        const themesData = await response.json();
        setThemes(themesData);

        const urlParams = new URLSearchParams(window.location.search);
        const themeId = urlParams.get('themeId');

        if (themeId) {
          setSelectedThemeId(themeId);
        } else if (themesData.length > 0) {
          setSelectedThemeId(themesData[0].theme_id.toString());
        }

        return themesData;
      } catch (err) {
        console.error('Error fetching themes:', err);
        setError('Failed to load available themes.');
        return [];
      }
    };

    const initialize = async () => {
      setLoading(true);
      await getCurrentUser();
      await fetchThemes();
      setLoading(false);
    };

    initialize();
  }, []);

  useEffect(() => {
    if (!selectedThemeId || !currentUser) return;

    const fetchThemeAndIdeas = async () => {
      try {
        setLoading(true);

        const themeResponse = await fetch(
          `${API_BASE_URL}/theme?id=${selectedThemeId}`
        );
        if (!themeResponse.ok) {
          throw new Error('Failed to fetch theme details');
        }

        const themeData = await themeResponse.json();
        setTheme(themeData);

        const now = new Date();
        const submissionDeadline = new Date(themeData.submission_deadline);
        const votingDeadline = new Date(themeData.voting_deadline);

        const votingActive = now > submissionDeadline && now < votingDeadline;
        setIsVotingActive(votingActive);

        const ideasResponse = await fetch(
          `${API_BASE_URL}/idea?theme_id=${selectedThemeId}`
        );
        if (!ideasResponse.ok) {
          throw new Error('Failed to fetch ideas');
        }

        const ideasData = await ideasResponse.json();

        const ideasWithVotes = await Promise.all(
          ideasData.map(async (idea: Idea) => {
            const votesResponse = await fetch(
              `${API_BASE_URL}/vote?ideaId=${idea.idea_id}`
            );
            if (!votesResponse.ok) {
              throw new Error(`Failed to fetch votes for idea ${idea.idea_id}`);
            }

            const votesData = await votesResponse.json();
            return {
              ...idea,
              vote_count: votesData.length,
            };
          })
        );

        const approvedIdeas = ideasWithVotes.filter(
          (idea: Idea) => idea.status === 'Approved'
        );
        setIdeas(approvedIdeas);

        const votesResponse = await fetch(`${API_BASE_URL}/vote`);
        if (!votesResponse.ok) {
          throw new Error('Failed to fetch votes');
        }

        const votesData = await votesResponse.json();

        const userVotes = votesData.filter(
          (vote: Vote) => vote.voted_by === currentUser.user_id
        );

        const userVoteIds: number[] = userVotes.map((vote: Vote) => {
          return typeof vote.idea_id === 'number'
            ? vote.idea_id
            : Number(vote.idea_id);
        });

        setVotedIdeas(new Set(userVoteIds));

        setRemainingVotes(3 - userVoteIds.length);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load ideas. Please try again.');
        setLoading(false);
      }
    };

    fetchThemeAndIdeas();
  }, [selectedThemeId, currentUser]);

  const handleThemeChange = (themeId: string) => {
    setSelectedThemeId(themeId);
    const url = new URL(window.location.href);
    url.searchParams.set('themeId', themeId);
    window.history.pushState({}, '', url.toString());
  };

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

      setIdeas((prevIdeas) =>
        prevIdeas.map((idea) =>
          idea.idea_id === ideaId
            ? { ...idea, vote_count: (idea.vote_count || 0) + 1 }
            : idea
        )
      );

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

  const handleVoteWrapper = (ideaId: number): void => {
    handleVote(ideaId).catch((error) => {
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
            <Button onClick={() => (window.location.href = '/login')}>
              Log In
            </Button>
          }
        />
      </main>
    );
  }

  const themeOptions = themes.map((themeItem) => ({
    value: themeItem.theme_id.toString(),
    label: themeItem.title,
  }));

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>Vote for Project Ideas</h1>

        <div className={styles.themeSelection}>
          <label htmlFor="theme-select" className={styles.themeSelectLabel}>
            Select Theme:
          </label>
          <SelectInput
            value={selectedThemeId}
            onChange={handleThemeChange}
            options={themeOptions}
            placeholder="Select a theme"
            className={styles.themeSelect}
          />
        </div>

        {theme && <h2 className={styles.themeTitle}>{theme.title}</h2>}

        <div className={styles.votingStatus}>
          {isVotingActive ? (
            <p className={styles.votingActive}>
              Voting is open! You have{' '}
              <strong className={styles.votesRemaining}>
                {remainingVotes}
              </strong>{' '}
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

      {ideas.length === 0 ? (
        <EmptyState
          title="No ideas available"
          description={`There are no approved ideas available for voting in the selected theme.`}
          action={
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          }
        />
      ) : (
        <section className={styles.ideaGrid} aria-label="Project ideas">
          {ideas.map((idea) => (
            <IdeaCard
              key={idea.idea_id}
              {...idea}
              onVote={
                isVotingActive
                  ? () => handleVoteWrapper(idea.idea_id)
                  : () => {}
              }
              isVoted={votedIdeas.has(idea.idea_id)}
              remainingVotes={remainingVotes}
              votingActive={isVotingActive}
            />
          ))}
        </section>
      )}
    </main>
  );
};

export default Voting;
