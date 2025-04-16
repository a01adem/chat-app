const socket = io();
let username = "";
let currentEditingId = null;
let lastMessageDate = null;
let activeUsers = [];
let mentionDropdownActive = false;
let messageHistory = [];
let historyIndex = -1;

const EMOJIS = [
    // Smileys & Emotions
    "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "🥲", "😊",
    "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙",
    "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣",
    "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬",
    "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗",
    "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯",
    "😦", "😧", "😮", "😲", "🥱", "😴", "😪", "😵", "🤤", "🤢",
    "🤮", "🤧", "😷", "🤒", "🤕", "🤑",
  
    // People & Gestures
    "👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉",
    "👆", "👇", "☝️", "✋", "🤚", "🖐️", "🖖", "👋", "👏", "🙌",
    "👐", "🤲", "🙏", "✍️", "💅", "🤳", "💪", "🦾", "🦵", "🦶",
  
    // Hearts & Symbols
    "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
    "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "☮️",
    "✝️", "☪️", "🕉️", "☸️", "✡️", "🔯", "🕎", "☯️", "☦️", "🛐",
  
    // Animals
    "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯",
    "🦁", "🐮", "🐷", "🐸", "🐵", "🙈", "🙉", "🙊", "🐔", "🐧",
    "🐦", "🐤", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄",
  
    // Food & Drink
    "🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐",
    "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑",
    "🥦", "🥬", "🥒", "🌶️", "🌽", "🥕", "🧄", "🧅", "🥔", "🍠",
    "🍞", "🥐", "🥖", "🫓", "🥨", "🥯", "🧇", "🥞", "🧈", "🍳",
  
    // Objects & Activities
    "🎮", "🎲", "🧩", "🎯", "🏆", "🥇", "🥈", "🥉", "⚽", "🏀",
    "🏈", "⚾", "🎾", "🏐", "🎱", "🏓", "🏸", "🥅", "🎣", "🚗",
    "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐", "🚚",
    "🚛", "🚜", "🛴", "🚲", "🛵", "🏍️", "🛺", "🚤", "🛳️", "✈️",
  
    // Nature & Weather
    "🌸", "🌼", "🌻", "🌹", "🌷", "🌱", "🌿", "🍀", "🍁", "🍂",
    "🍃", "🌍", "🌎", "🌏", "🌕", "🌖", "🌗", "🌘", "🌑", "🌒",
    "🌓", "🌔", "🌙", "🌤️", "⛅", "🌥️", "☁️", "🌦️", "🌧️", "⛈️",
    "🌩️", "⚡", "🔥", "💧", "🌊", "❄️", "☃️", "⛄", "🌫️", "🌪️",
  
    // Additional Emojis
    "🛸", "🚀", "🛰️", "🛶", "⛵", "🚤", "🛥️", "🛳️", "⛴️", "🚢",
    "✈️", "🛩️", "🛫", "🛬", "🪂", "💺", "🚁", "🚟", "🚠", "🚡",
    "🚂", "🚆", "🚇", "🚊", "🚉", "🚝", "🚄", "🚅", "🚈", "🚞",
    "🚋", "🚌", "🚍", "🚎", "🚐", "🚑", "🚒", "🚓", "🚔", "🚨",
    "🚍", "🚘", "🚖", "🚡", "🚠", "🚟", "🚃", "🚋", "🚞", "🚝"

    
]

// Message status constants
const STATUS = {
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read'
};

// Initialize the emoji picker
function initEmojiPicker() {
  const emojiPicker = document.getElementById("emojiPicker");
  EMOJIS.forEach(emoji => {
    const emojiElement = document.createElement("div");
    emojiElement.className = "emoji-item";
    emojiElement.textContent = emoji;
    emojiElement.addEventListener("click", () => {
      const input = document.getElementById("input");
      input.value += emoji;
      input.focus();
    });
    emojiPicker.appendChild(emojiElement);
  });
}

