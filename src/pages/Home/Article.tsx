import axios from "axios";
import React, { useEffect, useState } from "react";

// Updated data interface to match API response
interface ArticleData {
  id: number;
  title: string;
  description: string;
  date: string; // This will be formatted from the API date
  image: string;
  link: string;
  createdAt: string;
  updatedAt: string;
  is_active: boolean;
  readMore: string; // We'll add this as a constant
}

// Updated API response interface
interface ApiResponse {
  status: string;
  message: string;
  data: ArticleData[];
}

const Article: React.FC = () => {
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<ArticleData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Get articles that are not currently featured (for the list)
  const listArticles = articles.filter(
    (article) =>
      !featuredArticles.some((featured) => featured.id === article.id)
  );

  useEffect(() => {
    fetchArticleData();
  }, []);

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Helper function to construct image URL - Updated to match your preferred structure
  const getImageUrl = (imagePath: string): string => {
    // If it's already a full URL, return as is
    if (imagePath.startsWith("http")) {
      return imagePath;
    }
    // Updated to match your preferred image URL structure
    return `${import.meta.env.VITE_API_LINK_BE}/api/images/${imagePath}`;
  };

  const fetchArticleData = async () => {
    setLoading(true);

    const url = `${import.meta.env.VITE_API_LINK_BE}/api/article`;

    try {
      const response = await axios.get<ApiResponse>(url, {
        withCredentials: true,
      });

      console.log("API Response:", response.data);

      // Process the article data
      if (response.data.data && response.data.data.length > 0) {
        const processedArticles = response.data.data
          .filter((article) => article.is_active) // Only show active articles
          .map((article) => ({
            ...article,
            date: formatDate(article.date), // Format the date
            image: getImageUrl(article.image), // Construct full image URL
            readMore: "BACA SELENGKAPNYA", // Add the read more text
          }));

        setArticles(processedArticles);

        // Set the first two articles as featured, or just the first one if only one exists
        const featured = processedArticles.slice(0, 2);
        setFeaturedArticles(featured);
      }
    } catch (error: any) {
      console.error("Error fetching article data:", error);
      // Optionally, you can fallback to mock data or show error message
    } finally {
      setLoading(false);
    }
  };

  // Function to handle clicking on a list item
  const handleArticleClick = (clickedArticle: ArticleData) => {
    // Move the clicked article to the first position and shift the current first to second
    setFeaturedArticles([clickedArticle, featuredArticles[0]]);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="w-full bg-white py-4 sm:py-6 lg:py-8 min-h-screen">
        <div className="flex w-full h-12 sm:h-16 lg:h-20 mb-4 sm:mb-6 lg:mb-8 items-start justify-start">
          <img src="article.svg" alt="" className="h-full object-contain" />
        </div>
        <div className="px-4 flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#13A2BA] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading articles...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show message if no articles available
  if (!articles.length) {
    return (
      <div className="w-full bg-white py-4 sm:py-6 lg:py-8 min-h-screen">
        <div className="flex w-full h-12 sm:h-16 lg:h-20 mb-4 sm:mb-6 lg:mb-8 items-start justify-start">
          <img src="article.svg" alt="" className="h-full object-contain" />
        </div>
        <div className="px-4 flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-600 text-lg">
              No articles available at the moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

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

        @keyframes slideIn {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
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

        .animate-slide-in {
          animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
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

        /* Active state for selected articles */
        .article-active {
          background: rgba(255, 255, 255, 0.15) !important;
          border-color: rgba(255, 241, 30, 0.8) !important;
        }

        .article-active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: #FFF11E;
        }

        /* Image error handling */
        .image-fallback {
          background: linear-gradient(135deg, #f0f0f0, #e0e0e0);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
          font-size: 12px;
        }
      `}</style>

      <div className="w-full bg-white py-4 sm:py-6 lg:py-8 min-h-screen ">
        {/* Header Section with article.svg background */}
        <div className="flex w-full h-12 sm:h-16 lg:h-20 mb-4 sm:mb-6 lg:mb-8 items-start justify-start ">
          <img src="article.svg" alt="" className="h-full object-contain" />
        </div>

        {/* Articles Layout */}
        <div className="px-4 ">
          {/* Mobile Layout - Stack vertically */}
          <div className="block lg:hidden space-y-4">
            {/* Featured Articles for Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 ">
              {featuredArticles.map((article, index) => (
                <div
                  key={`featured-mobile-${article.id}`}
                  className={`relative rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group animate-fadeInUp stagger-${
                    index + 2
                  } h-48 sm:h-56`}
                >
                  {/* Background Image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                    style={{
                      backgroundImage: `url(${article.image})`,
                      backgroundSize: "cover",
                    }}
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300" />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-10">
                    <h3 className="text-[#FFF11E] text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2 transition-colors duration-300 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-white text-xs sm:text-sm leading-relaxed mb-1 sm:mb-2 italic opacity-90 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2">
                      {article.description}
                    </p>
                    <p className="text-gray-300 text-xs sm:text-sm mb-1 sm:mb-2 font-light transition-colors duration-300">
                      {article.date}
                    </p>
                    <a
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#FFF11E] text-xs sm:text-sm font-semibold hover:text-yellow-300 transition-colors duration-300"
                    >
                      {article.readMore}
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Article List for Mobile */}
            <div
              className="rounded-lg shadow-xl overflow-hidden animate-slideInRight stagger-4 "
              style={{
                background: "linear-gradient(to bottom, #15677B, #179FB7)",
              }}
            >
              {listArticles.map((article, index) => (
                <div
                  key={article.id}
                  onClick={() => handleArticleClick(article)}
                  className={`p-3 sm:p-4 ${
                    index < listArticles.length - 1
                      ? "border-b-2 border-white/20"
                      : ""
                  } hover:border-yellow-300/70 transition-all duration-500 hover:bg-white/10 cursor-pointer group transform hover:scale-[1.01] animate-slideInRight stagger-${
                    index + 5
                  } relative`}
                >
                  <h4 className="text-[#FFF11E] text-base sm:text-lg font-bold mb-2 group-hover:text-yellow-200 transition-all duration-300 transform group-hover:translate-x-1 text-shimmer line-clamp-2">
                    {article.title}
                  </h4>
                  <p className="text-white text-sm leading-relaxed italic opacity-90 group-hover:opacity-100 transition-all duration-400 transform group-hover:translate-x-1 delay-100 mb-2 line-clamp-2">
                    {article.description}
                  </p>
                  <div className="opacity-70 group-hover:opacity-100 transition-all duration-300 delay-200">
                    <span className="text-yellow-300 text-sm font-medium">
                      {article.date}
                    </span>
                  </div>

                  {/* Decorative element */}
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-yellow-300 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-300 animate-pulse-slow"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Layout - Original side-by-side */}
        <div className="hidden lg:flex gap-6 min-h-[616px] px-4">
          {/* Left Side - 2 Large Featured Articles */}
          <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-6">
            {featuredArticles.map((article, index) => (
              <div
                key={`featured-desktop-${article.id}`}
                className={`relative rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 group animate-fadeInUp stagger-${
                  index + 2
                } min-h-[280px] animate-slide-in`}
              >
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundImage: `url(${article.image})`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                  }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                  <h3 className="text-[#FFF11E] text-2xl xl:text-[32px] font-bold mb-2 transition-colors duration-300">
                    {article.title}
                  </h3>
                  <p className="text-white text-sm xl:text-[16px] leading-relaxed mb-2 italic opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                    {article.description}
                  </p>
                  <p className="text-gray-300 text-sm xl:text-[16px] mb-2 font-light transition-colors duration-300">
                    {article.date}
                  </p>
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#FFF11E] text-sm xl:text-[16px] font-semibold hover:text-yellow-300 transition-colors duration-300"
                  >
                    {article.readMore}
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Right Side - Article List */}
          <div
            className="w-[30%] rounded-lg shadow-xl animate-slideInRight stagger-4 h-[616px] flex flex-col"
            style={{
              background: "linear-gradient(to bottom, #15677B, #179FB7)",
            }}
          >
            {listArticles.map((article, index) => (
              <div
                key={article.id}
                onClick={() => handleArticleClick(article)}
                className={`flex-1 px-4 ${
                  index < listArticles.length - 1
                    ? "border-b-2 border-white/20"
                    : ""
                } hover:border-yellow-300/70 transition-all duration-500 hover:bg-white/10 cursor-pointer group transform hover:scale-[1.02] hover:translate-x-2 animate-slideInRight stagger-${
                  index + 5
                } relative flex flex-col justify-center min-h-0`}
              >
                <h4 className="text-[#FFF11E] text-xl font-bold mt-4 group-hover:text-yellow-200 transition-all duration-300 transform group-hover:translate-x-2 text-shimmer line-clamp-2">
                  {article.title}
                </h4>
                <p className="text-white text-sm leading-relaxed italic opacity-90 group-hover:opacity-100 transition-all duration-400 transform group-hover:translate-x-1 delay-100 flex-1 line-clamp-2">
                  {article.description}
                </p>
                <div className="opacity-0 group-hover:opacity-100 transition-all mt-2 duration-300 delay-200 transform translate-y-2 group-hover:translate-y-0">
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
    </>
  );
};

export default Article;
