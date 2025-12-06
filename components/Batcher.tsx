// Import React, useState, and useMemo from React library
import React, { useState, useMemo } from 'react';
// Import icons for UI elements from Lucide React
import { Copy, Layers, ListOrdered, Settings2, Hash, GripVertical, Type, ArrowRight } from 'lucide-react';

// Define a type for the split mode: either by 'size' of sets or by 'count' of sets
type SplitMode = 'size' | 'count';

// Define a type for the naming convention: Numeric (1, 2) or Alphabetical (A, B)
type NamingScheme = 'numeric' | 'alpha';

// Interface defining the structure of a single Batch/Set
interface BatchSet {
  id: number;      // Unique identifier number for the set (0-based index)
  items: string[]; // Array of strings (lines) in this set
}

// Define the Batcher functional component
const Batcher: React.FC = () => {
  // State for raw input text from textarea
  const [inputText, setInputText] = useState('');
  // State for the current split mode ('size' or 'count')
  const [mode, setMode] = useState<SplitMode>('size');
  // State for the naming scheme of the sets
  const [namingScheme, setNamingScheme] = useState<NamingScheme>('numeric');
  // State for the numerical input value (either items per set OR number of sets)
  const [inputValue, setInputValue] = useState<number>(20);
  // State for toggling auto-indexing feature
  const [useIndexing, setUseIndexing] = useState(true);
  // State for optional custom prefix string
  const [prefix, setPrefix] = useState('');

  // Helper function to convert a number to Excel-style column name (0 -> A, 1 -> B ... 26 -> AA)
  const getAlphaLabel = (index: number): string => {
    let label = "";
    let i = index + 1; // Convert to 1-based for calculation
    while (i > 0) {
      let remainder = (i - 1) % 26;
      label = String.fromCharCode(65 + remainder) + label;
      i = Math.floor((i - 1) / 26);
    }
    return label;
  };

  // useMemo hook to recalculate sets only when input dependencies change
  const processedData = useMemo(() => {
    // Split input text by newlines, trim lines, remove empty lines
    const lines = inputText.split(/\n/).map(l => l.trim()).filter(l => l !== '');
    // If no lines, return empty result immediately
    if (lines.length === 0) return { sets: [], totalItems: 0 };

    // Variable to hold the calculated size of each set
    let setSize = 20;
    
    // Logic for determining set size based on mode
    if (mode === 'size') {
      // Direct assignment: size is the input value (min 1)
      setSize = Math.max(1, inputValue);
    } else {
      // Split by Count: Calculate size by dividing total lines by target set count
      const targetSets = Math.max(1, inputValue);
      setSize = Math.ceil(lines.length / targetSets);
    }

    // Array to store the generated sets
    const sets: BatchSet[] = [];
    // Iterate through lines incrementing by setSize
    for (let i = 0; i < lines.length; i += setSize) {
      // Create a new set object
      sets.push({
        id: sets.length, // store 0-based index
        items: lines.slice(i, i + setSize) // Slice the main array to get specific batch items
      });
    }

    // Return the sets array and the total item count
    return { sets, totalItems: lines.length };
  }, [inputText, mode, inputValue]); // Dependencies

  // Helper function to copy a single set to clipboard
  const copySet = (items: string[], offset: number) => {
    // Transform items based on indexing and prefix settings
    const text = items.map((item, idx) => {
      // Create index string if enabled (e.g., "11. ")
      const indexStr = useIndexing ? `${offset + idx + 1}. ` : '';
      // Create prefix string if exists (e.g., "Day 1 ")
      const prefixStr = prefix ? `${prefix} ` : '';
      // Combine parts
      return `${indexStr}${prefixStr}${item}`;
    }).join('\n'); // Join with newlines
    
    // Write to clipboard
    navigator.clipboard.writeText(text);
  };

  // Helper function to calculate the starting index offset for a specific set
  const getFormattedCount = (setIndex: number, sets: BatchSet[]) => {
    let prevCount = 0;
    // Sum the length of all previous sets
    for(let i=0; i<setIndex; i++) prevCount += sets[i].items.length;
    return prevCount;
  };

  // Render component JSX
  return (
    // Main container
    <div className="space-y-6 animate-fade-in">
      {/* Header Info Section */}
      <div className="bg-gradient-to-r from-teal-50 to-slate-100 p-6 rounded-xl border border-teal-100 flex items-start gap-4">
        <div className="p-3 bg-white rounded-lg shadow-sm">
           <Layers className="w-6 h-6 text-teal-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-display">Batch Splitter</h2>
          <p className="text-sm text-slate-600 mt-1">
            Organize large lists into structured sets. Control capacity, naming, and formatting.
          </p>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Input & Settings */}
        <div className="lg:col-span-1 space-y-4">
           {/* Settings Card */}
           <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 font-display">
                <Settings2 className="w-4 h-4 text-teal-600" /> Configuration
              </h3>
              
              {/* --- Split Logic Section --- */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Split Strategy</label>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => setMode('size')}
                    className={`flex-1 py-2 text-xs font-bold uppercase rounded-md transition-all ${
                      mode === 'size' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Set Capacity
                  </button>
                  <button
                    onClick={() => setMode('count')}
                    className={`flex-1 py-2 text-xs font-bold uppercase rounded-md transition-all ${
                      mode === 'count' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Fixed Sets
                  </button>
                </div>

                {/* Capacity/Count Slider (Crossbar) */}
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-medium text-slate-700">
                      {mode === 'size' ? 'Items per Set' : 'Total Sets to Create'}
                    </label>
                    <span className="text-xs font-mono font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                      {inputValue}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Slider Input */}
                    <input 
                      type="range" 
                      min="1" 
                      max="500" // Increased range for larger batches
                      value={inputValue}
                      onChange={(e) => setInputValue(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                    />
                  </div>
                  {/* Preset Quick Buttons */}
                  <div className="flex gap-2 mt-2">
                    {[10, 20, 50, 100].map(val => (
                      <button 
                        key={val}
                        onClick={() => setInputValue(val)}
                        className={`px-2 py-1 text-[10px] font-bold rounded border ${
                          inputValue === val 
                          ? 'bg-teal-600 text-white border-teal-600' 
                          : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-teal-300'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* --- Naming & Formatting Section --- */}
              <div className="space-y-4">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Naming & Format</label>
                 
                 {/* Naming Scheme Toggle */}
                 <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-700 font-medium">Set Labels</span>
                    <div className="flex bg-slate-100 p-0.5 rounded-lg">
                      <button
                         onClick={() => setNamingScheme('numeric')}
                         className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${namingScheme === 'numeric' ? 'bg-white shadow-sm text-teal-700' : 'text-slate-400'}`}
                      >
                        1, 2, 3
                      </button>
                      <button
                         onClick={() => setNamingScheme('alpha')}
                         className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${namingScheme === 'alpha' ? 'bg-white shadow-sm text-teal-700' : 'text-slate-400'}`}
                      >
                        A, B, C
                      </button>
                    </div>
                 </div>

                {/* Auto-Index Checkbox */}
                <label className="flex items-center gap-3 p-2.5 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors bg-slate-50/50">
                  <input 
                    type="checkbox" 
                    checked={useIndexing}
                    onChange={(e) => setUseIndexing(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 border-slate-300" 
                  />
                  <div className="flex-1">
                    <span className="text-xs font-bold text-slate-700 block">Number Items</span>
                    <span className="text-[10px] text-slate-500 block">Prefix items with 1., 2., etc.</span>
                  </div>
                  <ListOrdered className="w-4 h-4 text-slate-400" />
                </label>

                {/* Custom Prefix Input */}
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1">Custom Prefix</label>
                   <div className="relative">
                      <GripVertical className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={prefix}
                        onChange={(e) => setPrefix(e.target.value)}
                        placeholder="e.g. Video -"
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-700 font-medium placeholder:font-normal"
                      />
                   </div>
                </div>
              </div>
           </div>
        </div>

        {/* Right Column: Input & Output Area */}
        <div className="lg:col-span-2 space-y-4">
           
           {/* Source Input */}
           <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
             <div className="flex justify-between items-center mb-2">
               <label className="flex items-center gap-2 text-sm font-bold text-slate-700 font-display">
                 <Type className="w-4 h-4 text-teal-600" /> Source Data
               </label>
               <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded-full border border-slate-200">
                 {processedData.totalItems} Total Lines
               </span>
             </div>
             <textarea
                className="w-full h-32 p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none font-mono text-slate-700 bg-slate-50"
                placeholder="Paste your list here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
           </div>

           {/* Output Section */}
           {processedData.sets.length > 0 ? (
            <div className="space-y-4 animate-fade-in">
               {/* Summary Bar */}
               <div className="flex items-center gap-2 text-slate-400 text-xs uppercase font-bold tracking-wider">
                  <ArrowRight className="w-4 h-4" />
                  <span>Result: {processedData.sets.length} Sets Generated</span>
               </div>
               
               {/* Sets Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {processedData.sets.map((set, idx) => {
                  // Calculate offset for item indexing
                  const currentOffset = getFormattedCount(idx, processedData.sets);
                  // Generate Set Label (e.g., Set 1 or Set A)
                  const setLabel = namingScheme === 'numeric' 
                    ? `Set ${set.id + 1}` 
                    : `Set ${getAlphaLabel(set.id)}`;

                  return (
                    <div key={set.id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col group">
                      {/* Set Header */}
                      <div className="px-4 py-3 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 group-hover:bg-teal-50/20 transition-colors">
                        <span className="font-bold text-slate-800 text-sm font-display">{setLabel}</span>
                        <span className="text-[10px] font-mono bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-bold">
                          {set.items.length} items
                        </span>
                      </div>
                      
                      {/* Set Items List */}
                      <div className="p-3 flex-1 bg-white">
                        <ul className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                          {set.items.map((item, i) => (
                            <li key={i} className="text-sm text-slate-600 truncate flex gap-2 border-b border-transparent hover:border-slate-100 pb-0.5">
                              {/* Index & Prefix */}
                              {(useIndexing || prefix) && (
                                <span className="text-slate-400 font-mono select-none text-xs mt-0.5 w-8 text-right flex-shrink-0">
                                  {useIndexing && `${currentOffset + i + 1}.`}
                                </span>
                              )}
                              <span className="flex-1 truncate">
                                {prefix && <span className="text-slate-400 mr-1">{prefix}</span>}
                                {item}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Footer / Copy Action */}
                      <div className="p-2 border-t border-slate-50 bg-slate-50/30">
                        <button 
                          onClick={() => copySet(set.items, currentOffset)}
                          className="w-full text-xs text-teal-600 hover:text-teal-800 font-medium py-2 flex items-center justify-center gap-2 hover:bg-white rounded-lg transition-all shadow-sm shadow-transparent hover:shadow-slate-200"
                        >
                          <Copy className="w-3 h-3" /> Copy {setLabel}
                        </button>
                      </div>
                    </div>
                  );
                })}
               </div>
            </div>
           ) : (
             // Empty State
             <div className="h-48 flex flex-col items-center justify-center bg-white rounded-xl border border-dashed border-slate-300 text-slate-400">
                <Hash className="w-12 h-12 mb-3 opacity-10" />
                <p className="font-medium text-sm">Add data above to generate sets</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

// Export Batcher component
export default Batcher;