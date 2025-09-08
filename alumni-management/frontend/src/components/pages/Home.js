import React, { useEffect, useState } from 'react';
import BackgroundLayout from '../layout/BackgroundLayout';
import 'animate.css';
import { Container, Box, Typography, Grid, Card, CardMedia, CardContent, CardActions, Alert, Button, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [latestNews, setLatestNews] = useState(null);
  const [latestEvent, setLatestEvent] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/news?limit=1')
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) setLatestNews(res.data[0]);
        else if (res.data.news && res.data.news.length > 0) setLatestNews(res.data.news[0]);
      });
    axios.get('http://localhost:5000/api/events?limit=1')
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) setLatestEvent(res.data[0]);
      });
  }, []);

  return (
    <BackgroundLayout>
      {/* Background Shape */}
      <Box sx={{ position: 'absolute', top: -120, right: -120, width: 340, height: 340, background: 'radial-gradient(circle, #2563eb33 0%, #e0e7ff00 80%)', borderRadius: '50%', zIndex: 0 }} />
      <Box sx={{ position: 'absolute', bottom: -80, left: -80, width: 220, height: 220, background: 'radial-gradient(circle, #facc1533 0%, #e0e7ff00 80%)', borderRadius: '50%', zIndex: 0 }} />
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Hero Section */}
        <Box textAlign="center" mb={5} sx={{ pt: 7 }} className="animate__animated animate__fadeInDown">
          <Typography variant="h2" fontWeight={700} sx={{ color: '#2563eb', fontSize: { xs: 32, md: 42 }, letterSpacing: 1.5, textShadow: '0 2px 8px #e0e7ff' }}>
            ยินดีต้อนรับสู่เว็บไซต์ศิษย์เก่า
          </Typography>
          <Typography variant="h5" sx={{ color: '#334155', fontWeight: 600, fontSize: { xs: 20, md: 28 }, mb: 2.5 }}>
            มหาวิทยาลัยราชภัฏมหาสารคาม
          </Typography>
          {user && (
            <Paper elevation={0}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.5, px: 3, py: 2, borderRadius: 3,
                background: '#e0e7ff', color: '#2563eb', boxShadow: '0 2px 12px #c7d2fe',
                maxWidth: 520, margin: '0 auto', justifyContent: 'flex-start', fontSize: 17
              }}
              className="animate__animated animate__fadeIn"
            >
              <Box sx={{ mr: 1, fontSize: 28, color: '#2563eb', display: 'flex', alignItems: 'center' }}>
                <i className="fas fa-user-circle"></i>
              </Box>
              <Box sx={{ textAlign: 'left' }}>
                <span style={{ fontWeight: 500, color: '#2563eb' }}>สวัสดีคุณ </span>
                <span style={{ fontWeight: 600, color: '#2563eb', textDecoration: 'underline', cursor: 'pointer' }}>
                  {user.name}
                </span>
                <span style={{ color: '#64748b', fontWeight: 400, marginLeft: 6 }}>
                  | ศิษย์เก่าคณะ{user.faculty}
                </span>
              </Box>
            </Paper>
          )}
        </Box>

        <Grid container spacing={4} mb={5} justifyContent="center" className="animate__animated animate__fadeInUp">
          <Grid item xs={12} md={4}>
            <Card elevation={4} sx={{ height: '100%', borderRadius: 3, background: 'rgba(255,255,255,0.92)', boxShadow: '0 4px 32px #e0e7ff', transition: 'transform 0.3s', '&:hover': { boxShadow: '0 12px 40px rgba(37,99,235,0.18), 0 2px 8px rgba(44, 62, 80, 0.10)', transform: 'translateY(-8px) scale(1.03) rotate(-1deg)' } }}>
              <CardMedia
                component="img"
                image={latestNews?.image_url ? `http://localhost:5000${latestNews.image_url}` : process.env.PUBLIC_URL + "/images/news.jpg"}
                onError={e => { e.target.onerror = null; e.target.src = process.env.PUBLIC_URL + "/images/news.jpg"; }}
                sx={{ height: 180, objectFit: 'cover', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
                alt="ข่าวสารล่าสุด"
              />
              <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ color: '#2563eb', fontSize: 22, display: 'flex', alignItems: 'center', mb: 1 }}>
                  <i className="far fa-newspaper" style={{ color: '#60a5fa', marginRight: 8 }}></i>ข่าวสารล่าสุด
                </Typography>
                <Typography sx={{ color: '#334155', fontSize: 16 }}>
                  {latestNews
                    ? <>
                        <div style={{ fontWeight: 700 }}>{latestNews.title}</div>
                        <div style={{ color: '#64748b', fontSize: 14 }}>{latestNews.content?.substring(0, 60)}...</div>
                      </>
                    : "ติดตามข่าวสารและประกาศสำคัญสำหรับศิษย์เก่า"}
                </Typography>
              </CardContent>
              <CardActions>
                <Button component={RouterLink} to="/news" variant="contained" fullWidth sx={{ borderRadius: 2, fontWeight: 500 }}>
                  ดูข่าวทั้งหมด
                </Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={4} sx={{ height: '100%', borderRadius: 3, background: 'rgba(255,255,255,0.92)', boxShadow: '0 4px 32px #e0e7ff', transition: 'transform 0.3s', '&:hover': { boxShadow: '0 12px 40px rgba(37,99,235,0.18), 0 2px 8px rgba(44, 62, 80, 0.10)', transform: 'translateY(-8px) scale(1.03) rotate(-1deg)' } }}>
              <CardMedia
                component="img"
                image={latestEvent?.image_url ? `http://localhost:5000${latestEvent.image_url}` : process.env.PUBLIC_URL + "/images/events.jpg"}
                onError={e => { e.target.onerror = null; e.target.src = process.env.PUBLIC_URL + "/images/events.jpg"; }}
                sx={{ height: 180, objectFit: 'cover', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
                alt="กิจกรรมที่กำลังจะมาถึง"
              />
              <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ color: '#2563eb', fontSize: 22, display: 'flex', alignItems: 'center', mb: 1 }}>
                  <i className="fas fa-calendar-alt" style={{ color: '#facc15', marginRight: 8 }}></i>กิจกรรมที่กำลังจะมาถึง
                </Typography>
                <Typography sx={{ color: '#334155', fontSize: 16 }}>
                  {latestEvent
                    ? <>
                        <div style={{ fontWeight: 700 }}>{latestEvent.title}</div>
                        <div style={{ color: '#64748b', fontSize: 14 }}>{latestEvent.description?.substring(0, 60)}...</div>
                      </>
                    : "กิจกรรมและงานสังสรรค์ศิษย์เก่าที่น่าสนใจ"}
                </Typography>
              </CardContent>
              <CardActions>
                <Button component={RouterLink} to="/events" variant="contained" fullWidth sx={{ borderRadius: 2, fontWeight: 500 }}>
                  ดูกิจกรรมทั้งหมด
                </Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={4} sx={{ height: '100%', borderRadius: 3, background: 'rgba(255,255,255,0.92)', boxShadow: '0 4px 32px #e0e7ff', transition: 'transform 0.3s', '&:hover': { boxShadow: '0 12px 40px rgba(37,99,235,0.18), 0 2px 8px rgba(44, 62, 80, 0.10)', transform: 'translateY(-8px) scale(1.03) rotate(-1deg)' } }}>
              <CardMedia
                component="img"
                image={process.env.PUBLIC_URL + "/image-removebg-preview.png"}
                onError={e => { e.target.onerror = null; e.target.src = process.env.PUBLIC_URL + "/images/alumni.jpg"; }}
                sx={{ height: 180, objectFit: 'contain', background: '#fff', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
                alt="ทำเนียบศิษย์เก่า"
              />
              <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ color: '#2563eb', fontSize: 22, display: 'flex', alignItems: 'center', mb: 1 }}>
                  <i className="fas fa-users" style={{ color: '#34d399', marginRight: 8 }}></i>ทำเนียบศิษย์เก่า
                </Typography>
                <Typography sx={{ color: '#334155', fontSize: 16 }}>
                  ค้นหาและติดต่อเพื่อนร่วมรุ่นของคุณ
                </Typography>
              </CardContent>
              <CardActions>
                <Button component={RouterLink} to="/alumni" variant="contained" fullWidth sx={{ borderRadius: 2, fontWeight: 500 }}>
                  ดูทำเนียบศิษย์เก่า
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>

        {/* Section แนะนำระบบ */}
        <Box mt={7} mb={3} textAlign="center" className="animate__animated animate__fadeInUp">
          <Typography variant="h4" fontWeight={700} mb={3} sx={{ color: '#2563eb', fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fas fa-bolt" style={{ color: '#facc15', marginRight: 8 }}></i>ฟีเจอร์เด่นของระบบศิษย์เก่า
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 4, height: '100%', borderRadius: 2.5, background: 'rgba(255,255,255,0.90)', boxShadow: '0 2px 12px #e0e7ff', transition: 'transform 0.3s', '&:hover': { boxShadow: '0 8px 32px #facc15cc', transform: 'scale(1.04) rotate(1deg)' } }} className="animate__animated animate__fadeInLeft">
                <Box mb={2} sx={{ fontSize: 38, color: '#2563eb' }}><i className="fas fa-newspaper"></i></Box>
                <Typography fontWeight={700} mb={1} sx={{ fontSize: 18 }}>ข่าวสารและประกาศ</Typography>
                <Typography color="text.secondary">ติดตามข่าวสาร กิจกรรม และประกาศสำคัญจากมหาวิทยาลัย</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 4, height: '100%', borderRadius: 2.5, background: 'rgba(255,255,255,0.90)', boxShadow: '0 2px 12px #e0e7ff', transition: 'transform 0.3s', '&:hover': { boxShadow: '0 8px 32px #facc15cc', transform: 'scale(1.04) rotate(1deg)' } }} className="animate__animated animate__fadeInUp">
                <Box mb={2} sx={{ fontSize: 38, color: '#facc15' }}><i className="fas fa-calendar-alt"></i></Box>
                <Typography fontWeight={700} mb={1} sx={{ fontSize: 18 }}>กิจกรรมศิษย์เก่า</Typography>
                <Typography color="text.secondary">เข้าร่วมกิจกรรมและงานสังสรรค์กับเพื่อนศิษย์เก่า</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 4, height: '100%', borderRadius: 2.5, background: 'rgba(255,255,255,0.90)', boxShadow: '0 2px 12px #e0e7ff', transition: 'transform 0.3s', '&:hover': { boxShadow: '0 8px 32px #facc15cc', transform: 'scale(1.04) rotate(1deg)' } }} className="animate__animated animate__fadeInRight">
                <Box mb={2} sx={{ fontSize: 38, color: '#34d399' }}><i className="fas fa-users"></i></Box>
                <Typography fontWeight={700} mb={1} sx={{ fontSize: 18 }}>ทำเนียบศิษย์เก่า</Typography>
                <Typography color="text.secondary">ค้นหาและติดต่อเพื่อนร่วมรุ่นได้ง่ายดาย</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </BackgroundLayout>
  );
}

export default Home;
