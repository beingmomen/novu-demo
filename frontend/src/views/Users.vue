<template>
  <div class="users">
    <div class="page-header">
      <h1>Users</h1>
      <p class="page-description">Manage users and assign managers</p>
    </div>

    <div class="create-user-form">
      <h2>Create New User</h2>
      <form @submit.prevent="createUser">
        <div class="form-row">
          <div class="form-group">
            <label for="name">Name</label>
            <input type="text" id="name" v-model="newUser.name" placeholder="Enter name" required />
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="newUser.email" placeholder="Enter email" required />
          </div>
          <div class="form-group">
            <label for="manager">Manager (Optional)</label>
            <select id="manager" v-model="newUser.managerId">
              <option :value="null">No Manager</option>
              <option v-for="user in localUsers" :key="user._id" :value="user._id">{{ user.name }}</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary" :disabled="creating">{{ creating ? "Creating..." : "Create User" }}</button>
        </div>
      </form>
      <p v-if="error" class="error-message">{{ error }}</p>
    </div>

    <div class="users-list">
      <h2>Existing Users</h2>
      <div v-if="loading" class="loading">Loading users...</div>
      <div v-else-if="localUsers.length === 0" class="empty-state"><p>No users yet. Create your first user above.</p></div>
      <div v-else class="users-grid">
        <div v-for="user in localUsers" :key="user._id" class="user-card" :class="{ selected: selectedUser && selectedUser._id === user._id }" @click="selectUser(user)">
          <div class="user-avatar" :class="{ 'is-manager': !user.managerId }">{{ getInitials(user.name) }}</div>
          <div class="user-info">
            <h3>{{ user.name }}</h3>
            <p>{{ user.email }}</p>
            <div class="user-role">
              <span v-if="user.managerId" class="role-badge employee">Employee - Reports to: {{ user.managerId.name }}</span>
              <span v-else class="role-badge manager">Manager</span>
            </div>
            <div class="manager-select" @click.stop>
              <label>Change Manager:</label>
              <select @change="assignManager(user, $event.target.value)" :value="user.managerId && user.managerId._id ? user.managerId._id : ''">
                <option value="">No Manager</option>
                <option v-for="u in localUsers" :key="u._id" :value="u._id" :disabled="u._id === user._id">{{ u.name }}</option>
              </select>
            </div>
          </div>
          <button class="delete-btn" @click.stop="deleteUser(user)" title="Delete user">&times;</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "../services/api";

export default {
  name: "Users",
  props: {
    users: { type: Array, default: () => [] },
    selectedUser: { type: Object, default: null }
  },
  data() {
    return {
      localUsers: [],
      newUser: { name: "", email: "", managerId: null },
      loading: true,
      creating: false,
      error: null
    };
  },
  watch: {
    users: {
      immediate: true,
      handler(val) {
        this.localUsers = val;
        this.loading = false;
      }
    }
  },
  methods: {
    getInitials(name) {
      return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    },
    async createUser() {
      this.error = null;
      this.creating = true;
      try {
        await api.createUser(this.newUser);
        this.newUser = { name: "", email: "", managerId: null };
        this.$emit("userCreated");
      } catch (error) {
        this.error = error.response?.data?.error || "Failed to create user";
      } finally {
        this.creating = false;
      }
    },
    selectUser(user) {
      this.$emit("userSelected", user);
    },
    async assignManager(user, managerId) {
      try {
        await api.assignManager(user._id, managerId || null);
        this.$emit("userCreated");
      } catch (error) {
        this.error = error.response?.data?.error || "Failed to assign manager";
      }
    },
    async deleteUser(user) {
      if (!confirm("Are you sure you want to delete " + user.name + "?")) return;
      try {
        await api.deleteUser(user._id);
        this.$emit("userCreated");
      } catch (error) {
        this.error = error.response?.data?.error || "Failed to delete user";
      }
    }
  }
};
</script>

<style scoped>
.users { max-width: 900px; margin: 0 auto; }
.page-header { margin-bottom: 32px; }
.page-header h1 { font-size: 32px; margin-bottom: 8px; }
.page-description { color: var(--text-secondary); }
.create-user-form { background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 12px; padding: 24px; margin-bottom: 32px; }
.create-user-form h2 { font-size: 18px; margin-bottom: 20px; }
.form-row { display: flex; gap: 16px; align-items: flex-end; flex-wrap: wrap; }
.form-group { flex: 1; min-width: 150px; }
.form-group label { display: block; margin-bottom: 8px; font-weight: 500; color: var(--text-primary); }
.form-group input, .form-group select { width: 100%; padding: 12px 16px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 14px; background: var(--bg-primary); color: var(--text-primary); }
.form-group input:focus, .form-group select:focus { outline: none; border-color: var(--primary-color); }
.error-message { color: var(--danger-color); margin-top: 12px; }
.users-list h2 { font-size: 18px; margin-bottom: 20px; }
.loading, .empty-state { text-align: center; padding: 40px; color: var(--text-secondary); }
.users-grid { display: grid; gap: 16px; }
.user-card { display: flex; align-items: flex-start; gap: 16px; padding: 20px; background: var(--bg-primary); border: 2px solid var(--border-color); border-radius: 12px; cursor: pointer; transition: all 0.2s; }
.user-card:hover { border-color: var(--primary-color); }
.user-card.selected { border-color: var(--primary-color); background: rgba(99, 102, 241, 0.05); }
.user-avatar { width: 48px; height: 48px; background: var(--primary-color); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 16px; flex-shrink: 0; }
.user-avatar.is-manager { background: #10b981; }
.user-info { flex: 1; }
.user-info h3 { font-size: 16px; margin-bottom: 4px; }
.user-info p { color: var(--text-secondary); margin-bottom: 8px; }
.user-role { margin-bottom: 12px; }
.role-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
.role-badge.manager { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.role-badge.employee { background: rgba(99, 102, 241, 0.1); color: var(--primary-color); }
.manager-select { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.manager-select label { color: var(--text-secondary); white-space: nowrap; }
.manager-select select { padding: 6px 10px; border: 1px solid var(--border-color); border-radius: 6px; font-size: 13px; background: var(--bg-primary); color: var(--text-primary); cursor: pointer; }
.delete-btn { background: none; border: none; font-size: 24px; color: var(--text-secondary); cursor: pointer; padding: 4px 8px; border-radius: 4px; }
.delete-btn:hover { background: rgba(239, 68, 68, 0.1); color: var(--danger-color); }
</style>
