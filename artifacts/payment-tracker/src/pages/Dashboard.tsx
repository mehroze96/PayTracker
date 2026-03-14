import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePaymentSummaryQuery } from "@/hooks/use-payments";
import { DollarSign, TrendingUp, Calendar, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const currentYear = new Date().getFullYear();
const currentMonth = new Date().toLocaleString('default', { month: 'short' });
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
const COLORS = ['#2563eb', '#0ea5e9', '#0d9488', '#8b5cf6', '#f59e0b', '#f43f5e', '#64748b'];

export default function Dashboard() {
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const { data: summary, isLoading } = usePaymentSummaryQuery({ year: selectedYear });

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const currentMonthTotal = useMemo(() => {
    if (!summary) return 0;
    const monthData = summary.totalByMonth.find(m => m.month.startsWith(currentMonth));
    return monthData?.total || 0;
  }, [summary]);

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Your income overview and analytics.</p>
        </div>
        
        <Select 
          value={selectedYear.toString()} 
          onValueChange={(val) => setSelectedYear(parseInt(val, 10))}
        >
          <SelectTrigger className="w-[180px] bg-card border-border shadow-sm font-medium">
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map(y => (
              <SelectItem key={y} value={y.toString()}>{y} Tax Year</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : summary ? (
        <div className="space-y-6">
          {/* Top Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-md shadow-black/5 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Income ({selectedYear})</CardTitle>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-display font-bold text-foreground">{formatCurrency(summary.totalReceived)}</div>
              </CardContent>
            </Card>

            <Card className="shadow-md shadow-black/5 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{currentMonth} Income</CardTitle>
                <div className="w-10 h-10 rounded-xl bg-chart-2/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-chart-2" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-display font-bold text-foreground">{formatCurrency(currentMonthTotal)}</div>
              </CardContent>
            </Card>

            <Card className="shadow-md shadow-black/5 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Clients</CardTitle>
                <div className="w-10 h-10 rounded-xl bg-chart-4/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-chart-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-display font-bold text-foreground">{summary.totalByClient.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Income Chart */}
            <Card className="shadow-md shadow-black/5 border-border/50 col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Income by Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={summary.totalByMonth} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <RechartsTooltip 
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => [formatCurrency(value), 'Total']}
                      />
                      <Bar dataKey="total" fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Income by Client */}
            <Card className="shadow-md shadow-black/5 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Top Clients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={summary.totalByClient.sort((a,b) => b.total - a.total).slice(0, 5)} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="clientName" type="category" axisLine={false} tickLine={false} tick={{ fill: '#0f172a', fontSize: 12 }} width={100} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => [formatCurrency(value), 'Income']}
                      />
                      <Bar dataKey="total" fill="var(--color-chart-2)" radius={[0, 4, 4, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Income by Method */}
            <Card className="shadow-md shadow-black/5 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full flex items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={summary.totalByMethod}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="total"
                        nameKey="method"
                      >
                        {summary.totalByMethod.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number, name: string) => [formatCurrency(value), name.replace("_", " ")]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Custom Legend */}
                  <div className="w-1/3 flex flex-col justify-center space-y-2 text-sm">
                    {summary.totalByMethod.map((entry, index) => (
                      <div key={entry.method} className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="truncate capitalize text-muted-foreground">{entry.method.replace("_", " ")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </Layout>
  );
}
