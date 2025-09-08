import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import BackgroundLayout from '../layout/BackgroundLayout';
import { Card, Button, Modal, Spinner } from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/th';

function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalNews, setModalNews] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get('http://localhost:5000/api/news');
        setNews(Array.isArray(response.data) ? response.data : []);
        console.log('Fetched news:', response.data);
      } catch (err) {
        setError('ไม่สามารถโหลดข่าวสารได้');
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading) {
    return (
      <BackgroundLayout>
        <div className="news-page-bg">
          <div className="news-page-container">
            <div className="news-loading">
              <Spinner animation="border" variant="primary" />
            </div>
          </div>
        </div>
      </BackgroundLayout>
    );
  }

  // ปิด modal ข่าวสาร
  const handleCloseModal = () => {
    setShowModal(false);
    setModalNews(null);
  };

  // แบ่งข่าวสำหรับแต่ละ section
  const highlightNewsList = news.slice(0, 3); // 3 ข่าวเด่นสุด
  const latestNews = news.slice(3, 8); // 5 ข่าวล่าสุดถัดไป
  const allNews = news.slice(8); // ข่าวทั้งหมดที่เหลือ
// ...existing code...

  // สำหรับ modal รายละเอียดข่าว
  const handleShowDetail = (item) => {
    setModalNews(item);
    setShowModal(true);
  };

  // --- ลบซ้ำ: ใช้ highlightNewsList, latestNews, allNews ที่ประกาศด้านบน ---

  // Masonry responsive columns
  const getGridColumns = () => {
    if (window.innerWidth >= 1200) return 3;
    if (window.innerWidth >= 900) return 2;
    return 1;
  };

  return (
    <BackgroundLayout>
      <div className="news-page-container" style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px 0 16px', position: 'relative', zIndex: 1 }}>
        <div className="news-page-header" style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2 className="news-page-title" style={{ fontSize: '2.6rem', fontWeight: 800, color: '#2563eb', marginBottom: 8 }}>
            <i className="fas fa-bullhorn me-2" style={{ color: '#2563eb' }}></i>ข่าวสารและประกาศ
          </h2>
          <p className="news-page-desc" style={{ fontSize: '1.18rem', color: '#64748b' }}>
            ติดตามข่าวสาร กิจกรรม และประกาศสำคัญจากมหาวิทยาลัยราชภัฏมหาสารคาม
          </p>
        </div>

          {/* Banner Slider */}
          {highlightNewsList.length > 0 && (
            <div className="banner-slider-outer">
              <Slider
                dots={true}
                infinite={true}
                speed={700}
                slidesToShow={1}
                slidesToScroll={1}
                autoplay={true}
                autoplaySpeed={4200}
                arrows={false}
                className="news-banner-slider modern news-slider-fresh"
              >
                {highlightNewsList.map((item) => (
                  <div key={item.id}>
                    <div className="news-slider-fresh-card">
                      <div className="news-slider-fresh-row">
                        <div className="news-slider-fresh-img-col">
                          {item.image_url && (
                            <img
                              src={item.image_url.startsWith('http') ? item.image_url : `http://localhost:5000${item.image_url}`}
                              alt="Highlight News"
                              className="news-slider-fresh-img"
                            />
                          )}
                          <div className="news-slider-fresh-accent" />
                        </div>
                        <div className="news-slider-fresh-content-col">
                          <div className="news-slider-fresh-title">{item.title}</div>
                          <div className="news-slider-fresh-desc">
                            {item.content?.length > 180 ? item.content.substring(0, 180) + '...' : item.content}
                          </div>
                          <div className="news-slider-fresh-meta">
                            <span><i className="fas fa-user me-1"></i>{item.author_name || 'Admin'}</span>
                            <span className="mx-2">|</span>
                            <span><i className="far fa-clock me-1"></i>{moment(item.created_at).locale('th').format('LLL')}</span>
                          </div>
                          <Button size="md" className="news-slider-fresh-btn" onClick={() => handleShowDetail(item)}>
                            <i className="fas fa-eye me-1"></i>ดูรายละเอียด
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          )}

          {/* Latest News Section */}
          <div className="news-section news-latest-section">
            <div className="news-section-header">
              <span className="news-section-title"><i className="fas fa-star me-2" style={{ color: '#facc15' }}></i>ข่าวล่าสุด</span>
            </div>
            <div className="news-latest-grid">
              {latestNews.map(item => (
                <div key={item.id} className="news-latest-card">
                  <div className="news-latest-img-wrap">
                    {item.image_url && (
                      <img
                        src={item.image_url.startsWith('http') ? item.image_url : `http://localhost:5000${item.image_url}`}
                        alt="News"
                        className="news-latest-img"
                        onError={e => { e.target.onerror = null; e.target.src = '/news-default.jpg'; }}
                      />
                    )}
                  </div>
                  <div className="news-latest-content">
                    <div className="news-latest-title">{item.title}</div>
                    <div className="news-latest-meta">
                      <span><i className="far fa-clock me-1"></i>{moment(item.created_at).locale('th').format('LLL')}</span>
                    </div>
                    <Button size="sm" className="news-latest-btn" onClick={() => handleShowDetail(item)}>
                      <i className="fas fa-eye me-1"></i>อ่านต่อ
                    </Button>
                  </div>
                </div>
              ))}
              {latestNews.length === 0 && !loading && !error && (
                <div className="text-center py-5 w-100">
                  <h5>ยังไม่มีข่าวล่าสุด</h5>
                </div>
              )}
            </div>
          </div>

          {/* All News Section */}
          <div className="news-section news-all-section">
            <div className="news-section-header">
              <span className="news-section-title"><i className="far fa-newspaper me-2" style={{ color: '#2563eb' }}></i>ข่าวทั้งหมด</span>
            </div>
            <div className="news-all-list">
              {allNews.map(item => (
                <div key={item.id} className="news-all-item">
                  <div className="news-all-img-wrap">
                    {item.image_url && (
                      <img
                        src={item.image_url.startsWith('http') ? item.image_url : `http://localhost:5000${item.image_url}`}
                        alt="News"
                        className="news-all-img"
                        onError={e => { e.target.onerror = null; e.target.src = '/news-default.jpg'; }}
                      />
                    )}
                  </div>
                  <div className="news-all-content">
                    <div className="news-all-title">{item.title}</div>
                    <div className="news-all-meta">
                      <span><i className="far fa-clock me-1"></i>{moment(item.created_at).locale('th').format('LLL')}</span>
                    </div>
                    <Button size="sm" className="news-all-btn" onClick={() => handleShowDetail(item)}>
                      <i className="fas fa-eye me-1"></i>อ่านต่อ
                    </Button>
                  </div>
                </div>
              ))}
              {allNews.length === 0 && !loading && !error && (
                <div className="text-center py-5 w-100">
                  <h5>ยังไม่มีข่าวย้อนหลัง</h5>
                </div>
              )}
            </div>
          </div>

          {/* Error/Loading */}
          {error && (
            <div className="news-error">
              <span>{error}</span>
            </div>
          )}
          {loading && (
            <div className="news-loading">
              <Spinner animation="border" variant="primary" />
            </div>
          )}
          {!loading && news.length === 0 && !error && (
            <div className="text-center py-5">
              <h4>ไม่พบข้อมูลข่าวสาร</h4>
              <p className="text-muted">กรุณาตรวจสอบการเชื่อมต่อหรือรอให้ผู้ดูแลเพิ่มข่าว</p>
            </div>
          )}
        </div>

        {/* Modal แสดงรายละเอียดข่าว */}
        <Modal show={showModal && modalNews} onHide={handleCloseModal} centered size="lg" dialogClassName="modal-news-detail">
          <Modal.Header closeButton style={{ background: 'linear-gradient(90deg, #e0e7ff 60%, #fff 100%)', borderBottom: '1.5px solid #c7d2fe' }}>
            <Modal.Title style={{ color: '#2563eb', fontWeight: 700, fontSize: 24 }}>
              <i className="far fa-newspaper me-2" style={{ color: '#60a5fa' }}></i>{modalNews?.title}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ background: '#f8fafc' }}>
            {modalNews?.image_url && (
              <div className="mb-3 text-center">
                <img
                  src={modalNews.image_url.startsWith('http') ? modalNews.image_url : `http://localhost:5000${modalNews.image_url}`}
                  alt="News Detail"
                  style={{ maxWidth: '100%', maxHeight: 350, borderRadius: 14, boxShadow: '0 2px 12px #c7d2fe' }}
                />
              </div>
            )}
            <div style={{ fontSize: 17, color: '#334155', whiteSpace: 'pre-line', lineHeight: 1.7 }}>{modalNews?.content}</div>
            <div className="mt-3 text-muted" style={{ fontSize: 15 }}>
              <i className="fas fa-user me-2"></i>{modalNews?.author_name || 'Admin'}
              <span className="mx-2">|</span>
              <i className="far fa-clock me-2"></i>{modalNews && moment(modalNews.created_at).locale('th').format('LLL')}
            </div>
          </Modal.Body>
          <Modal.Footer style={{ background: '#f1f5f9', borderTop: '1.5px solid #c7d2fe' }}>
            <Button variant="secondary" onClick={handleCloseModal} style={{ borderRadius: 8, fontWeight: 500 }}>
              <i className="fas fa-times me-1"></i>ปิด
            </Button>
          </Modal.Footer>
        </Modal>
      <style>{`
        .news-section {
          margin-top: 38px;
          margin-bottom: 18px;
        }
        .news-section-header {
          margin-bottom: 18px;
        }
        .news-section-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: #2563eb;
        }
        /* Latest News Grid */
        .news-latest-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 28px 24px;
        }
        .news-latest-card {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 2px 16px #e0e7ff44;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          min-height: 320px;
        }
        .news-latest-img-wrap {
          width: 100%;
          height: 160px;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .news-latest-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .news-latest-content {
          padding: 18px 18px 16px 18px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .news-latest-title {
          font-size: 1.13rem;
          font-weight: 700;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .news-latest-meta {
          font-size: 0.98rem;
          color: #64748b;
          margin-bottom: 12px;
        }
        .news-latest-btn {
          background: #2563eb;
          color: #fff;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          padding: 6px 18px;
          font-size: 1.01rem;
          align-self: flex-start;
        }
        .news-latest-btn:hover {
          background: #60a5fa;
          color: #fff;
        }
        /* All News List */
        .news-all-list {
          display: flex;
          flex-direction: column;
          gap: 18px 0;
        }
        .news-all-item {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 1px 8px #e0e7ff33;
          display: flex;
          align-items: center;
          padding: 10px 18px;
        }
        .news-all-img-wrap {
          width: 80px;
          height: 80px;
          background: #f1f5f9;
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 18px;
        }
        .news-all-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .news-all-content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .news-all-title {
          font-size: 1.08rem;
          font-weight: 600;
          color: #2563eb;
          margin-bottom: 4px;
        }
        .news-all-meta {
          font-size: 0.97rem;
          color: #64748b;
          margin-bottom: 6px;
        }
        .news-all-btn {
          background: #2563eb;
          color: #fff;
          font-weight: 600;
          border: none;
          border-radius: 7px;
          padding: 4px 14px;
          font-size: 0.98rem;
          align-self: flex-start;
        }
        .news-all-btn:hover {
          background: #60a5fa;
          color: #fff;
        }
        /* Error/Loading */
        .news-error {
          color: #dc2626;
          text-align: center;
          margin: 32px 0;
        }
        .news-loading {
          text-align: center;
          margin: 32px 0;
        }
        /* Banner Slider (reuse styles) */
        .news-slider-fresh-card {
          background: #fff;
          border-radius: 36px;
          box-shadow: 0 8px 36px #e0e7ff, 0 2px 8px #c7d2fe;
          overflow: hidden;
          padding: 0;
          margin: 0 2px;
        }
        .news-slider-fresh-row {
          display: flex;
          flex-direction: row;
          align-items: stretch;
          min-height: 370px;
        }
        .news-slider-fresh-img-col {
          flex: 1.1;
          min-width: 0;
          background: linear-gradient(90deg, #e0e7ff 60%, #fff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .news-slider-fresh-img {
          width: 92%;
          height: 92%;
          object-fit: contain;
          border-radius: 24px;
          background: #fff;
          box-shadow: 0 2px 16px #e0e7ff44;
        }
        .news-slider-fresh-accent {
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 12px;
          background: linear-gradient(180deg, #2563eb 0%, #60a5fa 100%);
          border-top-left-radius: 36px;
          border-bottom-left-radius: 36px;
        }
        .news-slider-fresh-content-col {
          flex: 1.4;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 54px 64px 54px 38px;
          background: linear-gradient(90deg, #fff 60%, #f3f4f6 100%);
        }
        .news-slider-fresh-title {
          font-size: 2.6rem;
          font-weight: 900;
          color: #2563eb;
          margin-bottom: 18px;
          letter-spacing: 0.5px;
          line-height: 1.13;
          text-shadow: 0 2px 12px #e0e7ff66;
        }
        .news-slider-fresh-desc {
          font-size: 1.22rem;
          color: #334155;
          margin-bottom: 22px;
          line-height: 1.7;
          max-width: 98%;
        }
        .news-slider-fresh-meta {
          font-size: 1.08rem;
          color: #60a5fa;
          margin-bottom: 22px;
        }
        .news-slider-fresh-btn {
          background: linear-gradient(90deg, #2563eb 60%, #60a5fa 100%);
          color: #fff;
          font-weight: 700;
          border: none;
          border-radius: 16px;
          padding: 12px 38px;
          font-size: 1.18rem;
          box-shadow: 0 2px 8px #2563eb22;
          transition: background 0.2s, color 0.2s;
        }
        .news-slider-fresh-btn:hover {
          background: linear-gradient(90deg, #60a5fa 60%, #2563eb 100%);
          color: #fff;
        }
        @media (max-width: 900px) {
          .news-slider-fresh-row {
            flex-direction: column;
            min-height: 220px;
          }
          .news-slider-fresh-img-col {
            min-height: 120px;
            max-height: 180px;
          }
          .news-slider-fresh-content-col {
            padding: 18px 12px 18px 18px;
          }
          .news-slider-fresh-title {
            font-size: 1.2rem;
          }
          .news-slider-fresh-desc {
            font-size: 1rem;
            max-width: 100%;
          }
        }
        .news-slider-balance {
          box-shadow: 0 8px 36px #e0e7ff, 0 2px 8px #c7d2fe;
          border-radius: 32px;
          overflow: hidden;
        }
        .news-slider-balance-row {
          display: flex;
          flex-direction: row;
          align-items: stretch;
          min-height: 360px;
        }
        .news-slider-img-balance {
          flex: 1.1;
          min-width: 0;
          background: linear-gradient(90deg, #e0e7ff 60%, #fff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 0 0 24px;
        }
        .news-slider-content-balance {
          flex: 1.3;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 48px 56px 48px 36px;
          background: linear-gradient(90deg, #fff 60%, #f3f4f6 100%);
        }
        .news-slider-title-balance {
          font-size: 2.4rem;
          font-weight: 800;
          color: #2563eb;
          margin-bottom: 22px;
          letter-spacing: 0.5px;
          line-height: 1.18;
        }
        .news-slider-desc-balance {
          font-size: 1.18rem;
          color: #334155;
          margin-bottom: 22px;
          line-height: 1.7;
          max-width: 95%;
        }
        .news-slider-meta-balance {
          font-size: 1.05rem;
          color: #60a5fa;
          margin-bottom: 22px;
        }
        .news-slider-btn-balance {
          background: #2563eb;
          color: #fff;
          font-weight: 600;
          border: none;
          border-radius: 14px;
          padding: 10px 36px;
          font-size: 1.13rem;
          box-shadow: 0 2px 8px #2563eb22;
          transition: background 0.2s, color 0.2s;
        }
        .news-slider-btn-balance:hover {
          background: #60a5fa;
          color: #fff;
        }
        @media (max-width: 900px) {
          .news-slider-balance-row {
            flex-direction: column;
            min-height: 220px;
          }
          .news-slider-img-balance {
            min-height: 140px;
            max-height: 180px;
            padding: 0;
          }
          .news-slider-content-balance {
            padding: 18px 12px 18px 18px;
          }
          .news-slider-title-balance {
            font-size: 1.2rem;
          }
          .news-slider-desc-balance {
            font-size: 1rem;
            max-width: 100%;
          }
        }
        .banner-slider-outer {
          background: transparent;
          padding: 36px 0 36px 0;
          display: flex;
          justify-content: center;
        }
        .news-banner-slider.modern {
          max-width: 1100px;
          margin: 0 auto;
        }
        .news-banner-slider.modern .slick-dots li button:before {
          color: #2563eb;
          font-size: 16px;
        }
        .banner-slider-card-modern {
          background: transparent;
          border-radius: 28px;
          box-shadow: 0 8px 36px #e0e7ff, 0 2px 8px #c7d2fe;
          overflow: hidden;
          padding: 0;
        }
        .banner-slider-row {
          display: flex;
          flex-direction: row;
          align-items: stretch;
          min-height: 340px;
        }
        .banner-slider-img-col {
          flex: 1.1;
          min-width: 0;
          background: linear-gradient(90deg, #e0e7ff 60%, #fff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .banner-slider-img-modern {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 0;
          max-height: 340px;
          background: #fff;
        }
        .banner-slider-content-col {
          flex: 1.3;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 38px 48px 38px 38px;
          background: linear-gradient(90deg, #fff 60%, #f3f4f6 100%);
        }
        .banner-slider-title-modern {
          font-size: 2.1rem;
          font-weight: 700;
          color: #2563eb;
          margin-bottom: 18px;
          letter-spacing: 0.5px;
          line-height: 1.2;
        }
        .banner-slider-desc-modern {
          font-size: 1.18rem;
          color: #334155;
          margin-bottom: 18px;
          line-height: 1.7;
          max-width: 95%;
        }
        .banner-slider-meta-modern {
          font-size: 1rem;
          color: #60a5fa;
          margin-bottom: 18px;
        }
        .banner-slider-btn-modern {
          background: #2563eb;
          color: #fff;
          font-weight: 600;
          border: none;
          border-radius: 12px;
          padding: 8px 28px;
          font-size: 1.08rem;
          box-shadow: 0 2px 8px #2563eb22;
          transition: background 0.2s, color 0.2s;
        }
        .banner-slider-btn-modern:hover {
          background: #60a5fa;
          color: #fff;
        }
        @media (max-width: 900px) {
          .banner-slider-row {
            flex-direction: column;
            min-height: 220px;
          }
          .banner-slider-img-col {
            min-height: 160px;
            max-height: 180px;
          }
          .banner-slider-content-col {
            padding: 18px 12px 18px 18px;
          }
          .banner-slider-title-modern {
            font-size: 1.2rem;
          }
          .banner-slider-desc-modern {
            font-size: 1rem;
            max-width: 100%;
          }
        }
        /* ...existing news-masonry-grid/news-card-modern/news-img styles... */
        .news-masonry-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
          gap: 32px 28px;
          margin-bottom: 32px;
        }
        .news-masonry-item {
          display: flex;
        }
        .news-card-modern {
          border-radius: 20px !important;
          background: linear-gradient(120deg, #fff 80%, #e0e7ff 100%);
          border: 1.5px solid #e3e6ed;
          min-height: 320px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 2px 16px #e0e7ff;
          transition: box-shadow 0.22s, transform 0.22s;
        }
        .news-card-modern:hover {
          box-shadow: 0 10px 36px rgba(37,99,235,0.16), 0 2px 8px rgba(44, 62, 80, 0.10);
          transform: translateY(-6px) scale(1.015);
        }
        .news-img-wrapper {
          width: 100%;
          height: 210px;
          overflow: hidden;
          border-top-left-radius: 20px;
          border-top-right-radius: 20px;
          border-bottom: 1px solid #e3e6ed;
          background: #f8fafc;
        }
        .news-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-top-left-radius: 20px;
          border-top-right-radius: 20px;
          transition: transform 0.25s;
        }
        .news-img:hover {
          transform: scale(1.04);
        }
        .highlight-news-card {
          border: 2.5px solid #2563eb !important;
        }
        .modal-news-detail .modal-content {
          border-radius: 22px;
          box-shadow: 0 6px 36px #e0e7ff;
        }
        @media (max-width: 900px) {
          .news-masonry-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
  </BackgroundLayout>
  );
}

export default News;
