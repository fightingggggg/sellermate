import { createContext, useContext, useEffect, useState } from "react";
import { 
  User as FirebaseUser, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  sendPasswordResetEmail,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
  updateEmail
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { User, UserProfile } from "@/types";
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";

interface AuthContextProps {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  signUp: (email: string, password: string, businessName?: string, businessLink?: string, number?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserProfile: (profileData: Partial<UserProfile>) => Promise<boolean>;
  updateUserEmail: (newEmail: string, password: string) => Promise<boolean>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  deleteUserAccount: (password: string) => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<boolean>;
  verifyEmail: () => Promise<boolean>;
  error: string | null;
}

const AuthContext = createContext<AuthContextProps>({
  currentUser: null,
  userProfile: null,
  loading: true,
  profileLoading: false,
  signUp: async () => {},
  signIn: async () => false,
  logout: async () => {},
  updateUserProfile: async () => false,
  updateUserEmail: async () => false,
  updateUserPassword: async () => false,
  deleteUserAccount: async () => false,
  sendPasswordReset: async () => false,
  verifyEmail: async () => false,
  error: null
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 사용자 프로필 불러오기
  async function fetchUserProfile(uid: string) {
    setProfileLoading(true);
    try {
      const userDocRef = doc(db, "userInfo", uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as Omit<UserProfile, 'uid' | 'email' | 'displayName' | 'photoURL'>;
        setUserProfile({
          ...(currentUser as User),
          ...userData,
          emailVerified: auth.currentUser?.emailVerified || false
        });
      } else {
        setUserProfile(currentUser as UserProfile);
      }
    } catch (error: any) {
      console.error("Error fetching user profile", error);
      setError("사용자 정보를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setProfileLoading(false);
    }
  }

  // 회원가입 함수
  async function signUp(
    email: string, 
    password: string, 
    businessName?: string, 
    businessLink?: string, 
    number?: string
  ) {
    setError(null);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const user = credential.user;
      
      // 이메일 인증 메일 발송
      await sendEmailVerification(user);
      
      // 사용자 추가 정보 저장
      if (user && (businessName || businessLink || number)) {
        const userProfile: Partial<UserProfile> = {
          businessName,
          businessLink,
          number,
          createdAt: new Date().toISOString(),
          emailVerified: false
        };
        
        await setDoc(doc(db, "userInfo", user.uid), userProfile);
      }
    } catch (error: any) {
      console.error("Error signing up", error);
      setError(error.message || "회원가입 중 오류가 발생했습니다.");
      throw error;
    }
  }

  // 로그인 함수
  async function signIn(email: string, password: string): Promise<boolean> {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error: any) {
      console.error("Error signing in", error);
      setError(error.message || "로그인 중 오류가 발생했습니다.");
      return false;
    }
  }

  // 로그아웃 함수
  async function logout() {
    setError(null);
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (error: any) {
      console.error("Error logging out", error);
      setError(error.message || "로그아웃 중 오류가 발생했습니다.");
    }
  }

  // 사용자 프로필 업데이트
  async function updateUserProfile(profileData: Partial<UserProfile>): Promise<boolean> {
    setError(null);
    if (!currentUser) {
      setError("로그인이 필요합니다.");
      return false;
    }

    try {
      const userDocRef = doc(db, "userInfo", currentUser.uid);
      
      // 해당 문서가 존재하는지 확인
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        // 문서가 있으면 업데이트
        await updateDoc(userDocRef, profileData);
      } else {
        // 문서가 없으면 새로 생성
        await setDoc(userDocRef, {
          ...profileData,
          createdAt: new Date().toISOString(),
          emailVerified: auth.currentUser?.emailVerified || false
        });
      }
      
      // 상태 업데이트
      setUserProfile(prev => prev ? { ...prev, ...profileData } : null);
      return true;
    } catch (error: any) {
      console.error("Error updating profile", error);
      setError(error.message || "프로필 업데이트 중 오류가 발생했습니다.");
      return false;
    }
  }

  // 이메일 업데이트
  async function updateUserEmail(newEmail: string, password: string): Promise<boolean> {
    setError(null);
    if (!auth.currentUser || !currentUser) {
      setError("로그인이 필요합니다.");
      return false;
    }

    try {
      // 사용자 재인증
      const credential = EmailAuthProvider.credential(
        currentUser.email || '', 
        password
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // 이메일 업데이트
      await updateEmail(auth.currentUser, newEmail);
      
      // 이메일 인증 재발송
      await sendEmailVerification(auth.currentUser);
      
      // 프로필 업데이트
      setCurrentUser(prev => prev ? { ...prev, email: newEmail } : null);
      setUserProfile(prev => prev ? { ...prev, email: newEmail } : null);
      
      return true;
    } catch (error: any) {
      console.error("Error updating email", error);
      setError(error.message || "이메일 업데이트 중 오류가 발생했습니다.");
      return false;
    }
  }

  // 비밀번호 업데이트
  async function updateUserPassword(currentPassword: string, newPassword: string): Promise<boolean> {
    setError(null);
    if (!auth.currentUser || !currentUser) {
      setError("로그인이 필요합니다.");
      return false;
    }

    try {
      // 사용자 재인증
      const credential = EmailAuthProvider.credential(
        currentUser.email || '', 
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // 비밀번호 업데이트
      await updatePassword(auth.currentUser, newPassword);
      return true;
    } catch (error: any) {
      console.error("Error updating password", error);
      setError(error.message || "비밀번호 업데이트 중 오류가 발생했습니다.");
      return false;
    }
  }

  // 회원 탈퇴
  async function deleteUserAccount(password: string): Promise<boolean> {
    setError(null);
    if (!auth.currentUser || !currentUser) {
      setError("로그인이 필요합니다.");
      return false;
    }

    try {
      // 사용자 재인증
      const credential = EmailAuthProvider.credential(
        currentUser.email || '', 
        password
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Firestore에서 사용자 정보 삭제
      await deleteDoc(doc(db, "userInfo", currentUser.uid));
      
      // Firebase Auth에서 사용자 삭제
      await deleteUser(auth.currentUser);
      
      setCurrentUser(null);
      setUserProfile(null);
      return true;
    } catch (error: any) {
      console.error("Error deleting account", error);
      setError(error.message || "회원 탈퇴 중 오류가 발생했습니다.");
      return false;
    }
  }

  // 비밀번호 재설정 이메일 발송
  async function sendPasswordReset(email: string): Promise<boolean> {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error: any) {
      console.error("Error sending password reset", error);
      setError(error.message || "비밀번호 재설정 이메일 발송 중 오류가 발생했습니다.");
      return false;
    }
  }

  // 이메일 인증 발송
  async function verifyEmail(): Promise<boolean> {
    setError(null);
    if (!auth.currentUser) {
      setError("로그인이 필요합니다.");
      return false;
    }

    try {
      await sendEmailVerification(auth.currentUser);
      return true;
    } catch (error: any) {
      console.error("Error sending verification email", error);
      setError(error.message || "이메일 인증 발송 중 오류가 발생했습니다.");
      return false;
    }
  }

  // 인증 상태 변경 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: FirebaseUser | null) => {
      if (user) {
        const userData: User = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        };
        setCurrentUser(userData);
        fetchUserProfile(user.uid);
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    profileLoading,
    signUp,
    signIn,
    logout,
    updateUserProfile,
    updateUserEmail,
    updateUserPassword,
    deleteUserAccount,
    sendPasswordReset,
    verifyEmail,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
