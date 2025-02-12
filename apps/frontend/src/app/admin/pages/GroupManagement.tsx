import React, { useState } from 'react';
import styles from './GroupManagemnt.module.css'; // Ensure this file exists

// Define types for the group and member data
interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Group {
  id: number;
  name: string;
  themeId: number;
  themeName: string;
  teamLead: {
    id: number;
    name: string;
    email: string;
  };
  members: Member[];
  averageRating: number;
  status: string;
}

// Define props for GroupDialog component
interface GroupDialogProps {
  group: Group | null;
  isOpen: boolean;
  onClose: () => void;
}

// Define props for MemberManagementDialog component
interface MemberManagementDialogProps {
  group: Group;
  isOpen: boolean;
  onClose: () => void;
}

const GroupManagement = () => {
  // Dummy data
  const initialGroups: Group[] = [
    {
      id: 1,
      name: 'Innovation Team',
      themeId: 1,
      themeName: 'AI Applications',
      teamLead: {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      },
      members: [
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'Member'
        },
        {
          id: 3,
          name: 'Bob Wilson',
          email: 'bob@example.com',
          role: 'Member'
        }
      ],
      averageRating: 4.2,
      status: 'Active'
    },
    {
      id: 2,
      name: 'Web Dev Team',
      themeId: 2,
      themeName: 'Web Development',
      teamLead: {
        id: 4,
        name: 'Sarah Johnson',
        email: 'sarah@example.com'
      },
      members: [
        {
          id: 5,
          name: 'Mike Brown',
          email: 'mike@example.com',
          role: 'Member'
        },
        {
          id: 6,
          name: 'Emma Davis',
          email: 'emma@example.com',
          role: 'Member'
        }
      ],
      averageRating: 4.5,
      status: 'Active'
    }
  ];

  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>(initialGroups);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showGroupDialog, setShowGroupDialog] = useState<boolean>(false);
  const [showMemberDialog, setShowMemberDialog] = useState<boolean>(false);
  const [expandedGroups, setExpandedGroups] = useState<{ [key: number]: boolean }>({});

  // Handle search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = groups.filter(group =>
      group.name.toLowerCase().includes(query.toLowerCase()) ||
      group.themeName.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredGroups(filtered);
  };

  // Toggle group expansion
  const toggleGroupExpansion = (groupId: number) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Handle group deletion
  const handleDeleteGroup = (groupId: number) => {
    const updatedGroups = groups.filter(group => group.id !== groupId);
    setGroups(updatedGroups);
    setFilteredGroups(updatedGroups);
  };

  // GroupDialog component
  const GroupDialog = ({ group, isOpen, onClose }: GroupDialogProps) => {
    const [editForm, setEditForm] = useState({
      name: group?.name || '',
      themeId: group?.themeId.toString() || '',
      teamLeadId: group?.teamLead.id.toString() || '',
      status: group?.status || 'Active'
    });

    if (!isOpen) return null;

    const handleSave = () => {
      const updatedGroup: Group = {
        id: group?.id || groups.length + 1,
        name: editForm.name,
        themeId: parseInt(editForm.themeId),
        themeName: editForm.themeId === '1' ? 'AI Applications' : 'Web Development',
        teamLead: {
          id: parseInt(editForm.teamLeadId),
          name: editForm.teamLeadId === '1' ? 'John Doe' : 'Jane Smith',
          email: editForm.teamLeadId === '1' ? 'john@example.com' : 'jane@example.com'
        },
        members: group?.members || [],
        averageRating: group?.averageRating || 0,
        status: editForm.status
      };

      if (group) {
        const updatedGroups = groups.map(g => g.id === group.id ? updatedGroup : g);
        setGroups(updatedGroups);
        setFilteredGroups(updatedGroups);
      } else {
        const newGroups = [...groups, updatedGroup];
        setGroups(newGroups);
        setFilteredGroups(newGroups);
      }
      onClose();
    };

    return (
      <div className={styles.modal}>
        <div className={styles.modalContent}>
          <h2 className={styles.modalTitle}>
            {group ? 'Edit Group' : 'Create New Group'}
          </h2>
          <form className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Group Name</label>
              <input
                type="text"
                className={styles.input}
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Theme</label>
              <select
                className={styles.select}
                value={editForm.themeId}
                onChange={(e) => setEditForm({ ...editForm, themeId: e.target.value })}
              >
                <option value="">Select theme</option>
                <option value="1">AI Applications</option>
                <option value="2">Web Development</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Team Lead</label>
              <select
                className={styles.select}
                value={editForm.teamLeadId}
                onChange={(e) => setEditForm({ ...editForm, teamLeadId: e.target.value })}
              >
                <option value="">Select team lead</option>
                <option value="1">John Doe</option>
                <option value="2">Jane Smith</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Status</label>
              <select
                className={styles.select}
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </form>
          <div className={styles.modalActions}>
            <button className={styles.secondaryButton} onClick={onClose}>
              Cancel
            </button>
            <button className={styles.primaryButton} onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  };

  // MemberManagementDialog component
  const MemberManagementDialog = ({ group, isOpen, onClose }: MemberManagementDialogProps) => {
    const availableStudents = [
      { id: 7, name: 'Alice Johnson', email: 'alice@example.com' },
      { id: 8, name: 'Charlie Brown', email: 'charlie@example.com' }
    ];

    if (!isOpen) return null;

    const handleAddMember = (student: { id: number; name: string; email: string }) => {
      const updatedGroup = {
        ...group,
        members: [...group.members, { ...student, role: 'Member' }]
      };
      const updatedGroups = groups.map(g => g.id === group.id ? updatedGroup : g);
      setGroups(updatedGroups);
      setFilteredGroups(updatedGroups);
    };

    const handleRemoveMember = (memberId: number) => {
      const updatedGroup = {
        ...group,
        members: group.members.filter(member => member.id !== memberId)
      };
      const updatedGroups = groups.map(g => g.id === group.id ? updatedGroup : g);
      setGroups(updatedGroups);
      setFilteredGroups(updatedGroups);
    };

    return (
      <div className={styles.modal}>
        <div className={`${styles.modalContent} ${styles.memberManagementContent}`}>
          <h2 className={styles.modalTitle}>Manage Group Members</h2>
          <div className={styles.memberGrid}>
            <div className={styles.memberSection}>
              <h3 className={styles.label}>Current Members</h3>
              <div className={styles.memberList}>
                {group.members.map(member => (
                  <div key={member.id} className={styles.memberItem}>
                    <div>
                      <div className={styles.memberName}>{member.name}</div>
                      <div className={styles.memberEmail}>{member.email}</div>
                    </div>
                    <button
                      className={`${styles.iconButton} ${styles.danger}`}
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.memberSection}>
              <h3 className={styles.label}>Available Students</h3>
              <div className={styles.memberList}>
                {availableStudents
                  .filter(student => !group.members.find(member => member.id === student.id))
                  .map(student => (
                    <div key={student.id} className={styles.memberItem}>
                      <div>
                        <div className={styles.memberName}>{student.name}</div>
                        <div className={styles.memberEmail}>{student.email}</div>
                      </div>
                      <button
                        className={styles.iconButton}
                        onClick={() => handleAddMember(student)}
                      >
                        Add
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <div className={styles.modalActions}>
            <button className={styles.secondaryButton} onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Group Management</h1>
            <button
              className={styles.primaryButton}
              onClick={() => {
                setSelectedGroup(null);
                setShowGroupDialog(true);
              }}
            >
              Create Group
            </button>
          </div>
        </div>
        <div className={styles.content}>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search groups..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className={styles.groupList}>
            {filteredGroups.map(group => (
              <div key={group.id} className={styles.groupCard}>
                <div className={styles.groupHeader}>
                  <div className={styles.groupInfo}>
                    <div>
                      <h3 className={styles.groupName}>{group.name}</h3>
                      <div className={styles.groupTheme}>Theme: {group.themeName}</div>
                    </div>
                  </div>
                  <div className={styles.groupActions}>
                    <button
                      className={styles.iconButton}
                      onClick={() => {
                        setSelectedGroup(group);
                        setShowGroupDialog(true);
                      }}
                    >
                      Edit
                    </button>
                    {/* <button
                      className={`${styles.iconButton} ${styles.danger}`}
                      onClick={() => handleDeleteGroup(group.id)}
                    >
                      Delete
                    </button> */}
                    <button
                      className={styles.iconButton}
                      onClick={() => toggleGroupExpansion(group.id)}
                    >
                      {expandedGroups[group.id] ? 'Collapse' : 'Expand'}
                    </button>
                  </div>
                </div>
                {expandedGroups[group.id] && (
                  <div className={styles.groupContent}>
                    <div className={styles.teamLeadSection}>
                      <div>
                        <div className={styles.label}>Team Lead</div>
                        <div className={styles.memberName}>{group.teamLead.name}</div>
                        <div className={styles.memberEmail}>{group.teamLead.email}</div>
                      </div>
                      <button
                        className={styles.secondaryButton}
                        onClick={() => {
                          setSelectedGroup(group);
                          setShowMemberDialog(true);
                        }}
                      >
                        Manage Members
                      </button>
                    </div>
                    <div>
                      <div className={styles.label}>Members ({group.members.length})</div>
                      <div className={styles.membersList}>
                        {group.members.map(member => (
                          <div key={member.id} className={styles.memberCard}>
                            <div className={styles.memberName}>{member.name}</div>
                            <div className={styles.memberEmail}>{member.email}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <GroupDialog
        group={selectedGroup}
        isOpen={showGroupDialog}
        onClose={() => setShowGroupDialog(false)}
      />
      {selectedGroup && (
        <MemberManagementDialog
          group={selectedGroup}
          isOpen={showMemberDialog}
          onClose={() => setShowMemberDialog(false)}
        />
      )}
    </div>
  );
};

export default GroupManagement;