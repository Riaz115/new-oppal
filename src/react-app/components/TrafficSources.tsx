import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Globe } from 'lucide-react';

interface TrafficSourceInput {
  name: string;
  value: number;
  color?: string; // Optional because component will assign it
}

interface TrafficSource {
  name: string;
  value: number;
  color: string;
}

interface TrafficSourcesProps {
  data: TrafficSourceInput[];
  isLoading?: boolean;
}

const COLORS = {
  Organic: '#3B82F6', // Blue
  Direct: '#10B981', // Green
  Social: '#FBBF24', // Yellow
  Referral: '#EF4444', // Red
  Email: '#8B5CF6', // Purple
  Unassigned: '#F59E0B', // Orange - different from red
  Unknown: '#6B7280', // Gray
};

// Standard sources that should always be shown (in preferred order)
const STANDARD_SOURCES = ['Organic', 'Direct', 'Social', 'Referral', 'Email'];

// Available colors for unique assignment
const COLOR_PALETTE = [
  COLORS.Organic,
  COLORS.Direct,
  COLORS.Social,
  COLORS.Referral,
  COLORS.Email,
  COLORS.Unassigned,
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#6366F1', // Indigo
];

// Helper function to normalize source names (matching backend logic exactly)
const normalizeSourceName = (name: string): string => {
  const lowerName = name.toLowerCase().trim();
  
  // Check in order of specificity - more specific matches first
  if (lowerName.includes('organic search') || lowerName.includes('organic') || (lowerName.includes('search') && !lowerName.includes('paid'))) {
    return 'Organic';
  }
  if (lowerName.includes('paid social') || lowerName.includes('organic social') || lowerName.includes('social')) {
    return 'Social';
  }
  if (lowerName.includes('email') || lowerName.includes('mail')) {
    return 'Email';
  }
  if (lowerName.includes('direct') || name === '(none)' || name === '(direct)') {
    return 'Direct';
  }
  if (lowerName.includes('referral')) {
    return 'Referral';
  }
  if (lowerName.includes('unassigned')) {
    return 'Unassigned';
  }
  return name; // Return original if not recognized
};

const getColor = (name: string, usedColors: Set<string>): string => {
  // Direct color mapping for known sources
  if (COLORS[name as keyof typeof COLORS]) {
    return COLORS[name as keyof typeof COLORS];
  }
  
  // For unknown sources, assign unique color that hasn't been used
  for (const color of COLOR_PALETTE) {
    if (!usedColors.has(color)) {
      return color;
    }
  }
  
  // Fallback to gray if all colors used
  return COLORS.Unknown;
};

export default function TrafficSources({ data, isLoading = false }: TrafficSourcesProps) {
  // Normalize and categorize traffic sources with unique colors
  const usedColors = new Set<string>();
  
  // First, normalize all names and aggregate by normalized name (backend might already normalize, but ensure it)
  const normalizedMap = new Map<string, number>();
  data.forEach(item => {
    const normalizedName = normalizeSourceName(item.name);
    normalizedMap.set(normalizedName, (normalizedMap.get(normalizedName) || 0) + item.value);
  });
  
  // Ensure all standard sources are included (even with 0 value for legend)
  STANDARD_SOURCES.forEach(sourceName => {
    if (!normalizedMap.has(sourceName)) {
      normalizedMap.set(sourceName, 0);
    }
  });
  
  // Create array with unique colors - separate data for chart (only > 0) and legend (all)
  const chartData: TrafficSource[] = []; // For chart - only sources with value > 0
  const legendData: TrafficSource[] = []; // For legend - all standard sources + others
  
  normalizedMap.forEach((value, normalizedName) => {
    const color = getColor(normalizedName, usedColors);
    usedColors.add(color);
    
    const sourceItem: TrafficSource = {
      name: normalizedName,
      value,
      color,
    };
    
    // Add to legend if it's a standard source or has value > 0
    if (STANDARD_SOURCES.includes(normalizedName) || value > 0) {
      legendData.push(sourceItem);
    }
    
    // Add to chart only if value > 0 (chart can't display 0 values properly)
    if (value > 0) {
      chartData.push(sourceItem);
    }
  });
  
  // Sort chart data by value descending
  chartData.sort((a, b) => b.value - a.value);
  
  // Sort legend data: standard sources first (in order), then others by value
  legendData.sort((a, b) => {
    const aIndex = STANDARD_SOURCES.indexOf(a.name);
    const bIndex = STANDARD_SOURCES.indexOf(b.name);
    
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex; // Both standard, maintain order
    }
    if (aIndex !== -1) return -1; // a is standard, comes first
    if (bIndex !== -1) return 1; // b is standard, comes first
    return b.value - a.value; // Neither standard, sort by value
  });
  
  // Use chartData for the chart, legendData for the legend
  const normalizedData = chartData; // Chart shows only sources with data

  // Calculate total for percentages
  const total = normalizedData.reduce((sum, item) => sum + item.value, 0);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0';
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            {data.value.toLocaleString()} sessions
          </p>
          <p className="text-sm font-medium text-blue-600">
            {percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <Globe className="w-5 h-5 text-green-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Traffic Sources</h3>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading traffic data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <Globe className="w-5 h-5 text-green-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Traffic Sources</h3>
        </div>
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-400 italic">No traffic data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <Globe className="w-5 h-5 text-green-500 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Traffic Sources</h3>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between min-h-[500px] gap-8 px-4">
        {/* Donut Chart - Left Side, Centered */}
        <div className="flex-1 flex items-center justify-center">
          <ResponsiveContainer width={500} height={500}>
            <PieChart>
              <Pie
                data={normalizedData as any}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={200}
                innerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {normalizedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend - Right Side End, Vertically Centered, Only Names with Dots */}
        <div className="flex items-center justify-end md:pr-4">
          <div className="flex flex-col space-y-4">
            {legendData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div
                  className="w-4 h-4 rounded-full mr-3 flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className={`text-sm font-medium ${item.value === 0 ? 'text-gray-400' : 'text-gray-700'}`}>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

