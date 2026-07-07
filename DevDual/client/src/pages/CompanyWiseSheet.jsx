import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Building2, ChevronRight, TrendingUp, ArrowLeft, FileCode } from "lucide-react";
import companiesData from "../data/companiesData";

function CompanyWiseSheet() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFilter, setSelectedFilter] = useState("all");

    // Filter companies based on search query
    const filteredCompanies = useMemo(() => {
        let filtered = companiesData.filter(company =>
            company.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // Sort by problem count
        if (selectedFilter === "most") {
            filtered = [...filtered].sort((a, b) => b.problems - a.problems);
        } else if (selectedFilter === "least") {
            filtered = [...filtered].sort((a, b) => a.problems - b.problems);
        } else if (selectedFilter === "name") {
            filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        }

        return filtered;
    }, [searchQuery, selectedFilter]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Back to Home */}
                <Link 
                    to="/"
                    className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Back to Home</span>
                </Link>

                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <h1 className="text-5xl font-bold text-white">
                            Company-Wise Problem Sheets
                        </h1>
                    </div>
                    <p className="text-xl text-zinc-400 mb-6">
                        Practice problems asked by top tech companies
                    </p>
                    <div className="mt-4 flex justify-center gap-4 text-sm text-zinc-500">
                        <span className="flex items-center gap-1">
                            <TrendingUp size={16} className="text-green-400" />
                            {companiesData.length}+ Companies
                        </span>
                        <span>•</span>
                        <span>
                            {companiesData.reduce((sum, c) => sum + c.problems, 0)}+ Problems
                        </span>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        Want to practice for a specific company?
                    </h2>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-500" size={20} />
                            <input
                                type="text"
                                placeholder="Search company..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <select
                            value={selectedFilter}
                            onChange={(e) => setSelectedFilter(e.target.value)}
                            className="bg-gray-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        >
                            <option value="all">Default Order</option>
                            <option value="most">Most Problems</option>
                            <option value="least">Least Problems</option>
                            <option value="name">Alphabetical</option>
                        </select>
                    </div>
                    {searchQuery && (
                        <p className="mt-4 text-zinc-400 text-sm">
                            Found {filteredCompanies.length} companies matching "{searchQuery}"
                        </p>
                    )}
                </div>

                {/* All Companies Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredCompanies.map((company) => (
                        <Link
                            key={company.slug}
                            to={`/sheet/${company.slug.toLowerCase().replace(/ /g, '-')}`}
                            className="group bg-gradient-to-br from-zinc-800/60 to-zinc-800/40 border border-zinc-700 rounded-xl p-6 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-1"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="bg-blue-500/10 p-3 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                                    <Building2 className="text-blue-400" size={24} />
                                </div>
                                <ChevronRight className="text-zinc-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" size={20} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors line-clamp-1">
                                {company.name}
                            </h3>
                            <div className="flex items-center gap-2">
                                <FileCode size={16} className="text-zinc-500" />
                                <p className="text-zinc-400 text-sm font-semibold">
                                    {company.problems} {company.problems === 1 ? 'Problem' : 'Problems'}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

                {filteredCompanies.length === 0 && (
                    <div className="text-center py-16">
                        <Building2 className="mx-auto text-zinc-700 mb-4" size={64} />
                        <h3 className="text-xl font-bold text-zinc-600 mb-2">No companies found</h3>
                        <p className="text-zinc-500">Try searching with a different keyword</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CompanyWiseSheet;