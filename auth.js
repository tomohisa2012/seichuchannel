
/* =================================
   NISHICHU AUTH SYSTEM
   Supabase JS v2
================================= */

// =================================
// Supabase 設定
// =================================

// 自分のSupabase情報に置き換える
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

let supabaseClient = null;

if (
  SUPABASE_URL !== "YOUR_SUPABASE_URL" &&
  SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY" &&
  window.supabase
) {
  supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );
}

// =================================
// DOM
// =================================

const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const formTitle = document.getElementById("formTitle");
const formDescription = document.getElementById("formDescription");

const loginMessage = document.getElementById("loginMessage");
const registerMessage = document.getElementById("registerMessage");

const loginSubmit = document.getElementById("loginSubmit");
const registerSubmit = document.getElementById("registerSubmit");

// =================================
// メッセージ
// =================================

function showMessage(element, message, type) {
  element.textContent = message;
  element.className = "form-message show " + type;
}

function clearMessages() {
  loginMessage.className = "form-message";
  registerMessage.className = "form-message";

  loginMessage.textContent = "";
  registerMessage.textContent = "";
}

// =================================
// フォーム切り替え
// =================================

function switchForm(mode) {

  clearMessages();

  const isLogin = mode === "login";

  loginTab.classList.toggle("active", isLogin);
  registerTab.classList.toggle("active", !isLogin);

  loginForm.classList.toggle("hidden", !isLogin);
  registerForm.classList.toggle("hidden", isLogin);

  if (isLogin) {
    formTitle.textContent = "おかえりなさい。";
    formDescription.textContent =
      "アカウントにログインしてください。";
  } else {
    formTitle.textContent = "新しく始めよう。";
    formDescription.textContent =
      "アカウントを作成して参加しましょう。";
  }

  history.replaceState(
    null,
    "",
    isLogin ? "#login" : "#register"
  );
}

loginTab.addEventListener("click", () => {
  switchForm("login");
});

registerTab.addEventListener("click", () => {
  switchForm("register");
});

document.querySelectorAll("[data-switch]").forEach(button => {

  button.addEventListener("click", () => {
    switchForm(button.dataset.switch);
  });

});

// =================================
// パスワード表示切り替え
// =================================

document.querySelectorAll(".password-toggle").forEach(button => {

  button.addEventListener("click", () => {

    const input = document.getElementById(
      button.dataset.target
    );

    const visible = input.type === "password";

    input.type = visible ? "text" : "password";

    button.textContent = visible ? "非表示" : "表示";

  });

});

// =================================
// Supabase 接続チェック
// =================================

function checkConnection() {

  if (!supabaseClient) {
    showMessage(
      loginMessage,
      "SupabaseのURLとAnon Keyを設定してください。",
      "error"
    );

    return false;
  }

  return true;
}

// =================================
// ログイン
// =================================

loginForm.addEventListener("submit", async event => {

  event.preventDefault();

  clearMessages();

  if (!checkConnection()) return;

  const email = document
    .getElementById("loginEmail")
    .value.trim();

  const password = document
    .getElementById("loginPassword")
    .value;

  loginSubmit.disabled = true;
  loginSubmit.textContent = "ログイン中...";

  try {

    const { data, error } =
      await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

    if (error) throw error;

    if (!data.user) {
      throw new Error("ユーザー情報を取得できませんでした。");
    }

    showMessage(
      loginMessage,
      "ログインしました！ホームへ移動します。",
      "success"
    );

    setTimeout(() => {
      location.href = "index.html";
    }, 900);

  } catch (error) {

    console.error("Login error:", error);

    let message = "ログインに失敗しました。入力内容を確認してください。";

    if (error.message.includes("Invalid login credentials")) {
      message = "メールアドレスまたはパスワードが正しくありません。";
    } else if (error.message.includes("Email not confirmed")) {
      message = "メールアドレスの確認が完了していません。";
    } else if (error.message.includes("Too many requests")) {
      message = "試行回数が多すぎます。しばらく待ってください。";
    }

    showMessage(loginMessage, message, "error");

  } finally {

    loginSubmit.disabled = false;
    loginSubmit.innerHTML = 'ログイン <span>→</span>';

  }

});

// =================================
// 新規登録
// =================================

registerForm.addEventListener("submit", async event => {

  event.preventDefault();

  clearMessages();

  if (!checkConnection()) return;

  const username = document
    .getElementById("registerUsername")
    .value.trim();

  const email = document
    .getElementById("registerEmail")
    .value.trim();

  const password = document
    .getElementById("registerPassword")
    .value;

  const confirmPassword = document
    .getElementById("confirmPassword")
    .value;

  const agreeTerms = document
    .getElementById("agreeTerms")
    .checked;

  // 入力チェック
  if (username.length < 2 || username.length > 20) {
    showMessage(
      registerMessage,
      "ユーザー名は2〜20文字で入力してください。",
      "error"
    );
    return;
  }

  if (password.length < 8) {
    showMessage(
      registerMessage,
      "パスワードは8文字以上にしてください。",
      "error"
    );
    return;
  }

  if (password !== confirmPassword) {
    showMessage(
      registerMessage,
      "パスワードが一致していません。",
      "error"
    );
    return;
  }

  if (!agreeTerms) {
    showMessage(
      registerMessage,
      "利用規約に同意してください。",
      "error"
    );
    return;
  }

  registerSubmit.disabled = true;
  registerSubmit.textContent = "登録中...";

  try {

    const { data, error } =
      await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username
          }
        }
      });

    if (error) throw error;

    // Supabaseのメール確認設定に対応
    if (data.session) {

      showMessage(
        registerMessage,
        "アカウントを作成しました！ホームへ移動します。",
        "success"
      );

      setTimeout(() => {
        location.href = "index.html";
      }, 1200);

    } else {

      showMessage(
        registerMessage,
        "登録を受け付けました。メールに届いた確認リンクを開いてください。確認後にログインできます。",
        "success"
      );

      registerForm.reset();

    }

  } catch (error) {

    console.error("Register error:", error);

    let message = "登録に失敗しました。入力内容を確認してください。";

    if (
      error.message.includes("already registered") ||
      error.message.includes("User already registered")
    ) {
      message = "このメールアドレスはすでに登録されています。";
    } else if (error.message.includes("Password should be")) {
      message = "パスワードの条件を満たしていません。";
    } else if (error.message.includes("rate limit")) {
      message = "登録回数の制限に達しました。時間をおいてください。";
    }

    showMessage(registerMessage, message, "error");

  } finally {

    registerSubmit.disabled = false;
    registerSubmit.innerHTML =
      'アカウントを作成 <span>→</span>';

  }

});

// =================================
// 利用規約
// =================================

document.getElementById("termsLink").addEventListener(
  "click",
  event => {
    event.preventDefault();

    showMessage(
      registerMessage,
      "利用規約ページは今後作成予定です。正式公開前に規約を用意してください。",
      "error"
    );
  }
);

// =================================
// 初期表示
// =================================

const initialMode = location.hash === "#register"
  ? "register"
  : "login";

switchForm(initialMode);

// =================================
// 既にログインしている場合
// =================================

async function checkExistingSession() {

  if (!supabaseClient) return;

  try {

    const { data, error } =
      await supabaseClient.auth.getSession();

    if (error) throw error;

    if (data.session) {
      location.replace("index.html");
    }

  } catch (error) {

    console.error("Session check error:", error);

  }

}

checkExistingSession();
