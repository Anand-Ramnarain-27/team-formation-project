// Review.tsx
import React, { useState, useEffect } from 'react';
import styles from './Review.module.css';
import { Theme, Idea } from '@/app/shared/utils/types';
import Card from '@/app/shared/components/Card/Card';
import Button from '@/app/shared/components/Button/Button';
import TextInput from '@/app/shared/components/Form/TextInput';
import StatusBadge from '@/app/shared/components/StatusBadge/StatusBadge';
import SelectInput from '@/app/shared/components/SelectInput/SelectInput';

const Review: React.FC = () => {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const response = await fetch('/api/themes');
        const data = await response.json();
        setThemes(data);
      } catch (error) {
        console.error('Error fetching themes:', error);
      }
    };
    fetchThemes();
  }, []);

  useEffect(() => {
    const fetchIdeas = async () => {
      if (!selectedTheme && selectedTheme !== 'all') return;
      try {
        const url =
          selectedTheme === 'all'
            ? '/api/ideas'
            : `/api/ideas?theme_id=${selectedTheme}`;
        const response = await fetch(url);
        const data = await response.json();
        setIdeas(data);
      } catch (error) {
        console.error('Error fetching ideas:', error);
      }
    };
    fetchIdeas();
  }, [selectedTheme]);

  const updateIdeaStatus = async (
    ideaId: number,
    status: 'Approved' | 'Rejected'
  ) => {
    try {
      const response = await fetch(`/api/ideas/${ideaId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      setIdeas(
        ideas.map((idea) =>
          idea.idea_id === ideaId ? { ...idea, status } : idea
        )
      );
    } catch (error) {
      console.error('Error updating idea status:', error);
    }
  };

  const filteredIdeas = ideas.filter((idea) => {
    const matchesSearch =
      idea.idea_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      idea.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const themeOptions = [
    { value: '', label: 'Select Theme' },
    { value: 'all', label: 'All Themes' },
    ...themes.map((theme) => ({
      value: theme.theme_id.toString(),
      label: theme.title,
    })),
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  return (
    <main className={styles.container}>
      <Card title="Idea Review Dashboard">
        <form className={styles.filters} onSubmit={(e) => e.preventDefault()}>
          <SelectInput
            value={selectedTheme}
            onChange={(value) => setSelectedTheme(value)}
            options={themeOptions}
            placeholder="Select Theme"
            className={styles.select}
          />
          <SelectInput
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            options={statusOptions}
            placeholder="Select Status"
            className={styles.select}
          />
          <TextInput
            value={searchTerm}
            onChange={(value) => setSearchTerm(value)}
            placeholder="Search ideas..."
            className={styles.searchInput}
          />
        </form>

        <section className={styles.ideasList}>
          {filteredIdeas.map((idea) => (
            <article key={idea.idea_id} className={styles.ideaCard}>
              <header className={styles.ideaContent}>
                <div className={styles.ideaHeader}>
                  <h3 className={styles.ideaName}>{idea.idea_name}</h3>
                  <StatusBadge
                    status={idea.status.toLowerCase()}
                    label={idea.status}
                  />
                </div>
                <p className={styles.ideaDescription}>{idea.description}</p>
                <footer className={styles.ideaMeta}>
                  <span>By: {idea.submitter_name}</span>
                  {idea.votes_count !== undefined && (
                    <span>👍 {idea.votes_count} votes</span>
                  )}
                  <time dateTime={idea.created_at}>
                    Submitted: {new Date(idea.created_at).toLocaleDateString()}
                  </time>
                </footer>
              </header>

              {idea.status === 'Pending' && (
                <aside className={styles.actions}>
                  <Button
                    onClick={() => updateIdeaStatus(idea.idea_id, 'Approved')}
                    className={`${styles.button} ${styles.approveButton}`}
                  >
                    ✓ Approve
                  </Button>
                  <Button
                    onClick={() => updateIdeaStatus(idea.idea_id, 'Rejected')}
                    className={`${styles.button} ${styles.rejectButton}`}
                  >
                    ✕ Reject
                  </Button>
                </aside>
              )}
            </article>
          ))}

          {filteredIdeas.length === 0 && selectedTheme && (
            <p className={styles.emptyState}>
              No ideas found matching your criteria
            </p>
          )}

          {!selectedTheme && (
            <p className={styles.emptyState}>Select a theme to view ideas</p>
          )}
        </section>
      </Card>
    </main>
  );
};

export default Review;
