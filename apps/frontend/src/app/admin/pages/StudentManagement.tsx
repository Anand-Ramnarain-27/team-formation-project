import React, { useState, ReactNode, ChangeEvent, FormEvent } from 'react';
import styles from './StudentManagement.module.css';
import {
  User,
  GroupMember,
  Group,
  Review,
  StudentWithDetails,
} from '@/app/shared/utils/types';
import { SharedModal } from '@/app/shared/components/Modal';

interface StudentFormProps {
  student?: StudentWithDetails;
  onSubmit: (data: Partial<User>) => void;
}

const StudentManagement: React.FC = () => {
  // Mock data based on database schema
  const [students, setStudents] = useState<StudentWithDetails[]>([
    {
      user_id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'student',
      created_at: '2025-01-15T10:00:00Z',
      updated_at: null,
      currentGroup: {
        group_name: 'Innovation Team A',
        theme_id: 1,
      },
      averageRating: 4.5,
    },
    {
      user_id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'student',
      created_at: '2025-01-16T11:00:00Z',
      updated_at: null,
      currentGroup: {
        group_name: 'Sustainability Group B',
        theme_id: 2,
      },
      averageRating: 4.8,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] =
    useState<StudentWithDetails | null>(null);

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setFilterRole(event.target.value);
  };

  const handleEdit = (student: StudentWithDetails) => {
    setEditingStudent(student);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingStudent(null);
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRole === 'all' || student.role === filterRole;
    return matchesSearch && matchesFilter;
  });

  const StudentForm: React.FC<StudentFormProps> = ({ student, onSubmit }) => {
    const [formData, setFormData] = useState({
      name: student?.name || '',
      email: student?.email || '',
      role: student?.role || 'student',
    });

    const handleSubmit = (e: FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
      closeModal();
    };

    return (
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label>Name:</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Email:</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Role:</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className={styles.formGroup}></div>
        <button type="submit" className={styles.submitButton}>
          {student ? 'Update Student' : 'Add Student'}
        </button>
      </form>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Student Management</h1>
        <button
          className={styles.addButton}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Student
        </button>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={handleSearch}
            className={styles.searchInput}
          />
        </div>
        <select
          value={filterRole}
          onChange={handleFilterChange}
          className={styles.filterSelect}
        >
          <option value="all">All Roles</option>
          <option value="student">Students</option>
          <option value="admin">Admins</option>
        </select>
        <div className={styles.totalStudents}>
          Total Users: {students.length}
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Current Group</th>
              <th>Average Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.user_id}>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>
                  <span className={`${styles.status} ${styles.active}`}>
                    {student.role}
                  </span>
                </td>
                <td>{student.currentGroup?.group_name || 'Not Assigned'}</td>
                <td>
                  {student.averageRating
                    ? `${student.averageRating}/5.0`
                    : 'N/A'}
                </td>
                <td className={styles.actions}>
                  <button
                    onClick={() => handleEdit(student)}
                    className={styles.editButton}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SharedModal
        isOpen={isAddModalOpen}
        onClose={closeModal}
        title="Add New Student"
        size="small"
        showFooter={false} // Since StudentForm has its own submit button
      >
        <StudentForm
          onSubmit={(data) => {
            const newStudent: StudentWithDetails = {
              user_id: students.length + 1,
              name: data.name!,
              email: data.email!,
              role: data.role!,
              created_at: new Date().toISOString(),
              updated_at: null,
            };
            setStudents([...students, newStudent]);
            closeModal();
          }}
        />
      </SharedModal>

      <SharedModal
        isOpen={!!editingStudent}
        onClose={closeModal}
        title="Edit Student"
        size="small"
        showFooter={false}
      >
        {editingStudent && (
          <StudentForm
            student={editingStudent}
            onSubmit={(data) => {
              setStudents(
                students.map((s) =>
                  s.user_id === editingStudent.user_id
                    ? {
                        ...s,
                        ...data,
                        updated_at: new Date().toISOString(),
                      }
                    : s
                )
              );
              closeModal();
            }}
          />
        )}
      </SharedModal>
    </div>
  );
};

export default StudentManagement;