// Initialize mention dropdown (new function)
function initMentionDropdown() {
  // Create mention dropdown if it doesn't exist
  if (!document.getElementById("mentionDropdown")) {
    const mentionDropdown = document.createElement("div");
    mentionDropdown.id = "mentionDropdown";
    mentionDropdown.className = "mention-dropdown";
    document.querySelector('.chat-container').appendChild(mentionDropdown);
  }
}

function enterChat() {
  const input = document.getElementById("usernameInput");
  if (input.value.trim() !== "") {
    username = input.value.trim();
    document.getElementById("login").style.display = "none";
    document.getElementById("chat").style.display = "flex";
    
    // Focus on input after joining
    document.getElementById("input").focus();
    
    // Notify others that user has joined
    socket.emit("user joined", username);
    
    // Initialize emoji picker
    initEmojiPicker();
    
    // Initialize mention dropdown
    initMentionDropdown();
    
    // Add yourself to active users
    if (!activeUsers.includes(username)) {
      activeUsers.push(username);
    }
    
    // Mark all messages as read when user joins
    socket.emit("mark messages read", { user: username });
  }
}

// Allow pressing Enter on username input
document.getElementById("usernameInput").addEventListener("keypress", function(e) {
  if (e.key === "Enter") {
    enterChat();
  }
});

// Toggle emoji picker
document.getElementById("emojiBtn").addEventListener("click", function() {
  const emojiPicker = document.getElementById("emojiPicker");
  emojiPicker.classList.toggle("active");
});

// Close emoji picker when clicking outside
document.addEventListener("click", function(e) {
  if (!e.target.closest("#emojiPicker") && !e.target.closest("#emojiBtn")) {
    document.getElementById("emojiPicker").classList.remove("active");
  }
  
  // Also close mention dropdown if clicking outside
  if (!e.target.closest("#mentionDropdown") && !e.target.closest("#input")) {
    hideMentionDropdown();
  }
});

const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const editingIndicator = document.getElementById("editingIndicator");
const sendBtn = document.getElementById("sendBtn");

// Cancel editing
cancelEditBtn.addEventListener("click", function() {
  exitEditMode();
});

function exitEditMode() {
  currentEditingId = null;
  input.value = "";
  cancelEditBtn.style.display = "none";
  editingIndicator.style.display = "none";
  sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
}

socket.on("message history", function(messages) {
    // Clear existing messages
    document.getElementById("messages").innerHTML = "";
    lastMessageDate = null;
  
    // Add each message from the history
    messages.forEach(msg => {
      addMessage({
        id: msg.id,
        user: msg.user,
        text: msg.text,
        timestamp: msg.timestamp,
        isSelf: msg.user === username,
        status: msg.status,
        mentions: msg.mentions || [] // Include mentions data
      });
    });
  
    // Add a system message indicating the start of new messages
    addSystemMessage("New messages");
  });

form.addEventListener("submit", function (e) {
  e.preventDefault();
  if (input.value) {
    const messageText = input.value;

      // Add the message to history
      messageHistory.push(messageText);
      historyIndex = messageHistory.length; // Reset history index
  
    // Process mentions in the message
    const mentions = findMentionsInMessage(messageText);
    
    if (currentEditingId) {
      // Editing an existing message
      socket.emit("edit message", { 
        id: currentEditingId, 
        user: username, 
        text: messageText,
        mentions: mentions
      });
      
      // Update local message
      const messageElement = document.getElementById(`msg-${currentEditingId}`);
      if (messageElement) {
        const contentElement = messageElement.querySelector(".message-content");
        // Process the mentioned users in the message content
        contentElement.innerHTML = processMessageText(messageText);
        messageElement.classList.add("edited");
      }
      
      exitEditMode();
    } else {
      // Sending a new message
      const messageId = Date.now().toString();
      socket.emit("chat message", { 
        id: messageId,
        user: username, 
        text: messageText,
        timestamp: new Date().toISOString(),
        status: STATUS.SENT,
        mentions: mentions
      });
      
      // Add message to DOM immediately for better UX
      addMessage({
        id: messageId,
        user: username, 
        text: messageText,
        timestamp: new Date().toISOString(),
        isSelf: true,
        status: STATUS.SENT,
        mentions: mentions
      });
    }
    
    input.value = "";
    input.focus();
  }
  
  // Hide mention dropdown when sending message
  hideMentionDropdown();
});

