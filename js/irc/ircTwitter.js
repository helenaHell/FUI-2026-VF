import { createFUIWindow } from "../core/template.js";

const highlights = [
  "highlight1",
  "highlight2",
  "highlight3",
  "highlight4",
  "highlight5",
  "highlight6",
  "highlight7",
  "highlight8",
  "highlight9",
  "highlight10",
];

const userNames = [
  "@journalist_wire",
  "@CryptoWhispers",
  "@DataLeakWatch",
  "@TruthSeeker_101",
  "@InvestigativeEye",
  "@SecureChannel",
  "@WhistleNet",
  "@GlobalNewsDesk",
  "@InfoLiberty",
  "@DigitalRights_Now",
  "@PressFreed0m",
  "@AnonymousSource",
  "@CipherPunk_247",
  "@TransparencyHub",
  "@LeakValidator",
  "@MediaWatchdog",
  "@EncryptedVoice",
  "@ExposureProject",
  "@DocDumper",
  "@RogueReporter",
  "@NetworkInsider",
  "@PixelatedTruth",
  "@ByteRevolution",
  "@HacktivistCore",
  "@ShadowJournalist",
];

const conversations = [
  // Conversation 1: Document Leak
  {
    topic: "document_leak",
    messages: [
      "URGENT: Massive diplomatic cables just surfaced. Reviewing now.",
      "Documents appear genuine. Cross-referencing sources.",
      "Everyone needs to be careful. This could expose operatives.",
      "The public has a right to know. Democracy dies in darkness.",
      "Working on redacting sensitive names before publication.",
      "How long before mainstream media picks this up?",
      "Our legal team is reviewing. Publication decision by morning.",
      "Don't let them silence you. The world is watching.",
      "This changes everything. Governments will have to respond.",
      "Update: Verified 3 sources. Story going live in 30 minutes.",
      "I hope you know what you're doing. Lives are at stake.",
      "Finally, some transparency. This is why we fight.",
      "They tried to bury this. Now the truth comes out.",
      "Supporting secure channels for follow-up sources. DMs open.",
      "The establishment will try to discredit this. Stay strong.",
      "LIVE NOW: Breaking investigation available on secure server.",
      "Remember: protect your sources. Always.",
      "Traffic overwhelming servers. Mirror sites being established.",
      "Download and distribute. Information wants to be free.",
      "Archived everything. They can't erase this now.",
    ],
  },

  // Conversation 2: Encryption & Security
  {
    topic: "encryption",
    messages: [
      "WARNING: New encryption protocol released. Government backdoors impossible.",
      "Tested it. Military-grade. Finally something bulletproof.",
      "This is huge for activists worldwide. Freedom of speech protected.",
      "Intelligence agencies are panicking right now. Good.",
      "Tutorial posted on how to implement. Spread the word.",
      "Downloaded. Testing on secure channels tonight.",
      "Every journalist needs to adopt this immediately.",
      "They've been reading our communications for too long. This ends now.",
      "Share widely. Privacy is a human right.",
      "Setting up secure drop using this protocol. Whistleblowers protected.",
      "Our tech team implementing across all platforms. Source safety first.",
      "Government response expected soon. They won't like this.",
      "This is what we've been waiting for. True security.",
      "Already encrypted my entire archive. Feels good to be untouchable.",
      "Security is only as strong as your weakest link. Stay vigilant.",
      "Update: Over 10,000 downloads in first hour. Revolution is encrypted.",
      "They can't stop the signal. Information flows freely now.",
      "Monitoring government channels. They're scrambling for response.",
      "This is just the beginning. More tools coming soon.",
      "Standing by to test. Together we're unstoppable.",
    ],
  },

  // Conversation 3: Whistleblower Protection
  {
    topic: "whistleblower",
    messages: [
      "URGENT: Whistleblower in State Department needs extraction. Critical.",
      "Secure location arranged. Contact via encrypted channel only.",
      "Legal team on standby. We protect sources. Always.",
      "What's the threat level? Do they have asylum options?",
      "Multiple countries offering protection. Coordinating now.",
      "This person is a hero. We must protect them.",
      "Our lawyers are in contact. Full legal support provided.",
      "Information already secured and backed up. Source protection priority.",
      "How can we help? Community ready to assist.",
      "Authorities are aware. Situation being monitored closely.",
      "Update: Subject safely relocated. Identity remains protected.",
      "Thank God. How bad was the intel they revealed?",
      "Details classified for now. But it's significant. Very significant.",
      "Another brave soul risking everything for truth. Respect.",
      "We never abandon our sources. That's the promise.",
      "This is why people trust you. Keep fighting.",
      "Story embargo lifted tomorrow. World will know their courage.",
      "Safe passage confirmed. Another victory for transparency.",
      "This is what real journalism looks like. Protecting truth-tellers.",
      "Update: Source secure. Investigation continues. More to come.",
    ],
  },

  // Conversation 4: Corporate Surveillance
  {
    topic: "surveillance",
    messages: [
      "WARNING:Major tech company caught selling user data to agencies.",
      "This is exactly what we warned about. Privacy is dead.",
      "Internal documents confirm everything. They've been lying for years.",
      "How extensive is the data collection?",
      "Everything. Messages, locations, contacts, browsing. Everything.",
      "Delete your accounts NOW. This is not a drill.",
      "Alternative platforms exist. Time to migrate to secure services.",
      "Publishing the full document cache in 2 hours. Stand by.",
      "Confirmed with legal sources. Class action lawsuit being prepared.",
      "How many users affected?",
      "Millions. Possibly hundreds of millions worldwide.",
      "This is a massive breach of trust. Boycott imminent.",
      "Encrypted alternatives being shared. Protect yourselves.",
      "They sold us out for profit. Never forget this.",
      "Company stock dropping rapidly. CEO refusing comment.",
      "Congressional hearing demanded. This requires accountability.",
      "Insider who leaked this is protected. More revelations coming.",
      "The surveillance state is real. Wake up people.",
      "Update: Second tech company implicated. This goes deeper.",
      "Full exposure in progress. They can't hide anymore.",
    ],
  },

  // Conversation 5: Government Corruption
  {
    topic: "corruption",
    messages: [
      "Sick people sew dissent in times of crisis.",
      "RT: Schmitt is sick and dangerous.",
      "Anke Domscheit = CIA. Daniel Schmitt = FBI.",
      "Schmitt is sick and dangerous, he has a disease.",
      "Nobody is perfect. That's why I'm perfect.",
      "BRO. IN BERLIN !!! Haven't been home in a long time. Great city.",
      "Go to this site: www.wikileaks.org Everything here very fast.",
      "Too many TWEETS make a TWAT.",
      "Financial records don't lie. Follow the money.",
      "Offshore accounts traced back to cabinet members.",
      "This corruption goes all the way to the top.",
      "Documents show systematic abuse of power for decades.",
      "Media blackout on this story. They're protecting them.",
      "International investigation launched. Multiple countries involved.",
      "Whistleblowers coming forward with more evidence daily.",
      "They thought they were untouchable. They were wrong.",
      "Public outcry growing. Protests planned in major cities.",
      "This is the biggest political scandal in modern history.",
      "Evidence is overwhelming. Convictions are inevitable.",
      "The system is broken. Time to rebuild from scratch.",
    ],
  },
];

