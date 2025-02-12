// AdminIdeaReview.tsx
import React, { useState } from 'react';
import styles from './Review.module.css';

// Types
type Idea = {
  idea_id: number;
  theme_id: number;
  submitted_by: number;
  idea_name: string;
  description: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  created_at: string;
  votes_count: number;
  submitted_by_name: string;
};

type Theme = {
  theme_id: number;
  title: string;
  submission_deadline: string;
  voting_deadline: string;
};

// Dummy Data
const dummyThemes: Theme[] = [
  {
    theme_id: 1,
    title: "Mobile App Innovation",
    submission_deadline: "2025-03-01T00:00:00Z",
    voting_deadline: "2025-03-15T00:00:00Z"
  },
  {
    theme_id: 2,
    title: "Sustainable Technology",
    submission_deadline: "2025-03-10T00:00:00Z",
    voting_deadline: "2025-03-25T00:00:00Z"
  },
  {
    theme_id: 3,
    title: "AI for Education",
    submission_deadline: "2025-03-20T00:00:00Z",
    voting_deadline: "2025-04-05T00:00:00Z"
  }
];

const dummyIdeas: Record<number, Idea[]> = {
  1: [
    {
      idea_id: 1,
      theme_id: 1,
      submitted_by: 101,
      idea_name: "AR Navigation Assistant",
      description: "A mobile app that uses augmented reality to provide real-time navigation assistance, highlighting points of interest and providing contextual information about surroundings.",
      status: "Pending",
      created_at: "2025-02-15T10:30:00Z",
      votes_count: 15,
      submitted_by_name: "Alice Johnson"
    },
    {
      idea_id: 2,
      theme_id: 1,
      submitted_by: 102,
      idea_name: "Community Food Share",
      description: "Mobile platform connecting local restaurants with food surplus to nearby shelters and food banks, reducing waste and helping those in need.",
      status: "Approved",
      created_at: "2025-02-14T15:45:00Z",
      votes_count: 23,
      submitted_by_name: "Bob Smith"
    },
    {
      idea_id: 3,
      theme_id: 1,
      submitted_by: 103,
      idea_name: "Smart Health Tracker",
      description: "AI-powered health monitoring app that provides personalized wellness recommendations based on user activity and vital signs.",
      status: "Rejected",
      created_at: "2025-02-13T09:15:00Z",
      votes_count: 8,
      submitted_by_name: "Carol White"
    }
  ],
  2: [
    {
      idea_id: 4,
      theme_id: 2,
      submitted_by: 104,
      idea_name: "Solar Power Optimizer",
      description: "Smart system that optimizes solar panel positioning and power distribution based on weather patterns and usage habits.",
      status: "Pending",
      created_at: "2025-02-16T11:20:00Z",
      votes_count: 19,
      submitted_by_name: "David Brown"
    },
    {
      idea_id: 5,
      theme_id: 2,
      submitted_by: 105,
      idea_name: "Waste Management AI",
      description: "AI-powered waste sorting system that automatically categorizes and processes recyclable materials.",
      status: "Approved",
      created_at: "2025-02-15T14:30:00Z",
      votes_count: 27,
      submitted_by_name: "Emma Davis"
    }
  ],
  3: [
    {
      idea_id: 6,
      theme_id: 3,
      submitted_by: 106,
      idea_name: "Adaptive Learning Platform",
      description: "AI-driven platform that adjusts difficulty and content based on student performance and learning style.",
      status: "Pending",
      created_at: "2025-02-17T13:45:00Z",
      votes_count: 31,
      submitted_by_name: "Frank Wilson"
    },
    {
      idea_id: 7,
      theme_id: 3,
      submitted_by: 107,
      idea_name: "Virtual Study Groups",
      description: "AI-powered system that matches students with similar learning goals and schedules for optimal group study sessions.",
      status: "Pending",
      created_at: "2025-02-16T16:20:00Z",
      votes_count: 24,
      submitted_by_name: "Grace Lee"
    }
  ]
};

const Review: React.FC = () => {
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ideas, setIdeas] = useState<Idea[]>([]);

  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const themeId = event.target.value;
    setSelectedTheme(themeId);
    
    if (themeId === "all") {
      // Flatten all ideas into a single array
      setIdeas(Object.values(dummyIdeas).flat());
    } else {
      setIdeas(dummyIdeas[parseInt(themeId)] || []);
    }
  };

  const updateIdeaStatus = (ideaId: number, status: 'Approved' | 'Rejected') => {
    setIdeas(ideas.map(idea => 
      idea.idea_id === ideaId ? { ...idea, status } : idea
    ));
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
        <h1 className={styles.title}>Idea Review & Voting Dashboard</h1>
        
        <div className={styles.filters}>
          <select 
            className={styles.select}
            value={selectedTheme}
            onChange={handleThemeChange}
          >
            <option value="all">All Theme</option>
            {dummyThemes.map(theme => (
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
                  <span>By: {idea.submitted_by_name}</span>
                  <span>👍 {idea.votes_count} votes</span>
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