input.addEventListener("keydown", function(e) {
    if (e.key === "ArrowUp") {
      if (historyIndex > 0) {
        historyIndex--;
        input.value = messageHistory[historyIndex];
      }
    } else if (e.key === "ArrowDown") {
      if (historyIndex < messageHistory.length - 1) {
        historyIndex++;
        input.value = messageHistory[historyIndex];
      } else {
        historyIndex = messageHistory.length;
        input.value = "";
      }
    }
  });
  

socket.on("chat message", function (data) {
  // Only add the message if it's from someone else
  if (data.user !== username) {
    addMessage({
      id: data.id,
      user: data.user, 
      text: data.text,
      timestamp: data.timestamp,
      isSelf: false,
      status: data.status,
      mentions: data.mentions || []
    });
    
    // Mark message as read and notify sender
    socket.emit("message received", {
      id: data.id,
      user: username,
      to: data.user
    });
  }
});

socket.on("edit message", function (data) {
  if (data.user !== username) {
    const messageElement = document.getElementById(`msg-${data.id}`);
    if (messageElement) {
      const contentElement = messageElement.querySelector(".message-content");
      // Process the mentioned users in the message content
      contentElement.innerHTML = processMessageText(data.text);
      messageElement.classList.add("edited");
      
      // Handle mention highlights
      if (data.mentions && data.mentions.includes(username)) {
        messageElement.classList.add("mention-highlight");
      } else {
        messageElement.classList.remove("mention-highlight");
      }
    }
  }
});

socket.on("delete message", function (data) {
  const messageElement = document.getElementById(`msg-${data.id}`);
  if (messageElement) {
    messageElement.classList.add("deleting");
    setTimeout(() => {
      messageElement.remove();
      // Add system message about deletion
      addSystemMessage(`${data.user} deleted a message`);
    }, 300);
  }
});

socket.on("message status update", function (data) {
  // Update the status of a message
  if (data.to === username) {
    const messageElement = document.getElementById(`msg-${data.id}`);
    if (messageElement) {
      updateMessageStatus(messageElement, data.status);
    }
  }
});

function updateMessageStatus(messageElement, status) {
  const statusElement = messageElement.querySelector(".message-status");
  
  if (statusElement) {
    // Remove existing status icons
    statusElement.innerHTML = '';
    
    // Add appropriate status icon
    if (status === STATUS.SENT) {
      statusElement.innerHTML = '<i class="fas fa-check"></i>';
    } else if (status === STATUS.DELIVERED) {
      statusElement.innerHTML = '<i class="fas fa-check"></i>';
    } else if (status === STATUS.READ) {
      statusElement.innerHTML = '<i class="fas fa-check text-blue"></i><i class="fas fa-check text-blue" style="margin-left: -3px;"></i>';
    }
  }
}

// Update the user joined event to track active users
socket.on("user joined", function(user) {
    if (user !== username) {
      addSystemMessage(`${user} joined the chat`);
      
      // Add user to active users list
      if (!activeUsers.includes(user)) {
        activeUsers.push(user);
      }
      
      // When a new user joins, mark messages as delivered
      document.querySelectorAll('.message.self-message').forEach(msg => {
        updateMessageStatus(msg, STATUS.DELIVERED);
      });
    }
  });
  
// Update the user left event to remove from active users
socket.on("user left", function(user) {
  if (user !== username) {
    addSystemMessage(`${user} left the chat`);
    
    // Remove user from active users
    const index = activeUsers.indexOf(user);
    if (index !== -1) {
      activeUsers.splice(index, 1);
    }
  }
});

// Receive active users list from server
socket.on("active users", function(users) {
  activeUsers = users;
});
  
