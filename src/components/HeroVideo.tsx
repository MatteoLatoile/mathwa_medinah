"use client";

import { useEffect, useRef } from "react";

export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;

    const startVideo = async () => {
      try {
        await video.play();
      } catch (error) {
        console.error("Impossible de lancer la vidéo :", error);
      }
    };

    startVideo();
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      disablePictureInPicture
      className="absolute inset-0 h-full w-full object-cover"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        zIndex: 0,
      }}
      onLoadedData={(event) => {
        const video = event.currentTarget;

        video.muted = true;
        video.volume = 0;

        video.play().catch(() => {});
      }}
      onCanPlay={(event) => {
        const video = event.currentTarget;

        video.muted = true;

        if (video.paused) {
          video.play().catch(() => {});
        }
      }}
    >
      <source src="/video-hero.mp4" type="video/mp4" />
    </video>
  );
}