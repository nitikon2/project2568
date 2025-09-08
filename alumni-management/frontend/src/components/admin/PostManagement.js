
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function PostManagement() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/admin/posts/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPosts(res.data);
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                err?.message ||
                'ไม่สามารถโหลดข้อมูลโพสต์ได้'
            );
        } finally {
            setLoading(false);
        }
    };

    // ดึงคอมเมนต์แต่ละโพสต์
    const [commentsMap, setCommentsMap] = useState({});
    useEffect(() => {
        if (posts.length > 0) {
            const token = localStorage.getItem('token');
            Promise.all(posts.map(async post => {
                try {
                    const res = await axios.get(`http://localhost:5000/api/posts/${post.id}/comments`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    return { postId: post.id, comments: res.data };
                } catch {
                    return { postId: post.id, comments: [] };
                }
            })).then(results => {
                const map = {};
                results.forEach(r => { map[r.postId] = r.comments; });
                setCommentsMap(map);
            });
        }
    }, [posts]);


        // ฟังก์ชัน flatten คอมเมนต์ทั้งหมด (root + reply)
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

    return (
        <div style={{ padding: 24 }}>
            <h1>จัดการกระดานสนทนา</h1>
            {loading && <div>กำลังโหลดข้อมูล...</div>}
            {error && <div style={{ color: 'red' }}>{error}</div>}
                    {!loading && !error && (
                        <div>
                            {posts.length === 0 ? (
                                <div>ไม่พบโพสต์</div>
                            ) : (
                                posts.map(post => {
                                    const flatComments = commentsMap[post.id] ? flattenComments(commentsMap[post.id]) : [];
                                    return (
                                        <div key={post.id} style={{ border: '1px solid #ddd', borderRadius: 8, marginBottom: 24, padding: 16 }}>
                                            <div style={{ fontWeight: 'bold', fontSize: 18 }}>{post.title}</div>
                                            <div style={{ marginBottom: 8 }}>{post.content}</div>
                                            <div style={{ color: '#888', fontSize: 13 }}>โดย {post.author_name} | {new Date(post.created_at).toLocaleString('th-TH')}</div>
                                            <div style={{ marginTop: 12 }}>
                                                <strong>คอมเมนต์ทั้งหมด ({flatComments.length})</strong>
                                                <table style={{ width: '100%', marginTop: 8, borderCollapse: 'collapse', background: '#fff' }}>
                                                    <thead>
                                                        <tr style={{ background: '#f7f7f7' }}>
                                                            <th style={{ padding: 8, border: '1px solid #eee' }}>ผู้คอมเมนต์</th>
                                                            <th style={{ padding: 8, border: '1px solid #eee' }}>เนื้อหา</th>
                                                            <th style={{ padding: 8, border: '1px solid #eee' }}>วันที่</th>
                                                            <th style={{ padding: 8, border: '1px solid #eee' }}>ตอบกลับ</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {flatComments.length === 0 ? (
                                                            <tr>
                                                                <td colSpan={4} style={{ textAlign: 'center', color: '#aaa', padding: 16 }}>ยังไม่มีคอมเมนต์</td>
                                                            </tr>
                                                        ) : (
                                                            flatComments.map(comment => (
                                                                <tr key={comment.id}>
                                                                    <td style={{ padding: 8, border: '1px solid #eee' }}>{comment.author_name}</td>
                                                                    <td style={{ padding: 8, border: '1px solid #eee' }}>{comment.content}</td>
                                                                    <td style={{ padding: 8, border: '1px solid #eee' }}>{new Date(comment.created_at).toLocaleString('th-TH')}</td>
                                                                    <td style={{ padding: 8, border: '1px solid #eee' }}>{comment.parentId ? 'ตอบกลับ' : '-'}</td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
        </div>
    );
}

export default PostManagement;