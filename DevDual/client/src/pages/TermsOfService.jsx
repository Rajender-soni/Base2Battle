import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function TermsOfService() {
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
              Terms of Service
            </h1>
            <p className="text-zinc-400 mb-8 text-center">
              Last updated: October 25, 2025
            </p>

            <div className="space-y-8 text-zinc-300">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  1. Acceptance of Terms
                </h2>
                <p className="leading-relaxed">
                  By accessing and using LeetCompete, you accept and agree to be
                  bound by the terms and provision of this agreement. If you do
                  not agree to these Terms of Service, please do not use our
                  platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  2. Use License
                </h2>
                <div className="space-y-3">
                  <p className="leading-relaxed">
                    Permission is granted to use LeetCompete for:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Participating in coding battles and challenges</li>
                    <li>Creating and joining battle rooms</li>
                    <li>Accessing coding problems and solutions</li>
                    <li>Viewing leaderboards and statistics</li>
                  </ul>
                  <p className="leading-relaxed mt-4">
                    This license shall automatically terminate if you violate
                    any of these restrictions.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  3. User Accounts
                </h2>
                <div className="space-y-3">
                  <p className="leading-relaxed">
                    When you create an account with us, you must provide
                    accurate and complete information. You are responsible for:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      Maintaining the security of your account and password
                    </li>
                    <li>All activities that occur under your account</li>
                    <li>Notifying us immediately of any unauthorized use</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  4. Fair Play Policy
                </h2>
                <div className="space-y-3">
                  <p className="leading-relaxed">
                    All users must adhere to fair play principles:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Write your own original code during battles</li>
                    <li>Do not use automated tools or bots</li>
                    <li>Do not share solutions during active battles</li>
                    <li>
                      Do not create multiple accounts to manipulate rankings
                    </li>
                    <li>
                      Respect other users and maintain appropriate conduct
                    </li>
                  </ul>
                  <p className="leading-relaxed mt-4 text-yellow-400">
                    <strong>
                      Violation of fair play policy may result in account
                      suspension or termination.
                    </strong>
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  5. Code Submission
                </h2>
                <p className="leading-relaxed">
                  By submitting code to LeetCompete, you grant us a
                  non-exclusive license to use, modify, and display your code
                  for the purposes of providing the platform services, including
                  evaluation and leaderboard display. Your code remains your
                  intellectual property.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  6. Prohibited Activities
                </h2>
                <div className="space-y-3">
                  <p className="leading-relaxed">You may not:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Attempt to gain unauthorized access to the platform</li>
                    <li>
                      Interfere with or disrupt the platform's functionality
                    </li>
                    <li>Upload malicious code or viruses</li>
                    <li>Scrape or copy problems without permission</li>
                    <li>Use the platform for any illegal purpose</li>
                    <li>Harass, abuse, or harm other users</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  7. Battle Rooms
                </h2>
                <div className="space-y-3">
                  <p className="leading-relaxed">
                    When creating or joining battle rooms:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Respect time limits and competition rules</li>
                    <li>
                      Complete problems independently without external
                      assistance
                    </li>
                    <li>
                      Accept the results as determined by the Judge0 evaluation
                      system
                    </li>
                    <li>Do not abandon battles without valid reason</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  8. Scoring and Rankings
                </h2>
                <p className="leading-relaxed">
                  Points are awarded based on problem difficulty (Easy: 3pts,
                  Medium: 4pts, Hard: 6pts). Rankings are calculated based on
                  total points earned. We reserve the right to adjust scores if
                  cheating or unfair play is detected.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  9. Limitation of Liability
                </h2>
                <p className="leading-relaxed">
                  LeetCompete is provided "as is" without warranties of any
                  kind. We shall not be liable for any damages arising from the
                  use or inability to use the platform, including but not
                  limited to lost data, interruption of service, or errors in
                  code execution.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  10. Service Availability
                </h2>
                <p className="leading-relaxed">
                  We strive to maintain 24/7 availability but do not guarantee
                  uninterrupted service. We may suspend or terminate services
                  for maintenance, updates, or other reasons at our discretion.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  11. Modifications to Terms
                </h2>
                <p className="leading-relaxed">
                  We reserve the right to modify these terms at any time.
                  Changes will be effective immediately upon posting. Your
                  continued use of the platform after changes constitutes
                  acceptance of the modified terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  12. Account Termination
                </h2>
                <p className="leading-relaxed">
                  We reserve the right to terminate or suspend your account
                  immediately, without prior notice, for any violation of these
                  Terms of Service or for any other reason at our sole
                  discretion.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  13. Governing Law
                </h2>
                <p className="leading-relaxed">
                  These terms shall be governed by and construed in accordance
                  with applicable laws, without regard to its conflict of law
                  provisions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  14. Contact Information
                </h2>
                <p className="leading-relaxed">
                  For questions about these Terms of Service, please contact us
                  at{" "}
                  <a
                    href="mailto:legal@devdual.com"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    legal@devdual.com
                  </a>
                </p>
              </section>

              <div className="mt-12 p-6 bg-zinc-900 border border-zinc-800 rounded-lg">
                <p className="text-center text-zinc-400">
                  By using LeetCompete, you acknowledge that you have read,
                  understood, and agree to be bound by these Terms of Service.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}

export default TermsOfService;
