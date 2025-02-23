import React, { useState, useEffect } from 'react';
import styles from './Voting.module.css';
import { Idea, Vote } from '@/app/shared/utils/types';
import Card from '@/app/shared/components/Card/Card';
import Button from '@/app/shared/components/Button/Button';
import {
  LoadingState,
  EmptyState,
} from '@/app/shared/components/States/States';
import IdeaCard from '@/app/shared/components/IdeaCard/IdeaCard';

const Voting: React.FC = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [remainingVotes, setRemainingVotes] = useState(3);
  const [votedIdeas, setVotedIdeas] = useState<Set<number>>(new Set());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const mockIdeas: Idea[] = [
    {
      idea_id: 1,
      theme_id: 1,
      submitted_by: 101,
      idea_name: 'Project Management Tool',
      description:
        'A collaborative tool for student teams to manage projects effectively',
      status: 'Approved',
      created_at: new Date().toISOString(),
      submitter_name: 'John Doe',
      vote_count: 12,
    },
    {
      idea_id: 2,
      theme_id: 1,
      submitted_by: 102,
      idea_name: 'Study Group Matcher',
      description:
        'AI-powered platform to match students with compatible study partners',
      status: 'Pending',
      created_at: new Date().toISOString(),
      submitter_name: 'Jane Smith',
      vote_count: 8,
    },
  ];

  useEffect(() => {
    const fetchIdeasAndVotes = async () => {
      try {
        setIdeas(mockIdeas);
        const userVotes = new Set<number>();
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

      setIdeas((prevIdeas) =>
        prevIdeas.map((idea) =>
          idea.idea_id === ideaId
            ? { ...idea, vote_count: (idea.vote_count || 0) + 1 }
            : idea
        )
      );

      setVotedIdeas((prevVotes) => new Set([...prevVotes, ideaId]));
      setRemainingVotes((prev) => prev - 1);
      setError('');
    } catch (err) {
      setError('Failed to submit vote. Please try again.');
    }
  };

  if (loading) {
    return (
      <main className={styles.container}>
        <LoadingState message="Loading ideas..." />
      </main>
    );
  }

  if (ideas.length === 0) {
    return (
      <main className={styles.container}>
        <EmptyState
          title="No ideas available"
          description="There are no ideas available for voting at this time."
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
        <p>
          Choose your favorite ideas for the upcoming project. You have{' '}
          <strong className={styles.votesRemaining}>{remainingVotes}</strong>{' '}
          votes remaining.
        </p>
      </header>

      {error && (
        <aside role="alert" className={styles.error}>
          {error}
        </aside>
      )}

      <section className={styles.ideaGrid} aria-label="Project ideas">
        {ideas.map((idea) => (
          <article key={idea.idea_id}>
            <IdeaCard
              {...idea}
              onVote={() => handleVote(idea.idea_id)}
              isVoted={votedIdeas.has(idea.idea_id)}
              remainingVotes={remainingVotes}
            />
          </article>
        ))}
      </section>
    </main>
  );
};

export default Voting;
