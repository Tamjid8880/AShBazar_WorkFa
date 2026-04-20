"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

type RevenueData = { name: string; revenue: number }[];
type StatusData = { name: string; value: number }[];

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#f43f5e', '#8b5cf6', '#eab308', '#64748b'];

export default function DashboardCharts({ 
    revenueData, 
    statusData 
}: { 
    revenueData: RevenueData, 
    statusData: StatusData 
}) {
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      {/* Revenue Area Chart */}
      <div className="h-[400px] w-full rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
        <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-slate-800">Recent Revenue (Tk)</h2>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#f97316', fontWeight: 'bold' }}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#f97316" 
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Order Status Pie Chart */}
      <div className="h-[400px] w-full rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 flex flex-col items-center">
        <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-slate-800 w-full text-left">Order Distribution</h2>
        <div className="flex-1 w-full flex justify-center items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="45%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontWeight: 'bold', color: '#334155' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
