# Chrome Extension Integration Guide

This guide explains how to integrate your Chrome extension with the Pinterest Automation API.

## API Endpoints

### 1. Add Pin to Queue

**Endpoint:** `POST /api/chrome-extension/pins`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "extensionId": "your-extension-id",
  "userId": "user-id-from-pinterest-auth",
  "boardId": "pinterest-board-id",
  "title": "Pin Title",
  "description": "Pin Description",
  "imageUrl": "https://example.com/image.jpg",
  "link": "https://example.com",
  "scheduledAt": "2024-01-01T12:00:00Z",
  "signature": "hmac-signature"
}
```

### 2. Check Pin Status

**Endpoint:** `GET /api/chrome-extension/status`

**Query Parameters:**
- `extensionId`: Your extension ID
- `userId`: User ID
- `pinId` (optional): Specific pin ID
- `signature`: HMAC signature

## Security Implementation

### HMAC Signature Generation

To ensure security, all requests must include an HMAC signature:

```javascript
// Generate signature for pin creation
function generatePinSignature(extensionId, userId, boardId, title, imageUrl, secret) {
  const data = `${extensionId}:${userId}:${boardId}:${title}:${imageUrl}`;
  return CryptoJS.HmacSHA256(data, secret).toString();
}

// Generate signature for status check
function generateStatusSignature(extensionId, userId, pinId, secret) {
  const data = `${extensionId}:${userId}${pinId ? ':' + pinId : ''}`;
  return CryptoJS.HmacSHA256(data, secret).toString();
}
```

### Extension ID Whitelist

Add your extension ID to the `ALLOWED_EXTENSION_IDS` environment variable:

```env
ALLOWED_EXTENSION_IDS="abcdefghijklmnopqrstuvwxyz123456"
```

## Chrome Extension Implementation

### 1. Manifest.json

```json
{
  "manifest_version": 3,
  "name": "Pinterest Automation",
  "version": "1.0",
  "permissions": [
    "activeTab",
    "storage",
    "identity"
  ],
  "host_permissions": [
    "https://pinterest.com/*",
    "https://your-domain.com/*"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["https://pinterest.com/*"],
      "js": ["content.js"]
    }
  ],
  "action": {
    "default_popup": "popup.html"
  }
}
```

### 2. Content Script (content.js)

```javascript
// Detect Pinterest pin and extract data
function extractPinData() {
  const title = document.querySelector('h1[data-test-id="pin-title"]')?.textContent || '';
  const description = document.querySelector('[data-test-id="pin-description"]')?.textContent || '';
  const imageUrl = document.querySelector('img[data-test-id="pin-image"]')?.src || '';
  const link = window.location.href;
  
  return {
    title: title.trim(),
    description: description.trim(),
    imageUrl,
    link
  };
}

// Send pin data to background script
function sendPinToQueue(pinData) {
  chrome.runtime.sendMessage({
    action: 'addPin',
    data: pinData
  });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractPin') {
    const pinData = extractPinData();
    sendResponse(pinData);
  }
});
```

### 3. Background Script (background.js)

```javascript
const API_BASE_URL = 'https://your-domain.com/api/chrome-extension';
const EXTENSION_ID = 'your-extension-id';
const SECRET = 'your-chrome-extension-secret';

// Generate HMAC signature
function generateSignature(data, secret) {
  return CryptoJS.HmacSHA256(data, secret).toString();
}

// Add pin to queue
async function addPinToQueue(pinData, userId, boardId) {
  const signature = generateSignature(
    `${EXTENSION_ID}:${userId}:${boardId}:${pinData.title}:${pinData.imageUrl}`,
    SECRET
  );

  try {
    const response = await fetch(`${API_BASE_URL}/pins`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        extensionId: EXTENSION_ID,
        userId,
        boardId,
        title: pinData.title,
        description: pinData.description,
        imageUrl: pinData.imageUrl,
        link: pinData.link,
        scheduledAt: new Date().toISOString(),
        signature
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('Pin added to queue:', result);
      return result;
    } else {
      throw new Error(result.message || 'Failed to add pin');
    }
  } catch (error) {
    console.error('Error adding pin:', error);
    throw error;
  }
}

