import axios from "axios";
import React, { useEffect, useRef, useState } from 'react';


const VideoPlayer = () => {
    const chunk = 3 * 1024 * 1024;
    const [totalDataSize, setTotalDataSize] = useState(0);
    const videoRef = useRef(null);

    const fetchData = async (start) => {
        const response = await axios.get(`http://localhost:8080`, {
            headers: {
                "Range": `bytes=${start}`
            },
            responseType: "blob"
        })
        let videoURl = URL.createObjectURL(response?.data);
        videoRef.current.src = videoURl
        setTotalDataSize(start + response?.data?.size);
    }
    const requestNewChunk = () => {
        const video = videoRef.current;
        const byteOffset = ((video.currentTime / video.duration) * totalDataSize);
        if (byteOffset > totalDataSize - chunk) {
            console.log('new chunk');
            fetchData(Math.floor(byteOffset));
        }
    }

    useEffect(() => {
        fetchData(0);
    }, [])

    console.log(totalDataSize);
    return (
        <div className="video">

            <video
                controls
                ref={videoRef}
                onTimeUpdate={requestNewChunk}
                onEnded={() => console.log("Video ended")}
            />
        </div>
    );
};

export default VideoPlayer;
