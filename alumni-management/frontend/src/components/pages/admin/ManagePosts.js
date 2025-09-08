import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Form, Row, Col, Card, Alert, Spinner, OverlayTrigger, Tooltip, Modal } from 'react-bootstrap';
import AdminLayout from '../../layout/AdminLayout';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/th';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaTrash } from 'react-icons/fa';

function ManagePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailPost, setDetailPost] = useState(null);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [comments, setComments] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentError, setCommentError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
      Swal.fire('Error', 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้', 'error');
      navigate('/login');
      return;
    }
    axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/admin/forum/posts');
      setPosts(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลโพสต์ได้');
    } finally {
      setLoading(false);
    }
  };

  // flatten comments (root + reply)
  const flattenComments = (comments) => {
    const result = [];
    const traverse = (comment, parent = null) => {
      result.push({ ...comment, parentId: parent?.id || null });
      if (comment.replies && comment.replies.length > 0) {
        comment.replies.forEach(reply => traverse(reply, comment));
      }
    };
    comments.forEach(c => traverse(c));
    return result;
  };

  const fetchComments = async (postId) => {
    setCommentsLoading(true);
    setCommentError('');
    setSelectedPostId(postId);
    try {
      const response = await axios.get(`http://localhost:5000/api/posts/${postId}/comments`);
      const nested = Array.isArray(response.data) ? response.data : [];
      setComments(flattenComments(nested));
      setShowCommentsModal(true);
    } catch (err) {
      setCommentError('ไม่สามารถโหลดคอมเมนต์ได้');
      setComments([]);
      setShowCommentsModal(true);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleStatusChange = async (postId, status) => {
    try {
      const result = await Swal.fire({
        title: 'ยืนยันการดำเนินการ',
        text: `คุณต้องการ${status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'}โพสต์นี้ใช่หรือไม่?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ยืนยัน',
        cancelButtonText: 'ยกเลิก'
      });
      if (result.isConfirmed) {
        await axios.put(`http://localhost:5000/api/admin/forum/posts/${postId}/${status}`);
        Swal.fire('สำเร็จ', `${status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'}โพสต์เรียบร้อย`, 'success');
        fetchPosts();
      }
    } catch (err) {
      Swal.fire('ผิดพลาด', `ไม่สามารถ${status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'}โพสต์ได้`, 'error');
    }
  };

  const handleDelete = async (postId) => {
    try {
      const result = await Swal.fire({
        title: 'ยืนยันการลบ',
        text: 'คุณต้องการลบโพสต์นี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#d33'
      });

      if (result.isConfirmed) {
        await axios.delete(`http://localhost:5000/api/admin/posts/${postId}`);
        Swal.fire('สำเร็จ', 'ลบโพสต์เรียบร้อย', 'success');
        fetchPosts();
      }
    } catch (err) {
      Swal.fire('ผิดพลาด', 'ไม่สามารถลบโพสต์ได้', 'error');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const result = await Swal.fire({
        title: 'ยืนยันการลบ',
        text: 'คุณต้องการลบคอมเมนต์นี้ใช่หรือไม่?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#d33'
      });
      if (result.isConfirmed) {
        await axios.delete(`http://localhost:5000/api/admin/forum/comments/${commentId}`);
        Swal.fire('สำเร็จ', 'ลบคอมเมนต์เรียบร้อย', 'success');
        fetchComments(selectedPostId);
        fetchPosts(); // อัปเดทจำนวนคอมเมนต์ในตารางโพสต์
      }
    } catch (err) {
      Swal.fire('ผิดพลาด', 'ไม่สามารถลบคอมเมนต์ได้', 'error');
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'pending': return 'warning';
      default: return 'secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'อนุมัติแล้ว';
      case 'rejected': return 'ปฏิเสธแล้ว';
      case 'pending': return 'รอตรวจสอบ';
      default: return 'ไม่ระบุ';
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author_name?.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && post.status === filterStatus;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <Alert variant="danger" className="text-center">
          {error}
          <Button 
            variant="outline-danger" 
            size="sm" 
            className="ms-2"
            onClick={() => {
              setError('');
              setLoading(true);
              fetchPosts();
            }}
          >
            ลองใหม่
          </Button>
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {error && (
        <Alert variant="danger" className="text-center" style={{maxWidth: 600, margin: '0 auto 1rem auto'}}>
          {error}
          <Button 
            variant="outline-danger" 
            size="sm" 
            className="ms-2"
            onClick={() => {
              setError('');
              setLoading(true);
              fetchPosts();
            }}
          >ลองใหม่</Button>
        </Alert>
      )}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold" style={{color:'#22c55e', letterSpacing:1}}>
          <i className="fas fa-comments me-2 text-success"></i>จัดการกระดานสนทนา
        </h2>
        <span className="text-muted" style={{fontWeight:500, fontSize:18}}>รวม {filteredPosts.length} โพสต์</span>
      </div>
      <div className="mb-3" style={{ maxWidth: 400 }}>
        <Form.Control
          type="text"
          placeholder="ค้นหาตามชื่อหัวข้อหรือชื่อผู้โพสต์"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{borderRadius:8, fontSize:15, boxShadow:'0 1px 4px #bbf7d0'}}
        />
      </div>
  <div style={{background:'rgba(255,255,255,0.98)', borderRadius:18, boxShadow:'0 2px 12px #bbf7d0', padding:'1.5rem 1rem'}}>
        <div className="table-responsive">
          <Table hover className="align-middle mb-0" style={{borderRadius:12, overflow:'hidden'}}>
            <thead style={{background:'#ecfdf5'}}>
              <tr style={{fontWeight:600, color:'#15803d'}}>
                <th style={{width:50}}>#</th>
                <th>หัวข้อ</th>
                <th>ผู้โพสต์</th>
                <th>วันที่โพสต์</th>
                <th>คอมเมนต์</th>
                <th>รูปภาพ</th>
                <th className="text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    ไม่พบข้อมูลโพสต์
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post, idx) => (
                  <tr key={post.id} style={{background: idx%2===0 ? '#ecfdf5' : '#fff'}}>
                    <td className="fw-bold text-success">{idx + 1}</td>
                    <td className="fw-semibold"><i className="fas fa-comment-dots me-2 text-success"></i>{post.title}</td>
                    <td>{post.author_name}</td>
                    <td>{moment(post.created_at).locale('th').format('LLL')}</td>
                    <td><span className="badge bg-success text-white" style={{fontSize:13}}>{post.comment_count}</span></td>
                    <td>
                      {post.image_url && (
                        <img
                          src={`http://localhost:5000${post.image_url}`}
                          alt={post.title}
                          style={{ width: 80, height: 50, objectFit: 'cover', borderRadius: 4, boxShadow:'0 1px 4px #bbf7d0' }}
                        />
                      )}
                    </td>
                    <td className="text-center">
                      <Button
                        variant="outline-info"
                        size="sm"
                        className="me-2"
                        style={{borderRadius:7, fontWeight:500}}
                        onClick={() => {
                          setDetailPost(post);
                          setShowDetailModal(true);
                        }}
                      >
                        <i className="fas fa-eye me-1"></i>ดูรายละเอียด
                      </Button>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="me-2"
                        style={{borderRadius:7, fontWeight:500}}
                        onClick={() => fetchComments(post.id)}
                      >
                        <i className="fas fa-comments me-1"></i>ดูคอมเมนต์
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        style={{borderRadius:7, fontWeight:500}}
                        onClick={() => handleDelete(post.id)}
                      >
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
      {/* Modal แสดงรายละเอียดโพสต์ */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered>
        <Modal.Header closeButton style={{background:'linear-gradient(90deg, #bbf7d0 60%, #fff 100%)', borderBottom:'1.5px solid #22c55e'}}>
          <Modal.Title style={{color:'#22c55e', fontWeight:700, fontSize:22}}>
            <i className="fas fa-comment-dots me-2 text-success"></i>รายละเอียดโพสต์
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{background:'#ecfdf5'}}>
          {detailPost && (
            <>
              <h4 className="mb-3 text-success"><i className="fas fa-quote-left me-2"></i>{detailPost.title}</h4>
              <div className="mb-2">
                <strong>ผู้โพสต์:</strong> {detailPost.author_name}
              </div>
              <div className="mb-2">
                <strong>วันที่โพสต์:</strong> {moment(detailPost.created_at).locale('th').format('LLL')}
              </div>
              <div className="mb-3">
                <strong>เนื้อหา:</strong>
                <div className="mt-2 p-3 bg-light rounded" style={{minHeight:60}}>
                  {detailPost.content}
                </div>
              </div>
              {detailPost.image_url && (
                <div className="text-center mb-3">
                  <img
                    src={`http://localhost:5000${detailPost.image_url}`}
                    alt={detailPost.title}
                    style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '8px', boxShadow:'0 1px 8px #bbf7d0' }}
                  />
                </div>
              )}
              <div>
                <strong>ความคิดเห็น:</strong> <span className="badge bg-success text-white" style={{fontSize:13}}>{detailPost.comment_count}</span> ความคิดเห็น
              </div>
            </>
          )}
        </Modal.Body>
  <Modal.Footer style={{background:'#bbf7d0', borderTop:'1.5px solid #22c55e'}}>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)} style={{borderRadius:8, fontWeight:500}}>
            ปิด
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Modal แสดงคอมเมนต์ของโพสต์ */}
      <Modal show={showCommentsModal} onHide={() => setShowCommentsModal(false)} size="lg" centered>
        <Modal.Header closeButton style={{background:'linear-gradient(90deg, #bbf7d0 60%, #fff 100%)', borderBottom:'1.5px solid #22c55e'}}>
          <Modal.Title style={{color:'#22c55e', fontWeight:700, fontSize:22}}>
            <i className="fas fa-comments me-2 text-success"></i>คอมเมนต์ของโพสต์
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{background:'#ecfdf5'}}>
          {commentsLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="success" />
            </div>
          ) : commentError ? (
            <Alert variant="danger" className="text-center">{commentError}</Alert>
          ) : comments.length === 0 ? (
            <div className="text-center text-muted py-4">ไม่มีคอมเมนต์</div>
          ) : (
            <Table responsive hover size="sm" style={{background:'#f0fdf4', borderRadius:8}}>
              <thead style={{background:'#bbf7d0'}}>
                <tr style={{color:'#15803d'}}>
                  <th>ผู้คอมเมนต์</th>
                  <th>เนื้อหา</th>
                  <th>วันที่</th>
                  <th>ประเภท</th>
                  <th className="text-center">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {comments.map(comment => (
                  <tr key={comment.id}>
                    <td>{comment.author_name}</td>
                    <td>{comment.content}</td>
                    <td>{moment(comment.created_at).locale('th').format('LLL')}</td>
                    <td>{comment.parentId ? 'ตอบกลับ' : 'คอมเมนต์หลัก'}</td>
                    <td className="text-center">
                      <Button
                        variant="outline-danger"
                        size="sm"
                        style={{borderRadius:7, fontWeight:500}}
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        <i className="fas fa-trash-alt"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer style={{background:'#bbf7d0', borderTop:'1.5px solid #22c55e'}}>
          <Button variant="secondary" onClick={() => setShowCommentsModal(false)} style={{borderRadius:8, fontWeight:500}}>
            ปิด
          </Button>
        </Modal.Footer>
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

export default ManagePosts;

