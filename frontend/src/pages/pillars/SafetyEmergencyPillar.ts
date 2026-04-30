import { Component } from '../../components/BaseComponent';

export class SafetyEmergencyPillar extends Component {
    constructor() {
        super();
    }

    render() {
        // SEO Meta Tags
        document.title = 'Safety & Emergency Management | Airport Operations Simulator';
        
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          metaDescription.setAttribute('content', 'Learn airport safety standards and emergency response protocols. Master incident command, threat assessment, airport security, and ICAO standard emergency procedures.');
        }

        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) {
          ogTitle.setAttribute('content', 'Safety & Emergency Management | Airport Operations Simulator');
        }

        const ogDescription = document.querySelector('meta[property="og:description"]');
        if (ogDescription) {
          ogDescription.setAttribute('content', 'Learn airport safety standards and emergency response protocols. Master incident command, threat assessment, airport security, and ICAO standard emergency procedures.');
        }

        const ogUrl = document.querySelector('meta[property="og:url"]');
        if (ogUrl) {
          ogUrl.setAttribute('content', 'https://github.com/PhillipC05/tpt-flight-control/pillars/safety');
        }

        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) {
          canonical.setAttribute('href', 'https://github.com/PhillipC05/tpt-flight-control/pillars/safety');
        }

        return `
        <div class="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/30 to-slate-900" itemscope itemtype="https://schema.org/Course">
          <meta itemprop="educationalLevel" content="Advanced, Professional">
          <meta itemprop="learningResourceType" content="Safety Training, Emergency Simulation">
            <!-- Navigation -->
            <nav class="bg-black/20 backdrop-blur-sm border-b border-white/10">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between items-center h-16">
                        <div class="flex items-center space-x-2">
                            <a href="/" class="flex items-center space-x-2">
                                <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <span class="text-white font-bold text-sm">AOS</span>
                                </div>
                                <span class="text-white font-bold text-xl">Airport Operations Simulator</span>
                            </a>
                        </div>
                        <div class="flex items-center space-x-4">
                            <a href="/" class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Home
                            </a>
                            <button class="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all">
                                Start Demo
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <!-- Hero Section -->
            <section class="relative py-20 px-4 sm:px-6 lg:px-8">
                <div class="max-w-7xl mx-auto">
                    <div class="text-center mb-16">
                        <div class="inline-flex items-center px-4 py-2 bg-red-500/20 rounded-full mb-6">
                            <span class="text-red-400 text-sm font-medium">🛡️ Safety Critical Systems</span>
                        </div>
                        <h1 class="text-5xl md:text-6xl font-bold text-white mb-6">
                            Safety & Emergency Management
                        </h1>
                        <p class="text-xl text-gray-300 max-w-3xl mx-auto">
                            Learn how airports maintain the highest safety standards and respond effectively to emergency situations. Master incident command, threat assessment, and coordinated emergency response protocols.
                        </p>
                    </div>

                    <!-- Quick Stats -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                        <div class="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
                            <div class="text-3xl font-bold text-white mb-2">18</div>
                            <div class="text-gray-400">Emergency Scenarios</div>
                        </div>
                        <div class="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
                            <div class="text-3xl font-bold text-white mb-2">7</div>
                            <div class="text-gray-400">Security Levels</div>
                        </div>
                        <div class="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
                            <div class="text-3xl font-bold text-white mb-2">24/7</div>
                            <div class="text-gray-400">Safety Monitoring</div>
                        </div>
                        <div class="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
                            <div class="text-3xl font-bold text-white mb-2">ICAO</div>
                            <div class="text-gray-400">Standard Compliant</div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Core Areas Section -->
            <section class="py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
                <div class="max-w-7xl mx-auto">
                    <h2 class="text-4xl font-bold text-white mb-12 text-center">Safety & Emergency Capabilities</h2>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div class="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:bg-white/10 transition-all">
                            <div class="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center text-3xl mb-6">
                                🚨
                            </div>
                            <h3 class="text-2xl font-semibold text-white mb-4">Emergency Response</h3>
                            <p class="text-gray-300 mb-6">
                                Full incident management system including alert escalation, emergency coordination, incident command structure, and multi-agency response protocols.
                            </p>
                            <ul class="space-y-2 text-gray-400">
                                <li>✅ Incident detection & verification</li>
                                <li>✅ Alert escalation hierarchies</li>
                                <li>✅ Incident command system</li>
                                <li>✅ Multi-agency coordination</li>
                                <li>✅ Real-time resource tracking</li>
                            </ul>
                        </div>

                        <div class="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:bg-white/10 transition-all">
                            <div class="w-16 h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl flex items-center justify-center text-3xl mb-6">
                                🛡️
                            </div>
                            <h3 class="text-2xl font-semibold text-white mb-4">Airport Security</h3>
                            <p class="text-gray-300 mb-6">
                                Complete security operations including threat assessment, access control, perimeter monitoring, screening operations, and security incident response.
                            </p>
                            <ul class="space-y-2 text-gray-400">
                                <li>✅ Access control management</li>
                                <li>✅ Perimeter intrusion detection</li>
                                <li>✅ CCTV monitoring systems</li>
                                <li>✅ Threat assessment protocols</li>
                                <li>✅ Security level management</li>
                            </ul>
                        </div>

                        <div class="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:bg-white/10 transition-all">
                            <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-3xl mb-6">
                                🚒
                            </div>
                            <h3 class="text-2xl font-semibold text-white mb-4">Aircraft Emergency</h3>
                            <p class="text-gray-300 mb-6">
                                Aircraft incident response including airport emergency plan activation, crash fire rescue operations, mass casualty management, and recovery procedures.
                            </p>
                            <ul class="space-y-2 text-gray-400">
                                <li>✅ Alert phase management</li>
                                <li>✅ Airport emergency plan activation</li>
                                <li>✅ Crash fire rescue operations</li>
                                <li>✅ Mass casualty management</li>
                                <li>✅ Accident site security</li>
                            </ul>
                        </div>

                        <div class="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:bg-white/10 transition-all">
                            <div class="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center text-3xl mb-6">
                                ⚠️
                            </div>
                            <h3 class="text-2xl font-semibold text-white mb-4">Safety Management System</h3>
                            <p class="text-gray-300 mb-6">
                                Proactive safety management including hazard identification, risk assessment, safety reporting, incident investigation, and continuous improvement.
                            </p>
                            <ul class="space-y-2 text-gray-400">
                                <li>✅ Hazard identification systems</li>
                                <li>✅ Risk assessment matrices</li>
                                <li>✅ Mandatory occurrence reporting</li>
                                <li>✅ Incident investigation workflows</li>
                                <li>✅ Safety performance monitoring</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <!-- CTA Section -->
            <section class="py-20 px-4 sm:px-6 lg:px-8">
                <div class="max-w-4xl mx-auto">
                    <div class="bg-gradient-to-r from-red-600 to-amber-600 rounded-2xl p-12 text-center">
                        <h2 class="text-4xl font-bold text-white mb-6">Train for Emergency Situations</h2>
                        <p class="text-xl text-red-100 mb-8">
                            Practice real emergency scenarios in a safe training environment. Build confidence and competence in high-pressure situations.
                        </p>
                        <a href="/#rolesSection" class="inline-block bg-white text-red-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg">
                            🎯 Start Safety Training
                        </a>
                    </div>
                </div>
            </section>

            <!-- Footer -->
            <footer class="bg-black/40 backdrop-blur-sm border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
                <div class="max-w-7xl mx-auto text-center">
                    <p class="text-gray-400 text-sm">
                        © 2025 Airport Operations Simulator | <a href="/" class="text-blue-400 hover:text-blue-300">Return to Home</a>
                    </p>
                </div>
            </footer>
        </div>
        `;
    }

    mount() {
        // Component initialization
    }
}