import React from 'react';
import styles from './GroupCard.module.css';
import { Group } from '@/app/shared/utils/types';
import Button from '@/app/shared/components/Button/Button';
import style from '@/app/shared/components/Button/Button.module.css';
import Card from '../Card/Card';

interface GroupCardProps {
  group: Group;
  isExpanded?: boolean;
  onExpand?: (groupId: number) => void;
  onEdit?: (group: Group) => void;
  onManageMembers?: (group: Group) => void;
  showActions?: boolean;
  className?: string;
}

const GroupCard: React.FC<GroupCardProps> = ({
  group,
  isExpanded = false,
  onExpand,
  onEdit,
  onManageMembers,
  showActions = true,
  className = '',
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card >
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h3 className={styles.groupName}>{group.group_name}</h3>
          <p className={styles.themeTitle}>Theme: {group.theme_title}</p>
          <div className={styles.metaInfo}>
            <span>Created: {formatDate(group.created_at)}</span>
            {group.average_rating && (
              <span className={styles.rating}>
                Rating: {group.average_rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>

        {showActions && (
          <div className={styles.actions}>
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
          </div>
        )}
      </div>

      {isExpanded && (
        <div className={styles.expandedContent}>
          <div className={styles.teamLeadSection}>
            <div>
              <h4 className={styles.sectionTitle}>Team Lead</h4>
              {group.team_lead_details && (
                <div className={styles.teamLeadInfo}>
                  <p className={styles.memberName}>
                    {group.team_lead_details.name}
                  </p>
                  <p className={styles.memberEmail}>
                    {group.team_lead_details.email}
                  </p>
                </div>
              )}
            </div>
            {onManageMembers && (
              <Button
                onClick={() => onManageMembers(group)}
                className={style.fourth}
              >
                Manage Members
              </Button>
            )}
          </div>

          {group.members && group.members.length > 0 && (
            <div className={styles.membersSection}>
              <h4 className={styles.sectionTitle}>
                Members ({group.members.length})
              </h4>
              <div className={styles.memberGrid}>
                {group.members.map((member) => (
                  <div key={member.user_id} className={styles.memberCard}>
                    <p className={styles.memberName}>{member.name}</p>
                    <p className={styles.memberEmail}>{member.email}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default GroupCard;
