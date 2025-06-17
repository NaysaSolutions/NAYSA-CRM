import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUser, faSignOutAlt, faArrowLeft, faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useLocation } from "react-router-dom";
import { FaMinus, FaPlus } from "react-icons/fa";
import axios from 'axios';
import Swal from 'sweetalert2';
import bcrypt from 'bcryptjs';
import { FaTrash, FaDownload, FaEye } from 'react-icons/fa';

import FileUpload from "./FileUpload";
import { BASE_URL } from '../api';

const AddClientForm = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [currentFileType, setCurrentFileType] = useState('');
  const [fileSignedDate, setFileSignedDate] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedAttachmentType, setSelectedAttachmentType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

const toggleFields = [
  { label: "Active", key: "active" },
  { label: "Redeemed", key: "redeemed" },
  { label: "Cancelled", key: "cancelled" },
];

const toggleVisibilityMap = {
  "VOUCHERS": ["redeemed", "cancelled", "active"],
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
  

  const [activeTab, setActiveTab] = useState("Contact Information");

  // START MODULE

const mapTogglesToYN = (toggles) => ({
  redeemed: toggles.redeemed ? "Y" : "N",
  cancelled: toggles.cancelled ? "Y" : "N",
  active: toggles.active ? "Y" : "N"
});

const [activeTopTab, setActiveTopTab] = useState("VOUCHERS");
const [tabTechnicians, setTabTechnicians] = useState({
  VOUCHERS: [""],
});


  const [tabModules, setTabModules] = useState({
  "VOUCHERS": [],
});

const [tabMainModules, setTabMainModules] = useState({

  "VOUCHERS": [
    // "Accounting & Bookkeeping",
    // "Graphic Design",
    // "Digital Marketing",
    // "Personal Training",
    // "Virtual Assistance",
    // "IT Support & Maintenance",],

    "Haircut",
    "Hair Styling",
    "Hair Wash / Treatment",
    "Beard & Shaving",
    "Foot Spa",
    "Facial Treatment",]

});


// Now you can safely access these
const technicianInputs = tabTechnicians[activeTopTab] || [{ name: "", code: "" }];
const selectedModules = tabModules[activeTopTab] || [];


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

const handleTechnicianChange = (index, selectedName) => {

    const selectedCode = technicianCodeMap[selectedName];

    setTabTechnicians(prev => {
        // Create a mutable copy of the current tab's technicians array
        const newInputs = [...(prev[activeTopTab] || [])];

        // Update the item at the given index with the new object { name, code }
        newInputs[index] = { name: selectedName, code: selectedCode };

        return {
            ...prev,
            [activeTopTab]: newInputs
        };
    });
};

const addTechnicianInput = () => {
    setTabTechnicians(prev => {
        const currentInputs = prev[activeTopTab] || []; // Start with an empty array if none
        return {
            ...prev,
            [activeTopTab]: [...currentInputs, { name: "", code: "" }] // Add an empty technician object
        };
    });
};

const removeTechnicianInput = (index) => {
    setTabTechnicians(prev => {
        const currentInputs = prev[activeTopTab] || [];
        const newInputs = currentInputs.filter((_, i) => i !== index);

        return {
            ...prev,
            [activeTopTab]: newInputs.length > 0 ? newInputs : [{ name: "", code: "" }]
        };
    });
};

  const [client, setClient] = useState({
  voucher_code: "",
  issued_branch: "",
  redeemed_branch: "",
  redeemed_date: "",
  amount: "",
  active: "",
  redeemed: "",
  cancelled: "",
  contact_persons: ["", ""]
});


const initialToggleStatePerTab = {
  redeemed: false,
  cancelled: false,
  active: false
};

const [toggles, setToggles] = useState({
  "VOUCHERS": { ...initialToggleStatePerTab },
});



  const technicians = [
    "France Rosimo",
    "Danica Castillo",
    "Anjeaneth Alarcon",
    "Arvee Aurelio",
    "Jomel Mendoza",
    "Gerard Mendoza"
  ];
  
  const technicianCodeMap = {
    "Danica Castillo": "DGC",
    "France Rosimo": "FLR",
    "Anjeaneth Alarcon": "MAA",
    "Arvee Aurelio": "AGA",
    "Jomel Mendoza": "JBM",
    "Gerard Mendoza": "GSM",
  };


  const currentMainModules = tabMainModules[activeTopTab] || [];
  const currentSelectedModules = tabModules[activeTopTab] || [];

  // Scroll handling
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.pageYOffset > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



// inside your component:
useEffect(() => {
  if (activeTab === "Attachments") {
    setSelectedAttachmentType("Client Service Form");
  }
}, [activeTab]);

useEffect(() => {
  if (location.state) {
    setClient(location.state);
    setIsViewMode(true);
    fetchClientData(location.state.voucher_code, activeTopTab)
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



  // Fetch client files when client code changes
  useEffect(() => {
    if (client.voucher_code) {
      fetchClientFiles();
    }
  }, [client.voucher_code]);

const [hasLoadedToggles, setHasLoadedToggles] = useState(false);


    const fetchClientFiles = async () => {
        try {

            const [csResponse, toResponse, smaResponse] = await Promise.all([
                fetch(`${BASE_URL}/client-files/${client.voucher_code}/clientService`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }),
                fetch(`${BASE_URL}/client-files/${client.voucher_code}/turnOver`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }),
                fetch(`${BASE_URL}/client-files/${client.voucher_code}/smaInformation`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                })
            ]);

            // Check if responses are OK before parsing JSON
            if (!csResponse.ok) throw new Error(`Client Service files fetch failed: ${csResponse.statusText}`);
            if (!toResponse.ok) throw new Error(`Turn Over files fetch failed: ${toResponse.statusText}`);
            if (!smaResponse.ok) throw new Error(`SMA Information files fetch failed: ${smaResponse.statusText}`);

            const csData = await csResponse.json();
            const toData = await toResponse.json();
            const smaData = await smaResponse.json();

            if (csData.success) setclientServiceFiles(csData.files);
            else console.warn('Client Service files API reported non-success:', csData.error); // Warn instead of erroring
            if (toData.success) setTurnOverFiles(toData.files);
            else console.warn('Turn Over files API reported non-success:', toData.error);
            if (smaData.success) setSmaInformationFiles(smaData.files);
            else console.warn('SMA Information files API reported non-success:', smaData.error);

        } catch (error) {
            console.error('Error fetching files:', error);
        }
    };

    const fetchClientData = async (clientCode, appType) => {
        console.log('[fetchClientData] Fetching data for client:', clientCode, appType);
        setIsLoading(true);

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

            const response = await fetch(`${BASE_URL}/load-client-data?voucher_code=${clientCode}&app_type=${appType}`, { headers });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Request failed:', errorText);
                if (response.status === 401) navigate('/login');
                throw new Error(errorText || 'Request failed');
            }

            const data = await response.json();
            console.log('Raw API response:', data);

            if (!data.success) {
                // If the backend returns success:false with a 200 OK status, handle it here.
                throw new Error(data.error || 'API request reported non-success');
            }

            // Moved formatDate definition here for better scope (though it was fine before)
            const formatDate = (date) => {
                if (!date) return '';

                let dateObj;
                if (date instanceof Date) {
                    dateObj = date;
                } else if (typeof date === 'string') {
                    const datePart = date.split(' ')[0];
                    dateObj = new Date(datePart);
                } else {
                    dateObj = new Date(date);
                }

                if (isNaN(dateObj.getTime())) return ''; // Use getTime() for robust NaN check

                const year = dateObj.getFullYear();
                const month = (`0${dateObj.getMonth() + 1}`).slice(-2);
                const day = (`0${dateObj.getDate()}`).slice(-2);
                return `${year}-${month}-${day}`;
            };


            const clientData = data.clients || {};
            const modulesData = data.modules || [];
            const techniciansData = data.technicians || []; // Renamed from receivedTechnicians
            const contactDetailsData = data.client_contact || []; // Renamed from contacts

            const technicianObjects = techniciansData.map(tech => {
                const name = Object.entries(technicianCodeMap).find(([_, c]) => c === tech.tech_code)?.[0] || tech.tech_code;
                return { name: name, code: tech.tech_code };
            });

            const transformedClient = {
                voucher_code: clientData.voucher_code || '',
                issued_branch: clientData.issued_branch || '',
                redeemed_branch: clientData.redeemed_branch || '',
                redeemed_date: formatDate(clientData.redeemed_date || ''),
                amount: clientData.amount || '',
                active: clientData.active || 'N',
                redeemed: clientData.redeemed || 'N',
                cancelled: clientData.cancelled || 'N',
            };

            setClient({
                ...transformedClient,
                contact_persons: contactDetailsData // Assign directly
            });

            setTabTechnicians(prev => ({
                ...prev,
                [appType]: [...technicianObjects, { name: "", code: "" }]
            }));

            // If `clientTechnicians` state is still used elsewhere for just codes:
            setClientTechnicians(techniciansData.map(t => t.tech_code));


            setTabModules(prev => ({
                ...prev,
                [appType]: modulesData.map(m => m.module_name) || [] // Use `modulesData`
            }));

            setApplications(data.applications || []); // Keep this if your API might provide it

            return { // Return relevant data for useEffect outside
                clients: transformedClient,
                modules: modulesData,
                technicians: techniciansData,
                client_contact: contactDetailsData,
                applications: data.applications // Include if truly part of the response
            };


        } catch (error) {
            console.error('Error fetching client data:', error);
            alert(`Error loading client data: ${error.message}`); // Simple alert for immediate feedback
            throw error; // Re-throw to allow outer catch blocks to handle if needed
        } finally {
            setIsLoading(false);
        }
    };


const fetchDefaultClientCode = async () => {
  try {
    const apiBase = process.env.NODE_ENV === 'development' 
      ? 'http://127.0.0.1:8000/api' 
      : 'http://192.168.56.1:82/api';

    const response = await fetch(`${apiBase}/clients/default-code`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();

    if (data.success && data.voucher_code) {
      setClient(prev => ({
        ...prev,
        voucher_code: data.voucher_code
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


const initialToggleState = {
  redeemed: false,
  cancelled: false,
  active: false,
};

const handleToggle = (key) => {
    setToggles(prevToggles => {
        const currentTabToggles = prevToggles[activeTopTab] || { ...initialToggleStatePerTab };
        const newValue = !currentTabToggles[key]; // Boolean: true or false

        // Update the client state immediately with 'Y' or 'N'
        setClient(prevClient => ({
            ...prevClient,
            [key]: newValue ? "Y" : "N", // Convert boolean to 'Y' or 'N'
        }));

        return {
            ...prevToggles,
            [activeTopTab]: {
                ...currentTabToggles,
                [key]: newValue,
            }
        };
    });
};

// 1. Update the useEffect that loads toggles from client data
useEffect(() => {
  // Load toggles from client object instead of clientcontracts
  if (client.voucher_code) {
    setToggles(prev => ({
      ...prev,
      [activeTopTab]: {
        redeemed: client.redeemed === "Y",
        cancelled: client.cancelled === "Y", 
        active: client.active === "Y"
      }
    }));
  }
}, [client, activeTopTab]); // Watch client instead of clientcontracts


  const handleAddFileClick = (type) => {
    setCurrentFileType(type);
    setShowFileModal(true);
  };

  const handleFileSelect = async (files, uploadDate, signedDate) => {
  const getApiBase = () => {
    return process.env.NODE_ENV === 'development' 
      ? 'http://127.0.0.1:8000/api' 
      : 'http://192.168.56.1:82/api';
  };

  if (files.length === 0) return { success: false, message: 'No files selected' };
  
  setIsUploading(true);
  try {
    // Optimistically update UI with the new files
    const tempFiles = files.map(fileObj => ({
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fileName: fileObj.file.name,
      uploadDate,
      signedDate,
      fileType: currentFileType,
      original_name: fileObj.file.name,
      status: 'uploading'
    }));

    // Update the appropriate file list immediately using functional update
    const updateFileState = (prevFiles) => [...prevFiles, ...tempFiles];
    
    switch(currentFileType) {
      case 'clientServiceForm':
        setclientServiceFiles(updateFileState);
        break;
      case 'turnOver':
        setTurnOverFiles(updateFileState);
        break;
      case 'smaInformation':
        setSmaInformationFiles(updateFileState);
        break;
      default:
        break;
    }

    // Proceed with actual upload
    const results = [];
    
    for (const fileObj of files) {
      const file = fileObj.file;
      
      const idResponse = await fetch(`${getApiBase()}/generate-id`, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!idResponse.ok) {
        throw new Error(`Server returned ${idResponse.status}`);
      }
      
      const idData = await idResponse.json();
      if (!idData.success || !idData.file_id) {
        throw new Error(idData.message || 'Invalid ID received');
      }
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('file_id', idData.file_id);
      formData.append('client_code', client.voucher_code);
      formData.append('file_name', file.name);
      formData.append('file_type', currentFileType);
      formData.append('upload_date', uploadDate);
      formData.append('signed_date', signedDate || null);

      const uploadResponse = await fetch(`${getApiBase()}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const result = await uploadResponse.json();
      results.push({
        file_id: idData.file_id,
        original_name: file.name,
        upload_date: uploadDate,
        signed_date: signedDate,
        file_type: currentFileType,
        path: result.path
      });
    }

    // Update state with final uploaded files (replacing temp files)
    const updateFinalState = (prevFiles) => [
      ...prevFiles.filter(f => !f.id?.includes('temp-')), // Remove temp files
      ...results
    ];

    switch(currentFileType) {
      case 'clientServiceForm':
        setclientServiceFiles(updateFinalState);
        break;
      case 'turnOver':
        setTurnOverFiles(updateFinalState);
        break;
      case 'smaInformation':
        setSmaInformationFiles(updateFinalState);
        break;
      default:
        break;
    }

    return { success: true, message: `${files.length} files uploaded successfully` };
    
  } catch (error) {
    console.error('Upload failed:', error);
    // Remove failed uploads from state
    const removeTempFiles = (prevFiles) => prevFiles.filter(f => !f.id?.includes('temp-'));
    
    switch(currentFileType) {
      case 'clientServiceForm':
        setclientServiceFiles(removeTempFiles);
        break;
      case 'turnOver':
        setTurnOverFiles(removeTempFiles);
        break;
      case 'smaInformation':
        setSmaInformationFiles(removeTempFiles);
        break;
      default:
        break;
    }
    
    return { success: false, message: error.message || 'Upload failed' };
  } finally {
    setIsUploading(false);
  }
};

const handleDeleteFile = async (file) => {
  const result = await Swal.fire({
    title: `Delete "${file.original_name}"?`,
    text: "This action cannot be undone.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel'
  });

  if (!result.isConfirmed) return;

  try {
    const response = await axios.delete(`http://127.0.0.1:8000/api/files/${file.file_id}`);
    if (response.data.success) {
      Swal.fire('Deleted!', response.data.message, 'success');
      fetchClientFiles(); // Refresh list
    } else {
      Swal.fire('Error', response.data.message, 'error');
    }
  } catch (error) {
    console.error('Delete failed', error);
    Swal.fire('Error', 'Failed to delete the file.', 'error');
  }
};

  const handleViewFile = async (file) => {

    const getApiBase = () => {
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

  // Fields that belong to client object (not contracts)
  const clientFields = [
    'voucher_code',
    'issued_branch', 
    'redeemed_branch',
    'redeemed_date',
    'amount',
    'active',
    'redeemed', 
    'cancelled',
  ];

if (['active', 'redeemed', 'cancelled'].includes(name)) {
        let updatedValue = value;
        if (type === 'checkbox') { // This path is likely not hit by your current toggle implementation
            updatedValue = checked ? "Y" : "N";
        } else {
            updatedValue = value.toUpperCase() === "Y" ? "Y" : "N"; // This path is also not directly hit by a typical toggle UI
        }

        setClient(prev => ({
            ...prev,
            [name]: updatedValue,
        }));

        // Also update toggles UI state
        setToggles(prev => ({
            ...prev,
            [activeTopTab]: {
                ...prev[activeTopTab],
                [name]: updatedValue === "Y"
            }
        }));
    } else {
        // For non-toggle client fields
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

const handleSave = async () => {
  const moduleCodeMap = {
    "Accounting & Bookkeeping": 'Accounting & Bookkeeping',
    "Graphic Design": 'Graphic Design',
    "Digital Marketing": 'Digital Marketing',
    "Personal Training": 'Personal Training',
    "Virtual Assistance": 'Virtual Assistance',
    "IT Support & Maintenance": 'IT Support & Maintenance',
  };

  try {
    setIsSaving(true);

    const techniciansToSave = (tabTechnicians[activeTopTab] || [])
      .filter(t => t.name !== ""); // Filter based on the 'name' property of the object

    // Flatten all technicians across tabs with app_type
    const clientTechnicalsPayload = Object.entries(tabTechnicians).flatMap(
      ([appType, technicians]) =>
        // 't' here is also an object { name, code }
        technicians
          .filter(t => t.name !== "") // Filter based on the 'name' property
          .map(t => {
            return {
              tech_code: t.code, // Access the 'code' property of the object
              app_type: appType
            };
          })
    );

    // The rest of your payloads and logic remain the same as they were already correct for objects
    const clientModulesPayload = Object.entries(tabModules).flatMap(
      ([appType, selectedModules]) => {
        const allowedModules = [
          ...(tabMainModules[appType] || []),
        ];

        return selectedModules
          .filter(moduleName => allowedModules.includes(moduleName))
          .map(moduleName => ({
            module_name: moduleName,
            module_code: moduleCodeMap[moduleName] || null,
            module_type: appType
          }));
      }
    );

    console.log("Client Modules Payload:", clientModulesPayload);

    const clientContactPayload = (client.contact_persons || [])
      .filter(p => p.contact_person?.trim())
      .map(p => ({
        voucher_code: client.voucher_code,
        contact_person: p.contact_person?.trim() || '',
        position: p.position?.trim() || '',
        contact_no: p.contact_no?.trim() || '',
        email_add: p.email_add?.trim() || ''
      }));

    const formatDate = (date) => {
      if (!date) return '';
      const d = new Date(date);
      if (isNaN(d)) return '';
      const year = d.getFullYear();
      const month = (`0${d.getMonth() + 1}`).slice(-2);
      const day = (`0${d.getDate()}`).slice(-2);
      return `${year}-${month}-${day}`;
    };

    console.log('Saving client contact payload:', client.contact_persons);

    const payload = {
      mode: 'Upsert',
      params: JSON.stringify({
        json_data: {
          voucher_code: client.voucher_code,
          issued_branch: client.issued_branch,
          redeemed_branch: client.redeemed_branch,
          redeemed_date: formatDate(client.redeemed_date),
          amount: client.amount,
          active: client.active,
          redeemed: client.redeemed,
          cancelled: client.cancelled,

          client_modules: clientModulesPayload,
          client_technicals: clientTechnicalsPayload, // This is the fixed payload
          client_contact: clientContactPayload,
        },
      })
    };

    const apiBase = process.env.NODE_ENV === 'development'
      ? 'http://127.0.0.1:8000/api'
      : 'http://192.168.56.1:82/api';

    const response = await axios.post(`${apiBase}/client/save`, payload, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      }
    });

    if (response.data.success) {
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Client data saved successfully'
      });

    } else {
      throw new Error(response.data.message || 'Save failed');
    }
  } catch (error) {
    console.error('Save error:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: `Error saving client: ${error.message}`
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
        voucher_code: prev.voucher_code, // ✅ ensure voucher_code is included
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



  return (
    <div className="p-2 bg-white min-h-screen mt-2">

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


      {/* Title */}
      <div className="sticky top-0 z-50 bg-blue-600 shadow-xl p-4 mb-2 mt-12 rounded-lg text-white">
        <h1 className="text-2xl font-semibold">
          {isViewMode
            ? `Voucher Information${client.issued_branch ? `: ${client.issued_branch}` : ""}`
            : "Add New Voucher Information"}
        </h1>
      </div>



      <div className="bg-white shadow-xl p-0 rounded-lg">


{/* APPLICATION TABS */}
<div className="text-sm lg:text-base bg-blue-100">
  <div className="grid grid-cols-2 sm:flex sm:justify-between bg-blue-600 text-white rounded-t-xl px-2 py-2 gap-2">
    {["VOUCHERS"].map((tab) => (
      <button
        key={tab}
        onClick={() => setActiveTopTab(tab)}
        className={`w-full text-center px-4 py-2 font-semibold rounded-t-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white
          ${
            activeTopTab === tab
              ? "bg-white text-blue-600 shadow-md"
              : "opacity-80 hover:opacity-100"
          }`}
      >
        {tab}
      </button>
    ))}
  </div>


  {/* Financials Content */}
  {activeTopTab === "VOUCHERS" && (
  <div className="p-4 space-y-6">

 {/* Contract Details + Toggles in One Row */}
<div className="flex flex-col lg:flex-row gap-4">

  {/* Contract Section */}
  <div className="flex-1 bg-white rounded-xl shadow p-4 border">
    <h2 className="text-base font-semibold text-blue-800 mb-4">Voucher Details</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Voucher Code</label>
            <input
              type="text"
              name="voucher_code"
              value={client.voucher_code || ""}
              onChange={handleChange}
              disabled
              className="mt-1 p-2 border border-gray-300 rounded-lg w-full bg-gray-100 text-gray-500 cursor-not-allowed"
            />
      </div>
          <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Voucher Amount</label>
      <input
        type="number"
        placeholder="0.00"
        name="amount"
        value={client.amount ?? ''}
        onChange={handleChange}
        className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
      />
    </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Branch</label>
        <select
              name="issued_branch"
              value={client.issued_branch || ""}
              onChange={handleChange}
              className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
            >
              <option value="">Select Issuing Branch</option>
              <option value="SM Makati">SM Makati</option>
              <option value="SM Megamall">SM Megamall</option>
              <option value="SM Mall of Asia">SM Mall of Asia</option>
              <option value="SM North EDSA">SM North EDSA</option>
              <option value="One Ayala">One Ayala</option>
              <option value="Trinoma">Trinoma</option>
            </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit</label>
        <select
              name="issued_branch"
              value={client.issued_branch || ""}
              onChange={handleChange}
              className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
            >
              <option value="">Select Usage Limit</option>
              <option value="SM Makati">One Time</option>
              <option value="SM Megamall">Multiple Use</option>
            </select>
      </div>
      

    </div>
  </div>

 <div className="flex-1 bg-white rounded-xl shadow p-4 border">
  <h2 className="text-base font-semibold text-blue-800 mb-4">Redemption</h2>

  {/* Branch of Redemption: full width row */}
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">Branch of Redemption</label>
    <select
      name="redeemed_branch"
      value={client.redeemed_branch || ""}
      onChange={handleChange}
      className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
    >
      <option value="">Select Redeeming Branch</option>
      <option value="SM Makati">SM Makati</option>
      <option value="SM Megamall">SM Megamall</option>
      <option value="SM Mall of Asia">SM Mall of Asia</option>
      <option value="SM North EDSA">SM North EDSA</option>
      <option value="One Ayala">One Ayala</option>
      <option value="Trinoma">Trinoma</option>
    </select>
  </div>

  {/* Date Redeemed and Amount in the same row */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Date Redeemed</label>
      <input
        type="date"
        name="redeemed_date"
        value={client.redeemed_date ?? ''}
        onChange={handleChange}
        className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
      <input
        type="number"
        placeholder="0.00"
        name="amount"
        value={client.amount ?? ''}
        onChange={handleChange}
        className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
      />
    </div>
    <div>
    <h2 className="text-base font-semibold text-blue-800 mb-4 mt-4">Voucher Status</h2>
    <div className="flex flex-row justify-center gap-2">
      {toggleFields
        .filter(({ key }) => (toggleVisibilityMap[activeTopTab] ?? []).includes(key))
        .map(({ label, key }) => (
          <div key={key} className="flex flex-col items-center w-20">
            <span className="text-sm font-medium text-gray-600 text-center">{label}</span>
            <button
              className={`relative w-10 h-6 transition duration-200 ease-in-out rounded-full ${
                toggles[activeTopTab]?.[key] ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              onClick={() => handleToggle(key)}
            >
              <span
                className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  toggles[activeTopTab]?.[key] ? 'translate-x-4' : ''
                }`}
              />
            </button>
          </div>
        ))}
    </div>
    </div>
    
  </div>
</div>



  {/* Toggles */}
  <div className="w-full lg:w-1/3 bg-white rounded-xl shadow p-4 border">
    <h2 className="text-base font-semibold text-blue-800 mb-12">Voucher Status</h2>
    <div className="flex flex-wrap justify-center gap-2">
      {toggleFields
        .filter(({ key }) => (toggleVisibilityMap[activeTopTab] ?? []).includes(key))
        .map(({ label, key }) => (
          <div key={key} className="flex flex-col items-center w-20">
            <span className="text-sm font-medium text-gray-600 text-center">{label}</span>
            <button
              className={`relative w-10 h-6 transition duration-200 ease-in-out rounded-full ${
                toggles[activeTopTab]?.[key] ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              onClick={() => handleToggle(key)}
            >
              <span
                className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  toggles[activeTopTab]?.[key] ? 'translate-x-4' : ''
                }`}
              />
            </button>
          </div>
        ))}
    </div>
  </div>

</div>



   

  </div>
)}
{/* Modules Section */}
<div className="p-4 space-y-6">
  {/* Modules & Technicians Row */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">

    {/* Main Modules Card */}
    <div className="bg-white rounded-xl shadow p-4 border">
      <h3 className="text-base font-semibold text-blue-800 mb-4">Applicable Services</h3>
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

    {/* Technicians Card */}
    <div className="bg-white rounded-xl shadow p-4 border">
      <h3 className="text-base font-semibold text-blue-800 mb-4">Assigned Personnel</h3>
      <div className="space-y-3">
        {technicianInputs.map((tech, index) => {
          // Access the 'name' property of the technician object
          const techName = tech.name || ""; // Use empty string if name is undefined/null

          return (
            <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-2">
              <select
                // Use techName (the name property) as the value for the select
                value={techName}
                onChange={(e) => handleTechnicianChange(index, e.target.value)}
                className={`flex-1 p-2 border border-gray-300 rounded-md text-sm ${
                  techName === '' ? 'text-blue-700' : 'text-gray-800'
                }`}
              >
                <option value="">Select Assigned Personnel</option>
                {technicians.map((name) => ( // 'technicians' array is still just names
                  <option
                    key={name}
                    value={name}
                    disabled={
                      technicianInputs.some((existingTech, i) =>
                        i !== index && existingTech.name === name
                      )
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

  {/* Save Button */}
  <div className="flex justify-center">
    <button
      onClick={handleSave}
      disabled={isSaving}
      className={`px-20 py-2 font-semibold rounded-lg shadow-md transition duration-300 ${
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
  </div>
</div>
        </div>




        {/* APPLICATION TABS */}
<div className="mt-6 text-sm lg:text-base bg-blue-100">
  <div className="grid grid-cols-2 sm:flex sm:justify-between bg-blue-600 text-white rounded-t-xl px-4 py-2 gap-2">
  {["Contact Information", "Attachments"].map((tab) => (
    <button
      key={tab}
      onClick={() => {
        setActiveTab(tab);
        if (tab === "Attachments") setSelectedAttachmentType(null);
      }}
      className={`w-full text-center px-4 py-2 font-semibold rounded-t-md transition-all duration-100
        ${
          activeTab === tab
            ? "bg-white text-blue-600 shadow-md border-b-2 border-blue-600"
            : "opacity-80 hover:opacity-100 hover:bg-blue-500"
        }`}
    >
      {tab}
    </button>
  ))}
</div>



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
      <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 border p-2 rounded shadow-sm items-center bg-white text-sm">
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





 {/* Attachment Tab */}
{activeTab === "Attachment" && (
  <div>

<div className="grid grid-cols-2 sm:flex sm:justify-between bg-blue-600 text-white px-4 py-2 gap-2">
    {["Client Service Form", "Turn-Over Documents"].map((tab) => (
      <button
        key={tab}
      onClick={() => setSelectedAttachmentType(tab)}
        className={`w-full text-center px-4 py-2 font-semibold rounded-t-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white
          ${
            selectedAttachmentType === tab
              ? "bg-white text-blue-600 shadow-md"
              : "opacity-80 hover:opacity-100"
          }`}
      >
        {tab}
      </button>
    ))}
  </div>


    {/* File table */}
    {selectedAttachmentType && (
      <div className="bg-blue-100 rounded-b-md p-4">
    {/* Add File Button */}
    <div className="text-right mb-4">
      <button
        onClick={() => handleAddFileClick('clientService')}
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
                <th className="p-3 text-left whitespace-nowrap">Signed Date</th>
                <th className="p-3 text-center whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clientServiceFiles.map((file) => (
                <tr
                  key={file.file_id}
                  className="border-b hover:bg-blue-50 transition"
                >
                  <td className="p-3 whitespace-nowrap">{file.original_name}</td>
                  <td className="p-3 whitespace-nowrap">
                    {file.upload_date ? new Date(file.upload_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-2 whitespace-nowrap">
                    {file.signed_date ? new Date(file.signed_date).toLocaleDateString() : 'N/A'}
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
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
)}
       

  {/* Voucher Expiry Tab */}
  {activeTab === "Attachments" && (
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
            <th className="p-3 text-left">Date Signed</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {smaInformationFiles.map((file) => (
            <tr key={file.file_id} className="border-b hover:bg-blue-50">
              <td className="p-2">{file.original_name}</td>
              <td className="p-2">
                {file.upload_date ? new Date(file.upload_date).toLocaleDateString() : 'N/A'}
              </td>
              <td className="p-2">
                <input
                  type="date"
                  value={file.signed_date || editedFiles[file.file_id] || ""}
                  onChange={(e) => {
                    setEditedFiles((prev) => ({
                      ...prev,
                      [file.file_id]: e.target.value,
                    }));
                  }}
                  className="border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-400"
                />
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
    </div>
    </div>
  );
};

export default AddClientForm;