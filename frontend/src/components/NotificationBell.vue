<template>
  <div class="notification-bell">
    <button
      class="bell-button"
      @click="toggleDropdown"
      :class="{ 'has-unread': unreadCount > 0 }"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      </svg>
      <span v-if="unreadCount > 0" class="unread-badge">{{
        unreadCount > 9 ? "9+" : unreadCount
      }}</span>
    </button>

    <div v-if="isOpen" class="inbox-dropdown">
      <div class="inbox-header">
        <h3>Notifications</h3>
        <button class="close-btn" @click="isOpen = false">&times;</button>
      </div>
      <div ref="notificationsContainer" class="notifications-content"></div>
    </div>
  </div>
</template>

<script>
import { Novu } from "@novu/js";
import { NovuUI } from "@novu/js/ui";

export default {
  name: "NotificationBell",
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
      novu: null, // Core SDK for events
      novuUI: null, // UI SDK for components
      isOpen: false,
      unreadCount: 0,
    };
  },
  mounted() {
    this.initNovu();
    document.addEventListener("click", this.handleClickOutside);
  },
  beforeDestroy() {
    this.destroyNovu();
    document.removeEventListener("click", this.handleClickOutside);
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
    isOpen(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.mountNotifications();
        });
      } else {
        this.unmountNotifications();
        // Refresh count once when closing inbox
        setTimeout(() => {
          this.refreshUnreadCount();
        }, 300);
      }
    },
  },
  methods: {
    initNovu() {
      if (!this.applicationIdentifier || !this.subscriberId) {
        console.warn(
          "NotificationBell: Missing applicationIdentifier or subscriberId"
        );
        return;
      }

      try {
        // Core SDK for events
        this.novu = new Novu({
          applicationIdentifier: this.applicationIdentifier,
          subscriberId: this.subscriberId,
        });

        // UI SDK for components
        this.novuUI = new NovuUI({
          options: {
            applicationIdentifier: this.applicationIdentifier,
            subscriberId: this.subscriberId,
          },
        });

        // Get initial unread count when session is initialized
        this.novu.on("session.initialize.resolved", (data) => {
          console.log("Session initialized (raw):", JSON.stringify(data));
          const count = this.extractUnreadCount(data);
          if (count !== null) {
            this.unreadCount = count;
          }
        });

        // Listen for unread count changes (real-time updates)
        this.novu.on("notifications.unread_count_changed", (data) => {
          console.log("Unread count changed (raw):", JSON.stringify(data));
          const count = this.extractUnreadCount(data);
          if (count !== null) {
            this.unreadCount = count;
          }
        });

        // Also listen for unseen count changes
        this.novu.on("notifications.unseen_count_changed", (data) => {
          console.log("Unseen count changed (raw):", JSON.stringify(data));
          const count = this.extractUnreadCount(data);
          if (count !== null) {
            this.unreadCount = count;
          }
        });

        // Listen for new notifications - increment manually as backup
        this.novu.on("notifications.notification_received", (data) => {
          console.log("New notification received:", data);
          this.unreadCount++;
        });

        // Listen for notification clicks/reads
        this.novu.on("notifications.notification_clicked", (data) => {
          console.log("Notification clicked:", data);
          this.refreshUnreadCount();
        });

        this.novu.on("notifications.notification_read", (data) => {
          console.log("Notification read:", data);
          setTimeout(() => this.refreshUnreadCount(), 300);
        });

        this.novu.on("notifications.notifications_read", (data) => {
          console.log("All notifications read:", data);
          setTimeout(() => this.refreshUnreadCount(), 300);
        });

        console.log("Novu initialized with subscriberId:", this.subscriberId);
      } catch (error) {
        console.error("Failed to initialize Novu:", error);
      }
    },
    mountNotifications() {
      if (this.novuUI && this.$refs.notificationsContainer) {
        try {
          this.novuUI.mountComponent({
            name: "Notifications",
            props: {},
            element: this.$refs.notificationsContainer,
          });
        } catch (error) {
          console.error("Failed to mount notifications:", error);
        }
      }
    },
    unmountNotifications() {
      if (this.novuUI && this.$refs.notificationsContainer) {
        try {
          this.novuUI.unmountComponent({
            element: this.$refs.notificationsContainer,
          });
        } catch (e) {
          // Ignore unmount errors
        }
      }
    },
    async refreshUnreadCount() {
      // Get unread count by listing unread notifications
      if (this.novu && this.novu.notifications) {
        try {
          const result = await this.novu.notifications.list({
            read: false,
            limit: 100,
          });
          console.log("Refreshed unread count:", result);
          // Count unread notifications from list
          if (
            result &&
            result.data &&
            Array.isArray(result.data.notifications)
          ) {
            this.unreadCount = result.data.notifications.length;
          } else if (result && Array.isArray(result.notifications)) {
            this.unreadCount = result.notifications.length;
          } else if (result && Array.isArray(result.data)) {
            this.unreadCount = result.data.length;
          }
        } catch (e) {
          console.warn("Could not refresh unread count:", e);
        }
      }
    },
    extractUnreadCount(data) {
      // Handle various data structures from Novu events
      if (data === null || data === undefined) {
        return null;
      }
      // Direct number
      if (typeof data === "number") {
        return data;
      }
      // Empty object {}
      if (typeof data === "object" && Object.keys(data).length === 0) {
        return null;
      }
      // { result: { total: number } } - unread_count_changed event
      if (data.result && typeof data.result.total === "number") {
        return data.result.total;
      }
      // { data: { totalUnreadCount: number } } - session.initialize.resolved
      if (data.data && typeof data.data.totalUnreadCount === "number") {
        return data.data.totalUnreadCount;
      }
      // { data: { unreadCount: { total: number } } } - session.initialize.resolved
      if (
        data.data &&
        data.data.unreadCount &&
        typeof data.data.unreadCount.total === "number"
      ) {
        return data.data.unreadCount.total;
      }
      // { totalUnreadCount: number }
      if (typeof data.totalUnreadCount === "number") {
        return data.totalUnreadCount;
      }
      // { unreadCount: { total: number } }
      if (data.unreadCount && typeof data.unreadCount.total === "number") {
        return data.unreadCount.total;
      }
      // { unreadCount: number }
      if (typeof data.unreadCount === "number") {
        return data.unreadCount;
      }
      // { count: number }
      if (typeof data.count === "number") {
        return data.count;
      }
      // { data: { count: number } }
      if (data.data && typeof data.data.count === "number") {
        return data.data.count;
      }
      // Not found
      console.warn("Could not extract unread count from:", data);
      return null;
    },
    destroyNovu() {
      // Cleanup event listeners
      console.log("destroyNovu");
      if (this.novu) {
        try {
          this.novu.off("session.initialize.resolved");
          this.novu.off("notifications.unread_count_changed");
          this.novu.off("notifications.unseen_count_changed");
          this.novu.off("notifications.notification_received");
          this.novu.off("notifications.notification_clicked");
          this.novu.off("notifications.notification_read");
          this.novu.off("notifications.notifications_read");
        } catch (e) {
          // Ignore cleanup errors
        }
        this.novu = null;
      }
      // Cleanup UI
      if (this.novuUI) {
        try {
          this.unmountNotifications();
        } catch (e) {
          // Ignore cleanup errors
        }
        this.novuUI = null;
      }
      this.unreadCount = 0;
    },
    toggleDropdown() {
      this.isOpen = !this.isOpen;
    },
    handleClickOutside(event) {
      if (!this.isOpen) return;

      // Check if click is inside our component
      if (this.$el.contains(event.target)) return;

      // Check if click target or any parent has Novu-related attributes/classes
      let el = event.target;
      while (el && el !== document.body) {
        // Check for Novu classes or attributes
        if (el.className && typeof el.className === "string") {
          if (el.className.includes("novu") || el.className.includes("Novu"))
            return;
        }
        if (el.id && (el.id.includes("novu") || el.id.includes("Novu"))) return;
        if (
          el.hasAttribute &&
          (el.hasAttribute("data-novu") || el.hasAttribute("data-radix"))
        )
          return;
        el = el.parentElement;
      }

      // Check for any floating/portal elements (Novu uses these for popovers)
      const portalSelectors = [
        "[data-floating-ui-portal]",
        "[data-radix-popper-content-wrapper]",
        "[data-radix-portal]",
        '[role="menu"]',
        '[role="listbox"]',
        ".nv-dropdown",
        ".nv-popover",
      ];

      for (const selector of portalSelectors) {
        const elements = document.querySelectorAll(selector);
        for (const portalEl of elements) {
          if (portalEl.contains(event.target)) return;
        }
      }

      this.isOpen = false;
    },
  },
};
</script>

<style scoped>
.notification-bell {
  position: relative;
}

.bell-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  color: var(--text-secondary);
  transition: all 0.2s;
  position: relative;
}

.bell-button:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.bell-button.has-unread {
  color: var(--primary-color);
}

.unread-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: var(--danger-color);
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 5px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
}

.inbox-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 380px;
  max-height: 500px;
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--border-color);
  overflow: hidden;
  z-index: 1000;
}

.inbox-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.inbox-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: var(--text-primary);
}

.notifications-content {
  max-height: 400px;
  overflow-y: auto;
}
</style>
