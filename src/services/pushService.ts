import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { CheckInStatus } from '../types';

const EXPO_PUSH_URL = 'https://exp.host/--/expo-push/v2/push/send';

// For MVP, all users belong to the same household.
// Replace with user.householdId once real auth is in place.
const DEFAULT_HOUSEHOLD_ID = 'household-1';

export async function saveUserPushToken(
  userId: string,
  token: string,
  role: string,
  name: string,
): Promise<void> {
  await setDoc(
    doc(db, 'users', userId),
    {
      expoPushToken: token,
      householdId: DEFAULT_HOUSEHOLD_ID,
      role,
      name,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}

async function getFamilyTokens(householdId: string): Promise<string[]> {
  const q = query(
    collection(db, 'users'),
    where('householdId', '==', householdId),
    where('role', '==', 'family'),
  );
  const snapshot = await getDocs(q);
  const tokens: string[] = [];
  snapshot.forEach((d) => {
    const token = d.data().expoPushToken as string | undefined;
    if (token) tokens.push(token);
  });
  return tokens;
}

function buildMessage(elderName: string, status: CheckInStatus) {
  const first = elderName.split(' ')[0];
  switch (status) {
    case 'urgent':
      return {
        title: `URGENT: ${first} needs immediate help!`,
        body: `${first} pressed the urgent help button — please respond right away.`,
        priority: 'high' as const,
      };
    case 'help':
      return {
        title: `${first} needs help`,
        body: `${first} has asked for assistance. Please check in with them.`,
        priority: 'high' as const,
      };
    default:
      return {
        title: `${first} is doing well`,
        body: `${first} just completed their daily check-in.`,
        priority: 'normal' as const,
      };
  }
}

export async function notifyFamilyOfCheckIn(
  elderName: string,
  elderId: string,
  status: CheckInStatus,
  householdId = DEFAULT_HOUSEHOLD_ID,
): Promise<void> {
  const tokens = await getFamilyTokens(householdId);
  if (tokens.length === 0) return;

  const { title, body, priority } = buildMessage(elderName, status);

  await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(
      tokens.map((to) => ({
        to,
        sound: 'default',
        title,
        body,
        data: { elderId, status, type: 'check-in' },
        priority,
      })),
    ),
  });
}
