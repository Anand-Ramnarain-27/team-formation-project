import React, { useState } from 'react';
import styles from './Analytics.module.css';
import { AnalyticsReport, Student } from '@/app/shared/utils/types';
import Card from '@/app/shared/components/Card/Card';

interface MetricCardProps {
  icon: string;
  label: string;
  value: number | string;
  colorClass: string;
}

const Analytics: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data based on your database schema - replace with actual API calls
  const analyticsData: AnalyticsReport = {
    report_id: 1,
    theme_id: 1,
    total_students: 150,
    total_reports: 450,
    average_rating: 4.2,
    participation_stats: {
      ideas_submitted: 125,
      votes_cast: 1200,
      reviews_completed: 300,
      totalIdeas: 5,
      totalVotes: 15,
      totalReviews: 12,
      averageRating: 4.2,
    },
  };

  const mockStudents: Student[] = [
    {
      user_id: 1,
      name: 'Alice Johnson',
      email: 'alice@university.edu',
      group_name: 'Innovation Team',
      metrics: {
        ideas_submitted: 2,
        votes_given: 15,
        reviews_given: 8,
        average_rating_received: 4.5,
        participation_rate: '95%',
      },
    },
  ];

  const MetricCard: React.FC<MetricCardProps> = ({
    icon,
    label,
    value,
    colorClass,
  }) => (
    <Card>
      <div className={styles.metricCard}>
        <div className={`${styles.metricIcon} ${styles[colorClass]}`}>
          {icon}
        </div>
        <div className={styles.metricContent}>
          <div className={styles.metricLabel}>{label}</div>
          <div className={styles.metricValue}>{value}</div>
        </div>
      </div>
    </Card>
  );

  const StudentSearch: React.FC = () => (
    <Card title="Student Analytics">
      <input
        type="text"
        className={styles.searchInput}
        placeholder="Search students..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <div className={styles.studentList}>
        {filteredStudents.map((student) => (
          <div
            key={student.user_id}
            className={`${styles.studentCard} ${
              selectedStudent?.user_id === student.user_id
                ? styles.selected
                : ''
            }`}
            onClick={() => setSelectedStudent(student)}
          >
            <div className={styles.studentHeader}>
              <div className={styles.avatar}>
                {student.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <div className={styles.studentInfo}>
                <div className={styles.studentName}>{student.name}</div>
                <div className={styles.studentEmail}>{student.email}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  const StudentDetails: React.FC<{ student: Student }> = ({ student }) => {
    if (!student) return null;

    return (
      <Card title="Student Details">
        <div className={styles.studentMetrics}>
          <div className={styles.metricBox}>
            <div className={styles.metricTitle}>Ideas Submitted</div>
            <div className={styles.metricNumber}>
              {student.metrics.ideas_submitted}
            </div>
          </div>
          <div className={styles.metricBox}>
            <div className={styles.metricTitle}>Votes Given</div>
            <div className={styles.metricNumber}>
              {student.metrics.votes_given}
            </div>
          </div>
          <div className={styles.metricBox}>
            <div className={styles.metricTitle}>Reviews Given</div>
            <div className={styles.metricNumber}>
              {student.metrics.reviews_given}
            </div>
          </div>
          <div className={styles.metricBox}>
            <div className={styles.metricTitle}>Average Rating</div>
            <div className={styles.metricNumber}>
              {student.metrics.average_rating_received}
            </div>
          </div>
          <div className={styles.metricBox}>
            <div className={styles.metricTitle}>Participation Rate</div>
            <div className={styles.metricNumber}>
              {student.metrics.participation_rate}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const filteredStudents = mockStudents.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.dashboard}>
      <div className={styles.metricsGrid}>
        <MetricCard
          icon="👥"
          label="Total Students"
          value={analyticsData.total_students}
          colorClass="metricBlue"
        />
        <MetricCard
          icon="💡"
          label="Ideas Submitted"
          value={analyticsData.participation_stats.ideas_submitted}
          colorClass="metricYellow"
        />
        <MetricCard
          icon="⭐"
          label="Average Rating"
          value={analyticsData.average_rating}
          colorClass="metricPurple"
        />
      </div>

      <div className={styles.chartsGrid}>
        <Card title="Ideas Distribution">
          <div className={styles.chart}>
            {/* Replace with your own chart implementation */}
            <div>Chart Placeholder</div>
          </div>
        </Card>

        <Card title="Rating Distribution">
          <div className={styles.chart}>
            {/* Replace with your own chart implementation */}
            <div>Chart Placeholder</div>
          </div>
        </Card>

        <Card title="Activity Overview" className={styles.fullWidth}>
          <div className={styles.chart}>
            {/* Replace with your own chart implementation */}
            <div>Chart Placeholder</div>
          </div>
        </Card>
      </div>

      <div className={styles.studentSection}>
        <StudentSearch />
        {selectedStudent && <StudentDetails student={selectedStudent} />}
      </div>
    </div>
  );
};

export default Analytics;
