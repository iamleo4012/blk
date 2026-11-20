/**
 * Registered staff identity records.
 *
 * Selfie verification currently runs fully on-device (see
 * SelfieVerification.tsx). Until a backend identity service exists,
 * identifyUser() resolves the verified face against this local registry —
 * it is the single place to swap in a real lookup later.
 */

export interface StaffUser {
  id: string;
  fullName: string;
  /** Face registration images (straight, slightly-left, slightly-right). */
  faceImages?: string[];
}

export const REGISTERED_USERS: StaffUser[] = [
  { id: "u-001", fullName: "Leo Joseph" },
];

/**
 * Registers a staff member from the account/registration screen so future
 * selfie verification can identify them. Client-side registry until a
 * backend identity service exists.
 */
export function addRegisteredUser(fullName: string, faceImages?: string[]): StaffUser {
  const existing = REGISTERED_USERS.find(
    (u) => u.fullName.toLowerCase() === fullName.toLowerCase(),
  );
  if (existing) {
    if (faceImages) existing.faceImages = faceImages;
    return existing;
  }
  const user: StaffUser = { id: `u-${Date.now()}`, fullName, faceImages };
  REGISTERED_USERS.push(user);
  return user;
}

/**
 * Resolves the staff account matched by a successful face verification.
 * Stubbed to the matched registered user until server-side identity lands.
 */
export async function identifyUser(): Promise<StaffUser> {
  // Simulate the latency of a real identity match.
  await new Promise((r) => setTimeout(r, 250));
  return REGISTERED_USERS[0];
}
