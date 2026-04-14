import React, { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faBell, faUser, faSignOutAlt, faArrowLeft, faArrowUp, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useLocation } from "react-router-dom";
import { FaMinus, FaPlus, FaTrash, FaDownload, FaEye } from "react-icons/fa";
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { GetAPI, BASE_URL } from '../api'; // Ensure BASE_URL is correctly exported from your api file
import FileUpload from "./FileUpload";

// ==========================================
// STATIC CONSTANTS (Optimized for memory)
// ==========================================
const APP_TABS = ["FINANCIALS", "HR-PAY", "REALTY", "WMS"];
const ATTACHMENT_TABS = [
  { label: "Client Service Form", key: "clientServiceForm" },
  { label: "Turn-Over Documents", key: "turnOver" }
];

const toggleFields = [
  { label: "Installed", key: "installed" },
  { label: "CAS", key: "cas" },
  { label: "EIS", key: "eis" },
  { label: "Live", key: "live" },
  { label: "Alphalist Live", key: "alphalist_live" },
  { label: "SMA", key: "with_sma" },
  { label: "FS Live", key: "fs_live" },
  { label: "Active", key: "active" }
];

const toggleVisibilityMap = {
  "FINANCIALS": ["installed", "cas", "eis", "live", "with_sma", "fs_live", "active"],
  "HR-PAY": ["installed", "live", "alphalist_live", "with_sma", "active"],
  "REALTY": ["installed", "live", "with_sma", "active"],
  "WMS": ["installed", "live", "with_sma", "active"],
};

const technicians = ["Calvin Delabajan", "Danica Castillo", "Anjeaneth Alarcon", "Arvee Aurelio", "Jomel Mendoza", "Gerard Mendoza"];
const technicianCodeMap = {
  "Calvin Delabajan": "CPD", "Danica Castillo": "DGC", "Anjeaneth Alarcon": "MAA",
  "Arvee Aurelio": "AGA", "Jomel Mendoza": "JBM", "Gerard Mendoza": "GSM",
};

const tabMainModules = {
  "FINANCIALS": ["General Ledger", "Accounts Payable", "Sales", "Accounts Receivable", "Purchasing", "FG Inventory", "MS Inventory", "RM Inventory", "VE Inventory"],
  "HR-PAY": ["HR Management and Payroll", "HR Information System"],
  "REALTY": ["Realty", "In-House Financing"],
  "WMS": ["Inbound", "Outbound", "Other Activities", "Billing"],
};

const tabOtherModules = {
  "FINANCIALS": ["Fixed Assets", "Budget", "Bank Recon", "Production", "Importation", "Financing", "Leasing", "Project Accounting", "BIR Tax Connect", "Financials - With Customization/s"],
  "HR-PAY": ["Employee Portal", "Employee Portal Cloud", "Payroll - With Customization/s"],
  "REALTY": ["Realty - With Customization/s"],
  "WMS": ["WMS - With Customization/s"],
};

const moduleCodeMap = {
  'General Ledger': 'GL', 'Accounts Payable': 'AP', 'Sales': 'SA', 'Accounts Receivable': 'AR',
  'Purchasing': 'PUR', 'FG Inventory': 'FGINV', 'MS Inventory': 'MSINV', 'RM Inventory': 'RMINV',
  'VE Inventory': 'VEINV', 'Fixed Assets': 'FA', 'Budget': 'BUD', 'Bank Recon': 'BR',
  'Production': 'PROD', 'Importation': 'IMP', 'Financing': 'FIN', 'Leasing': 'LS',
  "Project Accounting": 'PRJ', 'BIR Tax Connect': 'TC', 'HR Management and Payroll': 'HRPAY',
  'HR Information System': 'HRIS', 'Employee Portal': 'HRPortal', 'Employee Portal Cloud': 'HRPortalCloud',
  'Realty': 'REALTY', 'In-House Financing': 'INHOUSE', 'Inbound': 'INB', 'Outbound': 'OUTB',
  'Other Activities': 'OTH', 'Billing': 'AR', 'Financials - With Customization/s': 'FINCustom',
  'Payroll - With Customization/s': 'HRCustom', 'WMS - With Customization/s': 'WMSCustom',
  'Realty - With Customization/s': 'REALTYCustom',
};

const initialToggleState = {
  installed: false,
  cas: false,
  eis: false,
  live: false,
  alphalist_live: false,
  with_sma: false,
  fs_live: false,
  active: false
};

const emptyContract = {
  contract_date: "",
  sma_date: "",
  numberOfUsers: "",
  numberOfEmployees: "",
  training_days: "",
  training_days_consumed: "",
  training_days_type: "",
  post_training_days: "",
  post_training_days_consumed: "",
  post_training_days_type: "",
  fs_generation_contract: "",
  fs_generation_consumed: "",
  fs_generation_type: "",
  sma_days: "",
  sma_days_type: "",
  sma_consumed: "",
  casStatus: "",
  ac_no: "",
  date_issued: "",
  release_no: "",
  effectivity_date: "",
  group_name: "",
  environment: "",
  deployment_type: "",
  installed: "N",
  cas: "N",
  eis: "N",
  live: "N",
  alphalist_live: "N",
  with_sma: "N",
  fs_live: "N",
  active: "N",
};

