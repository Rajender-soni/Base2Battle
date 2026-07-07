import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black flex flex-col relative">
      {/* Left vertical line */}
      <div className="hidden md:block fixed left-8 lg:left-16 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-zinc-700 to-transparent z-10"></div>

      {/* Right vertical line */}
      <div className="hidden md:block fixed right-8 lg:right-16 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-zinc-700 to-transparent z-10"></div>

      <div className="md:px-12 lg:px-20">
        <Navbar />

        <div className="flex-1 pt-24 pb-12 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-white mb-4 text-center">
              Privacy Policy
            </h1>
            <p className="text-zinc-400 mb-8 text-center">
              Last updated: October 25, 2025
            </p>

            <div className="space-y-8 text-zinc-300">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  1. Introduction
                </h2>
                <p className="leading-relaxed">
                  Welcome to LeetCompete. We respect your privacy and are
                  committed to protecting your personal data. This privacy
                  policy will inform you about how we look after your personal
                  data when you visit our platform and tell you about your
                  privacy rights.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  2. Information We Collect
                </h2>
                <div className="space-y-3">
                  <p className="leading-relaxed">
                    We may collect, use, store and transfer different kinds of
                    personal data about you:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      <strong>Identity Data:</strong> Username, email address
                    </li>
                    <li>
                      <strong>Technical Data:</strong> IP address, browser type,
                      device information
                    </li>
                    <li>
                      <strong>Usage Data:</strong> Problems solved, battle
                      history, performance metrics
                    </li>
                    <li>
                      <strong>Profile Data:</strong> Coding preferences,
                      difficulty levels, topics of interest
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  3. How We Use Your Information
                </h2>
                <div className="space-y-3">
                  <p className="leading-relaxed">
                    We use your personal data for the following purposes:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>To provide and maintain our coding battle platform</li>
                    <li>To manage your account and provide customer support</li>
                    <li>To match you with opponents for coding battles</li>
                    <li>To track your progress and display leaderboards</li>
                    <li>To improve our platform and develop new features</li>
                    <li>To send you important updates and notifications</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  4. Data Security
                </h2>
                <p className="leading-relaxed">
                  We have implemented appropriate security measures to prevent
                  your personal data from being accidentally lost, used, or
                  accessed in an unauthorized way. We use industry-standard
                  encryption and secure protocols to protect your information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  5. Data Retention
                </h2>
                <p className="leading-relaxed">
                  We will only retain your personal data for as long as
                  necessary to fulfill the purposes we collected it for,
                  including for the purposes of satisfying any legal,
                  accounting, or reporting requirements.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  6. Your Legal Rights
                </h2>
                <div className="space-y-3">
                  <p className="leading-relaxed">
                    Under data protection laws, you have rights including:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Request access to your personal data</li>
                    <li>Request correction of your personal data</li>
                    <li>Request erasure of your personal data</li>
                    <li>Object to processing of your personal data</li>
                    <li>
                      Request restriction of processing your personal data
                    </li>
                    <li>Request transfer of your personal data</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  7. Cookies
                </h2>
                <p className="leading-relaxed">
                  We use cookies and similar tracking technologies to track
                  activity on our platform and store certain information. You
                  can instruct your browser to refuse all cookies or to indicate
                  when a cookie is being sent.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  8. Third-Party Services
                </h2>
                <p className="leading-relaxed">
                  We use Judge0 API for code execution. Please review their
                  privacy policy as we are not responsible for the privacy
                  practices of third-party services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  9. Changes to This Policy
                </h2>
                <p className="leading-relaxed">
                  We may update our Privacy Policy from time to time. We will
                  notify you of any changes by posting the new Privacy Policy on
                  this page and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  10. Contact Us
                </h2>
                <p className="leading-relaxed">
                  If you have any questions about this Privacy Policy, please
                  contact us at{" "}
                  <a
                    href="mailto:privacy@devdual.com"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    privacy@devdual.com
                  </a>
                </p>
              </section>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}

export default PrivacyPolicy;
