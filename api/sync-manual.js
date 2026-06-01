export default async function handler(req, res) {
    // ตั้ง Cache ไว้ 5 นาที เพื่อไม่ให้ fetch ทุกครั้ง
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

    try {
        const manualUrl = 'https://project-sigma-ivory-21.vercel.app/complete_system_manual_th.html';
        const response = await fetch(manualUrl);

        if (!response.ok) {
            return res.status(502).json({ 
                synced: false, 
                error: `Manual page returned ${response.status}` 
            });
        }

        const html = await response.text();

        // ดึงวันที่อัปเดตล่าสุดจากเนื้อหา HTML
        // รูปแบบ: อัปเดตล่าสุด: 2026-06-01 13:54:00 (+07:00)
        const match = html.match(/อัปเดตล่าสุด:\s*([\d\-]+\s+[\d:]+)\s*\(\+[\d:]+\)/);

        if (match && match[1]) {
            return res.status(200).json({
                synced: true,
                lastUpdated: match[1].trim(),
                fetchedAt: new Date().toISOString()
            });
        } else {
            return res.status(200).json({
                synced: false,
                error: 'ไม่พบข้อมูลวันที่อัปเดตในหน้าคู่มือ'
            });
        }
    } catch (e) {
        return res.status(500).json({
            synced: false,
            error: e.message
        });
    }
}
