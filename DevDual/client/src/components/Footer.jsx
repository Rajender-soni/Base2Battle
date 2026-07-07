function Footer() {
    return (
        <footer className="bg-zinc-950 border-t border-zinc-800 py-12 px-4 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                <h2 className="text-[8rem] md:text-[12rem] font-black bg-gradient-to-b from-white/5 to-zinc-800/5 bg-clip-text text-white
                opacity-10 select-none whitespace-nowrap">
                    DEV COMPETE
                </h2>
            </div>
            
            <div className="max-w-5xl mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-8 justify-items-center md:justify-items-start">
                    {/* Brand */}
                    <div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-3">
                            Dev Compete
                        </h3>
                        <p className="text-zinc-400 mb-4 max-w-md">
                            The ultimate platform for competitive programming. Challenge yourself, 
                            compete with others, and level up your coding skills.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-zinc-400 hover:text-blue-400 transition-colors">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                </svg>
                            </a>
                            <a href="#" className="text-zinc-400 hover:text-blue-400 transition-colors">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                                </svg>
                            </a>
                            <a href="#" className="text-zinc-400 hover:text-blue-400 transition-colors">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                                    <circle cx="4" cy="4" r="2"/>
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="md:pl-70">
                        <h4 className="text-white font-bold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li><a href="/" className="text-zinc-400 hover:text-white transition-colors">Home</a></li>
                            <li><a href="/battle" className="text-zinc-400 hover:text-white transition-colors">Create Room</a></li>
                            <li><a href="/join-room" className="text-zinc-400 hover:text-white transition-colors">Join Room</a></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-zinc-500 text-sm">
                        © 2025 Dev Dual. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm">
                        <a href="/privacy-policy" className="text-zinc-500 hover:text-white transition-colors">Privacy Policy</a>
                        <a href="/terms-of-service" className="text-zinc-500 hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
