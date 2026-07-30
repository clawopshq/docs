(() => {
  const translations = new Map([
    ["On this page", "이 페이지에서"],
    ["Scroll to top", "맨 위로"],
    ["Search", "검색"],
    ["Ask a question", "질문하기"],
    ["Copy page", "페이지 복사"],
    ["View as Markdown", "Markdown으로 보기"],
    ["Open in Claude", "Claude에서 열기"],
    ["More actions", "더 보기"],
    ["Was this page helpful?", "이 페이지가 도움이 되었나요?"],
    ["Yes", "예"],
    ["No", "아니요"],
    ["Previous", "이전"],
    ["Next", "다음"],
    ["Copy", "복사"],
    ["Copied", "복사됨"],
    ["Light", "라이트"],
    ["Dark", "다크"],
    ["System", "시스템"],
  ]);

  const ignoredParents = new Set(["CODE", "PRE", "SCRIPT", "STYLE", "TEXTAREA"]);
  let scheduled = false;

  function translateTextNode(node) {
    const parent = node.parentElement;
    if (!parent || ignoredParents.has(parent.tagName)) return;

    const original = node.nodeValue ?? "";
    const trimmed = original.trim();
    const translated = translations.get(trimmed);
    if (!translated) return;

    node.nodeValue = original.replace(trimmed, translated);
  }

  function translate(root = document.body) {
    if (!root) return;

    document.documentElement.lang = "ko";
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();

    while (node) {
      translateTextNode(node);
      node = walker.nextNode();
    }
  }

  function scheduleTranslation() {
    if (scheduled) return;
    scheduled = true;

    requestAnimationFrame(() => {
      scheduled = false;
      translate();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => translate(), { once: true });
  } else {
    translate();
  }

  new MutationObserver(scheduleTranslation).observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });
})();
