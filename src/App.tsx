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

// mock data
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

  // SAVE TO LOCAL STORAGE
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  
  const income = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expense;

  // filter aand sort
  const visibleTransactions = transactions
    .filter(t =>
      t.category.toLowerCase().includes(search.toLowerCase()) &&
      (filter ? t.type === filter : true)
    )
    .sort((a, b) => b.amount - a.amount);

  // CATEGORY DATA
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

  const topCategory = categoryData.sort((a, b) => b.value - a.value)[0];

  // ADD TRANSACTION (ADMIN)
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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Finance Dashboard</h1>

          <select
            className="border rounded-xl px-4 py-2 bg-white shadow-sm"
            onChange={(e) => setRole(e.target.value as Role)}
          >
            <option>Viewer</option>
            <option>Admin</option>
          </select>
        </div>

        {/* CARDS */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card title="Balance" value={balance} />
          <Card title="Income" value={income} />
          <Card title="Expense" value={expense} />
        </div>

        {/* CHARTS */}
        <div className="grid md:grid-cols-2 gap-6">
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

        {/* TRANSACTIONS */}
        <Box title="Transactions">
          <div className="flex flex-wrap gap-3 mb-4">
            <input
              placeholder="Search..."
              className="border rounded-xl px-4 py-2"
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="border rounded-xl px-4 py-2"
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            {role === "Admin" && (
              <button
                onClick={addTransaction}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl"
              >
                + Add
              </button>
            )}
          </div>

          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Category</th>
                <th className="p-3">Type</th>
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
                    <td className="p-3">₹{t.amount}</td>
                    <td className="p-3">{t.category}</td>
                    <td className={`p-3 ${t.type === "income" ? "text-green-600" : "text-red-500"}`}>
                      {t.type}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Box>

        {/* INSIGHTS */}
        <Box title="Insights">
          <p>Top Category: {topCategory?.name || "N/A"}</p>
          <p>Total Spent: ₹{expense}</p>
          <p>
            You spend most on <b>{topCategory?.name}</b>
          </p>
        </Box>

      </div>
    </div>
  );
}


function Card({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow border">
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-xl font-bold">₹{value}</h2>
    </div>
  );
}

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow border">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      {children}
    </div>
  );
}