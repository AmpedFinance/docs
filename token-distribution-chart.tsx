import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';

const TokenDistributionChart = () => {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Color palette for token categories
  const categoryColors = {
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
        const fileContent = await window.fs.readFile('Untitled spreadsheet  Sheet1 1.csv', { encoding: 'utf8' });
        
        // Parse CSV
        Papa.parse(fileContent, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
          complete: (result) => {
            // Extract token categories (excluding Total Tokens)
            const tokenCategories = result.data
              .map(row => row.Days)
              .filter(cat => cat && cat !== "Total Tokens");
            
            setCategories(tokenCategories);
            
            // Extract day columns
            const dayColumns = result.meta.fields
              .filter(field => !isNaN(parseInt(field)))
              .sort((a, b) => parseInt(a) - parseInt(b));
            
            // Create category data map
            const categoryData = {};
            tokenCategories.forEach(category => {
              const row = result.data.find(r => r.Days === category);
              categoryData[category] = {};
              
              dayColumns.forEach(day => {
                if (row) {
                  categoryData[category][day] = cleanNumber(row[day]);
                } else {
                  categoryData[category][day] = 0;
                }
              });
            });
            
            // Create cumulative distribution data
            const distributionData = [];
            let previousDistribution = {};
            
            // Initialize with zeros
            tokenCategories.forEach(category => {
              previousDistribution[category] = 0;
            });
            
            // Create data points with cumulative values
            dayColumns.forEach(day => {
              const newPoint = { 
                day: parseInt(day),
                dayLabel: formattedDayLabel(parseInt(day))
              };
              
              // Calculate running total for each category
              tokenCategories.forEach(category => {
                previousDistribution[category] += categoryData[category][day];
                newPoint[category] = previousDistribution[category];
              });
              
              // Calculate the correct total for all categories
              newPoint.total = tokenCategories.reduce((sum, category) => {
                return sum + (newPoint[category] || 0);
              }, 0);
              
              distributionData.push(newPoint);
            });
            
            setData(distributionData);
            setIsLoading(false);
          },
          error: (error) => {
            setError(`Error parsing CSV: ${error.message}`);
            setIsLoading(false);
          }
        });
      } catch (error) {
        setError(`Error loading file: ${error.message}`);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Helper functions
  const cleanNumber = (strValue) => {
    if (strValue === undefined || strValue === null || strValue === '') {
      return 0;
    }
    if (typeof strValue === 'number') {
      return strValue;
    }
    // Remove commas and convert to number
    return parseFloat(String(strValue).replace(/,/g, ''));
  };

  const formattedDayLabel = (day) => {
    if (day === 0) return "Launch";
    if (day < 30) return `Day ${day}`;
    
    const months = Math.floor(day / 30);
    if (months < 12) return `Month ${months}`;
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (remainingMonths === 0) return `Year ${years}`;
    return `Year ${years}, Month ${remainingMonths}`;
  };

  const formatYAxis = (value) => {
    if (value === 0) return '0';
    if (value < 1000000) return `${(value / 1000).toFixed(0)}K`;
    return `${(value / 1000000).toFixed(1)}M`;
  };

  const tooltipFormatter = (value, name) => {
    return [`${Math.round(value).toLocaleString()} tokens`, name];
  };

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Calculate the true total by summing all category values
      const totalTokens = Math.round(payload.reduce((sum, entry) => sum + (entry.value || 0), 0));
      const percentage = totalTokens / 100000000 * 100;
      
      return (
        <div className="p-4 bg-white shadow-lg border rounded-md">
          <p className="font-semibold">{data.find(d => d.day === label)?.dayLabel}</p>
          <p className="text-sm text-gray-600 font-bold">{`Total: ${totalTokens.toLocaleString()} tokens`}</p>
          <p className="text-sm text-gray-600">{`(${percentage.toFixed(2)}% of 100M)`}</p>
          <hr className="my-2" />
          <div>
            {payload.map((entry, index) => (
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

  // Filter out points where there's no change to reduce chart clutter
  const significantPoints = data.filter((point, index, arr) => {
    if (index === 0 || index === arr.length - 1) return true;
    const nextPoint = arr[index + 1];
    
    return categories.some(cat => nextPoint[cat] !== point[cat]);
  });

  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-center">Amped Finance Token Distribution Timeline (100M Tokens)</h2>
      
      <div className="w-full h-96 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={significantPoints}
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
                if (day >= 1920) return "5Y+";
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
            
            {categories.map((category, index) => (
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
          // Find max allocation for this category
          const maxAllocation = Math.max(...data.map(point => point[category] || 0));
          // Find final allocation for this category (last data point)
          const finalAllocation = data[data.length - 1][category] || 0;
          
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
                {(finalAllocation / data[data.length - 1].total * 100).toFixed(1)}% of total
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TokenDistributionChart;