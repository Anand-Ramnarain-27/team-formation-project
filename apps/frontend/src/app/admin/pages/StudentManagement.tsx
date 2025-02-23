import React, { useState, FormEvent } from 'react';
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
}

const StudentForm: React.FC<StudentFormProps> = ({ student, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: student?.name || '',
    email: student?.email || '',
    role: student?.role || 'student',
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
            { value: 'student', label: 'Student' },
            { value: 'admin', label: 'Admin' },
          ]}
          placeholder="Select role"
        />
      </FormGroup>
      <Button type="submit">
        {student ? 'Update Student' : 'Add Student'}
      </Button>
    </form>
  );
};

const StudentManagement: React.FC = () => {
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

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] =
    useState<StudentWithDetails | null>(null);

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
        <h1>Student Management</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>Add Student</Button>
      </header>

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
            { value: 'student', label: 'Students' },
            { value: 'admin', label: 'Admins' },
          ]}
          placeholder="Select role"
          className={styles.filterSelect}
        />
        <p className={styles.totalStudents}>Total Users: {students.length}</p>
      </section>

      <section className={styles.tableContainer}>
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
                  <Button onClick={() => setEditingStudent(student)}>
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <SharedModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Student"
        size="small"
        showFooter={false}
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
            setIsAddModalOpen(false);
          }}
        />
      </SharedModal>

      <SharedModal
        isOpen={!!editingStudent}
        onClose={() => setEditingStudent(null)}
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
              setEditingStudent(null);
            }}
          />
        )}
      </SharedModal>
    </main>
  );
};

export default StudentManagement;
