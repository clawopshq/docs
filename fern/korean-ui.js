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
  let activePreview = null;

  function setPreviewButtonState(button, playing) {
    button.classList.toggle("is-playing", playing);
    const voiceName = button.dataset.voiceName || "음성";
    const action = playing ? "정지" : "재생";
    button.setAttribute("aria-label", `${voiceName} 미리듣기 ${action}`);
    button.title = `미리듣기 ${action}`;
  }

  function stopActivePreview(exceptAudio = null) {
    if (!activePreview || activePreview.audio === exceptAudio) return;
    activePreview.audio.pause();
    activePreview.audio.currentTime = 0;
    setPreviewButtonState(activePreview.button, false);
    activePreview = null;
  }

  function enhanceVoicePreviews(root = document) {
    root
      .querySelectorAll("audio.clawops-voice-preview:not([data-preview-enhanced])")
      .forEach((audio) => {
        audio.dataset.previewEnhanced = "true";

        const button = document.createElement("button");
        const voiceName =
          audio.closest("tr")?.querySelector("td")?.textContent?.trim() || "음성";
        button.type = "button";
        button.className = "clawops-voice-preview-button";
        button.dataset.voiceName = voiceName;
        button.innerHTML =
          '<span class="clawops-voice-preview-icon" aria-hidden="true"></span>';
        setPreviewButtonState(button, false);

        button.addEventListener("click", async () => {
          if (!audio.paused) {
            audio.pause();
            audio.currentTime = 0;
            setPreviewButtonState(button, false);
            if (activePreview?.audio === audio) activePreview = null;
            return;
          }

          stopActivePreview(audio);
          try {
            await audio.play();
            activePreview = { audio, button };
            setPreviewButtonState(button, true);
          } catch {
            button.classList.add("has-error");
            button.setAttribute("aria-label", `${voiceName} 미리듣기를 재생하지 못했습니다`);
            button.title = "미리듣기를 재생하지 못했습니다";
          }
        });

        audio.addEventListener("ended", () => {
          audio.currentTime = 0;
          setPreviewButtonState(button, false);
          if (activePreview?.audio === audio) activePreview = null;
        });
        audio.addEventListener("error", () => button.classList.add("has-error"));
        audio.insertAdjacentElement("afterend", button);
      });
  }

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
    enhanceVoicePreviews(root);
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
