import React, { useState } from 'react';
import styles from './GroupManagemnt.module.css';
import {
  User,
  Group,
  Theme,
  GroupDialogProp,
  GroupFormData,
  MemberManagementDialogProps,
} from '@/app/shared/utils/types';
import { SharedModal } from '@/app/shared/components/Modal/Modal';
import Card from '@/app/shared/components/Card/Card';
import Button from '@/app/shared/components/Button/Button';
import FormGroup from '@/app/shared/components/Form/FormGroup';
import TextInput from '@/app/shared/components/Form/TextInput';
import SelectInput from '@/app/shared/components/SelectInput/SelectInput';
import GroupCard from '@/app/shared/components/GroupCard/GroupCard';

const GroupDialog: React.FC<GroupDialogProp> = ({
  group,
  isOpen,
  onClose,
  themes,
  users,
  onSave,
}) => {
  const [formData, setFormData] = useState<GroupFormData>({
    group_name: group?.group_name || '',
    theme_id: group?.theme_id.toString() || '',
    team_lead: group?.team_lead.toString() || '',
  });

  if (!isOpen) return null;

  const themeOptions = themes.map((theme: Theme) => ({
    value: theme.theme_id.toString(),
    label: theme.title,
  }));

  const userOptions = users.map((user: User) => ({
    value: user.user_id.toString(),
    label: user.name,
  }));

  return (
    <SharedModal
      isOpen={isOpen}
      onClose={onClose}
      title={group ? 'Edit Group' : 'Create New Group'}
      showFooter
      footerContent={
        <>
          <Button onClick={onClose} className={styles.secondaryButton}>
            Cancel
          </Button>
          <Button
            onClick={() => onSave(formData)}
            disabled={
              !formData.group_name || !formData.theme_id || !formData.team_lead
            }
          >
            Save Changes
          </Button>
        </>
      }
    >
      <form className={styles.form}>
        <FormGroup label="Group Name">
          <TextInput
            value={formData.group_name}
            onChange={(value: string) =>
              setFormData((prev) => ({ ...prev, group_name: value }))
            }
            placeholder="Enter group name"
          />
        </FormGroup>
        <FormGroup label="Theme">
          <SelectInput
            value={formData.theme_id}
            onChange={(value: string) =>
              setFormData((prev) => ({ ...prev, theme_id: value }))
            }
            options={themeOptions}
            placeholder="Select theme"
          />
        </FormGroup>
        <FormGroup label="Team Lead">
          <SelectInput
            value={formData.team_lead}
            onChange={(value: string) =>
              setFormData((prev) => ({ ...prev, team_lead: value }))
            }
            options={userOptions}
            placeholder="Select team lead"
          />
        </FormGroup>
      </form>
    </SharedModal>
  );
};

const MemberManagementDialog: React.FC<MemberManagementDialogProps> = ({
  group,
  isOpen,
  onClose,
  availableUsers,
  onAddMember,
  onRemoveMember,
}) => {
  if (!isOpen) return null;

  return (
    <SharedModal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Group Members"
      size="large"
      showFooter
      footerContent={
        <Button onClick={onClose} className={styles.secondaryButton}>
          Close
        </Button>
      }
    >
      <section className={styles.memberGrid}>
        <article className={styles.memberSection}>
          <h3 className={styles.sectionTitle}>Current Members</h3>
          <ul className={styles.memberList}>
            {group.members?.map((member: User) => (
              <li key={member.user_id} className={styles.memberItem}>
                <div className={styles.memberInfo}>
                  <span className={styles.memberName}>{member.name}</span>
                  <span className={styles.memberEmail}>{member.email}</span>
                  <span className={styles.memberRole}>{member.role}</span>
                </div>
                <Button
                  onClick={() => onRemoveMember(member.user_id)}
                  className={styles.secondaryButton}
                >
                  Remove
                </Button>
              </li>
            ))}
            {!group.members?.length && (
              <li className={styles.emptyState}>No members in this group</li>
            )}
          </ul>
        </article>

        <article className={styles.memberSection}>
          <h3 className={styles.sectionTitle}>Available Students</h3>
          <ul className={styles.memberList}>
            {availableUsers
              .filter(
                (user: User) =>
                  user.role === 'Student' &&
                  !group.members?.find(
                    (member: User) => member.user_id === user.user_id
                  ) &&
                  user.user_id !== group.team_lead
              )
              .map((user: User) => (
                <li key={user.user_id} className={styles.memberItem}>
                  <div className={styles.memberInfo}>
                    <span className={styles.memberName}>{user.name}</span>
                    <span className={styles.memberEmail}>{user.email}</span>
                  </div>
                  <Button onClick={() => onAddMember(user)}>Add</Button>
                </li>
              ))}
          </ul>
        </article>
      </section>
    </SharedModal>
  );
};

