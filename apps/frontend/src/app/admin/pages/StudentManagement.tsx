import React, { useState, FormEvent, useEffect } from 'react';
import styles from './StudentManagement.module.css';
import { StudentWithDetails, User } from '@/app/shared/utils/types';
import { SharedModal } from '@/app/shared/components/Modal/Modal';
import Button from '@/app/shared/components/Button/Button';
import FormGroup from '@/app/shared/components/Form/FormGroup';
import TextInput from '@/app/shared/components/Form/TextInput';
import SelectInput from '@/app/shared/components/SelectInput/SelectInput';

interface StudentFormProps {
  student?: StudentWithDetails;
  onSubmit: (data: Partial<User>) => void;
  isSubmitting: boolean;
}

const StudentForm: React.FC<StudentFormProps> = ({ 
  student, 
  onSubmit, 
  isSubmitting 
}) => {
  const [formData, setFormData] = useState({
    name: student?.name || '',
    email: student?.email || '',
    role: student?.role || 'Student',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <FormGroup label="Name:">
        <TextInput
          value={formData.name}
          onChange={(value) => setFormData({ ...formData, name: value })}
          placeholder="Enter full name"
        />
      </FormGroup>
      <FormGroup label="Email:">
        <TextInput
          type="email"
          value={formData.email}
          onChange={(value) => setFormData({ ...formData, email: value })}
          placeholder="Enter email address"
        />
      </FormGroup>
      <FormGroup label="Role:">
        <SelectInput
          value={formData.role}
          onChange={(value) => setFormData({ ...formData, role: value })}
          options={[
            { value: 'Student', label: 'Student' },
            { value: 'Admin', label: 'Admin' },
          ]}
          placeholder="Select role"
        />
      </FormGroup>
      <Button type="submit" disabled={isSubmitting}>
        {student ? 'Update Student' : 'Add Student'}
      </Button>
    </form>
  );
};

const API_BASE_URL = 'http://localhost:7071/api';

const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<StudentWithDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStudents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/user`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAddStudent = async (userData: Partial<User>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          role: userData.role,
          auth_provider: 'local' // Default auth provider
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add user: ${response.status} ${response.statusText}`);
      }

      // Refresh the user list
      await fetchStudents();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding user:', error);
      setError(error instanceof Error ? error.message : 'Failed to add user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStudent = async (userData: Partial<User>) => {
    if (!editingStudent) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/user?id=${editingStudent.user_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          role: userData.role,
          auth_provider: null
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.status} ${response.statusText}`);
      }

      // Refresh the user list
      await fetchStudents();
      setEditingStudent(null);
    } catch (error) {
      console.error('Error updating user:', error);
      setError(error instanceof Error ? error.message : 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRole === 'all' || student.role === filterRole;
    return matchesSearch && matchesFilter;
  });

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>User Management</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>Add User</Button>
      </header>

      {error && <div className={styles.error}>{error}</div>}

      <section className={styles.controls}>
        <TextInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by name or email..."
          className={styles.searchInput}
        />
        <SelectInput
          value={filterRole}
          onChange={setFilterRole}
          options={[
            { value: 'all', label: 'All Roles' },
            { value: 'Student', label: 'Students' },
            { value: 'Admin', label: 'Admins' },
          ]}
          placeholder="Select role"
          className={styles.filterSelect}
        />
        <p className={styles.totalStudents}>
          Total Users: {students.length}
        </p>
      </section>

      <section className={styles.tableContainer}>
        {isLoading ? (
          <div className={styles.loading}>Loading users...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.user_id}>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    <td>
                      <span className={`${styles.status} ${styles.active}`}>
                        {student.role}
                      </span>
                    </td>
                    <td className={styles.actions}>
                      <Button onClick={() => setEditingStudent(student)}>
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className={styles.noData}>
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>

      <SharedModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New User"
        size="small"
        showFooter={false}
      >
        <StudentForm
          onSubmit={handleAddStudent}
          isSubmitting={isSubmitting}
        />
      </SharedModal>

      <SharedModal
        isOpen={!!editingStudent}
        onClose={() => setEditingStudent(null)}
        title="Edit User"
        size="small"
        showFooter={false}
      >
        {editingStudent && (
          <StudentForm
            student={editingStudent}
            onSubmit={handleUpdateStudent}
            isSubmitting={isSubmitting}
          />
        )}
      </SharedModal>
    </main>
  );
};

export default StudentManagement;