// ==========================================
// MAIN COMPONENT
// ==========================================
const AddClientForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // UI States
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showRemotePw, setShowRemotePw] = useState(false);
  const [showServerPw, setShowServerPw] = useState(false);
  const [isEditingHelpdesk, setIsEditingHelpdesk] = useState(false);
  
  // Search state for client modal
  const [searchCode, setSearchCode] = useState('');
  const [searchName, setSearchName] = useState('');

  // Tab States
  const [activeTab, setActiveTab] = useState("Contact Information");
  const [activeTopTab, setActiveTopTab] = useState("FINANCIALS");
  const [selectedAttachmentType, setSelectedAttachmentType] = useState("clientServiceForm");
  const [currentFileType, setCurrentFileType] = useState('');

  // Data States
  const [client, setClient] = useState({
    client_code: "",
    client_name: "",
    main_address: "",
    industry: "",
    area: "",
    economic_zone: "N",
    industry_class: "",
    remote_id: "",
    remote_pw: "",
    server_pw: "",
    helpdesk: "",
    app_type: "",
    principal_client_code: '',
    principal_client: '',
    is_group: false,
    remarks: "",
    contact_persons: [{}]
  });
  
  const [clientcontracts, setClientContracts] = useState({});
  const [toggles, setToggles] = useState({
    "FINANCIALS": { ...initialToggleState },
    "HR-PAY": { ...initialToggleState },
    "REALTY": { ...initialToggleState },
    "WMS": { ...initialToggleState }
  });
  const [tabTechnicians, setTabTechnicians] = useState({ FINANCIALS: [""], "HR-PAY": [""], REALTY: [""], WMS: [""] });
  const [tabModules, setTabModules] = useState({ FINANCIALS: [], "HR-PAY": [], REALTY: [], WMS: [] });
  
  const [industries, setIndustries] = useState([]);
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  
  // File States
  const [clientServiceFiles, setClientServiceFiles] = useState([]);
  const [turnOverFiles, setTurnOverFiles] = useState([]);
  const [smaInformationFiles, setSmaInformationFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // Derived State
  const currentContract = clientcontracts[activeTopTab]?.[0] ?? emptyContract;
  const currentMainModules = tabMainModules[activeTopTab] || [];
  const currentOtherModules = tabOtherModules[activeTopTab] || [];
  const currentSelectedModules = tabModules[activeTopTab] || [];
  const technicianInputs = tabTechnicians[activeTopTab] || [""];

  // API Config Helper
  const authHeaders = useMemo(() => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  }), []);

  // ==========================================
  // INITIALIZATION & EFFECTS
  // ==========================================
  useEffect(() => {
    const handleScroll = () => setShowScrollButton(window.pageYOffset > 300);
    window.addEventListener('scroll', handleScroll);
    fetchIndustries();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (activeTab === "Attachment") setSelectedAttachmentType("clientServiceForm");
  }, [activeTab]);

  useEffect(() => {
    if (location.state) {
      setClient(location.state);
      setIsViewMode(true);
      fetchClientData(location.state.client_code, activeTopTab);
    } else {
      fetchDefaultClientCode();
    }
  }, [location.state, activeTopTab]);

  useEffect(() => {
    if (client.client_code) fetchClientFiles();
  }, [client.client_code]);

  // Sync toggles when contract changes
  useEffect(() => {
    const contract = clientcontracts[activeTopTab]?.[0];
    if (!contract) return;
      setToggles(prev => ({
        ...prev,
        [activeTopTab]: {
          ...prev[activeTopTab],
          installed: contract.installed === "Y",
          cas: contract.cas === "Y",
          eis: contract.eis === "Y",
          live: contract.live === "Y",
          alphalist_live: contract.alphalist_live === "Y",
          with_sma: contract.with_sma === "Y",
          fs_live: contract.fs_live === "Y",
          active: contract.active === "Y"
        }
      }));
  }, [clientcontracts, activeTopTab]);

  // ==========================================
  // DATA FETCHING
  // ==========================================
  const fetchIndustries = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/client-industries`, authHeaders);
      if (data) setIndustries(data);
    } catch (error) { console.error('Error fetching industries:', error); }
  };

  const fetchClients = async () => {
    try {
      const response = await GetAPI("getClients");
      const payload = response?.data ?? response;
      let list = Array.isArray(payload) ? payload : (Array.isArray(payload.data) ? payload.data : (payload.clients || []));
      const sortedData = list.filter(c => (c.flag ?? "Y") === "Y").sort((a, b) => (a.client_name || "").localeCompare(b.client_name || ""));
      setClients(sortedData);
      setFilteredClients(sortedData);
    } catch (error) { console.error("Error fetching clients:", error); }
  };

  const openClientModal = () => {
    setShowModal(true);
    fetchClients();
  };

  const fetchClientFiles = async () => {
    try {
      const [csRes, toRes, smaRes] = await Promise.all([
        axios.get(`${BASE_URL}/client-files/${client.client_code}/clientServiceForm`, authHeaders),
        axios.get(`${BASE_URL}/client-files/${client.client_code}/turnOver`, authHeaders),
        axios.get(`${BASE_URL}/client-files/${client.client_code}/smaInformation`, authHeaders)
      ]);
      setClientServiceFiles(csRes.data.files || []);
      setTurnOverFiles(toRes.data.files || []);
      setSmaInformationFiles(smaRes.data.files || []);
    } catch (error) { console.error('Error fetching files:', error); }
  };

  const fetchDefaultClientCode = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/clients/default-code`, authHeaders);
      if (data.success && data.client_code) setClient(prev => ({ ...prev, client_code: data.client_code }));
    } catch (error) { console.error('Error fetching default client code:', error); }
  };

  const fetchClientData = async (clientCode, appType) => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`${BASE_URL}/load-client-data?client_code=${clientCode}&app_type=${appType}`, authHeaders);
      if (!data.success) throw new Error(data.error);

      // --- ADD THIS HELPER FUNCTION HERE ---
      const formatApiDate = (dateStr) => {
        if (!dateStr || dateStr.includes('1900-01-01') || dateStr.includes('0000-00-00')) return '';
        
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return ''; // Return empty if invalid
        
        // Force local YYYY-MM-DD format (avoids Javascript UTC timezone shifting bugs)
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
      };

      const contracts = Array.isArray(data.client_contract) ? data.client_contract : (data.client_contract ? [data.client_contract] : []);
      
      // --- UPDATE THIS MAPPING BLOCK ---
      const contractsForAppType = contracts.filter(c => c.app_type === appType).map(c => ({
        ...c,
        contract_date: formatApiDate(c.contract_date),
        sma_date: formatApiDate(c.sma_date),
        date_issued: formatApiDate(c.date_issued),
        effectivity_date: formatApiDate(c.effectivity_date),
      }));

      setClientContracts(prev => ({ ...prev, [appType]: contractsForAppType.length ? contractsForAppType : [{}] }));
      
      setClient(prev => ({
        ...prev,
        ...data.clients,
        contact_persons: data.client_contact?.length ? data.client_contact : [{}]
      }));

      const receivedTechnicians = data.technicians || [];
      const filteredTechnicians = receivedTechnicians.filter(t => t.app_type === appType);
      const technicianDisplayNames = filteredTechnicians.map(tech => {
        const name = Object.entries(technicianCodeMap).find(([_, c]) => c === tech.tech_code)?.[0] || tech.tech_code;
        return `${name} (${tech.tech_code})`;
      });

      setTabTechnicians(prev => ({ ...prev, [appType]: [...technicianDisplayNames, ""] }));
      setTabModules(prev => ({ ...prev, [appType]: data.modules?.map(m => m.module_name) || [] }));

    } catch (error) {
      Swal.fire('Error', `Failed to load client data: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    const contractFields = [
      'training_days',
      'training_days_consumed',
      'training_days_type',
      'post_training_days',
      'post_training_days_consumed',
      'post_training_days_type',
      'fs_generation_contract',
      'fs_generation_consumed',
      'fs_generation_type',
      'numberOfUsers',
      'numberOfEmployees',
      'contract_date',
      'sma_date',
      'casStatus',
      'ac_no',
      'date_issued',
      'release_no',
      'effectivity_date',
      'sma_days',
      'sma_consumed',
      'sma_days_type',
      'environment',
      'deployment_type'
    ];

    if (contractFields.includes(name)) {
      setClientContracts(prev => {
        const currentContracts = prev[activeTopTab] || [{...emptyContract}];
        let updatedValue = ['numberOfUsers', 'numberOfEmployees', 'training_days', 'training_days_consumed', 'post_training_days', 'post_training_days_consumed', 'fs_generation_contract', 'fs_generation_consumed', 'sma_days', 'sma_consumed'].includes(name) ? Number(value) : value;
        return { ...prev, [activeTopTab]: [{ ...currentContracts[0], [name]: updatedValue }] };
      });
    } else {
      setClient(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleToggle = (key) => {
    setToggles(prev => ({
      ...prev,
      [activeTopTab]: { ...prev[activeTopTab], [key]: !prev[activeTopTab][key] }
    }));
    setClientContracts(prev => {
      const contract = prev[activeTopTab]?.[0] || {...emptyContract};
      return { ...prev, [activeTopTab]: [{ ...contract, [key]: contract[key] === "Y" ? "N" : "Y" }] };
    });
  };

  const handleModuleToggle = (module) => {
    setTabModules(prev => {
      const current = prev[activeTopTab] || [];
      return { ...prev, [activeTopTab]: current.includes(module) ? current.filter(m => m !== module) : [...current, module] };
    });
  };

  const handleTechnicianChange = (index, selectedName) => {
    const displayValue = `${selectedName} (${technicianCodeMap[selectedName]})`;
    setTabTechnicians(prev => {
      const newInputs = [...(prev[activeTopTab] || [])];
      newInputs[index] = displayValue;
      return { ...prev, [activeTopTab]: newInputs };
    });
  };

  const updateContactField = (index, field, value) => {
    setClient(prev => {
      const updated = [...(prev.contact_persons || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, contact_persons: updated };
    });
  };

  // --- FILE HANDLING LOGIC ---
  const handleFileSelect = async (files, uploadDate, signedDate) => {
    if (!files || files.length === 0) return { success: false, message: "No files selected" };
    
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

      if (currentFileType === "clientServiceForm") setClientServiceFiles(prev => [...prev, ...tempFiles]);
      else if (currentFileType === "turnOver") setTurnOverFiles(prev => [...prev, ...tempFiles]);
      else if (currentFileType === "smaInformation") setSmaInformationFiles(prev => [...prev, ...tempFiles]);

      for (const file of files) {
        const idRes = await fetch(`${BASE_URL}/generate-id`, authHeaders);
        const idData = await idRes.json();

        const formData = new FormData();
        formData.append("file", file);
        formData.append("file_id", idData.file_id);
        formData.append("client_code", client.client_code);
        formData.append("file_name", file.name);
        formData.append("file_type", currentFileType);
        formData.append("upload_date", uploadDate);
        
        await fetch(`${BASE_URL}/upload`, {
          method: "POST",
          body: formData,
          ...authHeaders
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

  const handleViewFile = async (file) => {
    try {
      const fileId = file.file_id || file.id;
      const { data } = await axios.get(`${BASE_URL}/files/verify/${fileId}`, authHeaders);
      if (!data.exists) throw new Error('File not found on server');
      window.open(`${BASE_URL}/files/view/${fileId}`, '_blank');
    } catch (error) {
      alert(`Cannot view file: ${error.message}`);
    }
  };

  const handleDownloadFile = async (file) => {
    try {
      const fileId = file.file_id || file.id;
      const { data } = await axios.get(`${BASE_URL}/files/verify/${fileId}`, authHeaders);
      if (!data.exists) throw new Error('File not found on server');
      
      const link = document.createElement('a');
      link.href = `${BASE_URL}/files/download/${fileId}`;
      link.setAttribute('download', file.original_name || file.fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert(`Download failed: ${error.message}`);
    }
  };

  const handleDeleteFile = async (file) => {
    const fileId = file.file_id || file.id;
    if (!fileId) return Swal.fire("Error", "Invalid file identifier.", "error");

    const result = await Swal.fire({
      title: `Delete "${file.original_name}"?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    });

    if (!result.isConfirmed) return;

    try {
      const { data } = await axios.delete(`${BASE_URL}/files/${fileId}`, authHeaders);
      if (data.success) {
        Swal.fire("Deleted!", data.message, "success");
        fetchClientFiles();
      } else {
        Swal.fire("Error", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Failed to delete the file.", "error");
    }
  };

  // --- SAVE LOGIC ---
  const handleSave = async () => {
    try {
      setIsSaving(true);

      // 1. Prepare Technicians Payload
      const clientTechnicalsPayload = Object.entries(tabTechnicians).flatMap(([appType, techs]) =>
        techs.filter(t => t !== "").map(t => {
          const matches = t.match(/\(([^)]+)\)/);
          return { tech_code: matches ? matches[1] : t, app_type: appType };
        })
      );

      // 2. Prepare Modules Payload
      const clientModulesPayload = Object.entries(tabModules).flatMap(([appType, selectedModules]) => {
        const allowedModules = [...(tabMainModules[appType] || []), ...(tabOtherModules[appType] || [])];
        return selectedModules
          .filter(moduleName => allowedModules.includes(moduleName))
          .map(moduleName => ({
            module_name: moduleName,
            module_code: moduleCodeMap[moduleName] || null,
            module_type: appType,
          }));
      });

      // 3. Prepare Contract Payload
      const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        if (isNaN(d)) return '';
        return `${d.getFullYear()}-${(`0${d.getMonth() + 1}`).slice(-2)}-${(`0${d.getDate()}`).slice(-2)}`;
      };

      const contractPayload = Object.entries(clientcontracts).map(([appType, contracts]) => {
        const c = contracts[0] || {};
        const currentToggles = toggles[appType] || {};
        return {
          app_type: appType,
          training_days: Number(c.training_days) || 0,
          training_days_consumed: Number(c.training_days_consumed) || 0,
          training_days_type: c.training_days_type || '',
          post_training_days: Number(c.post_training_days) || 0,
          post_training_days_consumed: Number(c.post_training_days_consumed) || 0,
          post_training_days_type: c.post_training_days_type || '',
          fs_generation_contract: Number(c.fs_generation_contract) || 0,
          fs_generation_consumed: Number(c.fs_generation_consumed) || 0,
          fs_generation_type: c.fs_generation_type || '',
          numberOfUsers: Number(c.numberOfUsers) || 0,
          numberOfEmployees: Number(c.numberOfEmployees) || 0,
          contract_date: formatDate(c.contract_date),
          sma_date: formatDate(c.sma_date),
          installed: currentToggles.installed ? "Y" : "N",
          cas: currentToggles.cas ? "Y" : "N",
          eis: currentToggles.eis ? "Y" : "N",
          live: currentToggles.live ? "Y" : "N",
          alphalist_live: currentToggles.alphalist_live ? "Y" : "N",
          with_sma: currentToggles.with_sma ? "Y" : "N",
          fs_live: currentToggles.fs_live ? "Y" : "N",
          active: currentToggles.active ? "Y" : "N",
          sma_days: Number(c.sma_days) || 0,
          sma_consumed: Number(c.sma_consumed) || 0,
          sma_days_type: c.sma_days_type || '',
          casStatus: c.casStatus || '',
          ac_no: c.ac_no || '',
          date_issued: formatDate(c.date_issued),
          release_no: c.release_no || '',
          effectivity_date: formatDate(c.effectivity_date),
          group_name: c.group_name || '',
          environment: c.environment || '',
          deployment_type: c.deployment_type || '',
        };
      });

      // 4. Prepare Contacts Payload
      const contactPersonsPayload = (client.contact_persons || [])
        .filter(p => p.contact_person?.trim())
        .map(p => ({
          client_code: client.client_code,
          contact_person: p.contact_person?.trim() || '',
          position: p.position?.trim() || '',
          contact_no: p.contact_no?.trim() || '',
          email_add: p.email_add?.trim() || ''
        }));

      // 5. Final Payload Setup
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
              area: client.area || '',
              economic_zone: client.economic_zone || 'N',
              industry_class: client.industry_class || '',
              flag: client.is_group ? 'Y' : 'N',
              principal_client: client.principal_client || '',
              principal_client_code: client.principal_client_code || '',
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

      const { data } = await axios.post(`${BASE_URL}/client/save`, payload, {
        headers: { ...authHeaders.headers, 'Content-Type': 'application/json' },
      });

      if (data.success) {
        Swal.fire({ icon: 'success', title: 'Success', text: 'Client data saved successfully' });
      } else {
        throw new Error(data.message || 'Save failed');
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: `Error saving client: ${error.message}` });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => navigate("/");
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // ==========================================
  // RENDER HELPERS
  // ==========================================
  
  // Renders the App Specific details based on the selected TOP TAB
  const renderAppTabContent = () => (
    <div className="p-4 space-y-3 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Contract Section */}
        <div className="flex-2 bg-white rounded-xl shadow p-4 border">
          <h2 className="text-base font-semibold text-blue-800 mb-4">Contract Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Signed Contract Date</label>
              <input type="date" name="contract_date" value={currentContract.contract_date || ''} onChange={handleChange} className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">No. of Users</label>
              <input type="number" name="numberOfUsers" value={currentContract.numberOfUsers || ''} onChange={handleChange} className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {activeTopTab === "HR-PAY" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No. of Employees</label>
                <input type="number" name="numberOfEmployees" value={currentContract.numberOfEmployees || ''} onChange={handleChange} className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            )}
          </div>
        </div>

        {/* SMA Info */}
        <div className="flex-1 bg-white rounded-xl shadow p-4 border">
          <h2 className="text-base font-semibold text-blue-800 mb-4">SMA Information</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SMA Expiry Date</label>
            <input type="date" name="sma_date" value={currentContract.sma_date || ''} onChange={handleChange} className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {/* Toggles */}
        <div className="w-full lg:w-2/5 bg-white rounded-xl shadow p-4 border">
          <h2 className="text-base font-semibold text-blue-800 mb-4">Status Flags</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {toggleFields.filter(({ key }) => (toggleVisibilityMap[activeTopTab] || []).includes(key)).map(({ label, key }) => (
              <div key={key} className="flex flex-col items-center">
                <span className="text-xs font-medium text-gray-600 mb-1">{label}</span>
                <button
                  className={`relative w-10 h-6 rounded-full transition duration-200 ease-in-out ${toggles[activeTopTab]?.[key] ? 'bg-blue-500' : 'bg-gray-300'}`}
                  onClick={() => handleToggle(key)}
                >
                  <span className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${toggles[activeTopTab]?.[key] ? 'translate-x-4' : ''}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* BIR CAS Specific Info for Financials */}
      {activeTopTab === "FINANCIALS" && currentContract.cas === 'Y' && (
        <div className="bg-white rounded-xl shadow p-4 border">
          <h2 className="text-base font-semibold text-blue-800 mb-4">BIR CAS Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-bold text-blue-700 mb-1">CAS Status</label>
              <select name="casStatus" value={currentContract.casStatus || ''} onChange={handleChange} className="w-full h-9 px-2 border border-gray-300 rounded text-sm">
                <option value="">Select Status</option>
                <option value="Pending">Pending Master Data</option>
                <option value="Ongoing">Ongoing Documentation</option>
                <option value="Completed">Completed Documentation</option>
                <option value="Waiting">Waiting BIR Approval</option>
                <option value="Approved">Approved</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-blue-700 mb-1">Acknowledgement Certificate No.</label>
              <input type="text" name="ac_no" value={currentContract.ac_no || ''} onChange={handleChange} className="w-full h-9 px-2 border border-gray-300 rounded text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-blue-700 mb-1">Date Issued</label>
              <input type="date" name="date_issued" value={currentContract.date_issued || ''} onChange={handleChange} className="w-full h-9 px-2 border border-gray-300 rounded text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-blue-700 mb-1">Release No.</label>
              <input type="text" name="release_no" value={currentContract.release_no || ''} onChange={handleChange} className="w-full h-9 px-2 border border-gray-300 rounded text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-blue-700 mb-1">Effectivity Date</label>
              <input type="date" name="effectivity_date" value={currentContract.effectivity_date || ''} onChange={handleChange} className="w-full h-9 px-2 border border-gray-300 rounded text-sm" />
            </div>
          </div>
        </div>
      )}

      {/* Contract Mandays Grid */}
      <div className="bg-white rounded-xl shadow p-4 border">
        <h2 className="text-base font-semibold text-blue-800 mb-4">Contract Mandays</h2>
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {[
            { label: 'Training Days', base: 'training_days', consumed: 'training_days_consumed', type: 'training_days_type' },
            { label: 'Post Training Days', base: 'post_training_days', consumed: 'post_training_days_consumed', type: 'post_training_days_type' },
            ...(activeTopTab === "FINANCIALS"
              ? [{ label: 'FS Generation', base: 'fs_generation_contract', consumed: 'fs_generation_consumed', type: 'fs_generation_type' }]
              : []),
            { label: 'SMA Days', base: 'sma_days', consumed: 'sma_consumed', type: 'sma_days_type' }
          ].map(field => (
            <div key={field.base} className="grid grid-cols-2 lg:grid-cols-4 gap-2 items-center">
              <div>
                <label className="block text-[11px] sm:text-xs font-medium text-gray-700 mb-1">Type</label>
                <select
                  name={field.type}
                  value={currentContract[field.type] || ''}
                  onChange={handleChange}
                  className="w-full h-9 px-2 border border-gray-300 rounded text-sm"
                >
                  <option value="">Select Type</option>
                  <option value="Onsite">Onsite</option>
                  <option value="Online">Online</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] sm:text-xs font-medium text-gray-700 mb-1">{field.label}</label>
                <input type="number" name={field.base} value={currentContract[field.base] || ''} onChange={handleChange} className="w-full h-9 px-2 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] sm:text-xs font-medium text-blue-700 mb-1">(Consumed)</label>
                <input type="number" name={field.consumed} value={currentContract[field.consumed] || ''} onChange={handleChange} className="w-full h-9 px-2 border border-blue-300 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] sm:text-xs font-medium text-blue-700 mb-1">(Balance)</label>
                <input type="number" readOnly value={(currentContract[field.base] || 0) - (currentContract[field.consumed] || 0)} className="w-full h-9 px-2 border border-blue-300 bg-gray-100 rounded text-sm outline-none text-gray-600 font-semibold" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Renders the file tables for Attachments & SMA Info tabs
  const renderFileTable = (fileType, files) => (
    <div className="animate-fade-in p-4 bg-white rounded-b-xl">
      <div className="flex justify-end mb-4">
        <button onClick={() => { setCurrentFileType(fileType); setShowFileModal(true); }} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition font-semibold text-sm">
          <FaPlus className="mr-2" /> Add New File
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg shadow-sm border border-slate-200">
        <table className="min-w-full bg-white text-xs">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="p-2 text-left">File Name</th>
              <th className="p-2 text-left">Upload Date</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.length > 0 ? files.map(file => (
              <tr key={file.id || file.file_id || Math.random()} className="border-b hover:bg-slate-50 transition">
                <td className="py-1 px-2">{file.original_name}</td>
                <td className="py-1 px-2">{file.upload_date ? new Date(file.upload_date).toLocaleDateString() : 'N/A'}</td>
                <td className="py-1 px-2">
                  <div className="flex justify-center gap-3">
                    <button onClick={() => handleViewFile(file)} className="text-sm p-1 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-md transition" title="View"><FaEye /></button>
                    <button onClick={() => handleDownloadFile(file)} className="text-sm p-1 bg-green-100 text-green-600 hover:bg-green-200 rounded-md transition" title="Download"><FaDownload /></button>
                    <button onClick={() => handleDeleteFile(file)} className="text-sm p-1 bg-red-100 text-red-600 hover:bg-red-200 rounded-md transition" title="Delete"><FaTrash /></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="3" className="p-6 text-center text-gray-500 italic">No files uploaded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-2 bg-slate-50 min-h-screen">
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl shadow-2xl flex flex-col items-center gap-4 animate-fade-in">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-800 font-medium">Loading...</p>
          </div>
        </div>
      )}

      {/* File Upload Modal */}
      <FileUpload
        isOpen={showFileModal}
        onClose={() => setShowFileModal(false)}
        onFileSelect={async (files, uploadDate, signedDate) => {
          const result = await handleFileSelect(files, uploadDate, signedDate);
          if (result.success) setShowFileModal(false);
          return result;
        }}
        isLoading={isUploading}
      />


      {/* Client Search Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
          <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
            <div className="flex h-[92vh] w-full max-w-[900px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl sm:h-auto sm:max-h-[80vh]">
              <div className="flex items-center justify-between px-2 py-2 sm:px-4">
                <h2 className="text-base font-bold text-blue-800 sm:text-lg">
                  Select Parent Client
                </h2>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                >
                  <faTimesCircle size={20} />
                </button>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-md border border-slate-300 bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
                >
                  Close
                </button>

              </div>

              <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 sm:hidden">
                <div className="grid grid-cols-1 gap-2">
                  <input
                    type="text"
                    placeholder="Filter by Client Code..."
                    className="w-full rounded-md border border-slate-300 p-2 text-sm outline-none focus:border-blue-500"
                    onChange={(e) => {
                      const code = e.target.value.toLowerCase();
                      setSearchCode(code);
                      setFilteredClients(
                        clients.filter(
                          (c) =>
                            c.client_code.toLowerCase().includes(code) &&
                            c.client_name.toLowerCase().includes(searchName)
                        )
                      );
                    }}
                  />

                  <input
                    type="text"
                    placeholder="Filter by Client Name..."
                    className="w-full rounded-md border border-slate-300 p-2 text-sm outline-none focus:border-blue-500"
                    onChange={(e) => {
                      const name = e.target.value.toLowerCase();
                      setSearchName(name);
                      setFilteredClients(
                        clients.filter(
                          (c) =>
                            c.client_code.toLowerCase().includes(searchCode) &&
                            c.client_name.toLowerCase().includes(name)
                        )
                      );
                    }}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-auto p-2 sm:p-3">
                {/* Desktop / Tablet Table View */}
                <div className="hidden sm:block">
                  <table className="w-full border-collapse text-sm">
                    <thead className="sticky top-[-12px] z-10 bg-slate-100 shadow-sm">
                      <tr>
                        <th className="border border-slate-200 p-2 text-left">
                          Client Code
                        </th>
                        <th className="border border-slate-200 p-2 text-left">
                          Client Name
                        </th>
                      </tr>
                      <tr>
                        <th className="border border-slate-200 p-1">
                          <input
                            type="text"
                            placeholder="Filter..."
                            className="w-full rounded border p-1.5 text-xs outline-none"
                            onChange={(e) => {
                              const code = e.target.value.toLowerCase();
                              setSearchCode(code);
                              setFilteredClients(
                                clients.filter(
                                  (c) =>
                                    c.client_code.toLowerCase().includes(code) &&
                                    c.client_name.toLowerCase().includes(searchName)
                                )
                              );
                            }}
                          />
                        </th>
                        <th className="border border-slate-200 p-1">
                          <input
                            type="text"
                            placeholder="Filter..."
                            className="w-full rounded border p-1.5 text-xs outline-none"
                            onChange={(e) => {
                              const name = e.target.value.toLowerCase();
                              setSearchName(name);
                              setFilteredClients(
                                clients.filter(
                                  (c) =>
                                    c.client_code.toLowerCase().includes(searchCode) &&
                                    c.client_name.toLowerCase().includes(name)
                                )
                              );
                            }}
                          />
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredClients.map((c, idx) => (
                        <tr
                          key={idx}
                          className="cursor-pointer transition hover:bg-blue-50"
                          onClick={() => {
                            setClient((prev) => ({
                              ...prev,
                              principal_client_code: c.client_code,
                              principal_client: c.client_name,
                            }));
                            setShowModal(false);
                          }}
                        >
                          <td className="border border-slate-200 p-2">{c.client_code}</td>
                          <td className="border border-slate-200 p-2">{c.client_name}</td>
                        </tr>
                      ))}

                      {filteredClients.length === 0 && (
                        <tr>
                          <td
                            colSpan="2"
                            className="p-6 text-center italic text-gray-500"
                          >
                            No clients found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="space-y-2 sm:hidden">
                  {filteredClients.map((c, idx) => (
                    <div
                      key={idx}
                      className="cursor-pointer rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:bg-blue-50"
                      onClick={() => {
                        setClient((prev) => ({
                          ...prev,
                          principal_client_code: c.client_code,
                          principal_client: c.client_name,
                        }));
                        setShowModal(false);
                      }}
                    >
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Client Code
                      </div>
                      <div className="text-sm font-medium text-slate-800">
                        {c.client_code}
                      </div>

                      <div className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Client Name
                      </div>
                      <div className="text-sm text-slate-800">{c.client_name}</div>
                    </div>
                  ))}

                  {filteredClients.length === 0 && (
                    <div className="rounded-lg border border-slate-200 p-6 text-center italic text-gray-500">
                      No clients found.
                    </div>
                  )}
                </div>
              </div>

              
            </div>
          </div>
        </div>
      )}

      {showScrollButton && (
        <button onClick={scrollToTop} className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-xl hover:bg-blue-700 transition-colors z-40">
          <FontAwesomeIcon icon={faArrowUp} className="w-5 h-5" />
        </button>
      )}

      {/* Header Actions */}
      {/* <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate("/dashboard")} className="flex items-center text-gray-600 hover:text-blue-600 transition-colors font-medium">
          <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 mr-2" /> Back to Dashboard
        </button>

        <div className="flex items-center space-x-4">
          <FontAwesomeIcon icon={faBell} className="w-5 h-5 text-gray-400 cursor-pointer hover:text-blue-600 transition" />
          <div className="relative">
            <div className="cursor-pointer" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                 <FontAwesomeIcon icon={faUser} />
              </div>
            </div>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                <ul className="py-2 text-sm text-gray-700">
                  <li className="px-4 py-2 hover:bg-slate-50 cursor-pointer flex items-center"><FontAwesomeIcon icon={faUser} className="mr-3" /> Profile</li>
                  <li className="px-4 py-2 hover:bg-slate-50 cursor-pointer flex items-center text-red-600" onClick={handleLogout}><FontAwesomeIcon icon={faSignOutAlt} className="mr-3" /> Logout</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div> */}

      <div className="bg-blue-600 shadow-lg p-3 mb-4 rounded-lg text-white sticky top-0 z-30 flex justify-between items-center">
        <h1 className="text-lg font-bold tracking-wide">{isViewMode ? `Client Information: ${client.client_name}` : "Client Registration"}</h1>
      </div>

      <div className="bg-white shadow-xl p-6 rounded-xl border border-gray-100">
        
        {/* Top Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-6">
          <div className="md:col-span-1">
            <label className="block font-semibold text-gray-700 mb-1 text-sm">Client Code</label>
            <input type="text" name="client_code" value={client.client_code || ""} disabled className="w-full p-2 border border-gray-200 bg-slate-100 rounded-lg text-slate-500 cursor-not-allowed" />
          </div>
          <div className="md:col-span-5">
            <label className="block font-semibold text-gray-700 mb-1 text-sm">Client Name</label>
            <input type="text" name="client_name" value={client.client_name || ""} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
          </div>
        </div>

        {/* Industry / Classification / Group Section */}
        <div className="space-y-4 mb-6">
          {/* Row 1: Industry + Industry Class */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block font-semibold text-gray-700 mb-1 text-sm">Industry</label>
              <select
                name="industry"
                value={client.industry || ""}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="">Select an industry</option>
                {industries.map((item) => (
                  <option key={item.code} value={item.industry}>
                    {item.industry}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-gray-700 mb-1 text-sm">Industry Class</label>
              <input
                type="text"
                name="industry_class"
                value={client.industry_class || ""}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Row 2: Economic Zone + Area */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block font-semibold text-gray-700 mb-1 text-sm">Economic Zone</label>
              <select
                name="economic_zone"
                value={client.economic_zone || "N"}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="Y">Yes</option>
                <option value="N">No</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-gray-700 mb-1 text-sm">Area</label>
              <input
                type="text"
                name="area"
                value={client.area || ""}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Row 3: Group + Parent Code + Parent Company Name */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-1">
              <label className="block font-semibold text-gray-700 mb-1 text-sm">Group</label>
              <select
                name="is_group"
                value={client.is_group ? "Yes" : "No"}
                onChange={(e) =>
                  setClient((prev) => ({
                    ...prev,
                    is_group: e.target.value === "Yes",
                    principal_client_code: e.target.value === "Yes" ? prev.client_code : '',
                    principal_client: e.target.value === "Yes" ? prev.client_name : ''
                  }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="block font-semibold text-gray-700 mb-1 text-sm">Parent Code</label>
              <div className="flex relative">
                <input
                  type="text"
                  value={client.principal_client_code}
                  readOnly
                  className="w-full p-2 border border-gray-300 rounded-l-lg bg-white cursor-pointer outline-none"
                  onClick={openClientModal}
                />
                <button
                  type="button"
                  onClick={openClientModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r-lg transition"
                >
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                </button>
              </div>
            </div>

            <div className="relative w-full md:col-span-4">
              <label className="block font-semibold text-gray-700 mb-1 text-sm">Parent Company Name</label>
              <input
                type="text"
                name="principal_client"
                value={client.principal_client}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-8"
              />
              {client.principal_client && (
                <button
                  type="button"
                  onClick={() =>
                    setClient((prev) => ({
                      ...prev,
                      is_group: false,
                      principal_client_code: '',
                      principal_client: ''
                    }))
                  }
                  className="absolute right-3 top-[32px] text-gray-400 hover:text-red-500 transition"
                >
                  <FontAwesomeIcon icon={faTimesCircle} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Textareas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block font-semibold text-gray-700 mb-1 text-sm">Main Address</label>
            <textarea name="main_address" value={client.main_address || ""} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-[80px] resize-none text-sm"></textarea>
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1 text-sm">Remarks</label>
            <textarea name="remarks" value={client.remarks || ""} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-[80px] resize-none text-sm"></textarea>
          </div>
        </div>

        {/* Application Top Tabs */}
        <div className="bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
          <div className="flex overflow-x-auto bg-blue-600 text-white shadow-inner">
            {APP_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTopTab(tab)}
                className={`flex-1 sm:min-w-[120px] sm:px-4 py-3 font-bold text-[11px] sm:text-sm tracking-wide transition-colors ${activeTopTab === tab ? "bg-white text-blue-600 shadow-[inset_0_4px_6px_rgba(0,0,0,0.1)]" : "hover:bg-blue-700"}`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          {/* Dynamically Render the selected Application Tab Content */}
          {renderAppTabContent()}
          
          {/* Modules and Technicians Assignment Block */}
          <div className="p-3 grid grid-cols-1 lg:grid-cols-3 gap-3 bg-slate-50 border-t border-slate-200 rounded-b-xl">
            {/* Core Modules */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
              <h3 className="font-semibold text-blue-800 mb-3 text-sm uppercase tracking-wide">Core Modules</h3>
              <div className="space-y-0">
                {currentMainModules.map((module) => (
                  <label key={module} className="flex items-center space-x-2 cursor-pointer hover:bg-slate-50 p-1 rounded transition">
                    <input type="checkbox" checked={currentSelectedModules.includes(module)} onChange={() => handleModuleToggle(module)} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <span className="text-sm text-gray-700 font-medium">{module}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Other Modules */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
              <h3 className="font-semibold text-blue-800 mb-3 text-sm uppercase tracking-wide">Other Modules</h3>
              <div className="space-y-0">
                {currentOtherModules.map((module) => (
                  <label key={module} className="flex items-center space-x-2 cursor-pointer hover:bg-slate-50 p-1 rounded transition">
                    <input type="checkbox" checked={currentSelectedModules.includes(module)} onChange={() => handleModuleToggle(module)} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <span className="text-sm text-gray-700 font-medium">{module}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Technicians and Helpdesk Block */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
                 <h3 className="font-semibold text-blue-800 mb-3 text-sm uppercase tracking-wide">Assigned Technical</h3>
                 <div className="space-y-3">
                    {technicianInputs.map((tech, index) => {
                      const techValue = tech.includes(" (") ? tech.split(" (")[0] : tech;
                      return (
                        <div key={index} className="flex items-center gap-2">
                          <select value={techValue} onChange={(e) => handleTechnicianChange(index, e.target.value)} className="flex-1 p-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500">
                            <option value="">Select Technical</option>
                            {technicians.map(name => <option key={name} value={name} disabled={technicianInputs.some(t => t.startsWith(`${name} (`)) && !tech.startsWith(`${name} (`)}>{name} ({technicianCodeMap[name]})</option>)}
                          </select>
                          {index === technicianInputs.length - 1 ? (
                            <button onClick={() => setTabTechnicians(prev => ({ ...prev, [activeTopTab]: [...prev[activeTopTab], ""] }))} className="w-9 h-9 bg-blue-100 text-blue-600 rounded flex items-center justify-center hover:bg-blue-200 transition"><FaPlus /></button>
                          ) : (
                            <button onClick={() => setTabTechnicians(prev => ({ ...prev, [activeTopTab]: prev[activeTopTab].filter((_, i) => i !== index) }))} className="w-9 h-9 bg-red-100 text-red-600 rounded flex items-center justify-center hover:bg-red-200 transition"><FaMinus /></button>
                          )}
                        </div>
                      )
                    })}
                 </div>
              </div>

              {/* Helpdesk inline */}
              <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-blue-800 text-sm uppercase tracking-wide">HelpDesk URL</h3>
                  {!isEditingHelpdesk && <button type="button" onClick={() => setIsEditingHelpdesk(true)} className="text-xs text-blue-600 hover:underline font-bold">Edit</button>}
                </div>
                {!isEditingHelpdesk ? (
                  <div className="text-sm font-medium break-all text-blue-600 hover:underline overflow-hidden text-ellipsis whitespace-nowrap">
                    {client.helpdesk ? <a href={client.helpdesk.startsWith('http') ? client.helpdesk : `https://${client.helpdesk}`} target="_blank" rel="noopener noreferrer">{client.helpdesk}</a> : <span className="text-gray-400 italic">No link provided</span>}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input type="text" name="helpdesk" placeholder="Enter URL" value={client.helpdesk || ""} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500" />
                    <button type="button" onClick={() => setIsEditingHelpdesk(false)} className="text-sm text-green-600 font-bold hover:underline">Done</button>
                  </div>
                )}
              </div>

              {/* Deployment Info */}
              <div className="bg-white rounded-xl shadow p-4 border">
                <h2 className="text-base font-semibold text-blue-800 mb-4">Deployment Info</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Environment</label>
                    <input
                      type="text"
                      name="environment"
                      value={currentContract.environment || ''}
                      onChange={handleChange}
                      className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deployment Type</label>
                    <input
                      type="text"
                      name="deployment_type"
                      value={currentContract.deployment_type || ''}
                      onChange={handleChange}
                      className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Global Bottom Tabs (Contact, Server, Attachment, SMA Info) */}
        <div className="mt-8 bg-slate-100 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-wrap bg-blue-600 text-white rounded-t-xl overflow-hidden shadow-inner">
            {["Contact Information", "Server Information", "Attachment", "SMA Information"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-[150px] py-3 text-sm font-bold tracking-wide transition-colors ${activeTab === tab ? "bg-white text-blue-600 shadow-[inset_0_4px_6px_rgba(0,0,0,0.1)]" : "hover:bg-blue-700"}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-0 bg-white rounded-b-xl">
            
            {/* Contact Tab */}
            {activeTab === "Contact Information" && (
              <div className="p-4 space-y-4">
                <div className="flex justify-end">
                  {/* FIX: Added (prev.contact_persons || []) here to prevent crash on adding a contact to an empty state */}
                  <button onClick={() => setClient(prev => ({...prev, contact_persons: [...(prev.contact_persons || []), {client_code: prev.client_code}]}))} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition flex items-center"><FaPlus className="mr-2"/> Add Contact</button>
                </div>
                
                <div className="hidden md:grid md:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-4 bg-slate-100 p-3 rounded-t-lg font-bold text-slate-700 text-xs uppercase tracking-wide border border-slate-200">
                  <div>Contact Person</div><div>Position</div><div>Contact No.</div><div>Email</div><div className="w-9"></div>
                </div>

                <div className="space-y-3">
                  {/* CORRECT: Guarded map function */}
                  {(client.contact_persons || []).map((person, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 items-center bg-white p-3 md:p-0 border md:border-0 border-slate-200 rounded-lg">
                          <input type="text" placeholder="Contact Person" value={person.contact_person || ''} onChange={e => updateContactField(index, 'contact_person', e.target.value)} className="p-2 border border-gray-300 rounded text-sm w-full outline-none focus:ring-1 focus:ring-blue-500" />
                          <input type="text" placeholder="Position" value={person.position || ''} onChange={e => updateContactField(index, 'position', e.target.value)} className="p-2 border border-gray-300 rounded text-sm w-full outline-none focus:ring-1 focus:ring-blue-500" />
                          <input type="text" placeholder="Contact No." value={person.contact_no || ''} onChange={e => updateContactField(index, 'contact_no', e.target.value)} className="p-2 border border-gray-300 rounded text-sm w-full outline-none focus:ring-1 focus:ring-blue-500" />
                          <input type="email" placeholder="Email" value={person.email_add || ''} onChange={e => updateContactField(index, 'email_add', e.target.value)} className="p-2 border border-gray-300 rounded text-sm w-full outline-none focus:ring-1 focus:ring-blue-500" />
                          <div className="flex justify-end">
                              <button onClick={() => {
                                  // CORRECT: Guarded delete function
                                  const updated = [...(client.contact_persons || [])];
                                  updated.splice(index, 1);
                                  setClient(prev => ({...prev, contact_persons: updated}));
                              }} className="w-9 h-9 bg-red-100 text-red-600 rounded flex items-center justify-center hover:bg-red-200 transition"><FaMinus/></button>
                          </div>
                      </div>
                  ))}
                </div>
              </div>
            )}

            {/* Server Tab */}
            {activeTab === "Server Information" && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Server's Anydesk ID</label>
                  <input type="text" name="remote_id" value={client.remote_id || ""} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Server's Anydesk Password</label>
                  <input type={showRemotePw ? "text" : "password"} name="remote_pw" value={client.remote_pw || ""} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 pr-10" />
                  <button type="button" className="absolute right-3 top-[34px] text-gray-500 hover:text-blue-600 transition" onClick={() => setShowRemotePw(!showRemotePw)}>
                    {showRemotePw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Server's Password</label>
                  <input type={showServerPw ? "text" : "password"} name="server_pw" value={client.server_pw || ""} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 pr-10" />
                  <button type="button" className="absolute right-3 top-[34px] text-gray-500 hover:text-blue-600 transition" onClick={() => setShowServerPw(!showServerPw)}>
                    {showServerPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {/* Attachment Tab */}
            {activeTab === "Attachment" && (
              <div className="flex flex-col">
                <div className="grid grid-cols-2 bg-slate-100 border-b border-slate-200">
                  {ATTACHMENT_TABS.map(({ label, key }) => (
                    <button
                      key={key}
                      onClick={() => { setSelectedAttachmentType(key); fetchClientFiles(); }}
                      className={`py-3 text-sm font-bold transition ${selectedAttachmentType === key ? "bg-white text-blue-600 border-t-2 border-blue-600" : "text-slate-500 hover:bg-slate-200"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {selectedAttachmentType === "clientServiceForm" && renderFileTable("clientServiceForm", clientServiceFiles)}
                {selectedAttachmentType === "turnOver" && renderFileTable("turnOver", turnOverFiles)}
              </div>
            )}

            {/* SMA Info Tab */}
            {activeTab === "SMA Information" && renderFileTable("smaInformation", smaInformationFiles)}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center mt-10">
          <button 
            onClick={handleSave}
            disabled={isSaving} 
            className="bg-blue-600 text-white font-bold tracking-wide px-24 py-2 rounded-xl shadow-lg hover:bg-blue-700 hover:-translate-y-1 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center text-lg"
          >
            {isSaving && <svg className="animate-spin mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>}
            {isSaving ? (isViewMode ? "UPDATING..." : "SAVING...") : (isViewMode ? "UPDATE CLIENT" : "SAVE CLIENT")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddClientForm;