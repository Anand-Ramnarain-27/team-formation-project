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
import useApi from '@/app/shared/hooks/useApi'; 

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
          <Button onClick={onClose} className={buttonStyles.third}>
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
  const { get, post, patch, remove, loading, error } = useApi('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedThemeId, setSelectedThemeId] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [showMemberDialog, setShowMemberDialog] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>(
    {}
  );

  const fetchGroups = async () => {
    try {
      const data = await get('/group');
      const sortedGroups = [...data].sort((a, b) => b.group_id - a.group_id);
      
      setGroups(sortedGroups);
      setFilteredGroups(sortedGroups);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const fetchThemes = async () => {
    try {
      const data = await get('/theme');
      setThemes(data);
    } catch (error) {
      console.error('Error fetching themes:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await get('/user');
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchGroupMembers = async (groupId: number) => {
    try {
      const membersData = await get(`/groupMember?id=${groupId}`);
      
      if (Array.isArray(membersData)) {
        const members = membersData.map((item: any) => item.member);
        return members;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching group members:', error);
      return [];
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchThemes(), fetchUsers(), fetchGroups()]);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    filterGroups();
  }, [searchQuery, selectedThemeId, groups]);

  const filterGroups = () => {
    let filtered = [...groups];
    
    if (searchQuery.trim()) {
      filtered = filtered.filter((group) =>
        (group.group_name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedThemeId) {
      filtered = filtered.filter(
        (group) => group.theme_id === parseInt(selectedThemeId)
      );
    }
    
    setFilteredGroups(filtered);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleThemeFilter = (themeId: string) => {
    setSelectedThemeId(themeId);
  };

  const checkAndRemoveTeamLeadFromMembers = async (
    groupId: number,
    newTeamLeadId: number
  ) => {
    try {
      const members = await fetchGroupMembers(groupId);
      
      const teamLeadIsMember = members.some(
        (member: User) => member.user_id === newTeamLeadId
      );

      if (teamLeadIsMember) {
        await remove(`/groupMember?groupId=${groupId}&userId=${newTeamLeadId}`);
        console.log(`Removed user ${newTeamLeadId} from group members as they are now the team lead`);
      }
    } catch (error) {
      console.error('Error handling team lead membership:', error);
    }
  };

  const handleSaveGroup = async (formData: GroupFormData) => {
    try {
      const payload = {
        theme_id: parseInt(formData.theme_id),
        group_name: formData.group_name,
        team_lead: parseInt(formData.team_lead),
      };

      if (selectedGroup) {
        const oldTeamLeadId = selectedGroup.team_lead;
        const newTeamLeadId = parseInt(formData.team_lead);

        await patch(`/group?id=${selectedGroup.group_id}`, payload);

        if (oldTeamLeadId !== newTeamLeadId) {
          await checkAndRemoveTeamLeadFromMembers(
            selectedGroup.group_id,
            newTeamLeadId
          );
        }
      } else {
        const newGroup = await post('/group', payload);
        await checkAndRemoveTeamLeadFromMembers(
          newGroup.group_id,
          parseInt(formData.team_lead)
        );
      }

      await fetchGroups();
      setShowGroupDialog(false);
    } catch (error) {
      console.error('Error saving group:', error);
    }
  };

  const handleToggleExpand = (groupId: number) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const handleOpenMemberDialog = async (group: Group) => {
    try {
      const members = await fetchGroupMembers(group.group_id);

      setSelectedGroup({
        ...group,
        members: members
      });

      setShowMemberDialog(true);
    } catch (error) {
      console.error('Error preparing member dialog:', error);
    }
  };

  const handleAddMember = async (user: User) => {
    if (!selectedGroup) return;

    try {
      if (user.user_id === selectedGroup.team_lead) {
        console.warn("Cannot add team lead as a member");
        return;
      }
      
      await post(
        `/groupMember?groupId=${selectedGroup.group_id}&userId=${user.user_id}`,
        {}
      );

      const members = await fetchGroupMembers(selectedGroup.group_id);
      
      setSelectedGroup({
        ...selectedGroup,
        members
      });
      
    } catch (error) {
      console.error('Error adding member:', error);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!selectedGroup) return;

    try {
      await remove(
        `/groupMember?groupId=${selectedGroup.group_id}&userId=${userId}`
      );

      const members = await fetchGroupMembers(selectedGroup.group_id);

      setSelectedGroup({
        ...selectedGroup,
        members
      });
      
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const themeOptions = [
    { value: '', label: 'All Themes' },
    ...themes.map((theme: Theme) => ({
      value: theme.theme_id.toString(),
      label: theme.title,
    })),
  ];

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
          <div className={styles.filterContainer}>
            <TextInput
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search groups..."
              className={styles.searchInput}
            />
            
            <SelectInput
              value={selectedThemeId}
              onChange={handleThemeFilter}
              options={themeOptions}
              placeholder="Filter by theme"
              className={styles.themeFilter}
            />
          </div>

          {loading ? (
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
              {!filteredGroups.length && !loading && (
                <li className={styles.noResults}>
                  {searchQuery || selectedThemeId
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