
/* =================================
   西中ちゃんねる - Main JavaScript
================================= */

document.addEventListener("DOMContentLoaded", () => {

  // DOM
  const sidebar = document.getElementById("sidebar");
  const menuToggle = document.getElementById("menuToggle");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const content = document.getElementById("content");

  const currentPageName = document.getElementById("currentPageName");
  const navItems = document.querySelectorAll(".nav-item[data-page]");

  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const themeText = document.getElementById("themeText");

  const searchInput = document.getElementById("searchInput");
  const toast = document.getElementById("toast");

  // ページ名
  const pageNames = {
    home: "ホーム",
    board: "掲示板",
    blog: "ブログ",
    gourmet: "グルメ・口コミ",
    news: "お知らせ",
    popular: "人気コンテンツ"
  };

  // トースト表示
  let toastTimer;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2500);
  }

  // =================================
  // ページ切り替え
  // =================================

  function changePage(page) {

    if (!pageNames[page]) return;

    // ページ表示
    document.querySelectorAll(".page").forEach(element => {
      element.classList.remove("active");
    });

    const targetPage = document.getElementById("page-" + page);

    if (!targetPage) return;

    targetPage.classList.add("active");

    // ナビゲーション
    navItems.forEach(item => {
      item.classList.toggle(
        "active",
        item.dataset.page === page
      );
    });

    // パンくずリスト
    currentPageName.textContent = pageNames[page];

    // スマホメニューを閉じる
    closeSidebar();

    // スクロール位置
    content.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    // URLのハッシュを変更
    history.replaceState(null, "", "#" + page);
  }

  // サイドバーのクリック
  navItems.forEach(item => {
    item.addEventListener("click", () => {
      changePage(item.dataset.page);
    });
  });

  // カード・ボタンからの移動
  document.querySelectorAll("[data-go]").forEach(button => {

    button.addEventListener("click", () => {
      changePage(button.dataset.go);
    });

  });

  // =================================
  // 初期ページ
  // =================================

  const initialPage = location.hash.replace("#", "");

  if (pageNames[initialPage]) {
    changePage(initialPage);
  } else {
    changePage("home");
  }

  // 戻る・進む
  window.addEventListener("popstate", () => {

    const page = location.hash.replace("#", "");

    if (pageNames[page]) {
      changePage(page);
    } else {
      changePage("home");
    }

  });

  // =================================
  // スマホメニュー
  // =================================

  function openSidebar() {
    sidebar.classList.add("open");
    sidebarOverlay.classList.add("show");
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("show");
  }

  menuToggle.addEventListener("click", () => {

    if (sidebar.classList.contains("open")) {
      closeSidebar();
    } else {
      openSidebar();
    }

  });

  sidebarOverlay.addEventListener("click", closeSidebar);

  // =================================
  // ダークモード
  // =================================

  function updateThemeButton() {

    const isDark = document.body.classList.contains("dark");

    if (isDark) {
      themeIcon.textContent = "☀";
      themeText.textContent = "ライトモード";
    } else {
      themeIcon.textContent = "☾";
      themeText.textContent = "ダークモード";
    }

  }

  // 保存された設定を読み込む
  const savedTheme = localStorage.getItem("nishichu-theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark");
  }

  updateThemeButton();

  themeToggle.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    const isDark = document.body.classList.contains("dark");

    localStorage.setItem(
      "nishichu-theme",
      isDark ? "dark" : "light"
    );

    updateThemeButton();

    showToast(
      isDark
        ? "ダークモードに変更しました"
        : "ライトモードに変更しました"
    );

  });

  // =================================
  // 検索
  // =================================

  function searchSite() {

    const keyword = searchInput.value.trim().toLowerCase();

    if (!keyword) {
      showToast("検索キーワードを入力してください");
      return;
    }

    const searchablePages = [
      {
        id: "board",
        words: "掲示板 スレッド 雑談 返信 コミュニティ"
      },
      {
        id: "blog",
        words: "ブログ 記事 日記 投稿"
      },
      {
        id: "gourmet",
        words: "グルメ 口コミ 食べログ お店 食べ物 レビュー"
      },
      {
        id: "news",
        words: "お知らせ 情報 ニュース"
      },
      {
        id: "popular",
        words: "人気 ランキング コンテンツ"
      },
      {
        id: "home",
        words: "ホーム 西中ちゃんねる"
      }
    ];

    const results = searchablePages.filter(page => {
      return page.words.toLowerCase().includes(keyword);
    });

    if (results.length === 0) {
      showToast("該当するコンテンツが見つかりません");
      return;
    }

    if (results.length === 1) {
      changePage(results[0].id);
      showToast("検索結果を表示しました");
      return;
    }

    // 複数の結果がある場合
    changePage(results[0].id);
    showToast(
      results.length + "件の候補があります。検索結果の先頭を表示しました"
    );

  }

  searchInput.addEventListener("keydown", event => {

    if (event.key === "Enter") {
      searchSite();
    }

  });

  // =================================
  // ヘッダーボタン
  // =================================

  document.getElementById("notificationButton")
    .addEventListener("click", () => {
      changePage("news");
      showToast("お知らせを表示しています");
    });

  document.getElementById("userButton")
    .addEventListener("click", () => {
      showToast("ログイン機能は今後追加予定です");
    });

  // =================================
  // キーボード操作
  // =================================

  document.addEventListener("keydown", event => {

    // ESCでメニューを閉じる
    if (event.key === "Escape") {
      closeSidebar();
    }

    // Ctrl + K で検索欄に移動
    if (
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === "k"
    ) {
      event.preventDefault();
      searchInput.focus();
    }

  });

});
