'use client';

import React, { useState } from 'react';

interface Currency {
  id: number;
  code: string;
  symbol: string;
  isDefault: boolean;
}

const ManageCurrenciesPage: React.FC = () => {
  const [currencies, setCurrencies] = useState<Currency[]>([
    { id: 0, code: 'USD', symbol: '$', isDefault: true },
    { id: 1, code: 'EUR', symbol: '€', isDefault: false },
    { id: 2, code: 'JPY', symbol: '¥', isDefault: false },
    { id: 3, code: 'TRY', symbol: '₺', isDefault: false },
    { id: 4, code: 'GBP', symbol: '£', isDefault: false },
    { id: 5, code: 'RUB', symbol: '₽', isDefault: false },
    { id: 6, code: 'PLN', symbol: 'zł', isDefault: false },
    { id: 7, code: 'ILS', symbol: '₪', isDefault: false },
    { id: 8, code: 'BRL', symbol: 'R$', isDefault: false },
    { id: 9, code: 'INR', symbol: '₹', isDefault: false }
  ]);

  const [newCurrency, setNewCurrency] = useState({
    code: '',
    symbol: ''
  });

  const [nextId, setNextId] = useState(10);

  const handleAddCurrency = () => {
    const { code, symbol } = newCurrency;
    
    if (!code.trim() || !symbol.trim()) {
      alert('Please enter both currency code and symbol');
      return;
    }

    const upperCode = code.trim().toUpperCase();
    
    // Check if currency already exists
    if (currencies.some(currency => currency.code === upperCode)) {
      alert('Currency already exists');
      return;
    }

    const newCurrencyItem: Currency = {
      id: nextId,
      code: upperCode,
      symbol: symbol.trim(),
      isDefault: false
    };

    setCurrencies([...currencies, newCurrencyItem]);
    setNextId(nextId + 1);
    setNewCurrency({ code: '', symbol: '' });
    alert('Currency added successfully!');
  };

  const handleSetDefault = (id: number) => {
    setCurrencies(currencies.map(currency => ({
      ...currency,
      isDefault: currency.id === id
    })));
    alert('Default currency updated!');
  };

  const handleEditCurrency = (id: number) => {
    const currency = currencies.find(c => c.id === id);
    if (!currency) return;

    const newCode = prompt('Enter new currency code:', currency.code);
    if (newCode === null) return;

    const newSymbol = prompt('Enter new currency symbol:', currency.symbol);
    if (newSymbol === null) return;

    if (newCode.trim() && newSymbol.trim()) {
      setCurrencies(currencies.map(c => 
        c.id === id 
          ? { ...c, code: newCode.trim().toUpperCase(), symbol: newSymbol.trim() }
          : c
      ));
      alert('Currency updated successfully!');
    } else {
      alert('Please enter valid values');
    }
  };

  const handleDeleteCurrency = (id: number) => {
    const currency = currencies.find(c => c.id === id);
    if (!currency) return;

    if (confirm(`Are you sure you want to delete ${currency.code} currency?`)) {
      setCurrencies(currencies.filter(c => c.id !== id));
      alert('Currency deleted successfully!');
    }
  };

  return (
    <>
      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
          background-color: #f8f9fa;
          color: #333;
          min-height: 100vh;
        }

        .header {
          background-color: #4a90e2;
          color: white;
          padding: 15px 20px;
          margin-bottom: 20px;
          border-radius: 5px;
        }

        .header h1 {
          font-size: 18px;
          font-weight: bold;
          margin: 0;
        }

        .breadcrumb {
          margin-bottom: 20px;
          font-size: 14px;
        }

        .breadcrumb a {
          color: #4a90e2;
          text-decoration: none;
        }

        .breadcrumb a:hover {
          text-decoration: underline;
        }

        .breadcrumb span {
          margin: 0 5px;
          color: #666;
        }

        .warning-box {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 5px;
          padding: 15px;
          margin-bottom: 30px;
          display: flex;
          align-items: flex-start;
        }

        .warning-icon {
          color: #856404;
          margin-right: 10px;
          font-weight: bold;
        }

        .warning-text {
          color: #856404;
          font-size: 14px;
          line-height: 1.4;
        }

        .add-currency-section {
          background-color: white;
          border-radius: 5px;
          padding: 25px;
          margin-bottom: 30px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .add-currency-section h2 {
          font-size: 16px;
          margin-bottom: 20px;
          color: #333;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: bold;
          color: #333;
          font-size: 14px;
        }

        .form-group input {
          width: 100%;
          padding: 10px;
          border: 2px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          transition: border-color 0.3s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #4a90e2;
        }

        .add-btn {
          background-color: #17a2b8;
          color: white;
          padding: 12px 25px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
          transition: background-color 0.3s;
        }

        .add-btn:hover {
          background-color: #138496;
        }

        .currencies-section {
          background-color: white;
          border-radius: 5px;
          padding: 25px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .currencies-section h2 {
          font-size: 16px;
          margin-bottom: 20px;
          color: #333;
        }

        .currency-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .currency-table th {
          background-color: #f8f9fa;
          padding: 12px;
          text-align: left;
          font-weight: bold;
          color: #666;
          border-bottom: 2px solid #dee2e6;
          text-transform: uppercase;
          font-size: 12px;
        }

        .currency-table td {
          padding: 15px 12px;
          border-bottom: 1px solid #dee2e6;
          vertical-align: middle;
        }

        .currency-table tbody tr:nth-child(even) {
          background-color: #f8f9fa;
        }

        .currency-table tbody tr:hover {
          background-color: #e9ecef;
        }

        .status-default {
          background-color: #d4edda;
          color: #155724;
          padding: 4px 8px;
          border-radius: 3px;
          font-size: 12px;
          font-weight: bold;
        }

        .action-buttons {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
        }

        .btn {
          padding: 6px 12px;
          border: none;
          border-radius: 3px;
          cursor: pointer;
          font-size: 12px;
          font-weight: bold;
          text-decoration: none;
          display: inline-block;
          transition: opacity 0.3s;
        }

        .btn:hover {
          opacity: 0.8;
        }

        .btn-edit {
          background-color: #007bff;
          color: white;
        }

        .btn-delete {
          background-color: #dc3545;
          color: white;
        }

        .btn-set-default {
          background-color: #28a745;
          color: white;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .container {
            padding: 10px;
          }
          
          .currency-table {
            font-size: 12px;
          }
          
          .currency-table th,
          .currency-table td {
            padding: 8px 6px;
          }
          
          .action-buttons {
            flex-direction: column;
          }
          
          .btn {
            font-size: 11px;
            padding: 4px 8px;
            margin-bottom: 2px;
          }
          
          .add-currency-section,
          .currencies-section {
            padding: 15px;
          }
        }
      `}</style>

      <div className="container">
        <div className="header">
          <h1>Manage Currencies</h1>
        </div>
        
        <div className="breadcrumb">
          <a href="#">🏠 Home</a>
          <span>{'>'}</span>
          <a href="#">Settings</a>
          <span>{'>'}</span>
          <span>Manage Currencies</span>
        </div>
        
        <div className="warning-box">
          <div className="warning-icon">⚠</div>
          <div className="warning-text">
            Please note that not all currencies are supported by payment methods. If the currency you chose isn&apos;t supported, You can set the default payment currency for each payment method from <strong>Payment Settings</strong>.
          </div>
        </div>
        
        <div className="add-currency-section">
          <h2>Add New Currency</h2>
          <div className="form-group">
            <label htmlFor="currency-code">Currency Code (e.g: USD)</label>
            <input 
              type="text" 
              id="currency-code" 
              placeholder="Enter currency code"
              value={newCurrency.code}
              onChange={(e) => setNewCurrency({ ...newCurrency, code: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="currency-symbol">Currency Symbol (e.g: $)</label>
            <input 
              type="text" 
              id="currency-symbol" 
              placeholder="Enter currency symbol"
              value={newCurrency.symbol}
              onChange={(e) => setNewCurrency({ ...newCurrency, symbol: e.target.value })}
            />
          </div>
          <button className="add-btn" onClick={handleAddCurrency}>
            Add Currency
          </button>
        </div>
        
        <div className="currencies-section">
          <h2>Currencies</h2>
          <table className="currency-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>CURRENCY CODE</th>
                <th>CURRENCY SYMBOL</th>
                <th>STATUS</th>
                <th>USD EXCHANGE</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {currencies.map((currency) => (
                <tr key={currency.id}>
                  <td>{currency.id}</td>
                  <td>{currency.code}</td>
                  <td>{currency.symbol}</td>
                  <td>
                    {currency.isDefault && (
                      <span className="status-default">Default</span>
                    )}
                  </td>
                  <td></td>
                  <td>
                    <div className="action-buttons">
                      {!currency.isDefault && (
                        <button 
                          className="btn btn-set-default"
                          onClick={() => handleSetDefault(currency.id)}
                        >
                          Set Default
                        </button>
                      )}
                      <button 
                        className="btn btn-edit"
                        onClick={() => handleEditCurrency(currency.id)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-delete"
                        onClick={() => handleDeleteCurrency(currency.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ManageCurrenciesPage;
