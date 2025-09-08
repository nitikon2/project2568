# project2568

## Alumni Management System

### ขั้นตอนการติดตั้ง

#### 1. ตั้งค่าฐานข้อมูล
1. เปิด MySQL และสร้างฐานข้อมูลชื่อ `alumni_db`
2. นำเข้าโครงสร้างฐานข้อมูลจากไฟล์ SQL (ถ้ามี)

#### 2. Backend Setup
1. เข้าไปที่โฟลเดอร์ backend:
	```bash
	cd alumni-management/backend
	```
2. ติดตั้ง dependencies:
	```bash
	npm install
	```
3. ตรวจสอบไฟล์ db.js และแก้ไขค่า connection ตามที่ตั้งไว้
4. รัน backend server:
	```bash
	npm run dev
	```

#### 3. Frontend Setup
1. เข้าไปที่โฟลเดอร์ frontend:
	```bash
	cd alumni-management/frontend
	```
2. ติดตั้ง dependencies:
	```bash
	npm install
	```
3. รัน frontend server:
	```bash
	npm start
	```

### การแก้ไขปัญหาเบื้องต้น
1. หากพบ error เกี่ยวกับ dependencies ให้ลบโฟลเดอร์ node_modules และ package-lock.json แล้วรัน `npm install` ใหม่
2. ตรวจสอบว่า MySQL ทำงานอยู่และฐานข้อมูลถูกสร้างแล้ว
3. ตรวจสอบว่าพอร์ต 3000 และ 5000 ไม่ถูกใช้งานโดยโปรแกรมอื่น

### พอร์ตที่ใช้งาน
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
