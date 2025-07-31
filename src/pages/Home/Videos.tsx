import React, { useState, useRef, useCallback } from "react";

// Mock data interface for videos
interface VideoData {
  id: number;
  title: string;
  description: string;
  date: string;
  videoId: string; // YouTube video ID
  thumbnail: string;
}

// Mock video data array
const mockVideos: VideoData[] = [
  {
    id: 1,
    title: "Judul Video 1",
    description:
      "Lorem ipsum dolor sit amet, do ut labore et incididunt sit eiusmod tempor magna.Lorem ipsum dolor sit amet, do ut labore et incididunt sit eiusmod tempor magna.",
    date: "22 Juli 2025",
    videoId: "pEbeJRsXvI4", // Example YouTube video ID
    thumbnail: "https://img.youtube.com/vi/pEbeJRsXvI4/maxresdefault.jpg",
  },
  {
    id: 2,
    title: "Judul Video 2",
    description:
      "Lorem ipsum dolor sit amet, do ut labore et incididunt sit eiusmod tempor magna.Lorem ipsum dolor sit amet, do ut labore et incididunt sit eiusmod tempor magna.",
    date: "21 Juli 2025",
    videoId: "w7GA8wxXFQg", // Example YouTube video ID
    thumbnail: "https://img.youtube.com/vi/w7GA8wxXFQg/maxresdefault.jpg",
  },
  {
    id: 3,
    title: "Judul Video 3",
    description:
      "Lorem ipsum dolor sit amet, do ut labore et incididunt sit eiusmod tempor magna.Lorem ipsum dolor sit amet, do ut labore et incididunt sit eiusmod tempor magna.",
    date: "20 Juli 2025",
    videoId: "iuPef0V2Vo", // Example YouTube video ID
    thumbnail: "https://img.youtube.com/vi/iuPef0V2Vo/maxresdefault.jpg",
  },
  {
    id: 4,
    title: "Judul Video 4",
    description:
      "Lorem ipsum dolor sit amet, do ut labore et incididunt sit eiusmod tempor magna.Lorem ipsum dolor sit amet, do ut labore et incididunt sit eiusmod tempor magna.",
    date: "19 Juli 2025",
    videoId: "E2NyhjMbBZQ", // Example YouTube video ID
    thumbnail: "https://img.youtube.com/vi/E2NyhjMbBZQ/maxresdefault.jpg",
  },
  {
    id: 5,
    title: "Judul Video 5",
    description:
      "Lorem ipsum dolor sit amet, do ut labore et incididunt sit eiusmod tempor magna.Lorem ipsum dolor sit amet, do ut labore et incididunt sit eiusmod tempor magna.",
    date: "18 Juli 2025",
    videoId: "9JFDxPc-yyI", // Example YouTube video ID
    thumbnail: "https://img.youtube.com/vi/9JFDxPc-yyI/maxresdefault.jpg",
  },
];

