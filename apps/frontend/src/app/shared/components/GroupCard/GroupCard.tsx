import styles from './GroupCard.module.css';
import { Group } from '@/app/shared/utils/types';
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

  const memberCount = group.members?.length ?? 0;

  return (
    <Card>
      <header className={styles.header}>
        <section className={styles.headerContent}>
          <h3 className={styles.title}>{group.group_name}</h3>
          <p className={styles.theme}>Theme: {group.theme_title}</p>
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
              {group.team_lead_details && (
                <section className={styles.leadInfo}>
                  <h5 className={styles.memberName}>
                    {group.team_lead_details.name}
                  </h5>
                  <p className={styles.memberEmail}>
                    {group.team_lead_details.email}
                  </p>
                </section>
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

          {memberCount > 0 && group.members && (
            <section className={styles.membersList}>
              <h4 className={styles.sectionTitle}>Members ({memberCount})</h4>
              <ul className={styles.membersGrid}>
                {group.members.map((member) => (
                  <li key={member.user_id} className={styles.memberItem}>
                    <h5 className={styles.memberName}>{member.name}</h5>
                    <p className={styles.memberEmail}>{member.email}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </section>
      )}
    </Card>
  );
};

export default GroupCard;
