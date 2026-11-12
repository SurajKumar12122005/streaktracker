import { UserProfile, isUserAdmin } from '../types';

export const SPREADSHEET_TITLE = 'StreakTracker - User Details';
export const SHEET_TAB_NAME = 'User Details';

export const SHEET_COLUMNS = [
  'User ID',
  'Full Name',
  'Email Address',
  'Mobile Number',
  'Engineering Role',
  'System Role',
  'Bio / Focus Area',
  'Active Learning Tracks',
  'Daily Target (Mins)',
  'Profile Completed',
  'Registered At',
  'Last Updated',
  'Synced At',
];

export interface GoogleSpreadsheetInfo {
  id: string;
  title: string;
  webViewLink: string;
}

export interface SheetRowData {
  userId: string;
  name: string;
  email: string;
  mobileNumber: string;
  title: string;
  role: string;
  bio: string;
  activeTracks: string;
  dailyGoal: string;
  profileCompleted: string;
  createdAt: string;
  updatedAt: string;
  syncedAt: string;
}

// LocalStorage helpers for selected sheet
export const getStoredSpreadsheetId = (): string | null => {
  try {
    return localStorage.getItem('streaktracker_sheets_id');
  } catch {
    return null;
  }
};

export const setStoredSpreadsheetId = (id: string | null) => {
  try {
    if (id) {
      localStorage.setItem('streaktracker_sheets_id', id);
    } else {
      localStorage.removeItem('streaktracker_sheets_id');
    }
  } catch (e) {
    console.warn('LocalStorage sheets id error:', e);
  }
};

/**
 * Searches Google Drive for an existing spreadsheet with the standard title
 */
export async function searchDriveForUserDetailsSheet(
  accessToken: string
): Promise<GoogleSpreadsheetInfo | null> {
  try {
    const q = encodeURIComponent(
      `name = '${SPREADSHEET_TITLE}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`
    );
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,webViewLink)`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (data.files && data.files.length > 0) {
      const file = data.files[0];
      return {
        id: file.id,
        title: file.name,
        webViewLink:
          file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}/edit`,
      };
    }
    return null;
  } catch (err) {
    console.warn('Drive search warning:', err);
    return null;
  }
}

/**
 * Creates a brand new Google Spreadsheet with structured headers and styling
 */
export async function createStreakTrackerSpreadsheet(
  accessToken: string,
  customTitle?: string
): Promise<GoogleSpreadsheetInfo> {
  const title = customTitle || SPREADSHEET_TITLE;

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        {
          properties: {
            title: SHEET_TAB_NAME,
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errData = await createRes.json().catch(() => ({}));
    throw new Error(
      errData.error?.message || `Failed to create Google Spreadsheet (${createRes.status})`
    );
  }

  const createdData = await createRes.json();
  const spreadsheetId = createdData.spreadsheetId;

  // Insert header columns
  const headerRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      SHEET_TAB_NAME
    )}!A1:M1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: `${SHEET_TAB_NAME}!A1:M1`,
        majorDimension: 'ROWS',
        values: [SHEET_COLUMNS],
      }),
    }
  );

  if (!headerRes.ok) {
    console.warn('Could not write header row to created sheet');
  }

  // Format header row with emerald styling
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: createdData.sheets?.[0]?.properties?.sheetId || 0,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: SHEET_COLUMNS.length,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: {
                    red: 0.08,
                    green: 0.12,
                    blue: 0.15,
                  },
                  textFormat: {
                    foregroundColor: {
                      red: 0.0,
                      green: 0.96,
                      blue: 0.63,
                    },
                    fontSize: 10,
                    bold: true,
                  },
                  horizontalAlignment: 'CENTER',
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
            },
          },
        ],
      }),
    });
  } catch (styleErr) {
    console.warn('Could not apply header styling:', styleErr);
  }

  setStoredSpreadsheetId(spreadsheetId);

  return {
    id: spreadsheetId,
    title,
    webViewLink: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
  };
}

/**
 * Obtains or creates the primary User Details spreadsheet
 */
