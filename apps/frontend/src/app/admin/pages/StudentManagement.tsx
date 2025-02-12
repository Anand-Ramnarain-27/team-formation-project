import React, { useState, ReactNode, ChangeEvent, FormEvent } from 'react';
import styles from './StudentManagement.module.css';

interface Student {
  id: number;
  name: string;
  email: string;
  currentGroup: string;
  rating: number;
  status: 'Active' | 'Inactive';
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

interface StudentFormProps {
  student?: Student;
  onSubmit: (data: Omit<Student, 'id' | 'rating'>) => void;
}

const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      currentGroup: 'Team Alpha',
      rating: 4.5,
      status: 'Active',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      currentGroup: 'Team Beta',
      rating: 4.8,
      status: 'Active',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(event.target.value);
  };

  const handleEdit = (student: Student) => {
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
    const matchesFilter =
      filterStatus === 'all' ||
      student.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
  }) => {
    if (!isOpen) return null;

    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div
          className={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.modalHeader}>
            <h2>{title}</h2>
            <button className={styles.closeButton} onClick={onClose}>
              &times;
            </button>
          </div>
          {children}
        </div>
      </div>
    );
  };

  const StudentForm: React.FC<StudentFormProps> = ({ student, onSubmit }) => {
    const [formData, setFormData] = useState({
      name: student?.name || '',
      email: student?.email || '',
      currentGroup: student?.currentGroup || '',
      status: student?.status || ('Active' as const),
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
          <label>Current Group:</label>
          <input
            type="text"
            value={formData.currentGroup}
            onChange={(e) =>
              setFormData({ ...formData, currentGroup: e.target.value })
            }
          />
        </div>
        <div className={styles.formGroup}>
          <label>Status:</label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({
                ...formData,
                status: e.target.value as 'Active' | 'Inactive',
              })
            }
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
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
            placeholder="Search students..."
            value={searchTerm}
            onChange={handleSearch}
            className={styles.searchInput}
          />
        </div>
        <select
          value={filterStatus}
          onChange={handleFilterChange}
          className={styles.filterSelect}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <div className={styles.totalStudents}>
          Total Students: {students.length}
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Current Group</th>
              <th>Rating</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id}>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>{student.currentGroup}</td>
                <td>{student.rating}/5.0</td>
                <td>
                  <span
                    className={`${styles.status} ${
                      styles[student.status.toLowerCase()]
                    }`}
                  >
                    {student.status}
                  </span>
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

      <Modal
        isOpen={isAddModalOpen}
        onClose={closeModal}
        title="Add New Student"
      >
        <StudentForm
          onSubmit={(data) => {
            setStudents([
              ...students,
              { ...data, id: students.length + 1, rating: 0 },
            ]);
            closeModal();
          }}
        />
      </Modal>

      <Modal
        isOpen={!!editingStudent}
        onClose={closeModal}
        title="Edit Student"
      >
        {editingStudent && (
          <StudentForm
            student={editingStudent}
            onSubmit={(data) => {
              setStudents(
                students.map((s) =>
                  s.id === editingStudent.id
                    ? { ...data, id: s.id, rating: s.rating }
                    : s
                )
              );
              closeModal();
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default StudentManagement;
