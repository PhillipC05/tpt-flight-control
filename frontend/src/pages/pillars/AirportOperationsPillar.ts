import { Component } from '../../components/BaseComponent';

export class AirportOperationsPillar extends Component {
    constructor() {
        super();
    }

    render() {
        // SEO Meta Tags
        document.title = 'Airport Operations | Airport Operations Simulator';
        
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          metaDescription.setAttribute('content', 'Master complete airport operations including flight management, passenger services, cargo operations, and infrastructure management. Realistic airport operations training simulator.');
        }

        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) {
          ogTitle.setAttribute('content', 'Airport Operations | Airport Operations Simulator');
        }

        const ogDescription = document.querySelector('meta[property="og:description"]');
        if (ogDescription) {
          ogDescription.setAttribute('content', 'Master complete airport operations including flight management, passenger services, cargo operations, and infrastructure management. Realistic airport operations training simulator.');
        }

        const ogUrl = document.querySelector('meta[property="og:url"]');
        if (ogUrl) {
          ogUrl.setAttribute('content', 'https://github.com/PhillipC05/tpt-flight-control/pillars/operations');
        }

        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) {
          canonical.setAttribute('href', 'https://github.com/PhillipC05/tpt-flight-control/pillars/operations');
        }

        return `
        <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900" itemscope itemtype="https://schema.org/Course">
          <meta itemprop="educationalLevel" content="Intermediate, Advanced">
          <meta itemprop="learningResourceType" content="Simulation, Training">
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
                        <div class="inline-flex items-center px-4 py-2 bg-blue-500/20 rounded-full mb-6">
                            <span class="text-blue-400 text-sm font-medium">✈️ Core Operations</span>
                        </div>
                        <h1 class="text-5xl md:text-6xl font-bold text-white mb-6">
                            Airport Operations
                        </h1>
                        <p class="text-xl text-gray-300 max-w-3xl mx-auto">
                            Master the complete end-to-end operations of a modern international airport. From arrival to departure, learn every system, process, and procedure that keeps thousands of passengers moving safely every day.
                        </p>
                    </div>

                    <!-- Quick Stats -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                        <div class="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
                            <div class="text-3xl font-bold text-white mb-2">12</div>
                            <div class="text-gray-400">Operational Modules</div>
                        </div>
                        <div class="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
                            <div class="text-3xl font-bold text-white mb-2">24/7</div>
                            <div class="text-gray-400">Real-time Simulation</div>
                        </div>
                        <div class="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
                            <div class="text-3xl font-bold text-white mb-2">8</div>
                            <div class="text-gray-400">Specialized Roles</div>
                        </div>
                        <div class="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
                            <div class="text-3xl font-bold text-white mb-2">35+</div>
                            <div class="text-gray-400">Operations Scenarios</div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Core Areas Section -->
            <section class="py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
                <div class="max-w-7xl mx-auto">
                    <h2 class="text-4xl font-bold text-white mb-12 text-center">Core Operational Areas</h2>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div class="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:bg-white/10 transition-all">
                            <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-3xl mb-6">
                                🛫
                            </div>
                            <h3 class="text-2xl font-semibold text-white mb-4">Flight Management</h3>
                            <p class="text-gray-300 mb-6">
                                Complete flight lifecycle management from scheduling to gate allocation, ground handling coordination, departure sequencing, and arrival management.
                            </p>
                            <ul class="space-y-2 text-gray-400">
                                <li>✅ Flight plan processing & validation</li>
                                <li>✅ Real-time gate assignment</li>
                                <li>✅ Ground movement coordination</li>
                                <li>✅ Departure sequencing systems</li>
                                <li>✅ Arrival management protocols</li>
                            </ul>
                        </div>

                        <div class="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:bg-white/10 transition-all">
                            <div class="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center text-3xl mb-6">
                                👥
                            </div>
                            <h3 class="text-2xl font-semibold text-white mb-4">Passenger Services</h3>
                            <p class="text-gray-300 mb-6">
                                End-to-end passenger experience including self-service check-in, baggage handling, security screening, boarding management, and special assistance.
                            </p>
                            <ul class="space-y-2 text-gray-400">
                                <li>✅ Self-service & agent check-in</li>
                                <li>✅ Baggage tracking & tracing</li>
                                <li>✅ Security screening workflows</li>
                                <li>✅ Boarding gate management</li>
                                <li>✅ Special needs assistance</li>
                            </ul>
                        </div>

                        <div class="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:bg-white/10 transition-all">
                            <div class="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-3xl mb-6">
                                📦
                            </div>
                            <h3 class="text-2xl font-semibold text-white mb-4">Cargo Operations</h3>
                            <p class="text-gray-300 mb-6">
                                Freight and cargo handling including warehouse management, customs processing, temperature controlled logistics, and dangerous goods protocols.
                            </p>
                            <ul class="space-y-2 text-gray-400">
                                <li>✅ Cargo acceptance & screening</li>
                                <li>✅ Warehouse management systems</li>
                                <li>✅ Customs & border processing</li>
                                <li>✅ Cold chain management</li>
                                <li>✅ Dangerous goods handling</li>
                            </ul>
                        </div>

                        <div class="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:bg-white/10 transition-all">
                            <div class="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-3xl mb-6">
                                🏗️
                            </div>
                            <h3 class="text-2xl font-semibold text-white mb-4">Infrastructure Management</h3>
                            <p class="text-gray-300 mb-6">
                                Airport facility management including runway operations, taxiway management, terminal facilities, utilities monitoring, and maintenance scheduling.
                            </p>
                            <ul class="space-y-2 text-gray-400">
                                <li>✅ Runway condition monitoring</li>
                                <li>✅ Taxiway routing systems</li>
                                <li>✅ Terminal facility management</li>
                                <li>✅ Utilities & systems monitoring</li>
                                <li>✅ Preventive maintenance</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <!-- CTA Section -->
            <section class="py-20 px-4 sm:px-6 lg:px-8">
                <div class="max-w-4xl mx-auto">
                    <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center">
                        <h2 class="text-4xl font-bold text-white mb-6">Ready to Explore Airport Operations?</h2>
                        <p class="text-xl text-blue-100 mb-8">
                            Jump into the simulator and experience real airport operations first-hand. No prior experience required.
                        </p>
                        <a href="/#rolesSection" class="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg">
                            🎯 Start Operations Training
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