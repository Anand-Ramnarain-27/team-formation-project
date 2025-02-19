import React, { useState } from 'react';
import styles from './GroupManagemnt.module.css';
import { User, Group, Theme } from '@/app/shared/utils/types';
import { SharedModal } from '@/app/shared/components/Modal/Modal';
import Card from '@/app/shared/components/Card/Card';
import Button from '@/app/shared/components/Button/Button';
import style from '@/app/shared/components/Button/Button.module.css';
import FormGroup from '@/app/shared/components/Form/FormGroup';
import TextInput from '@/app/shared/components/Form/TextInput';
import TextArea from '@/app/shared/components/Form/TextArea';

interface GroupDialogProps {
  group: Group | null;
  isOpen: boolean;
  onClose: () => void;
  themes: Theme[];
  users: User[];
}

interface MemberManagementDialogProps {
  group: Group;
  isOpen: boolean;
  onClose: () => void;
  availableUsers: User[];
}

const GroupManagement = () => {
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
    {
      theme_id: 2,
      title: 'Web Development',
      description: 'Modern web development',
      submission_deadline: '2025-03-01',
      voting_deadline: '2025-03-15',
      review_deadline: [{ start: '2025-03-16', end: '2025-03-30' }],
      number_of_groups: 5,
      auto_assign_group: true,
    },
  ];

  const users: User[] = [
    {
      user_id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Student',
      created_at: '12:00:00',
      updated_at: null,
    },
    {
      user_id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'Student',
      created_at: '12:00:00',
      updated_at: null,
    },
    {
      user_id: 3,
      name: 'Bob Wilson',
      email: 'bob@example.com',
      role: 'Student',
      created_at: '12:00:00',
      updated_at: null,
    },
    {
      user_id: 4,
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      role: 'Student',
      created_at: '12:00:00',
      updated_at: null,
    },
  ];

  const initialGroups: Group[] = [
    {
      group_id: 1,
      theme_id: 1,
      group_name: 'Innovation Team',
      team_lead: 1,
      created_at: '2025-01-01',
      updated_at: '2025-01-01',
      theme_title: 'AI Applications',
      team_lead_details: users[0],
      members: [users[1], users[2]],
      average_rating: 4.2,
    },
    {
      group_id: 2,
      theme_id: 2,
      group_name: 'Web Dev Team',
      team_lead: 4,
      created_at: '2025-01-01',
      updated_at: '2025-01-01',
      theme_title: 'Web Development',
      team_lead_details: users[3],
      members: [users[1]],
      average_rating: 4.5,
    },
  ];

  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>(initialGroups);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showGroupDialog, setShowGroupDialog] = useState<boolean>(false);
  const [showMemberDialog, setShowMemberDialog] = useState<boolean>(false);
  const [expandedGroups, setExpandedGroups] = useState<{
    [key: number]: boolean;
  }>({});

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = groups.filter(
      (group) =>
        group.group_name.toLowerCase().includes(query.toLowerCase()) ||
        group.theme_title?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredGroups(filtered);
  };

  const toggleGroupExpansion = (groupId: number) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const GroupDialog = ({
    group,
    isOpen,
    onClose,
    themes,
    users,
  }: GroupDialogProps) => {
    const [editForm, setEditForm] = useState({
      group_name: group?.group_name || '',
      theme_id: group?.theme_id.toString() || '',
      team_lead: group?.team_lead.toString() || '',
    });

    if (!isOpen) return null;

    const handleSave = async () => {
      try {
        const theme = themes.find(
          (t) => t.theme_id.toString() === editForm.theme_id
        );
        const teamLead = users.find(
          (u) => u.user_id.toString() === editForm.team_lead
        );

        const updatedGroup: Group = {
          group_id: group?.group_id || groups.length + 1,
          theme_id: parseInt(editForm.theme_id),
          group_name: editForm.group_name,
          team_lead: parseInt(editForm.team_lead),
          created_at: group?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          theme_title: theme?.title,
          team_lead_details: teamLead,
          members: group?.members || [],
          average_rating: group?.average_rating || 0,
        };

        // In a real application, make an API call to save the group
        // const savedGroup = await saveGroup(updatedGroup);

        if (group) {
          const updatedGroups = groups.map((g) =>
            g.group_id === group.group_id ? updatedGroup : g
          );
          setGroups(updatedGroups);
          setFilteredGroups(updatedGroups);
        } else {
          const newGroups = [...groups, updatedGroup];
          setGroups(newGroups);
          setFilteredGroups(newGroups);
        }
        onClose();
      } catch (error) {
        console.error('Error saving group:', error);
        // Handle error (show notification, etc.)
      }
    };

    return (
      <SharedModal
        isOpen={isOpen}
        onClose={onClose}
        title={group ? 'Edit Group' : 'Create New Group'}
        showFooter={true}
        footerContent={
          <>
            <Button className={style.third} onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                !editForm.group_name ||
                !editForm.theme_id ||
                !editForm.team_lead
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
              value={editForm.group_name}
              onChange={(value) =>
                setEditForm({ ...editForm, group_name: value })
              }
              placeholder="Enter group name"
            />
          </FormGroup>
          <FormGroup label="Theme">
            <select
              className={styles.select}
              value={editForm.theme_id}
              onChange={(e) =>
                setEditForm({ ...editForm, theme_id: e.target.value })
              }
              required
            >
              <option value="">Select theme</option>
              {themes.map((theme) => (
                <option key={theme.theme_id} value={theme.theme_id}>
                  {theme.title}
                </option>
              ))}
            </select>
          </FormGroup>
          <FormGroup label="Team Lead">
            <select
              className={styles.select}
              value={editForm.team_lead}
              onChange={(e) =>
                setEditForm({ ...editForm, team_lead: e.target.value })
              }
              required
            >
              <option value="">Select team lead</option>
              {users.map((user) => (
                <option key={user.user_id} value={user.user_id}>
                  {user.name}
                </option>
              ))}
            </select>
          </FormGroup>
        </form>
      </SharedModal>
    );
  };

  const MemberManagementDialog = ({
    group,
    isOpen,
    onClose,
    availableUsers,
  }: MemberManagementDialogProps) => {
    if (!isOpen) return null;

    const handleAddMember = async (user: User) => {
      try {
        // In a real application, make an API call to add the member
        // await addGroupMember(group.group_id, user.user_id);

        const updatedGroup = {
          ...group,
          members: [...(group.members || []), user],
        };
        const updatedGroups = groups.map((g) =>
          g.group_id === group.group_id ? updatedGroup : g
        );
        setGroups(updatedGroups);
        setFilteredGroups(updatedGroups);
      } catch (error) {
        console.error('Error adding member:', error);
        // Handle error (show notification, etc.)
      }
    };

    const handleRemoveMember = async (userId: number) => {
      try {
        // In a real application, make an API call to remove the member
        // await removeGroupMember(group.group_id, userId);

        const updatedGroup = {
          ...group,
          members: group.members?.filter((member) => member.user_id !== userId),
        };
        const updatedGroups = groups.map((g) =>
          g.group_id === group.group_id ? updatedGroup : g
        );
        setGroups(updatedGroups);
        setFilteredGroups(updatedGroups);
      } catch (error) {
        console.error('Error removing member:', error);
        // Handle error (show notification, etc.)
      }
    };

    return (
      <SharedModal
        isOpen={isOpen}
        onClose={onClose}
        title="Manage Group Members"
        size="large"
        showFooter={true}
        footerContent={
          <Button className={styles.secondaryButton} onClick={onClose}>
            Close
          </Button>
        }
      >
        <div className={styles.memberGrid}>
          <div className={styles.memberSection}>
            <h3 className={styles.label}>Current Members</h3>
            <div className={styles.memberList}>
              {group.members?.map((member) => (
                <div key={member.user_id} className={styles.memberItem}>
                  <div>
                    <div className={styles.memberName}>{member.name}</div>
                    <div className={styles.memberEmail}>{member.email}</div>
                    <div className={styles.memberRole}>{member.role}</div>
                  </div>
                  <Button
                    onClick={() => handleRemoveMember(member.user_id)}
                    className={style.third}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              {(!group.members || group.members.length === 0) && (
                <div className={styles.emptyState}>
                  No members in this group
                </div>
              )}
            </div>
          </div>
          <div className={styles.memberSection}>
            <h3 className={styles.label}>Available Students</h3>
            <div className={styles.memberList}>
              {availableUsers
                .filter(
                  (user) =>
                    user.role === 'Student' &&
                    !group.members?.find(
                      (member) => member.user_id === user.user_id
                    ) &&
                    user.user_id !== group.team_lead
                )
                .map((user) => (
                  <div key={user.user_id} className={styles.memberItem}>
                    <div>
                      <div className={styles.memberName}>{user.name}</div>
                      <div className={styles.memberEmail}>{user.email}</div>
                    </div>
                    <Button onClick={() => handleAddMember(user)}>Add</Button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </SharedModal>
    );
  };

  return (
    <div className={styles.container}>
      <Card title="Group Management">
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <Button
              onClick={() => {
                setSelectedGroup(null);
                setShowGroupDialog(true);
              }}
            >
              Create Group
            </Button>
          </div>
        </div>
        <div className={styles.content}>
          <div className={styles.searchBar}>
            <TextInput
              value={searchQuery}
              onChange={(value) => handleSearch(value)}
              placeholder="Search groups..."
              className={styles.searchInput}
            />
          </div>
          <div className={styles.groupList}>
            {filteredGroups.map((group) => (
              <div key={group.group_id} className={styles.groupCard}>
                <div className={styles.groupHeader}>
                  <div className={styles.groupInfo}>
                    <div>
                      <h3 className={styles.groupName}>{group.group_name}</h3>
                      <div className={styles.groupTheme}>
                        Theme: {group.theme_title}
                      </div>
                      <div className={styles.groupMeta}>
                        <span>
                          Created:{' '}
                          {new Date(group.created_at).toLocaleDateString()}
                        </span>
                        {group.average_rating && (
                          <span className={styles.rating}>
                            Rating: {group.average_rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={styles.groupActions}>
                    <Button
                      onClick={() => {
                        setSelectedGroup(group);
                        setShowGroupDialog(true);
                      }}
                      className={style.fourth}
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => toggleGroupExpansion(group.group_id)}
                      className={style.fourth}
                    >
                      {expandedGroups[group.group_id] ? 'Collapse' : 'Expand'}
                    </Button>
                  </div>
                </div>
                {expandedGroups[group.group_id] && (
                  <div className={styles.groupContent}>
                    <div className={styles.teamLeadSection}>
                      <div>
                        <div className={styles.label}>Team Lead</div>
                        <div className={styles.memberName}>
                          {group.team_lead_details?.name}
                        </div>
                        <div className={styles.memberEmail}>
                          {group.team_lead_details?.email}
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          setSelectedGroup(group);
                          setShowMemberDialog(true);
                        }}
                        className={style.fourth}
                      >
                        Manage Members
                      </Button>
                    </div>
                    <div className={styles.themeInfo}>
                      <div className={styles.label}>Theme Details</div>
                      <div className={styles.themeDetails}>
                        {
                          themes.find((t) => t.theme_id === group.theme_id)
                            ?.description
                        }
                      </div>
                      <div className={styles.themeDates}>
                        <span>
                          Submission:{' '}
                          {new Date(
                            themes.find((t) => t.theme_id === group.theme_id)
                              ?.submission_deadline || ''
                          ).toLocaleDateString()}
                        </span>
                        <span>
                          Voting:{' '}
                          {new Date(
                            themes.find((t) => t.theme_id === group.theme_id)
                              ?.voting_deadline || ''
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className={styles.label}>
                        Members ({group.members?.length || 0})
                      </div>
                      <div className={styles.membersList}>
                        {group.members?.map((member) => (
                          <div
                            key={member.user_id}
                            className={styles.memberCard}
                          >
                            <div className={styles.memberName}>
                              {member.name}
                            </div>
                            <div className={styles.memberEmail}>
                              {member.email}
                            </div>
                            <div className={styles.memberRole}>
                              {member.role}
                            </div>
                          </div>
                        ))}
                        {(!group.members || group.members.length === 0) && (
                          <div className={styles.emptyState}>
                            No members in this group
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {filteredGroups.length === 0 && (
              <div className={styles.noResults}>
                No groups found matching your search criteria
              </div>
            )}
          </div>
        </div>
      </Card>
      <GroupDialog
        group={selectedGroup}
        isOpen={showGroupDialog}
        onClose={() => setShowGroupDialog(false)}
        themes={themes}
        users={users}
      />
      {selectedGroup && (
        <MemberManagementDialog
          group={selectedGroup}
          isOpen={showMemberDialog}
          onClose={() => setShowMemberDialog(false)}
          availableUsers={users}
        />
      )}
    </div>
  );
};

// Add prop types validation
GroupManagement.propTypes = {
  // Add prop types if needed
};

export default GroupManagement;
