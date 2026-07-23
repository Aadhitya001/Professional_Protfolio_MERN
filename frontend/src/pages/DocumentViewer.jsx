import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShieldCheck, FileText, Eye, Download, AlertTriangle, Lock, Clock, CheckCircle, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';

const categoryIcons = {
  'Aadhaar': '🪪',
  'PAN': '💳',
  'Bank Passbook': '🏦',
  'Driving License': '🚗',
  'Passport': '🛂',
  'Marksheet': '📜',
  'Other': '📄'
};

export default function DocumentViewer() {
  const { token } = useParams();
  const [stage, setStage] = useState('verify'); // 'verify' | 'form' | 'docs' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [vaultData, setVaultData] = useState(null);
  const [viewerName, setViewerName] = useState('');
  const [viewerEmail, setViewerEmail] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedDocs, setSelectedDocs] = useState([]);
  // Helper to download a single document
  const downloadDoc = (doc) => {
    const a = document.createElement('a');
    a.href = doc.fileUrl;
    a.download = doc.fileName;
    a.click();
  };
  // Download all selected documents
  const downloadSelected = () => {
    selectedDocs.forEach(downloadDoc);
  };
  const [loading, setLoading] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false);
  const [pdfPages, setPdfPages] = useState([]);
  const [renderingPdf, setRenderingPdf] = useState(false);

  // PDF.js loader helper
  const loadPdfJs = () => {
    return new Promise((resolve, reject) => {
      if (window.pdfjsLib) return resolve(window.pdfjsLib);
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
        resolve(window.pdfjsLib);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  // Convert base64 PDF into an array of JPEG page data URLs
  const convertPdfToJpegs = async (pdfBase64) => {
    const pdfjsLib = await loadPdfJs();
    
    // Parse data URI to ArrayBuffer for reliability
    const base64String = pdfBase64.split(',')[1];
    const byteString = atob(base64String);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    
    const loadingTask = pdfjsLib.getDocument({ data: int8Array });
    const pdf = await loadingTask.promise;
    const pages = [];
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: context, viewport }).promise;
      pages.push(canvas.toDataURL('image/jpeg', 0.85));
    }
    return pages;
  };

  useEffect(() => {
    if (!selectedDoc) {
      setPdfPages([]);
      setRenderingPdf(false);
      return;
    }

    if (selectedDoc.fileType === 'application/pdf') {
      setRenderingPdf(true);
      setPdfPages([]);
      convertPdfToJpegs(selectedDoc.fileUrl)
        .then(pages => {
          setPdfPages(pages);
          setRenderingPdf(false);
        })
        .catch(err => {
          console.error('Error rendering PDF:', err);
          setRenderingPdf(false);
        });
    } else {
      setPdfPages([]);
      setRenderingPdf(false);
    }
  }, [selectedDoc]);


  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/private-docs/view/${token}`);
        if (!res.ok) {
          const data = await res.json();
          setErrorMsg(data.message || 'Access denied.');
          setStage('error');
        } else {
          setStage('form');
        }
      } catch {
        setErrorMsg('Unable to reach the server. Please try again.');
        setStage('error');
      } finally {
        setLoading(false);
      }
    };
    validateToken();
  }, [token]);

  // Security and focus-blur listeners if downloads are disabled
  useEffect(() => {
    if (stage !== 'docs' || !vaultData || vaultData.allowDownload) return;

    const handleBlur = () => setIsBlurred(true);
    const handleFocus = () => setIsBlurred(false);

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      // Block Ctrl+C (copy), Ctrl+S (save), Ctrl+P (print), Ctrl+U (source), F12 & Ctrl+Shift+I (inspect)
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 's' || e.key === 'p' || e.key === 'u' || e.key === 'a')) || 
        e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && e.key === 'I')
      ) {
        e.preventDefault();
        alert('Action restricted for security purposes.');
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [stage, vaultData]);

  const handleIdentitySubmit = async (e) => {
    e.preventDefault();
    if (!viewerName.trim() || !viewerEmail.trim()) return;
    setLoading(true);
    try {
      // Log the viewer
      await fetch(`/api/private-docs/view/${token}/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ viewerName, viewerEmail })
      });
      // Fetch docs
      const res = await fetch(`/api/private-docs/view/${token}`);
      if (res.ok) {
        const data = await res.json();
        setVaultData(data);
        setStage('docs');
      } else {
        const data = await res.json();
        setErrorMsg(data.message);
        setStage('error');
      }
    } catch {
      setErrorMsg('Something went wrong. Please try again.');
      setStage('error');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectDoc = (doc) => {
    setSelectedDocs(prev => {
      if (prev.find(d => d._id === doc._id)) {
        return prev.filter(d => d._id !== doc._id);
      } else {
        return [...prev, doc];
      }
    });
  };

  return (
    <div style={{ ...styles.page, filter: isBlurred ? 'blur(16px)' : 'none', transition: 'filter 0.15s ease' }}>
      {!vaultData?.allowDownload && (
        <style>{`
          @media print {
            body { display: none !important; }
          }
          body {
            user-select: none !important;
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
          }
        `}</style>
      )}
      <div style={styles.bgGlow1} />
      <div style={styles.bgGlow2} />

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.lockIcon}><Lock size={28} /></div>
          <h1 style={styles.title}>Private Document Vault</h1>
          <p style={styles.subtitle}>Secured & Access Controlled</p>
        </div>

        {/* LOADING */}
        {loading && (
          <div style={styles.card}>
            <div style={styles.loadingSpinner} />
            <p style={{ color: '#94a3b8', marginTop: '16px' }}>Verifying access...</p>
          </div>
        )}

        {/* ERROR STATE */}
        {!loading && stage === 'error' && (
          <div style={{ ...styles.card, borderColor: 'rgba(239,68,68,0.3)' }}>
            <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
            <h2 style={{ color: '#ef4444', marginBottom: '12px' }}>Access Denied</h2>
            <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>{errorMsg}</p>
            <p style={{ color: '#64748b', marginTop: '16px', fontSize: '0.85rem' }}>
              If you believe this is a mistake, please contact the document owner.
            </p>
          </div>
        )}

        {/* IDENTITY FORM */}
        {!loading && stage === 'form' && (
          <div style={styles.card}>
            <ShieldCheck size={40} color="#6366f1" style={{ marginBottom: '16px' }} />
            <h2 style={styles.cardTitle}>Confirm Your Identity</h2>
            <p style={styles.cardSubtitle}>
              Please enter your details to access the shared documents. Your information will be logged for security.
            </p>
            <form onSubmit={handleIdentitySubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Your Full Name</label>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="e.g. Rajesh Kumar"
                  value={viewerName}
                  onChange={e => setViewerName(e.target.value)}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Your Email Address</label>
                <input
                  style={styles.input}
                  type="email"
                  placeholder="e.g. rajesh@company.com"
                  value={viewerEmail}
                  onChange={e => setViewerEmail(e.target.value)}
                  required
                />
              </div>
              <div style={styles.warningBox}>
                <AlertTriangle size={14} />
                <span>This access is logged. Do not share this link with others.</span>
              </div>
              <button type="submit" style={styles.submitBtn} disabled={loading}>
                {loading ? 'Verifying...' : '🔓 Access Documents'}
              </button>
            </form>
          </div>
        )}

        {/* DOCUMENTS VIEW */}
        {!loading && stage === 'docs' && vaultData && (
          <div style={{ width: '100%', maxWidth: '800px' }}>
            {/* Access Info Banner */}
            <div style={styles.accessBanner}>
              <CheckCircle size={18} color="#22c55e" />
              <div>
                <div style={{ color: '#22c55e', fontWeight: 600 }}>Access Granted — {vaultData.label}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={12} />
                  Expires: {new Date(vaultData.expiresAt).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Dropdown Menu Document Selector Card */}
            {vaultData.documents.length > 0 && (() => {
              const selectedIndex = vaultData.documents.findIndex(d => String(d._id) === String(selectedDoc?._id));
              return (
                <div style={styles.dropdownCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                    <label style={{ color: '#e2e8f0', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={18} color="#6366f1" /> Select Document (Dropdown View):
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        disabled={selectedIndex <= 0}
                        onClick={() => setSelectedDoc(vaultData.documents[selectedIndex - 1])}
                        style={{ ...styles.docBtn, opacity: selectedIndex <= 0 ? 0.3 : 1, cursor: selectedIndex <= 0 ? 'not-allowed' : 'pointer' }}
                        title="Previous Document"
                      >
                        <ChevronLeft size={16} /> Prev
                      </button>
                      <button
                        disabled={selectedIndex < 0 || selectedIndex >= vaultData.documents.length - 1}
                        onClick={() => setSelectedDoc(vaultData.documents[selectedIndex + 1])}
                        style={{ ...styles.docBtn, opacity: (selectedIndex < 0 || selectedIndex >= vaultData.documents.length - 1) ? 0.3 : 1, cursor: (selectedIndex < 0 || selectedIndex >= vaultData.documents.length - 1) ? 'not-allowed' : 'pointer' }}
                        title="Next Document"
                      >
                        Next <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>

                  <select
                    value={selectedDoc?._id || ''}
                    onChange={(e) => {
                      const doc = vaultData.documents.find(d => String(d._id) === e.target.value);
                      setSelectedDoc(doc || null);
                    }}
                    style={styles.dropdownSelect}
                  >
                    <option value="">-- Select a document to view from dropdown --</option>
                    {vaultData.documents.map((doc, idx) => (
                      <option key={doc._id} value={doc._id}>
                        {idx + 1}. {categoryIcons[doc.category] || '📄'} {doc.title} ({doc.category}) — {doc.fileName}
                      </option>
                    ))}
                  </select>

                  {selectedDoc && (
                    <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', fontSize: '0.85rem', color: '#94a3b8' }}>
                      <div>Document <strong>{selectedIndex + 1}</strong> of <strong>{vaultData.documents.length}</strong>: <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{selectedDoc.title}</span></div>
                      {vaultData.allowDownload && (
                        <button style={styles.downloadBtn} onClick={() => downloadDoc(selectedDoc)}>
                          <Download size={14} style={{ marginRight: '6px' }} /> Download Document
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Preview Panel - Positioned directly under Dropdown Menu for Dropdown View */}
            {selectedDoc && (
              <div style={styles.previewPanel}>
                <div style={styles.previewHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>{categoryIcons[selectedDoc.category] || '📄'}</span>
                    <div>
                      <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '1rem' }}>{selectedDoc.title}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{selectedDoc.category} • {selectedDoc.fileName}</div>
                    </div>
                  </div>
                  <button style={styles.closeBtn} onClick={() => setSelectedDoc(null)}>✕</button>
                </div>
                <div style={styles.previewBody}>
                  {selectedDoc.fileType.startsWith('image/') ? (
                    <div style={{ position: 'relative', display: 'inline-block', overflow: 'hidden' }}>
                      <img 
                        src={selectedDoc.fileUrl} 
                        alt={selectedDoc.title} 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '75vh', 
                          borderRadius: '8px', 
                          objectFit: 'contain',
                          pointerEvents: !vaultData.allowDownload ? 'none' : 'auto',
                          userSelect: 'none',
                          WebkitUserDrag: 'none'
                        }} 
                      />
                      {!vaultData.allowDownload && (
                        <>
                          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, background: 'transparent' }} />
                          <div style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            zIndex: 11,
                            pointerEvents: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0.12,
                            transform: 'rotate(-30deg)',
                            fontSize: '2.5rem',
                            fontWeight: 900,
                            color: '#fff',
                            textTransform: 'uppercase',
                            letterSpacing: '4px',
                            whiteSpace: 'nowrap'
                          }}>
                            CONFIDENTIAL • VIEW ONLY
                          </div>
                        </>
                      )}
                    </div>
                  ) : selectedDoc.fileType === 'application/pdf' ? (
                    <div style={{ width: '100%' }}>
                      {renderingPdf ? (
                        <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                          <div style={styles.loadingSpinner} />
                          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Securing document preview...</p>
                        </div>
                      ) : pdfPages.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxHeight: '75vh', overflowY: 'auto', padding: '10px' }}>
                          {pdfPages.map((pageUrl, idx) => (
                            <div key={idx} style={{ position: 'relative', display: 'inline-block', width: '100%', textAlign: 'center', background: '#0a0a0f', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                              <img 
                                src={pageUrl} 
                                alt={`Page ${idx + 1}`} 
                                style={{ 
                                  maxWidth: '100%', 
                                  borderRadius: '4px',
                                  pointerEvents: !vaultData.allowDownload ? 'none' : 'auto',
                                  userSelect: 'none',
                                  WebkitUserDrag: 'none'
                                }} 
                              />
                              {!vaultData.allowDownload && (
                                <>
                                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, background: 'transparent' }} />
                                  <div style={{
                                    position: 'absolute',
                                    top: 0, left: 0, right: 0, bottom: 0,
                                    zIndex: 11,
                                    pointerEvents: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: 0.1,
                                    transform: 'rotate(-30deg)',
                                    fontSize: '2.5rem',
                                    fontWeight: 900,
                                    color: '#fff',
                                    textTransform: 'uppercase',
                                    letterSpacing: '4px',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    CONFIDENTIAL • VIEW ONLY
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ color: '#ef4444', padding: '40px' }}>
                          <FileText size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                          <p>Failed to generate secure preview.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ color: '#94a3b8', padding: '40px' }}>
                      <FileText size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                      <p>Preview not available.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div style={styles.securityNotice}>
              🔒 These documents are confidential. Unauthorized sharing or reproduction is strictly prohibited.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 50%, #0a0a0f 100%)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '40px 20px 80px',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  bgGlow1: {
    position: 'fixed', top: '-20%', left: '-10%',
    width: '600px', height: '600px',
    background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
    borderRadius: '50%', pointerEvents: 'none',
  },
  bgGlow2: {
    position: 'fixed', bottom: '-20%', right: '-10%',
    width: '500px', height: '500px',
    background: 'radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)',
    borderRadius: '50%', pointerEvents: 'none',
  },
  container: {
    width: '100%', maxWidth: '800px',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '24px', position: 'relative', zIndex: 1,
  },
  header: {
    textAlign: 'center', marginBottom: '8px',
  },
  lockIcon: {
    width: '64px', height: '64px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 16px', color: '#fff',
    boxShadow: '0 0 30px rgba(99,102,241,0.4)',
  },
  title: {
    fontSize: '2rem', fontWeight: 700, margin: 0,
    background: 'linear-gradient(135deg, #e2e8f0, #a5b4fc)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    color: '#64748b', marginTop: '8px', fontSize: '0.9rem',
  },
  card: {
    width: '100%', maxWidth: '480px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px', padding: '40px 36px',
    backdropFilter: 'blur(20px)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    textAlign: 'center',
  },
  cardTitle: {
    color: '#e2e8f0', fontSize: '1.4rem', fontWeight: 600, margin: '0 0 10px',
  },
  cardSubtitle: {
    color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '28px',
  },
  form: { width: '100%' },
  formGroup: { marginBottom: '18px', textAlign: 'left' },
  label: { display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '6px', fontWeight: 500 },
  input: {
    width: '100%', padding: '11px 14px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', color: '#e2e8f0',
    fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
  },
  warningBox: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
    borderRadius: '8px', padding: '10px 14px', color: '#f59e0b',
    fontSize: '0.8rem', marginBottom: '20px',
  },
  submitBtn: {
    width: '100%', padding: '12px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: 'none', borderRadius: '8px', color: '#fff',
    fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  accessBanner: {
    display: 'flex', alignItems: 'center', gap: '12px',
    background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
    borderRadius: '12px', padding: '14px 18px', marginBottom: '24px',
  },
  docsGrid: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' },
  docCard: {
    display: 'flex', alignItems: 'center', gap: '16px',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px', padding: '16px 20px', cursor: 'pointer',
    transition: 'border-color 0.2s, background 0.2s',
  },
  docIcon: { fontSize: '2rem', lineHeight: 1 },
  docTitle: { color: '#e2e8f0', fontWeight: 600, fontSize: '0.95rem' },
  docMeta: { color: '#64748b', fontSize: '0.8rem', marginTop: '4px' },
  docActions: { display: 'flex', gap: '8px', marginLeft: 'auto' },
  docBtn: {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', padding: '8px', color: '#94a3b8', cursor: 'pointer',
    display: 'flex', alignItems: 'center',
  },
  previewPanel: {
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px', overflow: 'hidden', marginBottom: '24px',
  },
  previewHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.03)',
  },
  closeBtn: {
    background: 'none', border: 'none', color: '#94a3b8',
    cursor: 'pointer', fontSize: '1.1rem', padding: '4px 8px',
  },
  previewBody: {
    padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center',
    background: '#0d0d1a',
  },
  securityNotice: {
    color: '#475569', fontSize: '0.8rem', textAlign: 'center',
    padding: '14px', background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px',
  },
  selectBar: { display: 'flex', gap: '12px', marginBottom: '16px' },
  selectBtn: { background: 'linear-gradient(135deg, #10b981, #06b6d4)', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer' },
  downloadBtn: { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer' },
  docCheckbox: { width: '16px', height: '16px', marginRight: '8px' },
  dropdownCard: {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    borderRadius: '14px',
    padding: '18px 22px',
    marginBottom: '24px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
  },
  dropdownSelect: {
    width: '100%',
    padding: '12px 16px',
    background: '#0f172a',
    border: '1px solid #6366f1',
    borderRadius: '8px',
    color: '#f8fafc',
    fontSize: '0.95rem',
    fontWeight: '500',
    outline: 'none',
    cursor: 'pointer'
  }
};
