import { useParams, Link, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Loader, ChevronLeft, ChevronRight, ArrowUp, Home } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const topicsList = [
    { slug: "scaling", title: "Scaling", folder: "01. Scaling" },
    { slug: "back-of-the-envelope-estimation", title: "Back Of the Envelope Estimation", folder: "02. Back Of the Envelope Estimation" },
    { slug: "system-design-framework", title: "System Design Framework", folder: "03. System Design Framework" },
    { slug: "rate-limiter", title: "Rate Limiter", folder: "04. Rate Limiter" },
    { slug: "consistent-hashing", title: "Consistent Hashing", folder: "05. Consistent Hashing" },
    { slug: "key-value-store", title: "Key-Value Store", folder: "06. Key-Value Store" },
    { slug: "unique-id-generator", title: "Unique-Id Generator", folder: "07. Unique-Id Generator" },
    { slug: "url-shortener", title: "URL Shortener", folder: "08. URL Shortener" },
    { slug: "web-crawler", title: "Web Crawler", folder: "09. Web Crawler" },
    { slug: "notification-system", title: "Notification System", folder: "10. Notification System" },
    { slug: "news-feed-system", title: "News Feed System", folder: "11. News Feed System" },
    { slug: "chat-system", title: "Chat System", folder: "12. Chat System" },
    { slug: "search-autocomplete", title: "Search Autocomplete", folder: "13. Search Autocomplete" },
    { slug: "youtube", title: "Youtube", folder: "14. Youtube" },
    { slug: "google-drive", title: "Google Drive", folder: "15. Google Drive" },
    { slug: "proximity-service", title: "Proximity Service", folder: "16. Proximity Service" },
];

const topicMapping = topicsList.reduce((acc, topic) => {
    acc[topic.slug] = topic;
    return acc;
}, {});

