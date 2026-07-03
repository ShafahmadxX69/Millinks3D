import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Request the required scopes for spreadsheets
provider.addScope('https://www.googleapis.com/auth/spreadsheets');

// Spreadsheet Constants
export const SPREADSHEET_ID = '1XoV7020NTZk1kzqn3F2ks3gOVFJ5arr5NVgUdewWPNQ';
export const SHEET_NAME = 'MillinksDB';

// In-memory cache for the Google OAuth Access Token
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Since Firebase Auth doesn't persist the Google OAuth access token across reloads,
        // we'll need the user to click sign-in to get a fresh token if they want to sync with Sheets.
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Google Sign-In.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Log out
export const logoutUser = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// Helper: Ensure the "MillinksDB" sheet tab exists
async function ensureSheetTabExists(token: string): Promise<void> {
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  try {
    // Get spreadsheet metadata to check sheet names
    const metadataRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}`, {
      headers,
    });
    
    if (!metadataRes.ok) {
      throw new Error(`Failed to fetch spreadsheet metadata: ${metadataRes.statusText}`);
    }

    const metadata = await metadataRes.json();
    const sheets = metadata.sheets || [];
    const hasMillinksTab = sheets.some((s: any) => s.properties?.title === SHEET_NAME);

    if (!hasMillinksTab) {
      console.log(`Tab "${SHEET_NAME}" not found. Creating it...`);
      const createRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}:batchUpdate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          requests: [
            {
              addSheet: {
                properties: {
                  title: SHEET_NAME,
                },
              },
            },
          ],
        }),
      });

      if (!createRes.ok) {
        const errDetail = await createRes.text();
        throw new Error(`Failed to create "${SHEET_NAME}" sheet tab: ${errDetail}`);
      }
      console.log(`Tab "${SHEET_NAME}" successfully created.`);
    }
  } catch (err) {
    console.error('Error in ensureSheetTabExists:', err);
    throw err;
  }
}

// Fetch models from the spreadsheet
export interface SheetModel {
  model: string;
  size: string;
  length: number;
  width: number;
  height: number;
}

export const fetchModelsFromSheet = async (token: string): Promise<SheetModel[]> => {
  await ensureSheetTabExists(token);

  const range = `${SHEET_NAME}!A:E`;
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch models from sheet: ${res.statusText}`);
  }

  const data = await res.json();
  const rows: string[][] = data.values || [];

  if (rows.length <= 1) {
    // Empty or only header row
    return [];
  }

  // First row is the header: ["Model", "Size", "Length", "Width", "Height"]
  const models: SheetModel[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length >= 5 && row[0]?.trim() && row[1]?.trim()) {
      models.push({
        model: row[0].trim(),
        size: row[1].trim(),
        length: parseInt(row[2]) || 300,
        width: parseInt(row[3]) || 300,
        height: parseInt(row[4]) || 300,
      });
    }
  }

  return models;
};

// Save all models to the spreadsheet (clear and overwrite)
export const saveModelsToSheet = async (token: string, models: SheetModel[]): Promise<void> => {
  await ensureSheetTabExists(token);

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // 1. Clear existing values
  const clearRange = `${SHEET_NAME}!A1:E1000`;
  const clearRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(clearRange)}:clear`, {
    method: 'POST',
    headers,
  });

  if (!clearRes.ok) {
    throw new Error(`Failed to clear sheet: ${clearRes.statusText}`);
  }

  // 2. Prepare data to write
  const values = [
    ['Model', 'Size', 'Length', 'Width', 'Height'],
    ...models.map(m => [
      m.model,
      m.size,
      m.length.toString(),
      m.width.toString(),
      m.height.toString()
    ])
  ];

  const writeRange = `${SHEET_NAME}!A1:E${values.length}`;
  const writeRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(writeRange)}?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      range: writeRange,
      majorDimension: 'ROWS',
      values,
    }),
  });

  if (!writeRes.ok) {
    const errDetail = await writeRes.text();
    throw new Error(`Failed to save models to sheet: ${errDetail}`);
  }
};
