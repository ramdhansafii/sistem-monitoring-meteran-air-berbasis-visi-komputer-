import React, { useEffect, useState, useCallback } from 'react';
import { Users, Cpu, Search, Plus, Pencil, Trash2, Loader2, X as XIcon } from 'lucide-react';
import { adminApi } from '../../api/client';
import Modal, { FormField, TextInput, SelectInput, PrimaryButton, SecondaryButton } from '../../components/Modal';

const ROLE_LABEL = { admin: 'Admin', user: 'Pengguna' };

function Badge({ active, textActive = 'Aktif', textInactive = 'Tidak Aktif' }) {
  return (
    <span style={{
      padding: '2px 10px', borderRadius: '20px', fontSize: '9px', fontFamily: 'var(--font-mono)',
      background: active ? 'rgba(0,255,136,0.1)' : 'rgba(255,107,107,0.1)',
      border: `1px solid ${active ? 'rgba(0,255,136,0.3)' : 'rgba(255,107,107,0.3)'}`,
      color: active ? 'var(--accent-green)' : '#ff6b6b',
    }}>{active ? textActive : textInactive}</span>
  );
}

function Toolbar({ icon: Icon, title, subtitle, search, onSearch, onAdd, addLabel }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon size={14} color="var(--accent-cyan)" />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>{title}</div>
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{subtitle}</div>
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border)', borderRadius: '8px', padding: '7px 12px' }}>
          <Search size={12} color="var(--text-secondary)" />
          <input
            placeholder="Cari..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '11px', fontFamily: 'var(--font-mono)', width: '140px' }}
          />
        </div>
        <PrimaryButton onClick={onAdd} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={13} /> {addLabel}
        </PrimaryButton>
      </div>
    </div>
  );
}

const emptyUserForm = { id: null, username: '', password: '', full_name: '', email: '', phone: '', address: '', role: 'user', is_active: true };
const emptyDeviceForm = { id: null, device_id: '', name: '', serial_number: '', location: '', latitude: '', longitude: '', owner_user_id: '', is_active: true };