function SystemDesignTopic() {
    const { slug } = useParams();
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showScrollTop, setShowScrollTop] = useState(false);

    const topic = topicMapping[slug];
    const currentIndex = topicsList.findIndex(t => t.slug === slug);
    const previousTopic = currentIndex > 0 ? topicsList[currentIndex - 1] : null;
    const nextTopic = currentIndex < topicsList.length - 1 ? topicsList[currentIndex + 1] : null;

    // Scroll to top on topic change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [slug]);

    // Show/hide scroll to top button
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 400);
        };
        
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (!topic) {
            setError("Topic not found");
            setLoading(false);
            return;
        }

        const loadContent = async () => {
            try {
                setLoading(true);
                // Load the markdown file from system-design-notes
                const response = await fetch(`/system-design-notes/${topic.folder}/Readme.md`);
                
                if (!response.ok) {
                    throw new Error("Failed to load content");
                }
                
                let text = await response.text();
                
                // Fix relative image paths to point to public folder
                text = text.replace(
                    /src="\.\/images\//g,
                    `src="/system-design-notes/${topic.folder}/images/`
                );
                
                // Also handle markdown image syntax ![alt](./images/...)
                text = text.replace(
                    /!\[([^\]]*)\]\(\.\/images\//g,
                    `![$1](/system-design-notes/${topic.folder}/images/`
                );
                
                setContent(text);
                setError(null);
            } catch (err) {
                console.error("Error loading markdown:", err);
                setError("Failed to load content. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        loadContent();
    }, [slug, topic]);

    if (!topic) {
        return <Navigate to="/system-design" replace />;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="animate-spin text-blue-500 mx-auto mb-4" size={48} />
                    <p className="text-zinc-400">Loading content...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
                        <p className="text-red-400 mb-4">{error}</p>
                        <Link
                            to="/system-design"
                            className="inline-flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={18} />
                            Back to Topics
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Navigation Header */}
                <div className="mb-8">
                    {/* Navigation Breadcrumbs */}
                    <div className="flex items-center gap-3 mb-6">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
                        >
                            <Home size={18} className="group-hover:scale-110 transition-transform" />
                            <span className="font-medium">Home</span>
                        </Link>
                        <span className="text-zinc-600">/</span>
                        <Link
                            to="/system-design"
                            className="inline-flex items-center gap-2 text-zinc-400 hover:text-blue-400 transition-colors"
                        >
                            <span className="font-medium">System Design</span>
                        </Link>
                        <span className="text-zinc-600">/</span>
                        <span className="text-zinc-500 font-medium">{topic.title}</span>
                    </div>
                    
                    {/* Progress Indicator with improved styling */}
                    <div className="mb-6 bg-zinc-800/30 backdrop-blur-sm border border-zinc-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-zinc-400">
                                Progress: Chapter {currentIndex + 1} of {topicsList.length}
                            </span>
                            <span className="text-sm font-bold text-blue-400">
                                {Math.round(((currentIndex + 1) / topicsList.length) * 100)}%
                            </span>
                        </div>
                        <div className="flex-1 h-3 bg-zinc-900/70 rounded-full overflow-hidden border border-zinc-700">
                            <div 
                                className="bg-red-500 h-full rounded-full transition-all duration-500 ease-in-out"
                                style={{ width: `${((currentIndex + 1) / topicsList.length) * 100}%` }}
                            />
                        </div>
                    </div>
                    
                    {/* Title Section with improved gradient */}
                    <div className="flex items-center gap-4 mb-2">
                        <div>
                            <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
                                Chapter {currentIndex + 1}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-white">
                                {topic.title}
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Content with improved styling */}
                <div className="bg-gradient-to-br from-zinc-800/40 to-zinc-900/40 backdrop-blur-sm border border-zinc-700/80 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="prose prose-invert prose-lg max-w-none p-8
                        prose-headings:text-white 
                        prose-h1:text-4xl prose-h1:font-bold prose-h1:mb-8 prose-h1:pb-6 prose-h1:border-b-2 prose-h1:border-blue-500/30
                        prose-h2:text-3xl prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-3 prose-h2:border-b prose-h2:border-zinc-600
                        prose-h3:text-2xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-4 prose-h3:text-blue-300
                        prose-h4:text-xl prose-h4:font-semibold prose-h4:mt-6 prose-h4:mb-3 prose-h4:text-zinc-200
                        prose-p:text-zinc-300 prose-p:leading-relaxed prose-p:mb-4 prose-p:text-base
                        prose-a:text-blue-400 prose-a:no-underline hover:prose-a:text-blue-300 hover:prose-a:underline
                        prose-strong:text-white prose-strong:font-semibold prose-strong:bg-blue-500/10 prose-strong:px-1 prose-strong:rounded
                        prose-em:text-zinc-300 prose-em:italic
                        prose-code:text-blue-300 prose-code:bg-zinc-900/70 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-[''] prose-code:after:content-['']
                        prose-pre:bg-zinc-900/70 prose-pre:border prose-pre:border-zinc-600 prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto
                        prose-ul:text-zinc-300 prose-ul:my-4 prose-ul:space-y-2
                        prose-ol:text-zinc-300 prose-ol:my-4 prose-ol:space-y-2
                        prose-li:my-2 prose-li:text-base prose-li:leading-relaxed
                        prose-li>prose-p:my-1
                        prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-500/10 prose-blockquote:pl-6 prose-blockquote:py-4 prose-blockquote:my-6 prose-blockquote:text-zinc-300 prose-blockquote:rounded-r-lg
                        prose-hr:border-zinc-700 prose-hr:my-8
                        prose-table:text-zinc-300 prose-table:w-full prose-table:border-collapse prose-table:my-6
                        prose-thead:border-b-2 prose-thead:border-zinc-600
                        prose-th:bg-zinc-700/50 prose-th:text-white prose-th:font-semibold prose-th:p-3 prose-th:text-left
                        prose-td:bg-zinc-800/30 prose-td:p-3 prose-td:border-t prose-td:border-zinc-700
                        prose-tr:border-b prose-tr:border-zinc-700
                        prose-img:rounded-xl prose-img:shadow-2xl prose-img:my-8 prose-img:mx-auto prose-img:border prose-img:border-zinc-600 prose-img:bg-zinc-900/50 prose-img:p-4
                    ">
                        <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={{
                                img: ({ node, alt, src, ...props }) => (
                                    <div className="flex flex-col items-center my-8">
                                        <img 
                                            src={src}
                                            alt={alt || ''}
                                            className="max-w-full h-auto rounded-xl shadow-2xl border border-zinc-600 bg-white/5 p-4"
                                            loading="lazy"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                console.error('Failed to load image:', src);
                                            }}
                                            {...props}
                                        />
                                        {alt && (
                                            <p className="text-sm text-zinc-500 mt-3 italic">
                                                {alt}
                                            </p>
                                        )}
                                    </div>
                                ),
                                // Handle HTML in markdown
                                div: ({ node, children, ...props }) => {
                                    // Check if this div contains an image
                                    const hasImage = node.children?.some(child => 
                                        child.tagName === 'img'
                                    );
                                    
                                    if (hasImage) {
                                        return (
                                            <div className="flex justify-center my-8" {...props}>
                                                {children}
                                            </div>
                                        );
                                    }
                                    return <div {...props}>{children}</div>;
                                },
                                // Better section handling
                                hr: () => (
                                    <div className="relative my-12">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t-2 border-zinc-700"></div>
                                        </div>
                                        <div className="relative flex justify-center">
                                            <div className="bg-zinc-800 px-4">
                                                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                ),
                            }}
                        >
                            {content}
                        </ReactMarkdown>
                    </div>
                </div>

                {/* Navigation Footer with improved styling */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Previous Topic */}
                    <div className="flex justify-start">
                        {previousTopic ? (
                            <Link
                                to={`/system-design/${previousTopic.slug}`}
                                className="group flex items-center gap-3 bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 hover:from-zinc-800 hover:to-zinc-900 border border-zinc-700 hover:border-blue-500/50 text-white px-5 py-4 rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/20"
                            >
                                <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform text-blue-400" />
                                <div className="text-left">
                                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Previous</div>
                                    <div className="text-sm font-semibold">{previousTopic.title}</div>
                                </div>
                            </Link>
                        ) : (
                            <div></div>
                        )}
                    </div>

                    {/* Back to All Topics - Center */}
                    <div className="flex justify-center">
                        <Link
                            to="/system-design"
                            className="inline-flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                           
                            All Topics
                        </Link>
                    </div>

                    {/* Next Topic */}
                    <div className="flex justify-end">
                        {nextTopic ? (
                            <Link
                                to={`/system-design/${nextTopic.slug}`}
                                className="group flex items-center gap-3 bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 hover:from-zinc-800 hover:to-zinc-900 border border-zinc-700 hover:border-blue-500/50 text-white px-5 py-4 rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/20"
                            >
                                <div className="text-right">
                                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Next</div>
                                    <div className="text-sm font-semibold">{nextTopic.title}</div>
                                </div>
                                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform text-blue-400" />
                            </Link>
                        ) : (
                            <div></div>
                        )}
                    </div>
                </div>
            </div>

            {/* Scroll to Top Button */}
            {showScrollTop && (
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-full shadow-xl shadow-blue-500/30 transition-all hover:scale-110 z-50 border border-blue-500/30"
                    aria-label="Scroll to top"
                >
                    <ArrowUp size={24} />
                </button>
            )}
        </div>
    );
}

export default SystemDesignTopic;
