"use client";

import React, { useState, useEffect } from 'react';

interface AdvertisementData {
  header: string;
  sidebar: string;
  footer: string;
  posts1: string;
  posts2: string;
  posts3: string;
}

const ManageSiteAdvertisementsPage: React.FC = () => {
  const [advertisements, setAdvertisements] = useState<AdvertisementData>({
    header: '',
    sidebar: '',
    footer: '',
    posts1: '',
    posts2: '',
    posts3: ''
  });

  const [isSaving, setIsSaving] = useState(false);

  // Load saved advertisements on component mount
  useEffect(() => {
    const savedAds = localStorage.getItem('siteAdvertisements');
    if (savedAds) {
      try {
        const parsedAds = JSON.parse(savedAds);
        setAdvertisements(parsedAds);
      } catch (error) {
        console.error('Error loading saved advertisements:', error);
      }
    }
  }, []);

  // Handle textarea changes
  const handleAdChange = (field: keyof AdvertisementData, value: string) => {
    setAdvertisements(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save advertisements
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Save to localStorage
      localStorage.setItem('siteAdvertisements', JSON.stringify(advertisements));
      
      alert('Advertisements saved successfully!');
      console.log('Advertisement data saved:', advertisements);
    } catch (error) {
      console.error('Error saving advertisements:', error);
      alert('Error saving advertisements. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [advertisements]);

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
          line-height: 1.5;
        }
        
        .page-title {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 10px;
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
          transition: color 0.2s ease;
        }
        
        .breadcrumb a:hover {
          text-decoration: underline;
          color: #0056b3;
        }
        
        .breadcrumb span {
          color: #6c757d;
        }
        
        .breadcrumb .current {
          color: #dc3545;
          font-weight: 500;
        }
        
        .section-container {
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          padding: 30px;
          margin-bottom: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .section-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 20px;
          color: #2c3e50;
        }
        
        .ad-section {
          margin-bottom: 30px;
        }
        
        .ad-label {
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
          color: #495057;
          display: block;
        }
        
        .ad-textarea {
          width: 100%;
          min-height: 120px;
          padding: 12px;
          border: 2px solid #e9ecef;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
          resize: vertical;
          transition: all 0.3s ease;
          background-color: #fff;
        }
        
        .ad-textarea:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        }
        
        .ad-textarea:hover {
          border-color: #bbb;
        }
        
        .ad-description {
          font-size: 12px;
          color: #6c757d;
          margin-top: 5px;
          line-height: 1.4;
        }
        
        .ad-description a {
          color: #007bff;
          text-decoration: none;
          font-weight: 500;
        }
        
        .ad-description a:hover {
          text-decoration: underline;
        }
        
        .save-btn {
          background-color: #dc3545;
          color: white;
          padding: 12px 30px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 20px;
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        
        .save-btn:hover:not(:disabled) {
          background-color: #c82333;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(220, 53, 69, 0.3);
        }
        
        .save-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        
        .save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        
        .loading-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .save-shortcut {
          font-size: 11px;
          color: #6c757d;
          margin-left: 10px;
          font-style: italic;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
          .container {
            padding: 15px;
          }
          
          .section-container {
            padding: 20px;
          }
          
          .page-title {
            font-size: 20px;
          }
          
          .breadcrumb {
            flex-wrap: wrap;
            gap: 4px;
          }
          
          .ad-textarea {
            min-height: 100px;
          }
          
          .save-btn {
            width: 100%;
            justify-content: center;
          }
        }
        
        @media (max-width: 480px) {
          .container {
            padding: 10px;
          }
          
          .section-container {
            padding: 15px;
          }
          
          .page-title {
            font-size: 18px;
          }
          
          .section-title {
            font-size: 16px;
          }
        }
      `}</style>

      <div className="container">
        <h1 className="page-title">Manage Site Advertisements</h1>
        
        <div className="breadcrumb">
          <a href="#">🏠 Home</a>
          <span>{'>'}</span>
          <a href="#">Advertisements</a>
          <span>{'>'}</span>
          <span className="current">Manage Site Advertisements</span>
        </div>
        
        <div className="section-container">
          <h2 className="section-title">Manage Site Advertisements</h2>
          
          <div className="ad-section">
            <label className="ad-label" htmlFor="header-ad">Header</label>
            <textarea 
              className="ad-textarea" 
              id="header-ad"
              placeholder="Enter your header advertisement code here..."
              value={advertisements.header}
              onChange={(e) => handleAdChange('header', e.target.value)}
            />
            <div className="ad-description">
              Appears on all pages right under the nav bar (<a href="#" onClick={(e) => e.preventDefault()}>HTML Allowed</a>)
            </div>
          </div>
          
          <div className="ad-section">
            <label className="ad-label" htmlFor="sidebar-ad">Sidebar</label>
            <textarea 
              className="ad-textarea" 
              id="sidebar-ad"
              placeholder="Enter your sidebar advertisement code here..."
              value={advertisements.sidebar}
              onChange={(e) => handleAdChange('sidebar', e.target.value)}
            />
            <div className="ad-description">
              Appears on the bottom of home sidebar (<a href="#" onClick={(e) => e.preventDefault()}>HTML Allowed</a>)
            </div>
          </div>
          
          <div className="ad-section">
            <label className="ad-label" htmlFor="footer-ad">Footer</label>
            <textarea 
              className="ad-textarea" 
              id="footer-ad"
              placeholder="Enter your footer advertisement code here..."
              value={advertisements.footer}
              onChange={(e) => handleAdChange('footer', e.target.value)}
            />
            <div className="ad-description">
              Appears on all pages right before the footer (<a href="#" onClick={(e) => e.preventDefault()}>HTML Allowed</a>)
            </div>
          </div>
          
          <div className="ad-section">
            <label className="ad-label" htmlFor="posts1-ad">Posts 1</label>
            <textarea 
              className="ad-textarea" 
              id="posts1-ad"
              placeholder="Enter your posts advertisement code here..."
              value={advertisements.posts1}
              onChange={(e) => handleAdChange('posts1', e.target.value)}
            />
            <div className="ad-description">
              Appears after 10 posts are loaded, between the posts (<a href="#" onClick={(e) => e.preventDefault()}>HTML Allowed</a>)
            </div>
          </div>
          
          <div className="ad-section">
            <label className="ad-label" htmlFor="posts2-ad">Posts 2</label>
            <textarea 
              className="ad-textarea" 
              id="posts2-ad"
              placeholder="Enter your posts advertisement code here..."
              value={advertisements.posts2}
              onChange={(e) => handleAdChange('posts2', e.target.value)}
            />
            <div className="ad-description">
              Appears after 20 posts are loaded, between the posts (<a href="#" onClick={(e) => e.preventDefault()}>HTML Allowed</a>)
            </div>
          </div>
          
          <div className="ad-section">
            <label className="ad-label" htmlFor="posts3-ad">Posts 3</label>
            <textarea 
              className="ad-textarea" 
              id="posts3-ad"
              placeholder="Enter your posts advertisement code here..."
              value={advertisements.posts3}
              onChange={(e) => handleAdChange('posts3', e.target.value)}
            />
            <div className="ad-description">
              Appears after 30 posts are loaded, between the posts (<a href="#" onClick={(e) => e.preventDefault()}>HTML Allowed</a>)
            </div>
          </div>
          
          <button 
            className="save-btn" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <div className="loading-spinner"></div>
                Saving...
              </>
            ) : (
              'Save'
            )}
          </button>
          <span className="save-shortcut">Press Ctrl+S to save quickly</span>
        </div>
      </div>
    </>
  );
};

export default ManageSiteAdvertisementsPage;
