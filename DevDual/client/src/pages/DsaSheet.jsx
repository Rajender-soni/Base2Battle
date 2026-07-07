import { Link } from "react-router-dom";
import love_babbar from '/love_babbar.png';
import strivera2z from '/striver.png';
import neetcode150 from '/neetcode.png';
import apna_college from '/apnaCollege.png';

function DsaSheets() {

    const sheets = [
        {
            id: 1,
            title: "Striver's SDE Sheet",
            subtitle: "Top Coding Interview Problems",
            image: strivera2z,
            link: "https://takeuforward.org/dsa/strivers-a2z-sheet-learn-dsa-a-to-z"
        },
        {
            id: 2,
            title: "DSA Sheet by Love Babbar",
            subtitle: "450 DSA Questions",
            image: love_babbar,
            link: "https://www.geeksforgeeks.org/dsa-sheet-by-love-babbar/"
        },
        {
            id: 3,
            title: "Apna College DSA Sheet",
            subtitle: "Complete DSA Preparation",
            image: apna_college,
            link: "https://dsa.apnacollege.in/"
        },
        {
            id: 4,
            title: "NeetCode 150",
            subtitle: "Curated Interview Problems",
            image: neetcode150,
            link: "https://neetcode.io/practice/practice/neetcode150"
        }
    ];

    return (
        <div className="relative min-h-screen bg-black text-white py-16 px-6">

            {/* Back Button */}
            <Link
                to="/"
                className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full 
                bg-gray-800 border border-gray-600 
                hover:bg-red-600 hover:border-red-500 transition-all duration-300"
            >
                <span className="text-lg">←</span>
                <span className="font-medium">Back to Home</span>
            </Link>

            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-red-600">
                        DSA Practice Sheets
                    </h1>
                    <p className="text-gray-400 text-lg mt-4">
                        Master Data Structures & Algorithms with curated sheets.
                    </p>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {sheets.map((sheet) => (
                        <a
                            key={sheet.id}
                            href={sheet.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group rounded-2xl overflow-hidden 
                            bg-gray-900 border border-gray-700 
                            hover:border-red-500 hover:shadow-xl hover:shadow-red-500/20
                            transition-all duration-300"
                        >
                            {/* Image */}
                            <div className="h-64 w-full bg-white flex items-center justify-center p-4">
                                <img
                                    src={sheet.image}
                                    alt={sheet.title}
                                    className="max-h-full max-w-full object-contain"
                                />
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <h3 className="text-2xl font-semibold mb-2 group-hover:text-red-400 transition-colors">
                                    {sheet.title}
                                </h3>
                                <p className="text-gray-400 mb-4">
                                    {sheet.subtitle}
                                </p>

                                <span className="text-red-500 font-medium">
                                    Start Practicing →
                                </span>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default DsaSheets;
