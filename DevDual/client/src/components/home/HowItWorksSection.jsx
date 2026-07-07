import { FaUserPlus, FaKeyboard, FaTrophy } from 'react-icons/fa';

function HowItWorksSection() {
    const steps = [
        {
            icon: FaUserPlus,
            title: "Create or Join a Room",
            description: "Start a new battle room and invite your friends, or join an existing room using a code.",
            color: "text-blue-400"
        },
        {
            icon: FaKeyboard,
            title: "Solve the Challenge",
            description: "Once the battle starts, race against the clock (and your opponent) to solve the given DSA problems.",
            color: "text-orange-400"
        },
        {
            icon: FaTrophy,
            title: "Claim Your Victory",
            description: "The first developer to pass all test cases wins. Earn points, climb the leaderboard, and gain bragging rights.",
            color: "text-green-400"
        }
    ];

    return (
        <section className="bg-black py-20 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-5xl font-bold text-white mb-4">
                        How It Works
                    </h2>
                    <p className="text-zinc-400 text-xl max-w-2xl mx-auto">
                        Start your first battle in just 3 simple steps.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
                    {/* Horizontal connecting line with arrows for desktop */}
                    <svg className="hidden md:block absolute top-12 left-1/4 right-1/4 w-1/2 h-8" style={{ left: '25%', right: '25%' }} preserveAspectRatio="none" viewBox="0 0 100 30">
                        {/* Main line */}
                        <line x1="0" y1="15" x2="100" y2="15" stroke="#71717a" strokeWidth="1.5" />
                        {/* Left arrow -> */}
                        <polygon points="15,15 12,13 14,15 12,17" fill="#71717a" />
                        <line x1="15" y1="15" x2="20" y2="15" stroke="#71717a" strokeWidth="1.5" />
                        {/* Right arrow -> */}
                        <polygon points="85,15 88,13 86,15 88,17" fill="#71717a" />
                        <line x1="80" y1="15" x2="85" y2="15" stroke="#71717a" strokeWidth="1.5" />
                    </svg>

                    {steps.map((step, index) => {
                        const IconComponent = step.icon;
                        return (
                            <div key={index} className="relative flex flex-col items-center text-center p-6">

                                <div className={`relative z-10 w-24 h-24 flex items-center justify-center rounded-full bg-zinc-800 border-4 border-zinc-700 mb-6 ${step.color}`}>
                                    <IconComponent className="w-10 h-10" />
                                    <span className="absolute -top-3 -left-3 w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg">
                                        {index + 1}
                                    </span>
                                </div>
                                <h3 className="text-white font-bold text-2xl mb-3">
                                    {step.title}
                                </h3>
                                <p className="text-zinc-400 leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default HowItWorksSection;