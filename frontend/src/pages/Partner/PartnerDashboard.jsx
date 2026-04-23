import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./PartnerDashboard.css";

const PartnerDashboard = () => {
  const [tours, setTours] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ============================
    // MOCK DATA (Không dùng API)
    // ============================
    const mockTours = [
      { status: "pending", start_date: "2025-01-12" },
      { status: "approved", start_date: "2025-01-20" },
      { status: "rejected", start_date: "2025-01-25" },

      { status: "approved", start_date: "2025-02-05" },
      { status: "pending", start_date: "2025-02-15" },

      { status: "approved", start_date: "2025-03-09" },
      { status: "approved", start_date: "2025-03-20" },

      { status: "rejected", start_date: "2025-04-01" },
      { status: "pending", start_date: "2025-04-12" },

      { status: "approved", start_date: "2025-05-06" },
      { status: "approved", start_date: "2025-05-14" },

      { status: "pending", start_date: "2025-06-10" },
      { status: "rejected", start_date: "2025-06-22" },

      { status: "approved", start_date: "2025-07-18" },

      { status: "rejected", start_date: "2025-08-03" },
      { status: "approved", start_date: "2025-08-25" },

      { status: "pending", start_date: "2025-09-02" },

      { status: "approved", start_date: "2025-10-11" },
      { status: "approved", start_date: "2025-10-20" },

      { status: "approved", start_date: "2025-11-03" },
      { status: "rejected", start_date: "2025-11-17" },

      { status: "pending", start_date: "2025-12-01" },
      { status: "approved", start_date: "2025-12-15" },
    ];

    setTours(mockTours);

    // ============================
    // Xử lý dữ liệu biểu đồ
    // ============================
    const grouped = {};

    mockTours.forEach((tour) => {
      const date = new Date(tour.start_date);
      const month = date.toLocaleString("en-US", { month: "short" });

      if (!grouped[month]) {
        grouped[month] = {
          month,
          pending: 0,
          approved: 0,
          rejected: 0,
        };
      }

      if (tour.status === "pending") grouped[month].pending++;
      if (tour.status === "approved") grouped[month].approved++;
      if (tour.status === "rejected") grouped[month].rejected++;
    });

    const chartArr = Object.values(grouped);
    setChartData(chartArr);
    setLoading(false);
  }, []);

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="partner-dashboard">
      <h2 className="dashboard-title">Dashboard Overview</h2>

      {/* Biểu đồ trạng thái tours */}
      <div className="dashboard-chart">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />

            <Line type="monotone" dataKey="pending" stroke="#f97316" strokeWidth={2} />
            <Line type="monotone" dataKey="approved" stroke="#0a431e" strokeWidth={2} />
            <Line type="monotone" dataKey="rejected" stroke="#c21b1b" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Cards tổng hợp */}
      <div className="dashboard-summary">
        <div className="summary-card summary-orange">
          <h3>Pending Approval</h3>
          <p>{tours.filter((t) => t.status === "pending").length}</p>
        </div>

        <div className="summary-card summary-green">
          <h3>Approved Tours</h3>
          <p>{tours.filter((t) => t.status === "approved").length}</p>
        </div>

        <div className="summary-card summary-red">
          <h3>Rejected Tours</h3>
          <p>{tours.filter((t) => t.status === "rejected").length}</p>
        </div>
      </div>
    </div>
  );
};

export default PartnerDashboard;
