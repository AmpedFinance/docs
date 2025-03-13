import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Predefined token distribution data
const DISTRIBUTION_DATA = [
  // Day 0
  {
    "day": 0,
    "dayLabel": "Launch",
    "LightLink Foundation": 2000000,
    "Private": 1400000,
    "KOL": 1500000,
    "Public": 3200000,
    "Advisors": 0,
    "Team": 0,
    "Rewards": 1250000,
    "Liquidity": 7500000,
    "Reserve": 0,
    "Protocol Incentives": 1400000
  },
  // Day 30
  {
    "day": 30,
    "dayLabel": "Month 1",
    "LightLink Foundation": 2000000,
    "Private": 1400000,
    "KOL": 1500000,
    "Public": 3680000,
    "Advisors": 0,
    "Team": 0,
    "Rewards": 3750000,
    "Liquidity": 9000000,
    "Reserve": 0,
    "Protocol Incentives": 2877778
  },
  // Day 61
  {
    "day": 61,
    "dayLabel": "Month 2",
    "LightLink Foundation": 2000000,
    "Private": 1800000,
    "KOL": 1791667,
    "Public": 4160000,
    "Advisors": 0,
    "Team": 0,
    "Rewards": 5000000,
    "Liquidity": 9750000,
    "Reserve": 0,
    "Protocol Incentives": 3616667
  },
  // Day 91
  {
    "day": 91,
    "dayLabel": "Month 3",
    "LightLink Foundation": 2000000,
    "Private": 2200000,
    "KOL": 2083334,
    "Public": 4640000,
    "Advisors": 0,
    "Team": 0,
    "Rewards": 5000000,
    "Liquidity": 10500000,
    "Reserve": 0,
    "Protocol Incentives": 4355556
  },
  // Day 122
  {
    "day": 122,
    "dayLabel": "Month 4",
    "LightLink Foundation": 2000000,
    "Private": 2600000,
    "KOL": 2375000,
    "Public": 5120000,
    "Advisors": 0,
    "Team": 0,
    "Rewards": 5000000,
    "Liquidity": 11250000,
    "Reserve": 0,
    "Protocol Incentives": 5094444
  },
  // Day 153
  {
    "day": 153,
    "dayLabel": "Month 5",
    "LightLink Foundation": 2000000,
    "Private": 3000000,
    "KOL": 2666667,
    "Public": 5600000,
    "Advisors": 0,
    "Team": 0,
    "Rewards": 5000000,
    "Liquidity": 12000000,
    "Reserve": 183333,
    "Protocol Incentives": 5833333
  },
  // Day 183
  {
    "day": 183,
    "dayLabel": "Month 6",
    "LightLink Foundation": 2000000,
    "Private": 3400000,
    "KOL": 2958334,
    "Public": 6080000,
    "Advisors": 0,
    "Team": 0,
    "Rewards": 5000000,
    "Liquidity": 12750000,
    "Reserve": 366667,
    "Protocol Incentives": 6572222
  },
  // Day 214
  {
    "day": 214,
    "dayLabel": "Month 7",
    "LightLink Foundation": 2000000,
    "Private": 3800000,
    "KOL": 3250000,
    "Public": 6560000,
    "Advisors": 0,
    "Team": 0,
    "Rewards": 5000000,
    "Liquidity": 13500000,
    "Reserve": 550000,
    "Protocol Incentives": 7311111
  },
  // Day 244
  {
    "day": 244,
    "dayLabel": "Month 8",
    "LightLink Foundation": 2000000,
    "Private": 4200000,
    "KOL": 3541667,
    "Public": 7040000,
    "Advisors": 0,
    "Team": 0,
    "Rewards": 5000000,
    "Liquidity": 14250000,
    "Reserve": 733333,
    "Protocol Incentives": 8050000
  },
  // Day 275
  {
    "day": 275,
    "dayLabel": "Month 9",
    "LightLink Foundation": 2000000,
    "Private": 4600000,
    "KOL": 3833334,
    "Public": 7520000,
    "Advisors": 66667,
    "Team": 0,
    "Rewards": 5000000,
    "Liquidity": 15000000,
    "Reserve": 916667,
    "Protocol Incentives": 8788889
  },
  // Day 306
  {
    "day": 306,
    "dayLabel": "Month 10",
    "LightLink Foundation": 2000000,
    "Private": 5000000,
    "KOL": 4125000,
    "Public": 8000000,
    "Advisors": 133333,
    "Team": 0,
    "Rewards": 5000000,
    "Liquidity": 15000000,
    "Reserve": 1100000,
    "Protocol Incentives": 9527778
  },
  // Day 365
  {
    "day": 365,
    "dayLabel": "Year 1",
    "LightLink Foundation": 2000000,
    "Private": 5800000,
    "KOL": 4708334,
    "Public": 8000000,
    "Advisors": 266667,
    "Team": 0,
    "Rewards": 5000000,
    "Liquidity": 15000000,
    "Reserve": 1466667,
    "Protocol Incentives": 11005556
  },
  // Day 456
  {
    "day": 456,
    "dayLabel": "Month 15",
    "LightLink Foundation": 2000000,
    "Private": 7000000,
    "KOL": 5000000,
    "Public": 8000000,
    "Advisors": 533333,
    "Team": 300000,
    "Rewards": 5000000,
    "Liquidity": 15000000,
    "Reserve": 2200000,
    "Protocol Incentives": 14972222
  },
  // Day 518
  {
    "day": 518,
    "dayLabel": "Month 17",
    "LightLink Foundation": 2666667,
    "Private": 7000000,
    "KOL": 5000000,
    "Public": 8000000,
    "Advisors": 800000,
    "Team": 900000,
    "Rewards": 5000000,
    "Liquidity": 15000000,
    "Reserve": 2750000,
    "Protocol Incentives": 18166667
  },
  // Day 609
  {
    "day": 609,
    "dayLabel": "Month 20",
    "LightLink Foundation": 4666667,
    "Private": 7000000,
    "KOL": 5000000,
    "Public": 8000000,
    "Advisors": 1133333,
    "Team": 1800000,
    "Rewards": 5000000,
    "Liquidity": 15000000,
    "Reserve": 3483333,
    "Protocol Incentives": 22722222
  },
  // Day 730
  {
    "day": 730,
    "dayLabel": "Year 2",
    "LightLink Foundation": 7333334,
    "Private": 7000000,
    "KOL": 5000000,
    "Public": 8000000,
    "Advisors": 1600000,
    "Team": 3600000,
    "Rewards": 5000000,
    "Liquidity": 15000000,
    "Reserve": 4583333,
    "Protocol Incentives": 28000000
  },
  // Day 1095
  {
    "day": 1095,
    "dayLabel": "Year 3",
    "LightLink Foundation": 10000000,
    "Private": 7000000,
    "KOL": 5000000,
    "Public": 8000000,
    "Advisors": 2000000,
    "Team": 9000000,
    "Rewards": 5000000,
    "Liquidity": 15000000,
    "Reserve": 7333333,
    "Protocol Incentives": 28000000
  },
  // Day 1500
  {
    "day": 1500,
    "dayLabel": "Day 1500",
    "LightLink Foundation": 10000000,
    "Private": 7000000,
    "KOL": 5000000,
    "Public": 8000000,
    "Advisors": 2000000,
    "Team": 9000000,
    "Rewards": 5000000,
    "Liquidity": 15000000,
    "Reserve": 8433333,
    "Protocol Incentives": 28000000
  },
  // Day 1920
  {
    "day": 1920,
    "dayLabel": "Day 1920",
    "LightLink Foundation": 10000000,
    "Private": 7000000,
    "KOL": 5000000,
    "Public": 8000000,
    "Advisors": 2000000,
    "Team": 9000000,
    "Rewards": 5000000,
    "Liquidity": 15000000,
    "Reserve": 11000000,
    "Protocol Incentives": 28000000
  }
];