function addSystemMessage(text) {
  const item = document.createElement("li");
  item.className = "message-date-divider";
  item.textContent = text;
  messages.appendChild(item);
  scrollToBottom();
}



function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString();
  }
}

function shouldDisplayDate(timestamp) {
  if (!lastMessageDate) return true;
  
  const currentDate = new Date(timestamp).toDateString();
  return currentDate !== lastMessageDate;
}

// Process the message text to highlight mentions
function processMessageText(text) {
  // Replace @username with a styled span
  return text.replace(/@(\w+)/g, (match, username) => {
    const isMentioned = activeUsers.includes(username);
    if (isMentioned) {
      return `<span class="mention-tag">${match}</span>`;
    }
    return match;
  });
}

// Find mentions in message
function findMentionsInMessage(text) {
  const mentions = [];
  const mentionRegex = /@(\w+)/g;
  let match;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    const mentionedUser = match[1];
    if (activeUsers.includes(mentionedUser) && !mentions.includes(mentionedUser)) {
      mentions.push(mentionedUser);
    }
  }
  
  return mentions;
}

function addMessage(data) {
  const { id, user, text, timestamp, isSelf, status, mentions } = data;
  
  // Check if we need to add a date divider
  if (shouldDisplayDate(timestamp)) {
    const dateString = formatDate(timestamp);
    addSystemMessage(dateString);
    lastMessageDate = new Date(timestamp).toDateString();
  }
  
  const item = document.createElement("li");
  item.className = `message ${isSelf ? 'self-message' : 'other-message'}`;
  
  // Add mention highlight class if current user is mentioned
  if (mentions && mentions.includes(username)) {
    item.classList.add('mention-highlight');
  }
  
  item.id = `msg-${id}`;
  
  // Create message content
  const contentElement = document.createElement("div");
  contentElement.className = "message-content";
  
  // Process the message text to highlight mentions
  contentElement.innerHTML = processMessageText(text);
  
  // Create message footer
  const footerElement = document.createElement("div");
  footerElement.className = "message-footer";
  
  const timeElement = document.createElement("span");
  timeElement.className = "message-time";
  timeElement.textContent = formatTime(timestamp);
  
  const statusElement = document.createElement("span");
  statusElement.className = "message-status";
  
  if (isSelf) {
    if (status === STATUS.SENT) {
      statusElement.innerHTML = '<i class="fas fa-check"></i>';
    } else if (status === STATUS.DELIVERED) {
      statusElement.innerHTML = '<i class="fas fa-check"></i><i class="fas fa-check" style="margin-left: -3px;"></i>';
    } else if (status === STATUS.READ) {
      statusElement.innerHTML = '<i class="fas fa-check text-blue"></i><i class="fas fa-check text-blue" style="margin-left: -3px;"></i>';
    }
  } else {
    statusElement.textContent = user;
  }
  
  footerElement.appendChild(timeElement);
  footerElement.appendChild(statusElement);
  
  // Add context menu for self messages
  if (isSelf) {
    const menuElement = document.createElement("div");
    menuElement.className = "message-menu";
    
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", function() {
      startEditing(id, text);
      hideMenus();
    });
    
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete";
    deleteBtn.addEventListener("click", function() {
      deleteMessage(id);
      hideMenus();
    });
    
    menuElement.appendChild(editBtn);
    menuElement.appendChild(deleteBtn);
    item.appendChild(menuElement);
    
    item.addEventListener("click", function(e) {
      if (!e.target.closest(".message-menu")) {
        hideMenus();
        this.classList.toggle("active");
      }
    });
  }
  
  // Assemble the message element
  item.appendChild(contentElement);
  item.appendChild(footerElement);
  
  messages.appendChild(item);
  scrollToBottom();
}

function startEditing(id, text) {
  currentEditingId = id;
  input.value = text;
  input.focus();
  cancelEditBtn.style.display = "inline-block";
  editingIndicator.style.display = "block";
  sendBtn.innerHTML = '<i class="fas fa-check"></i>';
}

