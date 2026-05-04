# 🛒 Hardware Checklist Project (รายการสั่งซื้ออุปกรณ์ IoT)

นี่คือโปรเจกต์เว็บแอปพลิเคชันหน้าเดียว (Single Page Application) สำหรับจัดการและติดตามรายการสั่งซื้ออุปกรณ์ฮาร์ดแวร์สำหรับโปรเจกต์ IoT (เช่น Raspberry Pi และ ESP32) 

## ✨ ฟีเจอร์หลัก (Features)

- **แสดงรายการอุปกรณ์:** โชว์รายการสินค้า, ราคา, และลิงก์ไปยังร้านค้า (Shopee, Cytron, AllNewStep ฯลฯ)
- **ดึงรูปภาพอัตโนมัติ (Dynamic Image Fetching):** ใช้ [Microlink API](https://microlink.io/) ในการดึงรูปภาพแบบ Open Graph (`og:image`) จากลิงก์ร้านค้ามาแสดงผลโดยอัตโนมัติ เพื่อแก้ปัญหา CORS
- **ติดตามสถานะการซื้อ (Purchase Tracking):** มีปุ่ม Toggle เปิด/ปิด เพื่อทำเครื่องหมายว่าอุปกรณ์ชิ้นไหนซื้อไปแล้วบ้าง
- **คำนวณงบประมาณ (Budget Calculator):** คำนวณราคารวมทั้งหมด, ยอดที่ซื้อไปแล้ว, และยอดที่ต้องจ่ายเพิ่มแบบ Real-time
- **Responsive Design:** ออกแบบหน้าเว็บให้รองรับการแสดงผลทุกขนาดหน้าจอ (มือถือ, แท็บเล็ต, เดสก์ท็อป) ด้วย Tailwind CSS

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

- **HTML5**
- **JavaScript (Vanilla JS)**
- **Tailwind CSS** (ผ่าน CDN)

## 🚀 วิธีการใช้งาน (How to use)

เนื่องจากเป็นไฟล์ HTML แบบ Static คุณสามารถเปิดใช้งานได้ทันทีโดยไม่ต้องตั้งค่า Server:

1. ดาวน์โหลดไฟล์ `index.html`
2. ดับเบิลคลิกเปิดไฟล์ `index.html` ด้วยเว็บเบราว์เซอร์ใดก็ได้ (เช่น Google Chrome, Firefox, Safari)
3. ใช้งานได้ทันที!

## 📌 หมายเหตุเกี่ยวกับรูปภาพ (Important Note)

- ระบบจะทำการค่อยๆ โหลดรูปภาพจากลิงก์ร้านค้าทีละรายการเพื่อป้องกันการถูก API แบน (Rate Limit)
- หากร้านค้าบางแห่ง (เช่น Shopee ในบางกรณี) บล็อกการดึงข้อมูล ระบบจะแสดงรูปภาพ Placeholder สีเทาขึ้นมาแทนอัตโนมัติ

## 📋 รายการอุปกรณ์ในโปรเจกต์ (Hardware List)

1. Raspberry Pi 4 Model B 4GB Starter Kit
2. ESP32 Development Board
3. Relay Module 1-channel
4. Solenoid Door Lock 12VDC
5. Reed Switch Door Sensor MC-38
6. Active Buzzer 5V
7. LED 5mm
8. ตัวต้านทาน 330 โอห์ม / 10kΩ
9. Push Button กันน้ำ
10. Adapter 12V 2A & Step-Down Module
11. อุปกรณ์เบ็ดเตล็ด (กล่องพลาสติก ABS, สายไฟ Jumper, Perfboard)
