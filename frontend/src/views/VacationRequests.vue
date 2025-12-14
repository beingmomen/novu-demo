<template>
  <div class="vacation-requests">
    <div class="page-header">
      <h1>Vacation Requests</h1>
      <p class="page-description">
        <span v-if="isManager">Manage vacation requests from your team</span>
        <span v-else>Submit and track your vacation requests</span>
      </p>
    </div>

    <div v-if="!selectedUser" class="no-user-warning">
      <p>Please select a user from the header to continue.</p>
    </div>

    <template v-else>
      <div v-if="!isManager" class="create-request-form">
        <h2>Submit New Request</h2>
        <div v-if="!selectedUser.managerId" class="warning-message">
          You do not have a manager assigned. Please ask an admin to assign a manager to you before submitting requests.
        </div>
        <form v-else @submit.prevent="createRequest">
          <div class="form-row">
            <div class="form-group">
              <label for="startDate">Start Date</label>
              <input type="date" id="startDate" v-model="newRequest.startDate" required />
            </div>
            <div class="form-group">
              <label for="endDate">End Date</label>
              <input type="date" id="endDate" v-model="newRequest.endDate" required />
            </div>
          </div>
          <div class="form-group">
            <label for="reason">Reason</label>
            <textarea id="reason" v-model="newRequest.reason" placeholder="Enter reason for leave" required rows="3"></textarea>
          </div>
          <button type="submit" class="btn btn-primary" :disabled="creating">
            {{ creating ? "Submitting..." : "Submit Request" }}
          </button>
        </form>
        <p v-if="error" class="error-message">{{ error }}</p>
        <p v-if="success" class="success-message">{{ success }}</p>
      </div>

      <div class="requests-list">
        <h2>{{ isManager ? "Pending Requests from Your Team" : "Your Requests" }}</h2>
        <div v-if="loading" class="loading">Loading requests...</div>
        <div v-else-if="requests.length === 0" class="empty-state">
          <p v-if="isManager">No pending vacation requests from your team.</p>
          <p v-else>You have not submitted any vacation requests yet.</p>
        </div>
        <div v-else class="requests-grid">
          <div v-for="request in requests" :key="request._id" class="request-card" :class="request.status">
            <div class="request-header">
              <span v-if="isManager" class="employee-name">{{ request.employeeId.name }}</span>
              <span class="status-badge" :class="request.status">{{ request.status }}</span>
            </div>
            <div class="request-dates">
              <span class="date-label">From:</span> {{ formatDate(request.startDate) }}
              <span class="date-separator">to</span>
              <span class="date-label">To:</span> {{ formatDate(request.endDate) }}
            </div>
            <div class="request-reason">
              <strong>Reason:</strong> {{ request.reason }}
            </div>
            <div v-if="request.managerNotes" class="manager-notes">
              <strong>Manager Notes:</strong> {{ request.managerNotes }}
            </div>

            <div v-if="isManager && request.status === 'pending'" class="request-actions">
              <div class="notes-input">
                <input type="text" v-model="actionNotes[request._id]" placeholder="Add notes (optional)" />
              </div>
              <div class="action-buttons">
                <button class="btn btn-success" @click="approveRequest(request._id)" :disabled="processing">Approve</button>
                <button class="btn btn-danger" @click="rejectRequest(request._id)" :disabled="processing">Reject</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import api from "../services/api";

