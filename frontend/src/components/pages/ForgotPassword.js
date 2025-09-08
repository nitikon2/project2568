import React, { useState } from 'react';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMessage('');
    // Call backend API to send OTP
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep(2);
        setMessage('OTP ถูกส่งไปที่อีเมลของคุณแล้ว');
      } else {
        setMessage(data.message || 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      setMessage('เกิดข้อผิดพลาด');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setMessage('');
    // Call backend API to verify OTP and reset password
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('เปลี่ยนรหัสผ่านสำเร็จ');
        setStep(3);
      } else {
        setMessage(data.message || 'OTP ไม่ถูกต้อง');
      }
    } catch (err) {
      setMessage('เกิดข้อผิดพลาด');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
      <h2>ลืมรหัสผ่าน</h2>
      {message && <div style={{ color: step === 3 ? 'green' : 'red', marginBottom: 12 }}>{message}</div>}
      {step === 1 && (
        <form onSubmit={handleSendOtp}>
          <label>อีเมล</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', marginBottom: 12 }} />
          <button type="submit" style={{ width: '100%' }}>ขอรหัสยืนยัน</button>
        </form>
      )}
      {step === 2 && (
        <form onSubmit={handleVerifyOtp}>
          <label>รหัส OTP ที่ได้รับทางอีเมล</label>
          <input type="text" value={otp} onChange={e => setOtp(e.target.value)} required style={{ width: '100%', marginBottom: 12 }} />
          <label>รหัสผ่านใหม่</label>
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required style={{ width: '100%', marginBottom: 12 }} />
          <button type="submit" style={{ width: '100%' }}>ยืนยันและเปลี่ยนรหัสผ่าน</button>
        </form>
      )}
      {step === 3 && (
        <div>คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้แล้ว</div>
      )}
    </div>
  );
};

export default ForgotPassword;
