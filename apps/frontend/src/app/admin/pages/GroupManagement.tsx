import React, { useState, useEffect } from 'react';
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
import buttonStyles from '@/app/shared/components/Button/Button.module.css';
import FormGroup from '@/app/shared/components/Form/FormGroup';
import TextInput from '@/app/shared/components/Form/TextInput';
import SelectInput from '@/app/shared/components/SelectInput/SelectInput';
import GroupCard from '@/app/shared/components/GroupCard/GroupCard';

// API base URL - can be updated based on your environment
const API_BASE_URL = 'http://localhost:7071/api';

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
    theme_id: group?.theme_id?.toString() || '',
    team_lead: group?.team_lead?.toString() || '',
  });

  // Update form data when the group changes
  useEffect(() => {
    if (group) {
      setFormData({
        group_name: group.group_name || '',
        theme_id: group.theme_id?.toString() || '',
        team_lead: group.team_lead?.toString() || '',
      });
    } else {
      setFormData({
        group_name: '',
        theme_id: '',
        team_lead: '',
      });
    }
  }, [group]);

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
        <Button onClick={onClose} className={buttonStyles.third}>
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
                  className={buttonStyles.third}
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
                  !group.members?.some(
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
  // State for data
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // State for UI
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [showMemberDialog, setShowMemberDialog] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all groups
  const fetchGroups = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/group`);
      if (!response.ok) {
        throw new Error(`Failed to fetch groups: ${response.statusText}`);
      }
      const data = await response.json();
      setGroups(data);
      setFilteredGroups(data);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to fetch groups'
      );
    }
  };

  // Fetch all themes
  const fetchThemes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/theme`);
      if (!response.ok) {
        throw new Error(`Failed to fetch themes: ${response.statusText}`);
      }
      const data = await response.json();
      setThemes(data);
    } catch (error) {
      console.error('Error fetching themes:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to fetch themes'
      );
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user`);
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to fetch users'
      );
    }
  };

  // Fetch members of a specific group
  const fetchGroupMembers = async (groupId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/groupMember?id=${groupId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch group members: ${response.statusText}`);
      }
      
      const membersData = await response.json();
      
      if (Array.isArray(membersData)) {
        // Extract member objects from the response
        const members = membersData.map((item: any) => item.member);
        return members;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching group members:', error);
      return [];
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([fetchThemes(), fetchUsers(), fetchGroups()]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Search groups by name or theme
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredGroups(groups);
      return;
    }

    const filtered = groups.filter((group) =>
      (group.group_name?.toLowerCase() || '').includes(query.toLowerCase())
    );
    setFilteredGroups(filtered);
  };

  // Check if a user is a member of the group
  const checkAndRemoveTeamLeadFromMembers = async (
    groupId: number,
    newTeamLeadId: number
  ) => {
    try {
      // Get current group members
      const members = await fetchGroupMembers(groupId);
      
      // Check if the new team lead is currently a member
      const teamLeadIsMember = members.some(
        (member: User) => member.user_id === newTeamLeadId
      );
      
      // If team lead is a member, remove them from members
      if (teamLeadIsMember) {
        await fetch(
          `${API_BASE_URL}/groupMember?groupId=${groupId}&userId=${newTeamLeadId}`,
          {
            method: 'DELETE',
          }
        );
        console.log(`Removed user ${newTeamLeadId} from group members as they are now the team lead`);
      }
    } catch (error) {
      console.error('Error handling team lead membership:', error);
    }
  };

  // Create or update a group
  const handleSaveGroup = async (formData: GroupFormData) => {
    try {
      const payload = {
        theme_id: parseInt(formData.theme_id),
        group_name: formData.group_name,
        team_lead: parseInt(formData.team_lead),
      };

      let response;

      if (selectedGroup) {
        // Check if team lead has changed
        const oldTeamLeadId = selectedGroup.team_lead;
        const newTeamLeadId = parseInt(formData.team_lead);
        
        // Update existing group
        response = await fetch(
          `${API_BASE_URL}/group?id=${selectedGroup.group_id}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to save group: ${response.statusText}`);
        }
        
        // If team lead has changed and is a member, remove them from members
        if (oldTeamLeadId !== newTeamLeadId) {
          await checkAndRemoveTeamLeadFromMembers(
            selectedGroup.group_id,
            newTeamLeadId
          );
        }
      } else {
        // Create new group
        response = await fetch(`${API_BASE_URL}/group`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to save group: ${response.statusText}`);
        }
        
        // Get the newly created group
        const newGroup = await response.json();
        
        // Check if the new team lead is also added as a member and remove if needed
        await checkAndRemoveTeamLeadFromMembers(
          newGroup.group_id,
          parseInt(formData.team_lead)
        );
      }

      // Refresh the groups list
      await fetchGroups();
      setShowGroupDialog(false);
    } catch (error) {
      console.error('Error saving group:', error);
    }
  };

  // Toggle group expansion
  const handleToggleExpand = (groupId: number) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Handle opening the member management dialog
  const handleOpenMemberDialog = async (group: Group) => {
    try {
      // Fetch the members for this group
      const members = await fetchGroupMembers(group.group_id);
      
      // Update the selectedGroup with the members array
      setSelectedGroup({
        ...group,
        members: members
      });
      
      // Open the dialog
      setShowMemberDialog(true);
    } catch (error) {
      console.error('Error preparing member dialog:', error);
    }
  };

  // Add a user to a group
  const handleAddMember = async (user: User) => {
    if (!selectedGroup) return;

    try {
      // Don't allow adding the team lead as a member
      if (user.user_id === selectedGroup.team_lead) {
        console.warn("Cannot add team lead as a member");
        return;
      }
      
      const response = await fetch(
        `${API_BASE_URL}/groupMember?groupId=${selectedGroup.group_id}&userId=${user.user_id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to add member: ${response.statusText}`);
      }

      // Fetch the updated members list
      const members = await fetchGroupMembers(selectedGroup.group_id);
      
      // Update the selectedGroup with the new members array
      setSelectedGroup({
        ...selectedGroup,
        members
      });
      
    } catch (error) {
      console.error('Error adding member:', error);
    }
  };

  // Remove a user from a group
  const handleRemoveMember = async (userId: number) => {
    if (!selectedGroup) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/groupMember?groupId=${selectedGroup.group_id}&userId=${userId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to remove member: ${response.statusText}`);
      }

      // Fetch the updated members list
      const members = await fetchGroupMembers(selectedGroup.group_id);
      
      // Update the selectedGroup with the new members array
      setSelectedGroup({
        ...selectedGroup,
        members
      });
      
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

          {isLoading ? (
            <div className={styles.loading}>Loading groups...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : (
            <ul className={styles.groupList}>
              {filteredGroups.map((group) => (
                <li key={group.group_id}>
                  <GroupCard
                    group={group}
                    isExpanded={expandedGroups[group.group_id]}
                    onExpand={() => handleToggleExpand(group.group_id)}
                    onEdit={() => {
                      setSelectedGroup(group);
                      setShowGroupDialog(true);
                    }}
                    onManageMembers={() => handleOpenMemberDialog(group)}
                  />
                </li>
              ))}
              {!filteredGroups.length && !isLoading && (
                <li className={styles.noResults}>
                  {searchQuery
                    ? 'No groups found matching your search criteria'
                    : 'No groups found. Create your first group!'}
                </li>
              )}
            </ul>
          )}
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