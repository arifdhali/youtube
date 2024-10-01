const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8080;
const videoPath = path.resolve(__dirname, 'video/video.mp4');

app.use(cors({ credentials: true }));

app.get('/', (req, res) => {
    const range = req.headers.range;
    const stat = fs.statSync(videoPath);
    const videoSize = stat.size;
    const CHUNK_SIZE = 5 * 1024 * 1024;

    if (range) {
        const start = Number(range.replace(/\D/g, ''));
        const end = Math.min(start + CHUNK_SIZE - 1, videoSize - 1);
        const contentLength = end - start;

        const headers = {
            'Content-Range': `bytes ${start}-${end}/${videoSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Type': 'video/mp4',
            'Content-Length': contentLength
        };

        res.writeHead(206, headers);
        const videoStream = fs.createReadStream(videoPath, { start, end });

        videoStream.pipe(res);

        videoStream.on('error', (err) => {
            console.error('Stream error:', err);
            res.sendStatus(500);
        });
        
        console.log(`Serving range: ${start}-${end} of ${videoSize}`);
    } else {
        res.status(416).send('Requested Range Not Satisfiable');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Video streaming server running on http://localhost:${port}`);
});
