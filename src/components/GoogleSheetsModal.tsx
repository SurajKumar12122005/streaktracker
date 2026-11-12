import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import {
  getAccessToken,
  setAccessToken,
  connectGoogleAccount,
  getGoogleAccount,
  signOutAuth,
} from '../firebase';
import {
  getOrCreateUserDetailsSpreadsheet,
  createStreakTrackerSpreadsheet,
  fetchSpreadsheetRows,
  saveUserToGoogleSheet,
  syncAllUsersToGoogleSheet,
  getStoredSpreadsheetId,
  setStoredSpreadsheetId,
  GoogleSpreadsheetInfo,
  SheetRowData,
  SHEET_COLUMNS,
} from '../utils/googleSheetsService';
import { SheetConfirmModal } from './SheetConfirmModal';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserProfile: UserProfile;
  allUsers?: UserProfile[];
  onNotify?: (msg: string) => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  currentUserProfile,
  allUsers = [],
  onNotify,
}) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [googleUser, setGoogleUser] = useState<{ email?: string | null; displayName?: string | null } | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [sheetInfo, setSheetInfo] = useState<GoogleSpreadsheetInfo | null>(null);
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [liveRows, setLiveRows] = useState<SheetRowData[]>([]);
  const [customSheetIdInput, setCustomSheetIdInput] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'preview'>('overview');

  // Confirmation Modal state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    affectedCount?: number;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    action: async () => {},
  });
  const [isSyncing, setIsSyncing] = useState(false);

  // Check auth state on open
  useEffect(() => {
    if (!isOpen) return;

    const checkToken = async () => {
      const currentToken = await getAccessToken();
      const account = getGoogleAccount();
      setTokenState(currentToken);
      setGoogleUser(account);

      if (currentToken) {
        loadSpreadsheet(currentToken);
      }
    };
    checkToken();
  }, [isOpen]);

  const loadSpreadsheet = async (authToken: string) => {
    setLoadingSheet(true);
    setStatusMsg(null);
    try {
      const info = await getOrCreateUserDetailsSpreadsheet(authToken);
      setSheetInfo(info);
      setCustomSheetIdInput(info.id);

      // Load preview rows
      try {
        const { rows } = await fetchSpreadsheetRows(authToken, info.id);
        setLiveRows(rows);
      } catch (err) {
        console.warn('Could not load rows preview:', err);
      }
    } catch (err: any) {
      console.error('Failed to load spreadsheet:', err);
      setStatusMsg({
        type: 'error',
        text: err.message || 'Failed to initialize Google Sheet. Please check Google permissions.',
      });
    } finally {
      setLoadingSheet(false);
    }
  };

  const handleConnectGoogle = async () => {
    setIsConnecting(true);
    setStatusMsg(null);
    try {
      const res = await connectGoogleAccount();
      if (res?.accessToken) {
        setTokenState(res.accessToken);
        setGoogleUser({ email: res.email, displayName: res.name });
        setStatusMsg({
          type: 'success',
          text: `Connected to Google Account (${res.email}) with Sheets access!`,
        });
        await loadSpreadsheet(res.accessToken);
      }
    } catch (err: any) {
      console.error('Google connect error:', err);
      setStatusMsg({
        type: 'error',
        text: err.message || 'Google authorization was cancelled or failed.',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setAccessToken(null, null);
    setTokenState(null);
    setGoogleUser(null);
    setSheetInfo(null);
    setLiveRows([]);
    setStatusMsg({
      type: 'info',
      text: 'Disconnected Google Account and cleared active session token.',
    });
  };

  const handleApplyCustomSheetId = async () => {
    const cleanId = customSheetIdInput.trim();
    if (!cleanId || !token) return;

    setLoadingSheet(true);
    setStatusMsg(null);
    try {
      setStoredSpreadsheetId(cleanId);
      await loadSpreadsheet(token);
      setStatusMsg({
        type: 'success',
        text: `Switched active spreadsheet to ID: ${cleanId}`,
      });
    } catch (e: any) {
      setStatusMsg({
        type: 'error',
        text: e.message || 'Failed to switch spreadsheet.',
      });
    } finally {
      setLoadingSheet(false);
    }
  };

  const handleCreateNewSheet = async () => {
    if (!token) return;
    setLoadingSheet(true);
    setStatusMsg(null);
    try {
      const newSheet = await createStreakTrackerSpreadsheet(token);
      setSheetInfo(newSheet);
      setCustomSheetIdInput(newSheet.id);
      setLiveRows([]);
      setStatusMsg({
        type: 'success',
        text: `Created new spreadsheet: "${newSheet.title}"!`,
      });
    } catch (e: any) {
      setStatusMsg({
        type: 'error',
        text: e.message || 'Failed to create new spreadsheet.',
      });
    } finally {
      setLoadingSheet(false);
    }
  };

  // Sync Current User with explicit confirmation per SKILL.md
  const triggerSyncCurrentUser = () => {
    if (!token || !sheetInfo) return;

    setConfirmConfig({
      isOpen: true,
      title: 'Sync Your Details to Google Sheets',
      description: `Save or update your profile (${currentUserProfile.name || 'Developer'}, ${currentUserProfile.email}) in the connected spreadsheet.`,
      affectedCount: 1,
      action: async () => {
        setIsSyncing(true);
        try {
          const res = await saveUserToGoogleSheet(token, sheetInfo.id, currentUserProfile);
          setStatusMsg({
            type: 'success',
            text: res.updated
              ? `Successfully updated your user profile at Row ${res.rowIndex} in Google Sheets!`
              : `Successfully added your user profile to Google Sheets!`,
          });
          onNotify?.('User details successfully synced to Google Sheets!');
          // Refresh rows
          const { rows } = await fetchSpreadsheetRows(token, sheetInfo.id);
          setLiveRows(rows);
        } catch (e: any) {
          setStatusMsg({
            type: 'error',
            text: e.message || 'Failed to save user to Google Sheets.',
          });
        } finally {
          setIsSyncing(false);
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Sync All Users with explicit confirmation per SKILL.md
  const triggerSyncAllUsers = () => {
    if (!token || !sheetInfo) return;

    const usersToSync = allUsers.length > 0 ? allUsers : [currentUserProfile];

    setConfirmConfig({
      isOpen: true,
      title: 'Sync All Registered Users to Google Sheets',
      description: `Are you sure you want to update the contents of "${sheetInfo.title}" with ${usersToSync.length} registered user record(s)? Existing user records will be refreshed.`,
      affectedCount: usersToSync.length,
      action: async () => {
        setIsSyncing(true);
        try {
          const res = await syncAllUsersToGoogleSheet(token, sheetInfo.id, usersToSync);
          setStatusMsg({
            type: 'success',
            text: `Sync complete! Updated: ${res.updatedCount}, Added: ${res.appendedCount} (Total ${res.total} records).`,
          });
          onNotify?.(`Synced ${res.total} user records to Google Sheets!`);
          // Refresh rows
          const { rows } = await fetchSpreadsheetRows(token, sheetInfo.id);
          setLiveRows(rows);
        } catch (e: any) {
          setStatusMsg({
            type: 'error',
            text: e.message || 'Failed to sync users to Google Sheets.',
          });
        } finally {
          setIsSyncing(false);
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleRefreshRows = async () => {
    if (!token || !sheetInfo) return;
    setLoadingSheet(true);
    try {
      const { rows } = await fetchSpreadsheetRows(token, sheetInfo.id);
      setLiveRows(rows);
      setStatusMsg({
        type: 'success',
        text: `Refreshed live data: ${rows.length} row(s) retrieved from Google Sheets.`,
      });
    } catch (e: any) {
      setStatusMsg({
        type: 'error',
        text: e.message || 'Failed to fetch rows.',
      });
    } finally {
      setLoadingSheet(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
        <div className="bg-[#131821] border border-[#2a3240] rounded-2xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl flex flex-col gap-5 text-white max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 font-sans">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#222a36] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-[#00f5a0]/40 flex items-center justify-center text-[#00f5a0] shadow-inner">
                <span className="material-symbols-outlined text-[24px]">table_chart</span>
              </div>
              <div>
                <h3 className="text-[1.25rem] font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Google Sheets User Storage</span>
                  <span className="px-2 py-0.5 rounded-full text-[0.625rem] font-mono uppercase bg-[#00f5a0]/15 text-[#00f5a0] border border-[#00f5a0]/30 font-bold">
                    Workspace OAuth
                  </span>
                </h3>
                <p className="text-[0.8125rem] text-slate-400">
                  Store, sync, and inspect developer profiles in real-time inside your Google Drive spreadsheet.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#181f2a] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Status Alert Banner */}
          {statusMsg && (
            <div
              className={`p-3.5 rounded-xl border text-[0.8125rem] flex items-center justify-between gap-3 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : statusMsg.type === 'error'
                  ? 'bg-red-950/40 border-red-500/40 text-red-200'
                  : 'bg-blue-950/40 border-blue-500/40 text-blue-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">
                  {statusMsg.type === 'success'
                    ? 'check_circle'
                    : statusMsg.type === 'error'
                    ? 'error'
                    : 'info'}
                </span>
                <span>{statusMsg.text}</span>
              </div>
              <button
                onClick={() => setStatusMsg(null)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Authentication Section */}
          <div className="p-4 rounded-xl bg-[#0e141b] border border-[#222a36] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-3.5 h-3.5 rounded-full shrink-0 ${token ? 'bg-[#00f5a0] shadow-[0_0_10px_#00f5a0]' : 'bg-slate-600'}`} />
              <div>
                <div className="text-[0.875rem] font-semibold text-white flex items-center gap-2">
                  <span>Google Account Status:</span>
                  <span className={token ? 'text-[#00f5a0]' : 'text-slate-400'}>
                    {token ? 'Connected & Authorized' : 'Not Connected'}
                  </span>
                </div>
                <div className="text-[0.75rem] text-slate-400 font-mono mt-0.5">
                  {googleUser?.email ? `Signed in as: ${googleUser.email}` : 'Authorize to enable Google Sheets reading and writing.'}
                </div>
              </div>
            </div>

            <div>
              {!token ? (
                /* Official Sign in with Google Button styled per SKILL.md */
                <button
                  type="button"
                  onClick={handleConnectGoogle}
                  disabled={isConnecting}
                  className="inline-flex items-center gap-2.5 px-4 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-900 font-semibold text-[0.875rem] shadow-sm transition-all cursor-pointer disabled:opacity-60"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>{isConnecting ? 'Connecting...' : 'Connect Google Sheets'}</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleConnectGoogle}
                    className="px-3 py-1.5 rounded-lg bg-[#181f2a] hover:bg-[#222a36] border border-[#2a3240] text-slate-300 hover:text-white text-[0.75rem] font-mono transition-colors cursor-pointer"
                  >
                    Switch Account
                  </button>
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="px-3 py-1.5 rounded-lg bg-red-950/30 hover:bg-red-900/40 border border-red-800/40 text-red-300 text-[0.75rem] font-mono transition-colors cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Connected Sheet Card */}
          {token && (
            <div className="p-4 rounded-xl bg-[#0e141b] border border-[#222a36] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[0.6875rem] font-mono text-[#00f5a0] uppercase tracking-wider">
                    Linked Spreadsheet
                  </span>
                  <h4 className="text-[1.0625rem] font-bold text-white flex items-center gap-2 mt-0.5">
                    <span>{sheetInfo?.title || 'StreakTracker - User Details'}</span>
                    {loadingSheet && (
                      <span className="w-3.5 h-3.5 border-2 border-[#00f5a0] border-t-transparent rounded-full animate-spin" />
                    )}
                  </h4>
                  {sheetInfo?.id && (
                    <div className="text-[0.75rem] font-mono text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                      <span>ID:</span>
                      <span className="px-1.5 py-0.5 rounded bg-[#181f2a] border border-[#222a36] text-slate-300">
                        {sheetInfo.id}
                      </span>
                    </div>
                  )}
                </div>

                {sheetInfo?.webViewLink && (
                  <a
                    href={sheetInfo.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#181f2a] hover:bg-[#222a36] border border-[#2a3240] hover:border-[#00f5a0]/40 text-[#00f5a0] text-[0.8125rem] font-semibold transition-colors cursor-pointer shrink-0"
                  >
                    <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                    <span>Open in Google Sheets</span>
                  </a>
                )}
              </div>

              {/* Sync Actions Bar */}
              <div className="pt-3 border-t border-[#1f2633] flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={triggerSyncCurrentUser}
                    disabled={loadingSheet || isSyncing}
                    className="px-3.5 py-2 rounded-lg bg-[#00f5a0] hover:brightness-110 active:scale-[0.98] text-black font-bold text-[0.8125rem] shadow-[0_0_15px_rgba(0,245,160,0.25)] flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">person_check</span>
                    <span>Sync My Details</span>
                  </button>

                  <button
                    onClick={triggerSyncAllUsers}
                    disabled={loadingSheet || isSyncing}
                    className="px-3.5 py-2 rounded-lg bg-[#181f2a] hover:bg-[#222a36] border border-[#2a3240] hover:border-[#00f5a0]/40 text-slate-200 hover:text-white font-semibold text-[0.8125rem] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#00f5a0]">groups</span>
                    <span>Sync All Users ({allUsers.length || 1})</span>
                  </button>

                  <button
                    onClick={handleRefreshRows}
                    disabled={loadingSheet}
                    className="px-3 py-2 rounded-lg bg-[#181f2a] hover:bg-[#222a36] border border-[#2a3240] text-slate-400 hover:text-slate-200 text-[0.8125rem] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">refresh</span>
                    <span>Refresh</span>
                  </button>
                </div>

                <button
                  onClick={handleCreateNewSheet}
                  disabled={loadingSheet}
                  className="text-[0.75rem] font-mono text-slate-400 hover:text-[#00f5a0] transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Create Fresh Sheet</span>
                </button>
              </div>
            </div>
          )}

          {/* Navigation Tabs for Overview vs Live Preview */}
          <div className="flex items-center gap-4 border-b border-[#222a36] pb-2 text-[0.875rem]">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-1 font-medium transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'text-[#00f5a0] border-b-2 border-[#00f5a0] font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Spreadsheet Schema & Features
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`pb-1 font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'preview'
                  ? 'text-[#00f5a0] border-b-2 border-[#00f5a0] font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Live Sheet Data</span>
              {liveRows.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[0.6875rem] bg-[#00f5a0]/15 text-[#00f5a0] font-mono">
                  {liveRows.length}
                </span>
              )}
            </button>
          </div>

          {/* Tab Content: Overview / Schema */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#0e141b]/60 border border-[#222a36] space-y-3">
                <h5 className="text-[0.875rem] font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#00f5a0] text-[18px]">dataset</span>
                  <span>Columns Automatically Maintained in Google Sheets</span>
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[0.75rem] font-mono">
                  {SHEET_COLUMNS.map((col, idx) => (
                    <div
                      key={col}
                      className="p-2 rounded-lg bg-[#181f2a] border border-[#222a36] flex items-center gap-2 text-slate-300"
                    >
                      <span className="w-5 h-5 rounded bg-emerald-500/10 text-[#00f5a0] flex items-center justify-center text-[0.6875rem] font-bold shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="truncate">{col}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Spreadsheet ID config */}
              <div className="p-4 rounded-xl bg-[#0e141b]/40 border border-[#222a36] flex flex-col sm:flex-row items-center gap-3">
                <div className="flex-1 w-full">
                  <label className="text-[0.75rem] font-mono text-slate-400 block mb-1">
                    Connect Existing Google Spreadsheet (ID or URL):
                  </label>
                  <input
                    type="text"
                    value={customSheetIdInput}
                    onChange={e => setCustomSheetIdInput(e.target.value)}
                    placeholder="Enter Google Spreadsheet ID..."
                    className="w-full px-3 py-1.5 rounded-lg bg-[#131821] border border-[#2a3240] text-white text-[0.8125rem] font-mono focus:outline-none focus:border-[#00f5a0]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyCustomSheetId}
                  disabled={!token || loadingSheet}
                  className="sm:mt-5 px-3 py-1.5 rounded-lg bg-[#181f2a] hover:bg-[#222a36] border border-[#2a3240] text-slate-300 hover:text-white text-[0.8125rem] font-mono cursor-pointer shrink-0 disabled:opacity-50"
                >
                  Use Sheet ID
                </button>
              </div>
            </div>
          )}

          {/* Tab Content: Live Sheet Preview */}
          {activeTab === 'preview' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[0.75rem] font-mono text-slate-400">
                <span>Tab: "User Details"</span>
                <span>{liveRows.length} record(s) recorded in Google Sheets</span>
              </div>

              <div className="rounded-xl border border-[#222a36] overflow-x-auto bg-[#0e141b]">
                <table className="w-full text-left text-[0.75rem]">
                  <thead>
                    <tr className="border-b border-[#222a36] bg-[#181f2a] text-[#00f5a0] font-mono">
                      <th className="py-2.5 px-3 font-semibold">User</th>
                      <th className="py-2.5 px-3 font-semibold">Email</th>
                      <th className="py-2.5 px-3 font-semibold">Mobile</th>
                      <th className="py-2.5 px-3 font-semibold">Role / Title</th>
                      <th className="py-2.5 px-3 font-semibold">Status</th>
                      <th className="py-2.5 px-3 font-semibold">Last Synced</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1f2633] font-mono">
                    {liveRows.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500 text-[0.8125rem]">
                          {token
                            ? 'No records found in this sheet yet. Click "Sync My Details" or "Sync All Users" above.'
                            : 'Connect your Google account above to preview live rows.'}
                        </td>
                      </tr>
                    ) : (
                      liveRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-[#131821]/70 transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-white whitespace-nowrap">
                            {row.name || 'Anonymous Developer'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">
                            {row.email}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                            {row.mobileNumber || '—'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">
                            <span className="text-[#00f5a0]">{row.title}</span>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[0.6875rem]">
                              {row.profileCompleted}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                            {row.syncedAt || '—'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-[#222a36] flex items-center justify-between">
            <span className="text-[0.75rem] text-slate-400">
              User data is securely backed up in Google Drive & Google Sheets.
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#181f2a] hover:bg-[#222a36] text-white text-[0.875rem] font-medium transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog before destructive / update operations */}
      <SheetConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.action}
        title={confirmConfig.title}
        description={confirmConfig.description}
        affectedCount={confirmConfig.affectedCount}
        sheetTitle={sheetInfo?.title}
        isProcessing={isSyncing}
      />
    </>
  );
};
