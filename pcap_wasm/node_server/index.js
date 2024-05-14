const express = require('express');
const multer = require('multer');
const wasm = require('./pkg/pcap_wasm');

const upload = multer({ storage: multer.memoryStorage() });
const app = express();

app.get('/', (req, res) => {
  res.send(`
  <form action="/upload" method="post" enctype="multipart/form-data">
    <input type="file" name="file">
    <button type="submit">Upload</button>
  </form>`);

});

app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const result = wasm.analyze_pcap_data(req.file.buffer);
    
    let ip_counts = JSON.stringify(Array.from(result.ip_counts.entries()));
    let layer_4_counts = JSON.stringify(Array.from(result.layer_4_counts.entries()));
    let protocol_counts = JSON.stringify(Array.from(result.protocol_counts.entries()));

    res.send(`
    <h1>IP Counts</h1>
    <pre>${ip_counts}</pre>
    <h1>Layer 4 Counts</h1>
    <pre>${layer_4_counts}</pre>
    <h1>Protocol Counts</h1>
    <pre>${protocol_counts}</pre>
    `);
});

app.listen(3000, () => console.log('Server started on http://localhost:3000'));