import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';

// Define types for our data
interface TokenData {
  Category: string;
  Percentage: string;
  Token: string;
  TGE: string;
  'TGE Token': string;
  'Cliff (m)': number;
  Vesting: string;
  'First tokens (m)': number;
  'Last tokens (m)': number;
}

interface DataPoint {
  day: number;
  dayLabel: string;
  total: number;
  [category: string]: number | string;
}

const TokenDistributionChart = () => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Color palette for token categories
  const categoryColors: {[key: string]: string} = {
    "LightLink Foundation": "#8884d8",
    "Private": "#83a6ed",
    "KOL": "#8dd1e1",
    "Public": "#82ca9d",
    "Advisors": "#a4de6c", 
    "Team": "#d0ed57",
    "Rewards": "#ffc658",
    "Liquidity": "#ff8042",
    "Reserve": "#ff6361",
    "Protocol Incentives": "#bc5090"
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const fileContent = await fetch('/AMPtokenomics.csv').then(response => response.text());
        
        // Parse CSV
        Papa.parse(fileContent, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
          complete: (result) => {
            // Extract token categories (excluding Total Tokens)
            const tokenCategories = result.data
              .map((row: any) => row.Category)
              .filter((cat: string | null) => cat && cat !== "TOTAL");
            
            setCategories(tokenCategories);
            
            // Create distribution data based on vesting schedules
            const distributionData = createDistributionData(result.data as TokenData[], tokenCategories);
            
            setData(distributionData);
            setIsLoading(false);
          },
          error: (error) => {
            setError(`Error parsing CSV: ${error.message}`);
            setIsLoading(false);
          }
        });
      } catch (error: any) {
        setError(`Error loading file: ${error.message}`);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Create distribution data from vesting parameters
  const createDistributionData = (rawData: TokenData[], categories: string[]): DataPoint[] => {
    // Initialize data for 5 years (1825 days)
    const days = [0, 30, 60, 90, 180, 365, 730, 1095, 1460, 1825];
    const distributionData: DataPoint[] = [];
    
    days.forEach(day => {
      const dataPoint: DataPoint = { 
        day: day,
        dayLabel: formattedDayLabel(day),
        total: 0
      };
      
      let totalTokens = 0;
      
      categories.forEach(category => {
        const catData = rawData.find(row => row.Category === category);
        if (!catData) return;
        
        const tgePercent = parseFloat(String(catData.TGE).replace('%', '')) / 100;
        const totalAllocation = parseFloat(String(catData.Token).replace(/,/g, ''));
        const cliffMonths = catData['Cliff (m)'] || 0;
        const cliffDays = cliffMonths * 30;
        
        // Extract vesting period in months
        let vestingMonths = 0;
        const vestingText = catData.Vesting || '';
        const monthMatch = vestingText.match(/(\d+)\s*month/);
        if (monthMatch) {
          vestingMonths = parseInt(monthMatch[1]);
        } else if (vestingText.includes('25% p/m')) {
          vestingMonths = 4; // 25% per month for 4 months
        }
        
        const vestingDays = vestingMonths * 30;
        
        // Calculate unlocked tokens for this day
        let unlockedTokens = 0;
        
        // TGE amount
        if (tgePercent > 0) {
          unlockedTokens += totalAllocation * tgePercent;
        }
        
        // Vesting amount (only if past cliff and within vesting period)
        if (day > cliffDays && vestingDays > 0) {
          const daysIntoVesting = day - cliffDays;
          const vestingProgress = Math.min(daysIntoVesting / vestingDays, 1);
          const vestingAmount = totalAllocation * (1 - tgePercent) * vestingProgress;
          unlockedTokens += vestingAmount;
        }
        
        dataPoint[category] = unlockedTokens;
        totalTokens += unlockedTokens;
      });
      
      dataPoint.total = totalTokens;
      distributionData.push(dataPoint);
    });
    
    return distributionData;
  };

  // Helper functions
  const formattedDayLabel = (day: number): string => {
    if (day === 0) return "Launch";
    if (day < 30) return `Day ${day}`;
    
    const months = Math.floor(day / 30);
    if (months < 12) return `Month ${months}`;
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (remainingMonths === 0) return `Year ${years}`;
    return `Year ${years}, Month ${remainingMonths}`;
  };

  const formatYAxis = (value: number): string => {
    if (value === 0) return '0';
    if (value < 1000000) return `${(value / 1000).toFixed(0)}K`;
    return `${(value / 1000000).toFixed(1)}M`;
  };

  const customTooltip = ({ active, payload, label }: any): React.ReactNode => {
    if (active && payload && payload.length) {
      // Calculate the true total by summing all category values
      const totalTokens = Math.round(payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0));
      const percentage = totalTokens / 100000000 * 100;
      
      return (
        <div className="p-4 bg-white shadow-lg border rounded-md">
          <p className="font-semibold">{data.find(d => d.day === label)?.dayLabel}</p>
          <p className="text-sm text-gray-600 font-bold">{`Total: ${totalTokens.toLocaleString()} tokens`}</p>
          <p className="text-sm text-gray-600">{`(${percentage.toFixed(2)}% of 100M)`}</p>
          <hr className="my-2" />
          <div>
            {payload.map((entry: any, index: number) => (
              <div key={`item-${index}`} className="flex items-center py-1">
                <div 
                  className="w-3 h-3 mr-2" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm">{entry.name}: </span>
                <span className="ml-1 text-sm font-medium">
                  {Math.round(entry.value).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // Handle loading and error states
  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading token distribution data...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-center">Amped Finance Token Distribution Timeline (100M Tokens)</h2>
      
      <div className="w-full h-96 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="day" 
              tick={{ fontSize: 12 }}
              tickFormatter={(day) => {
                if (day === 0) return "0";
                if (day === 30) return "1M";
                if (day === 180) return "6M";
                if (day === 365) return "1Y";
                if (day === 730) return "2Y";
                if (day === 1095) return "3Y";
                if (day === 1460) return "4Y";
                if (day === 1825) return "5Y";
                return "";
              }}
              label={{ 
                value: 'Timeline (Days after launch)', 
                position: 'insideBottom', 
                offset: -5 
              }}
            />
            <YAxis 
              tickFormatter={formatYAxis} 
              label={{ 
                value: 'Token Amount', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }}
            />
            <Tooltip content={customTooltip} />
            <Legend />
            
            {categories.map((category) => (
              <Area
                key={category}
                type="monotone"
                dataKey={category}
                stackId="1"
                stroke={categoryColors[category] || `#${Math.floor(Math.random()*16777215).toString(16)}`}
                fill={categoryColors[category] || `#${Math.floor(Math.random()*16777215).toString(16)}`}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
        {categories.map(category => {
          // Find final allocation for this category (last data point)
          const finalAllocation = data[data.length - 1]?.[category] as number || 0;
          const totalAllocation = data[data.length - 1]?.total || 1;
          
          return (
            <div 
              key={category} 
              className="border rounded-md p-3 flex flex-col"
              style={{ borderLeftColor: categoryColors[category], borderLeftWidth: '4px' }}
            >
              <div className="text-sm font-semibold truncate" title={category}>
                {category}
              </div>
              <div className="text-lg font-bold">
                {(finalAllocation / 1000000).toFixed(1)}M
              </div>
              <div className="text-xs text-gray-600">
                {(finalAllocation / totalAllocation * 100).toFixed(1)}% of total
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TokenDistributionChart; 