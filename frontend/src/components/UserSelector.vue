<template>
  <div class="user-selector">
    <select
      :value="selectedUser ? selectedUser._id : ''"
      @change="handleChange"
      class="user-select"
    >
      <option value="" disabled>Select a user</option>
      <option
        v-for="user in users"
        :key="user._id"
        :value="user._id"
      >
        {{ user.name }}
      </option>
    </select>
  </div>
</template>

<script>
export default {
  name: 'UserSelector',
  props: {
    users: {
      type: Array,
      required: true
    },
    selectedUser: {
      type: Object,
      default: null
    }
  },
  methods: {
    handleChange(event) {
      const userId = event.target.value;
      const user = this.users.find(u => u._id === userId);
      if (user) {
        this.$emit('select', user);
      }
    }
  }
};
</script>

<style scoped>
.user-selector {
  display: flex;
  align-items: center;
}

.user-select {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  min-width: 150px;
}

.user-select:focus {
  outline: none;
  border-color: var(--primary-color);
}
</style>
