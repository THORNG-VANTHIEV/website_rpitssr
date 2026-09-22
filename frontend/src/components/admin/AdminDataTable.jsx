import React, { useState } from 'react';
import { Search, Plus, RefreshCw, ArrowLeftRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const AdminDataTable = ({
  title,
  subtitle,
  columns = [],
  data = [],
  loading = false,
  onAdd,
  addLabel,
  onRefresh,
  searchPlaceholder,
  customHeaderActions,
  keyField = 'id',
  hideSearch = false,
  hideHeader = false,
  fixedLayout = false,
  renderMobileCard,
}) => {
  const { currentLanguage } = useLanguage();
  const isKhmer = currentLanguage === 'km';
  const resolvedAddLabel = addLabel || (isKhmer ? 'បន្ថែមថ្មី' : 'Add New');
  const resolvedSearchPlaceholder = searchPlaceholder || (isKhmer ? 'ស្វែងរកទិន្នន័យ...' : 'Search records...');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter data based on search term
  const filteredData = data.filter((item) => {
    if (!searchTerm || hideSearch) return true;
    const term = searchTerm.toLowerCase();
    return Object.values(item).some((val) => {
      if (val === null || val === undefined) return false;
      if (typeof val === 'object') {
        return Object.values(val).some((sub) =>
          String(sub).toLowerCase().includes(term)
        );
      }
      return String(val).toLowerCase().includes(term);
    });
  });

  return (
    <div className="admin-card">
      {!hideHeader && (
        <div className="admin-card-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 className="admin-card-title">{title}</h3>
            {subtitle && (
              <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>
                {subtitle}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Real-time search */}
            {!hideSearch && (
              <div className="admin-search-wrapper">
                <Search className="admin-search-icon" size={16} />
                <input
                  type="text"
                  className="admin-search-input"
                  placeholder={resolvedSearchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            )}

          {onRefresh && (
            <button
              className="admin-btn admin-btn-outline"
              onClick={onRefresh}
              title={isKhmer ? 'ផ្ទុកទិន្នន័យឡើងវិញ' : 'Refresh Data'}
              disabled={loading}
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
          )}

          {customHeaderActions}

          {onAdd && (
            <button className="admin-btn admin-btn-primary" onClick={onAdd}>
              <Plus size={16} />
              <span>{resolvedAddLabel}</span>
            </button>
          )}
        </div>
      </div>
      )}

      {fixedLayout && (
        <div className="admin-table-scroll-hint">
          <ArrowLeftRight size={13} />
          <span>
            {isKhmer
              ? 'អូសទៅឆ្វេង/ស្តាំ ដើម្បីមើលជួរឈរទាំងអស់'
              : 'Swipe horizontally to view all columns'}
          </span>
        </div>
      )}

      <div className={`admin-table-container ${fixedLayout ? 'admin-table-container-fixed' : ''} ${renderMobileCard ? 'admin-table-hide-mobile' : ''}`}>
        <table className={`admin-table ${fixedLayout ? 'admin-table-fixed' : ''}`}>
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} style={{ width: col.width || 'auto', textAlign: col.align || 'left' }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '48px 16px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: 'var(--admin-text-muted)' }}>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>{isKhmer ? 'កំពុងផ្ទុកទិន្នន័យ...' : 'Loading data...'}</span>
                  </div>
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--admin-text-muted)' }}>
                  {searchTerm
                    ? (isKhmer ? `មិនមានទិន្នន័យត្រូវគ្នានឹង "${searchTerm}" ឡើយ` : `No records matching "${searchTerm}"`)
                    : (isKhmer ? 'មិនមានទិន្នន័យឡើយ' : 'No records found.')}
                </td>
              </tr>
            ) : (
              filteredData.map((row, rowIdx) => (
                <tr key={row[keyField] || rowIdx}>
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} style={{ textAlign: col.align || 'left' }}>
                      {col.render ? col.render(row, rowIdx) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View (Responsive on screens < 768px) */}
      {renderMobileCard && (
        <div className="admin-mobile-cards-container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--admin-text-muted)' }}>
              <RefreshCw size={20} className="animate-spin" style={{ display: 'inline-block', marginBottom: '8px' }} />
              <div>{isKhmer ? 'កំពុងផ្ទុកទិន្នន័យ...' : 'Loading data...'}</div>
            </div>
          ) : filteredData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--admin-text-muted)', fontSize: '0.88rem' }}>
              {searchTerm
                ? (isKhmer ? `មិនមានទិន្នន័យត្រូវគ្នានឹង "${searchTerm}" ឡើយ` : `No records matching "${searchTerm}"`)
                : (isKhmer ? 'មិនមានទិន្នន័យឡើយ' : 'No records found.')}
            </div>
          ) : (
            filteredData.map((row, rowIdx) => (
              <div key={row[keyField] || rowIdx} className="admin-mobile-card-item">
                {renderMobileCard(row, rowIdx)}
              </div>
            ))
          )}
        </div>
      )}

      <div style={{ padding: '12px 24px', borderTop: '1px solid var(--admin-border)', fontSize: '0.82rem', color: 'var(--admin-text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{isKhmer ? `បង្ហាញសរុប ${filteredData.length} ជួរដេក` : `Showing ${filteredData.length} records`}</span>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            style={{ background: 'none', border: 'none', color: 'var(--admin-accent)', cursor: 'pointer', fontWeight: '600' }}
          >
            {isKhmer ? 'សម្អាតការស្វែងរក' : 'Clear Search'}
          </button>
        )}
      </div>
    </div>
  );
};