const GroupManagement: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [showMemberDialog, setShowMemberDialog] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>(
    {}
  );

  // Mock data - in real application, this would come from props or API
  const themes: Theme[] = [
    {
      theme_id: 1,
      title: 'AI Applications',
      description: 'Exploring AI applications',
      submission_deadline: '2025-03-01',
      voting_deadline: '2025-03-15',
      review_deadline: [{ start: '2025-03-16T00:00', end: '2025-03-30T00:00' }],
      number_of_groups: 5,
      auto_assign_group: true,
    },
    // Add more themes as needed
  ];

  const users: User[] = [
    {
      user_id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Student',
      created_at: '2025-01-01',
    },
    // Add more users as needed
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = groups.filter(
      (group) =>
        group.group_name.toLowerCase().includes(query.toLowerCase()) ||
        group.theme_title?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredGroups(filtered);
  };

  const handleSaveGroup = async (formData: GroupFormData) => {
    try {
      const theme = themes.find(
        (t) => t.theme_id.toString() === formData.theme_id
      );
      const teamLead = users.find(
        (u) => u.user_id.toString() === formData.team_lead
      );

      if (!theme || !teamLead) return;

      const updatedGroup: Group = {
        ...(selectedGroup || {}),
        group_id: selectedGroup?.group_id || groups.length + 1,
        theme_id: parseInt(formData.theme_id),
        group_name: formData.group_name,
        team_lead: parseInt(formData.team_lead),
        created_at: selectedGroup?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        theme_title: theme.title,
        team_lead_details: teamLead,
        members: selectedGroup?.members || [],
      };

      const updatedGroups = selectedGroup
        ? groups.map((g) =>
            g.group_id === selectedGroup.group_id ? updatedGroup : g
          )
        : [...groups, updatedGroup];

      setGroups(updatedGroups);
      setFilteredGroups(updatedGroups);
      setShowGroupDialog(false);
    } catch (error) {
      console.error('Error saving group:', error);
    }
  };

  const handleAddMember = async (user: User) => {
    if (!selectedGroup) return;

    try {
      const updatedGroup = {
        ...selectedGroup,
        members: [...(selectedGroup.members || []), user],
      };

      const updatedGroups = groups.map((g) =>
        g.group_id === selectedGroup.group_id ? updatedGroup : g
      );

      setGroups(updatedGroups);
      setFilteredGroups(updatedGroups);
    } catch (error) {
      console.error('Error adding member:', error);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!selectedGroup) return;

    try {
      const updatedGroup = {
        ...selectedGroup,
        members: selectedGroup.members?.filter(
          (member) => member.user_id !== userId
        ),
      };

      const updatedGroups = groups.map((g) =>
        g.group_id === selectedGroup.group_id ? updatedGroup : g
      );

      setGroups(updatedGroups);
      setFilteredGroups(updatedGroups);
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  return (
    <main className={styles.container}>
      <Card title="Group Management">
        <header className={styles.header}>
          <Button
            onClick={() => {
              setSelectedGroup(null);
              setShowGroupDialog(true);
            }}
          >
            Create Group
          </Button>
        </header>

        <section className={styles.content}>
          <TextInput
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search groups..."
            className={styles.searchInput}
          />

          <ul className={styles.groupList}>
            {filteredGroups.map((group) => (
              <li key={group.group_id}>
                <GroupCard
                  group={group}
                  isExpanded={expandedGroups[group.group_id]}
                  onExpand={() =>
                    setExpandedGroups((prev) => ({
                      ...prev,
                      [group.group_id]: !prev[group.group_id],
                    }))
                  }
                  onEdit={() => {
                    setSelectedGroup(group);
                    setShowGroupDialog(true);
                  }}
                  onManageMembers={() => {
                    setSelectedGroup(group);
                    setShowMemberDialog(true);
                  }}
                />
              </li>
            ))}
            {!filteredGroups.length && (
              <li className={styles.noResults}>
                No groups found matching your search criteria
              </li>
            )}
          </ul>
        </section>
      </Card>

      <GroupDialog
        group={selectedGroup}
        isOpen={showGroupDialog}
        onClose={() => setShowGroupDialog(false)}
        themes={themes}
        users={users}
        onSave={handleSaveGroup}
      />

      {selectedGroup && (
        <MemberManagementDialog
          group={selectedGroup}
          isOpen={showMemberDialog}
          onClose={() => setShowMemberDialog(false)}
          availableUsers={users}
          onAddMember={handleAddMember}
          onRemoveMember={handleRemoveMember}
        />
      )}
    </main>
  );
};

export default GroupManagement;
