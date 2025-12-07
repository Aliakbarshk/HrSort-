// Import React and hooks for state management
import React, { useState } from 'react';
// Import the categorizeTitles service function for API calls
import { categorizeTitles } from '../services/geminiService';
// Import type definition for TopicCategory
import { TopicCategory } from '../types';
// Import icons from Lucide React
import { Sparkles, Play, Copy, Folder, Tag, AlertTriangle, Key } from 'lucide-react';

// Define the interface for props accepted by TopicSorter
interface TopicSorterProps {
  apiKey: string;          // The API key passed from App state
  onOpenSettings: () => void; // Callback function to open settings modal
}

// Define TopicSorter component with props destructuring
const TopicSorter: React.FC<TopicSorterProps> = ({ apiKey, onOpenSettings }) => {
  // State for raw input text
  const [inputText, setInputText] = useState('');
  // State for storing categorization results
  const [categories, setCategories] = useState<TopicCategory[]>([]);
  // State for tracking loading status during API call
  const [loading, setLoading] = useState(false);
  // State for tracking errors
  const [error, setError] = useState<string | null>(null);

  // Handle the logic when "Sort" is clicked
  const handleSort = async () => {
    // If input is empty, do nothing
    if (!inputText.trim()) return;
    // Check if API key is present
    if (!apiKey) {
      // Set error message prompting user to add key
      setError("Please add your Gemini API Key in settings first.");
      // Open the settings modal automatically
      onOpenSettings();
      // Exit function
      return;
    }
    
    // Set loading state to true
    setLoading(true);
    // Clear previous errors
    setError(null);
    // Clear previous results
    setCategories([]);

    // Try block for async operation
    try {
      // Split input text into array of strings
      const titles = inputText.split(/\n/).map(l => l.trim()).filter(l => l);
      // Validate that there are enough titles
      if (titles.length < 2) {
        throw new Error("Please enter at least 2 titles to categorize.");
      }
      
      // Call the service to get categorized data
      const result = await categorizeTitles(titles, apiKey);
      // Update state with result categories
      setCategories(result.categories);
    } catch (err: any) {
      // Catch and set any errors that occur
      setError(err.message || "Failed to categorize titles.");
    } finally {
      // Set loading to false regardless of success/failure
      setLoading(false);
    }
  };

  // Helper function to copy category items to clipboard
  const copyCategory = (items: string[]) => {
    // Write the items joined by newlines to clipboard
    navigator.clipboard.writeText(items.join('\n'));
  };

  // Render component JSX
  return (
    // Main container with animation
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-50 to-slate-100 p-6 rounded-xl border border-teal-100/50">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
             <Sparkles className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display">AI Topic Cluster</h2>
            <p className="text-sm text-slate-600 mt-1">
              Automatically sort your bulk titles into logical categories  
            </p>
          </div>
        </div>
      </div>

      {/* Conditional Rendering: Check if API Key exists */}
      {!apiKey ? (
        // UI State: No API Key - Show warning/prompt
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed border-slate-300 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
            <Key className="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 font-display">API Key Required</h3>
            <p className="text-slate-500 max-w-md mt-2 text-sm">
              To use the AI features, you need to provide your own API key. Your key is stored locally on your device.
            </p>
          </div>
          {/* Button to open settings */}
          <button
            onClick={onOpenSettings}
            className="px-6 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/10"
          >
            Configure API Key
          </button>
        </div>
      ) : (
        // UI State: API Key Exists - Show main tool interface
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Column */}
          <div className="lg:col-span-1 space-y-4">
             <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
               <label className="block text-sm font-bold text-slate-700 mb-2 font-display">Unsorted Titles</label>
               {/* Textarea for titles */}
               <textarea
                  className="w-full h-96 p-4 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none font-mono text-slate-700 bg-slate-50/50"
                  placeholder="Enter a list of mixed titles..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={loading} // Disable while loading
                />
                <div className="mt-4">
                    {/* Trigger Button */}
                    <button
                      onClick={handleSort}
                      disabled={loading || !inputText.trim()} // Disable logic
                      className={`w-full py-3 rounded-lg font-medium text-white shadow-lg shadow-teal-600/10 flex items-center justify-center gap-2 transition-all ${
                        loading 
                        ? 'bg-teal-400 cursor-wait' 
                        : 'bg-teal-600 hover:bg-teal-700'
                      }`}
                    >
                      {/* Show spinner or icon based on loading state */}
                      {loading ? (
                        <>
                           <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                           Sorting...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          Run Auto-Sort
                        </>
                      )}
                    </button>
                  <p className="text-xs text-slate-400 mt-2 text-center">
                    * Limited to approx 500 items per batch
                  </p>
                </div>
             </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Error Message Display */}
            {error && (
              <div className="p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-100 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                {error}
              </div>
            )}

            {/* Placeholder Empty State */}
            {!loading && categories.length === 0 && !error && (
               <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white rounded-xl border border-dashed border-slate-300 text-slate-400">
                  <Folder className="w-16 h-16 mb-4 opacity-10" />
                  <p className="font-medium">Categorized groups will appear here</p>
               </div>
            )}

            {/* Category Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Map through generated categories */}
              {categories.map((cat, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col hover:shadow-md transition-shadow group">
                  {/* Card Header */}
                  <div className="px-4 py-3 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 group-hover:bg-teal-50/30 transition-colors">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Tag className="w-4 h-4 text-teal-500 flex-shrink-0" />
                      {/* Category Name */}
                      <h3 className="font-bold text-slate-800 truncate font-display" title={cat.name}>{cat.name}</h3>
                    </div>
                    {/* Item Count Badge */}
                    <span className="text-xs font-mono bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                      {cat.items.length}
                    </span>
                  </div>
                  {/* Card Body - List of items */}
                  <div className="p-3 flex-1">
                    <ul className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                      {cat.items.map((item, i) => (
                        <li key={i} className="text-sm text-slate-600 pl-2 border-l-2 border-slate-100 hover:border-teal-300 transition-colors truncate">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Card Footer - Copy Button */}
                  <div className="p-2 border-t border-slate-50 bg-slate-50/30">
                    <button 
                      onClick={() => copyCategory(cat.items)}
                      className="w-full text-xs text-slate-500 hover:text-teal-600 font-medium py-1.5 flex items-center justify-center gap-1 hover:bg-white rounded transition-all"
                    >
                      <Copy className="w-3 h-3" /> Copy List
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Export TopicSorter component
export default TopicSorter;