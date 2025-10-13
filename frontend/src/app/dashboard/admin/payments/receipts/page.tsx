"use client";
'use client';

import React, { useState, useEffect } from 'react';

interface Receipt {
  id: string;
  amount: number;
  date: string;
  description: string;
  status: 'approved' | 'disapproved';
}

const ManageBankReceiptsPage: React.FC = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [approvedCount, setApprovedCount] = useState(0);
  const [disapprovedCount, setDisapprovedCount] = useState(0);

  useEffect(() => {
    // Simulate loading data
    // In real application, this would be an API call
    const mockReceipts: Receipt[] = [];
    
    setReceipts(mockReceipts);
    setApprovedCount(0);
    setDisapprovedCount(0);
  }, []);

  return (
    <>
      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background-color: #f8f9fa;
          min-height: 100vh;
          color: #333;
        }

        .page-title {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #2c3e50;
        }

        .breadcrumb {
          margin-bottom: 30px;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .breadcrumb a {
          color: #007bff;
          text-decoration: none;
        }

        .breadcrumb a:hover {
          text-decoration: underline;
        }

        .stats-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          border: 1px solid #e9ecef;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: bold;
        }

        .approved-icon {
          background-color: #d4edda;
          color: #155724;
        }

        .disapproved-icon {
          background-color: #f8d7da;
          color: #721c24;
        }

        .stat-content {
          flex: 1;
        }

        .stat-number {
          font-size: 32px;
          font-weight: 700;
          color: #2c3e50;
          margin: 0;
          line-height: 1;
        }

        .stat-label {
          font-size: 14px;
          color: #6c757d;
          margin: 4px 0 0 0;
          font-weight: 500;
        }

        .content-section {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          border: 1px solid #e9ecef;
        }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 20px;
          color: #2c3e50;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #6c757d;
        }

        .empty-state-text {
          font-size: 16px;
          margin: 0;
          color: #dc3545;
        }

        .table-container {
          overflow-x: auto;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        .receipts-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
        }

        .receipts-table th {
          background-color: #f8f9fa;
          padding: 16px;
          text-align: left;
          font-weight: 600;
          color: #495057;
          border-bottom: 1px solid #dee2e6;
          font-size: 14px;
        }

        .receipts-table td {
          padding: 16px;
          border-bottom: 1px solid #f1f3f4;
          font-size: 14px;
        }

        .receipts-table tbody tr:hover {
          background-color: #f8f9fa;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .container {
            padding: 15px;
          }

          .stats-container {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .stat-card {
            padding: 20px;
          }

          .stat-icon {
            width: 50px;
            height: 50px;
            font-size: 20px;
          }

          .stat-number {
            font-size: 28px;
          }

          .page-title {
            font-size: 20px;
          }

          .content-section {
            padding: 20px;
          }

          .receipts-table {
            font-size: 12px;
          }

          .receipts-table th,
          .receipts-table td {
            padding: 12px 8px;
          }
        }

        @media (max-width: 480px) {
          .container {
            padding: 10px;
          }

          .stat-card {
            padding: 16px;
          }

          .content-section {
            padding: 16px;
          }

          .empty-state {
            padding: 40px 10px;
          }
        }
      `}</style>

      <div className="container">
        <h1 className="page-title">Manage bank receipts</h1>
        
        <div className="breadcrumb">
          <a href="#">🏠</a>
          <span>Manage bank receipts</span>
        </div>

        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon approved-icon">
              $
            </div>
            <div className="stat-content">
              <h2 className="stat-number">{approvedCount}</h2>
              <p className="stat-label">Approved receipts</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon disapproved-icon">
              🗑
            </div>
            <div className="stat-content">
              <h2 className="stat-number">{disapprovedCount}</h2>
              <p className="stat-label">Disapproved receipts</p>
            </div>
          </div>
        </div>

        <div className="content-section">
          <h2 className="section-title">Manage bank receipts</h2>
          
          {receipts.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-text">No data available in table</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="receipts-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {receipts.map((receipt) => (
                    <tr key={receipt.id}>
                      <td>{receipt.id}</td>
                      <td>${receipt.amount.toFixed(2)}</td>
                      <td>{receipt.date}</td>
                      <td>{receipt.description}</td>
                      <td>
                        <span className={`status-badge ${receipt.status}`}>
                          {receipt.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-primary">Edit</button>
                        <button className="btn btn-sm btn-danger">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ManageBankReceiptsPage;
