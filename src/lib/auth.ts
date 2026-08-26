export interface User {
  name: string;
  email: string;
}

export function getUser(): User | null {
  try {
    const userStr = localStorage.getItem("krushimitra_user");
    if (userStr) return JSON.parse(userStr);
  } catch (e) {
    console.error("Failed to parse user", e);
  }
  return { name: "Farmer", email: "farmer@krushimitra.com" };
}

export function saveUser(user: User): void {
  try {
    localStorage.setItem("krushimitra_user", JSON.stringify(user));
  } catch (e) {
    console.error("Failed to save user", e);
  }
}

export function logoutUser(): void {
  try {
    localStorage.removeItem("krushimitra_user");
  } catch (e) {
    console.error("Failed to logout user", e);
  }
}
