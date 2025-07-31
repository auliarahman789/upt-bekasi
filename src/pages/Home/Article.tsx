import React from "react";

// Mock data interface
interface ArticleData {
  id: number;
  title: string;
  description: string;
  date: string;
  readMore: string;
  image: string;
}

// Mock data array
const mockArticles: ArticleData[] = [
  {
    id: 1,
    title: "Judul Artikel 1",
    description:
      "Lorem ipsum dolor sit amet, do ut labore et incididunt sit eiusmod tempor magna.Lorem ipsum dolor sit amet, do ut labore et incididunt sit eiusmod tempor magna.",
    date: "22 Juli 2025",
    readMore: "BACA SELENGKAPNYA",
    image: "article-image.jpg",
  },
  {
    id: 2,
    title: "Judul Artikel 2",
    description:
      "Lorem ipsum dolor sit amet, do ut labore et incididunt sit eiusmod tempor magna.Lorem ipsum dolor sit amet, do ut labore et incididunt sit eiusmod tempor magna.",
    date: "21 Juli 2025",
    readMore: "BACA SELENGKAPNYA",
    image: "article-image.jpg",
  },
  {
    id: 3,
    title: "Judul Artikel 3",
    description:
      "Lorem ipsum dolor sit amet, do ut labore et incididunt sit eiusmod tempor magna.Lorem ipsum dolor sit amet, do ut labore et incididunt sit eiusmod tempor magna.",
    date: "20 Juli 2025",
    readMore: "BACA SELENGKAPNYA",
    image: "article-image.jpg",
  },
  {
    id: 4,
    title: "Judul Artikel 4",
    description:
      "Lorem ipsum dolor sit amet, do ut labore et incididunt sit eiusmod tempor magna.Lorem ipsum dolor sit amet, do ut labore et incididunt sit eiusmod tempor magna.",
    date: "19 Juli 2025",
    readMore: "BACA SELENGKAPNYA",
    image: "article-image.jpg",
  },
  {
    id: 5,
    title: "Judul Artikel 5",
    description:
      "Lorem ipsum dolor sit amet, do ut labore et incididunt sit eiusmod tempor magna.Lorem ipsum dolor sit amet, do ut labore et incididunt sit eiusmod tempor magna.",
    date: "18 Juli 2025",
    readMore: "BACA SELENGKAPNYA",
    image: "article-image.jpg",
  },
];

const Article: React.FC = () => {
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
      `}</style>

      <div className="w-full bg-white py-8 min-h-screen">
        {/* Header Section with article.svg background */}
        <div className="flex w-full h-20 mb-8 items-start justify-start">
          <img src="article.svg" alt="" />
        </div>

        {/* Articles Layout */}
        <div className="px-4">
          <div className="flex gap-6 h-[616px]">
            {/* Left Side - 2 Large Featured Articles */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockArticles.slice(0, 2).map((article, index) => (
                <div
                  key={article.id}
                  className={`relative rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group animate-fadeInUp stagger-${
                    index + 2
                  }`}
                >
                  {/* Background Image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                    style={{
                      backgroundImage: "url('contohGambarArticle.png')",
                      backgroundSize: "cover",
                    }}
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300" />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                    <h3 className="text-[#FFF11E] text-[32px] font-bold mb-2 transition-colors duration-300">
                      {article.title}
                    </h3>
                    <p className="text-white text-[16px] leading-relaxed mb-2 italic opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                      {article.description}
                    </p>
                    <p className="text-gray-300 text[16px] mb-2 font-light transition-colors duration-300">
                      {article.date}
                    </p>
                    <button className="text-[#FFF11E] text-[16px] font-semibold hover:text-yellow-300 transition-colors duration-300">
                      {article.readMore}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Side - 5 Small Article Cards */}
            <div
              className="w-[30%] rounded-lg shadow-xl overflow-hidden animate-slideInRight stagger-4 h-[616px] flex flex-col"
              style={{
                background: "linear-gradient(to bottom, #15677B, #179FB7)",
              }}
            >
              {mockArticles.slice(0, 5).map((article, index) => (
                <div
                  key={article.id}
                  className={`flex-1 p-4 ${
                    index < 4 ? "border-b-2 border-white/20" : ""
                  } hover:border-yellow-300/70 transition-all duration-500 hover:bg-white/10 cursor-pointer group transform hover:scale-[1.02] hover:translate-x-2 animate-slideInRight stagger-${
                    index + 5
                  } relative flex flex-col justify-center min-h-0`}
                >
                  <h4 className="text-[#FFF11E] text-[20px] font-bold mb-2 group-hover:text-yellow-200 transition-all duration-300 transform group-hover:translate-x-2 text-shimmer line-clamp-2">
                    {article.title}
                  </h4>
                  <p className="text-white text-[14px] leading-relaxed italic opacity-90 group-hover:opacity-100 transition-all duration-400 transform group-hover:translate-x-1 delay-100 flex-1 line-clamp-2">
                    {article.description}
                  </p>
                  <div className=" opacity-0 group-hover:opacity-100 transition-all duration-300 delay-200 transform translate-y-2 group-hover:translate-y-0">
                    <span className="text-yellow-300 text-sm font-medium">
                      {article.date}
                    </span>
                  </div>

                  {/* Decorative element */}
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-yellow-300 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-300 animate-pulse-slow"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Article;