let activeTweets = [];
let nextTweetDelay = 0;
let currentConversation = null;
let currentMessageIndex = 0;
let isUserScrolling = false;
let scrollTimeout = null;

function arrayPicker(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function pickHighlight() {
  return highlights[Math.floor(Math.random() * highlights.length)];
}

function pickNewConversation() {
  currentConversation = arrayPicker(conversations);
  currentMessageIndex = 0;
}
function createTweet() {
  const device = Math.random() > 0.5 ? "web" : "mobile";

  if (
    !currentConversation ||
    currentMessageIndex >= currentConversation.messages.length
  ) {
    pickNewConversation();
  }

  const message = currentConversation.messages[currentMessageIndex];
  currentMessageIndex++;

  return {
    username: arrayPicker(userNames),
    tweet: message,
    device,
    minutesAgo: 1,
    createdAt: Date.now(),
    highlight: pickHighlight(),
  };
}

function renderTweet(tweet) {
  return `
    <div class="tweet-container">
      <div class="user-names ${tweet.highlight}">
        ${tweet.username}
      </div>
      <div class="tweet-content">${tweet.tweet}</div>
      <div class="tweet-timestamp">
        >about ${tweet.minutesAgo} min ago via ${tweet.device}
      </div>
      <div class="seperator"></div>
    </div>
  `;
}

function renderAllTweets() {
  let tweetHTML = "";
  for (let i = 0; i < activeTweets.length; i++) {
    tweetHTML += renderTweet(activeTweets[i]);
  }
  return tweetHTML;
}

function render() {
  return `
    <div class="Upper">
      <div class="header-twitter">
        <span class="twitter">Twitter</span>
        <span class="ddd_wiki-fist">@ddd_wiki-fist</span>
      </div>
      <div class="breaking">
        <span>BREAKING:</span>
      </div>
    </div>
    <div class="tweets">
      ${renderAllTweets()}
    </div>
  `;
}

function scrollToTop() {
  const el = document.getElementById("irc-twitter");
  if (!el || isUserScrolling) return;
  el.scrollTop = 0;
}

function updateTwitterDisplay(shouldScroll = true) {
  const el = document.getElementById("irc-twitter");
  if (!el) return;
  el.innerHTML = render();

  if (shouldScroll) {
    scrollToTop();
  }
}

// Detect user scrolling
function setupScrollDetection() {
  const el = document.getElementById("irc-twitter");
  if (!el) return;

  el.addEventListener("scroll", () => {
    isUserScrolling = true;

    // Clear existing timeout
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }

    // If user scrolls back to top, resume auto-scroll
    if (el.scrollTop === 0) {
      isUserScrolling = false;
    } else {
      // Resume auto-scroll after 5 seconds of no scrolling
      scrollTimeout = setTimeout(() => {
        isUserScrolling = false;
        scrollToTop();
      }, 5000);
    }
  });
}

