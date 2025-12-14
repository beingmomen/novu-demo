<template>
  <div id="app">
    <header class="app-header">
      <div class="header-content">
        <h1 class="logo">
          <router-link to="/">Novu Demo</router-link>
        </h1>
        <nav class="main-nav">
          <router-link to="/">Home</router-link>
          <router-link to="/users">Users</router-link>
          <router-link to="/vacation-requests">Vacation Requests</router-link>
          <router-link to="/preferences">Preferences</router-link>
        </nav>
        <div class="header-actions">
          <UserSelector
            v-if="users.length > 0"
            :users="users"
            :selectedUser="selectedUser"
            @select="selectUser"
          />
          <NotificationBell
            v-if="selectedUser"
            :applicationIdentifier="novuAppId"
            :subscriberId="selectedUser.novuSubscriberId"
          />
        </div>
      </div>
    </header>

    <main class="app-main">
      <router-view
        :selectedUser="selectedUser"
        :users="users"
        @userCreated="loadUsers"
        @userSelected="selectUser"
      />
    </main>

    <footer class="app-footer">
      <p>Novu In-App Inbox Demo - Vacation Request System</p>
    </footer>
  </div>
</template>

<script>
import api from './services/api';
import UserSelector from './components/UserSelector.vue';
import NotificationBell from './components/NotificationBell.vue';

export default {
  name: 'App',
  components: {
    UserSelector,
    NotificationBell
  },
  data() {
    return {
      users: [],
      selectedUser: null,
      novuAppId: process.env.VUE_APP_NOVU_APP_ID || ''
    };
  },
  async created() {
    await this.loadUsers();
  },
  methods: {
    async loadUsers() {
      try {
        const response = await api.getUsers();
        this.users = response.data;

        // Try to restore previously selected user from localStorage
        const savedUserId = localStorage.getItem('selectedUserId');
        if (savedUserId && this.users.length > 0) {
          const savedUser = this.users.find(u => u._id === savedUserId);
          if (savedUser) {
            this.selectedUser = savedUser;
            return;
          }
        }

        // Auto-select first user if none selected
        if (!this.selectedUser && this.users.length > 0) {
          this.selectedUser = this.users[0];
          localStorage.setItem('selectedUserId', this.users[0]._id);
        }
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    },
    selectUser(user) {
      this.selectedUser = user;
      // Save selected user ID to localStorage
      if (user && user._id) {
        localStorage.setItem('selectedUserId', user._id);
      }
    }
  }
};
</script>
