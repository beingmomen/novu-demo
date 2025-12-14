# Novu Demo Frontend

Vue.js 2 frontend for Vacation Request System with Novu In-App Inbox.

## Tech Stack

- **Framework:** Vue.js 2.7 (Options API)
- **Router:** Vue Router 3
- **HTTP Client:** Axios
- **Notifications:** @novu/js v3.11.0

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── NovuInbox.vue      # Novu Inbox component
│   │   ├── UserSelector.vue   # User dropdown selector
│   │   └── ...
│   ├── views/
│   │   ├── Home.vue
│   │   ├── Users.vue
│   │   ├── VacationRequests.vue
│   │   └── Preferences.vue
│   ├── services/
│   │   └── api.js             # Axios API client
│   ├── router/
│   │   └── index.js           # Vue Router config
│   ├── App.vue                # Root component
│   └── main.js                # Vue entry point
├── .env.example               # Environment variables template
└── package.json
```

## Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```env
VUE_APP_API_URL=http://localhost:3000/api
VUE_APP_NOVU_APP_ID=your_novu_application_identifier
```

### 3. Get Novu Application ID

1. Go to [Novu Dashboard](https://dashboard.novu.co)
2. Navigate to **Settings** → **API Keys**
3. Copy the **Application Identifier**

### 4. Run Development Server

```bash
npm run serve
```

App runs at `http://localhost:8080`

## Build for Production

```bash
npm run build
```

---

# Novu Inbox Component

Complete guide for integrating Novu In-App Inbox with Vue.js 2.

## Overview

The `NovuInbox` component provides a full-featured notification inbox including:
- Bell icon with unread badge
- Dropdown notification list
- Mark as read functionality
- Real-time updates via WebSocket

## Installation

```bash
npm install @novu/js
```

## Component Code

### NovuInbox.vue

```vue
<template>
  <div ref="novuInbox"></div>
</template>

<script>
import { NovuUI } from "@novu/js/ui";

export default {
  name: "NovuInbox",
  props: {
    applicationIdentifier: {
      type: String,
      required: true,
    },
    subscriberId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      novuInstance: null,
    };
  },
  mounted() {
    this.initNovu();
  },
  beforeDestroy() {
    this.destroyNovu();
  },
  watch: {
    subscriberId(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.destroyNovu();
        this.$nextTick(() => {
          this.initNovu();
        });
      }
    },
  },
  methods: {
    initNovu() {
      if (!this.$refs.novuInbox) {
        console.error("Novu inbox container element not found");
        return;
      }

      try {
        this.novuInstance = new NovuUI({
          options: {
            applicationIdentifier: this.applicationIdentifier,
            subscriberId: this.subscriberId,
          },
        });

        this.novuInstance.mountComponent({
          name: "Inbox",
          props: {},
          element: this.$refs.novuInbox,
        });
      } catch (error) {
        console.error("Failed to initialize Novu inbox:", error);
      }
    },
    destroyNovu() {
      if (this.novuInstance && this.$refs.novuInbox) {
        try {
          this.novuInstance.unmountComponent(this.$refs.novuInbox);
        } catch (error) {
          // Ignore unmount errors
        }
        this.novuInstance = null;
      }
    },
  },
};
</script>
```

## Usage

### Basic Usage

```vue
<template>
  <div>
    <NovuInbox
      :applicationIdentifier="novuAppId"
      :subscriberId="currentUser.subscriberId"
    />
  </div>
</template>

<script>
import NovuInbox from './components/NovuInbox.vue';

export default {
  components: { NovuInbox },
  data() {
    return {
      novuAppId: process.env.VUE_APP_NOVU_APP_ID,
      currentUser: {
        subscriberId: 'user-123'
      }
    };
  }
};
</script>
```

### Dynamic Subscriber (User Switching)

The component automatically re-initializes when `subscriberId` changes:

```vue
<template>
  <div>
    <select v-model="selectedUser">
      <option v-for="user in users" :key="user.id" :value="user">
        {{ user.name }}
      </option>
    </select>

    <NovuInbox
      v-if="selectedUser"
      :applicationIdentifier="novuAppId"
      :subscriberId="selectedUser.novuSubscriberId"
    />
  </div>
</template>
```

## Configuration Options

### NovuUI Options

```javascript
new NovuUI({
  options: {
    applicationIdentifier: 'YOUR_APP_ID',  // Required
    subscriberId: 'USER_SUBSCRIBER_ID',     // Required
  },
});
```

### Mount Component Options

```javascript
novuInstance.mountComponent({
  name: 'Inbox',      // Component name
  props: {},          // Component props
  element: domElement // DOM element to mount to
});
```

## Available Components

| Component | Description |
|-----------|-------------|
| `Inbox` | Full inbox with bell, badge, and notification list |
| `Notifications` | Notification list only (no bell) |
| `Bell` | Bell icon with unread badge only |

## Key Concepts

### Application Identifier
- Unique ID for your Novu application
- Found in Novu Dashboard → Settings → API Keys
- Same for all users

### Subscriber ID
- Unique ID for each user in your system
- Must be synced with Novu backend
- Changes when user switches

## Lifecycle

1. **mounted()** - Initialize NovuUI and mount Inbox
2. **watch: subscriberId** - Re-initialize when user changes
3. **beforeDestroy()** - Cleanup and unmount

## Troubleshooting

### Inbox not showing
- Check `applicationIdentifier` is correct
- Verify `subscriberId` exists in Novu
- Check browser console for errors

### Notifications not updating
- Ensure WebSocket connection is active
- Check Novu workflow is configured correctly
- Verify subscriber exists

## Reference

- [Novu Vue.js Quickstart](https://docs.novu.co/platform/quickstart/vue)
- [Novu JS SDK](https://docs.novu.co/platform/sdks/javascript)
- [@novu/js on npm](https://www.npmjs.com/package/@novu/js)
