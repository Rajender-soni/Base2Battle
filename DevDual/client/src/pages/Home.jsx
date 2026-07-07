import HeroSection from '../components/home/HeroSection';
import FeaturesSection from '../components/home/FeaturesSection';
import CompanyResourcesSection from '../components/home/CompanyResourcesSection';
import HowItWorksSection from '../components/home/HowItWorksSection';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function HomePage() {
    return (
        <div className="bg-black text-white min-h-screen">
            <Navbar />
            <main>
                <HeroSection />
                <CompanyResourcesSection />
                <FeaturesSection />
                <HowItWorksSection />
            </main>
            <Footer />
        </div>
    );
}

export default HomePage;