const avatar = document.querySelector(".avatar-image");
const progressBar = document.querySelector("#scroll-progress-bar");
const pageSections = [...document.querySelectorAll("main [data-section-number]")];
const sectionLinks = [...document.querySelectorAll('.main-nav a[href^="#"]')];

function updateScrollProgress() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const percent = maxScroll > 0 ? Math.min((window.scrollY / maxScroll) * 100, 100) : 0;
  if (progressBar) progressBar.style.width = `${percent}%`;

  const marker = window.scrollY + window.innerHeight * 0.4;
  let active = null;
  pageSections.forEach((section) => {
    if (section.offsetTop <= marker) active = section;
  });
  sectionLinks.forEach((link) => {
    if (active && link.getAttribute("href") === `#${active.id}`) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}

let scrollPending = false;
window.addEventListener("scroll", () => {
  if (scrollPending) return;
  scrollPending = true;
  window.requestAnimationFrame(() => {
    updateScrollProgress();
    scrollPending = false;
  });
}, { passive: true });
window.addEventListener("resize", updateScrollProgress);
updateScrollProgress();

const revealTargets = [...document.querySelectorAll(".section-kicker, .intro-content, .experience-card, .education-card, .learning-list, .community-card, .contact-copy")];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduceMotion && "IntersectionObserver" in window) {
  document.documentElement.classList.add("motion-ready");
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  revealTargets.forEach((element, index) => {
    element.dataset.reveal = "";
    element.style.setProperty("--reveal-delay", `${(index % 3) * 70}ms`);
    revealObserver.observe(element);
  });
}

if (avatar) {
  avatar.addEventListener("error", () => {
    if (!avatar.dataset.fallbackAttempted && avatar.dataset.fallback) {
      avatar.dataset.fallbackAttempted = "true";
      avatar.src = avatar.dataset.fallback;
      return;
    }
    avatar.hidden = true;
    const fallback = document.querySelector(".avatar-fallback");
    if (fallback) fallback.style.display = "grid";
  });
}

const chatPanel = document.querySelector(".chat-panel");
const chatLauncher = document.querySelector(".chat-launcher");
const chatClose = document.querySelector(".chat-close");
const chatForm = document.querySelector(".chat-form");
const chatInput = document.querySelector("#chat-input");
const chatMessages = document.querySelector(".chat-messages");

function setChatOpen(open) {
  if (!chatPanel || !chatLauncher) return;
  chatPanel.hidden = !open;
  chatLauncher.setAttribute("aria-expanded", String(open));
  if (open) chatInput?.focus();
  else chatLauncher.focus();
}

chatLauncher?.addEventListener("click", () => setChatOpen(chatPanel.hidden));
chatClose?.addEventListener("click", () => setChatOpen(false));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && chatPanel && !chatPanel.hidden) setChatOpen(false);
});

function appendMessage(kind, label, message) {
  const bubble = document.createElement("div");
  bubble.className = `chat-message ${kind}-message`;
  const tag = document.createElement("span");
  tag.className = "message-label";
  tag.textContent = label;
  const text = document.createElement("p");
  text.textContent = message;
  bubble.append(tag, text);
  chatMessages.append(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function mockResponse(question) {
  const q = question.toLowerCase();
  if (/(teach|ta|course|bmgt|n8n|agentic|excel)/.test(q)) {
    return "Vandana is a BMGT301 Teaching Assistant at the University of Maryland, covering Information Systems, Digital Transformations, and Agentic AI. She reviews 30+ student-built n8n automations and 45 Excel assignments each semester, and writes two exams per semester for a 45-student Agentic AI class.";
  }
  if (/(consult|khanjur|dod|defen[cs]e|onboard|strategy)/.test(q)) {
    return "At Khanjur R&D LLC (March–August 2026), Vandana coordinated active DoD program operations with C-suite leadership, developed internal processes, mentored junior interns, and researched workflow tools. Her resume reports a 15% increase in onboarding.";
  }
  if (/(servicenow|itsm|cmdb|training)/.test(q)) {
    return "Vandana has been completing TCS ServiceNow System Administration Training in an Australian instance since May 2026. The training covers ITSM, CMDB, incident management, request fulfillment, workflows, forms, lists, and filters.";
  }
  if (/(data|analys|cursive|finance|excel|tableau)/.test(q)) {
    return "Vandana has experience in data analysis and finance, including 10+ consulting deliverables with a six-analyst team at Cursive Technology, and budgeting and cash-flow tracking for the Student-Led Coffee Initiative.";
  }
  if (/(it support|school|bcps|troubleshoot|ticket|technical)/.test(q)) {
    return "As an IT and Systems Intern with Baltimore County Public Schools, Vandana resolved 100+ hardware, software, and network issues weekly, documented 150+ support tickets, and helped build a knowledge base that reduced repeat troubleshooting by 15%.";
  }
  if (/(education|degree|umd|quest|gpa|school)/.test(q)) {
    return "Vandana studies Information Systems and Finance at the University of Maryland’s Robert H. Smith School of Business, with an expected graduation date of May 2028. Her resume lists a 3.9 GPA and participation in the QUEST Honors Program.";
  }
  return "I can share resume-based details about Vandana’s BMGT301 teaching, AI consulting, analytics and finance experience, IT support, or ServiceNow training. Try asking about one of those topics.";
}

function submitQuestion(question) {
  const cleanQuestion = question.trim();
  if (!cleanQuestion || !chatMessages) return;
  appendMessage("user", "YOU", cleanQuestion);
  appendMessage("assistant", "ASSISTANT", mockResponse(cleanQuestion));
  if (chatInput) chatInput.value = "";
  chatInput?.focus();
}

chatForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  submitQuestion(chatInput?.value ?? "");
});

document.querySelectorAll(".chat-suggestions [data-question]").forEach((button) => {
  button.addEventListener("click", () => submitQuestion(button.dataset.question ?? ""));
});
