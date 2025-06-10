import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';

const ClientLookupModal = ({ isOpen, onClose, clients }) => {
  const [filteredClients, setFilteredClients] = useState([]);
  const [filters, setFilters] = useState({
    client_code: '',
    client_name: '',
    main_address: '',
    contract_date: '',
    cas: '',
    user_license: '',
    training_days: '',
    sma_days: '',
    post_training_days: '',
    live: '',
    with_sma: '',
    fs_live: ''
  });
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    if (isOpen) {
      setFilteredClients(clients);
      setCurrentPage(1);
    }
  }, [isOpen, clients]);

  useEffect(() => {
    const newFiltered = clients.filter(client =>
      Object.entries(filters).every(([key, value]) => {
        const clientValue = client[key] || '';
        return String(clientValue).toLowerCase().includes(value.toLowerCase());
      })
    );

    if (sortConfig.key) {
      newFiltered.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredClients(newFiltered);
  }, [filters, clients, sortConfig]);

  const handleFilterChange = (e, key) => {
    setFilters({ ...filters, [key]: e.target.value });
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (column) => {
    if (sortConfig.key === column) {
      return sortConfig.direction === 'asc' ? <FontAwesomeIcon icon={faSortUp} /> : <FontAwesomeIcon icon={faSortDown} />;
    }
    return <FontAwesomeIcon icon={faSort} />;
  };

  const handleNextPage = () => {
    setCurrentPage(prevPage => prevPage + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage(prevPage => prevPage - 1);
  };

  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredClients.slice(startIndex, startIndex + itemsPerPage);
  };

  if (!isOpen) return null;

  const paginatedData = getPaginatedData();
  const totalItems = filteredClients.length;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const columns = [
    { key: 'client_code', label: 'Client Code' },
    { key: 'client_name', label: 'Client Name' },
    { key: 'main_address', label: 'Main Address' },
    { key: 'contract_date', label: 'Contract Date' },
    { key: 'cas', label: 'CAS' },
    { key: 'user_license', label: 'User License' },
    { key: 'training_days', label: 'Training Days' },
    { key: 'sma_days', label: 'SMA Days' },
    { key: 'post_training_days', label: 'Post Training Days' },
    { key: 'live', label: 'Live' },
    { key: 'with_sma', label: 'With SMA?' },
    { key: 'fs_live', label: 'FS Live?' }
  ];

  return (
    <div className="global-lookup-main-div-ui">
      <div className="global-lookup-div-ui max-w-6xl max-h-[100vh]">
        <button
          onClick={() => onClose(null)}
          className="global-lookup-button-close-ui"
        >
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </button>

        <h2 className="global-lookup-headertext-ui">All Clients</h2>

        <div className="global-lookup-table-main-div-ui max-h-[70vh] scroll-y-auto">
          <table className="global-lookup-table-div-ui">
            <thead className="global-lookup-thead-div-ui">
              <tr className="global-lookup-tr-ui">
                {columns.map(({ key, label }) => (
                  <th 
                    key={key} 
                    className="global-lookup-th-ui" 
                    onClick={() => handleSort(key)}
                  >
                    {label} {renderSortIcon(key)}
                  </th>
                ))}
              </tr>
              <tr className="global-lookup-tr-ui">
                {columns.map(({ key }) => (
                  <th key={`filter-${key}`} className="global-lookup-th-ui">
                    <input
                      type="text"
                      value={filters[key] || ''}
                      onChange={(e) => handleFilterChange(e, key)}
                      className="global-lookup-filter-text-ui"
                      placeholder={`Filter...`}
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedData.length > 0 ? (
                paginatedData.map((client, index) => (
                  <tr key={index} className="global-lookup-tr-ui">
                    {columns.map(({ key }) => (
                      <td key={`${index}-${key}`} className="global-lookup-td-ui">
                        {typeof client[key] === 'boolean' ? 
                          (client[key] ? 'Yes' : 'No') : 
                          (client[key] || 'N/A')}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="global-lookup-td-ui">
                    No matching clients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="global-lookup-footer-div-ui">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="global-lookup-footer-button-prevnext-ui"
          >
            Previous
          </button>
          <div className="global-lookup-count-ui">
            {startItem}-{endItem} of {totalItems}
          </div>
          <button
            onClick={handleNextPage}
            disabled={filteredClients.length <= currentPage * itemsPerPage}
            className="global-lookup-footer-button-prevnext-ui"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientLookupModal;