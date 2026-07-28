import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Image as ImageIcon, Sparkles, MapPin, CheckCircle2, RefreshCcw, AlertTriangle, User, ShieldCheck, Phone } from 'lucide-react';
import Header from '../components/Header';
import StepIndicator from '../components/StepIndicator';
import DepartmentIcon from '../components/DepartmentIcon';
import { useLang } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import departments from '../data/departments';
import api from '../utils/api';

// Leaflet layouts components
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function RecenterMap({ lat, lng }) {
  const map = useMapEvents({});
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], map.getZoom());
    }
  }, [lat, lng, map]);
  return null;
}

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function ReportIssue() {
  const { t, lang } = useLang();
  const { user, addComplaint } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [isIrrelevant, setIsIrrelevant] = useState(false); 
  
  const [result, setResult] = useState(null); 
  const [predictedOfficer, setPredictedOfficer] = useState(null);
  const [form, setForm] = useState({
    description: '',
    address: '',
    landmark: '',
    mobile: user?.mobile || '',
    departmentId: null,
    lat: null,
    lng: null
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const onPickFile = (file) => {
    if (!file) return;
    setPhotoFile(file);
    setPhotoUrl(URL.createObjectURL(file));
    setValidationError(null);
    setIsIrrelevant(false);
    setResult(null);
    setPredictedOfficer(null);
    setStep(2);
  };

  useEffect(() => {
    if (step === 3 && !form.lat && !form.lng) {
      handleGetCurrentLocation();
    }
  }, [step]);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log(`🔍 [DEBUG] Browser Geolocation fetched: Lat ${latitude}, Lng ${longitude}`);
          setForm(f => ({ ...f, lat: latitude, lng: longitude }));
          reverseGeocode(latitude, longitude);
          triggerBackgroundSpatialUpdate(latitude, longitude);
        },
        (error) => console.error("Error getting location framework:", error)
      );
    }
  };

  const reverseGeocode = (latitude, longitude) => {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.display_name) {
          setForm(f => ({ ...f, address: data.display_name }));
        }
      })
      .catch(err => console.error("Geocoding failed:", err));
  };

  // Connected live image analysis processing node lifecycle chain
  useEffect(() => {
    if (step !== 2 || !photoFile) return;
    let isMounted = true;
    
    setAnalyzing(true);
    setValidationError(null);
    setIsIrrelevant(false);
    setResult(null);
    setPredictedOfficer(null);

    const checkPayload = new FormData();
    checkPayload.append('file', photoFile);

    const queryLat = form.lat ?? 18.567900;
    const queryLng = form.lng ?? 73.914300;
    const endpoint = `/api/ai/analyze-image?latitude=${queryLat}&longitude=${queryLng}`;

    console.log(`🔍 [DEBUG] STEP 2: Initializing Primary Image Telemetry Post to: ${endpoint}`);

    api.post(endpoint, checkPayload, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    .then((response) => {
      if (!isMounted) return;
      const data = response.data;
      console.log("🔍 [DEBUG] STEP 2: Primary API JSON Payload Received:", data);

      const categoryStr = String(data.category || '').toLowerCase().trim();
      const deptIdStr = String(data.department_id || '').toLowerCase().trim();

      if (categoryStr === 'other' || deptIdStr === 'other') {
        setIsIrrelevant(true);
        setValidationError(
          lang === 'en' 
            ? 'Irrelevant Image Warning: The system determined that this image does not contain a municipal infrastructure or public utility issue. Please upload a relevant photo.' 
            : 'అసంబద్ధమైన చిత్రం: ఈ చిత్రం ప్రజా సమస్యకు సంబంధించినది కాదని AI గుర్తించింది. దయచేసి సరైన ఫోటోను అప్‌లోడ్ చేయండి.'
        );
        setAnalyzing(false);
        return;
      }

      const normalizedResult = {
        issueType: data.category ? String(data.category).replace('_', ' ').toUpperCase() : "GENERAL ISSUE",
        departmentId: data.department_id || "other",
        confidence: data.confidence ? String(data.confidence).toUpperCase() : "HIGH", 
        severity: data.severity || "Medium",
        description: data.description || "",
        locationContext: data.location_context || "No spatial coordinates provided",
        predicted_officer: data.predicted_officer || null
      };

      console.log("🔍 [DEBUG] STEP 2: Binding Predicted Officer Reference to State:", normalizedResult.predicted_officer);

      setResult(normalizedResult);
      setPredictedOfficer(data.predicted_officer || null);
      setForm((f) => ({ 
        ...f, 
        departmentId: normalizedResult.departmentId,
        description: normalizedResult.description,
        lat: f.lat ?? queryLat,
        lng: f.lng ?? queryLng
      }));
      setAnalyzing(false);
    })
    .catch((err) => {
      console.error("AI service communication exception:", err);
      if (isMounted) {
        setValidationError('Failed to process image analysis telemetry. Please try again.');
        setAnalyzing(false);
      }
    });

    return () => { isMounted = false; };
  }, [step, photoFile, lang]);

  // Synchronized absolute master lookup handler route execution block
  const triggerBackgroundSpatialUpdate = async (newLat, newLng) => {
    if (!photoFile || isIrrelevant) return;
    
    console.log(`📡 [DEBUG] Spatial Vector Triggered. Fetching Rematch from Backend API for: Lat ${newLat}, Lng ${newLng}`);
    
    try {
      const checkPayload = new FormData();
      checkPayload.append('file', photoFile);
      const endpoint = `/api/ai/analyze-image?latitude=${newLat}&longitude=${newLng}`;
      
      const response = await api.post(endpoint, checkPayload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data) {
        console.log("📥 [DEBUG] Rematch Payload received from API:", response.data);
        console.log("👤 [DEBUG] Target Officer parsed out of Rematch payload:", response.data.predicted_officer);

        if (response.data.location_context) {
          setResult(prev => prev ? { 
            ...prev, 
            locationContext: response.data.location_context,
            predicted_officer: response.data.predicted_officer 
          } : null);
        }
        
        // Explicit Master State Allocation Hook Overwrite
        setPredictedOfficer(response.data.predicted_officer || null);
      }
    } catch (e) {
      console.warn("Background spatial analysis telemetry updates skipped:", e);
    }
  };

  const handleManualCoordinateChange = (latVal, lngVal) => {
    const validLat = parseFloat(latVal) || 0;
    const validLng = parseFloat(lngVal) || 0;
    
    console.log(`🔍 [DEBUG] Input Mutation Caught - Syncing: Lat ${validLat}, Lng ${validLng}`);
    setForm(f => ({ ...f, lat: validLat, lng: validLng }));
    
    if (validLat && validLng) {
      triggerBackgroundSpatialUpdate(validLat, validLng);
    }
  };

  const retakePhoto = () => {
    setPhotoFile(null);
    setPhotoUrl(null);
    setResult(null);
    setPredictedOfficer(null);
    setValidationError(null);
    setIsIrrelevant(false);
    setStep(1);
  };

  const submit = async () => {
    if (isIrrelevant || !result) return; 
    setSubmitting(true);
    setSubmitError(null);
    try {
      let imageUrl = '';

      if (photoFile) {
        const formData = new FormData();
        formData.append('file', photoFile);
        const uploadRes = await api.post('/api/complaints/upload-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        imageUrl = uploadRes.data.image_url;
      }

      const payload = {
        title: result.issueType,
        description: form.description || `${result.issueType} reported near ${form.address || 'the given location'}.`,
        category: result.issueType,
        priority: result.severity || 'Medium',
        address: form.address,
        landmark: form.landmark || '',
        mobile: form.mobile,
        latitude: parseFloat(form.lat),
        longitude: parseFloat(form.lng),
        department_id: form.departmentId,
        image_url: imageUrl || '',
        ai_result: { 
          prediction: result.issueType, 
          confidence: String(result.confidence || 'high').toLowerCase(),
          location_context: result.locationContext || 'N/A',
          predicted_officer: predictedOfficer 
        },
      };

      const res = await api.post('/api/complaints', payload);

      if (addComplaint) {
        addComplaint({ ...payload, id: res.data.complaint_id, photo: photoUrl });
      }

      navigate(`/report/success/${res.data.complaint_id}`);
    } catch (err) {
      console.error('Failed to submit complaint:', err);
      setSubmitError(
        err.response?.data?.detail || 'Something went wrong while submitting. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDept = departments.find((d) => d.id === form.departmentId);

  return (
    <div className="min-h-screen bg-[#f9fbff] pb-24 text-slate-800">
      <Header showBack />
      <div className="mx-auto max-w-2xl px-4 pt-4">
        <StepIndicator current={step} />

        {/* STEP 1 — Capture */}
        {step === 1 && (
          <div className="mt-6 bg-white border border-slate-100 rounded-2xl p-6 text-center shadow-sm">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">{t('takePhoto')}</h2>
            <div className="mx-auto mt-5 flex aspect-square max-w-xs items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
              <Camera size={40} className="text-slate-300" />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button onClick={() => cameraInputRef.current?.click()} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-sm transition shadow-sm flex items-center justify-center gap-2 cursor-pointer">
                <Camera size={16} /> {t('camera')}
              </button>
              <button onClick={() => galleryInputRef.current?.click()} className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 text-sm transition shadow-sm flex items-center justify-center gap-2 cursor-pointer">
                <ImageIcon size={16} /> {t('gallery')}
              </button>
            </div>
            <p className="mt-3 text-[11px] font-medium text-slate-400">{t('supportedFormats')}</p>

            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" hidden
              onChange={(e) => onPickFile(e.target.files?.[0])} />
            <input ref={galleryInputRef} type="file" accept="image/*" hidden
              onChange={(e) => onPickFile(e.target.files?.[0])} />
          </div>
        )}

        {/* STEP 2 — AI Analysis */}
        {step === 2 && (
          <div className="mt-6 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            {photoUrl && (
              <img src={photoUrl} alt="Captured issue" className="mx-auto mb-5 h-48 w-full max-w-xs rounded-2xl object-cover border border-slate-100 bg-slate-50" />
            )}

            {analyzing ? (
              <div className="text-center py-4">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">{t('aiAnalyzing')}</h2>
                <div className="relative mx-auto my-6 grid h-24 w-24 place-items-center">
                  <div className="absolute inset-0 animate-spin rounded-full border-4 border-slate-100 border-t-blue-600" />
                  <Sparkles size={26} className="text-blue-600 animate-pulse" />
                </div>
                <p className="text-xs font-medium text-slate-400">{t('pleaseWait')}</p>
              </div>
            ) : validationError ? (
              <div className="text-center py-2">
                <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl p-4 flex gap-2.5 items-start text-left mb-5">
                  <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-bold leading-relaxed">{validationError}</p>
                </div>
                <button onClick={retakePhoto} className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 text-sm transition shadow-sm flex items-center justify-center gap-2 cursor-pointer">
                  <RefreshCcw size={15} /> Try Another Image
                </button>
              </div>
            ) : result ? (
              <div>
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 size={20} />
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">{lang === 'en' ? 'Analysis Complete' : 'విశ్లేషణ పూర్తయింది'}</h2>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 p-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('detectedIssue')}</p>
                    <p className="text-sm font-extrabold text-blue-900 mt-0.5">{result.issueType}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('confidence')}</p>
                    <p className="text-sm font-extrabold text-emerald-600 mt-0.5">{result.confidence}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 p-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Estimated Severity</p>
                    <span className={`inline-block text-xs font-bold mt-1 px-2.5 py-0.5 rounded-md border ${
                      result.severity?.toLowerCase() === 'high' ? 'text-red-700 bg-red-50 border-red-100' : 
                      result.severity?.toLowerCase() === 'medium' ? 'text-amber-700 bg-amber-50 border-amber-100' : 
                      'text-slate-700 bg-slate-100 border-slate-200'
                    }`}>
                      {result.severity?.toUpperCase()}
                    </span>
                  </div>
                </div>

                {result.locationContext && result.locationContext !== "No spatial coordinates provided" && (
                  <div className="mt-3 p-3.5 rounded-xl bg-blue-50/40 border border-blue-100 text-xs text-blue-900 leading-relaxed">
                    <span className="font-bold text-blue-800 block mb-0.5">Spatial Proximity Context</span>
                    {result.locationContext}
                  </div>
                )}

                <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-100 p-4 bg-white shadow-inner">
                  <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl" style={{ background: selectedDept?.bg || '#f1f5f9' }}>
                    <DepartmentIcon name={selectedDept?.icon} color={selectedDept?.color || '#475569'} />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900 tracking-tight">{selectedDept?.name[lang] || '—'}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">{t('autoSelected')}</p>
                  </div>
                </div>

                <div className="mt-5 flex gap-3">
                  <button onClick={retakePhoto} className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 text-sm transition flex-1 flex items-center justify-center gap-2 cursor-pointer">
                    <RefreshCcw size={15} /> {t('back')}
                  </button>
                  {!isIrrelevant && (
                    <button onClick={() => setStep(3)} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-sm transition flex-1 cursor-pointer shadow-sm">{t('next')}</button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* STEP 3 — Details */}
        {step === 3 && (
          <div className="mt-6 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">{t('complaintDetails')}</h2>

            {selectedDept && (
              <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 p-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg" style={{ background: selectedDept.bg || '#f1f5f9' }}>
                  <DepartmentIcon name={selectedDept.icon} size={16} color={selectedDept.color || '#475569'} />
                </span>
                <p className="text-sm font-bold text-slate-800">{selectedDept.name[lang]}</p>
                <button onClick={() => setStep(2)} className="ml-auto text-[11px] font-bold text-blue-600 underline cursor-pointer">
                  {t('changeDepartment')}
                </button>
              </div>
            )}

            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">
                  {t('selectLocationOnMap') || 'Select Location on Map'}
                </label>

                {form.lat && form.lng ? (
                  <div className="space-y-3">
                    <div className="h-52 w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm z-0 relative">
                      <MapContainer center={[form.lat, form.lng]} zoom={15} className="h-full w-full" scrollWheelZoom={false}>
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        />
                        <Marker
                          draggable={true}
                          position={[form.lat, form.lng]}
                          eventHandlers={{
                            dragend: (e) => {
                              const marker = e.target;
                              const position = marker.getLatLng();
                              console.log(`📌 [DEBUG] Map Drag End Triggered: Lat ${position.lat}, Lng ${position.lng}`);
                              handleManualCoordinateChange(position.lat, position.lng);
                              reverseGeocode(position.lat, position.lng);
                            }
                          }}
                        />
                        <MapClickHandler
                          onLocationSelect={(lat, lng) => {
                            console.log(`📌 [DEBUG] Map Click Event Triggered: Lat ${lat}, Lng ${lng}`);
                            handleManualCoordinateChange(lat, lng);
                            reverseGeocode(lat, lng);
                          }}
                        />
                        <RecenterMap lat={form.lat} lng={form.lng} />
                      </MapContainer>
                    </div>

                    {/* DYNAMIC METRIC ENTRY FIELDS INPUT BLOCK */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-100 p-3 rounded-xl font-mono text-[11px] font-bold">
                      <div className="space-y-1">
                        <span className="text-slate-400 uppercase tracking-wider block">Latitude Input</span>
                        <input 
                          type="number" 
                          step="0.000001" 
                          value={form.lat || ''} 
                          onChange={(e) => handleManualCoordinateChange(e.target.value, form.lng)} 
                          className="w-full bg-white border border-slate-200 p-2 rounded-lg outline-none font-bold text-slate-800"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-400 uppercase tracking-wider block">Longitude Input</span>
                        <input 
                          type="number" 
                          step="0.000001" 
                          value={form.lng || ''} 
                          onChange={(e) => handleManualCoordinateChange(form.lat, e.target.value)} 
                          className="w-full bg-white border border-slate-200 p-2 rounded-lg outline-none font-bold text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-52 w-full rounded-xl border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-2">
                      <MapPin size={18} className="animate-pulse" />
                    </span>
                    <p className="text-xs font-bold text-slate-700">
                      {t('detectingLocation') || 'Detecting your location...'}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 py-2.5 text-xs font-bold text-slate-600 shadow-sm transition-colors cursor-pointer"
                >
                  <MapPin size={14} /> {t('useCurrentLocation')}
                </button>

                {!form.lat && !form.lng && (
                  <p className="text School-[11px] font-semibold text-red-600">
                    {t('locationRequired') || 'Location is required.'}
                  </p>
                )}
              </div>

              {/* ENHANCED FIELD FORCE OFFICER ASSIGNMENT PREVIEW CARD */}
              {predictedOfficer && (
                <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-xl text-xs space-y-1.5 animate-in fade-in duration-200">
                  <p className="font-black text-emerald-900 flex items-center gap-1">
                    <User size={12} className="text-emerald-600" />
                    {predictedOfficer.is_fallback || predictedOfficer.isFallback
                      ? 'Dynamic System Backup Provisioning' 
                      : 'Live Database Handler Match'}
                  </p>
                  <div className="bg-white p-3 rounded-lg border border-slate-100 space-y-1.5">
                    <div>
                      <p className="font-extrabold text-slate-800 text-sm">{predictedOfficer.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                        {predictedOfficer.rank || "Field Inspector"} • {predictedOfficer.area || "Assigned Sector Ward"}
                      </p>
                    </div>
                    <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-slate-500 font-bold text-[11px]">
                      <span className="flex items-center gap-1 text-slate-400"><Phone size={10} /> Contact Line:</span>
                      <span className="font-mono text-slate-700 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{predictedOfficer.phone || "N/A"}</span>
                    </div>
                  </div>
                </div>
              )}

              {result?.locationContext && result.locationContext !== "No spatial coordinates provided" && (
                <div className="p-3 rounded-xl border border-dashed border-blue-200 bg-blue-50/20 text-[11px] text-blue-800 leading-relaxed">
                  <strong>Current Position Context:</strong> {result.locationContext}
                </div>
              )}

              <Field label={t('description')}>
                <textarea rows={3} value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder={`${result?.issueType || ''}...`} className="w-full text-sm font-semibold border border-slate-200 bg-white px-4 py-3 rounded-xl outline-none focus:border-blue-500 resize-none" />
              </Field>

              <Field label={`${t('address')} *`}>
                <input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="Main Road, Near Bus Stand" className="w-full text-sm font-semibold border border-slate-200 bg-white px-4 py-3 rounded-xl outline-none focus:border-blue-500" />
              </Field>

              <Field label={t('landmark')}>
                <input value={form.landmark} onChange={(e) => setForm((f) => ({ ...f, landmark: e.target.value }))}
                  placeholder="Opposite to SBI Bank" className="w-full text-sm font-semibold border border-slate-200 bg-white px-4 py-3 rounded-xl outline-none focus:border-blue-500" />
              </Field>

              <Field label={`${t('mobileNumber')} *`}>
                <input
                  type="tel" inputMode="numeric" maxLength={10}
                  value={form.mobile}
                  onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value.replace(/\D/g, '') }))}
                  placeholder={t('enterMobile')} className="w-full text-sm font-semibold border border-slate-200 bg-white px-4 py-3 rounded-xl outline-none focus:border-blue-500"
                />
                <p className="mt-1 text-[11px] text-slate-400 font-medium">{t('mobileRequired')}</p>
              </Field>
            </div>

            <div className="mt-5 flex gap-3">
              <button onClick={() => setStep(2)} className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 text-sm transition flex-1 cursor-pointer">{t('back')}</button>
              <button
                disabled={!/^\d{10}$/.test(form.mobile) || !form.address.trim() || !form.lat || !form.lng || isIrrelevant}
                onClick={() => setStep(4)}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 text-sm transition flex-1 cursor-pointer shadow-sm"
              >
                {t('next')}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 — Review & Submit */}
        {step === 4 && (
          <div className="mt-6 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">{t('reviewSubmit')}</h2>

            <dl className="mt-4 divide-y divide-slate-100 text-sm">
              <RouteRow label={t('department')} value={selectedDept?.name[lang]} />
              <RouteRow label={t('issue')} value={result?.issueType} />
              <RouteRow label={t('address')} value={form.address} />
              <RouteRow label={t('landmark')} value={form.landmark || '—'} />
              <RouteRow label={t('mobileNumber')} value={form.mobile} mono />
              <RouteRow
                label={t('location')}
                value={form.lat && form.lng ? `${form.lat.toFixed(6)}, ${form.lng.toFixed(6)}` : '—'}
                mono
              />
              
              {/* TARGET FIELD FORCE ALLOCATION IN FINAL DISPATCH OVERVIEW */}
              {predictedOfficer && (
                <div className="py-3 border-t border-slate-100 flex flex-col gap-1">
                  <div className="flex justify-between items-center gap-3 py-1">
                    <dt className="text-slate-500 font-medium flex items-center gap-1">
                      <ShieldCheck size={14} className="text-emerald-600" /> Target Field Handler
                    </dt>
                    <dd className="text-right font-extrabold text-slate-800 text-sm">
                      {predictedOfficer.name}
                    </dd>
                  </div>
                  <div className="flex justify-between items-center gap-3 pb-1 text-xs">
                    <dt className="text-slate-400 font-medium pl-5">Contact Hotline</dt>
                    <dd className="text-right font-mono font-bold text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                      {predictedOfficer.phone || "—"}
                    </dd>
                  </div>
                </div>
              )}

              {result?.locationContext && result.locationContext !== "No spatial coordinates provided" && (
                <div className="py-2.5 text-xs text-slate-500 leading-normal bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 mt-1">
                  <span className="font-bold text-slate-700 block mb-0.5">Spatial Insights</span>
                  {result.locationContext}
                </div>
              )}
            </dl>

            {photoUrl && (
              <div className="mt-4">
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('photo')}</p>
                <img src={photoUrl} alt="Complaint" className="h-28 w-28 rounded-xl object-cover border border-slate-100" />
              </div>
            )}

            {submitError && (
              <p className="mt-4 text-center text-xs font-bold text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl">{submitError}</p>
            )}

            <div className="mt-5 flex gap-3">
              <button onClick={() => setStep(3)} className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 text-sm transition flex-1 cursor-pointer" disabled={submitting}>
                {t('back')}
              </button>
              <button
                onClick={submit}
                disabled={submitting || isIrrelevant}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 text-sm transition flex-1 shadow-sm cursor-pointer"
              >
                {submitting ? '...' : t('submitComplaint')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function RouteRow({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <dt className="text-slate-500 font-medium">{label}</dt>
      <dd className={`text-right font-bold text-slate-900 ${mono ? 'font-mono text-xs' : ''}`}>{value}</dd>
    </div>
  );
}