import { useEffect, useState } from "react";

function PageLoader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setProgress(50), 200);

    const timer2 = setTimeout(() => setProgress(50), 500);
    const timer3 = setTimeout(() => setProgress(100), 700);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-zinc-900 z-[9999] overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-zinc-600 via-white to-zinc-600 transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          boxShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
        }}
      />
    </div>
  );
}

export default PageLoader;
