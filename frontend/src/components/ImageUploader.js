import React, { useState, useRef, useCallback } from 'react';
import { api } from '../context/AuthContext';
import toast from 'react-hot-toast';

/**
 * ImageUploader
 * Props:
 *   photos       — string[]  current photo URLs from parent form state
 *   onChange     — (photos: string[]) => void  called whenever list changes
 *   maxPhotos    — number (default 5)
 */
const ImageUploader = ({ photos = [], onChange, maxPhotos = 5 }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({}); // { tempId: 0-100 }
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Upload a single File object to backend → Cloudinary
  const uploadFile = async (file, tempId) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      // Simulate progress since axios doesn't expose upload progress easily here
      setUploadProgress(p => ({ ...p, [tempId]: 30 }));

      const res = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded * 100) / e.total);
          setUploadProgress(p => ({ ...p, [tempId]: Math.min(pct, 90) }));
        },
      });

      setUploadProgress(p => ({ ...p, [tempId]: 100 }));
      return res.data.url;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Upload failed');
    } finally {
      // Clean up progress entry after a short delay
      setTimeout(() => setUploadProgress(p => {
        const next = { ...p };
        delete next[tempId];
        return next;
      }), 600);
    }
  };

  const processFiles = useCallback(async (files) => {
    const fileArray = Array.from(files);

    // Validate count
    const remaining = maxPhotos - photos.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${maxPhotos} photos allowed`);
      return;
    }
    const toUpload = fileArray.slice(0, remaining);
    if (fileArray.length > remaining) {
      toast(`Only uploading ${remaining} photo(s) — limit reached`, { icon: '⚠️' });
    }

    // Validate types & sizes
    const valid = toUpload.filter(f => {
      if (!f.type.startsWith('image/')) {
        toast.error(`${f.name}: not an image`);
        return false;
      }
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name}: exceeds 5MB limit`);
        return false;
      }
      return true;
    });

    if (valid.length === 0) return;

    setUploading(true);
    const newUrls = [];

    for (const file of valid) {
      const tempId = `${file.name}_${Date.now()}`;
      try {
        const url = await uploadFile(file, tempId);
        newUrls.push(url);
      } catch (err) {
        toast.error(`Failed to upload ${file.name}: ${err.message}`);
      }
    }

    if (newUrls.length > 0) {
      onChange([...photos, ...newUrls]);
      toast.success(`${newUrls.length} photo${newUrls.length > 1 ? 's' : ''} uploaded!`);
    }

    setUploading(false);
  }, [photos, onChange, maxPhotos]);

  const handleFileInput = (e) => {
    if (e.target.files?.length) processFiles(e.target.files);
    e.target.value = ''; // reset so same file can be re-selected
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) processFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  const removePhoto = (index) => {
    const updated = photos.filter((_, i) => i !== index);
    onChange(updated);
  };

  const movePhoto = (from, to) => {
    const updated = [...photos];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    onChange(updated);
  };

  const activeUploads = Object.keys(uploadProgress);
  const isFull = photos.length >= maxPhotos;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>
          Photos
          <span style={{ color: 'var(--slate)', fontWeight: 400 }}> ({photos.length}/{maxPhotos})</span>
        </label>
        {photos.length > 0 && (
          <span style={{ fontSize: '0.75rem', color: 'var(--slate)' }}>
            First photo is the cover image
          </span>
        )}
      </div>

      {/* Drop zone — hidden when full */}
      {!isFull && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          style={{
            border: `2px dashed ${dragging ? 'var(--terracotta)' : uploading ? 'var(--forest)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '32px 20px',
            textAlign: 'center',
            cursor: uploading ? 'default' : 'pointer',
            background: dragging ? 'rgba(196,99,58,0.05)' : uploading ? 'rgba(61,107,79,0.04)' : 'white',
            transition: 'all 0.2s ease',
            marginBottom: 16,
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            multiple
            onChange={handleFileInput}
            style={{ display: 'none' }}
            disabled={uploading || isFull}
          />

          {uploading ? (
            <>
              <div style={{ fontSize: 36, marginBottom: 10 }}>⏳</div>
              <p style={{ fontWeight: 600, color: 'var(--forest)', marginBottom: 4 }}>
                Uploading {activeUploads.length} photo{activeUploads.length > 1 ? 's' : ''}...
              </p>
              {/* Progress bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 260, margin: '12px auto 0' }}>
                {activeUploads.map(id => (
                  <div key={id}>
                    <div style={{ height: 5, background: '#e0e0e0', borderRadius: 10, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${uploadProgress[id] || 0}%`,
                        background: 'linear-gradient(90deg, var(--forest), var(--forest-light))',
                        borderRadius: 10,
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 40, marginBottom: 10 }}>📸</div>
              <p style={{ fontWeight: 600, color: 'var(--charcoal)', marginBottom: 4 }}>
                {dragging ? 'Drop photos here!' : 'Drag & drop photos or click to browse'}
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--slate)' }}>
                JPG, PNG, WebP, GIF · Max 5MB each · Up to {maxPhotos} photos
              </p>
            </>
          )}
        </div>
      )}

      {/* Photo preview grid */}
      {photos.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 10 }}>
          {photos.map((url, i) => (
            <div key={url} style={{ position: 'relative', aspectRatio: '1', borderRadius: 10, overflow: 'hidden', border: i === 0 ? '3px solid var(--terracotta)' : '2px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <img
                src={url}
                alt={`Photo ${i + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />

              {/* Cover badge */}
              {i === 0 && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(196,99,58,0.85)', color: 'white', fontSize: '0.65rem', fontWeight: 700, textAlign: 'center', padding: '3px 0', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Cover
                </div>
              )}

              {/* Controls overlay */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0)',
                display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
                padding: 5, gap: 4, opacity: 0, transition: 'opacity 0.2s',
              }}
                className="photo-overlay"
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0'}
              >
                {/* Move left */}
                {i > 0 && (
                  <button onClick={() => movePhoto(i, i - 1)} title="Move left" style={iconBtnStyle('#333')}>‹</button>
                )}
                {/* Move right */}
                {i < photos.length - 1 && (
                  <button onClick={() => movePhoto(i, i + 1)} title="Move right" style={iconBtnStyle('#333')}>›</button>
                )}
                {/* Remove */}
                <button onClick={() => removePhoto(i)} title="Remove" style={iconBtnStyle('#c62828')}>✕</button>
              </div>
            </div>
          ))}

          {/* "Add more" tile if not full */}
          {!isFull && !uploading && (
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                aspectRatio: '1', borderRadius: 10, border: '2px dashed var(--border)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', background: 'var(--cream)', transition: 'var(--transition)',
                fontSize: '1.5rem', color: 'var(--slate)', gap: 4,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--terracotta)'; e.currentTarget.style.color = 'var(--terracotta)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--slate)'; }}
            >
              +
              <span style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.03em' }}>ADD</span>
            </div>
          )}
        </div>
      )}

      <style>{`
        .photo-overlay:hover { background: rgba(0,0,0,0.35) !important; opacity: 1 !important; }
      `}</style>
    </div>
  );
};

const iconBtnStyle = (bg) => ({
  width: 22, height: 22, borderRadius: 4,
  background: bg, color: 'white', border: 'none',
  fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  lineHeight: 1,
});

export default ImageUploader;