interface CategoryColors {
  [key: string]: string;
}

interface ChartDataPoint {
  day: number;
  dayLabel: string;
  [key: string]: number | string;
}

const TokenDistributionChart = () => {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);

  // Color palette for token categories
  const categoryColors: CategoryColors = {
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
    // Set the predefined data
    setData(DISTRIBUTION_DATA);
    
    // Extract categories from the first data point
    if (DISTRIBUTION_DATA.length > 0) {
      const firstPoint = DISTRIBUTION_DATA[0];
      const extractedCategories = Object.keys(firstPoint)
        .filter(key => key !== 'day' && key !== 'dayLabel');
      setCategories(extractedCategories);
    }
  }, []);

  const formatYAxis = (value: number): string => {
    if (value === 0) return '0';
    if (value < 1000000) return `${(value / 1000).toFixed(0)}K`;
    return `${(value / 1000000).toFixed(1)}M`;
  };

  const tooltipFormatter = (value: number, name: string) => {
    return [`${Math.round(value).toLocaleString()} tokens`, name];
  };

  const customTooltip = ({ active, payload, label }: any) => {
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
          const finalAllocation = Math.round(data[data.length - 1]?.[category] as number || 0);
          const total = categories.reduce((sum, cat) => sum + Math.round(data[data.length - 1]?.[cat] as number || 0), 0);
          
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
                {(finalAllocation / total * 100).toFixed(1)}% of total
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TokenDistributionChart; 