// Check pin status
async function checkPinStatus(userId, pinId = null) {
  const signature = generateSignature(
    `${EXTENSION_ID}:${userId}${pinId ? ':' + pinId : ''}`,
    SECRET
  );

  try {
    const url = new URL(`${API_BASE_URL}/status`);
    url.searchParams.append('extensionId', EXTENSION_ID);
    url.searchParams.append('userId', userId);
    if (pinId) url.searchParams.append('pinId', pinId);
    url.searchParams.append('signature', signature);

    const response = await fetch(url);
    const result = await response.json();
    
    if (response.ok) {
      return result;
    } else {
      throw new Error(result.message || 'Failed to check status');
    }
  } catch (error) {
    console.error('Error checking status:', error);
    throw error;
  }
}

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'addPin') {
    // Get user ID and board ID from storage or popup
    chrome.storage.local.get(['userId', 'selectedBoardId'], async (data) => {
      if (!data.userId || !data.selectedBoardId) {
        sendResponse({ error: 'User not authenticated or no board selected' });
        return;
      }

      try {
        const result = await addPinToQueue(request.data, data.userId, data.selectedBoardId);
        sendResponse({ success: true, result });
      } catch (error) {
        sendResponse({ error: error.message });
      }
    });
    return true; // Keep message channel open for async response
  }
});
```

### 4. Popup (popup.html)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { width: 300px; padding: 20px; }
    .form-group { margin-bottom: 15px; }
    label { display: block; margin-bottom: 5px; }
    input, select, textarea { width: 100%; padding: 8px; }
    button { background: #e60023; color: white; border: none; padding: 10px; cursor: pointer; }
  </style>
</head>
<body>
  <h3>Pinterest Automation</h3>
  
  <div class="form-group">
    <label>User ID:</label>
    <input type="text" id="userId" placeholder="Enter your user ID">
  </div>
  
  <div class="form-group">
    <label>Board:</label>
    <select id="boardSelect">
      <option value="">Select a board</option>
    </select>
  </div>
  
  <div class="form-group">
    <label>Schedule Time:</label>
    <input type="datetime-local" id="scheduleTime">
  </div>
  
  <button id="addPinBtn">Add Current Pin to Queue</button>
  
  <div id="status"></div>

  <script src="popup.js"></script>
</body>
</html>
```

### 5. Popup Script (popup.js)

```javascript
document.addEventListener('DOMContentLoaded', async () => {
  const userIdInput = document.getElementById('userId');
  const boardSelect = document.getElementById('boardSelect');
  const scheduleTimeInput = document.getElementById('scheduleTime');
  const addPinBtn = document.getElementById('addPinBtn');
  const statusDiv = document.getElementById('status');

  // Load saved data
  chrome.storage.local.get(['userId', 'selectedBoardId'], (data) => {
    if (data.userId) {
      userIdInput.value = data.userId;
    }
    if (data.selectedBoardId) {
      boardSelect.value = data.selectedBoardId;
    }
  });

  // Set default schedule time to 1 hour from now
  const now = new Date();
  now.setHours(now.getHours() + 1);
  scheduleTimeInput.value = now.toISOString().slice(0, 16);

  // Save user ID when changed
  userIdInput.addEventListener('change', () => {
    chrome.storage.local.set({ userId: userIdInput.value });
  });

  // Save selected board when changed
  boardSelect.addEventListener('change', () => {
    chrome.storage.local.set({ selectedBoardId: boardSelect.value });
  });

  // Add pin to queue
  addPinBtn.addEventListener('click', async () => {
    if (!userIdInput.value) {
      statusDiv.textContent = 'Please enter User ID';
      return;
    }

    if (!boardSelect.value) {
      statusDiv.textContent = 'Please select a board';
      return;
    }

    try {
      // Get pin data from current page
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractPin' });
      
      if (response && response.title) {
        // Add pin to queue
        const result = await chrome.runtime.sendMessage({
          action: 'addPin',
          data: {
            ...response,
            scheduledAt: scheduleTimeInput.value ? new Date(scheduleTimeInput.value).toISOString() : undefined
          }
        });

        if (result.success) {
          statusDiv.textContent = 'Pin added to queue successfully!';
          statusDiv.style.color = 'green';
        } else {
          statusDiv.textContent = `Error: ${result.error}`;
          statusDiv.style.color = 'red';
        }
      } else {
        statusDiv.textContent = 'No pin data found on this page';
        statusDiv.style.color = 'red';
      }
    } catch (error) {
      statusDiv.textContent = `Error: ${error.message}`;
      statusDiv.style.color = 'red';
    }
  });
});
```

## Getting User ID

To get the user ID for the Chrome extension, users need to:

1. Visit your Pinterest Automation dashboard
2. Go to their profile/settings
3. Copy their User ID
4. Enter it in the Chrome extension popup

## Testing

1. Install the Chrome extension in developer mode
2. Visit a Pinterest pin page
3. Click the extension icon
4. Enter your User ID and select a board
5. Click "Add Current Pin to Queue"
6. Check the dashboard to see the scheduled pin

## Security Notes

- Always use HTTPS for API calls
- Validate all input data
- Use HMAC signatures for request authentication
- Whitelist only trusted extension IDs
- Store sensitive data securely in Chrome storage
