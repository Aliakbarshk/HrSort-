// Import React and hooks for state management
import React, { useState } from 'react';
// Import ComparisonResult type definition
import { ComparisonResult } from '../types';
// Import Recharts components for pie chart visualization
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
// Import icons for UI elements
import { GitCompare, ArrowRightLeft, Check, X, Layers } from 'lucide-react';

// Define the Comparator functional component
const Comparator: React.FC = () => {
  // State for the text content of List A
  const [listA, setListA] = useState('');
  // State for the text content of List B
  const [listB, setListB] = useState('');
  // State for storing the result of the comparison, null initially
  const [result, setResult] = useState<ComparisonResult | null>(null);

  // Function to execute the comparison logic
  const handleCompare = () => {
    // Process List A: Split by newline, trim, filter empty lines, convert to Set
    const setA = new Set<string>(listA.split(/\n/).map(l => l.trim()).filter(l => l !== ''));
    // Process List B: Split by newline, trim, filter empty lines, convert to Set
    const setB = new Set<string>(listB.split(/\n/).map(l => l.trim()).filter(l => l !== ''));

    // Initialize arrays to hold categorization results
    const intersection: string[] = []; // Items in both lists
    const aOnly: string[] = [];        // Items only in A
    const bOnly: string[] = [];        // Items only in B

    // Iterate through Set A to find intersection and unique-to-A items
    setA.forEach(item => {
      // Check if item exists in Set B
      if (setB.has(item)) {
        intersection.push(item); // It's in both
      } else {
        aOnly.push(item); // It's only in A
      }
    });

    // Iterate through Set B to find items unique to B
    setB.forEach(item => {
      // Check if item is NOT in Set A
      if (!setA.has(item)) {
        bOnly.push(item); // It's only in B
      }
    });

    // Update state with the results, sorting arrays alphabetically
    setResult({
      intersection: intersection.sort(),
      aOnly: aOnly.sort(),
      bOnly: bOnly.sort(),
      stats: {
        inBoth: intersection.length, // Count of common items
        inAOnly: aOnly.length,       // Count of A-only items
        inBOnly: bOnly.length,       // Count of B-only items
        totalA: setA.size,           // Total unique items in A
        totalB: setB.size            // Total unique items in B
      }
    });
  };

  // Prepare data for the Pie Chart based on results
  const data = result ? [
    { name: 'Only in List A', value: result.stats.inAOnly, color: '#0d9488' }, // Teal 600
    { name: 'Common', value: result.stats.inBoth, color: '#64748b' },      // Slate 500
    { name: 'Only in List B', value: result.stats.inBOnly, color: '#e11d48' }, // Rose 600
  ] : [];

  // Render component JSX
  return (
    // Main container with spacing and animation
    <div className="space-y-6 animate-fade-in">
      {/* Input Grid: Two columns for List A and List B */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* List A Input Container */}
        <div className="flex flex-col h-full bg-white p-4 rounded-xl shadow-sm border border-slate-200 border-t-4 border-t-teal-500">
          <h3 className="text-sm font-bold text-slate-500 uppercase mb-2 tracking-wide font-display">List A (Base)</h3>
          {/* Textarea for List A */}
          <textarea
            className="flex-1 p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none bg-slate-50 font-mono h-48 md:h-64 text-slate-700"
            placeholder="Paste first list..."
            value={listA}
            onChange={(e) => setListA(e.target.value)}
          />
          {/* Line count indicator */}
          <div className="mt-2 text-xs text-right text-slate-400 font-mono">
            {listA.split(/\n/).filter(l => l.trim()).length} lines
          </div>
        </div>
        
        {/* List B Input Container */}
        <div className="flex flex-col h-full bg-white p-4 rounded-xl shadow-sm border border-slate-200 border-t-4 border-t-rose-500">
          <h3 className="text-sm font-bold text-slate-500 uppercase mb-2 tracking-wide font-display">List B (Target)</h3>
          {/* Textarea for List B */}
          <textarea
            className="flex-1 p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none bg-slate-50 font-mono h-48 md:h-64 text-slate-700"
            placeholder="Paste second list..."
            value={listB}
            onChange={(e) => setListB(e.target.value)}
          />
           {/* Line count indicator */}
           <div className="mt-2 text-xs text-right text-slate-400 font-mono">
            {listB.split(/\n/).filter(l => l.trim()).length} lines
          </div>
        </div>
      </div>

      {/* Action Button Area */}
      <div className="flex justify-center">
        <button
          onClick={handleCompare}
          disabled={!listA.trim() || !listB.trim()} // Disable if either list is empty
          className="px-8 py-3 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-900 transition-all shadow-lg shadow-slate-900/10 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
        >
          <ArrowRightLeft className="w-5 h-5" />
          Compare Lists
        </button>
      </div>

      {/* Results Display Area - Only shown if result exists */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 font-display">
               <Layers className="w-5 h-5 text-teal-600" />
               Overlap Analysis
             </h3>
             <div className="h-64">
               {/* Responsive Pie Chart */}
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={data}
                     innerRadius={60} // Donut style inner radius
                     outerRadius={80} // Donut style outer radius
                     paddingAngle={5} // Space between slices
                     dataKey="value"
                   >
                     {/* Map colors to slices */}
                     {data.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} />
                     ))}
                   </Pie>
                   <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                   <Legend verticalAlign="bottom" height={36}/>
                 </PieChart>
               </ResponsiveContainer>
             </div>
             {/* Similarity Index Calculation Display */}
             <div className="text-center mt-4 space-y-2">
                <div className="text-3xl font-bold text-slate-700 font-display">
                   {/* Calculate Jaccard-like index: Intersection / (Union) */}
                  {((result.stats.inBoth / (result.stats.totalA + result.stats.totalB - result.stats.inBoth || 1)) * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Similarity Index</div>
             </div>
          </div>

          {/* Detailed Lists Output Section */}
          <div className="lg:col-span-2 space-y-4">
             {/* List A Only Results */}
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-teal-50 border-b border-teal-100 flex justify-between items-center">
                   <h4 className="text-sm font-bold text-teal-900 flex items-center gap-2 font-display">
                     <X className="w-4 h-4" /> Unique to List A
                   </h4>
                   <span className="bg-white text-teal-700 text-xs font-bold px-2 py-0.5 rounded border border-teal-200">{result.stats.inAOnly}</span>
                </div>
                <div className="max-h-32 overflow-y-auto p-2 bg-white custom-scrollbar">
                  {result.aOnly.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {result.aOnly.map((t, i) => (
                         <span key={i} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                           {t}
                         </span>
                      ))}
                    </div>
                  ) : <span className="text-xs text-slate-400 italic p-2">None found</span>}
                </div>
             </div>

             {/* Intersection Results */}
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
                   <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 font-display">
                     <GitCompare className="w-4 h-4" /> Intersection (In Both)
                   </h4>
                   <span className="bg-white text-slate-600 text-xs font-bold px-2 py-0.5 rounded border border-slate-200">{result.stats.inBoth}</span>
                </div>
                <div className="max-h-32 overflow-y-auto p-2 bg-white custom-scrollbar">
                   {result.intersection.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {result.intersection.map((t, i) => (
                         <span key={i} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                           {t}
                         </span>
                      ))}
                    </div>
                  ) : <span className="text-xs text-slate-400 italic p-2">None found</span>}
                </div>
             </div>

             {/* List B Only Results */}
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-rose-50 border-b border-rose-100 flex justify-between items-center">
                   <h4 className="text-sm font-bold text-rose-900 flex items-center gap-2 font-display">
                     <Check className="w-4 h-4" /> Unique to List B
                   </h4>
                   <span className="bg-white text-rose-700 text-xs font-bold px-2 py-0.5 rounded border border-rose-200">{result.stats.inBOnly}</span>
                </div>
                 <div className="max-h-32 overflow-y-auto p-2 bg-white custom-scrollbar">
                   {result.bOnly.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {result.bOnly.map((t, i) => (
                         <span key={i} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                           {t}
                         </span>
                      ))}
                    </div>
                  ) : <span className="text-xs text-slate-400 italic p-2">None found</span>}
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Export Comparator component
export default Comparator;