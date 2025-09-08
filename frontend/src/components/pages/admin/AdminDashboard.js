import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalNews: 0,
        totalEvents: 0,
        totalAlumni: 0
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/admin/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const cards = [
        {
            title: 'จัดการสมาชิก',
            count: stats.totalUsers,
            link: '/admin/users',
            icon: '👥',
            description: 'จัดการข้อมูลสมาชิกทั้งหมด'
        },
        {
            title: 'จัดการข่าวสาร',
            count: stats.totalNews,
            link: '/admin/news',
            icon: '📰',
            description: 'จัดการข่าวสารและประกาศ'
        },
        {
            title: 'จัดการกิจกรรม',
            count: stats.totalEvents,
            link: '/admin/events',
            icon: '📅',
            description: 'จัดการกิจกรรมต่างๆ'
        },
        {
            title: 'จัดการศิษย์เก่า',
            count: stats.totalAlumni,
            link: '/admin/alumni',
            icon: '🎓',
            description: 'จัดการข้อมูลศิษย์เก่า'
        }
    ];

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>แผงควบคุมผู้ดูแลระบบ</h2>
            </div>

            <Row>
                {cards.map((card, index) => (
                    <Col md={3} key={index} className="mb-4">
                        <Card className="h-100 dashboard-card">
                            <Card.Body className="text-center">
                                <div className="display-4 mb-2">{card.icon}</div>
                                <Card.Title>{card.title}</Card.Title>
                                <h3 className="text-primary mb-3">{card.count}</h3>
                                <Card.Text className="text-muted mb-3">
                                    {card.description}
                                </Card.Text>
                                <Button
                                    as={Link}
                                    to={card.link}
                                    variant="outline-primary"
                                    className="w-100"
                                >
                                    จัดการ
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
}

export default AdminDashboard;
