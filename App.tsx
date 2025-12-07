// Import React and hooks for state and side effects
import React, { useState, useEffect } from "react";
// Import ViewMode enum from types definitions
import { ViewMode } from "./types";
// Import all sub-components for the main views
import Analyzer from "./components/Analyzer";
import Comparator from "./components/Comparator";
import TopicSorter from "./components/TopicSorter";
import Batcher from "./components/Batcher";
// Import UI icons from Lucide React
import {
  LayoutGrid,
  Split,
  BrainCircuit,
  Menu,
  Layers,
  Terminal,
  Key,
  X,
  Check,
  Eye,
  EyeOff,
  Settings,
  Lock,
  ShieldCheck,
  AlertCircle,
  Globe,
  User,
} from "lucide-react";

// Define the Admin Password constant
// In a real production app, this should be handled via backend auth, but for client-side demo:
const ADMIN_PASSWORD = "hc1";

// Define the main App component
const App: React.FC = () => {
  // State for tracking the currently active view/tool (default to Analyzer)
  const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.ANALYZER);
  // State for toggling the mobile sidebar menu visibility
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // -- API Key Management State --
  // State to store the actual active API key
  const [apiKey, setApiKey] = useState<string>("");
  // State to control visibility of the API Key Modal
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  // State for the temporary key input value inside the modal
  const [tempKey, setTempKey] = useState("");
  // State to toggle password visibility (show/hide) for the key input
  const [showKey, setShowKey] = useState(false);

  // -- Admin Security State --
  // State to track if the AI module has been unlocked in this session
  const [isAIUnlocked, setIsAIUnlocked] = useState(false);
  // State to control visibility of the Password Modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  // State for password input
  const [passwordInput, setPasswordInput] = useState("");
  // State for password error feedback
  const [passwordError, setPasswordError] = useState(false);

  // useEffect hook to load the API key from Local Storage on initial app load
  useEffect(() => {
    // Retrieve key from storage - Updated key for Horizon Sort
    const storedKey = localStorage.getItem("horizon_gemini_key");
    // If key exists, update state
    if (storedKey) setApiKey(storedKey);
  }, []); // Empty dependency array means this runs once on mount

  // Handler to save the API key to Local Storage
  const handleSaveKey = () => {
    // Check if input is not empty
    if (tempKey.trim()) {
      // Save trimmed key to storage - Updated key for Horizon Sort
      localStorage.setItem("horizon_gemini_key", tempKey.trim());
      // Update active key state
      setApiKey(tempKey.trim());
      // Close the modal
      setIsKeyModalOpen(false);
      // Clear temp input
      setTempKey("");
    }
  };

  // Handler to remove the API key
  const handleClearKey = () => {
    // Remove item from Local Storage - Updated key for Horizon Sort
    localStorage.removeItem("horizon_gemini_key");
    // Clear active key state
    setApiKey("");
    // Close the modal
    setIsKeyModalOpen(false);
  };

  // Helper function to open the settings modal
  const openSettings = () => {
    // Pre-fill input with current key if it exists
    setTempKey(apiKey);
    // Open modal
    setIsKeyModalOpen(true);
    // Close mobile menu if open
    setMobileMenuOpen(false);
  };

  // Handler for navigation clicks with Security Check
  const handleNavClick = (mode: ViewMode) => {
    // If user tries to access AI Topics but hasn't unlocked it yet
    if (mode === ViewMode.TOPICS && !isAIUnlocked) {
      // Open the security modal instead of changing view
      setIsPasswordModalOpen(true);
      // Close mobile menu if open
      setMobileMenuOpen(false);
      return;
    }
    // Otherwise, navigate normally
    setCurrentView(mode);
    setMobileMenuOpen(false);
  };

  // Handler for Password Submission
  const handlePasswordSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (passwordInput === ADMIN_PASSWORD) {
      // Password correct: Unlock and navigate
      setIsAIUnlocked(true);
      setIsPasswordModalOpen(false);
      setCurrentView(ViewMode.TOPICS);
      setPasswordInput("");
      setPasswordError(false);
    } else {
      // Password incorrect: Show error
      setPasswordError(true);
    }
  };

  // Function to determine which component to render based on currentView state
  const renderView = () => {
    switch (currentView) {
      case ViewMode.ANALYZER:
        return <Analyzer />;
      case ViewMode.COMPARATOR:
        return <Comparator />;
      case ViewMode.TOPICS:
        // Pass API Key and settings callback to TopicSorter
        return <TopicSorter apiKey={apiKey} onOpenSettings={openSettings} />;
      case ViewMode.BATCHER:
        return <Batcher />;
      default:
        // Default fallback
        return <Analyzer />;
    }
  };

  // Sub-component for rendering Navigation Items in the sidebar
  const NavItem = ({
    mode,
    icon: Icon,
    label,
    locked,
  }: {
    mode: ViewMode;
    icon: any;
    label: string;
    locked?: boolean;
  }) => (
    <button
      onClick={() => handleNavClick(mode)}
      // Dynamic class string for active/inactive state styling
      className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full transition-all duration-200 group relative ${
        currentView === mode
          ? "bg-teal-500/10 text-teal-400" // Active styles
          : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200" // Inactive hover styles
      }`}
    >
      {/* Active Indicator Bar */}
      {currentView === mode && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-teal-500 rounded-r-full"></div>
      )}
      {/* Icon Component */}
      <Icon
        className={`w-5 h-5 ${
          currentView === mode
            ? "text-teal-400"
            : "text-slate-500 group-hover:text-slate-300"
        }`}
      />
      {/* Label Text */}
      <span className="font-medium tracking-wide text-sm flex-1 text-left">
        {label}
      </span>
      {/* Lock Icon if section is locked and not unlocked yet */}
      {locked && !isAIUnlocked && (
        <Lock className="w-3 h-3 text-slate-600 group-hover:text-slate-500" />
      )}
    </button>
  );

  // Render App JSX
  return (
    // Main App Container
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">
      {/* Mobile Header Bar - Visible only on small screens */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-2">
          {/* Logo Icon */}
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center font-bold text-slate-900 shadow-lg shadow-teal-500/20">
            H
          </div>
          {/* Logo Text */}
          <span className="font-bold text-lg tracking-tight font-display">
            Horizon Sort
          </span>
        </div>
        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar Navigation - Fixed on left for desktop, slide-in for mobile */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-30 w-72 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen flex flex-col border-r border-slate-800 shadow-2xl md:shadow-none
        ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } /* Slide logic */
      `}
      >
        {/* Sidebar Header */}
        <div className="p-8 pb-4 flex-shrink-0">
          <div className="flex items-center gap-3 mb-1">
            {/* Horizon Sort Logo Block */}
            <div className="w-9 h-9 bg-teal-500 rounded-xl shadow-[0_0_20px_rgba(20,184,166,0.4)] flex items-center justify-center text-slate-950 font-bold text-xl font-display">
              H
            </div>
            <div>
              <h1 className="font-bold text-white text-xl tracking-tight font-display">
                Horizon Sort
              </h1>
            </div>
          </div>
          {/* Version Tag */}
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] ml-12 font-medium">
            v1.3
          </p>
        </div>

        {/* Navigation Links Area */}
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto mt-4">
          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-4 py-2 mb-2 font-display">
            Modules
          </div>
          <NavItem
            mode={ViewMode.ANALYZER}
            icon={LayoutGrid}
            label="Data Analyzer"
          />
          <NavItem
            mode={ViewMode.COMPARATOR}
            icon={Split}
            label="List Comparator"
          />
          <NavItem
            mode={ViewMode.BATCHER}
            icon={Layers}
            label="Batch Processor"
          />
          <NavItem
            mode={ViewMode.TOPICS}
            icon={BrainCircuit}
            label="AI Clustering"
            locked={true}
          />
        </nav>

        {/* Sidebar Footer Area */}
        <div className="p-4 flex-shrink-0 space-y-4">
          {/* Settings Button */}
          <button
            onClick={openSettings}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium text-sm">Settings</span>
          </button>

          {/* External Links Section */}
          <div className="pt-2 space-y-1 border-t border-slate-800/50">
            <p className="px-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1 mt-2 font-display">
              Resources
            </p>
            <a
              href="https://horizoncorp.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg w-full text-slate-400 hover:text-teal-400 hover:bg-slate-800/50 transition-colors group"
            >
              <Globe className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors" />
              <span className="font-medium text-xs">
                Learn About Horizon Corp
              </span>
            </a>
            <a
              href="https://myfolioali.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg w-full text-slate-400 hover:text-teal-400 hover:bg-slate-800/50 transition-colors group"
            >
              <User className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors" />
              <span className="font-medium text-xs">
                Learn About the Developer
              </span>
            </a>
          </div>

          {/* Developer Credits */}
          <div className="border-t border-slate-800/50 pt-4 px-2">
            <div className="flex items-center gap-2 text-slate-600 mb-1">
              <Terminal className="w-3 h-3" />
              <span className="text-[10px] font-mono uppercase">Developer</span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Shaikh AliAkbar
            </p>
            <p className="text-[10px] text-teal-600/70 font-mono mt-0.5">
              @Stronix
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Overlay - Darkens background when menu is open */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 h-[calc(100vh-64px)] md:h-screen overflow-y-auto bg-slate-50 relative">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 px-8 py-6 flex justify-between items-center sticky top-0 z-10 backdrop-blur-sm bg-white/90">
          <div>
            {/* Dynamic Title based on current view */}
            <h2 className="text-2xl font-bold text-slate-800 font-display">
              {currentView === ViewMode.ANALYZER && "Data Analyzer"}
              {currentView === ViewMode.COMPARATOR && "List Comparator"}
              {currentView === ViewMode.BATCHER && "Batch Processor"}
              {currentView === ViewMode.TOPICS && "AI Clustering"}
            </h2>
            {/* Dynamic Description based on current view */}
            <p className="text-sm text-slate-500 mt-1 font-medium">
              {currentView === ViewMode.ANALYZER &&
                "Deep index & frequency analysis tool."}
              {currentView === ViewMode.COMPARATOR &&
                "Advanced set intersection & difference engine."}
              {currentView === ViewMode.BATCHER &&
                "Automated list segmentation & formatting."}
              {currentView === ViewMode.TOPICS &&
                "Smart categorization powered by Gemini."}
            </p>
          </div>

          {/* API Key Status Indicator (Desktop only) */}
          <button
            onClick={openSettings}
            className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              apiKey
                ? "bg-teal-50 text-teal-700 border-teal-200"
                : "bg-slate-100 text-slate-600 border-slate-200"
            }`}
          >
            {/* Status Dot */}
            <div
              className={`w-2 h-2 rounded-full ${
                apiKey ? "bg-teal-500" : "bg-slate-400"
              }`}
            ></div>
            {apiKey ? "API Key Active" : "No API Key"}
          </button>
        </header>

        {/* Content Render Container */}
        <div className="p-4 md:p-8 max-w-7xl mx-auto">{renderView()}</div>
      </main>

      {/* ADMIN PASSWORD MODAL */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            onClick={() => setIsPasswordModalOpen(false)}
          ></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative z-10 overflow-hidden animate-fade-in border-t-4 border-teal-500">
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Lock className="w-8 h-8 text-slate-700" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 font-display">
                  Admin Access Required
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  This module is protected. Please enter the administrator
                  password to proceed.
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-2">
                <div className="relative">
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setPasswordError(false);
                    }}
                    placeholder="Enter password..."
                    autoFocus
                    className={`w-full pl-4 pr-4 py-3 bg-slate-50 border rounded-lg text-sm text-center font-bold text-slate-800 outline-none focus:ring-2 transition-all ${
                      passwordError
                        ? "border-rose-300 focus:ring-rose-200 bg-rose-50"
                        : "border-slate-200 focus:ring-teal-500"
                    }`}
                  />
                </div>
                {passwordError && (
                  <p className="text-xs text-rose-500 font-medium flex items-center justify-center gap-1 animate-pulse">
                    <AlertCircle className="w-3 h-3" /> Incorrect password. Try
                    again.
                  </p>
                )}
                <button
                  type="submit"
                  className="w-full py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex justify-center items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" /> Unlock Module
                </button>
              </form>
            </div>
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-center">
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Key Settings Modal */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Modal Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsKeyModalOpen(false)}
          ></div>
          {/* Modal Content Card */}
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-fade-in">
            {/* Modal Header */}
            <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
              <h3 className="text-white font-bold font-display flex items-center gap-2">
                <Key className="w-4 h-4 text-teal-400" />
                API Configuration
              </h3>
              {/* Close Button */}
              <button
                onClick={() => setIsKeyModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
               Enter your api key
              </p>

              {/* Input Field with Show/Hide Toggle */}
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="Paste your API key here..."
                  className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none font-mono"
                />
                {/* Eye Icon Toggle */}
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSaveKey}
                  className="flex-1 py-2.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/10 flex justify-center items-center gap-2"
                >
                  <Check className="w-4 h-4" /> Save Key
                </button>
                {/* Show Remove button only if key exists */}
                {apiKey && (
                  <button
                    onClick={handleClearKey}
                    className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Link to Google AI Studio */}
              <div className="text-center pt-2">
                <a
                  rel="noopener noreferrer"
                  className="text-xs text-teal-600 hover:text-teal-800 hover:underline"
                >
                  Need key --
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Export the App component
export default App;
