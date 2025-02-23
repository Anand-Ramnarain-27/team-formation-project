import React, { useState, useEffect } from 'react';
import styles from './Analytics.module.css';
import { AnalyticsReport, Student } from '@/app/shared/utils/types';
import Card from '@/app/shared/components/Card/Card';
import TextInput from '@/app/shared/components/Form/TextInput';
import {
  LoadingState,
  EmptyState,
} from '@/app/shared/components/States/States';

interface MetricCardProps {
  icon: string;
  label: string;
  value: number | string;
  colorClass: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  label,
  value,
  colorClass,
}) => (
  <Card>
    <article className={styles.metricCard}>
      <span className={`${styles.metricIcon} ${styles[colorClass]}`}>
        {icon}
      </span>
      <section className={styles.metricContent}>
        <h3 className={styles.metricLabel}>{label}</h3>
        <p className={styles.metricValue}>{value}</p>
      </section>
    </article>
  </Card>
);

const StudentCard: React.FC<{
  student: Student;
  isSelected: boolean;
  onSelect: (student: Student) => void;
}> = ({ student, isSelected, onSelect }) => (
  <article
    className={`${styles.studentCard} ${isSelected ? styles.selected : ''}`}
    onClick={() => onSelect(student)}
  >
    <header className={styles.studentHeader}>
      <span className={styles.avatar}>
        {student.name
          .split(' ')
          .map((n) => n[0])
          .join('')}
      </span>
      <section className={styles.studentInfo}>
        <h3 className={styles.studentName}>{student.name}</h3>
        <p className={styles.studentEmail}>{student.email}</p>
      </section>
    </header>
  </article>
);

const StudentMetric: React.FC<{ title: string; value: string | number }> = ({
  title,
  value,
}) => (
  <article className={styles.metricBox}>
    <h4 className={styles.metricTitle}>{title}</h4>
    <p className={styles.metricNumber}>{value}</p>
  </article>
);

const Analytics: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsReport | null>(
    null
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStudentsLoading, setIsStudentsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulated API calls
        const mockAnalyticsData: AnalyticsReport = {
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

        setAnalyticsData(mockAnalyticsData);
        setStudents(mockStudents);
        setIsLoading(false);
        setIsStudentsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
        setIsStudentsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <LoadingState message="Loading analytics..." />;
  }

  return (
    <main className={styles.dashboard}>
      <section className={styles.metricsGrid}>
        <MetricCard
          icon="👥"
          label="Total Students"
          value={analyticsData?.total_students || 0}
          colorClass="metricBlue"
        />
        <MetricCard
          icon="💡"
          label="Ideas Submitted"
          value={analyticsData?.participation_stats.ideas_submitted || 0}
          colorClass="metricYellow"
        />
        <MetricCard
          icon="⭐"
          label="Average Rating"
          value={analyticsData?.average_rating || 0}
          colorClass="metricPurple"
        />
      </section>

      <section className={styles.chartsGrid}>
        <Card title="Ideas Distribution">
          <figure className={styles.chart}>
            <figcaption>Ideas Distribution Chart</figcaption>
            {/* Chart implementation here */}
          </figure>
        </Card>

        <Card title="Rating Distribution">
          <figure className={styles.chart}>
            <figcaption>Rating Distribution Chart</figcaption>
            {/* Chart implementation here */}
          </figure>
        </Card>

        <Card title="Activity Overview" className={styles.fullWidth}>
          <figure className={styles.chart}>
            <figcaption>Activity Overview Chart</figcaption>
            {/* Chart implementation here */}
          </figure>
        </Card>
      </section>

      <section className={styles.studentSection}>
        {isStudentsLoading ? (
          <LoadingState message="Loading students..." />
        ) : students.length === 0 ? (
          <EmptyState
            title="No Students Found"
            description="There are no students to display at this time."
          />
        ) : (
          <Card title="Student Analytics">
            <TextInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search students..."
              className={styles.searchInput}
            />
            <section className={styles.studentList}>
              {filteredStudents.map((student) => (
                <StudentCard
                  key={student.user_id}
                  student={student}
                  isSelected={selectedStudent?.user_id === student.user_id}
                  onSelect={setSelectedStudent}
                />
              ))}
            </section>
          </Card>
        )}

        {selectedStudent && (
          <Card title="Student Details">
            <section className={styles.studentMetrics}>
              <StudentMetric
                title="Ideas Submitted"
                value={selectedStudent.metrics.ideas_submitted}
              />
              <StudentMetric
                title="Votes Given"
                value={selectedStudent.metrics.votes_given}
              />
              <StudentMetric
                title="Reviews Given"
                value={selectedStudent.metrics.reviews_given}
              />
              <StudentMetric
                title="Average Rating"
                value={selectedStudent.metrics.average_rating_received}
              />
              <StudentMetric
                title="Participation Rate"
                value={selectedStudent.metrics.participation_rate}
              />
            </section>
          </Card>
        )}
      </section>
    </main>
  );
};

export default Analytics;
