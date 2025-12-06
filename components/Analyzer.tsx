// Import React hooks: useState for state, useMemo for caching calculations
import React, { useState, useMemo } from 'react';
// Import types for Analysis results and Frequency data
import { AnalysisResult, FrequencyItem } from '../types';
// Import Recharts components for data visualization (Bar Chart)
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
// Import icons from Lucide React for UI elements
import { Download, AlertCircle, FileText, Hash } from 'lucide-react';

// Define the Analyzer functional component
const Analyzer: React.FC = () => {
  // State variable for the raw input text entered by the user
  const [inputText, setInputText] = useState('');
  // State variable to store the processed analysis result, initially null
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // Function to handle the analysis logic when the button is clicked
  const handleAnalyze = () => {
    // If input is empty or whitespace, do nothing
    if (!inputText.trim()) return;

    // Split input by newlines, trim each line, and remove empty lines
    const lines = inputText.split(/\n/).map(l => l.trim()).filter(l => l !== '');
    // Calculate total number of valid lines
    const total = lines.length;
    // Create a Set to automatically filter out duplicates
    const uniqueSet = new Set(lines);
    // Get the count of unique items
    const unique = uniqueSet.size;
    
    // Create an object to map each title to its frequency count
    const freqMap: Record<string, number> = {};
    // Iterate over all lines
    lines.forEach(line => {
      // Increment the count for this line in the map
      freqMap[line] = (freqMap[line] || 0) + 1;
    });

    // Convert the map to an array of objects for easier sorting/display
    const frequencyList: FrequencyItem[] = Object.entries(freqMap)
      .map(([title, count]) => ({ title, count }))
      // Sort the list by count in descending order (most frequent first)
      .sort((a, b) => b.count - a.count);

    // Extract items that appear more than once (duplicates)
    const duplicateList = frequencyList.filter(item => item.count > 1).map(item => item.title);

    // Update the result state with the calculated statistics and lists
    setResult({
      stats: {
        total,
        unique,
        duplicates: total - unique, // Calculate duplicates count
        processedAt: new Date().toLocaleTimeString(), // Store current time
      },
      uniqueList: Array.from(uniqueSet).sort(), // Store sorted unique list
      duplicateList, // Store list of duplicate titles
      frequencyMap: frequencyList, // Store full frequency data
    });
  };

  // Function to handle file uploads via the file input
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Get the first file selected by the user
    const file = e.target.files?.[0];
    // If no file selected, exit
    if (!file) return;

    // Create a FileReader to read the file content
    const reader = new FileReader();
    // Define what happens when the file is successfully read
    reader.onload = (event) => {
      // Cast the result to a string
      const text = event.target?.result as string;
      // Update the input text state with the file content
      setInputText(text);
    };
    // Trigger the file read as plain text
    reader.readAsText(file);
  };

  // Function to download the unique list as a text file
  const downloadUnique = () => {
    // If no result exists, do nothing
    if (!result) return;
    // Create a Blob containing the unique list joined by newlines
    const blob = new Blob([result.uniqueList.join('\n')], { type: 'text/plain' });
    // Create a temporary URL for the Blob
    const url = URL.createObjectURL(blob);
    // Create a temporary anchor element
    const a = document.createElement('a');
    // Set the href to the Blob URL
    a.href = url;
    // Set the filename for the download
    a.download = 'horizon_unique_data.txt';
    // Programmatically click the anchor to trigger download
    a.click();
    // Revoke the URL to free up memory
    URL.revokeObjectURL(url);
  };

  // Calculate chart data only when 'result' changes using useMemo
  const chartData = useMemo(() => {
    // If no result, return empty array
    if (!result) return [];
    // Return array formatted for Recharts
    return [
      { name: 'Unique', value: result.stats.unique, color: '#0d9488' }, // Teal 600 color for Unique bar
      { name: 'Duplicates', value: result.stats.duplicates, color: '#64748b' }, // Slate 500 color for Duplicates bar
    ];
  }, [result]); // Dependency array: recalculate when result changes

  // Render component JSX
  return (
    // Main container with spacing and fade-in animation
    <div className="space-y-6 animate-fade-in">
      {/* Grid layout for input (left) and results (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Input Section - Takes up 1 column on large screens */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            {/* Header for Input Section */}
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 font-display">
              <FileText className="w-5 h-5 text-teal-600" />
              Source Data
            </h2>
            {/* Textarea for manual input */}
            <textarea
              className="w-full h-96 p-4 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none font-mono text-slate-700 bg-slate-50/50"
              placeholder="Paste dataset here (one per line)..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)} // Update state on change
            />
            {/* Controls container: File input and Analyze button */}
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <label className="flex-1">
                <span className="sr-only">Choose File</span>
                {/* File Input for uploading text files */}
                <input 
                  type="file" 
                  accept=".txt,.csv" 
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-slate-500
                    file:mr-4 file:py-2.5 file:px-4
                    file:rounded-md file:border-0
                    file:text-xs file:font-semibold
                    file:bg-slate-100 file:text-slate-700
                    hover:file:bg-slate-200 cursor-pointer"
                />
              </label>
              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={!inputText.trim()} // Disable if input is empty
                className="px-6 py-2.5 bg-teal-600 text-white font-medium rounded-md hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-teal-600/10"
              >
                Analyze
              </button>
            </div>
          </div>
        </div>

        {/* Results Section - Takes up 2 columns on large screens */}
        <div className="lg:col-span-2 space-y-6">
          {/* Conditional rendering: Show placeholder if no result, else show data */}
          {!result ? (
            <div className="h-full flex flex-col items-center justify-center bg-white rounded-xl border border-dashed border-slate-300 p-12 text-slate-400">
              <Hash className="w-16 h-16 mb-4 opacity-10" />
              <p className="font-medium">Awaiting Data Input</p>
              <p className="text-sm opacity-60">Paste text to begin analysis</p>
            </div>
          ) : (
            <>
              {/* Statistics Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Total Rows Card */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-slate-800">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Rows</p>
                  <p className="text-3xl font-bold text-slate-800 mt-1 font-display">{result.stats.total.toLocaleString()}</p>
                </div>
                {/* Unique Items Card */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-teal-500">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Unique Items</p>
                  <p className="text-3xl font-bold text-teal-600 mt-1 font-display">{result.stats.unique.toLocaleString()}</p>
                </div>
                {/* Duplicates Card */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-rose-400">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Duplicates</p>
                  <p className="text-3xl font-bold text-rose-500 mt-1 font-display">{result.stats.duplicates.toLocaleString()}</p>
                </div>
              </div>

              {/* Chart and Action Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bar Chart Container */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                   <h3 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-wide">Data Composition</h3>
                   <div className="h-48 w-full">
                     {/* Responsive wrapper for chart */}
                     <ResponsiveContainer width="100%" height="100%">
                       {/* Vertical Bar Chart */}
                       <BarChart data={chartData} layout="vertical">
                         <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                         <XAxis type="number" hide />
                         <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12, fill: '#64748b'}} />
                         <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                         {/* Bar definition with custom colors per cell */}
                         <Bar dataKey="value" barSize={32} radius={[0, 4, 4, 0]}>
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                         </Bar>
                       </BarChart>
                     </ResponsiveContainer>
                   </div>
                </div>

                {/* Download and Duplicates Info */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center space-y-4">
                  <div className="text-center">
                    <p className="text-slate-500 text-sm mb-2">Cleaned Data</p>
                    <h4 className="text-2xl font-bold text-teal-600 font-display">{result.stats.unique.toLocaleString()} Items</h4>
                  </div>
                  {/* Download Button */}
                  <button 
                    onClick={downloadUnique}
                    className="w-full py-3 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-900 transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Unique List
                  </button>
                  {/* Show duplication warning if duplicates exist */}
                  {result.duplicateList.length > 0 && (
                     <div className="p-3 bg-rose-50 rounded-lg border border-rose-100 flex items-start gap-2">
                       <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5" />
                       <div className="text-xs text-rose-800">
                         <strong>{result.duplicateList.length} Duplicates Removed</strong>
                         <p className="mt-1 text-rose-600 truncate max-w-[150px]">{result.duplicateList.join(', ')}</p>
                       </div>
                     </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Export the Analyzer component as default
export default Analyzer;