function deleteMessage(id) {
  const messageElement = document.getElementById(`msg-${id}`);
  if (messageElement) {
    messageElement.classList.add("deleting");
    socket.emit("delete message", { id, user: username });
    
    setTimeout(() => {
      messageElement.remove();
      addSystemMessage(`You deleted a message`);
    }, 300);
  }
}

function hideMenus() {
  document.querySelectorAll('.message.active').forEach(msg => {
    msg.classList.remove('active');
  });
}

// Handle click outside message to close menus
document.addEventListener("click", function(e) {
  if (!e.target.closest('.message')) {
    hideMenus();
  }
});

function scrollToBottom() {
  messages.scrollTop = messages.scrollHeight;
}

// Handle focus events for marking messages as read
window.addEventListener('focus', function() {
  // Mark all messages as read when window gets focus
  socket.emit("mark messages read", { user: username });
});

// Handle resize events for responsive design
window.addEventListener('resize', function() {
  scrollToBottom();
});

// Show mention dropdown
function showMentionDropdown(inputText) {
    const mentionDropdown = document.getElementById("mentionDropdown");
    
    // Get the text after @ to filter users
    const lastAtSymbol = inputText.lastIndexOf('@');
    const filterText = lastAtSymbol !== -1 ? inputText.substring(lastAtSymbol + 1).toLowerCase() : '';
    
    // Filter users that match the input and aren't the current user
    const filteredUsers = activeUsers.filter(user => 
      user !== username && user.toLowerCase().includes(filterText)
    );
    
    if (lastAtSymbol !== -1 && filteredUsers.length > 0) {
      // Clear previous dropdown items
      mentionDropdown.innerHTML = '';
      
      // Add users to dropdown
      filteredUsers.forEach(user => {
        const userElement = document.createElement("div");
        userElement.className = "mention-item";
        userElement.textContent = user;
        userElement.addEventListener("click", () => {
          // Replace the partial @username with the complete @username
          const beforeMention = inputText.substring(0, lastAtSymbol);
          const afterMention = inputText.substring(lastAtSymbol + filterText.length + 1);
          input.value = `${beforeMention}@${user} ${afterMention}`;
          input.focus();
          
          // Hide dropdown after selection
          hideMentionDropdown();
        });
        mentionDropdown.appendChild(userElement);
      });
      
      // Show dropdown
      mentionDropdown.style.display = "block";
    } else {
      hideMentionDropdown();
    }
  }
  
  function hideMentionDropdown() {
    const mentionDropdown = document.getElementById("mentionDropdown");
    mentionDropdown.style.display = "none";
  }

function positionMentionDropdown() {
  const mentionDropdown = document.getElementById("mentionDropdown");
  const formRect = document.getElementById("form").getBoundingClientRect();
  
  mentionDropdown.style.bottom = `${window.innerHeight - formRect.top + 5}px`;
  mentionDropdown.style.left = `${formRect.left + 10}px`;
}

// Monitor input for @ symbol
input.addEventListener("input", function() {
    if (this.value.includes('@')) {
      showMentionDropdown(this.value);
    } else {
      hideMentionDropdown();
    }
  });

// Ensure dropdown is hidden when pressing Esc
input.addEventListener("keydown", function(e) {
  if (e.key === "Escape") {
    hideMentionDropdown();
  }
});

// Back button functionality
document.querySelector('.back-button').addEventListener('click', function() {
  // For demo purposes, let's just show a confirmation
  if (confirm('Are you sure you want to leave the chat?')) {
    // Store the username temporarily
    const leavingUsername = username;

    // Notify the server that the user is leaving
    socket.emit('user left', leavingUsername);
    
    // Hide chat and show login
    document.getElementById('chat').style.display = 'none';
    document.getElementById('login').style.display = 'flex';
    
    // Clear the username
    username = "";
    
    // Clear the messages
    document.getElementById("messages").innerHTML = "";
    
    // Reset the last message date
    lastMessageDate = null;
    
    // Clear active users
    activeUsers = [];
  }
});