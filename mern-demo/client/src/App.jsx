import { useEffect, useState } from 'react'
import './App.css'

const emptyForm = {
  studentId: '',
  name: '',
  email: '',
}

function App() {
  const [students, setStudents] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students')
      const data = await response.json()
      setStudents(Array.isArray(data) ? data : [])
      setError('')
    } catch (err) {
      setError('Không thể tải danh sách sinh viên.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      const payload = {
        studentId: form.studentId.trim(),
        name: form.name.trim(),
        email: form.email.trim(),
      }

      if (!payload.studentId || !payload.name || !payload.email) {
        setError('Vui lòng nhập đầy đủ MSSV, họ tên và email.')
        return
      }

      const requestOptions = {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }

      const response = await fetch(
        editingId ? `/api/students/${editingId}` : '/api/students',
        requestOptions
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Yêu cầu không thành công.')
      }

      setForm(emptyForm)
      setEditingId(null)
      setError('')
      await fetchStudents()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEdit = (student) => {
    setEditingId(student._id)
    setForm({
      studentId: student.studentId,
      name: student.name,
      email: student.email,
    })
    setError('')
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/students/${id}`, { method: 'DELETE' })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Xóa không thành công.')
      }

      setError('')
      await fetchStudents()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">MERN CRUD Lab</p>
          <h1>Quản lý sinh viên</h1>
        </div>
      </header>

      <main className="layout">
        <section className="panel form-panel">
          <h2>{editingId ? 'Cập nhật sinh viên' : 'Thêm sinh viên mới'}</h2>

          <form onSubmit={handleSubmit} className="student-form">
            <label>
              MSSV
              <input
                type="text"
                name="studentId"
                placeholder="SV001"
                value={form.studentId}
                onChange={handleChange}
              />
            </label>

            <label>
              Họ tên
              <input
                type="text"
                name="name"
                placeholder="Nguyễn Văn A"
                value={form.name}
                onChange={handleChange}
              />
            </label>

            <label>
              Email
              <input
                type="email"
                name="email"
                placeholder="student@example.com"
                value={form.email}
                onChange={handleChange}
              />
            </label>

            {error && <p className="error-message">{error}</p>}

            <div className="button-row">
              <button type="submit" className="primary-btn">
                {editingId ? 'Cập nhật' : 'Thêm mới'}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => {
                    setEditingId(null)
                    setForm(emptyForm)
                    setError('')
                  }}
                >
                  Hủy
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="panel list-panel">
          <div className="list-header">
            <h2>Danh sách</h2>
            <span>{students.length} sinh viên</span>
          </div>

          {loading ? (
            <p>Đang tải dữ liệu...</p>
          ) : students.length === 0 ? (
            <p>Chưa có sinh viên nào.</p>
          ) : (
            <ul className="student-list">
              {students.map((student) => (
                <li key={student._id} className="student-item">
                  <div>
                    <strong>{student.studentId}</strong>
                    <p>{student.name}</p>
                    <small>{student.email}</small>
                  </div>

                  <div className="actions">
                    <button type="button" className="link-btn" onClick={() => handleEdit(student)}>
                      Sửa
                    </button>
                    <button type="button" className="link-btn danger" onClick={() => handleDelete(student._id)}>
                      Xóa
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
