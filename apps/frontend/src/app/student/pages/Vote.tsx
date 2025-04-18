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
import useApi from '@/app/shared/hooks/useApi';

const Voting: React.FC = () => {
  const { get, post, patch, remove, loading} = useApi('');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [theme, setTheme] = useState<Theme | null>(null);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedThemeId, setSelectedThemeId] = useState('');
  const [remainingVotes, setRemainingVotes] = useState(3);
  const [votedIdeas, setVotedIdeas] = useState<Set<number>>(new Set());
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isVotingActive, setIsVotingActive] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const userJson =
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
        sessionStorage.removeItem('curentUser');
        return null;
      }
    };

    const fetchThemes = async () => {
      try {
        const themesData = await get('/theme');
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
        return [];
      }
    };

    const initialize = async () => {
      await getCurrentUser();
      await fetchThemes();
    };

    initialize();
  }, []);

  useEffect(() => {
    if (!selectedThemeId || !currentUser) return;
  
    const fetchThemeAndIdeas = async () => {
      try {
        const themeData = await get(`/theme?id=${selectedThemeId}`);
        setTheme(themeData);

        const now = new Date();
        const submissionDeadline = new Date(themeData.submission_deadline);
        const votingDeadline = new Date(themeData.voting_deadline);
        const votingActive = now > submissionDeadline && now < votingDeadline;
        setIsVotingActive(votingActive);
  
        const ideasData = await get(`/idea?theme_id=${selectedThemeId}`);

        const votesData = await get('/vote');
  
        const userVotes = votesData.filter(
          (vote: Vote) =>
            vote.voted_by === currentUser.user_id &&
            ideasData.some((idea: Idea) => idea.idea_id === vote.idea_id)
        );
  
        setRemainingVotes(3 - userVotes.length);

        const userVoteIds: number[] = userVotes.map((vote: Vote) => vote.idea_id);
        setVotedIdeas(new Set(userVoteIds));

        const ideasWithVotes = ideasData.map((idea: Idea) => ({
          ...idea,
          vote_count: votesData.filter((vote: Vote) => vote.idea_id === idea.idea_id).length,
        }));
  
        setIdeas(ideasWithVotes);
      } catch (err) {
        console.error('Error fetching data:', err);
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
      return;
    }
  
    if (!isVotingActive) {
      setError('Voting is not currently active for this theme');
      return;
    }
  
    try {
      const idea = ideas.find((idea) => idea.idea_id === ideaId);
      if (idea && idea.submitted_by === currentUser.user_id) {
        setError('You cannot vote for your own idea!');
        return;
      }

      if (votedIdeas.has(ideaId)) {
        setError('You have already voted for this idea!');
        return;
      }

      if (remainingVotes <= 0) {
        setError('You have used all your votes for this theme!');
        return;
      }
  
      await post('/vote', {
        idea_id: ideaId,
        voted_by: currentUser.user_id,
      });
  
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
    } catch (err) {
      console.error('Error submitting vote:', err);
    }
  };

  const handleVoteWrapper = (ideaId: number): void => {
    handleVote(ideaId).catch((error) => {
      console.error('Error in vote handler:', error);
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