export async function getOrCreateUserDetailsSpreadsheet(
  accessToken: string
): Promise<GoogleSpreadsheetInfo> {
  const savedId = getStoredSpreadsheetId();
  if (savedId) {
    try {
      const verifyRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${savedId}?fields=spreadsheetId,properties.title`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (verifyRes.ok) {
        const data = await verifyRes.json();
        return {
          id: data.spreadsheetId,
          title: data.properties?.title || SPREADSHEET_TITLE,
          webViewLink: `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`,
        };
      }
    } catch {
      // Saved ID invalid or expired, continue to search
    }
  }

  // Search Drive for existing
  const existing = await searchDriveForUserDetailsSheet(accessToken);
  if (existing) {
    setStoredSpreadsheetId(existing.id);
    return existing;
  }

  // Create new
  return await createStreakTrackerSpreadsheet(accessToken);
}

/**
 * Fetches all user rows stored in the spreadsheet
 */
export async function fetchSpreadsheetRows(
  accessToken: string,
  spreadsheetId: string
): Promise<{ headers: string[]; rows: SheetRowData[] }> {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      SHEET_TAB_NAME
    )}!A1:M1000`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(
      errData.error?.message || `Failed to read Google Sheets data (${res.status})`
    );
  }

  const data = await res.json();
  const rawValues: string[][] = data.values || [];

  if (rawValues.length === 0) {
    return { headers: SHEET_COLUMNS, rows: [] };
  }

  const headers = rawValues[0] || SHEET_COLUMNS;
  const rows: SheetRowData[] = [];

  for (let i = 1; i < rawValues.length; i++) {
    const r = rawValues[i];
    if (!r || r.length === 0) continue;
    rows.push({
      userId: r[0] || '',
      name: r[1] || '',
      email: r[2] || '',
      mobileNumber: r[3] || '',
      title: r[4] || '',
      role: r[5] || 'user',
      bio: r[6] || '',
      activeTracks: r[7] || '',
      dailyGoal: r[8] || '',
      profileCompleted: r[9] || 'true',
      createdAt: r[10] || '',
      updatedAt: r[11] || '',
      syncedAt: r[12] || '',
    });
  }

  return { headers, rows };
}

/**
 * Formats a UserProfile object into a row array matching SHEET_COLUMNS
 */
export function formatUserRow(
  user: UserProfile,
  extra?: { activeTracks?: string[]; dailyGoalMinutes?: number }
): string[] {
  const now = new Date().toLocaleString();
  const role = isUserAdmin(user.email) ? 'admin' : user.role || 'user';
  const tracks =
    extra?.activeTracks && extra.activeTracks.length > 0
      ? extra.activeTracks.join(', ')
      : 'Full Stack, React, DSA';
  const dailyGoal = extra?.dailyGoalMinutes ? String(extra.dailyGoalMinutes) : '60';

  return [
    user.userId || `user_${user.email.replace(/[^a-z0-9]/g, '_')}`,
    user.name || 'Developer',
    user.email || '',
    user.mobileNumber || '',
    user.title || 'Full Stack Engineer',
    role,
    user.bio || 'Daily cadence learner',
    tracks,
    dailyGoal,
    user.profileCompleted ? 'Completed' : 'Pending',
    user.createdAt || new Date().toISOString(),
    user.updatedAt || new Date().toISOString(),
    now,
  ];
}

/**
 * Saves or updates a single user record into the Google Sheet
 */
export async function saveUserToGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  user: UserProfile,
  extra?: { activeTracks?: string[]; dailyGoalMinutes?: number }
): Promise<{ updated: boolean; rowIndex: number }> {
  // Ensure header exists first
  try {
    const headCheck = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
        SHEET_TAB_NAME
      )}!A1:M1`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const headData = await headCheck.json().catch(() => ({}));
    if (!headData.values || headData.values.length === 0) {
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
          SHEET_TAB_NAME
        )}!A1:M1?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: [SHEET_COLUMNS],
          }),
        }
      );
    }
  } catch (e) {
    console.warn('Header verification notice:', e);
  }

  // Read existing IDs and emails to check if user already exists
  const existingRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      SHEET_TAB_NAME
    )}!A:C`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  const existingData = await existingRes.json().catch(() => ({}));
  const rawRows: string[][] = existingData.values || [];

  const targetEmail = user.email.trim().toLowerCase();
  const targetId = user.userId;

  let existingRowIndex = -1;
  for (let i = 1; i < rawRows.length; i++) {
    const row = rawRows[i];
    const rowId = row[0];
    const rowEmail = (row[2] || '').trim().toLowerCase();
    if ((targetId && rowId === targetId) || (targetEmail && rowEmail === targetEmail)) {
      existingRowIndex = i + 1; // 1-based index in Sheet
      break;
    }
  }

  const rowValues = formatUserRow(user, extra);

  if (existingRowIndex > 0) {
    // Update existing row
    const updateRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
        SHEET_TAB_NAME
      )}!A${existingRowIndex}:M${existingRowIndex}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [rowValues],
        }),
      }
    );

    if (!updateRes.ok) {
      const err = await updateRes.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to update row in Google Sheets (${updateRes.status})`);
    }

    return { updated: true, rowIndex: existingRowIndex };
  } else {
    // Append new row
    const appendRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
        SHEET_TAB_NAME
      )}!A:M:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [rowValues],
        }),
      }
    );

    if (!appendRes.ok) {
      const err = await appendRes.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to append row in Google Sheets (${appendRes.status})`);
    }

    return { updated: false, rowIndex: rawRows.length + 1 };
  }
}

/**
 * Bulk syncs an array of users to the spreadsheet
 */
export async function syncAllUsersToGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  users: UserProfile[]
): Promise<{ total: number; updatedCount: number; appendedCount: number }> {
  let updatedCount = 0;
  let appendedCount = 0;

  for (const user of users) {
    if (!user.email) continue;
    try {
      const result = await saveUserToGoogleSheet(accessToken, spreadsheetId, user);
      if (result.updated) {
        updatedCount++;
      } else {
        appendedCount++;
      }
    } catch (e) {
      console.warn(`Failed to sync user ${user.email} to sheet:`, e);
    }
  }

  return {
    total: users.length,
    updatedCount,
    appendedCount,
  };
}
