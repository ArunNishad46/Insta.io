import React, { useRef, useState } from "react";
import { FaPlay } from "react-icons/fa";

export default function InstaVideo({ src }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const handleVideoClick = () => {
    const video = videoRef.current;

    if (!video) return;

    if (!playing) {
      video.muted = false;      
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const handleVideoEnded = () => {
    const video = videoRef.current;
    if (!video) return;

    video.pause();       
    video.currentTime = 0; 
    setPlaying(false);
  };

  return (
    <div>
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center text-white text-3xl z-10 pointer-events-none">
          <FaPlay />
        </div>
      )}
      <video
        ref={videoRef}
        src={src}
        onClick={handleVideoClick}
        onEnded={handleVideoEnded}
        className="w-full max-h-150 object-cover cursor-pointer"
        playsInline
        controls={false}
      />
    </div>
  );
}