// Update minutes every 60 seconds
setInterval(() => {
  activeTweets.forEach((tweet) => {
    tweet.minutesAgo += 1;
  });
  updateTwitterDisplay(false); // Don't auto-scroll on time updates
}, 60000);

function scheduleNextTweet() {
  if (nextTweetDelay <= 0) {
    const newTweet = createTweet();
    activeTweets.unshift(newTweet);

    if (activeTweets.length > 50) {
      activeTweets = activeTweets.slice(0, 50);
    }
    updateTwitterDisplay(true); // Auto-scroll on new tweets

    if (Math.random() > 0.3) {
      nextTweetDelay = Math.random() * 30 + 10;
    } else {
      nextTweetDelay = Math.random() * 60 + 60;
    }
  }

  nextTweetDelay -= 1;
}

setInterval(scheduleNextTweet, 100);

// Initialize with some tweets
pickNewConversation();
for (let i = 0; i < 10; i++) {
  activeTweets.push(createTweet());
  activeTweets[i].minutesAgo = Math.floor(Math.random() * 40) + 1;
}
updateTwitterDisplay();
setupScrollDetection();

export const twitterWindow = createFUIWindow({
  id: "irc-twitter",
  render,
  setupScrollDetection,
  defaultMode: "list",
});

export function startIRCTwitter() {
  twitterWindow.start();
}

export function stopIRCTwitter() {
  twitterWindow.stop();
}
