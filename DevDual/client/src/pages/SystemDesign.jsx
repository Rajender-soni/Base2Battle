import { Link } from "react-router-dom";
import { BookOpen, Lock, Home, ArrowLeft } from "lucide-react";
import { useUser } from "../context/UserContext";

const systemDesignTopics = [
    { id: 1, name: "Scaling", slug: "scaling", description: "Scale from Zero to Millions of Users" },
    { id: 2, name: "Back Of the Envelope Estimation", slug: "back-of-the-envelope-estimation", description: "Quick capacity and performance calculations" },
    { id: 3, name: "System Design Framework", slug: "system-design-framework", description: "Structured approach to system design interviews" },
    { id: 4, name: "Rate Limiter", slug: "rate-limiter", description: "Design a rate limiting system" },
    { id: 5, name: "Consistent Hashing", slug: "consistent-hashing", description: "Distributed data partitioning strategy" },
    { id: 6, name: "Key-Value Store", slug: "key-value-store", description: "Design a distributed key-value storage system" },
    { id: 7, name: "Unique-Id Generator", slug: "unique-id-generator", description: "Generate unique identifiers in distributed systems" },
    { id: 8, name: "URL Shortener", slug: "url-shortener", description: "Design a URL shortening service like bit.ly" },
    { id: 9, name: "Web Crawler", slug: "web-crawler", description: "Design a web crawler system" },
    { id: 10, name: "Notification System", slug: "notification-system", description: "Design a scalable notification system" },
    { id: 11, name: "News Feed System", slug: "news-feed-system", description: "Design a news feed like Facebook or Twitter" },
    { id: 12, name: "Chat System", slug: "chat-system", description: "Design a chat application" },
    { id: 13, name: "Search Autocomplete", slug: "search-autocomplete", description: "Design an autocomplete system" },
    { id: 14, name: "Youtube", slug: "youtube", description: "Design a video streaming platform" },
    { id: 15, name: "Google Drive", slug: "google-drive", description: "Design a cloud file storage system" },
    { id: 16, name: "Proximity Service", slug: "proximity-service", description: "Design a location-based service" },
];

function SystemDesignPage() {
    const { userData } = useUser();

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Back to Home Button */}
                <div className="mb-6">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Back to Home</span>
                    </Link>
                </div>
                
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-white">
                        System Design Fundamentals
                    </h1>
                    <p className="text-xl text-zinc-400 mb-2">
                        Master the art of designing scalable systems
                    </p>
                    <p className="text-sm text-zinc-500 mb-6">
                        {systemDesignTopics.length} comprehensive topics to ace your system design interviews
                    </p>
                    {!userData && (
                        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-2 text-amber-400">
                            <Lock size={18} />
                            <span>Login to access detailed study materials</span>
                        </div>
                    )}
                </div>

                {/* Topics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {systemDesignTopics.map((topic) => (
                        <Link
                            key={topic.id}
                            to={`/system-design/${topic.slug}`}
                            className="group relative bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300  overflow-hidden"
                        >
                            <div className="relative z-10">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    
                                    <div>
                                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                            Chapter {topic.id}
                                        </span>
                                    </div>
                                </div>
                                {!userData && (
                                    <div className="bg-amber-500/10 p-2 rounded-lg">
                                        <Lock className="text-amber-500" size={16} />
                                    </div>
                                )}
                            </div>
                            
                            <h3 className="text-xl font-bold text-white mb-3 transition-colors leading-tight">
                                {topic.name}
                            </h3>
                            
                            <p className="text-zinc-400 text-sm line-clamp-2 mb-4">
                                {topic.description}
                            </p>
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center text-red-400 text-sm font-medium">
                                    <span className="group-hover:translate-x-1 transition-transform">
                                        Start Learning →
                                    </span>
                                </div>
                                <div className="text-xs text-zinc-600 group-hover:text-zinc-500 transition-colors">
                                    {Math.floor(Math.random() * 15 + 10)} min read
                                </div>
                            </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Footer Info with improved styling */}
                
            </div>
        </div>
    );
}

export default SystemDesignPage;