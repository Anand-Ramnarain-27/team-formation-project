import React, { useState, useEffect } from 'react';
import styles from './Review.module.css';
import { User, Theme, Idea } from '@/app/shared/utils/types';

const Review: React.FC = () => {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch themes and ideas from your API
  useEffect(() => {
    // Example API calls - replace with your actual API endpoints
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
        const url = selectedTheme === 'all' 
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

  const updateIdeaStatus = async (ideaId: number, status: 'Approved' | 'Rejected') => {
    try {
      // Update in database
      const response = await fetch(`/api/ideas/${ideaId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      // Update local state
      setIdeas(ideas.map(idea => 
        idea.idea_id === ideaId ? { ...idea, status } : idea
      ));
    } catch (error) {
      console.error('Error updating idea status:', error);
      // Add error handling UI feedback here
    }
  };

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.idea_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || idea.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Idea Review Dashboard</h1>
        
        <div className={styles.filters}>
          <select 
            className={styles.select}
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value)}
          >
            <option value="">Select Theme</option>
            <option value="all">All Themes</option>
            {themes.map(theme => (
              <option key={theme.theme_id} value={theme.theme_id}>
                {theme.title}
              </option>
            ))}
          </select>

          <select
            className={styles.select}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <input
            type="text"
            placeholder="Search ideas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.ideasList}>
          {filteredIdeas.map(idea => (
            <div key={idea.idea_id} className={styles.ideaCard}>
              <div className={styles.ideaContent}>
                <div className={styles.ideaHeader}>
                  <h3 className={styles.ideaName}>{idea.idea_name}</h3>
                  <span className={`${styles.status} ${styles[idea.status.toLowerCase()]}`}>
                    {idea.status}
                  </span>
                </div>
                
                <p className={styles.ideaDescription}>{idea.description}</p>
                
                <div className={styles.ideaMeta}>
                  <span>By: {idea.submitter_name}</span>
                  {idea.votes_count !== undefined && (
                    <span>👍 {idea.votes_count} votes</span>
                  )}
                  <span>Submitted: {new Date(idea.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {idea.status === 'Pending' && (
                <div className={styles.actions}>
                  <button
                    className={`${styles.button} ${styles.approveButton}`}
                    onClick={() => updateIdeaStatus(idea.idea_id, 'Approved')}
                  >
                    ✓ Approve
                  </button>
                  <button
                    className={`${styles.button} ${styles.rejectButton}`}
                    onClick={() => updateIdeaStatus(idea.idea_id, 'Rejected')}
                  >
                    ✕ Reject
                  </button>
                </div>
              )}
            </div>
          ))}

          {filteredIdeas.length === 0 && selectedTheme && (
            <div className={styles.emptyState}>
              No ideas found matching your criteria
            </div>
          )}

          {!selectedTheme && (
            <div className={styles.emptyState}>
              Select a theme to view ideas
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Review;