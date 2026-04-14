import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faBell, faUser, faSignOutAlt, faArrowLeft, faArrowUp, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useLocation } from "react-router-dom";
import { FaMinus, FaPlus } from "react-icons/fa";
import axios from 'axios';
import Swal from 'sweetalert2';
import bcrypt from 'bcryptjs';
import { Eye, EyeOff } from 'lucide-react'
import { FaTrash, FaDownload, FaEye } from 'react-icons/fa';
import { GetAPI } from '../api'; // Import all API utilities


import FileUpload from "./FileUpload";
import { FaDeleteLeft } from "react-icons/fa6";

import { BASE_URL } from '../api';  // Adjust path accordingly


const AddClientForm = () => {

  const [clientcontracts, setClientContracts] = useState({});

  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [currentFileType, setCurrentFileType] = useState('');
  const [fileSignedDate, setFileSignedDate] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedAttachmentType, setSelectedAttachmentType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showRemotePw, setShowRemotePw] = useState(false);
  const [showServerPw, setShowServerPw] = useState(false);

  const [isEditingHelpdesk, setIsEditingHelpdesk] = useState(false);

  const toggleFields = [
    { label: "Installed", key: "installed" },
    { label: "CAS", key: "cas" },
    { label: "EIS", key: "eis" },
    { label: "Live", key: "live" },
    { label: "SMA", key: "with_sma" },
    { label: "FS Live", key: "fs_live" },
    { label: "Active", key: "active" }
  ];

  const toggleVisibilityMap = {
    "FINANCIALS": ["installed", "cas", "eis", "live", "with_sma", "fs_live", "active"],
    "HR-PAY": ["installed", "live", "with_sma", "active"],
    "REALTY": ["installed", "live", "with_sma", "active"],
    "WMS": ["installed", "live", "with_sma", "active"],
    // add other tabs as needed
  };


  // Initialize all state at the top

  const [clientTechnicians, setClientTechnicians] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Initialize file states properly
  const [clientServiceFiles, setclientServiceFiles] = useState([]);
  const [turnOverFiles, setTurnOverFiles] = useState([]);
  const [smaInformationFiles, setSmaInformationFiles] = useState([]);
  const [pendingChanges, setPendingChanges] = useState({});
  const [applications, setApplications] = useState([]);
  const [editedFiles, setEditedFiles] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('')


  const [activeTab, setActiveTab] = useState("Contact Information");

  // START MODULE




  const mapTogglesToYN = (toggles) => ({
    installed: toggles.cas ? "Y" : "N",
    cas: toggles.cas ? "Y" : "N",
    eis: toggles.eis ? "Y" : "N",  // Add this line
    live: toggles.live ? "Y" : "N",
    with_sma: toggles.with_sma ? "Y" : "N",
    fs_live: toggles.fs_live ? "Y" : "N",
    active: toggles.active ? "Y" : "N"
  });

  const [activeTopTab, setActiveTopTab] = useState("FINANCIALS");
  const [tabTechnicians, setTabTechnicians] = useState({
    FINANCIALS: [""],
    "HR-PAY": [""],
    REALTY: [""],
    WMS: [""]
  });


  const [tabModules, setTabModules] = useState({
    "FINANCIALS": [],
    "HR-PAY": [],
    "REALTY": [],
    "WMS": [],
  });

  const [tabMainModules, setTabMainModules] = useState({

    "FINANCIALS": [
      "General Ledger",
      "Accounts Payable",
      "Sales",
      "Accounts Receivable",
      "Purchasing",
      "FG Inventory",
      "MS Inventory",
      "RM Inventory",
      "VE Inventory",],

    "HR-PAY": [
      "HR Management and Payroll",
      "HR Information System",],

    "REALTY": [
      "Realty",
      "In-House Financing"],

    "WMS": [
      "Inbound",
      "Outbound",
      "Other Activities",
      "Billing"],

  });

  const [tabOtherModules, setTabOtherModules] = useState({

    "FINANCIALS": [
      "Fixed Assets",
      "Budget",
      "Bank Recon",
      "Production",
      "Importation",
      "Financing",
      "Leasing",
      "Project Accounting",
      "BIR Tax Connect",
      "Financials - With Customization/s"
    ],

    "HR-PAY": [
      "Employee Portal",
      "Employee Portal Cloud",
      "Payroll - With Customization/s"],

    "REALTY": [
      "Realty - With Customization/s"],

    "WMS": [
      "WMS - With Customization/s"],


  });


  // Now you can safely access these
  const technicianInputs = tabTechnicians[activeTopTab] || [""];
  const selectedModules = tabModules[activeTopTab] || [];
  const [industries, setIndustries] = useState([]);


  const handleModuleToggle = (module) => {
    setTabModules(prev => {
      const current = prev[activeTopTab] || [];
      const updated = current.includes(module)
        ? current.filter(m => m !== module)
        : [...current, module];

      return {
        ...prev,
        [activeTopTab]: updated
      };
    });

    setPendingChanges(prev => {
      const current = (prev.modules?.[activeTopTab]) || [];
      const updated = current.includes(module)
        ? current.filter(m => m !== module)
        : [...current, module];

      return {
        ...prev,
        modules: {
          ...(prev.modules || {}),
          [activeTopTab]: updated
        }
      };
    });
  };

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        // const response = await axios.get('/api/client-industries', {
        const response = await axios.get('http://127.0.0.1:8000/api/client-industries', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.data) {
          setIndustries(response.data);
        }
      } catch (error) {
        console.error('Error fetching industries:', error);
      }
    };

    fetchIndustries();
  }, []);




  const handleTechnicianChange = (index, selectedName) => {
    const selectedCode = technicianCodeMap[selectedName];
    const displayValue = `${selectedName} (${selectedCode})`;

    setTabTechnicians(prev => {
      const newInputs = [...(prev[activeTopTab] || [])];
      newInputs[index] = displayValue;

      return {
        ...prev,
        [activeTopTab]: newInputs
      };
    });
  };

  const addTechnicianInput = () => {
    setTabTechnicians(prev => {
      const currentInputs = prev[activeTopTab] || [""];
      return {
        ...prev,
        [activeTopTab]: [...currentInputs, ""]
      };
    });
  };

  const removeTechnicianInput = (index) => {
    setTabTechnicians(prev => {
      const currentInputs = prev[activeTopTab] || [""];
      const newInputs = currentInputs.filter((_, i) => i !== index);
      return {
        ...prev,
        [activeTopTab]: newInputs.length > 0 ? newInputs : [""]
      };
    });
  };


  // END MODULE

  const [client, setClient] = useState({
    client_code: "",
    client_name: "",
    main_address: "",
    // contract_date: "",
    industry: "",
    remote_id: "",
    remote_pw: "",
    server_pw: "",
    helpdesk: "",
    app_type: "",
    parentCompanyCode: '',
    parentCompanyName: '',
    is_group: false,
    remarks: "",
    contact_persons: ["", ""]
  });
  const [loading, setLoading] = useState(false);


  // const [clientcontracts, setClientContracts] = useState({});


  const initialToggleState = {
    installed: false,
    cas: false,
    eis: false,
    live: false,
    with_sma: false,
    fs_live: false,
    active: false,
  };

  const [toggles, setToggles] = useState({
    "FINANCIALS": { ...initialToggleState },
    "HR-PAY": { ...initialToggleState },
    "REALTY": { ...initialToggleState },
    "WMS": { ...initialToggleState },
  });



  const technicians = [
    "Calvin Delabajan",
    "Danica Castillo",
    "Anjeaneth Alarcon",
    "Arvee Aurelio",
    "Jomel Mendoza",
    "Gerard Mendoza"
  ];

  const technicianCodeMap = {
    "Calvin Delabajan": "CPD",
    "Danica Castillo": "DGC",
    "Anjeaneth Alarcon": "MAA",
    "Arvee Aurelio": "AGA",
    "Jomel Mendoza": "JBM",
    "Gerard Mendoza": "GSM",
  };

  const codeToTechnicianMap = {
    "CPD": "Calvin Delabajan",
    "DGC": "Danica Castillo",
    "FLR": "France Rosimo",
    "MAA": "Anjeaneth Alarcon",
    "AGA": "Arvee Aurelio",
    "JBM": "Jomel Mendoza",
    "GSM": "Gerard Mendoza"
  };


  // 👇 PLACE THIS RIGHT BEFORE JSX
  const currentMainModules = tabMainModules[activeTopTab] || [];
  const currentOtherModules = tabOtherModules[activeTopTab] || [];
  const currentSelectedModules = tabModules[activeTopTab] || [];

  // Scroll handling
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.pageYOffset > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const contractsForTab = clientcontracts[activeTopTab];
    if (contractsForTab && contractsForTab.length > 0) {
      console.log('Ready to display:', contractsForTab);
    }
  }, [clientcontracts, activeTopTab]);


  // inside your component:
  // useEffect(() => {
  //   if (activeTab === "Attachment") {
  //     setSelectedAttachmentType("Client Service Form");
  //   }
  // }, [activeTab]);

  useEffect(() => {
    if (activeTab === "Attachment") {
      setSelectedAttachmentType("clientServiceForm");
    }
  }, [activeTab]);


  useEffect(() => {
    if (location.state) {
      setClient(location.state);
      setIsViewMode(true);
      fetchClientData(location.state.client_code, activeTopTab)
        .then(data => {
          if (data) {
            // Update tabModules for the active tab
            const modulesForTab = data.modules?.map(m => m.module_name) || [];
            setTabModules(prev => ({
              ...prev,
              [activeTopTab]: modulesForTab
            }));
          }
        })
        .catch(error => {
          console.error('Error fetching client data in useEffect:', error);
        });
    } else {
      // No location state? Fetch default client code
      fetchDefaultClientCode();
    }
  }, [location.state, activeTopTab]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await GetAPI("getClients");
      console.log("Full API response:", response);

      const payload = response?.data ?? response;

      let list = [];

      if (Array.isArray(payload)) {
        // e.g. API directly returns an array
        list = payload;
      } else if (Array.isArray(payload.data)) {
        // e.g. { success: true, data: [...] }
        list = payload.data;
      } else if (Array.isArray(payload.clients)) {
        // e.g. { success: true, clients: [...] }
        list = payload.clients;
      } else if (Array.isArray(payload.result)) {
        // just in case: { result: [...] }
        list = payload.result;
      } else {
        console.error("❌ Expected array but got:", payload);
        setClients([]);
        setFilteredClients([]);
        return;
      }

      // Optional filter
      const filtered = list.filter(c => (c.flag ?? "Y") === "Y");

      const sortedData = [...filtered].sort((a, b) =>
        (a.client_name || "").localeCompare(b.client_name || "")
      );

      setClients(sortedData);
      setFilteredClients(sortedData);
    } catch (error) {
      console.error("Error fetching clients:", error);
      setClients([]);
      setFilteredClients([]);
    } finally {
      setLoading(false);
    }
  };




  const openClientModal = () => {
    setShowModal(true);
    fetchClients();
  };



  // Fetch client files when client code changes
  useEffect(() => {
    if (client.client_code) {
      fetchClientFiles();
    }
  }, [client.client_code]);

  const [hasLoadedToggles, setHasLoadedToggles] = useState(false);

  useEffect(() => {
    const contract = clientcontracts[activeTopTab]?.[0];
    if (!contract) return;
    setToggles(prev => ({
      ...prev,
      [activeTopTab]: {
        installed: contract.installed === "Y",
        cas: contract.cas === "Y",
        fs_live: contract.fs_live === "Y",
        live: contract.live === "Y",
        with_sma: contract.with_sma === "Y",
        active: contract.active === "Y"
      }
    }));
  }, [clientcontracts, activeTopTab]);





  const fetchClientFiles = async () => {
    try {
      // const apiBase = '/api';
      const apiBase = 'http://127.0.0.1:8000/api';


      const [csResponse, toResponse, smaResponse] = await Promise.all([
        fetch(`${apiBase}/client-files/${client.client_code}/clientServiceForm`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`${apiBase}/client-files/${client.client_code}/turnOver`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`${apiBase}/client-files/${client.client_code}/smaInformation`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);


      const csData = await csResponse.json();
      const toData = await toResponse.json();
      const smaData = await smaResponse.json();

      // Ensure we're setting the full array of files, not merging
      if (csData.success) setclientServiceFiles(csData.files || []);
      if (toData.success) setTurnOverFiles(toData.files || []);
      if (smaData.success) setSmaInformationFiles(smaData.files || []);

    } catch (error) {
      console.error('Error fetching files:', error);
      // Optionally show error to user
      Swal.fire('Error', 'Failed to fetch files. Please try again.', 'error');
    }
  };



  const fetchClientData = async (clientCode, appType) => {
    console.log('[fetchClientData] Fetching data for client:', clientCode, appType);
    setIsLoading(true);

    // const apiBase = '/api';
    const apiBase = 'http://127.0.0.1:8000/api';

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      };

      const response = await fetch(`${apiBase}/load-client-data?client_code=${clientCode}&app_type=${appType}`, { headers });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Request failed:', errorText);
        if (response.status === 401) navigate('/login');
        throw new Error(errorText || 'Request failed');
      }

      const data = await response.json();
      console.log('Raw API response:', data);

      if (!data.success) {
        throw new Error(data.error || 'API request failed');
      }

      const receivedTechnicians = data.technicians || [];

      const filteredTechnicians = receivedTechnicians.filter(t => t.app_type === appType);

      const technicianDisplayNames = filteredTechnicians.map(tech => {
        const name = Object.entries(technicianCodeMap).find(([_, c]) => c === tech.tech_code)?.[0] || tech.tech_code;
        return `${name} (${tech.tech_code})`;
      });

      const clientData = data.clients || {};
      const contacts = data.client_contact || [];

      const contracts = Array.isArray(data.client_contract)
        ? data.client_contract
        : data.client_contract
          ? [data.client_contract]
          : [];

      const formatDate = (date) => {
        if (!date || date === '1900-01-01' || date === '0000-00-00') return null;
        const d = new Date(date);
        if (isNaN(d.getTime())) return null;
        const year = d.getFullYear();
        const month = (`0${d.getMonth() + 1}`).slice(-2);
        const day = (`0${d.getDate()}`).slice(-2);
        return `${year}-${month}-${day}`;
      };

      const contractsForAppType = contracts.filter(c => c.app_type === appType);
      const contractForAppType = contractsForAppType.length > 0 ? contractsForAppType[0] : null;

      const formattedContractsForAppType = contractsForAppType.map(c => ({
        ...c,
        contract_date: c.contract_date ? formatDate(c.contract_date) : null,
        sma_date: c.sma_date ? formatDate(c.sma_date) : null,
        date_issued: c.date_issued ? formatDate(c.date_issued) : null,
        effectivity_date: c.effectivity_date ? formatDate(c.effectivity_date) : null,
        casStatus: c.casStatus || '',
        ac_no: c.ac_no || '',
        release_no: c.release_no || ''
      }));

      setClientContracts(prev => ({
        ...prev,
        [appType]: formattedContractsForAppType.length > 0 ? formattedContractsForAppType : [{}]
      }));

      setToggles(prev => ({
        ...prev,
        [appType]: {
          installed: contractForAppType?.installed === "Y",
          cas: contractForAppType?.cas === "Y",
          eis: contractForAppType?.eis === "Y",
          fs_live: contractForAppType?.fs_live === "Y",
          live: contractForAppType?.live === "Y",
          with_sma: contractForAppType?.with_sma === "Y",
          active: contractForAppType?.active === "Y"
        }
      }));

      const transformedClient = {
        client_code: clientData.client_code || '',
        client_name: clientData.client_name || '',
        main_address: clientData.main_address || '',
        remarks: clientData.remarks || '',
        industry: clientData.industry || '',
        is_group: clientData.flag === 'Y',
        parentCompanyName: clientData.principal_client || '',
        parentCompanyCode: clientData.principal_client_code || '',
        remote_id: clientData.remote_id || '',
        remote_pw: clientData.remote_pw || '',
        server_pw: clientData.server_pw || '',
        helpdesk: clientData.helpdesk || '',
        app_type: clientData.appType || '',
        casStatus: clientData?.casStatus || '',
        ac_no: clientData.ac_no || '',
        date_issued: clientData.date_issued || '',
        release_no: clientData.release_no || '',
        effectivity_date: clientData.effectivity_date || '',

        client_contract: contractsForAppType.map(c => ({
          app_type: c.app_type,
          training_days: Number(c.training_days) || 0,
          training_days_consumed: Number(c.training_days_consumed) || 0,
          post_training_days: Number(c.post_training_days) || 0,
          post_training_days_consumed: Number(c.post_training_days_consumed) || 0,
          fs_generation_contract: Number(c.fs_generation_contract) || 0,
          fs_generation_consumed: Number(c.fs_generation_consumed) || 0,
          numberOfUsers: c.numberOfUsers || 0,
          numberOfEmployees: c.numberOfEmployees || 0,
          contract_date: formatDate(c.contract_date || ''),
          sma_date: formatDate(c.sma_date || ''),
          cas: c.cas || 'N',
          eis: c.eis || 'N',
          live: c.live || 'N',
          with_sma: c.with_sma || 'N',
          fs_live: c.fs_live || 'N',
          installed: c.installed || 'N',
          active: c.active || 'N',
          sma_days: Number(c.sma_days) || 0,
          sma_consumed: Number(c.sma_consumed) || 0,
          casStatus: c.casStatus || '',
          ac_no: c.ac_no || '',
          date_issued: formatDate(c.date_issued || ''),
          release_no: c.release_no || '',
          effectivity_date: formatDate(c.effectivity_date || '')
        }))
      };

      // setClient(transformedClient);


      setClient({
        ...transformedClient,
        contact_persons: contacts
      });


      setTabTechnicians(prev => ({
        ...prev,
        [appType]: [...technicianDisplayNames, ""]
      }));

      setClientTechnicians(receivedTechnicians.map(t => t.tech_code));

      setTabModules(prev => ({
        ...prev,
        [appType]: data.modules?.map(m => m.module_name) || []
      }));

      setApplications(data.applications || []);

      return data;

    } catch (error) {
      console.error('Error fetching client data:', error);
      alert(`Error loading client data: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };


  const fetchDefaultClientCode = async () => {
    try {
      // const apiBase = '/api';
      const apiBase = 'http://127.0.0.1:8000/api';

      const response = await fetch(`${apiBase}/clients/default-code`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success && data.client_code) {
        setClient(prev => ({
          ...prev,
          client_code: data.client_code
        }));
      } else {
        console.error('Failed to get default client code:', data.error);
      }
    } catch (error) {
      console.error('Error fetching default client code:', error);
    }
  };



  const handleLogout = () => {
    navigate("/");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };



  const handleToggle = (key) => {
    setToggles(prev => {
      const currentTabToggles = prev[activeTopTab] || { ...initialToggleState };
      const newValue = !currentTabToggles[key];
      return {
        ...prev,
        [activeTopTab]: {
          ...currentTabToggles,
          [key]: newValue,
        }
      };
    });

    // Also update clientcontracts immediately
    setClientContracts(prev => {
      const currentContracts = prev[activeTopTab] || [{ ...initialToggleState }];
      const updatedContract = {
        ...currentContracts[0],
        [key]: currentContracts[0][key] === "Y" ? "N" : "Y"
      };
      return {
        ...prev,
        [activeTopTab]: [updatedContract],
      };
    });
  };




  useEffect(() => {
    const contracts = clientcontracts[activeTopTab];
    if (contracts && contracts.length > 0) {
      const contract = contracts[0];  // take the first contract

      setToggles(prev => ({
        ...prev,
        [activeTopTab]: {
          ...prev[activeTopTab], // preserve previous toggle state
          installed: contract.installed === "Y",
          cas: contract.cas === "Y",
          eis: contract.eis === "Y",
          live: contract.live === "Y",
          with_sma: contract.with_sma === "Y",
          fs_live: contract.fs_live === "Y",
          active: contract.active === "Y"
        }
      }));
    }
  }, [clientcontracts, activeTopTab]);







  const toggleSelection = (item, list, setList) => {
    setList(prev => prev.includes(item)
      ? prev.filter(i => i !== item)
      : [...prev, item]
    );
  };

  const handleAddFileClick = (type) => {
    // Map UI labels to backend file types
    const typeMapping = {
      'Client Service Form': 'clientServiceForm',
      'Turn-Over Documents': 'turnOver',
      'SMA Information': 'smaInformation'
    };
    setCurrentFileType(typeMapping[type] || type);
    setShowFileModal(true);
  };

  // const handleFileSelect = async (files, uploadDate, signedDate) => {
  //   if (files.length === 0) return { success: false, message: 'No files selected' };

  //   // const apiBase = '/api';
  //   const apiBase = 'http://127.0.0.1:8000/api';



  //   setIsUploading(true);

  //   try {
  //     // Optimistic update - add temporary files
  //     const tempFiles = files.map(fileObj => ({
  //       id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  //       fileName: fileObj.file.name,
  //       uploadDate,
  //       signedDate,
  //       fileType: currentFileType,
  //       original_name: fileObj.file.name,
  //       status: 'uploading'
  //     }));

  //     // Update state immediately with temp files
  //     if (currentFileType === 'clientServiceForm') {
  //       setclientServiceFiles(prev => [...prev, ...tempFiles]);
  //     } else if (currentFileType === 'turnOver') {
  //       setTurnOverFiles(prev => [...prev, ...tempFiles]);
  //     } else if (currentFileType === 'smaInformation') {
  //       setSmaInformationFiles(prev => [...prev, ...tempFiles]);
  //     }

  //     // Upload files
  //     const results = [];
  //     for (const fileObj of files) {
  //       const file = fileObj.file;

  //       const idResponse = await fetch(`${apiBase}/generate-id`, {
  //         method: 'GET',
  //         headers: {
  //           'Accept': 'application/json',
  //           'Authorization': `Bearer ${localStorage.getItem('token')}`
  //         }
  //       });

  //       if (!idResponse.ok) throw new Error(`Server returned ${idResponse.status}`);

  //       const idData = await idResponse.json();
  //       if (!idData.success || !idData.file_id) {
  //         throw new Error(idData.message || 'Invalid ID received');
  //       }

  //       const formData = new FormData();
  //       formData.append('file', file);
  //       formData.append('file_id', idData.file_id);
  //       formData.append('client_code', client.client_code);
  //       formData.append('file_name', file.name);
  //       formData.append('file_type', currentFileType);
  //       formData.append('upload_date', uploadDate);
  //       formData.append('signed_date', signedDate || null);

  //       const uploadResponse = await fetch(`${apiBase}/upload`, {
  //         method: 'POST',
  //         body: formData,
  //         headers: {
  //           'Authorization': `Bearer ${localStorage.getItem('token')}`
  //         }
  //       });

  //       if (!uploadResponse.ok) throw new Error('Upload failed');
  //       const result = await uploadResponse.json();

  //       results.push({
  //         id: idData.file_id, // ✅ ADD THIS LINE
  //         file_id: idData.file_id,
  //         original_name: file.name,
  //         upload_date: uploadDate,
  //         signed_date: signedDate,
  //         file_type: currentFileType,
  //         path: result.path
  //       });
  //     }

  //     // After upload, update state with final files
  //     if (currentFileType === 'clientServiceForm') {
  //       setclientServiceFiles(prev => [
  //         ...prev.filter(f => !f.id?.includes('temp-')),
  //         ...results
  //       ]);
  //     } else if (currentFileType === 'turnOver') {
  //       setTurnOverFiles(prev => [
  //         ...prev.filter(f => !f.id?.includes('temp-')),
  //         ...results
  //       ]);
  //     } else if (currentFileType === 'smaInformation') {
  //       setSmaInformationFiles(prev => [
  //         ...prev.filter(f => !f.id?.includes('temp-')),
  //         ...results
  //       ]);
  //     }

  //     // Refresh files after upload
  //     await fetchClientFiles();

  //     Swal.fire({
  //       icon: 'success',
  //       title: 'Upload Complete',
  //       text: `${files.length} file(s) uploaded successfully`,
  //     });

  //     return { success: true, message: `${files.length} files uploaded successfully` };

  //   } catch (error) {
  //     console.error('Upload failed:', error);
  //     // Remove failed uploads from state
  //     if (currentFileType === 'clientServiceForm') {
  //       setclientServiceFiles(prev => prev.filter(f => !f.id?.includes('temp-')));
  //     } else if (currentFileType === 'turnOver') {
  //       setTurnOverFiles(prev => prev.filter(f => !f.id?.includes('temp-')));
  //     } else if (currentFileType === 'smaInformation') {
  //       setSmaInformationFiles(prev => prev.filter(f => !f.id?.includes('temp-')));
  //     }

  //     Swal.fire({
  //       icon: 'error',
  //       title: 'Upload Failed',
  //       text: error.message || 'Failed to upload files',
  //     });

  //     return { success: false, message: error.message || 'Upload failed' };
  //   } finally {
  //     setIsUploading(false);
  //   }
  // };

  const handleFileSelect = async (files, uploadDate, signedDate) => {
    if (!files || files.length === 0) {
      return { success: false, message: "No files selected" };
    }

    // const apiBase = "/api";
    const apiBase = 'http://127.0.0.1:8000/api';
    setIsUploading(true);

    try {
      const tempFiles = files.map(file => ({
        id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        original_name: file.name,
        upload_date: uploadDate,
        signed_date: signedDate,
        file_type: currentFileType,
        status: "uploading"
      }));

      if (currentFileType === "clientServiceForm") {
        setclientServiceFiles(prev => [...prev, ...tempFiles]);
      } else if (currentFileType === "turnOver") {
        setTurnOverFiles(prev => [...prev, ...tempFiles]);
      } else if (currentFileType === "smaInformation") {
        setSmaInformationFiles(prev => [...prev, ...tempFiles]);
      }

      const uploadedFiles = [];

      for (const file of files) {

        const idResponse = await fetch(`${apiBase}/generate-id`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        const idData = await idResponse.json();

        const formData = new FormData();
        formData.append("file", file); // ✅ real File object
        formData.append("file_id", idData.file_id);
        formData.append("client_code", client.client_code);
        formData.append("file_name", file.name);
        formData.append("file_type", currentFileType);
        formData.append("upload_date", uploadDate);
        

        const uploadResponse = await fetch(`${apiBase}/upload`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        const result = await uploadResponse.json();

        uploadedFiles.push({
          id: idData.file_id,
          file_id: idData.file_id,
          original_name: file.name,
          upload_date: uploadDate,
          signed_date: signedDate,
          file_type: currentFileType,
          path: result.path
        });
      }

      await fetchClientFiles();

      Swal.fire("Success", "Files uploaded successfully.", "success");

      return { success: true };

    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Upload failed.", "error");
      return { success: false };
    } finally {
      setIsUploading(false);
    }
  };



  const handleDeleteFile = async (file) => {
    const fileId = file.file_id || file.id || file.fileID;

    if (!fileId) {
      console.error("❌ No valid file ID found:", file);
      Swal.fire("Error", "Invalid file identifier.", "error");
      return;
    }

    const result = await Swal.fire({
      title: `Delete "${file.original_name}"?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      // const response = await axios.delete(`/api/files/${fileId}`, {
      const response = await axios.delete(`http://127.0.0.1:8000/api/files/${fileId}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        }
      });

      if (response.data.success) {
        Swal.fire("Deleted!", response.data.message, "success");
        fetchClientFiles(); // Refresh list
      } else {
        Swal.fire("Error", response.data.message, "error");
      }
    } catch (error) {
      console.error("Delete failed", error);
      Swal.fire("Error", "Failed to delete the file.", "error");
    }
  };


  const handleViewFile = async (file) => {

    const getApiBase = () => {
      // return '/api';
      return 'http://127.0.0.1:8000/api';
    };

    try {
      const apiBase = getApiBase();

      // First verify file exists
      const verifyResponse = await fetch(`${apiBase}/files/verify/${file.file_id || file.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!verifyResponse.ok) {
        throw new Error(`File verification failed with status ${verifyResponse.status}`);
      }

      const verifyData = await verifyResponse.json();
      if (!verifyData.exists) {
        throw new Error('File not found on server');
      }

      // Open file in new tab
      window.open(`${apiBase}/files/view/${file.file_id || file.id}`, '_blank');

    } catch (error) {
      console.error('View failed:', error);
      alert(`Cannot view file: ${error.message}`);
    }
  };

  const handleDownloadFile = async (file) => {
    const getApiBase = () => {
      // return '/api';
      return 'http://127.0.0.1:8000/api';
    };

    try {
      const apiBase = getApiBase();

      // First verify file exists
      const verifyResponse = await fetch(`${apiBase}/files/verify/${file.file_id || file.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!verifyResponse.ok) {
        throw new Error(`File verification failed with status ${verifyResponse.status}`);
      }

      const verifyData = await verifyResponse.json();
      if (!verifyData.exists) {
        throw new Error('File not found on server');
      }

      // Trigger download
      const link = document.createElement('a');
      link.href = `${apiBase}/files/download/${file.file_id || file.id}`;
      link.setAttribute('download', file.original_name || file.fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Download failed:', error);
      alert(`Download failed: ${error.message}`);
    }
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log(`handleChange: ${name} = ${value}`);

    // Fields related to contracts
    const contractFields = [
      'training_days',
      'training_days_consumed',
      'post_training_days',
      'post_training_days_consumed',
      'fs_generation_contract',
      'fs_generation_consumed',
      'numberOfUsers',
      'numberOfEmployees',
      'contract_date',
      'sma_date',
      'cas',
      'live',
      'with_sma',
      'fs_live',
      'installed',
      'active',
      'sma_days',
      'sma_consumed',
      'casStatus',
      'ac_no',
      'date_issued',
      'release_no',
      'effectivity_date'
    ];

    if (contractFields.includes(name)) {
      setClientContracts(prev => {
        const currentContracts = prev[activeTopTab] || [{
          app_type: activeTopTab,
          installed: "N",
          cas: "N",
          live: "N",
          with_sma: "N",
          fs_live: "N",
          active: "N",
          training_days: "",
          training_days_consumed: "",
          post_training_days: "",
          post_training_days_consumed: "",
          fs_generation_contract: "",
          fs_generation_consumed: "",
          numberOfUsers: "",
          numberOfEmployees: "",
          contract_date: '',
          sma_date: '',
          sma_days: "",
          sma_consumed: "",
          casStatus: "",
          ac_no: "",
          date_issued: "",
          release_no: "",
          effectivity_date: ""
        }];

        let updatedValue = value;

        // Convert numeric fields to numbers
        if (['training_days', 'training_days_consumed', 'post_training_days', 'post_training_days_consumed', 'fs_generation_contract', 'fs_generation_consumed', 'numberOfUsers', 'numberOfEmployees', 'sma_days', 'sma_consumed'].includes(name)) {
          updatedValue = Number(value);
        }

        // For toggles stored as "Y"/"N", normalize values here if needed
        if (['insta;;ed', 'cas', 'live', 'with_sma', 'fs_live', 'active'].includes(name)) {
          // Optional: allow "Y"/"N" toggle or from checkbox (true/false)
          if (type === 'checkbox') {
            updatedValue = checked ? "Y" : "N";
          } else {
            // if user types "Y"/"N" or other input, keep as is
            updatedValue = value.toUpperCase() === "Y" ? "Y" : "N";
          }
        }

        const updatedContract = {
          ...currentContracts[0],
          [name]: updatedValue,
        };

        return {
          ...prev,
          [activeTopTab]: [updatedContract],
        };
      });
    } else {
      // For non-contract fields, update client object
      setClient(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePassword = async (e) => {
    const { name, value } = e.target;

    // Hash only the password fields
    if (name === "remote_pw" || name === "server_pw") {
      const hashedValue = await bcrypt.hash(value, 10);
      setClient(prev => ({
        ...prev,
        [name]: hashedValue
      }));
    } else {
      setClient(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const syncTogglesToContracts = () => {
    setClientContracts(prev => {
      const updated = { ...prev };
      const currentToggles = toggles[activeTopTab] || {};

      // Generate new contract data with toggles
      const newContract = {
        ...updated[activeTopTab]?.[0], // existing contract
        installed: currentToggles.cas ? "Y" : "N",
        cas: currentToggles.cas ? "Y" : "N",
        eis: currentToggles.eis ? "Y" : "N",
        live: currentToggles.live ? "Y" : "N",
        with_sma: currentToggles.with_sma ? "Y" : "N",
        fs_live: currentToggles.fs_live ? "Y" : "N",
        active: currentToggles.active ? "Y" : "N"
      };
      updated[activeTopTab] = [newContract];
      return updated;
    });
  };


  const handleSave = async () => {
    // Step 1: Synchronize toggle states into clientcontracts
    syncTogglesToContracts();

    // Step 2: Prepare data payloads



    // Map for module codes
    const moduleCodeMap = {
      'General Ledger': 'GL',
      'Accounts Payable': 'AP',
      'Sales': 'SA',
      'Accounts Receivable': 'AR',
      'Purchasing': 'PUR',
      'FG Inventory': 'FGINV',
      'MS Inventory': 'MSINV',
      'RM Inventory': 'RMINV',
      'VE Inventory': 'VEINV',
      'Fixed Assets': 'FA',
      'Budget': 'BUD',
      'Bank Recon': 'BR',
      'Production': 'PROD',
      'Importation': 'IMP',
      'Financing': 'FIN',
      'Leasing': 'LS',
      "Project Accounting": 'PRJ',
      'BIR Tax Connect': 'TC',
      'HR Management and Payroll': 'HRPAY',
      'HR Information System': 'HRIS',
      'Employee Portal': 'HRPortal',
      'Employee Portal Cloud': 'HRPortalCloud',
      'Realty': 'REALTY',
      'In-House Financing': 'INHOUSE',
      'Inbound': 'INB',
      'Outbound': 'OUTB',
      'Other Activities': 'OTH',
      'Billing': 'AR',
      'Financials - With Customization/s': 'FINCustom',
      'Payroll - With Customization/s': 'HRCustom',
      'WMS - With Customization/s': 'WMSCustom',
      'Realty - With Customization/s': 'REALTYCustom',
    };

    try {
      setIsSaving(true);

      // 3. Prepare Technicians Payload
      const techniciansToSave = (tabTechnicians[activeTopTab] || []).filter(t => t !== "");
      const clientTechnicalsPayload = Object.entries(tabTechnicians).flatMap(([appType, techs]) =>
        techs
          .filter(t => t !== "")
          .map(t => {
            const matches = t.match(/\(([^)]+)\)/);
            const tech_code = matches ? matches[1] : t;
            return { tech_code, app_type: appType };
          })
      );

      // 4. Prepare Modules Payload
      const currentMainModules = tabMainModules[activeTopTab] || [];
      const currentOtherModules = tabOtherModules[activeTopTab] || [];
      const currentSelectedModules = tabModules[activeTopTab] || [];

      const clientModulesPayload = Object.entries(tabModules).flatMap(([appType, selectedModules]) => {
        const allowedModules = [
          ...(tabMainModules[appType] || []),
          ...(tabOtherModules[appType] || []),
        ];
        return selectedModules
          .filter(moduleName => allowedModules.includes(moduleName))
          .map(moduleName => ({
            module_name: moduleName,
            module_code: moduleCodeMap[moduleName] || null,
            module_type: appType,
          }));
      });

      // 5. Prepare Contract Payload
      const currentContract = clientcontracts[activeTopTab]?.[0] || {};

      const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        if (isNaN(d)) return '';
        const year = d.getFullYear();
        const month = (`0${d.getMonth() + 1}`).slice(-2);
        const day = (`0${d.getDate()}`).slice(-2);
        return `${year}-${month}-${day}`;
      };

      const contractPayload = [{
        app_type: activeTopTab,
        training_days: Number(currentContract.training_days) || 0,
        training_days_consumed: Number(currentContract.training_days_consumed) || 0,
        post_training_days: Number(currentContract.post_training_days) || 0,
        post_training_days_consumed: Number(currentContract.post_training_days_consumed) || 0,
        fs_generation_contract: Number(currentContract.fs_generation_contract) || 0,
        fs_generation_consumed: Number(currentContract.fs_generation_consumed) || 0,
        numberOfUsers: Number(currentContract.numberOfUsers) || 0,
        numberOfEmployees: Number(currentContract.numberOfEmployees) || 0,
        contract_date: formatDate(currentContract.contract_date),
        sma_date: formatDate(currentContract.sma_date),
        installed: currentContract.installed || 'N',
        cas: currentContract.cas || 'N',
        eis: currentContract.eis || 'N',
        live: currentContract.live || 'N',
        with_sma: currentContract.with_sma || 'N',
        fs_live: currentContract.fs_live || 'N',
        active: currentContract.active || 'N',
        sma_days: Number(currentContract.sma_days) || 0,
        sma_consumed: Number(currentContract.sma_consumed) || 0,
        casStatus: currentContract.casStatus || '',
        ac_no: currentContract.ac_no || '',
        date_issued: formatDate(currentContract.date_issued),
        release_no: currentContract.release_no || '',
        effectivity_date: formatDate(currentContract.effectivity_date),
      }];

      // 6. Prepare Contact Persons Payload
      const contactPersonsPayload = (client.contact_persons || [])
        .filter(p => p.contact_person?.trim())
        .map(p => ({
          client_code: client.client_code,
          contact_person: p.contact_person?.trim() || '',
          position: p.position?.trim() || '',
          contact_no: p.contact_no?.trim() || '',
          email_add: p.email_add?.trim() || ''
        }));

      // 7. Prepare Final Payload
      const payload = {
        mode: 'Upsert',
        params: JSON.stringify({
          json_data: {
            client: {
              client_code: client.client_code,
              client_name: client.client_name,
              main_address: client.main_address,
              remarks: client.remarks || '',
              industry: client.industry,
              flag: client.is_group ? 'Y' : 'N',
              principal_client: client.parentCompanyName || '',
              principal_client_code: client.parentCompanyCode || '',
              remote_id: client.remote_id,
              remote_pw: client.remote_pw,
              server_pw: client.server_pw,
              helpdesk: client.helpdesk,
            },
            modules: clientModulesPayload,
            technicals: clientTechnicalsPayload,
            contracts: contractPayload,
            contacts: contactPersonsPayload,
          },
        }),
      };

      // 8. API Call
      // const apiBase = '/api';
      const apiBase = 'http://127.0.0.1:8000/api';
      const response = await axios.post(`${apiBase}/client/save`, payload, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Client data saved successfully',
        });
      } else {
        throw new Error(response.data.message || 'Save failed');
      }
    } catch (error) {
      console.error('Save error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Error saving client: ${error.message}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateContactField = (index, field, value) => {
    setClient(prev => {
      const updated = [...(prev.contact_persons || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, contact_persons: updated };
    });
  };

  const addNewContact = () => {
    setClient(prev => ({
      ...prev,
      contact_persons: [
        ...(prev.contact_persons || []),
        {
          client_code: prev.client_code, // ✅ ensure client_code is included
          contact_person: '',
          position: '',
          contact_no: '',
          email_add: ''
        }
      ]
    }));
  };


  const removeContact = (index) => {
    setClient(prev => {
      const updated = [...(prev.contact_persons || [])];
      updated.splice(index, 1);
      return { ...prev, contact_persons: updated };
    });
  };


  // const currentContract = clientcontracts[activeTopTab]?.[0] || {};
  const emptyContract = {
    contract_date: "",
    sma_date: "",
    numberOfUsers: "",
    numberOfEmployees: "",
    training_days: "",
    training_days_consumed: "",
    post_training_days: "",
    post_training_days_consumed: "",
    fs_generation_contract: "",
    fs_generation_consumed: "",
    sma_days: "",
    sma_consumed: "",
    casStatus: "",
    ac_no: "",
    date_issued: "",
    release_no: "",
    effectivity_date: "",
    installed: "N",
    cas: "N",
    eis: "N",
    live: "N",
    with_sma: "N",
    fs_live: "N",
    active: "N",
  };

  const currentContract =
    clientcontracts[activeTopTab]?.[0] ?? emptyContract;



  return (
    <div className="p-4 bg-white min-h-screen">

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 w-64 animate-fade-in">
            {/* Spinner */}
            <div className="relative h-12 w-12">
              <div className="absolute inset-0 rounded-full border-4 border-blue-800 border-t-transparent animate-spin"></div>
              <div className="absolute inset-1 bg-white rounded-full"></div>
            </div>

            {/* Loading Text */}
            <p className="text-gray-800 text-center text-base font-medium">Loading client data...</p>
          </div>
        </div>
      )}


      {/* File Upload Modal */}
      <FileUpload
        isOpen={showFileModal}
        onClose={() => {
          setShowFileModal(false);
          setFileSignedDate("");
        }}
        onFileSelect={async (files, uploadDate, signedDate) => {
          const result = await handleFileSelect(files, uploadDate, signedDate);
          if (result.success) {
            setShowFileModal(false);
            setFileSignedDate("");
            fetchClientFiles();
          }
          return result;
        }}
        isLoading={isUploading}
      />

      {showScrollButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors duration-200 z-50"
          aria-label="Scroll to top"
        >
          <FontAwesomeIcon icon={faArrowUp} className="w-5 h-5" />
        </button>
      )}

      {/* Header */}
      <div className="absolute top-6 right-6 flex items-center space-x-4">
        <FontAwesomeIcon icon={faBell} className="w-5 h-5 text-gray-500 cursor-pointer" />
        <div className="relative">
          <div className="cursor-pointer" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <img src="3135715.png" alt="Profile" className="w-8 h-8 rounded-full" />
          </div>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
              <ul className="py-2 text-gray-700">
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center">
                  <FontAwesomeIcon icon={faUser} className="mr-2" /> Profile
                </li>
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                  onClick={handleLogout}
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" /> Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Back Arrow */}
      <button onClick={() => navigate("/dashboard")} className="flex items-center text-gray-700 hover:text-black mb-6">
        <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5 mr-2" />
        <span>Back to Dashboard</span>
      </button>

      {/* Title */}
      <div className="sticky top-0 z-50 bg-blue-600 shadow-xl p-4 mb-6 rounded-lg text-white">
        <h1 className="text-xl font-semibold">
          {isViewMode
            ? `Client Information${client.client_name ? `: ${client.client_name}` : ""}`
            : "Add New Client Information"}
        </h1>
      </div>



      <div className="bg-white shadow-xl p-6 rounded-lg">
        {/* Basic Client Info */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4 text-sm">
          <div className="md:col-span-1">
            <label className="block font-bold text-gray-800 mb-2">Client Code</label>
            <input
              type="text"
              name="client_code"
              value={client.client_code || ""}
              onChange={handleChange}
              disabled
              className="mt-1 p-2 border border-gray-300 rounded-lg w-full bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div className="md:col-span-5">
            <label className="block font-bold text-gray-800 mb-2 text-sm">Client Name</label>
            <input
              type="text"
              name="client_name"
              value={client.client_name || ""}
              onChange={handleChange}
              className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
            />
          </div>

        </div>

        {/* Industry and Group Section */}
        <div className="grid grid-cols-[300px_100px_250px_1fr] gap-2 mb-4">

          {/* Industry */}
          <div className="text-sm">
            <label className="block font-bold text-gray-800 mb-1 text-sm">Industry</label>
            <select
              name="industry"
              value={client.industry || ""}
              onChange={handleChange}
              className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
            >
              <option value="">Select an industry</option>
              {industries.map((item) => (
                <option key={item.code} value={item.industry}>
                  {item.industry}
                </option>
              ))}
            </select>
          </div>

          {/* Group Dropdown */}
          <div className="text-sm">
            <label className="block font-bold text-gray-800 mb-1 text-sm">Group</label>
            <select
              name="is_group"
              value={client.is_group ? "Yes" : "No"}
              onChange={(e) =>
                setClient((prev) => ({
                  ...prev,
                  is_group: e.target.value === "Yes",
                  parentCompanyCode: e.target.value === "Yes" ? prev.client_code : '',
                  parentCompanyName: e.target.value === "Yes" ? prev.client_name : '',
                }))
              }
              className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>

          {/* Parent Company Code */}
          <div className="text-sm" style={{ width: "250px" }}>
            <label className="block font-bold text-gray-800 mb-2 text-sm">Parent Company Code</label>
            <div className="flex relative">
              <input
                type="text"
                value={client.parentCompanyCode}
                readOnly
                className="p-2 border border-gray-300 rounded-l-lg w-full cursor-pointer bg-white"
                onClick={() => setShowModal(true)}
              />

              <button
                type="button"
                onClick={openClientModal}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r-lg"
              >
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </button>
            </div>
          </div>

          {/* Parent Company Name */}
          <div className="text-sm relative w-full">
            <label className="block font-bold text-gray-800 mb-1 text-sm">Parent Company Name</label>
            <input
              type="text"
              name="group_name"
              value={client.parentCompanyName}
              onChange={handleChange}
              className="mt-1 p-2 border border-gray-300 rounded-lg w-full pr-8"
            />

            {/* X button to clear */}
            {client.parentCompanyName && (
              <button
                type="button"
                onClick={() =>
                  setClient(prev => ({
                    ...prev,
                    is_group: false,
                    parentCompanyCode: '',
                    parentCompanyName: '',
                  }))
                }
                className="absolute right-2 top-[38px] text-gray-400 hover:text-red-600"
              >
                <FontAwesomeIcon icon={faTimesCircle} />
              </button>
            )}
          </div>



        </div>



        {/* Address */}
        <div className="mb-4 text-sm">
          <label className="block font-bold text-gray-800 mb-2 text-sm">Address</label>
          <textarea
            type="text"
            name="main_address"
            value={client.main_address || ""}
            onChange={handleChange}
            className="mt-1 p-2 border border-gray-300 rounded-lg w-full h-[80px] text-sm"
          />
        </div>

        {/* Remarks */}
        <div className="mb-4 text-sm">
          <label className="block font-bold text-gray-800 mb-2 text-sm">Remarks</label>
          <textarea
            type="text"
            name="remarks"
            value={client.remarks || ""}
            onChange={handleChange}
            className="mt-1 p-2 border border-gray-300 rounded-lg w-full h-[80px] text-sm"
          />
        </div>

        {/* APPLICATION TABS */}
        <div className="mt-6 text-sm lg:text-base bg-blue-100 rounded-xl">
          <div className="grid grid-cols-2 sm:flex sm:justify-between bg-blue-600 text-white rounded-t-xl px-2 py-2 gap-2">
            {["FINANCIALS", "HR-PAY", "REALTY", "WMS"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTopTab(tab)}
                className={`w-full text-center px-4 py-2 font-semibold rounded-t-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white
          ${activeTopTab === tab
                    ? "bg-white text-blue-600 shadow-md"
                    : "opacity-80 hover:opacity-100"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>


          {/* Financials Content */}
          {activeTopTab === "FINANCIALS" && (
            <div className="p-4 space-y-6">

              {/* Contract Details + Toggles in One Row */}
              <div className="flex flex-col lg:flex-row gap-6">

                {/* Contract Section */}
                <div className="flex-2 bg-white rounded-xl shadow p-4 border">
                  <h2 className="text-base font-semibold text-blue-800 mb-4">Contract Details</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Signed Contract Date</label>
                      <input
                        type="date"
                        name="contract_date"
                        value={currentContract.contract_date ?? ''}
                        onChange={handleChange}
                        className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">No. of Users</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        name="numberOfUsers"
                        value={currentContract.numberOfUsers ?? ''}
                        onChange={handleChange}
                        className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* SMA Info */}
                <div className="flex-1 bg-white rounded-xl shadow p-4 border">
                  <h2 className="text-base font-semibold text-blue-800 mb-4">SMA Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-1 xl:grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SMA Renewal Date</label>
                      <input
                        type="date"
                        name="sma_date"
                        value={currentContract.sma_date ?? ''}
                        onChange={handleChange}
                        className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    {/* <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">SMA Days</label>
        <input
          type="number"
          placeholder="0.00"
          name="sma_days"
          value={currentContract.sma_days ?? ''}
          onChange={handleChange}
          className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
        />
      </div> */}
                  </div>
                </div>

                {/* Toggles */}
                <div className="w-full lg:w-2/5 bg-white rounded-xl shadow p-4 border">
                  <h2 className="text-base font-semibold text-blue-800 mb-4">Status Flags</h2>
                  <div className="flex flex-wrap justify-center gap-2">
                    {toggleFields
                      .filter(({ key }) => (toggleVisibilityMap[activeTopTab] ?? []).includes(key))
                      .map(({ label, key }) => (
                        <div key={key} className="flex flex-col items-center w-16">
                          <span className="text-sm font-medium text-gray-600 text-center">{label}</span>
                          <button
                            className={`relative w-10 h-6 transition duration-200 ease-in-out rounded-full ${toggles[activeTopTab]?.[key] ? 'bg-blue-500' : 'bg-gray-300'
                              }`}
                            onClick={() => handleToggle(key)}
                          >
                            <span
                              className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${toggles[activeTopTab]?.[key] ? 'translate-x-4' : ''
                                }`}
                            />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>

              </div>

              {/* //ac no//dateissue//releaseno//effectivity */}

              {/* BIR CAS Information Section */}
              {currentContract.cas === 'Y' && (
                <div className="bg-white rounded-xl shadow p-4 border">
                  <h2 className="text-base font-semibold text-blue-800 mb-4">BIR CAS Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-blue-700 mb-1">CAS Status</label>
                      <select
                        name="casStatus"
                        value={currentContract.casStatus || ''}
                        onChange={handleChange}
                        className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="Pending">Pending Master Data</option>
                        <option value="Ongoing">Ongoing Documentation</option>
                        <option value="Completed">Completed Documentation</option>
                        <option value="Waiting">Waiting BIR Approval</option>
                        <option value="Approved">Approved</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-blue-700 mb-1">Acknowledgement Certificate No.</label>
                      <input
                        type="text"
                        name="ac_no"
                        value={currentContract.ac_no || ''}
                        onChange={handleChange}
                        className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-blue-700 mb-1">Date Issued</label>
                      <input
                        type="date"
                        name="date_issued"
                        value={currentContract.date_issued || ''}
                        onChange={handleChange}
                        className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-blue-700 mb-1">Release No.</label>
                      <input
                        type="text"
                        name="release_no"
                        value={currentContract.release_no || ''}
                        onChange={handleChange}
                        className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-blue-700 mb-1">Effectivity Date</label>
                      <input
                        type="date"
                        name="effectivity_date"
                        value={currentContract.effectivity_date || ''}
                        onChange={handleChange}
                        className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
              {/* </div> */}

              {/* Training Days Section */}
              <div className="bg-white rounded-xl shadow p-4 border">
                <h2 className="text-base font-semibold text-blue-800 mb-4">Contract Mandays</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Training Days */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Training Days</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      name="training_days"
                      value={currentContract.training_days ?? ''}
                      onChange={handleChange}
                      className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-blue-700 mb-1">(Consumed)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      name="training_days_consumed"
                      value={currentContract.training_days_consumed ?? ''}
                      onChange={handleChange}
                      className="w-full h-10 px-3 border border-blue-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-blue-700 mb-1">Balance</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={
                        (currentContract.training_days || 0) -
                        (currentContract.training_days_consumed || 0)
                      }
                      readOnly
                      className="w-full h-10 px-3 border border-blue-300 rounded-md text-sm bg-gray-100 text-gray-600"
                    />
                  </div>


                  {/* Post Training Days */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Post Training Days</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      name="post_training_days"
                      value={currentContract.post_training_days ?? ''}
                      onChange={handleChange}
                      className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-blue-700 mb-1">(Consumed)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      name="post_training_days_consumed"
                      value={currentContract.post_training_days_consumed ?? ''}
                      onChange={handleChange}
                      className="w-full h-10 px-3 border border-blue-300 rounded-md text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-blue-700 mb-1">Balance</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={
                        (currentContract.post_training_days || 0) -
                        (currentContract.post_training_days_consumed || 0)
                      }
                      readOnly
                      className="w-full h-10 px-3 border border-blue-300 rounded-md text-sm bg-gray-100 text-gray-600"
                    />
                  </div>


                  {/* FS Generation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">FS Generation</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      name="fs_generation_contract"
                      value={currentContract.fs_generation_contract ?? ''}
                      onChange={handleChange}
                      className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-blue-700 mb-1">(Consumed)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      name="fs_generation_consumed"
                      value={currentContract.fs_generation_consumed ?? ''}
                      onChange={handleChange}
                      className="w-full h-10 px-3 border border-blue-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-blue-700 mb-1">Balance</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={
                        (currentContract.fs_generation_contract || 0) -
                        (currentContract.fs_generation_consumed || 0)
                      }
                      readOnly
                      className="w-full h-10 px-3 border border-blue-300 rounded-md text-sm bg-gray-100 text-gray-600"
                    />
                  </div>

                  {/* SMA Days */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SMA Days</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      name="sma_days"
                      value={currentContract.sma_days ?? ''}
                      onChange={handleChange}
                      // readOnly
                      className="w-full h-10 px-3 border border-blue-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-blue-700 mb-1">(Consumed)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      name="sma_consumed"
                      value={currentContract.sma_consumed ?? ''}
                      onChange={handleChange}
                      className="w-full h-10 px-3 border border-blue-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-blue-700 mb-1">Balance</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={
                        (currentContract.sma_days || 0) -
                        (currentContract.sma_consumed || 0)
                      }
                      readOnly
                      className="w-full h-10 px-3 border border-blue-300 rounded-md text-sm bg-gray-100 text-gray-600"
                    />
                  </div>

                </div>
              </div>



            </div>
          )}



          {/* HRPAY Content */}
          {activeTopTab === "HR-PAY" && (
            <div className="p-4 space-y-6">


              {/* Contract Details + Toggles in One Row */}
              <div className="flex flex-col lg:flex-row gap-6">

                {/* Contract Section */}
                <div className="flex-2 bg-white rounded-xl shadow p-4 border">
                  <h2 className="text-base font-semibold text-blue-800 mb-4">Contract Details</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Signed Contract Date</label>
                      <input
                        type="date"
                        name="contract_date"
                        value={currentContract.contract_date ?? ''}
                        onChange={handleChange}
                        className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">No. of Users</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        name="numberOfUsers"
                        value={currentContract.numberOfUsers ?? ''}
                        onChange={handleChange}
                        className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">No. of Employees</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        name="numberOfEmployees"
                        value={currentContract.numberOfEmployees ?? ''}
                        onChange={handleChange}
                        className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* SMA Info */}
                <div className="flex-1 bg-white rounded-xl shadow p-4 border">
                  <h2 className="text-base font-semibold text-blue-800 mb-4">SMA Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-1 xl:grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SMA Renewal Date</label>
                      <input
                        type="date"
                        name="sma_date"
                        value={currentContract.sma_date ?? ''}
                        onChange={handleChange}
                        className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    {/* <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">SMA Days</label>
        <input
          type="number"
          placeholder="0.00"
          name="sma_days"
          value={currentContract.sma_days ?? ''}
          onChange={handleChange}
          className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
        />
      </div> */}
                  </div>
                </div>

                {/* Toggles */}
                <div className="w-full lg:w-1/4 bg-white rounded-xl shadow p-4 border">
                  <h2 className="text-base font-semibold text-blue-800 mb-4">Status Flags</h2>
                  <div className="flex flex-wrap justify-center gap-2">
                    {toggleFields
                      .filter(({ key }) => (toggleVisibilityMap[activeTopTab] ?? []).includes(key))
                      .map(({ label, key }) => (
                        <div key={key} className="flex flex-col items-center w-20">
                          <span className="text-sm font-medium text-gray-600 text-center">{label}</span>
                          <button
                            className={`relative w-10 h-6 transition duration-200 ease-in-out rounded-full ${toggles[activeTopTab]?.[key] ? 'bg-blue-500' : 'bg-gray-300'
                              }`}
                            onClick={() => handleToggle(key)}
                          >
                            <span
                              className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${toggles[activeTopTab]?.[key] ? 'translate-x-4' : ''
                                }`}
                            />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>

              </div>


              {/* Training Days Section */}
              <div className="bg-white rounded-xl shadow p-4 border">
                <h2 className="text-base font-semibold text-blue-800 mb-4">Contract Mandays</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Training Days */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Training Days</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      name="training_days"
                      value={currentContract.training_days ?? ''}
                      onChange={handleChange}
                      className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-blue-700 mb-1">(Consumed)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      name="training_days_consumed"
                      value={currentContract.training_days_consumed ?? ''}
                      onChange={handleChange}
                      className="w-full h-10 px-3 border border-blue-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-blue-700 mb-1">Balance</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={
                        (currentContract.training_days || 0) -
                        (currentContract.training_days_consumed || 0)
                      }
                      readOnly
                      className="w-full h-10 px-3 border border-blue-300 rounded-md text-sm bg-gray-100 text-gray-600"
                    />
                  </div>

                  {/* Post Training Days */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Post Training Days</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      name="post_training_days"
                      value={currentContract.post_training_days ?? ''}
                      onChange={handleChange}
                      className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-blue-700 mb-1">(Consumed)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      name="post_training_days_consumed"
                      value={currentContract.post_training_days_consumed ?? ''}
                      onChange={handleChange}
                      className="w-full h-10 px-3 border border-blue-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-blue-700 mb-1">Balance</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={
                        (currentContract.post_training_days || 0) -
                        (currentContract.post_training_days_consumed || 0)
                      }
                      readOnly
                      className="w-full h-10 px-3 border border-blue-300 rounded-md text-sm bg-gray-100 text-gray-600"
                    />
                  </div>


                  {/* SMA Days */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SMA Days</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      name="sma_days"
                      value={currentContract.sma_days ?? ''}
                      onChange={handleChange}
                      // readOnly
                      className="w-full h-10 px-3 border border-blue-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-blue-700 mb-1">(Consumed)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      name="sma_consumed"
                      value={currentContract.sma_consumed ?? ''}
                      onChange={handleChange}
                      className="w-full h-10 px-3 border border-blue-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-blue-700 mb-1">Balance</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={
                        (currentContract.sma_days || 0) -
                        (currentContract.sma_consumed || 0)
                      }
                      readOnly
                      className="w-full h-10 px-3 border border-blue-300 rounded-md text-sm bg-gray-100 text-gray-600"
                    />
                  </div>
                </div>
              </div>



            </div>
          )}

          {/* REALTY Content */}
          {activeTopTab === "REALTY" && (
            <div className="p-4 space-y-6">

              {/* Contract Details + Toggles in One Row */}
              <div className="flex flex-col lg:flex-row gap-6">

                {/* Contract Section */}
                <div className="flex-2 bg-white rounded-xl shadow p-4 border">
                  <h2 className="text-base font-semibold text-blue-800 mb-4">Contract Details</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Signed Contract Date</label>
                      <input
                        type="date"
                        name="contract_date"
                        value={currentContract.contract_date ?? ''}
                        onChange={handleChange}
                        className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">No. of Users</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        name="numberOfUsers"
                        value={currentContract.numberOfUsers ?? ''}
                        onChange={handleChange}
                        className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                      />
                    </div>

                  </div>
                </div>

                {/* SMA Info */}
                <div className="flex-1 bg-white rounded-xl shadow p-4 border">
                  <h2 className="text-base font-semibold text-blue-800 mb-4">SMA Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-1 xl:grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SMA Renewal Date</label>
                      <input
                        type="date"
                        name="sma_date"
                        value={currentContract.sma_date ?? ''}
                        onChange={handleChange}
                        className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    {/* <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">SMA Days</label>
        <input
          type="number"
          placeholder="0.00"
          name="sma_days"
          value={currentContract.sma_days ?? ''}
          onChange={handleChange}
          className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
        />
      </div> */}
                  </div>
                </div>

                {/* Toggles */}
                <div className="w-full lg:w-1/4 bg-white rounded-xl shadow p-4 border">
                  <h2 className="text-base font-semibold text-blue-800 mb-4">Status Flags</h2>
                  <div className="flex flex-wrap justify-center gap-2">
                    {toggleFields
                      .filter(({ key }) => (toggleVisibilityMap[activeTopTab] ?? []).includes(key))
                      .map(({ label, key }) => (
                        <div key={key} className="flex flex-col items-center w-20">
                          <span className="text-sm font-medium text-gray-600 text-center">{label}</span>
                          <button
                            className={`relative w-10 h-6 transition duration-200 ease-in-out rounded-full ${toggles[activeTopTab]?.[key] ? 'bg-blue-500' : 'bg-gray-300'
                              }`}
                            onClick={() => handleToggle(key)}
                          >
                            <span
                              className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${toggles[activeTopTab]?.[key] ? 'translate-x-4' : ''
                                }`}
                            />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>

              </div>


              {/* Training Days Section */}
              <div className="bg-white rounded-xl shadow p-4 border">
                <h2 className="text-base font-semibold text-blue-800 mb-4">Contract Mandays</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Training Days */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Training Days</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      name="training_days"
                      value={currentContract.training_days ?? ''}
                      onChange={handleChange}
                      className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-blue-700 mb-1">(Consumed)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      name="training_days_consumed"
                      value={currentContract.training_days_consumed ?? ''}
                      onChange={handleChange}
                      className="w-full h-10 px-3 border border-blue-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-blue-700 mb-1">Balance</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={
                        (currentContract.training_days || 0) -
                        (currentContract.training_days_consumed || 0)
                      }
                      readOnly
                      className="w-full h-10 px-3 border border-blue-300 rounded-md text-sm bg-gray-100 text-gray-600"
                    />
                  </div>

                  {/* Post Training Days */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Post Training Days</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      name="post_training_days"
                      value={currentContract.post_training_days ?? ''}
                      onChange={handleChange}
                      className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-blue-700 mb-1">(Consumed)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      name="post_training_days_consumed"
                      value={currentContract.post_training_days_consumed ?? ''}
                      onChange={handleChange}
                      className="w-full h-10 px-3 border border-blue-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-blue-700 mb-1">Balance</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={
                        (currentContract.post_training_days || 0) -
                        (currentContract.post_training_days_consumed || 0)
                      }
                      readOnly
                      className="w-full h-10 px-3 border border-blue-300 rounded-md text-sm bg-gray-100 text-gray-600"
                    />
                  </div>


                  {/* SMA Days */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SMA Days</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      name="sma_days"
                      value={currentContract.sma_days ?? ''}
                      onChange={handleChange}
                      // readOnly
                      className="w-full h-10 px-3 border border-blue-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-blue-700 mb-1">(Consumed)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      name="sma_consumed"
                      value={currentContract.sma_consumed ?? ''}
                      onChange={handleChange}
                      className="w-full h-10 px-3 border border-blue-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-blue-700 mb-1">Balance</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={
                        (currentContract.sma_days || 0) -
                        (currentContract.sma_consumed || 0)
                      }
                      readOnly
                      className="w-full h-10 px-3 border border-blue-300 rounded-md text-sm bg-gray-100 text-gray-600"
                    />
                  </div>
                </div>
              </div>



            </div>
          )}

          {/* WMS Content */}
          {activeTopTab === "WMS" && (
            <div className="p-4 space-y-6">

              {/* Contract Details + Toggles in One Row */}
              <div className="flex flex-col lg:flex-row gap-6">

                {/* Contract Section */}
                <div className="flex-2 bg-white rounded-xl shadow p-4 border">
                  <h2 className="text-base font-semibold text-blue-800 mb-4">Contract Details</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Signed Contract Date</label>
                      <input
                        type="date"
                        name="contract_date"
                        value={currentContract.contract_date ?? ''}
                        onChange={handleChange}
                        className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">No. of Users</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        name="numberOfUsers"
                        value={currentContract.numberOfUsers ?? ''}
                        onChange={handleChange}
                        className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                      />
                    </div>

                  </div>
                </div>

                {/* SMA Info */}
                <div className="flex-1 bg-white rounded-xl shadow p-4 border">
                  <h2 className="text-base font-semibold text-blue-800 mb-4">SMA Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-1 xl:grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SMA Renewal Date</label>
                      <input
                        type="date"
                        name="sma_date"
                        value={currentContract.sma_date ?? ''}
                        onChange={handleChange}
                        className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    {/* <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">SMA Days</label>
        <input
          type="number"
          placeholder="0.00"
          name="sma_days"
          value={currentContract.sma_days ?? ''}
          onChange={handleChange}
          className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
        />
      </div> */}
                  </div>
                </div>

                {/* Toggles */}
                <div className="w-full lg:w-1/4 bg-white rounded-xl shadow p-4 border">
                  <h2 className="text-base font-semibold text-blue-800 mb-4">Status Flags</h2>
                  <div className="flex flex-wrap justify-center gap-2">
                    {toggleFields
                      .filter(({ key }) => (toggleVisibilityMap[activeTopTab] ?? []).includes(key))
                      .map(({ label, key }) => (
                        <div key={key} className="flex flex-col items-center w-20">
                          <span className="text-sm font-medium text-gray-600 text-center">{label}</span>
                          <button
                            className={`relative w-10 h-6 transition duration-200 ease-in-out rounded-full ${toggles[activeTopTab]?.[key] ? 'bg-blue-500' : 'bg-gray-300'
                              }`}
                            onClick={() => handleToggle(key)}
                          >
                            <span
                              className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${toggles[activeTopTab]?.[key] ? 'translate-x-4' : ''
                                }`}
                            />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>

              </div>


              {/* Training Days Section */}
              <div className="bg-white rounded-xl shadow p-4 border">
                <h2 className="text-base font-semibold text-blue-800 mb-4">Contract Mandays</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Training Days */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Training Days</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      name="training_days"
                      value={currentContract.training_days ?? ''}
                      onChange={handleChange}
                      className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-blue-700 mb-1">(Consumed)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      name="training_days_consumed"
                      value={currentContract.training_days_consumed ?? ''}
                      onChange={handleChange}
                      className="w-full h-10 px-3 border border-blue-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-blue-700 mb-1">Balance</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={
                        (currentContract.training_days || 0) -
                        (currentContract.training_days_consumed || 0)
                      }
                      readOnly
                      className="w-full h-10 px-3 border border-blue-300 rounded-md text-sm bg-gray-100 text-gray-600"
                    />
                  </div>

                  {/* Post Training Days */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Post Training Days</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      name="post_training_days"
                      value={currentContract.post_training_days ?? ''}
                      onChange={handleChange}
                      className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-blue-700 mb-1">(Consumed)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      name="post_training_days_consumed"
                      value={currentContract.post_training_days_consumed ?? ''}
                      onChange={handleChange}
                      className="w-full h-10 px-3 border border-blue-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-blue-700 mb-1">Balance</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={
                        (currentContract.post_training_days || 0) -
                        (currentContract.post_training_days_consumed || 0)
                      }
                      readOnly
                      className="w-full h-10 px-3 border border-blue-300 rounded-md text-sm bg-gray-100 text-gray-600"
                    />
                  </div>


                  {/* SMA Days */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SMA Days</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      name="sma_days"
                      value={currentContract.sma_days ?? ''}
                      onChange={handleChange}
                      // readOnly
                      className="w-full h-10 px-3 border border-blue-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-blue-700 mb-1">(Consumed)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      name="sma_consumed"
                      value={currentContract.sma_consumed ?? ''}
                      onChange={handleChange}
                      className="w-full h-10 px-3 border border-blue-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-blue-700 mb-1">Balance</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={
                        (currentContract.sma_days || 0) -
                        (currentContract.sma_consumed || 0)
                      }
                      readOnly
                      className="w-full h-10 px-3 border border-blue-300 rounded-md text-sm bg-gray-100 text-gray-600"
                    />
                  </div>
                </div>
              </div>



            </div>
          )}

          {/* Modules Section */}
          <div className="p-4 space-y-6">

            {/* Modules & Technicians Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {/* Main Modules Card */}
              <div className="bg-white rounded-xl shadow p-4 border">
                <h3 className="text-base font-semibold text-blue-800 mb-4">Modules / Services</h3>
                <div className="space-y-2">
                  {currentMainModules.map((module) => (
                    <label key={module} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={currentSelectedModules.includes(module)}
                        onChange={() => handleModuleToggle(module)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{module}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Other Modules Card */}
              <div className="bg-white rounded-xl shadow p-4 border">
                <h3 className="text-base font-semibold text-blue-800 mb-4">Other Modules</h3>
                <div className="space-y-2">
                  {currentOtherModules.map((module) => {
                    const isChecked = currentSelectedModules.includes(module);
                    const toggleModule = () => {
                      const newModules = isChecked
                        ? currentSelectedModules.filter(m => m !== module)
                        : [...currentSelectedModules, module];
                      setTabModules(prev => ({
                        ...prev,
                        [activeTopTab]: newModules
                      }));
                      setPendingChanges(prev => ({ ...prev, modules: newModules }));
                    };

                    return (
                      <label key={module} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={toggleModule}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{module}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Technicians Card */}
              <div className="bg-white rounded-xl shadow p-4 border">
                <h3 className="text-base font-semibold text-blue-800 mb-4">Technical Assigned</h3>
                <div className="space-y-3">
                  {technicianInputs.map((tech, index) => {
                    const techValue = tech.includes(" (") ? tech.split(" (")[0] : tech;
                    return (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <select
                          value={techValue}
                          onChange={(e) => handleTechnicianChange(index, e.target.value)}
                          className={`flex-1 p-2 border border-gray-300 rounded-md text-sm ${techValue === '' ? 'text-blue-700' : 'text-gray-800'
                            }`}
                        >
                          <option value="">Select Technical</option>
                          {technicians.map((name) => (
                            <option
                              key={name}
                              value={name}
                              disabled={
                                technicianInputs.some(t => t.startsWith(`${name} (`)) &&
                                !tech.startsWith(`${name} (`)
                              }
                            >
                              {name} ({technicianCodeMap[name]})
                            </option>
                          ))}
                        </select>
                        {index === technicianInputs.length - 1 ? (
                          <button
                            type="button"
                            onClick={addTechnicianInput}
                            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 w-full sm:w-9 h-9 flex items-center justify-center"
                          >
                            <FaPlus />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => removeTechnicianInput(index)}
                            className="bg-red-600 text-white p-2 rounded hover:bg-red-700 w-full sm:w-9 h-9 flex items-center justify-center"
                          >
                            <FaMinus />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>



            {/* Help Desk on separate row */}

            <div className="bg-white rounded-xl shadow p-4 border">
              <div className="flex items-center justify-start mb-4">
                <h2 className="text-base font-semibold text-blue-800 pr-2">HelpDesk Details  </h2>
                {!isEditingHelpdesk && (
                  <button
                    type="button"
                    onClick={() => setIsEditingHelpdesk(true)}
                    className="text-base text-blue-600 hover:underline whitespace-nowrap font-bold"
                  >
                    (Click to Edit URL)
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="w-full">
                  {!isEditingHelpdesk ? (
                    <div className="text-base font-semibold break-all text-blue-600 hover:underline">
                      {client.helpdesk ? (
                        <a
                          href={client.helpdesk.startsWith('http') ? client.helpdesk : `https://${client.helpdesk}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {client.helpdesk}
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">No link provided</span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        name="helpdesk"
                        placeholder="Enter Help Desk URL"
                        value={client.helpdesk || ""}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded text-sm w-full"
                      />
                      <button
                        type="button"
                        onClick={() => setIsEditingHelpdesk(false)}
                        className="text-base text-blue-600 hover:underline whitespace-nowrap font-bold"
                      >
                        Done
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>



            {/* Save Button */}
            {/* <div className="flex justify-center pt-6">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-28 py-2 font-semibold rounded-lg shadow-md transition duration-300 ${
              isSaving ? "bg-blue-700 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-800 text-white"
            }`}
          >
            {isSaving ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                {isViewMode ? "Updating..." : "Saving..."}
              </>
            ) : (
              isViewMode ? "Update" : "Save"
            )}
          </button>
        </div> */}
          </div>




        </div>







        {/* Bottom Tabs */}
        {/* <div className="flex flex-wrap justify-center mb-5 sm:justify-start gap-4 text-sm sm:gap-10 bg-blue-600 text-white rounded-t-md p-3 lg:gap-[150px] lg:text-base">
          {["Contact Information", "Server Information", "Attachment", "SMA Information"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab === "Attachment") setSelectedAttachmentType(null);
              }}
              className={`pb-2 font-semibold transition-opacity ${
                activeTab === tab
                  ? "text-white border-b-2 border-white opacity-100"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div> */}

        {/* APPLICATION TABS */}
        <div className="mt-6 text-sm lg:text-base bg-blue-100 rounded-xl">
          <div className="grid grid-cols-2 sm:flex sm:justify-between bg-blue-600 text-white rounded-t-xl px-2 py-2 gap-2">
            {["Contact Information", "Server Information", "Attachment", "SMA Information"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === "Attachment") setSelectedAttachmentType(null);
                }}
                className={`w-full text-center px-2 py-2 font-semibold rounded-t-md transition-all duration-100
        ${activeTab === tab
                    ? "bg-white text-blue-600 shadow-md border-b-2 border-blue-600"
                    : "opacity-80 hover:opacity-100 hover:bg-blue-500"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>


          {/* Tab Content
        {activeTab === "Contact Information" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 mt-6 p-4">
            {(client.contact_persons || ["", ""]).map((person, index) => (
  <div key={index}>
    <label className="block font-medium text-gray-700 mb-2">
      Contact Person
    </label>
    <input
  type="text"
  placeholder="Contact"
  value={person}
  onChange={(e) => {
    const updatedContacts = [...(client.contact_persons || ["", ""])];
    updatedContacts[index] = e.target.value;
    setClient(prev => ({ ...prev, contact_persons: updatedContacts }));
  }}
  className="p-2 border border-gray-300 rounded w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
/>

  </div>
))}

          </div>
        )} */}

          {activeTab === "Contact Information" && (
            <div className="flex flex-col gap-2 p-4">
              <button
                onClick={addNewContact}
                className="mt-4 bg-blue-600 text-white font-bold px-4 py-2 rounded hover:bg-blue-800 transition justify-center
             mx-auto md:mx-0 self-end"
              >
                + Add Contact
              </button>
              {/* Header labels */}
              <div
                className="
    hidden md:grid 
    md:grid-cols-[1fr_1fr_1fr_1fr_auto] 
    gap-6
    text-white 
    font-semibold 
    mt-2 
    px-4 py-4
    border-b border-gray-300
    bg-blue-500
    uppercase
    text-sm
    rounded-lg
    tracking-wide
  "
              >
                <div>Contact Person</div>
                <div>Position</div>
                <div>Contact No.</div>
                <div>Email</div>
                <div></div> {/* delete button column */}
              </div>


              {/* Contact inputs */}
              {(client.contact_persons || []).map((person, index) => (
                <div key={`contact-${index}-${person.contact_person || 'new'}`} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 border p-2 rounded shadow-sm items-center bg-white text-sm">
                  <input
                    type="text"
                    value={person.contact_person || ''}
                    onChange={(e) => updateContactField(index, 'contact_person', e.target.value)}
                    placeholder="Contact Person"
                    className="p-2 border border-gray-300 rounded w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <input
                    type="text"
                    value={person.position || ''}
                    onChange={(e) => updateContactField(index, 'position', e.target.value)}
                    placeholder="Position"
                    className="p-2 border border-gray-300 rounded w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <input
                    type="text"
                    value={person.contact_no || ''}
                    onChange={(e) => updateContactField(index, 'contact_no', e.target.value)}
                    placeholder="Contact No."
                    className="p-2 border border-gray-300 rounded w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <input
                    type="email"
                    value={person.email_add || ''}
                    onChange={(e) => updateContactField(index, 'email_add', e.target.value)}
                    placeholder="Email"
                    className="p-2 border border-gray-300 rounded w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <div className="flex justify-center md:justify-end">
                    <button
                      type="button"
                      onClick={() => removeContact(index)}
                      className="bg-red-600 text-white p-2 rounded hover:bg-red-700 w-full sm:w-9 h-9 flex items-center justify-center"
                    >
                      <FaMinus />
                    </button>
                  </div>
                </div>
              ))}


            </div>
          )}






          {activeTab === "Server Information" && (
            <>
              {/* 4-column grid for Anydesk + Server Passwords */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 mt-6 p-4">
                {/* Anydesk ID */}
                <div>
                  <label className="block font-medium text-gray-700 mb-2">
                    Server's Anydesk ID
                  </label>
                  <input
                    type="text"
                    name="remote_id"
                    placeholder="Server's Anydesk ID"
                    value={client.remote_id || ""}
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                {/* Anydesk Password */}
                <div className="relative">
                  <label className="block font-medium text-gray-700 mb-2">
                    Server's Anydesk Password
                  </label>
                  <input
                    type={showRemotePw ? "text" : "password"}
                    name="remote_pw"
                    placeholder="P@ssw0rd123"
                    value={client.remote_pw || ""}
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <div
                    className="absolute top-[70%] right-3 transform -translate-y-1/2 cursor-pointer text-gray-500"
                    onClick={() => setShowRemotePw(!showRemotePw)}
                  >
                    {showRemotePw ? <EyeOff size={20} /> : <Eye size={20} />}
                  </div>
                </div>

                {/* Server Password */}
                <div className="relative">
                  <label className="block font-medium text-gray-700 mb-2">
                    Server's Password
                  </label>
                  <input
                    type={showServerPw ? "text" : "password"}
                    name="server_pw"
                    placeholder="Password2023"
                    value={client.server_pw || ""}
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <div
                    className="absolute top-[70%] right-3 transform -translate-y-1/2 cursor-pointer text-gray-500"
                    onClick={() => setShowServerPw(!showServerPw)}
                  >
                    {showServerPw ? <EyeOff size={20} /> : <Eye size={20} />}
                  </div>
                </div>
              </div>


            </>

          )}


          {/* Attachment Tab */}
          {activeTab === "Attachment" && (
            <div>
              <div className="grid grid-cols-2 sm:flex sm:justify-between bg-blue-600 text-white px-2 py-2 gap-2">
                {/* {["Client Service Form", "Turn-Over Documents"].map((tab) => ( */}
                {[
                  { label: "Client Service Form", key: "clientServiceForm" },
                  { label: "Turn-Over Documents", key: "turnOver" }
                ].map(({ label, key }) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedAttachmentType(key);
                      fetchClientFiles();
                    }}
                    className={`w-full text-center px-2 py-2 font-semibold rounded-t-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white
      ${selectedAttachmentType === key
                        ? "bg-white text-blue-600 shadow-md"
                        : "opacity-80 hover:opacity-100"
                      }`}
                  >
                    {label}
                  </button>
                ))}

              </div>

              {/* Client Service Form Tab Content */}
              {/* {selectedAttachmentType === "Client Service Form" && ( */}
              {selectedAttachmentType === "clientServiceForm" && (

                <div className="bg-blue-100 rounded-b-md p-4">
                  <div className="text-right mb-4">
                    <button
                      onClick={() => handleAddFileClick("clientServiceForm")}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 border border-gray-300 rounded shadow-sm hover:bg-blue-700 transition"
                    >
                      <FaPlus className="text-gray-100 mr-2" />
                      <span className="font-semibold text-gray-100">Add New File</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-xl shadow">
                    <table className="min-w-full bg-white border border-gray-300 text-sm">
                      <thead className="bg-blue-500 text-gray-100 sticky top-0 z-10">
                        <tr>
                          <th className="p-3 text-left whitespace-nowrap">File Name</th>
                          <th className="p-3 text-left whitespace-nowrap">Upload Date</th>

                          <th className="p-3 text-center whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientServiceFiles.map((file) => (
                          <tr
                            key={`csf-${file.id || file.file_id || Math.random()}`}
                            className="border-b hover:bg-blue-50 transition"
                          >
                            <td className="p-3 whitespace-nowrap">{file.original_name}</td>
                            <td className="p-3 whitespace-nowrap">
                              {file.upload_date ? new Date(file.upload_date).toLocaleDateString() : 'N/A'}
                            </td>

                            <td className="p-2">
                              <div className="flex justify-center gap-3">
                                <button
                                  onClick={() => handleViewFile(file)}
                                  className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-full transition"
                                  title="View"
                                >
                                  <FaEye className="text-base" />
                                </button>
                                <button
                                  onClick={() => handleDownloadFile(file)}
                                  className="p-2 bg-green-100 text-green-600 hover:bg-green-200 rounded-full transition"
                                  title="Download"
                                >
                                  <FaDownload className="text-base" />
                                </button>
                                <button
                                  onClick={() => handleDeleteFile(file)}
                                  className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-full transition"
                                  title="Delete"
                                >
                                  <FaTrash className="text-base" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {clientServiceFiles.length === 0 && (
                          <tr>
                            <td colSpan={3} className="p-4 text-center text-gray-500 italic">
                              No Client Service Forms uploaded yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Turn-over Documents Tab Content */}
              {/* {selectedAttachmentType === "Turn-Over Documents" && ( */}
              {selectedAttachmentType === "turnOver" && (

                <div className="bg-blue-100 rounded-b-md p-4">
                  <div className="text-right mb-4">
                    <button
                      onClick={() => handleAddFileClick("turnOver")}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 border border-gray-300 rounded shadow-sm hover:bg-blue-700 transition"
                    >
                      <FaPlus className="text-gray-100 mr-2" />
                      <span className="font-semibold text-gray-100">Add New File</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-xl shadow">
                    <table className="min-w-full bg-white border border-gray-300 text-sm">
                      <thead className="bg-blue-500 text-gray-100 sticky top-0 z-10">
                        <tr>
                          <th className="p-3 text-left whitespace-nowrap">File Name</th>
                          <th className="p-3 text-left whitespace-nowrap">Upload Date</th>
                          <th className="p-3 text-center whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {turnOverFiles.map((file) => (
                          <tr
                            key={`to-${file.id || file.file_id || Math.random()}`}
                            className="border-b hover:bg-blue-50 transition"
                          >
                            <td className="p-3 whitespace-nowrap">{file.original_name}</td>
                            <td className="p-3 whitespace-nowrap">
                              {file.upload_date ? new Date(file.upload_date).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="p-2">
                              <div className="flex justify-center gap-3">
                                <button
                                  onClick={() => handleViewFile(file)}
                                  className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-full transition"
                                  title="View"
                                >
                                  <FaEye className="text-base" />
                                </button>
                                <button
                                  onClick={() => handleDownloadFile(file)}
                                  className="p-2 bg-green-100 text-green-600 hover:bg-green-200 rounded-full transition"
                                  title="Download"
                                >
                                  <FaDownload className="text-base" />
                                </button>
                                <button
                                  onClick={() => handleDeleteFile(file)}
                                  className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-full transition"
                                  title="Delete"
                                >
                                  <FaTrash className="text-base" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {turnOverFiles.length === 0 && (
                          <tr>
                            <td colSpan={3} className="p-4 text-center text-gray-500 italic">
                              No Turn-over Documents uploaded yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}


          {/* SMA Information Tab */}
          {activeTab === "SMA Information" && (
            <div className="bg-blue-100 rounded-b-md p-4">
              {/* Add File Button */}
              <div className="text-right mb-4">
                <button
                  onClick={() => handleAddFileClick('smaInformation')}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 border border-gray-300 rounded shadow-sm hover:bg-blue-700 transition"
                >
                  <FaPlus className="text-gray-100 mr-2" />
                  <span className="font-semibold text-gray-100">Add New File</span>
                </button>
              </div>

              {/* File Table */}
              <div className="overflow-x-auto rounded-xl shadow">
                <table className="min-w-full bg-white border border-gray-300 text-sm">
                  <thead className="bg-blue-500 text-gray-100 sticky top-0 z-10">
                    <tr>
                      <th className="p-3 text-left">File Name</th>
                      <th className="p-3 text-left">Date Uploaded</th>
                      
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {smaInformationFiles.map((file) => (
                      <tr
                        key={`sma-file-${file.file_id || file.id}`}
                        className="border-b hover:bg-blue-50"
                      >
                        <td className="p-2">{file.original_name}</td>
                        <td className="p-2">
                          {file.upload_date ? new Date(file.upload_date).toLocaleDateString() : 'N/A'}
                        </td>
                        
                        <td className="p-2 text-center">
                          <div className="flex justify-center gap-4">
                            <button
                              onClick={() => handleViewFile(file)}
                              className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-full transition"
                              title="View"
                            >
                              <FaEye className="text-base" />
                            </button>
                            <button
                              onClick={() => handleDownloadFile(file)}
                              className="p-2 bg-green-100 text-green-600 hover:bg-green-200 rounded-full transition"
                              title="Download"
                            >
                              <FaDownload className="text-base" />
                            </button>
                            <button
                              onClick={() => handleDeleteFile(file)}
                              className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-full transition"
                              title="Delete"
                            >
                              <FaTrash className="text-base" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))}
                    {smaInformationFiles.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-gray-500 italic">
                          No files uploaded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}



        </div>

        {/* Save Button */}
        <div className="flex justify-center mt-6">
          <button
            className="bg-blue-600 text-white font-semibold px-28 py-2 rounded-lg shadow-md hover:bg-blue-800 transition duration-300"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isViewMode ? "UPDATING..." : "SAVING..."}
              </>
            ) : (
              isViewMode ? "Update" : "Save"
            )}
          </button>
        </div>

      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg w-[600px] max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold text-blue-800">Clients</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-red-500"
              >
                ✖
              </button>
            </div>

            <div className="p-4">
              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="overflow-auto">
                  <table className="w-full text-sm border border-collapse">
                    <thead className="bg-gray-100 sticky top-0 z-10">
                      <tr>
                        <th className="p-2 border">Client Code</th>
                        <th className="p-2 border">Client Name</th>
                        <th className="p-2 border text-center">Action</th>
                      </tr>
                      <tr>
                        <th className="p-1 border">
                          <input
                            type="text"
                            placeholder="Search code..."
                            className="w-full p-1 border rounded text-xs"
                            onChange={(e) => {
                              const code = e.target.value.toLowerCase();
                              const name = searchName.toLowerCase();
                              setSearchCode(code);
                              setFilteredClients(
                                clients.filter((c) =>
                                  c.client_code.toLowerCase().includes(code) &&
                                  c.client_name.toLowerCase().includes(name)
                                )
                              );
                            }}
                          />
                        </th>
                        <th className="p-1 border">
                          <input
                            type="text"
                            placeholder="Search name..."
                            className="w-full p-1 border rounded text-xs"
                            onChange={(e) => {
                              const name = e.target.value.toLowerCase();
                              const code = searchCode.toLowerCase();
                              setSearchName(name);
                              setFilteredClients(
                                clients.filter((c) =>
                                  c.client_code.toLowerCase().includes(code) &&
                                  c.client_name.toLowerCase().includes(name)
                                )
                              );
                            }}
                          />
                        </th>
                        <th className="p-1 border"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClients.map((c, idx) => (
                        <tr key={idx} className="hover:bg-gray-100">
                          <td className="p-2 border">{c.client_code}</td>
                          <td className="p-2 border">{c.client_name}</td>
                          <td className="p-2 border text-center">
                            <button
                              onClick={() => {
                                setClient((prev) => ({
                                  ...prev,
                                  parentCompanyCode: c.client_code,
                                  parentCompanyName: c.client_name,
                                }));
                                setShowModal(false);
                              }}
                              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                            >
                              Select
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredClients.length === 0 && (
                        <tr>
                          <td colSpan="3" className="text-center p-4 text-gray-500">
                            No clients found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}



    </div>
  );
};

export default AddClientForm;