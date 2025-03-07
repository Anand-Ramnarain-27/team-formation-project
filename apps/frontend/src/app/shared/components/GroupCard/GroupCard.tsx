import React, { useState, useEffect } from 'react';
import styles from './GroupCard.module.css';
import { Group, User } from '@/app/shared/utils/types';
import Button from '@/app/shared/components/Button/Button';
import style from '@/app/shared/components/Button/Button.module.css';
import Card from '@/app/shared/components/Card/Card';

type GroupCardProps = {
  group: Group;
  isExpanded?: boolean;
  onExpand?: (groupId: number) => void;
  onEdit?: (group: Group) => void;
  onManageMembers?: (group: Group) => void;
  showActions?: boolean;
  className?: string;
};

const GroupCard = ({
  group,
  isExpanded = false,
  onExpand,
  onEdit,
  onManageMembers,
  showActions = true,
}: GroupCardProps) => {
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString();

  const [themeName, setThemeName] = useState<string>('Loading...');
  const [isLoading, setIsLoading] = useState(true);
  const [teamLeadName, setTeamLeadName] = useState<string>('Loading...');
  const [teamLeadDetails, setTeamLeadDetails] = useState<string>('Loading...');
  const [members, setMembers] = useState<User[]>([]);

  const fetchThemeName = async () => {
    try {
      if (group.theme_id) {
        const response = await fetch(
          `http://localhost:7071/api/theme?id=${group.theme_id}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch theme');
        }

        const theme = await response.json();

        if (theme) {
          setThemeName(theme.title); 
        } else {
          setThemeName('Unknown Theme');
        }
      }
    } catch (error) {
      console.error('Error fetching theme name:', error);
      setThemeName('Unknown Theme'); 
    }
  };

  // No need to fetch team lead separately as it's now included in group members API response
  const fetchGroupData = async () => {
    try {
      if (isExpanded && group.group_id) {
        const response = await fetch(
          `http://localhost:7071/api/groupMember?id=${group.group_id}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch group members');
        }

        const groupMembersData = await response.json();
        
        if (Array.isArray(groupMembersData) && groupMembersData.length > 0) {
          // Extract all members including team lead
          const membersList = groupMembersData.map(item => item.member);
          setMembers(membersList);
          
          // Find team lead from the members list
          if (group.team_lead) {
            const teamLead = membersList.find(member => member.user_id === group.team_lead);
            if (teamLead) {
              setTeamLeadName(teamLead.name);
              setTeamLeadDetails(teamLead.email);
            } else {
              // If team lead is not in members list (though it should be based on updated API)
              fetchTeamLeadSeparately();
            }
          }
        } else {
          setMembers([]);
          fetchTeamLeadSeparately(); // Fallback if no members returned
        }
      } else if (group.team_lead) {
        // If not expanded but we still need team lead info
        fetchTeamLeadSeparately();
      }
    } catch (error) {
      console.error('Error fetching group data:', error);
      setMembers([]);
      fetchTeamLeadSeparately(); // Fallback on error
    }
  };

  // Fallback method to fetch team lead separately if needed
  const fetchTeamLeadSeparately = async () => {
    try {
      if (group.team_lead) {
        const response = await fetch(`http://localhost:7071/api/user?id=${group.team_lead}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }

        const lead = await response.json();

        if (lead) {
          setTeamLeadName(lead.name);
          setTeamLeadDetails(lead.email);
        } else {
          setTeamLeadName('Unknown User');
        }
      }
    } catch (error) {
      console.error('Error fetching team lead:', error);
      setTeamLeadName('Unknown User'); 
    }
  };

  // Load basic data
  useEffect(() => {
    const loadBasicData = async () => {
      setIsLoading(true);
      await fetchThemeName();
      setIsLoading(false);
    };
    
    if (group.theme_id) {
      loadBasicData();
    }
  }, [group.theme_id]);

  // Load members and team lead when expanded
  useEffect(() => {
    if (isExpanded || group.team_lead) {
      fetchGroupData();
    }
  }, [isExpanded, group.group_id, group.team_lead]);

  const memberCount = members.length;

  return (
    <Card>
      <header className={styles.header}>
        <section className={styles.headerContent}>
          <h3 className={styles.title}>{group.group_name}</h3>
          <p className={styles.theme}>Theme: {themeName}</p>
          <div className={styles.meta}>
            <time dateTime={group.created_at}>
              Created: {formatDate(group.created_at)}
            </time>
            {group.average_rating && (
              <span className={styles.rating}>
                Rating: {group.average_rating.toFixed(1)}
              </span>
            )}
          </div>
        </section>

        {showActions && (
          <nav className={styles.actions}>
            {onEdit && (
              <Button onClick={() => onEdit(group)} className={style.fourth}>
                Edit
              </Button>
            )}
            {onExpand && (
              <Button
                onClick={() => onExpand(group.group_id)}
                className={style.fourth}
              >
                {isExpanded ? 'Collapse' : 'Expand'}
              </Button>
            )}
          </nav>
        )}
      </header>

      {isExpanded && (
        <section className={styles.content}>
          <div className={styles.leadContainer}>
            <article>
              <h4 className={styles.sectionTitle}>Team Lead</h4>
              {group.team_lead ? (
                <section className={styles.leadInfo}>
                  <h5 className={styles.memberName}>
                    {teamLeadName}
                  </h5>
                  <p className={styles.memberEmail}>
                    {teamLeadDetails}
                  </p>
                </section>
              ) : (
                <p>No team lead assigned</p>
              )}
            </article>
            {onManageMembers && (
              <Button
                onClick={() => onManageMembers(group)}
                className={style.fourth}
              >
                Manage Members
              </Button>
            )}
          </div>

          <section className={styles.membersList}>
            <h4 className={styles.sectionTitle}>
              Members ({isLoading ? "Loading..." : memberCount})
            </h4>
            
            {isLoading ? (
              <p>Loading group members...</p>
            ) : memberCount > 0 ? (
              <ul className={styles.membersGrid}>
                {members.map((member) => (
                  <li key={member.user_id} className={styles.memberItem}>
                    <h5 className={styles.memberName}>
                      {member.name}
                      {member.user_id === group.team_lead && ' (Team Lead)'}
                    </h5>
                    <p className={styles.memberEmail}>{member.email}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No members in this group.</p>
            )}
          </section>
        </section>
      )}
    </Card>
  );
};

export default GroupCard;