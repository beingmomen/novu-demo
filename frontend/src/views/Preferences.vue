<template>
  <div class="preferences">
    <div class="page-header">
      <h1>Notification Preferences</h1>
      <p class="page-description">
        <span v-if="selectedUser">Manage preferences for {{ selectedUser.name }}</span>
        <span v-else>Select a user to manage preferences</span>
      </p>
    </div>

    <div v-if="!selectedUser" class="no-user-warning">
      <p>Please select a user from the header dropdown to manage their notification preferences.</p>
    </div>

    <template v-else>
      <div class="preferences-content">
        <div class="preferences-info">
          <h2>About Notification Preferences</h2>
          <p>
            Novu provides a built-in preferences management system. Users can control
            which notifications they want to receive and through which channels.
          </p>
          <p>
            The preferences panel below is powered by Novu's Inbox component.
            Changes are automatically synced with Novu's backend.
          </p>
        </div>

        <div class="preferences-panel">
          <h2>Your Preferences</h2>
          <div v-if="!novuAppId" class="config-warning">
            <p>Novu is not configured. Please add your Application Identifier to the .env file.</p>
          </div>
          <div v-else class="novu-preferences">
            <NovuInbox
              :applicationIdentifier="novuAppId"
              :subscriberId="selectedUser.novuSubscriberId"
            />
          </div>
        </div>

        <div class="test-notification">
          <h2>Test Notifications</h2>
          <p>Send a test notification to verify your setup is working correctly.</p>
          <div class="test-form">
            <input
              type="text"
              v-model="testMessage"
              placeholder="Custom message (optional)"
              class="test-input"
            />
            <button
              class="btn btn-primary"
              @click="sendTestNotification"
              :disabled="sending"
            >
              {{ sending ? 'Sending...' : 'Send Test Notification' }}
            </button>
          </div>
          <p v-if="testSuccess" class="success-message">Test notification sent! Check your inbox.</p>
          <p v-if="testError" class="error-message">{{ testError }}</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import api from '../services/api';
import NovuInbox from '../components/NovuInbox.vue';

export default {
  name: 'Preferences',
  components: {
    NovuInbox
  },
  props: {
    selectedUser: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      novuAppId: process.env.VUE_APP_NOVU_APP_ID || '',
      testMessage: '',
      sending: false,
      testSuccess: false,
      testError: null
    };
  },
  methods: {
    async sendTestNotification() {
      if (!this.selectedUser) return;

      this.sending = true;
      this.testSuccess = false;
      this.testError = null;

      try {
        await api.sendTestNotification(this.selectedUser._id, this.testMessage);
        this.testSuccess = true;
        this.testMessage = '';

        // Clear success message after 5 seconds
        setTimeout(() => {
          this.testSuccess = false;
        }, 5000);
      } catch (error) {
        this.testError = error.response?.data?.error || 'Failed to send test notification';
      } finally {
        this.sending = false;
      }
    }
  }
};
</script>

<style scoped>
.preferences {
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 32px;
  margin-bottom: 8px;
}

.page-description {
  color: var(--text-secondary);
}

.no-user-warning {
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
}

.no-user-warning p {
  color: #92400e;
  margin: 0;
}

.preferences-content {
  display: grid;
  gap: 24px;
}

.preferences-info,
.preferences-panel,
.test-notification {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
}

.preferences-info h2,
.preferences-panel h2,
.test-notification h2 {
  font-size: 18px;
  margin-bottom: 12px;
}

.preferences-info p {
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.preferences-info p:last-child {
  margin-bottom: 0;
}

.config-warning {
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 8px;
  padding: 16px;
}

.config-warning p {
  color: #92400e;
  margin: 0;
}

.novu-preferences {
  min-height: 300px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.test-notification p {
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.test-form {
  display: flex;
  gap: 12px;
}

.test-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.test-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.success-message {
  color: var(--success-color);
  margin-top: 12px;
}

.error-message {
  color: var(--danger-color);
  margin-top: 12px;
}
</style>
