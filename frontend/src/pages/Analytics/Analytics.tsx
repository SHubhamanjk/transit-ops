import React from 'react';
import './Analytics.css';

const monthlyRevenue = [
  { month: 'Jan', value: 40 },
  { month: 'Feb', value: 55 },
  { month: 'Mar', value: 45 },
  { month: 'Apr', value: 70 },
  { month: 'May', value: 65 },
  { month: 'Jun', value: 85 },
  { month: 'Jul', value: 80 },
];

const topCostliest = [
  { vehicle: 'TRUCK-11', value: 90, color: 'red' },
  { vehicle: 'MINI-03', value: 40, color: 'amber' },
  { vehicle: 'VAN-05', value: 15, color: 'blue' },
];

const Analytics: React.FC = () => {
  return (
    <div className="analytics-container">
      {/* KPI Cards Row */}
      <div className="kpi-row">
        <div className="stat-card border-blue">
          <h4>FUEL EFFICIENCY</h4>
          <div className="stat-value">8.4 km/l</div>
        </div>
        <div className="stat-card border-green">
          <h4>FLEET UTILIZATION</h4>
          <div className="stat-value">81%</div>
        </div>
        <div className="stat-card border-amber">
          <h4>OPERATIONAL COST</h4>
          <div className="stat-value">34,070</div>
        </div>
        <div className="stat-card border-green">
          <h4>VEHICLE ROI</h4>
          <div className="stat-value">14.2%</div>
        </div>
      </div>
      
      <p className="roi-formula">ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost</p>

      {/* Charts Section */}
      <div className="charts-row">
        {/* Monthly Revenue Bar Chart */}
        <div className="chart-container">
          <h3 className="section-title">MONTHLY REVENUE</h3>
          <div className="bar-chart-vertical">
            {monthlyRevenue.map((data, idx) => (
              <div 
                key={idx} 
                className="bar-vertical" 
                style={{ height: `${data.value}%` }}
                title={`${data.month}: ${data.value}%`}
              ></div>
            ))}
          </div>
        </div>

        {/* Top Costliest Vehicles Horizontal Bar Chart */}
        <div className="chart-container">
          <h3 className="section-title">TOP COSTLIEST VEHICLES</h3>
          <div className="bar-chart-horizontal-container">
            {topCostliest.map((data, idx) => (
              <div className="bar-row" key={idx}>
                <div className="bar-label">{data.vehicle}</div>
                <div className="bar-track">
                  <div 
                    className={`bar-horizontal bg-${data.color}`} 
                    style={{ width: `${data.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