const Videos: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<VideoData>(mockVideos[0]);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleVideoSelect = (video: VideoData) => {
    setSelectedVideo(video);
    setIsVideoPlaying(false);
    setShowOverlay(true);
  };

  // Handle iframe interactions to detect when video starts playing
  const handleIframeClick = useCallback(() => {
    setIsVideoPlaying(true);
    setShowOverlay(false);
  }, []);

  // Handle mouse leave to potentially show overlay again if video is paused
  const handleMouseLeave = useCallback(() => {
    // Small delay to check if video is still playing
    setTimeout(() => {
      if (!isVideoPlaying) {
        setShowOverlay(true);
      }
    }, 100);
  }, [isVideoPlaying]);

  const handleMouseEnter = useCallback(() => {
    if (!isVideoPlaying) {
      setShowOverlay(true);
    }
  }, [isVideoPlaying]);

  return (
    <>
      <style>{`
        /* Animation Keyframes */
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(60px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInRight {
          0% {
            opacity: 0;
            transform: translateX(50px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInLeft {
          0% {
            opacity: 0;
            transform: translateX(-50px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleIn {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0, -10px, 0);
          }
          70% {
            transform: translate3d(0, -5px, 0);
          }
          90% {
            transform: translate3d(0, -2px, 0);
          }
        }

        @keyframes fadeOut {
          0% {
            opacity: 1;
            visibility: visible;
          }
          100% {
            opacity: 0;
            visibility: hidden;
          }
        }

        @keyframes fadeIn {
          0% {
            opacity: 0;
            visibility: hidden;
          }
          100% {
            opacity: 1;
            visibility: visible;
          }
        }

        /* Animation Classes */
        .animate-fadeInUp {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-slideInRight {
          animation: slideInRight 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-scaleIn {
          animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-bounce-slow {
          animation: bounce 2s infinite;
        }

        .animate-fadeOut {
          animation: fadeOut 0.3s ease-out forwards;
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in forwards;
        }

        /* Hover Effects */
        .hover-lift {
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .hover-lift:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .hover-glow {
          transition: all 0.3s ease;
          position: relative;
        }

        .hover-glow::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: inherit;
          padding: 2px;
          background: linear-gradient(45deg, #13A2BA, #FFF11E);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .hover-glow:hover::before {
          opacity: 1;
        }

        .text-shimmer {
          background: linear-gradient(90deg, #FFF11E 0%, #FFD700 50%, #FFF11E 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 2s ease-in-out infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        .stagger-5 { animation-delay: 0.5s; }
        .stagger-6 { animation-delay: 0.6s; }
        .stagger-7 { animation-delay: 0.7s; }

        /* Initial hidden state */
        .animate-fadeInUp,
        .animate-slideInRight,
        .animate-slideInLeft,
        .animate-scaleIn {
          opacity: 0;
        }

        /* Line clamp utilities */
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Video iframe styles */
        .video-container {
          position: relative;
          width: 100%;
          height: 0;
          padding-bottom: 56.25%; /* 16:9 aspect ratio */
        }

        .video-container iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
          border-radius: 8px;
        }

        /* Overlay transition */
        .overlay-transition {
          transition: all 0.3s ease-in-out;
        }
      `}</style>

      <div className="w-full bg-white py-8 min-h-screen">
        {/* Header Section with video.svg background */}
        <div className="flex w-full h-20 mb-8 items-start justify-start">
          <img src="videos.svg" alt="" />
        </div>

        {/* Videos Layout */}
        <div className="px-4">
          <div className="flex gap-6 h-[616px]">
            {/* Left Side - 1 Large Featured Video */}
            <div className="flex-1">
              <div
                className="relative rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group animate-fadeInUp stagger-2 h-full bg-black"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {/* YouTube Video Embed */}
                <div className="video-container h-full">
                  <iframe
                    ref={iframeRef}
                    src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=0&rel=0&modestbranding=1&enablejsapi=1`}
                    title={selectedVideo.title}
                    allowFullScreen
                    className="rounded-lg"
                    onClick={handleIframeClick}
                    onMouseDown={handleIframeClick}
                  />
                </div>

                {/* Video Info Overlay - Now conditionally rendered */}
                <div
                  className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6 z-10 overlay-transition ${
                    showOverlay && !isVideoPlaying
                      ? "animate-fadeIn"
                      : "animate-fadeOut"
                  }`}
                  style={{
                    opacity: showOverlay && !isVideoPlaying ? 1 : 0,
                    visibility:
                      showOverlay && !isVideoPlaying ? "visible" : "hidden",
                  }}
                >
                  <h3 className="text-[#FFF11E] text-[32px] font-bold mb-2 transition-colors duration-300">
                    {selectedVideo.title}
                  </h3>
                  <p className="text-white text-[16px] leading-relaxed mb-2 italic opacity-90 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2">
                    {selectedVideo.description}
                  </p>
                  <p className="text-gray-300 text-[16px] mb-2 font-light transition-colors duration-300">
                    {selectedVideo.date}
                  </p>
                </div>

                {/* Play button overlay for better UX when video is not playing */}
                {!isVideoPlaying && showOverlay && (
                  <div
                    className="absolute inset-0 flex items-center justify-center z-20 cursor-pointer"
                    onClick={handleIframeClick}
                  >
                    <div className="w-20 h-20 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors duration-300 animate-pulse-slow">
                      <div className="w-0 h-0 border-l-[20px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - 5 Video List */}
            <div
              className="w-[30%] rounded-lg shadow-xl overflow-hidden animate-slideInRight stagger-4 h-[616px] flex flex-col"
              style={{
                background: "linear-gradient(to bottom, #15677B, #179FB7)",
              }}
            >
              {mockVideos.map((video, index) => (
                <div
                  key={video.id}
                  onClick={() => handleVideoSelect(video)}
                  className={`flex-1 p-4 ${
                    index < 4 ? "border-b-2 border-white/20" : ""
                  } ${
                    selectedVideo.id === video.id
                      ? "bg-white/20 border-yellow-300/70"
                      : "hover:border-yellow-300/70"
                  } transition-all duration-500 hover:bg-white/10 cursor-pointer group transform hover:scale-[1.02] hover:translate-x-2 animate-slideInRight stagger-${
                    index + 5
                  } relative flex gap-3 min-h-0`}
                >
                  {/* Video Thumbnail */}
                  <div className="flex-shrink-0 w-20 h-14 rounded overflow-hidden bg-gray-800 items-center justify-center">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        // Fallback if thumbnail fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;
                      }}
                    />
                    {/* Play Icon Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* Video Info */}
                  <div className="flex-1 flex flex-col justify-center min-w-0">
                    <h4
                      className={`text-[18px] font-bold mb-1 group-hover:text-yellow-200 transition-all duration-300 transform group-hover:translate-x-2 line-clamp-2 ${
                        selectedVideo.id === video.id
                          ? "text-yellow-300"
                          : "text-[#FFF11E] text-shimmer"
                      }`}
                    >
                      {video.title}
                    </h4>
                    <p className="text-white text-[12px] leading-relaxed italic opacity-90 group-hover:opacity-100 transition-all duration-400 transform group-hover:translate-x-1 delay-100 flex-1 line-clamp-2 ">
                      {video.description}
                    </p>
                    <div className=" opacity-70 group-hover:opacity-100 transition-all duration-300 delay-200">
                      <span className="text-yellow-300 text-xs font-medium">
                        {video.date}
                      </span>
                    </div>
                  </div>

                  {/* Active Indicator */}
                  {selectedVideo.id === video.id && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-yellow-300 rounded-full animate-pulse-slow"></div>
                  )}

                  {/* Decorative element for non-active items */}
                  {selectedVideo.id !== video.id && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-yellow-300 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-300 animate-pulse-slow"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Videos;
