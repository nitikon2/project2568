
import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Container } from 'react-bootstrap';
import axios from 'axios';
import AdminLayout from '../../layout/AdminLayout';

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // ปรับ endpoint ให้ดึง is_verified ด้วย
      const response = await axios.get('http://localhost:5000/api/admin/users/all');
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
      setLoading(false);
    }
  };

  // ฟังก์ชันเปลี่ยนสถานะ active/suspended

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${userId}/status`, {
        status: newStatus
      });
      fetchUsers();
    } catch (err) {
      setError('ไม่สามารถอัพเดทสถานะผู้ใช้ได้');
    }
  };

  // ฟังก์ชันเปลี่ยนสถานะยืนยัน/รอการยืนยัน
  const handleVerifyChange = async (userId, isVerified) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${userId}/verify`, {
        is_verified: isVerified
      });
      fetchUsers();
    } catch (err) {
      setError('ไม่สามารถอัพเดทสถานะการยืนยันได้');
    }
  };

  if (loading) {
    return <Container className="text-center py-5">กำลังโหลด...</Container>;
  }

  return (
    <AdminLayout>
      <h2 className="mb-4">จัดการผู้ใช้งาน</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <Table responsive striped hover>
        <thead>
          <tr>
            <th>ชื่อ-นามสกุล</th>
            <th>อีเมล</th>
            <th>คณะ</th>
            <th>ปีที่จบ</th>
            <th>สถานะ</th>
            <th>การยืนยัน</th>
            <th>การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.faculty}</td>
              <td>{user.graduation_year}</td>
              <td>
                <Badge bg={user.status === 'active' ? 'success' : 'warning'}>
                  {user.status === 'active' ? 'ใช้งาน' : 'ระงับ'}
                </Badge>
              </td>
              <td>
                <Badge bg={user.is_verified ? 'success' : 'secondary'}>
                  {user.is_verified ? 'ยืนยันแล้ว' : 'รอการยืนยัน'}
                </Badge>
              </td>
              <td>
                <Button
                  variant={user.status === 'active' ? 'warning' : 'success'}
                  size="sm"
                  onClick={() => handleStatusChange(user.id, user.status === 'active' ? 'suspended' : 'active')}
                  className="me-2"
                >
                  {user.status === 'active' ? 'ระงับการใช้งาน' : 'เปิดใช้งาน'}
                </Button>
                {user.is_verified ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleVerifyChange(user.id, false)}
                  >
                    ตั้งเป็นรอการยืนยัน
                  </Button>
                ) : (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleVerifyChange(user.id, true)}
                  >
                    ยืนยัน
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </AdminLayout>
  );
}

export default ManageUsers;
