# Design

## Visual Theme
ระบบบริหารจัดการแบบ Slate-Premium Theme เน้นสีสันที่สุขุม น่าเชื่อถือ และคมชัด (High Contrast) ออกแบบสำหรับระบบภายในและนักพัฒนาฮาร์ดแวร์/ซอฟต์แวร์

## Color Palette
ใช้โทนสี Slate ผสมผสานกับสี Accent ต่าง ๆ เพื่อระบุสถานะและสายงานอย่างลงตัว:
* **Background**: `radial-gradient(circle at top left, #f8fafc 0%, #f1f5f9 100%)` (สีครีม/แซนด์ AI ถูกห้ามเด็ดขาดตามกฎ Impeccable)
* **Ink (Text)**: Primary Slate-900 (`#0f172a`), Secondary Slate-500 (`#64748b`), Muted Slate-400 (`#94a3b8`)
* **Accents / Status**:
  * Web / Film: Blue-600 (`#2563eb`) / Blue-50 (`#eff6ff`)
  * Board / Heng: Amber-500 (`#f59e0b`) / Amber-50 (`#fffbeb`)
  * Document / Ice: Purple-600 (`#9333ea`) / Purple-50 (`#faf5ff`)
  * Success / Bought: Emerald-600 (`#059669`) / Emerald-50 (`#ecfdf5`)
  * Alert / Pending: Rose-600 (`#e11d48`) / Rose-50 (`#fff1f2`)

## Typography
* **Font Family**: `'Prompt', sans-serif`
* **Size Hierarchy**:
  * H1: 1.5rem (24px), bold, letter-spacing: -0.02em
  * H2: 1.25rem (20px), font-semibold
  * H3: 1rem (16px), font-bold
  * Body: 0.875rem (14px) / Line height: 1.5
  * Badge/Label: 0.75rem (12px) / 0.625rem (10px), font-bold

## Components

### Tab Navigation
ปุ่มเปลี่ยนหน้าจอแบบ Pill style อยู่ภายในกล่องพื้นหลัง Slate-100 สลับ Active ด้วยเงาจางและพื้นหลังขาวคมชัด

### Premium Card
การ์ดขอบมน 12px (radius-xl) ที่มีเส้นขอบ Slate-200 จาง ๆ และการเลื่อนลอยเล็กน้อยเมื่อชี้เมาส์ (Hover: -4px translateY, shadow-md) หลีกเลี่ยงเงาหนาคู่กับเส้นขอบหนา

### Badge & Status Switcher
ปุ่มเลือกสถานะแบบ Slider ปรับปรุงการสลับผ่าน Transition ลื่นไหล (cubic-bezier)
