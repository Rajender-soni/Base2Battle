import { useParams, Link, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Building2, Loader, BookOpen, Filter, TrendingUp, Shuffle, ExternalLink } from "lucide-react";
import Papa from "papaparse";
import { useUser } from "../context/UserContext";
import companiesData from "../data/companiesData";
import leetcodeLogo from "/leetcode.png";

const difficultyColors = {
    EASY: "text-green-400 bg-green-500/10 border-green-500/30",
    MEDIUM: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
    HARD: "text-red-400 bg-red-500/10 border-red-500/30",
};

function CompanySheet() {
    const { company } = useParams();
    const { userData } = useUser();
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [difficultyFilter, setDifficultyFilter] = useState("ALL");
    const [randomProblem, setRandomProblem] = useState(null);

    // Find the company from companiesData to get the exact folder name
    const companyData = companiesData.find(c => 
        c.slug.toLowerCase().replace(/ /g, '-') === company
    );
    const companyName = companyData ? companyData.slug : 
        company.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    useEffect(() => {
        const loadProblems = async () => {
            try {
                setLoading(true);
                
                // Load problems from all CSV files (1-5) to get complete list
                const csvFiles = [
                    '1. Thirty Days.csv',
                    '2. Three Months.csv',
                    '3. Six Months.csv',
                    '4. More Than Six Months.csv',
                    '5. All.csv'
                ];
                
                const allProblems = new Map(); // Use Map to track unique problems by title
                
                for (const csvFile of csvFiles) {
                    try {
                        const csvPath = `/company-sheets/${companyName}/${csvFile}`;
                        const response = await fetch(csvPath);
                        
                        if (!response.ok) continue; // Skip if file doesn't exist
                        
                        const csvText = await response.text();
                        
                        await new Promise((resolve, reject) => {
                            Papa.parse(csvText, {
                                header: true,
                                complete: (results) => {
                                    // Add problems to map (will override duplicates, keeping latest)
                                    results.data.forEach(row => {
                                        if (row.Title && row.Title.trim()) {
                                            allProblems.set(row.Title, row);
                                        }
                                    });
                                    resolve();
                                },
                                error: (err) => {
                                    console.error(`Error parsing ${csvFile}:`, err);
                                    reject(err);
                                }
                            });
                        });
                    } catch (err) {
                        console.warn(`Could not load ${csvFile}:`, err.message);
                    }
                }
                
                // Convert map values to array
                const uniqueProblems = Array.from(allProblems.values());
                
                if (uniqueProblems.length === 0) {
                    throw new Error("No problems found");
                }
                
                setProblems(uniqueProblems);
                setError(null);
                setLoading(false);
            } catch (err) {
                console.error("Error loading problems:", err);
                setError("Company not found or data unavailable");
                setLoading(false);
            }
        };

        loadProblems();
    }, [companyName]);

    const filteredProblems = problems.filter(problem => 
        difficultyFilter === "ALL" || problem.Difficulty === difficultyFilter
    );

    const difficultyCounts = {
        EASY: problems.filter(p => p.Difficulty === "EASY").length,
        MEDIUM: problems.filter(p => p.Difficulty === "MEDIUM").length,
        HARD: problems.filter(p => p.Difficulty === "HARD").length,
    };

    const getRandomProblem = () => {
        if (filteredProblems.length === 0) return;
        const randomIndex = Math.floor(Math.random() * filteredProblems.length);
        const problem = filteredProblems[randomIndex];
        setRandomProblem(problem);
        // Open the problem in a new tab
        if (problem.Link) {
            window.open(problem.Link, '_blank');
        }
    };

    if (!userData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center">
                <div className="text-center max-w-md bg-zinc-800/30 border border-zinc-700 rounded-xl p-8">
                    <Building2 className="mx-auto text-blue-400 mb-4" size={64} />
                    <h2 className="text-2xl font-bold text-white mb-4">Login Required</h2>
                    <p className="text-zinc-400 mb-6">
                        Please login to access company-wise problem sheets
                    </p>
                    <Link
                        to="/login"
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                    >
                        Login Now
                    </Link>
                    <Link
                        to="/sheets"
                        className="block mt-4 text-zinc-400 hover:text-white transition-colors"
                    >
                        ← Back to Companies
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="animate-spin text-blue-500 mx-auto mb-4" size={48} />
                    <p className="text-zinc-400">Loading problems...</p>
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
                            to="/sheets"
                            className="inline-flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={18} />
                            Back to Companies
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        to="/sheets"
                        className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-4"
                    >
                        <ArrowLeft size={18} />
                        <span>Back to All Companies</span>
                    </Link>
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-500/10 p-4 rounded-xl">
                                <Building2 className="text-blue-400" size={40} />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-white mb-2">{companyName}</h1>
                                <p className="text-zinc-400">
                                    {filteredProblems.length} problem{filteredProblems.length !== 1 ? 's' : ''} available
                                </p>
                            </div>
                        </div>
                        
                        {/* Random Problem Button */}
                        <button
                            onClick={getRandomProblem}
                            disabled={filteredProblems.length === 0}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-zinc-700 disabled:to-zinc-700 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            <Shuffle size={20} />
                            <span>Get Random Problem</span>
                        </button>
                    </div>

                    {/* Random Problem Display */}
                    {randomProblem && (
                        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-6 mb-6 animate-fade-in">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Shuffle size={18} className="text-purple-400" />
                                        <h3 className="text-lg font-semibold text-white">Random Problem Selected:</h3>
                                    </div>
                                    <p className="text-2xl font-bold text-white mb-3">{randomProblem.Title}</p>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${difficultyColors[randomProblem.Difficulty] || 'text-zinc-400 bg-zinc-700/30'}`}>
                                            {randomProblem.Difficulty}
                                        </span>
                                        {randomProblem.Frequency && (
                                            <div className="flex items-center gap-1 text-sm text-zinc-300">
                                                <TrendingUp size={14} className="text-blue-400" />
                                                <span>Frequency: {randomProblem.Frequency}</span>
                                            </div>
                                        )}
                                        {randomProblem['Acceptance Rate'] && (
                                            <span className="text-sm text-zinc-300">
                                                Acceptance: {(parseFloat(randomProblem['Acceptance Rate']) * 100).toFixed(1)}%
                                            </span>
                                        )}
                                    </div>
                                    {randomProblem.Topics && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {randomProblem.Topics.split(',').slice(0, 5).map((topic, i) => (
                                                <span 
                                                    key={i}
                                                    className="inline-block px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-medium"
                                                >
                                                    {topic.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <a
                                    href={randomProblem.Link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                                >
                                    <ExternalLink size={18} />
                                    <span>Solve Now</span>
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-4">
                            <div className="text-zinc-500 text-sm mb-1">Total Problems</div>
                            <div className="text-2xl font-bold text-white">{problems.length}</div>
                        </div>
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                            <div className="text-green-400 text-sm mb-1">Easy</div>
                            <div className="text-2xl font-bold text-green-400">{difficultyCounts.EASY}</div>
                        </div>
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                            <div className="text-yellow-400 text-sm mb-1">Medium</div>
                            <div className="text-2xl font-bold text-yellow-400">{difficultyCounts.MEDIUM}</div>
                        </div>
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                            <div className="text-red-400 text-sm mb-1">Hard</div>
                            <div className="text-2xl font-bold text-red-400">{difficultyCounts.HARD}</div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-zinc-800/30 border border-zinc-700 rounded-xl p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
                        <div className="flex-1 max-w-xs">
                            <label className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
                                <Filter size={16} />
                                Filter by Difficulty
                            </label>
                            <select
                                value={difficultyFilter}
                                onChange={(e) => setDifficultyFilter(e.target.value)}
                                className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                            >
                                <option value="ALL">All Difficulties ({problems.length})</option>
                                <option value="EASY">Easy ({difficultyCounts.EASY})</option>
                                <option value="MEDIUM">Medium ({difficultyCounts.MEDIUM})</option>
                                <option value="HARD">Hard ({difficultyCounts.HARD})</option>
                            </select>
                        </div>
                        <div className="text-sm text-zinc-400">
                            Showing <span className="text-white font-semibold">{filteredProblems.length}</span> of <span className="text-white font-semibold">{problems.length}</span> problems
                        </div>
                    </div>
                </div>

                {/* Problems Table */}
                <div className="bg-zinc-800/30 border border-zinc-700 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-zinc-900/50 border-b border-zinc-700">
                                <tr>
                                    <th className="text-left px-6 py-4 text-zinc-400 font-semibold text-sm sticky left-0 bg-zinc-900/50">#</th>
                                    <th className="text-left px-6 py-4 text-zinc-400 font-semibold text-sm min-w-[300px]">Title</th>
                                    <th className="text-left px-6 py-4 text-zinc-400 font-semibold text-sm">Difficulty</th>
                                    <th className="text-left px-6 py-4 text-zinc-400 font-semibold text-sm">Frequency</th>
                                    <th className="text-left px-6 py-4 text-zinc-400 font-semibold text-sm">Acceptance</th>
                                    <th className="text-left px-6 py-4 text-zinc-400 font-semibold text-sm min-w-[200px]">Topics</th>
                                    <th className="text-center px-6 py-4 text-zinc-400 font-semibold text-sm">Link</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProblems.map((problem, index) => (
                                    <tr 
                                        key={index}
                                        className={`border-b border-zinc-700/50 hover:bg-zinc-700/20 transition-colors ${randomProblem && randomProblem.Title === problem.Title ? 'bg-purple-500/10 border-purple-500/30' : ''}`}
                                    >
                                        <td className="px-6 py-4 text-zinc-500 font-medium sticky left-0 bg-zinc-800/30">{index + 1}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-white font-medium hover:text-blue-400 transition-colors">
                                                {problem.Title}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${difficultyColors[problem.Difficulty] || 'text-zinc-400 bg-zinc-700/30'}`}>
                                                {problem.Difficulty}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <TrendingUp size={14} className="text-blue-400" />
                                                <span className="text-zinc-300">{problem.Frequency || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-300">
                                            {problem['Acceptance Rate'] ? 
                                                `${(parseFloat(problem['Acceptance Rate']) * 100).toFixed(1)}%` 
                                                : 'N/A'
                                            }
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1 max-w-xs">
                                                {problem.Topics && problem.Topics.split(',').slice(0, 3).map((topic, i) => (
                                                    <span 
                                                        key={i}
                                                        className="inline-block px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs"
                                                    >
                                                        {topic.trim()}
                                                    </span>
                                                ))}
                                                {problem.Topics && problem.Topics.split(',').length > 3 && (
                                                    <span className="inline-block px-2 py-1 bg-zinc-700/50 text-zinc-400 rounded text-xs">
                                                        +{problem.Topics.split(',').length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <a
                                                href={problem.Link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 hover:opacity-80 transition-opacity"
                                                title="Open in LeetCode"
                                            >
                                                <img 
                                                    src="/leetcode.png" 
                                                    alt="LeetCode" 
                                                    className="w-5 h-5"
                                                />
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {filteredProblems.length === 0 && (
                    <div className="text-center py-16">
                        <BookOpen className="mx-auto text-zinc-700 mb-4" size={64} />
                        <h3 className="text-xl font-bold text-zinc-600 mb-2">No problems found</h3>
                        <p className="text-zinc-500">Try changing the filters</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CompanySheet;
