# 🛒 IoT Hardware Checklist & Project Tracker

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Microlink_API-000000?style=for-the-badge&logo=microlink&logoColor=white" alt="Microlink" />
</p>

---

## 📝 เกี่ยวกับโปรเจกต์ (About The Project)

**Web-product-door** เป็นเว็บแอปพลิเคชันสำหรับบริหารจัดการและติดตามความคืบหน้าโครงการระบบประตูอัจฉริยะ (IoT Smart Door) ช่วยอำนวยความสะดวกในการจัดซื้อฮาร์ดแวร์ (เช่น Raspberry Pi, ESP32, Solenoid Lock) ติดตามสถานะการจัดซื้อ คำนวณงบประมาณแบบ Real-time และมอบหมายงานภายในทีมอย่างเป็นระบบด้วยดีไซน์ระดับพรีเมียม

---

## 🎨 การออกแบบ (Design Theme)

โปรเจกต์นี้ใช้ธีม **Slate-Premium Theme** ที่เน้นความเรียบหรู น่าเชื่อถือ คมชัด (High Contrast) และใช้งานง่าย
*   **โทนสีหลัก:** Slate-900 `#0f172a` (ตัวอักษรหลัก) และ Slate-100/200 สำหรับพื้นหลังและขอบพรีเมียมการ์ด
*   **สีสถานะ (Accents):**
    *   🔵 **Web / Film:** Blue-600 (`#2563eb`)
    *   🟡 **Board / Heng:** Amber-500 (`#f59e0b`)
    *   🟣 **Document / Ice:** Purple-600 (`#9333ea`)
    *   🟢 **Success / Bought:** Emerald-600 (`#059669`)
    *   🔴 **Alert / Pending:** Rose-600 (`#e11d48`)

---

## ✨ ฟีเจอร์หลัก (Key Features)

*   📦 **Hardware Checklist:** แสดงรายการอุปกรณ์ IoT พร้อมราคารายการ ลิงก์ร้านค้า และผู้รับผิดชอบอย่างชัดเจน
*   🖼️ **Dynamic Image Fetching:** ดึงรูปภาพสินค้าอัตโนมัติจากลิงก์ร้านค้า (เช่น Shopee, Cytron, AllNewStep) ผ่าน **Microlink API** เพื่อหลีกเลี่ยงปัญหา CORS
*   💰 **Real-time Budget Calculator:** คำนวณงบประมาณทั้งหมด ยอดเงินที่ใช้ไปแล้ว และงบประมาณคงเหลือที่ต้องเตรียมเพิ่มทันทีที่เปลี่ยนสถานะ
*   👥 **Multi-role Permission & Assignment:** จัดแบ่งบทบาทและภารกิจของสมาชิกในทีม (เว็บ, ฮาร์ดแวร์, เอกสาร, ผู้ดูแลระบบ)
*   📱 **Responsive Design:** แสดงผลสมบูรณ์แบบบนหน้าจอทุกขนาด ตั้งแต่มือถือไปจนถึงเดสก์ท็อปขนาดใหญ่

---

## 👥 สมาชิกและบทบาทในทีม (Project Team)

| สมาชิก | บทบาทหน้าที่ | สีประจำสถานะ |
| :--- | :--- | :--- |
| **ฟิล์ม (Film)** | นักพัฒนาระบบเว็บ (Web Developer) | 🔵 Blue (Web) |
| **เฮง (Heng)** | นักพัฒนาบอร์ดฮาร์ดแวร์ (Hardware Developer) | 🟡 Amber (Board) |
| **ไอซ์ (Ice)** | ผู้เขียนรายงานและเอกสาร (Document / Report) | 🟣 Purple (Doc) |
| **คุณภูริพงศ์ (Puripong)** | ผู้ดูแลระบบและงบประมาณกลาง (Admin / Budget) | 🟢 Emerald (Admin) |

---

## 🛠️ อุปกรณ์ฮาร์ดแวร์ในโครงการ (Hardware List)

1.  **Raspberry Pi 4 Model B (4GB Starter Kit)** - บอร์ดประมวลผลหลักสำหรับระบบเซิร์ฟเวอร์ควบคุมประตู
2.  **ESP32 Development Board** - ไมโครคอนโทรลเลอร์รับส่งสัญญาณและควบคุมอุปกรณ์เซนเซอร์
3.  **Relay Module 1-channel** - สวิตช์อิเล็กทรอนิกส์ควบคุมการจ่ายไฟให้กลอนประตู
4.  **Solenoid Door Lock 12VDC** - กลอนประตูแม่เหล็กไฟฟ้าหลัก
5.  **Reed Switch Door Sensor MC-38** - เซนเซอร์แม่เหล็กตรวจจับการเปิด-ปิดประตู
6.  **Active Buzzer 5V** - อุปกรณ์ส่งเสียงเตือนเมื่อเกิดสถานะผิดปกติ
7.  **LED 5mm** - ไฟแสดงสถานะการทำงาน
8.  **ตัวต้านทาน 330 โอห์ม / 10kΩ** - อุปกรณ์จำกัดกระแสในวงจร
9.  **Push Button กันน้ำ** - ปุ่มกดปลดล็อกประตูจากด้านใน
10. **Adapter 12V 2A & Step-Down Module** - แหล่งจ่ายไฟระบบและวงจรแปลงแรงดัน
11. **อุปกรณ์เบ็ดเตล็ด** - กล่องพลาสติก ABS, สายไฟ Jumper, แผ่น Perfboard

---

## 🚀 การติดตั้งและเริ่มใช้งาน (Getting Started)

### วิธีการเปิดใช้งานอย่างรวดเร็ว (Quick Start)
เนื่องจากตัวหน้าเว็บถูกออกแบบมาให้รันผ่าน Static HTML คุณสามารถดาวน์โหลดโปรเจกต์และเปิดใช้งานได้ทันที:
1.  ดาวน์โหลดหรือ Clone โปรเจกต์นี้
2.  เปิดไฟล์ `index.html` บนเว็บเบราว์เซอร์ใดก็ได้

### สำหรับการพัฒนาต่อ (Development Mode)
หากต้องการรันด้วยเครื่องมือพัฒนาอย่าง **Vite**:

1.  ติดตั้ง Dependencies ทั้งหมด:
    ```bash
    npm install
    ```

2.  เริ่มรันเซิร์ฟเวอร์สำหรับพัฒนา (Development Server):
    ```bash
    npm run dev
    ```

3.  เปิดบราว์เซอร์ไปที่ลิงก์ที่แสดงใน Terminal (เช่น `http://localhost:5173`)

---

## 📌 หมายเหตุเพิ่มเติม (Technical Notes)
*   **Image Optimization:** ระบบจะค่อยๆ ทำการดึงภาพทีละรายการ (Queue Processing) เพื่อป้องกันการโดน Rate Limit จากทาง API
*   **Fallback Mechanism:** หากร้านค้ามีระบบความปลอดภัยป้องกันการดึงรูปภาพ ระบบจะทำการเปลี่ยนไปแสดงภาพสัญลักษณ์/Placeholder คุณภาพสูงโดยอัตโนมัติ เพื่อให้หน้าเว็บยังสวยงามอยู่เสมอ
