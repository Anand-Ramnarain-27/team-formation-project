import React, { useState } from 'react';
import styles from './Analytics.module.css';

interface StudentMetrics {
  participationRate: string;
  ideasSubmitted: number;
  averageRating: number;
  votesGiven: number;
  reviewsGiven: number;
}

interface Student {
  id: number;
  name: string;
  email: string;
  groupName: string;
  metrics: StudentMetrics;
}

interface ThemeStats {
  totalStudents: number;
  activeGroups: number;
  averageRating: number;
}

interface MetricCardProps {
  icon: string;
  label: string;
  value: number | string;
  colorClass: string;
}

interface StudentDetailsProps {
  student: Student;
}

const Analytics: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Mock data - replace with actual API calls
  const themeStats: ThemeStats = {
    totalStudents: 150,
    activeGroups: 15,
    averageRating: 4.2,
  };

  const mockStudents: Student[] = [
    {
      id: 1,
      name: 'Alice Johnson',
      email: 'alice@university.edu',
      groupName: 'Innovation Team',
      metrics: {
        participationRate: '95%',
        ideasSubmitted: 3,
        averageRating: 4.5,
        votesGiven: 12,
        reviewsGiven: 8,
      },
    },
    // Add more mock students
  ];

  const filteredStudents = mockStudents.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const MetricCard: React.FC<MetricCardProps> = ({
    icon,
    label,
    value,
    colorClass,
  }) => (
    <div className={styles.card}>
      <div className={styles.metricCard}>
        <div className={`${styles.metricIcon} ${styles[colorClass]}`}>
          {icon}
        </div>
        <div className={styles.metricContent}>
          <div className={styles.metricLabel}>{label}</div>
          <div className={styles.metricValue}>{value}</div>
        </div>
      </div>
    </div>
  );

  const StudentSearch: React.FC = () => (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Student Analytics</h2>
      </div>
      <input
        type="text"
        className={styles.searchInput}
        placeholder="Search students..."
        value={searchQuery}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSearchQuery(e.target.value)
        }
      />
      <div className={styles.studentList}>
        {filteredStudents.map((student) => (
          <div
            key={student.id}
            className={`${styles.studentCard} ${
              selectedStudent?.id === student.id ? styles.selected : ''
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
    </div>
  );

  const StudentDetails: React.FC<StudentDetailsProps> = ({ student }) => {
    if (!student) return null;

    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Student Details</h2>
        </div>
        <div className={styles.studentMetrics}>
          {Object.entries(student.metrics).map(([key, value]) => (
            <div key={key} className={styles.metricBox}>
              <div className={styles.metricTitle}>
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
              <div className={styles.metricNumber}>{String(value)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.metricsGrid}>
        <MetricCard
          icon="👥"
          label="Total Students"
          value={themeStats.totalStudents}
          colorClass="metricBlue"
        />
        <MetricCard
          icon="🏆"
          label="Active Groups"
          value={themeStats.activeGroups}
          colorClass="metricYellow"
        />
        <MetricCard
          icon="⭐"
          label="Average Rating"
          value={themeStats.averageRating}
          colorClass="metricPurple"
        />
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Participation Progress</h2>
          </div>
          <div className={styles.chart}>
            {/* Replace with your preferred charting solution */}
            <div>Chart Placeholder</div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Rating Distribution</h2>
          </div>
          <div className={styles.chart}>
            {/* Replace with your preferred charting solution */}
            <div>Chart Placeholder</div>
          </div>
        </div>

        <div className={`${styles.card} ${styles.fullWidth}`}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Weekly Activity</h2>
          </div>
          <div className={styles.chart}>
            {/* Replace with your preferred charting solution */}
            <div>Chart Placeholder</div>
          </div>
        </div>
      </div>

      <div className={styles.studentSection}>
        <StudentSearch />
        {selectedStudent && <StudentDetails student={selectedStudent} />}
      </div>
    </div>
  );
};

export default Analytics;
