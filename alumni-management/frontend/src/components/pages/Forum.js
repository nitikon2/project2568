import React, { useState, useEffect } from 'react';
import './forum-modal-bg.css';
import { Dropdown } from 'react-bootstrap';
import BackgroundLayout from '../layout/BackgroundLayout';
import { Container, Card, Button, Form, Alert, Modal, Image } from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/th';

function Forum() {
  // สำหรับเมนู 3 จุด (more menu) และ modal แก้ไขโพสต์
  const [showMoreMenu, setShowMoreMenu] = useState(null); // postId ที่เปิดเมนูอยู่
  const [showEditModal, setShowEditModal] = useState(null); // postId ที่จะแก้ไข
  const [editPost, setEditPost] = useState({ title: '', content: '', image: null });
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(null); // postId ที่จะลบ
  // ฟังก์ชันลบโพสต์
  const handleDeletePost = async () => {
    if (!showDeleteModal) return;
    setDeleting(true);
    try {
      await axios.delete(`http://localhost:5000/api/posts/${showDeleteModal}`);
      setPosts(posts.filter(p => p.id !== showDeleteModal));
      setShowMoreMenu(null);
      setShowDeleteModal(null);
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการลบโพสต์');
    } finally {
      setDeleting(false);
    }
  };

  // ฟังก์ชันเปิด modal แก้ไขโพสต์
  const handleOpenEditModal = (post) => {
  setEditPost({ title: post.title, content: post.content, image: null });
  setEditImagePreview(post.image_url ? `http://localhost:5000${post.image_url}` : null);
  setRemoveImage(false);
  setShowEditModal(post.id);
  setShowMoreMenu(null);
  };

  // ฟังก์ชันแก้ไขโพสต์
  const handleEditPost = async (e) => {
    e.preventDefault();
    if (!editPost.title.trim() || !editPost.content.trim()) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', editPost.title);
      formData.append('content', editPost.content);
      if (editPost.image) formData.append('image', editPost.image);
      formData.append('removeImage', removeImage);
      await axios.put(`http://localhost:5000/api/posts/${showEditModal}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await fetchPosts();
      setShowEditModal(null);
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการแก้ไขโพสต์');
    } finally {
      setSubmitting(false);
    }
  };
  // สำหรับ reply
  const [replyingTo, setReplyingTo] = useState({}); // postId: commentId
  const [replyText, setReplyText] = useState({}); // commentId: text

  // ส่ง reply
  const handleReply = async (postId, parentCommentId) => {
    if (!replyText[parentCommentId]?.trim() || !user) return;
    setCommentLoading(true);
    try {
      const response = await axios.post(`http://localhost:5000/api/posts/${postId}/comments`, {
        content: replyText[parentCommentId],
        user_id: user.id,
        parent_comment_id: parentCommentId
      });
      // รีเฟรชคอมเมนต์
      const res = await axios.get(`http://localhost:5000/api/posts/${postId}/comments`);
      setComments({ ...comments, [postId]: res.data });
      setReplyText({ ...replyText, [parentCommentId]: '' });
      setReplyingTo({ ...replyingTo, [postId]: null });
    } catch (err) {
      setError('ไม่สามารถตอบกลับความคิดเห็นได้');
    } finally {
      setCommentLoading(false);
    }
  };

  // แสดงคอมเมนต์แบบซ้อน
  const renderComments = (commentsArr, postId, level = 0) => {
    return commentsArr.map(comment => {
      const isReply = level > 0;
      return (
        <div key={comment.id} style={{ display: 'flex', marginBottom: 8 }}>
          {/* เส้นนำสายตา */}
          {isReply && <div style={{ width: 24, borderLeft: '2px solid #d1d5db', marginRight: 8, borderRadius: 8 }}></div>}
          <div style={{ flex: 1, marginLeft: isReply ? 0 : 0 }}>
            <div style={{
              background: isReply ? '#f0f2f5' : '#fff',
              borderRadius: 16,
              boxShadow: isReply ? 'none' : '0 2px 8px #e0e7ff',
              border: isReply ? '1px solid #e5e7eb' : 'none',
              padding: '10px 16px',
              minHeight: 40,
              position: 'relative',
            }}>
              <div style={{ fontWeight: 700, color: '#222', fontSize: 15 }}>{comment.author_name}</div>
              <div style={{ color: '#222', fontSize: 15, marginBottom: 2 }}>{comment.content}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                {moment(comment.created_at).locale('th').fromNow()}
                {user && (
                  <span
                    style={{ color: '#2563eb', fontSize: 13, cursor: 'pointer', fontWeight: 500, marginLeft: 16 }}
                    onClick={() => setReplyingTo({ ...replyingTo, [postId]: comment.id })}
                  >ตอบกลับ</span>
                )}
              </div>
              {replyingTo[postId] === comment.id && (
                <Form className="mt-2" onSubmit={e => { e.preventDefault(); handleReply(postId, comment.id); }}>
                  <Form.Group className="d-flex align-items-center" style={{ gap: 8 }}>
                    <Form.Control
                      type="text"
                      placeholder="เขียนตอบกลับ..."
                      value={replyText[comment.id] || ''}
                      onChange={e => setReplyText({ ...replyText, [comment.id]: e.target.value })}
                      disabled={commentLoading}
                      style={{ borderRadius: 16, fontSize: 14, background: '#fff', height: 32, paddingLeft: 12, paddingRight: 12, border: '1.5px solid #e0e7ff' }}
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      style={{ borderRadius: 16, fontWeight: 500, height: 32, minWidth: 32, padding: 0 }}
                      disabled={commentLoading || !(replyText[comment.id]?.trim())}
                    >{commentLoading ? <span className="spinner-border spinner-border-sm"></span> : <i className="fas fa-paper-plane"></i>}</Button>
                  </Form.Group>
                </Form>
              )}
            </div>
            {/* แสดง reply ซ้อน */}
            {comment.replies && comment.replies.length > 0 && (
              <div style={{ marginLeft: 0, marginTop: 4 }}>
                {renderComments(comment.replies, postId, level + 1)}
              </div>
            )}
          </div>
        </div>
      );
    });
  };
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', image: null });
  const [imagePreview, setImagePreview] = useState(null);
  const [validationError, setValidationError] = useState({
    title: '',
    content: '',
    image: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));
  const [comments, setComments] = useState({});
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [currentPostId, setCurrentPostId] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/posts');
      setPosts(response.data);
    } catch (err) {
      setError('ไม่สามารถโหลดโพสต์ได้');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!newPost.title.trim()) {
      errors.title = 'กรุณาระบุหัวข้อ';
    }
    if (!newPost.content.trim()) {
      errors.content = 'กรุณาระบุเนื้อหา';
    }
    if (newPost.image && newPost.image.size > 5 * 1024 * 1024) {
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
      setNewPost({ ...newPost, image: file });
      setImagePreview(URL.createObjectURL(file));
      setValidationError({ ...validationError, image: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', newPost.title);
      formData.append('content', newPost.content);
      formData.append('user_id', user.id);
      if (newPost.image) {
        formData.append('image', newPost.image);
      }

      const response = await axios.post('http://localhost:5000/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.status === 'success') {
        await fetchPosts();
        handleCloseModal();
        setNewPost({ title: '', content: '', image: null });
      } else {
        throw new Error(response.data.message || 'ไม่สามารถสร้างโพสต์ได้');
      }
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.response?.data?.message || 'ไม่สามารถสร้างโพสต์ได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewPost({ title: '', content: '', image: null });
    setImagePreview(null);
    setValidationError({});
  };

  const toggleComments = async (postId) => {
    if (!showComments[postId]) {
      try {
        const response = await axios.get(`http://localhost:5000/api/posts/${postId}/comments`);
        setComments({ ...comments, [postId]: response.data });
      } catch (err) {
        console.error('Error fetching comments:', err);
      }
    }
    setShowComments({ ...showComments, [postId]: !showComments[postId] });
  };

  const handleAddComment = async (postId) => {
    if (!newComment.trim() || !user) return;
    
    setCommentLoading(true);
    try {
      const response = await axios.post(`http://localhost:5000/api/posts/${postId}/comments`, {
        content: newComment,
        user_id: user.id
      });

      // อัพเดทความคิดเห็นในโพสต์
      const updatedComments = comments[postId] ? [...comments[postId], response.data] : [response.data];
      setComments({
        ...comments,
        [postId]: updatedComments
      });

      // อัพเดทจำนวนความคิดเห็นในโพสต์
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comment_count: post.comment_count + 1
          };
        }
        return post;
      }));

      setNewComment('');
      setError('');
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('ไม่สามารถเพิ่มความคิดเห็นได้');
    } finally {
      setCommentLoading(false);
    }
  };

  return (
  <BackgroundLayout>
      <Container style={{ maxWidth: 950 }}>
  <div className="d-flex justify-content-between align-items-center" style={{ paddingTop: 60, marginTop: 0, marginBottom: 30 }}>
          <h2 className="fw-bold forum-title-gradient" style={{ letterSpacing: 1.5, fontSize: 34, textShadow: '0 2px 8px #e0e7ff', borderRadius: 14, padding: '8px 32px', background: 'linear-gradient(90deg, #e0e7ff 60%, #fff 100%)', boxShadow: '0 2px 12px #e0e7ff' }}>
            <i className="fas fa-comments me-2 text-primary"></i>กระดานสนทนา
          </h2>
          {/* ปุ่มสร้างโพสต์ใหม่ถูกลบตามคำขอ */}
        </div>

        {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

        {loading ? (
          <div className="text-center py-5">
            <span className="spinner-border text-primary" role="status"></span>
          </div>
        ) : (
          posts.length === 0 ? (
            <div className="text-center py-5">
              <h4 className="text-muted">ยังไม่มีโพสต์ในขณะนี้</h4>
              <p>มาเริ่มพูดคุยกันเป็นคนแรก!</p>
            </div>
          ) : (
            posts.map(post => (
              <Card key={post.id} className="mb-4 forum-card border-0 shadow" style={{
                borderRadius: 24,
                background: 'rgba(255,255,255,0.92)',
                boxShadow: '0 4px 32px #e0e7ff',
                overflow: 'hidden',
                position: 'relative',
                transition: 'box-shadow 0.2s, transform 0.2s',
              }}>
                <Card.Body className="p-4 position-relative">
                  <div className="d-flex align-items-center mb-2" style={{ position: 'relative' }}>
                    <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #e0e7ff 60%, #fff 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 18, boxShadow: '0 2px 8px #e0e7ff' }}>
                      <i className="fas fa-user-alt" style={{ color: '#2563eb', fontSize: 24 }}></i>
                    </div>
                    <div>
                      <div className="fw-bold" style={{ color: '#2563eb', fontSize: 19 }}>{post.author_name}</div>
                      <div className="text-muted" style={{ fontSize: 13 }}>{moment(post.created_at).locale('th').fromNow()}</div>
                    </div>
                    {/* ปุ่ม 3 จุด เฉพาะโพสต์ของตัวเอง */}
                    {user && user.id === post.user_id && (
                      <Dropdown show={showMoreMenu === post.id} onToggle={() => setShowMoreMenu(showMoreMenu === post.id ? null : post.id)} align="end" style={{ position: 'absolute', right: 0, top: 0 }}>
                        <Dropdown.Toggle variant="link" style={{ color: '#888', fontSize: 22, boxShadow: 'none' }}>
                          <i className="fas fa-ellipsis-v"></i>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item onClick={() => handleOpenEditModal(post)}>
                            <i className="fas fa-edit me-2"></i>แก้ไขโพสต์
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => setShowDeleteModal(post.id)} disabled={deleting} style={{ color: '#e11d48', fontWeight: 600 }}>
                            <i className="fas fa-trash-alt me-2"></i>ลบโพสต์
                          </Dropdown.Item>
        {/* Modal ยืนยันการลบโพสต์ */}
        <Modal show={!!showDeleteModal} onHide={() => setShowDeleteModal(null)} centered>
          <Modal.Header closeButton style={{ background: '#fff0f1', borderBottom: '1.5px solid #fecdd3' }}>
            <Modal.Title style={{ color: '#e11d48', fontWeight: 700, fontSize: 22 }}>
              <i className="fas fa-exclamation-triangle me-2 text-danger"></i>ยืนยันการลบโพสต์
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ background: '#fff7f7', color: '#b91c1c', fontSize: 17, fontWeight: 500 }}>
            <div className="text-center">
              <i className="fas fa-trash-alt fa-3x mb-3 text-danger"></i>
              <p>คุณแน่ใจหรือไม่ว่าต้องการ <b>ลบโพสต์นี้</b>?<br/>หากลบแล้วจะไม่สามารถกู้คืนได้</p>
            </div>
          </Modal.Body>
          <Modal.Footer style={{ background: '#fff0f1', borderTop: '1.5px solid #fecdd3' }}>
            <Button variant="secondary" onClick={() => setShowDeleteModal(null)} style={{ borderRadius: 10, fontWeight: 600 }}>
              <i className="fas fa-times me-1"></i>ยกเลิก
            </Button>
            <Button variant="danger" onClick={handleDeletePost} style={{ borderRadius: 10, fontWeight: 600, minWidth: 90 }} disabled={deleting}>
              {deleting ? <span className="spinner-border spinner-border-sm"></span> : <><i className="fas fa-trash-alt me-1"></i>ลบโพสต์</>}
            </Button>
          </Modal.Footer>
        </Modal>
                        </Dropdown.Menu>
                      </Dropdown>
                    )}
        {/* Modal แก้ไขโพสต์ */}
        <Modal show={!!showEditModal} onHide={() => setShowEditModal(null)} size="lg" dialogClassName="modal-forum-create">
          <Modal.Header closeButton style={{ background: 'linear-gradient(90deg, #e0e7ff 60%, #fff 100%)', borderBottom: '1.5px solid #c7d2fe' }}>
            <Modal.Title style={{ color: '#2563eb', fontWeight: 700, fontSize: 26 }}>
              <i className="fas fa-edit me-2 text-primary"></i>แก้ไขโพสต์
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleEditPost}>
            <Modal.Body style={{ background: '#f4f7fb' }}>
              <Form.Group className="mb-3">
                <Form.Label>หัวข้อ</Form.Label>
                <Form.Control
                  type="text"
                  value={editPost.title}
                  onChange={e => setEditPost({ ...editPost, title: e.target.value })}
                  style={{ borderRadius: 10, fontSize: 16, boxShadow: '0 1px 4px #e0e7ff' }}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>เนื้อหา</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={editPost.content}
                  onChange={e => setEditPost({ ...editPost, content: e.target.value })}
                  style={{ borderRadius: 10, fontSize: 16, boxShadow: '0 1px 4px #e0e7ff' }}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>รูปภาพ (ไม่จำเป็น)</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files[0];
                    setEditPost({ ...editPost, image: file });
                    setEditImagePreview(file ? URL.createObjectURL(file) : null);
                  }}
                  style={{ borderRadius: 10, boxShadow: '0 1px 4px #e0e7ff' }}
                />
                {editImagePreview && (
                  <div className="mt-3 text-center">
                    <p className="mb-2">ตัวอย่างรูปภาพ:</p>
                    <Image src={editImagePreview} style={{ maxHeight: '200px', borderRadius: 14, boxShadow: '0 2px 12px #c7d2fe' }} thumbnail />
                    <Button variant="link" className="d-block mx-auto mt-2" onClick={() => {
                      setEditImagePreview(null);
                      setEditPost({ ...editPost, image: null });
                      setRemoveImage(true);
                    }}>
                      <i className="fas fa-trash-alt me-1"></i>ลบรูปภาพ
                    </Button>
                  </div>
                )}
              </Form.Group>
            </Modal.Body>
            <Modal.Footer style={{ background: '#e0e7ff', borderTop: '1.5px solid #c7d2fe' }}>
              <Button variant="secondary" onClick={() => setShowEditModal(null)} style={{ borderRadius: 10, fontWeight: 600 }}>
                <i className="fas fa-times me-1"></i>ยกเลิก
              </Button>
              <Button variant="primary" type="submit" style={{ borderRadius: 10, fontWeight: 600, minWidth: 90 }} disabled={submitting}>
                {submitting ? <span className="spinner-border spinner-border-sm"></span> : <><i className="fas fa-save me-1"></i>บันทึก</>}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
                  </div>
                  <Card.Title className="fw-bold" style={{ color: '#1e293b', fontSize: 23, marginBottom: 8 }}>{post.title}</Card.Title>
                  <Card.Text style={{ color: '#334155', fontSize: 16, minHeight: 40 }}>{post.content}</Card.Text>
                  {post.image_url && (
                    <div className="mb-3 text-center">
                      <img
                        src={`http://localhost:5000${post.image_url}`}
                        alt="Post"
                        style={{ maxWidth: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: 16, boxShadow: '0 2px 12px #c7d2fe' }}
                      />
                    </div>
                  )}
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      style={{ borderRadius: 10, fontWeight: 600, background: '#f1f5f9', border: '1.5px solid #2563eb', color: '#2563eb' }}
                      onClick={() => toggleComments(post.id)}
                    >
                      <i className="far fa-comments me-1"></i>ความคิดเห็น ({post.comment_count})
                    </Button>
                  </div>

                  {showComments[post.id] && (
                    <div className="mt-4 p-3 rounded" style={{ background: '#f1f5f9', border: '1.5px solid #e0e7ff', boxShadow: '0 2px 8px #e0e7ff' }}>
                      <div className="comments-section mb-2">
                        {comments[post.id]?.length === 0 && (
                          <div className="text-muted text-center">ยังไม่มีความคิดเห็น</div>
                        )}
                        {comments[post.id] && renderComments(comments[post.id], post.id)}
                      </div>
                      {user ? (
                        <Form className="mt-3" onSubmit={(e) => {
                          e.preventDefault();
                          handleAddComment(post.id);
                        }}>
                          <Form.Group className="d-flex align-items-center">
                            <Form.Control
                              type="text"
                              placeholder="เพิ่มความคิดเห็น..."
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              disabled={commentLoading}
                              style={{ borderRadius: 10, fontSize: 15, background: '#fff', boxShadow: '0 1px 4px #e0e7ff' }}
                            />
                            <Button
                              type="submit"
                              variant="primary"
                              className="ms-2"
                              style={{ borderRadius: 10, fontWeight: 600, minWidth: 40 }}
                              disabled={commentLoading || !newComment.trim()}
                            >
                              {commentLoading ? <span className="spinner-border spinner-border-sm"></span> : <i className="fas fa-paper-plane"></i>}
                            </Button>
                          </Form.Group>
                        </Form>
                      ) : (
                        <p className="text-muted mt-3">กรุณาเข้าสู่ระบบเพื่อแสดงความคิดเห็น</p>
                      )}
                    </div>
                  )}
                </Card.Body>
              </Card>
            ))
          )
        )}

        <Modal show={showModal} onHide={handleCloseModal} size="lg" dialogClassName="modal-forum-create">
          <Modal.Header closeButton style={{ background: 'linear-gradient(90deg, #e0e7ff 60%, #fff 100%)', borderBottom: '1.5px solid #c7d2fe' }}>
            <Modal.Title style={{ color: '#2563eb', fontWeight: 700, fontSize: 26 }}>
              <i className="fas fa-plus-circle me-2 text-primary"></i>สร้างโพสต์ใหม่
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body style={{ background: '#f4f7fb' }}>
              <Form.Group className="mb-3">
                <Form.Label>หัวข้อ</Form.Label>
                <Form.Control
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  isInvalid={!!validationError.title}
                  style={{ borderRadius: 10, fontSize: 16, boxShadow: '0 1px 4px #e0e7ff' }}
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
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  isInvalid={!!validationError.content}
                  style={{ borderRadius: 10, fontSize: 16, boxShadow: '0 1px 4px #e0e7ff' }}
                />
                <Form.Control.Feedback type="invalid">
                  {validationError.content}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>รูปภาพ (ไม่จำเป็น)</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  isInvalid={!!validationError.image}
                  style={{ borderRadius: 10, boxShadow: '0 1px 4px #e0e7ff' }}
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
                    style={{ maxHeight: '200px', borderRadius: 14, boxShadow: '0 2px 12px #c7d2fe' }} 
                    thumbnail 
                  />
                  <Button 
                    variant="link" 
                    className="d-block mx-auto mt-2"
                    onClick={() => {
                      setImagePreview(null);
                      setNewPost({...newPost, image: null});
                    }}
                  >
                    <i className="fas fa-trash-alt me-1"></i>ลบรูปภาพ
                  </Button>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer style={{ background: '#e0e7ff', borderTop: '1.5px solid #c7d2fe' }}>
              <Button variant="secondary" onClick={handleCloseModal} style={{ borderRadius: 10, fontWeight: 600 }}>
                <i className="fas fa-times me-1"></i>ยกเลิก
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                style={{ borderRadius: 10, fontWeight: 600, minWidth: 90 }}
                disabled={submitting}
              >
                {submitting ? <span className="spinner-border spinner-border-sm"></span> : <><i className="fas fa-paper-plane me-1"></i>โพสต์</>}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
        <style>{`
          .forum-title-gradient {
            background: linear-gradient(90deg, #e0e7ff 60%, #fff 100%);
            color: #2563eb;
            box-shadow: 0 2px 12px #e0e7ff;
          }
          .forum-card {
            transition: box-shadow 0.2s, transform 0.2s;
          }
          .forum-card:hover {
            box-shadow: 0 8px 32px rgba(37,99,235,0.13), 0 1.5px 6px rgba(44, 62, 80, 0.08);
            transform: translateY(-4px) scale(1.01);
          }
          .modal-forum-create .modal-content {
            border-radius: 20px;
            box-shadow: 0 4px 32px #e0e7ff;
          }
          .fab-create-post {
            position: fixed;
            right: 36px;
            bottom: 36px;
            z-index: 999;
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: linear-gradient(135deg, #60a5fa 60%, #2563eb 100%);
            color: #fff;
            font-size: 2rem;
            box-shadow: 0 6px 24px #2563eb55;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            transition: box-shadow 0.2s, transform 0.2s;
          }
          .fab-create-post:hover {
            box-shadow: 0 12px 32px #2563eb99;
            transform: scale(1.08);
            background: linear-gradient(135deg, #2563eb 60%, #60a5fa 100%);
          }
        `}</style>
      </Container>
        {/* ปุ่ม FAB สำหรับสร้างโพสต์ใหม่ */}
        {user && (
          <Button
            className="fab-create-post"
            onClick={() => setShowModal(true)}
          >
            <i className="fas fa-plus"></i>
          </Button>
        )}
  </BackgroundLayout>
  );
}

export default Forum;
