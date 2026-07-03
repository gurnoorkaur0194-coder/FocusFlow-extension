const distractingSites = [
  "youtube.com",
  "instagram.com",
  "reddit.com",
  "facebook.com",
  "twitter.com",
  "x.com",
  "netflix.com"
];

const GEMINI_API_KEY = "ENTER YOUR OWN GEMINI API KEY HERE";

async function analyzeYoutube(goal, title) {

  const prompt = `
Study Goal: ${goal}

YouTube Video: ${title}

Reply ONLY with:
true
or
false
`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    }
  );

  const data = await response.json();

  const answer =
    data.candidates?.[0]?.content?.parts?.[0]?.text
      ?.trim()
      ?.toLowerCase();

  return answer === "true";
}


function showReminder(goal) {

  chrome.notifications.create({

    type: "basic",

    iconUrl: "icon.png",

    title: "🎯 FocusFlow",

    message: `You planned to study "${goal}". Still on track?`

  });

}


// This function saves one website visit
async function saveVisit(tab) {

  if (!tab.url) return;
   // Ignore Chrome pages and New Tab
   // Ignore Chrome pages and New Tab
  if (
    tab.url.startsWith("chrome://") ||
    tab.url.startsWith("edge://") ||
    tab.url.startsWith("about:") ||
    tab.url === "chrome://newtab/"
  ) {
    return;
  }

  chrome.storage.local.get(["focusSession", "visits"], async (data) => {

    if (!data.focusSession) return;

    let distracting = distractingSites.some(site =>
  tab.url.includes(site)
);

// If it's YouTube, let AI decide
if (tab.url.includes("youtube.com")) {

  distracting = !(await analyzeYoutube(
    data.focusSession,
    tab.title || ""
  ));

}

    const visit = {
    website: new URL(tab.url).hostname,
    url: tab.url,
    title: tab.title || "Untitled Page",
    goal: data.focusSession,
    distracting: distracting,
    timestamp: Date.now()

};

    const visits = data.visits || [];
    const lastVisit = visits[visits.length - 1];

if (
    lastVisit &&
    lastVisit.url === tab.url &&
    Date.now() - lastVisit.timestamp < 5000
) {
    return;
}

    visits.push(visit);

    chrome.storage.local.set({
      visits: visits
    });

    console.log("Visit Saved:", visit);

    if (distracting) {
    showReminder(data.focusSession);
    }

  });

}

// Fires when user switches tabs
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  saveVisit(tab);
});

// Fires when a page finishes loading
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {

    if (changeInfo.status === "complete") {
        saveVisit(tab);
    }
});