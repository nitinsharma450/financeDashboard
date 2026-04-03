import { useState, useEffect } from "react";
import {
  LineChart, Line, PieChart, Pie, Cell,
  Tooltip, XAxis, YAxis, ResponsiveContainer
} from "recharts";

type Transaction = {
  id: number;
  date: string;
  amount: number;
  category: string;
  type: "income" | "expense";
};

type Role = "Viewer" | "Admin";

const initialData: Transaction[] = [
  { id: 1, date: "2026-04-01", amount: 2000, category: "Food", type: "expense" },
  { id: 2, date: "2026-04-02", amount: 10000, category: "Salary", type: "income" },
  { id: 3, date: "2026-04-03", amount: 1500, category: "Shopping", type: "expense" },
];

export default function App() {

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("transactions");
    return saved ? JSON.parse(saved) : initialData;
  });

  const [role, setRole] = useState<Role>("Viewer");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  // basic calculations
  const income = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expense;

  // filter + sort (simple logic)
  const visibleTransactions = transactions
    .filter(t =>
      t.category.toLowerCase().includes(search.toLowerCase()) &&
      (filter ? t.type === filter : true)
    )
    .sort((a, b) => b.amount - a.amount);

  // prepare category data
  const categoryMap: Record<string, number> = {};

  transactions.forEach(t => {
    if (t.type === "expense") {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    }
  });

  const categoryData = Object.keys(categoryMap).map(key => ({
    name: key,
    value: categoryMap[key],
  }));

  const topCategory = [...categoryData].sort((a, b) => b.value - a.value)[0];

  // admin add
  const addTransaction = () => {
    const newTxn: Transaction = {
      id: Date.now(),
      date: new Date().toISOString().split("T")[0],
      amount: Math.floor(Math.random() * 5000),
      category: "Misc",
      type: Math.random() > 0.5 ? "income" : "expense",
    };

    setTransactions(prev => [...prev, newTxn]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 px-4 sm:px-6 py-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Finance Dashboard
          </h1>

          <select
            className="border rounded-lg px-4 py-2 bg-white shadow-sm w-full sm:w-auto"
            onChange={(e) => setRole(e.target.value as Role)}
          >
            <option>Viewer</option>
            <option>Admin</option>
          </select>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          <Card title="Balance" value={balance} />
          <Card title="Income" value={income} />
          <Card title="Expense" value={expense} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Box title="Balance Trend">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={transactions}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="amount" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Box>

          <Box title="Spending Breakdown">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name">
                  {categoryData.map((_, i) => <Cell key={i} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </div>

        {/* Transactions */}
        <Box title="Transactions">
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-4">
            <input
              placeholder="Search..."
              className="border rounded-lg px-4 py-2 w-full sm:w-auto"
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="border rounded-lg px-4 py-2 w-full sm:w-auto"
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            {role === "Admin" && (
              <button
                onClick={addTransaction}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full sm:w-auto"
              >
                + Add
              </button>
            )}
          </div>

          {/* Table wrapper for mobile scroll */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Amount</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">Type</th>
                </tr>
              </thead>

              <tbody>
                {visibleTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center p-4 text-gray-400">
                      No data
                    </td>
                  </tr>
                ) : (
                  visibleTransactions.map(t => (
                    <tr key={t.id} className="border-t">
                      <td className="p-3">{t.date}</td>
                      <td className="p-3 font-medium">₹{t.amount}</td>
                      <td className="p-3">{t.category}</td>
                      <td className={`p-3 ${t.type === "income" ? "text-green-600" : "text-red-500"}`}>
                        {t.type}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Box>

        {/* Insights */}
        <Box title="Insights">
          <p className="text-gray-700">Top Category: {topCategory?.name || "N/A"}</p>
          <p className="text-gray-700">Total Spent: ₹{expense}</p>
          <p className="text-gray-700">
            You spend most on <b>{topCategory?.name}</b>
          </p>
        </Box>

      </div>
    </div>
  );
}

// small reusable components

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow border">
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-xl font-bold">₹{value}</h2>
    </div>
  );
}

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-xl shadow border">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      {children}
    </div>
  );
}