export default function ManagementPage() {
  const [tab, setTab] = useState('users');

  // Users state
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userLoading, setUserLoading] = useState(true);
  const [userModal, setUserModal] = useState(false);
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [userSaving, setUserSaving] = useState(false);
  const [userError, setUserError] = useState('');

  // Daftar seluruh user (tidak terpengaruh pencarian) untuk dropdown pemilik device
  const [allUsers, setAllUsers] = useState([]);

  // Devices state
  const [devices, setDevices] = useState([]);
  const [deviceSearch, setDeviceSearch] = useState('');
  const [deviceLoading, setDeviceLoading] = useState(true);
  const [deviceModal, setDeviceModal] = useState(false);
  const [deviceForm, setDeviceForm] = useState(emptyDeviceForm);
  const [deviceSaving, setDeviceSaving] = useState(false);
  const [deviceError, setDeviceError] = useState('');

  const loadUsers = useCallback((search = userSearch) => {
    setUserLoading(true);
    adminApi.getUsers(search)
      .then((r) => setUsers(r.users || []))
      .catch((e) => console.error(e))
      .finally(() => setUserLoading(false));
  }, [userSearch]);

  const loadDevices = useCallback((search = deviceSearch) => {
    setDeviceLoading(true);
    adminApi.getDevices(search)
      .then((r) => setDevices(r.devices || []))
      .catch((e) => console.error(e))
      .finally(() => setDeviceLoading(false));
  }, [deviceSearch]);

  useEffect(() => {
    loadUsers('');
    loadDevices('');
    adminApi.getUsers('').then((r) => setAllUsers(r.users || [])).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setTimeout(() => loadUsers(userSearch), 350);
    return () => clearTimeout(t);
  }, [userSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setTimeout(() => loadDevices(deviceSearch), 350);
    return () => clearTimeout(t);
  }, [deviceSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  // ===== Users handlers =====
  const openAddUser = () => { setUserForm(emptyUserForm); setUserError(''); setUserModal(true); };
  const openEditUser = (u) => {
    setUserForm({ ...emptyUserForm, ...u, password: '' });
    setUserError('');
    setUserModal(true);
  };
  const saveUser = async () => {
    setUserError('');
    if (!userForm.username || !userForm.full_name || (!userForm.id && !userForm.password)) {
      setUserError('Username, nama lengkap, dan password wajib diisi');
      return;
    }
    setUserSaving(true);
    try {
      if (userForm.id) {
        const payload = { ...userForm };
        if (!payload.password) delete payload.password;
        await adminApi.updateUser(userForm.id, payload);
      } else {
        await adminApi.createUser(userForm);
      }
      setUserModal(false);
      loadUsers();
      adminApi.getUsers('').then((r) => setAllUsers(r.users || [])).catch(() => {});
    } catch (e) {
      setUserError(e.message || 'Gagal menyimpan pengguna');
    } finally {
      setUserSaving(false);
    }
  };
  const removeUser = async (u) => {
    if (!window.confirm(`Hapus pengguna "${u.full_name || u.username}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      await adminApi.deleteUser(u.id);
      loadUsers();
    } catch (e) {
      alert(e.message || 'Gagal menghapus pengguna');
    }
  };

  // ===== Devices handlers =====
  const openAddDevice = () => { setDeviceForm(emptyDeviceForm); setDeviceError(''); setDeviceModal(true); };
  const openEditDevice = (d) => {
    setDeviceForm({ ...emptyDeviceForm, ...d, owner_user_id: d.owner_user_id || '' });
    setDeviceError('');
    setDeviceModal(true);
  };
  const saveDevice = async () => {
    setDeviceError('');
    if (!deviceForm.device_id || !deviceForm.name) {
      setDeviceError('ID Device dan Nama Device wajib diisi');
      return;
    }
    setDeviceSaving(true);
    try {
      if (deviceForm.id) {
        await adminApi.updateDevice(deviceForm.id, deviceForm);
      } else {
        await adminApi.createDevice(deviceForm);
      }
      setDeviceModal(false);
      loadDevices();
    } catch (e) {
      setDeviceError(e.message || 'Gagal menyimpan device');
    } finally {
      setDeviceSaving(false);
    }
  };
  const removeDevice = async (d) => {
    if (!window.confirm(`Hapus device "${d.name}" (${d.device_id})? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      await adminApi.deleteDevice(d.id);
      loadDevices();
    } catch (e) {
      alert(e.message || 'Gagal menghapus device');
    }
  };

  const tabBtn = (id, label, Icon) => (
    <button
      onClick={() => setTab(id)}
      style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '9px 16px', borderRadius: '10px', cursor: 'pointer',
        background: tab === id ? 'rgba(0,212,255,0.12)' : 'transparent',
        border: tab === id ? '1px solid var(--border-glow)' : '1px solid var(--border)',
        color: tab === id ? 'var(--accent-cyan)' : 'var(--text-secondary)',
        fontSize: '12px', fontWeight: tab === id ? '700' : '400',
        fontFamily: 'var(--font-body)',
      }}
    >
      <Icon size={13} /> {label}
    </button>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '20px', animation: 'fadeIn 0.5s ease' }}>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
          Panel Admin
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
          Manajemen Device &amp; Pengguna
        </h1>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>
          Kelola data pengguna dan device yang terdaftar di sistem
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
        {tabBtn('users', 'Data Pengguna', Users)}
        {tabBtn('devices', 'Data Device', Cpu)}
      </div>

      {/* ===== USERS TAB ===== */}
      {tab === 'users' && (
        <div style={{ background: 'linear-gradient(135deg, var(--bg-card), var(--bg-secondary))', border: '1px solid var(--border)', borderRadius: '16px', padding: '18px', animation: 'fadeIn 0.4s ease' }}>
          <Toolbar icon={Users} title="Data Pengguna" subtitle={`${users.length} pengguna terdaftar`} search={userSearch} onSearch={setUserSearch} onAdd={openAddUser} addLabel="Tambah Pengguna" />

          {userLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', padding: '30px 0', justifyContent: 'center', fontSize: '12px' }}>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Memuat pengguna...
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['ID', 'Nama', 'Username', 'Email', 'No. HP', 'Role', 'Status', 'Aksi'].map((h) => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>#{u.id}</td>
                      <td style={{ padding: '10px 12px', fontSize: '12px', color: 'var(--text-primary)', fontWeight: '600', whiteSpace: 'nowrap' }}>{u.full_name}</td>
                      <td style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--text-secondary)' }}>@{u.username}</td>
                      <td style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--text-secondary)' }}>{u.email || '-'}</td>
                      <td style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--text-secondary)' }}>{u.phone || '-'}</td>
                      <td style={{ padding: '10px 12px', fontSize: '10px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{ROLE_LABEL[u.role] || u.role}</td>
                      <td style={{ padding: '10px 12px' }}><Badge active={u.is_active} /></td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => openEditUser(u)} title="Edit" style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid var(--border-glow)', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: 'var(--accent-cyan)', display: 'flex' }}><Pencil size={12} /></button>
                          <button onClick={() => removeUser(u)} title="Hapus" style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: '#ff6b6b', display: 'flex' }}><Trash2 size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan={8} style={{ padding: '24px', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>Tidak ada pengguna ditemukan.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===== DEVICES TAB ===== */}
      {tab === 'devices' && (
        <div style={{ background: 'linear-gradient(135deg, var(--bg-card), var(--bg-secondary))', border: '1px solid var(--border)', borderRadius: '16px', padding: '18px', animation: 'fadeIn 0.4s ease' }}>
          <Toolbar icon={Cpu} title="Data Device" subtitle={`${devices.length} device terdaftar`} search={deviceSearch} onSearch={setDeviceSearch} onAdd={openAddDevice} addLabel="Tambah Device" />

          {deviceLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', padding: '30px 0', justifyContent: 'center', fontSize: '12px' }}>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Memuat device...
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '820px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['ID', 'Nama Device', 'Serial Number', 'Lokasi', 'Pemilik', 'Status', 'Aksi'].map((h) => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {devices.map((d) => (
                    <tr key={d.id} style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '10px 12px', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{d.device_id}</td>
                      <td style={{ padding: '10px 12px', fontSize: '12px', color: 'var(--text-primary)', fontWeight: '600', whiteSpace: 'nowrap' }}>{d.name}</td>
                      <td style={{ padding: '10px 12px', fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{d.serial_number || '-'}</td>
                      <td style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--text-secondary)' }}>{d.location || '-'}</td>
                      <td style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--text-secondary)' }}>{d.owner_name || 'Belum ada'}</td>
                      <td style={{ padding: '10px 12px' }}><Badge active={d.is_active} textActive="Aktif" textInactive="Offline" /></td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => openEditDevice(d)} title="Edit" style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid var(--border-glow)', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: 'var(--accent-cyan)', display: 'flex' }}><Pencil size={12} /></button>
                          <button onClick={() => removeDevice(d)} title="Hapus" style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: '#ff6b6b', display: 'flex' }}><Trash2 size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {devices.length === 0 && (
                    <tr><td colSpan={7} style={{ padding: '24px', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>Tidak ada device ditemukan.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===== USER MODAL ===== */}
      <Modal open={userModal} onClose={() => setUserModal(false)} title={userForm.id ? 'Edit Pengguna' : 'Tambah Pengguna'}>
        {userError && (
          <div style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '8px', padding: '10px 12px', color: '#ff6b6b', fontSize: '11px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <XIcon size={12} /> {userError}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
          <FormField label="Nama Lengkap">
            <TextInput value={userForm.full_name} onChange={e => setUserForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Nama lengkap" />
          </FormField>
          <FormField label="Username">
            <TextInput value={userForm.username} onChange={e => setUserForm(f => ({ ...f, username: e.target.value }))} placeholder="username" />
          </FormField>
          <FormField label="Email">
            <TextInput type="email" value={userForm.email} onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))} placeholder="email@contoh.com" />
          </FormField>
          <FormField label="Nomor HP">
            <TextInput value={userForm.phone} onChange={e => setUserForm(f => ({ ...f, phone: e.target.value }))} placeholder="08xxxxxxxxxx" />
          </FormField>
        </div>
        <FormField label="Alamat">
          <TextInput value={userForm.address} onChange={e => setUserForm(f => ({ ...f, address: e.target.value }))} placeholder="Alamat lengkap" />
        </FormField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
          <FormField label={userForm.id ? 'Password (kosongkan jika tidak diubah)' : 'Password'}>
            <TextInput type="password" value={userForm.password} onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))} placeholder="Minimal 6 karakter" />
          </FormField>
          <FormField label="Role">
            <SelectInput value={userForm.role} onChange={e => setUserForm(f => ({ ...f, role: e.target.value }))}>
              <option value="user">Pengguna</option>
              <option value="admin">Admin</option>
            </SelectInput>
          </FormField>
        </div>
        <FormField label="Status">
          <SelectInput value={userForm.is_active ? '1' : '0'} onChange={e => setUserForm(f => ({ ...f, is_active: e.target.value === '1' }))}>
            <option value="1">Aktif</option>
            <option value="0">Tidak Aktif</option>
          </SelectInput>
        </FormField>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' }}>
          <SecondaryButton onClick={() => setUserModal(false)}>Batal</SecondaryButton>
          <PrimaryButton onClick={saveUser} disabled={userSaving}>{userSaving ? 'Menyimpan...' : 'Simpan'}</PrimaryButton>
        </div>
      </Modal>

      {/* ===== DEVICE MODAL ===== */}
      <Modal open={deviceModal} onClose={() => setDeviceModal(false)} title={deviceForm.id ? 'Edit Device' : 'Tambah Device'}>
        {deviceError && (
          <div style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '8px', padding: '10px 12px', color: '#ff6b6b', fontSize: '11px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <XIcon size={12} /> {deviceError}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
          <FormField label="ID Device">
            <TextInput value={deviceForm.device_id} onChange={e => setDeviceForm(f => ({ ...f, device_id: e.target.value }))} placeholder="0016181234567890" disabled={!!deviceForm.id} />
          </FormField>
          <FormField label="Nama Device">
            <TextInput value={deviceForm.name} onChange={e => setDeviceForm(f => ({ ...f, name: e.target.value }))} placeholder="ESP32-CAM-Meter-01" />
          </FormField>
          <FormField label="Serial Number">
            <TextInput value={deviceForm.serial_number} onChange={e => setDeviceForm(f => ({ ...f, serial_number: e.target.value }))} placeholder="SN-XXXXXXX" />
          </FormField>
          <FormField label="Lokasi">
            <TextInput value={deviceForm.location} onChange={e => setDeviceForm(f => ({ ...f, location: e.target.value }))} placeholder="Rumah Utama" />
          </FormField>
          <FormField label="Latitude">
            <TextInput type="number" step="0.0000001" value={deviceForm.latitude} onChange={e => setDeviceForm(f => ({ ...f, latitude: e.target.value }))} placeholder="-6.200000" />
          </FormField>
          <FormField label="Longitude">
            <TextInput type="number" step="0.0000001" value={deviceForm.longitude} onChange={e => setDeviceForm(f => ({ ...f, longitude: e.target.value }))} placeholder="106.816666" />
          </FormField>
        </div>
        <FormField label="Pemilik">
          <SelectInput value={deviceForm.owner_user_id} onChange={e => setDeviceForm(f => ({ ...f, owner_user_id: e.target.value }))}>
            <option value="">— Belum ada pemilik —</option>
            {allUsers.map(u => (
              <option key={u.id} value={u.id}>{u.full_name} (@{u.username})</option>
            ))}
          </SelectInput>
        </FormField>
        <FormField label="Status">
          <SelectInput value={deviceForm.is_active ? '1' : '0'} onChange={e => setDeviceForm(f => ({ ...f, is_active: e.target.value === '1' }))}>
            <option value="1">Aktif</option>
            <option value="0">Offline</option>
          </SelectInput>
        </FormField>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' }}>
          <SecondaryButton onClick={() => setDeviceModal(false)}>Batal</SecondaryButton>
          <PrimaryButton onClick={saveDevice} disabled={deviceSaving}>{deviceSaving ? 'Menyimpan...' : 'Simpan'}</PrimaryButton>
        </div>
      </Modal>
    </div>
  );
}
