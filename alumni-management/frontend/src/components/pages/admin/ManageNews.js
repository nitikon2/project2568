import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Form, Modal, Alert, Spinner, Image } from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/th';
import AdminLayout from '../../layout/AdminLayout';
import Swal from 'sweetalert2';

function ManageNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState({
    title: '',
    content: '',
    image: ''
  });
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/news', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNews(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลข่าวสารได้');
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (newsItem = null) => {
    setSelectedNews(newsItem);
    setFormData({
      title: newsItem?.title || '',
      content: newsItem?.content || '',
      image: null
    });
    setImagePreview(newsItem?.image_url
      ? (newsItem.image_url.startsWith('http')
        ? newsItem.image_url
        : `http://localhost:5000${newsItem.image_url}`)
      : null
    );
    setValidationError({});
    setError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedNews(null);
    setFormData({ title: '', content: '', image: null });
    setImagePreview(null);
    setValidationError({});
    setError('');
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = 'กรุณาระบุหัวข้อข่าว';
    }
    if (!formData.content.trim()) {
      errors.content = 'กรุณาระบุเนื้อหา';
    }
    if (formData.image && formData.image.size > 5 * 1024 * 1024) {
      errors.image = 'ขนาดไฟล์ต้องไม่เกิน 5MB';
    }
    setValidationError(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setValidationError({
          ...validationError,
          image: 'ขนาดไฟล์ต้องไม่เกิน 5MB'
        });
        return;
      }
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
      setValidationError({ ...validationError, image: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;
    try {
      const token = localStorage.getItem('token');
      const payload = new FormData();
      payload.append('title', formData.title.trim());
      payload.append('content', formData.content.trim());
      if (formData.image) payload.append('image', formData.image);

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
          // ไม่ต้องใส่ 'Content-Type': 'multipart/form-data' ให้ axios จัดการเอง
        }
      };

      if (selectedNews) {
        await axios.put(
          `http://localhost:5000/api/admin/news/${selectedNews.id}`,
          payload,
          config
        );
        Swal.fire('สำเร็จ', 'อัพเดทข่าวสารเรียบร้อย', 'success');
      } else {
        await axios.post(
          'http://localhost:5000/api/admin/news',
          payload,
          config
        );
        Swal.fire('สำเร็จ', 'เพิ่มข่าวสารเรียบร้อย', 'success');
      }
      handleCloseModal();
      fetchNews();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'ไม่สามารถบันทึกข้อมูลได้'
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const result = await Swal.fire({
        title: 'ยืนยันการลบ',
        text: 'คุณต้องการลบข่าวนี้ใช่หรือไม่?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก'
      });
      if (result.isConfirmed) {
        await axios.delete(`http://localhost:5000/api/admin/news/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        Swal.fire('สำเร็จ', 'ลบข่าวสารเรียบร้อย', 'success');
        fetchNews();
      }
    } catch (err) {
      Swal.fire('ผิดพลาด', 'ไม่สามารถลบข่าวสารได้', 'error');
    }
  };

  // ฟิลเตอร์ข่าวสารตาม search
  const filteredNews = news.filter(item =>
    item.title?.toLowerCase().includes(search.trim().toLowerCase()) ||
    item.content?.toLowerCase().includes(search.trim().toLowerCase()) ||
    item.author_name?.toLowerCase().includes(search.trim().toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold" style={{color:'#f59e42', letterSpacing:1}}>
          <i className="fas fa-newspaper me-2 text-warning"></i>จัดการข่าวสาร
        </h2>
        <Button variant="warning" style={{borderRadius:8, fontWeight:500, boxShadow:'0 2px 8px #fde68a'}} onClick={() => handleShowModal()}>
          <i className="fas fa-plus me-2"></i>เพิ่มข่าวใหม่
        </Button>
      </div>
      <div className="mb-3" style={{ maxWidth: 400 }}>
        <Form.Control
          type="text"
          placeholder="ค้นหาข่าวสาร..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{borderRadius:8, fontSize:15, boxShadow:'0 1px 4px #fef3c7'}}
        />
      </div>
      {error && <Alert variant="danger" className="text-center" style={{maxWidth: 600, margin: '0 auto 1rem auto'}}>{error}</Alert>}
      <div style={{background:'rgba(255,255,255,0.98)', borderRadius:18, boxShadow:'0 2px 12px #fef3c7', padding:'1.5rem 1rem'}}>
        <div className="table-responsive">
          <Table hover className="align-middle mb-0" style={{borderRadius:12, overflow:'hidden'}}>
            <thead style={{background:'#fff7ed'}}>
              <tr style={{fontWeight:600, color:'#b45309'}}>
                <th style={{width:50}}>#</th>
                <th>หัวข้อข่าว</th>
                <th>วันที่เผยแพร่</th>
                <th>ผู้เขียน</th>
                <th>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredNews.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">
                    ไม่พบข้อมูลข่าวสาร
                  </td>
                </tr>
              ) : (
                filteredNews.map((item, idx) => (
                  <tr key={item.id} style={{background: idx%2===0 ? '#fff7ed' : '#fff'}}>
                    <td className="fw-bold text-warning">{idx + 1}</td>
                    <td className="fw-semibold"><i className="fas fa-newspaper me-2 text-warning"></i>{item.title}</td>
                    <td>{moment(item.created_at).locale('th').format('LLL')}</td>
                    <td>{item.author_name || 'Admin'}</td>
                    <td>
                      <Button
                        variant="outline-warning"
                        size="sm"
                        className="me-2"
                        style={{borderRadius:7, fontWeight:500}}
                        onClick={() => handleShowModal(item)}>
                        <i className="fas fa-edit"></i>
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        style={{borderRadius:7, fontWeight:500}}
                        onClick={() => handleDelete(item.id)}>
                        <i className="fas fa-trash-alt"></i>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </div>
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton style={{background:'linear-gradient(90deg, #fef3c7 60%, #fff 100%)', borderBottom:'1.5px solid #fde68a'}}>
            <Modal.Title style={{color:'#f59e42', fontWeight:700, fontSize:22}}>
              <i className="fas fa-newspaper me-2 text-warning"></i>{selectedNews ? 'แก้ไขข่าว' : 'เพิ่มข่าวใหม่'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{background:'#fff7ed'}}>
            <Form.Group className="mb-3">
              <Form.Label>หัวข้อข่าว</Form.Label>
              <Form.Control
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                isInvalid={!!validationError.title}
                required
                style={{borderRadius:8}}
              />
              <Form.Control.Feedback type="invalid">
                {validationError.title}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>เนื้อหา</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                isInvalid={!!validationError.content}
                required
                style={{borderRadius:8}}
              />
              <Form.Control.Feedback type="invalid">
                {validationError.content}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>เลือกรูปภาพ (ไม่จำเป็น)</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                isInvalid={!!validationError.image}
                style={{borderRadius:8}}
              />
              <Form.Text className="text-muted">
                รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 5MB
              </Form.Text>
              <Form.Control.Feedback type="invalid">
                {validationError.image}
              </Form.Control.Feedback>
            </Form.Group>
            {imagePreview && (
              <div className="mt-3 text-center">
                <p className="mb-2">ตัวอย่างรูปภาพ:</p>
                <Image
                  src={imagePreview}
                  style={{ maxHeight: '200px', borderRadius:8, boxShadow:'0 1px 8px #fde68a' }}
                  thumbnail
                />
                <Button
                  variant="link"
                  className="d-block mx-auto mt-2"
                  onClick={() => {
                    setImagePreview(null);
                    setFormData({ ...formData, image: null });
                  }}
                >
                  ลบรูปภาพ
                </Button>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer style={{background:'#fef3c7', borderTop:'1.5px solid #fde68a'}}>
            <Button variant="secondary" onClick={handleCloseModal} style={{borderRadius:8, fontWeight:500}}>
              ยกเลิก
            </Button>
            <Button variant="warning" type="submit" style={{borderRadius:8, fontWeight:500}}>
              {selectedNews ? 'บันทึกการแก้ไข' : 'เพิ่มข่าว'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      <style>{`
        table {
          font-size: 1.08rem;
        }
        th, td {
          white-space: nowrap;
          padding-top: 16px !important;
          padding-bottom: 16px !important;
        }
        .card {
          padding: 12px 0;
        }
        @media (max-width: 991px) {
          table {
            font-size: 0.98rem;
          }
        }
        @media (max-width: 767px) {
          table {
            font-size: 0.93rem;
          }
        }
        @media (max-width: 480px) {
          table {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </AdminLayout>
  );
}

export default ManageNews;



