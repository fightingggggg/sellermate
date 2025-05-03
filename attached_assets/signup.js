// 회원가입 폼 처리
const signupForm = document.getElementById('signup-form');
const API_URL = 'https://port-0-naverseo-m7nih0ld83b58082.sel4.cloudtype.app';
const localUrl = 'http://localhost:3001'
const submitButton = document.querySelector('.submit-btn'); // 버튼 요소 가져오기

function showAlert(message, type) {
    const alertElement = document.getElementById('alert-message');
    alertElement.textContent = message;
    alertElement.className = `alert ${type === 'success' ? 'alert-success' : 'alert-error'}`;
    alertElement.style.display = 'block';

    setTimeout(() => {
        alertElement.style.display = 'none';
    }, 5000);
}
// 로딩 상태 변경 함수
function setLoadingState(isLoading) {
    if (isLoading) {
        submitButton.disabled = true;
        submitButton.innerHTML = '회원가입 <span class="spinner"></span>'; // 스피너 추가
    } else {
        submitButton.disabled = false;
        submitButton.innerHTML = '회원가입';
    }
}

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const businessName = document.getElementById('business-name').value;
    const businessLink = document.getElementById('business-link').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const email = document.getElementById('email').value;
    const number = document.getElementById('number').value;
    const termsAccepted = document.getElementById('terms').checked;

    if (!termsAccepted) {
        showAlert('이용약관과 개인정보처리방침에 동의해야 회원가입이 가능합니다.', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showAlert('비밀번호가 일치하지 않습니다.', 'error');
        return;
    }
  
      // 이메일 형식 검사
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
          showAlert('올바른 이메일 형식을 입력해주세요.', 'error');
          return;
      }

      setLoadingState(true); // 로딩 시작
  

    try {
        const response = await fetch(`${API_URL}/api/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, businessName, businessLink, number })
        });

        // JSON 형식으로 변환 시도, 실패하면 텍스트로 받음
        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            const text = await response.text();
            console.error('서버 응답 (텍스트):', text);
            throw new Error('서버 응답이 올바른 JSON 형식이 아닙니다.');
        }

        if (!response.ok) {
            
            if (data.code === "auth/email-already-exists") {
                showAlert("이미 가입된 이메일입니다.", "error");
                return;
            } else if(data.code === "auth/invalid-email"){
                showAlert("올바른 이메일 형식을 입력해주세요.", "error");
                return;
            } else if (data.code === "auth/invalid-password") {
                showAlert("비밀번호는 소문자와 특수문자를 포함하고 6자 이상이어야 합니다.", "error");
                return;
            }
            throw new Error(data.error || "회원가입에 실패했습니다.");
        }

        showAlert(data.message, 'success');
        alert('회원가입 성공! 이메일 인증을 완료해주세요.');

    } catch (error) {
        console.error("회원가입 요청 오류:", error);
        showAlert(`회원가입 실패: ${error.message || "알 수 없는 오류 발생"}`, "error");
    } finally {
        setLoadingState(false); // 로딩 종료
    }
});


// 비밀번호 재설정 요청
const handlePasswordReset = async () => {
    const email = prompt('비밀번호를 재설정할 이메일을 입력하세요:');
    if (!email) return alert('이메일을 입력해야 합니다.');
  
    try {
      const response = await fetch(`${API_URL}/api/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
  
      alert(data.message);
    } catch (error) {
      alert(error.message);
    }
  };

  window.onload = () => {
    document.getElementById('forgot-password')?.addEventListener('click', handlePasswordReset);
  };

 