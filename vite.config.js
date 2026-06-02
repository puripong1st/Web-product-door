import { defineConfig } from 'vite'

// Dev plugin: จำลอง Vercel API route /api/sync-manual ใน Vite dev server
function apiProxyPlugin() {
  return {
    name: 'api-sync-manual',
    configureServer(server) {
      server.middlewares.use('/api/sync-manual', async (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        try {
          const manualUrl = 'https://smartaccess-project.vercel.app/complete_system_manual_th.html';
          const response = await fetch(manualUrl);
          if (!response.ok) {
            res.statusCode = 502;
            res.end(JSON.stringify({ synced: false, error: `Manual page returned ${response.status}` }));
            return;
          }
          const html = await response.text();
          const match = html.match(/อัปเดตล่าสุด:\s*([\d\-]+\s+[\d:]+)\s*\(\+[\d:]+\)/);
          if (match && match[1]) {
            res.end(JSON.stringify({ synced: true, lastUpdated: match[1].trim(), fetchedAt: new Date().toISOString() }));
          } else {
            res.end(JSON.stringify({ synced: false, error: 'ไม่พบข้อมูลวันที่อัปเดตในหน้าคู่มือ' }));
          }
        } catch (e) {
          res.statusCode = 500;
          res.end(JSON.stringify({ synced: false, error: e.message }));
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [apiProxyPlugin()],
  server: {
    port: 3000
  }
})
