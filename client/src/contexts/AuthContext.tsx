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
  updateEmail,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { User, UserProfile } from "@/types";
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";

interface AuthContextProps {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  signUp: (
    email: string,
    password: string,
    businessName?: string,
    businessLink?: string,
    number?: string,
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserProfile: (profileData: Partial<UserProfile>) => Promise<boolean>;
  fetchUserProfile: () => Promise<UserProfile | null>;
  updateUserEmail: (newEmail: string, password: string) => Promise<boolean>;
  updateUserPassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<boolean>;
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
  fetchUserProfile: async () => null, // ✅ 이 줄이 누락되었음
  updateUserEmail: async () => false,
  updateUserPassword: async () => false,
  deleteUserAccount: async () => false,
  sendPasswordReset: async () => false,
  verifyEmail: async () => false,
  error: null,
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

  

  // 회원가입 함수
  async function signUp(
    email: string,
    password: string,
    businessName?: string,
    businessLink?: string,
    number?: string,
  ) {
    setError(null);
    try {
      // 사용자 생성
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = credential.user;

      if (user) {
        try {
          // 사용자 정보 즉시 저장
          const userProfile = {
            uid: user.uid,
            email: user.email,
            businessName: businessName || "",
            businessLink: businessLink || "",
            number: number || "",
            createdAt: new Date(),
            emailVerified: false,
          };

          // 사용자 정보 저장
          await setDoc(doc(db, "usersInfo", user.uid), userProfile);

          // 이메일 인증 메일 발송
          await sendEmailVerification(user);

          // 로그아웃
          await signOut(auth);
          setCurrentUser(null);
          setUserProfile(null);
          setError(
            "회원가입이 완료되었습니다! \n 이메일을 확인하여 인증을 완료해주세요.",
          );
        } catch (error) {
          console.error("Error creating user profile:", error);
          await signOut(auth);
          setCurrentUser(null);
          setUserProfile(null);
          setError(
            "회원가입이 완료되었습니다! 이메일을 확인하여 인증을 완료해주세요.",
          );
        }
      }
    } catch (error: any) {
      console.error("Error signing up", error);
      if (error.code === "auth/email-already-in-use") {
        setError(
          "이미 가입된 이메일입니다. 로그인을 시도하거나 비밀번호 찾기를 이용해주세요.",
        );
      } else if (error.code === "auth/invalid-email") {
        setError("올바른 이메일 형식이 아닙니다.");
      } else if (error.code === "auth/weak-password") {
        setError("비밀번호는 최소 6자 이상이어야 합니다.");
      } else {
        setError("회원가입 중 오류가 발생했습니다.");
      }
      throw error;
    }
  }

  // 로그인 함수
  async function signIn(email: string, password: string): Promise<boolean> {
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      if (!userCredential.user.emailVerified) {
        await signOut(auth);
        setError(
          "이메일 인증이 필요합니다. 이메일함을 확인하여 인증을 완료해주세요.",
        );
        return false;
      }
      await fetchUserProfile();
      return true;
    } catch (error: any) {
      console.error("Error signing in", error);
      if (error.code === "auth/invalid-email") {
        setError(
          "유효하지 않은 이메일 형식입니다. 이메일 주소를 다시 확인해 주세요.",
        );
      } else if (error.code === "auth/wrong-password") {
        setError("잘못된 비밀번호입니다.");
      } else if (error.code === "auth/invalid-credential") {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else if (error.code === "auth/user-not-found") {
        setError("등록되지 않은 이메일입니다. 회원가입을 먼저 진행해 주세요.");
      } else if (error.code === "auth/too-many-requests") {
        setError(
          "너무 많은 로그인 시도가 감지되었습니다. 보안을 위해 잠시 후 다시 시도해 주세요.",
        );
      } else {
        setError("로그인 중 오류가 발생했습니다.");
      }
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
  async function updateUserProfile(
    profileData: Partial<UserProfile>,
  ): Promise<boolean> {
    setError(null);
    if (!currentUser) {
      setError("로그인이 필요합니다.");
      return false;
    }

    try {
      // usersInfo 컬렉션 사용
      const userDocRef = doc(db, "usersInfo", currentUser.uid);

      // 해당 문서가 존재하는지 확인
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        // 문서가 있으면 업데이트
        await updateDoc(userDocRef, profileData);
      } else {
        // 문서가 없으면 새로 생성
        await setDoc(userDocRef, {
          uid: currentUser.uid,
          email: currentUser.email,
          ...profileData,
          createdAt: new Date().toISOString(),
          emailVerified: auth.currentUser?.emailVerified || false,
        });
      }

      // 상태 업데이트
      setUserProfile((prev) => (prev ? { ...prev, ...profileData } : null));
      return true;
    } catch (error: any) {
      console.error("Error updating profile", error);
      setError(error.message || "프로필 업데이트 중 오류가 발생했습니다.");
      return false;
    }
  }

    // 사용자 프로필 가져오기
async function fetchUserProfile(): Promise<UserProfile | null> {
  setError(null);
  if (!currentUser) {
    setError("로그인이 필요합니다.");
    return null;
  }

  try {
    const userDocRef = doc(db, "usersInfo", currentUser.uid);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const userData = docSnap.data() as UserProfile;
      setUserProfile(userData);
      return userData;
    } else {
      setError("사용자 프로필이 존재하지 않습니다.");
      return null;
    }
  } catch (error: any) {
    console.error("Error fetching profile", error);
    setError(error.message || "프로필 불러오기 중 오류가 발생했습니다.");
    return null;
  }
}

  // 이메일 업데이트
  async function updateUserEmail(
    newEmail: string,
    password: string,
  ): Promise<boolean> {
    setError(null);
    if (!auth.currentUser || !currentUser) {
      setError("로그인이 필요합니다.");
      return false;
    }

    try {
      // 사용자 재인증
      const credential = EmailAuthProvider.credential(
        currentUser.email || "",
        password,
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      // 이메일 업데이트
      await updateEmail(auth.currentUser, newEmail);

      // 이메일 인증 재발송
      await sendEmailVerification(auth.currentUser);

      // 프로필 업데이트
      setCurrentUser((prev) => (prev ? { ...prev, email: newEmail } : null));
      setUserProfile((prev) => (prev ? { ...prev, email: newEmail } : null));

      return true;
    } catch (error: any) {
      console.error("Error updating email", error);
      setError(error.message || "이메일 업데이트 중 오류가 발생했습니다.");
      return false;
    }
  }

  // 비밀번호 업데이트
  async function updateUserPassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<boolean> {
    setError(null);
    if (!auth.currentUser || !currentUser) {
      setError("로그인이 필요합니다.");
      return false;
    }

    try {
      // 사용자 재인증
      const credential = EmailAuthProvider.credential(
        currentUser.email || "",
        currentPassword,
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

  //탈퇴
  async function deleteUserAccount(password: string): Promise<boolean> {
    setError(null);
    if (!auth.currentUser || !currentUser) {
      setError("로그인이 필요합니다.");
      return false;
    }

    try {
      // 사용자 재인증
      const credential = EmailAuthProvider.credential(
        currentUser.email || "",
        password,
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Firestore에서 사용자 정보 삭제
      await deleteDoc(doc(db, "usersInfo", currentUser.uid));

      // Firebase Auth에서 사용자 삭제
      await deleteUser(auth.currentUser);

      setCurrentUser(null);
      setUserProfile(null);
      return true;
    } catch (error: any) {
      console.error("Error deleting account", error);

      switch (error.code) {
        case "auth/wrong-password":
          setError("비밀번호가 올바르지 않습니다. 다시 입력해 주세요.");
          break;
        case "auth/too-many-requests":
          setError(
            "너무 많은 시도가 감지되었습니다. 보안을 위해 잠시 후 다시 시도해 주세요.",
          );
          break;
        case "auth/requires-recent-login":
          setError(
            "보안을 위해 최근 로그인한 사용자만 탈퇴할 수 있습니다. 다시 로그인해 주세요.",
          );
          break;
        case "auth/invalid-credential":
          setError("이메일 또는 비밀번호가 올바르지 않습니다.");
          break;
        default:
          setError("회원 탈퇴 중 오류가 발생했습니다.");
          break;
      }

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
      setError(
        error.message || "비밀번호 재설정 이메일 발송 중 오류가 발생했습니다.",
      );
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
      await sendEmailVerification(auth.currentUser, {
        url: window.location.origin + "/login",
        handleCodeInApp: true,
      });
      return true;
    } catch (error: any) {
      console.error("Error sending verification email", error);
      setError(error.message || "이메일 인증 발송 중 오류가 발생했습니다.");
      return false;
    }
  }

  // 인증 상태 변경 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userData: User = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        };
        setCurrentUser(userData);
  
        try {
          // Firestore에서 프로필 정보 불러오기
          const userDocRef = doc(db, "usersInfo", user.uid);
          const docSnap = await getDoc(userDocRef);
  
          if (docSnap.exists()) {
            const userData = docSnap.data() as UserProfile;
            setUserProfile(userData);
          } else {
            // Firestore에 프로필이 없다면 기본 정보로 설정
            setUserProfile({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              businessName: "",
              businessLink: "",
              number: "",
              emailVerified: user.emailVerified,
              createdAt: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error("자동 프로필 불러오기 실패:", error);
        }
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
    fetchUserProfile,
    updateUserEmail,
    updateUserPassword,
    deleteUserAccount,
    sendPasswordReset,
    verifyEmail,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}