export default {
  name: "VacationRequests",
  props: {
    selectedUser: { type: Object, default: null }
  },
  data() {
    return {
      requests: [],
      newRequest: { startDate: "", endDate: "", reason: "" },
      actionNotes: {},
      loading: false,
      creating: false,
      processing: false,
      error: null,
      success: null
    };
  },
  computed: {
    isManager() {
      return this.selectedUser && !this.selectedUser.managerId;
    }
  },
  watch: {
    selectedUser: {
      immediate: true,
      handler() {
        if (this.selectedUser) {
          this.loadRequests();
        }
      }
    }
  },
  methods: {
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString();
    },
    async loadRequests() {
      if (!this.selectedUser) return;
      this.loading = true;
      this.error = null;
      try {
        const response = await api.getVacationRequests(this.selectedUser._id);
        this.requests = response.data;
      } catch (error) {
        this.error = error.response?.data?.error || "Failed to load requests";
      } finally {
        this.loading = false;
      }
    },
    async createRequest() {
      this.error = null;
      this.success = null;
      this.creating = true;
      try {
        await api.createVacationRequest({
          employeeId: this.selectedUser._id,
          ...this.newRequest
        });
        this.newRequest = { startDate: "", endDate: "", reason: "" };
        this.success = "Request submitted successfully! Your manager will be notified.";
        this.loadRequests();
      } catch (error) {
        this.error = error.response?.data?.error || "Failed to submit request";
      } finally {
        this.creating = false;
      }
    },
    async approveRequest(requestId) {
      this.processing = true;
      try {
        await api.approveVacationRequest(requestId, this.actionNotes[requestId] || "");
        this.loadRequests();
      } catch (error) {
        this.error = error.response?.data?.error || "Failed to approve request";
      } finally {
        this.processing = false;
      }
    },
    async rejectRequest(requestId) {
      this.processing = true;
      try {
        await api.rejectVacationRequest(requestId, this.actionNotes[requestId] || "");
        this.loadRequests();
      } catch (error) {
        this.error = error.response?.data?.error || "Failed to reject request";
      } finally {
        this.processing = false;
      }
    }
  }
};
</script>

<style scoped>
.vacation-requests { max-width: 900px; margin: 0 auto; }
.page-header { margin-bottom: 32px; }
.page-header h1 { font-size: 32px; margin-bottom: 8px; }
.page-description { color: var(--text-secondary); }
.no-user-warning, .warning-message { background: rgba(245, 158, 11, 0.1); border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; color: #b45309; margin-bottom: 24px; }
.create-request-form { background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 12px; padding: 24px; margin-bottom: 32px; }
.create-request-form h2 { font-size: 18px; margin-bottom: 20px; }
.form-row { display: flex; gap: 16px; margin-bottom: 16px; }
.form-group { flex: 1; margin-bottom: 16px; }
.form-group label { display: block; margin-bottom: 8px; font-weight: 500; color: var(--text-primary); }
.form-group input, .form-group textarea { width: 100%; padding: 12px 16px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 14px; background: var(--bg-primary); color: var(--text-primary); font-family: inherit; }
.form-group input:focus, .form-group textarea:focus { outline: none; border-color: var(--primary-color); }
.error-message { color: var(--danger-color); margin-top: 12px; }
.success-message { color: #10b981; margin-top: 12px; }
.requests-list h2 { font-size: 18px; margin-bottom: 20px; }
.loading, .empty-state { text-align: center; padding: 40px; color: var(--text-secondary); }
.requests-grid { display: grid; gap: 16px; }
.request-card { background: var(--bg-primary); border: 2px solid var(--border-color); border-radius: 12px; padding: 20px; }
.request-card.pending { border-left: 4px solid #f59e0b; }
.request-card.approved { border-left: 4px solid #10b981; }
.request-card.rejected { border-left: 4px solid #ef4444; }
.request-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.employee-name { font-weight: 600; font-size: 16px; }
.status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; text-transform: capitalize; }
.status-badge.pending { background: rgba(245, 158, 11, 0.1); color: #b45309; }
.status-badge.approved { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.status-badge.rejected { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
.request-dates { color: var(--text-secondary); margin-bottom: 8px; font-size: 14px; }
.date-label { color: var(--text-muted); }
.date-separator { margin: 0 8px; color: var(--text-muted); }
.request-reason { margin-bottom: 8px; }
.manager-notes { background: rgba(99, 102, 241, 0.05); padding: 12px; border-radius: 8px; margin-top: 12px; font-size: 14px; }
.request-actions { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-color); }
.notes-input { margin-bottom: 12px; }
.notes-input input { width: 100%; padding: 10px 14px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 14px; background: var(--bg-primary); color: var(--text-primary); }
.action-buttons { display: flex; gap: 12px; }
.btn-success { background: #10b981; color: white; }
.btn-success:hover { background: #059669; }
.btn-danger { background: #ef4444; color: white; }
.btn-danger:hover { background: #dc2626; }
</style>
