import React, { useState, useEffect, useCallback } from 'react';
import styles from './Analytics.module.css';
import {
  AnalyticsReport,
  Student,
  Theme,
  ParticipationStats,
} from '@/app/shared/utils/types';
import Card from '@/app/shared/components/Card/Card';
import TextInput from '@/app/shared/components/Form/TextInput';
import SelectInput from '@/app/shared/components/SelectInput/SelectInput';
import Tabs from '@/app/shared/components/Tabs/Tabs';
import Button from '@/app/shared/components/Button/Button';
import useFetch from '@/app/shared/hooks/useFetch';
import {
  LoadingState,
  EmptyState,
} from '@/app/shared/components/States/States';

type TabType = 'themes' | 'students';

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

const API_BASE_URL = `http://localhost:7071`;

const Analytics: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<number | null>(null);
  const [studentDetails, setStudentDetails] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('themes');

  const { data: themes = [], loading: isThemesLoading } = useFetch<Theme[]>(
    `${API_BASE_URL}/api/theme`,
    []
  );

  const { data: allUsers = [], loading: isUsersLoading } = useFetch<any[]>(
    `${API_BASE_URL}/api/user`,
    []
  );

  const {
    data: globalAnalyticsData = getEmptyAnalyticsReport(),
    loading: isGlobalAnalyticsLoading,
  } = useFetch<AnalyticsReport>(
    `${API_BASE_URL}/api/generateAllThemesAnalytics`,
    getEmptyAnalyticsReport()
  );

  const themeAnalyticsUrl = selectedTheme
    ? `${API_BASE_URL}/api/generateAnalytics?themeId=${selectedTheme}`
    : '';
  const {
    data: analyticsData = getEmptyAnalyticsReport(selectedTheme),
    loading: isThemeAnalyticsLoading,
  } = useFetch<AnalyticsReport>(
    themeAnalyticsUrl,
    getEmptyAnalyticsReport(selectedTheme)
  );

  const students: Student[] = React.useMemo(() => {
    const studentsOnly = allUsers.filter(
      (user) => user.role && user.role.toLowerCase() === 'student'
    );

    return studentsOnly.map((user) => ({
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      group_name: '',
      metrics: {
        ideas_submitted: 0,
        votes_given: 0,
        reviews_given: 0,
        average_rating_received: 0,
        participation_rate: '0%',
      },
    }));
  }, [allUsers]);

  const isStudentsLoading = isUsersLoading;
  const isLoading = isGlobalAnalyticsLoading || isThemesLoading;

  function getEmptyAnalyticsReport(
    themeId: number | null = null
  ): AnalyticsReport {
    return {
      report_id: 0,
      theme_id: themeId || 0,
      total_students: 0,
      total_reports: 0,
      average_rating: 0,
      participation_stats: {
        ideas_submitted: 0,
        votes_cast: 0,
        reviews_completed: 0,
        totalIdeas: 0,
        totalVotes: 0,
        totalReviews: 0,
        averageRating: 0,
      },
    };
  }

  useEffect(() => {
    if (themes.length > 0 && !selectedTheme) {
      setSelectedTheme(themes[0].theme_id);
    }
  }, [themes, selectedTheme]);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      if (!selectedStudent) return;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/studentProfile?userId=${selectedStudent.user_id}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch student profile');
        }

        const profileData = await response.json();

        const updatedStudent = {
          ...selectedStudent,
          group_name:
            profileData.groups.length > 0
              ? profileData.groups[0].group_name
              : 'No Group',
          metrics: {
            ideas_submitted: profileData.participationStats.totalIdeas,
            votes_given: profileData.participationStats.totalVotes,
            reviews_given: profileData.participationStats.totalReviews,
            average_rating_received:
              profileData.participationStats.averageRating.toFixed(1),
            participation_rate: calculateParticipationRate(profileData),
          },
        };

        setSelectedStudent(updatedStudent);
        setStudentDetails(profileData);
      } catch (error) {
        console.error('Error fetching student details:', error);
      }
    };

    fetchStudentDetails();
  }, [selectedStudent?.user_id]);

  const calculateParticipationRate = (profileData: any): string => {
    const totalActivities =
      profileData.participationStats.totalIdeas +
      profileData.participationStats.totalVotes +
      profileData.participationStats.totalReviews;

    const maxActivities = 10;
    const rate = Math.min(
      100,
      Math.round((totalActivities / maxActivities) * 100)
    );

    return `${rate}%`;
  };

  const renderThemeSelector = () => (
    <div className={styles.themeSelector}>
      <SelectInput
        value={selectedTheme?.toString() || ''}
        onChange={(value: any) => setSelectedTheme(Number(value))}
        options={themes.map((theme) => ({
          value: theme.theme_id.toString(),
          label: theme.title,
        }))}
        className={styles.themeSelect}
      />
    </div>
  );

  const getParticipationRate = (stats: ParticipationStats): string => {
    if (!stats) return '0%';

    const totalActivities =
      stats.totalIdeas + stats.totalVotes + stats.totalReviews;
    const maxActivitiesPerStudent = 10;
    const totalStudents = globalAnalyticsData?.total_students || 1;
    const maxPossibleActivities = totalStudents * maxActivitiesPerStudent;

    const rate = Math.min(
      100,
      Math.round((totalActivities / maxPossibleActivities) * 100)
    );
    return `${rate}%`;
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <LoadingState message="Loading analytics..." />;
  }

  const tabs: Array<{ id: TabType; label: string }> = [
    { id: 'themes', label: 'Theme Analytics' },
    { id: 'students', label: 'Student Analytics' },
  ];

  const handleTabChange = (tabId: string) => {
    if (isValidTab(tabId)) {
      setActiveTab(tabId);
    }
  };

  const isValidTab = (tab: string): tab is TabType => {
    return tabs.map((t) => t.id).includes(tab as TabType);
  };

  return (
    <main className={styles.dashboard}>
      <section className={styles.analyticsHeader}>
        <nav>
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </nav>

        {activeTab === 'themes' && renderThemeSelector()}
      </section>

      {activeTab === 'themes' ? (
        <>
          <section className={styles.metricsGrid}>
            <MetricCard
              icon="📚"
              label="Total Themes"
              value={themes.length}
              colorClass="metricGreen"
            />
            <MetricCard
              icon="👥"
              label="Total Students"
              value={globalAnalyticsData?.total_students || 0}
              colorClass="metricBlue"
            />
            <MetricCard
              icon="💡"
              label="Total Ideas"
              value={globalAnalyticsData?.participation_stats.totalIdeas || 0}
              colorClass="metricYellow"
            />
          </section>

          <section className={styles.themeAnalytics}>
            <Card
              title={`Theme Analytics: ${
                themes.find((t) => t.theme_id === selectedTheme)?.title ||
                'Loading...'
              }`}
            >
              {isThemeAnalyticsLoading ? (
                <LoadingState message="Loading theme analytics..." />
              ) : (
                <div className={styles.themeMetricsGrid}>
                  <div className={styles.themeMetric}>
                    <h3>Students</h3>
                    <p className={styles.metricValue}>
                      {analyticsData?.total_students || 0}
                    </p>
                  </div>
                  <div className={styles.themeMetric}>
                    <h3>Ideas Submitted</h3>
                    <p className={styles.metricValue}>
                      {analyticsData?.participation_stats.ideas_submitted || 0}
                    </p>
                  </div>
                  <div className={styles.themeMetric}>
                    <h3>Votes Cast</h3>
                    <p className={styles.metricValue}>
                      {analyticsData?.participation_stats.votes_cast || 0}
                    </p>
                  </div>
                  <div className={styles.themeMetric}>
                    <h3>Reviews Completed</h3>
                    <p className={styles.metricValue}>
                      {analyticsData?.participation_stats.reviews_completed ||
                        0}
                    </p>
                  </div>
                  <div className={styles.themeMetric}>
                    <h3>Average Rating</h3>
                    <p className={styles.metricValue}>
                      {(analyticsData?.average_rating || 0).toFixed(1)}
                    </p>
                  </div>
                  <div className={styles.themeMetric}>
                    <h3>Participation Rate</h3>
                    <p className={styles.metricValue}>
                      {analyticsData
                        ? getParticipationRate(
                            analyticsData.participation_stats
                          )
                        : '0%'}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </section>

          <section className={styles.chartsGrid}>
            <Card title="Ideas Distribution">
              <figure className={styles.chart}>
                <div className={styles.chartPlaceholder}>
                  <h3>Ideas by Status</h3>
                  <div className={styles.distributionBar}>
                    <div
                      className={`${styles.distributionSegment} ${styles.approvedSegment}`}
                      style={{
                        width: `${
                          analyticsData?.participation_stats.ideas_submitted
                            ? (analyticsData.total_reports /
                                analyticsData.participation_stats
                                  .ideas_submitted) *
                              100
                            : 0
                        }%`,
                      }}
                    >
                      Approved
                    </div>
                    <div
                      className={`${styles.distributionSegment} ${styles.pendingSegment}`}
                      style={{
                        width: `${
                          analyticsData?.participation_stats.ideas_submitted
                            ? 100 -
                              (analyticsData.total_reports /
                                analyticsData.participation_stats
                                  .ideas_submitted) *
                                100
                            : 0
                        }%`,
                      }}
                    >
                      Pending
                    </div>
                  </div>
                </div>
              </figure>
            </Card>

            <Card title="Rating Distribution">
              <figure className={styles.chart}>
                <div className={styles.chartPlaceholder}>
                  <h3>Average Ratings</h3>
                  <div className={styles.ratingDistribution}>
                    <div className={styles.starRating}>
                      <span className={styles.stars}>{'★'.repeat(5)}</span>
                      <div
                        className={styles.ratingBar}
                        style={{
                          width: `${
                            analyticsData?.average_rating
                              ? (analyticsData.average_rating / 5) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className={styles.ratingValue}>
                      {(analyticsData?.average_rating || 0).toFixed(1)}
                    </span>
                  </div>
                </div>
              </figure>
            </Card>

            <Card title="Activity Overview" className={styles.fullWidth}>
              <figure className={styles.chart}>
                <div className={styles.chartPlaceholder}>
                  <h3>Participation Summary</h3>
                  <div className={styles.activitySummary}>
                    <div className={styles.activityMetric}>
                      <div className={styles.activityLabel}>Ideas</div>
                      <div className={styles.activityValue}>
                        {analyticsData?.participation_stats.ideas_submitted ||
                          0}
                      </div>
                    </div>
                    <div className={styles.activityMetric}>
                      <div className={styles.activityLabel}>Votes</div>
                      <div className={styles.activityValue}>
                        {analyticsData?.participation_stats.votes_cast || 0}
                      </div>
                    </div>
                    <div className={styles.activityMetric}>
                      <div className={styles.activityLabel}>Reviews</div>
                      <div className={styles.activityValue}>
                        {analyticsData?.participation_stats.reviews_completed ||
                          0}
                      </div>
                    </div>
                  </div>
                </div>
              </figure>
            </Card>
          </section>
        </>
      ) : (
        <>
          <section className={styles.metricsGrid}>
            <MetricCard
              icon="👥"
              label="Total Students"
              value={students.length}
              colorClass="metricBlue"
            />
            <MetricCard
              icon="💡"
              label="Ideas Submitted"
              value={
                globalAnalyticsData?.participation_stats.ideas_submitted || 0
              }
              colorClass="metricYellow"
            />
            <MetricCard
              icon="⭐"
              label="Average Rating"
              value={(globalAnalyticsData?.average_rating || 0).toFixed(1)}
              colorClass="metricPurple"
            />
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
        </>
      )}
    </main>
  );
};

export default Analytics;
