<template>
  <div class="home">
    <section class="hero">
      <h1>Novu Vacation Request Demo</h1>
      <p class="subtitle">Experience real-time In-App notifications between employees and managers</p>
    </section>

    <section class="quick-start">
      <h2>Quick Start Guide</h2>
      <div class="steps">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <h3>Create Manager User</h3>
            <p>Go to <router-link to="/users">Users</router-link> and create a user WITHOUT assigning a manager. This user will act as a Manager.</p>
          </div>
        </div>

        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h3>Create Employee User</h3>
            <p>Create another user and assign the first user as their manager. This user will act as an Employee.</p>
          </div>
        </div>

        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h3>Submit Vacation Request</h3>
            <p>Select the Employee from the header, go to <router-link to="/vacation-requests">Vacation Requests</router-link> and submit a new request.</p>
          </div>
        </div>

        <div class="step">
          <div class="step-number">4</div>
          <div class="step-content">
            <h3>Manager Gets Notified</h3>
            <p>Switch to the Manager user from the header dropdown. Click the bell icon to see the new notification!</p>
          </div>
        </div>

        <div class="step">
          <div class="step-number">5</div>
          <div class="step-content">
            <h3>Approve or Reject</h3>
            <p>As a Manager, go to Vacation Requests and approve or reject the pending request. The Employee will be notified of the decision.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="features">
      <h2>Request Status Flow</h2>
      <div class="status-flow">
        <div class="status-item">
          <span class="status-badge status-pending">Pending</span>
          <span class="status-arrow">&rarr;</span>
        </div>
        <div class="status-item">
          <span class="status-badge status-approved">Approved</span>
        </div>
        <div class="status-divider">or</div>
        <div class="status-item">
          <span class="status-badge status-rejected">Rejected</span>
        </div>
      </div>
    </section>

    <section class="notification-info">
      <h2>Notification Triggers</h2>
      <div class="triggers-grid">
        <div class="trigger-card">
          <div class="trigger-icon">&#128100;</div>
          <h3>Employee submits request</h3>
          <p class="trigger-target">Manager receives:</p>
          <p class="trigger-message">"You have a vacation request pending, and requires your approval"</p>
        </div>
        <div class="trigger-card">
          <div class="trigger-icon">&#9989;</div>
          <h3>Manager approves</h3>
          <p class="trigger-target">Employee receives:</p>
          <p class="trigger-message">"Your vacation request has been approved"</p>
        </div>
        <div class="trigger-card">
          <div class="trigger-icon">&#10060;</div>
          <h3>Manager rejects</h3>
          <p class="trigger-target">Employee receives:</p>
          <p class="trigger-message">"Your vacation request has been rejected"</p>
        </div>
      </div>
    </section>

    <section class="setup-info" v-if="!hasNovuConfig">
      <h2>Setup Required</h2>
      <div class="info-box warning">
        <p><strong>Novu Configuration Missing</strong></p>
        <p>To enable notifications, please configure your Novu credentials:</p>
        <ol>
          <li>Create an account at <a href="https://dashboard.novu.co" target="_blank">dashboard.novu.co</a></li>
          <li>Get your API Key and Application Identifier</li>
          <li>Create these workflows: vacation-request-submitted, vacation-request-approved, vacation-request-rejected</li>
          <li>Update your .env files with the credentials</li>
        </ol>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'Home',
  computed: {
    hasNovuConfig() {
      const appId = process.env.VUE_APP_NOVU_APP_ID;
      return appId && appId !== 'your_application_identifier_here';
    }
  }
};
</script>

<style scoped>
.home { max-width: 900px; margin: 0 auto; }
.hero { text-align: center; padding: 60px 0; }
.hero h1 { font-size: 42px; font-weight: 700; margin-bottom: 16px; color: var(--text-primary); }
.subtitle { font-size: 20px; color: var(--text-secondary); }
.quick-start { margin-bottom: 48px; }
.quick-start h2, .features h2, .notification-info h2 { font-size: 24px; margin-bottom: 24px; color: var(--text-primary); }
.steps { display: grid; gap: 20px; }
.step { display: flex; gap: 20px; padding: 24px; background: var(--bg-primary); border-radius: 12px; border: 1px solid var(--border-color); }
.step-number { width: 40px; height: 40px; background: var(--primary-color); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 18px; flex-shrink: 0; }
.step-content h3 { font-size: 18px; margin-bottom: 8px; color: var(--text-primary); }
.step-content p { color: var(--text-secondary); margin: 0; }
.step-content a { color: var(--primary-color); font-weight: 500; }
.status-flow { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 24px; background: var(--bg-primary); border-radius: 12px; border: 1px solid var(--border-color); }
.status-item { display: flex; align-items: center; gap: 12px; }
.status-badge { padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 500; }
.status-pending { background: rgba(245, 158, 11, 0.1); color: #b45309; }
.status-approved { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.status-rejected { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
.status-arrow { color: var(--text-secondary); font-size: 20px; }
.status-divider { color: var(--text-muted); font-style: italic; }
.notification-info { margin-top: 48px; }
.triggers-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
.trigger-card { padding: 24px; background: var(--bg-primary); border-radius: 12px; border: 1px solid var(--border-color); text-align: center; }
.trigger-icon { font-size: 32px; margin-bottom: 12px; }
.trigger-card h3 { font-size: 16px; margin-bottom: 12px; color: var(--text-primary); }
.trigger-target { font-size: 12px; color: var(--text-muted); margin-bottom: 4px; }
.trigger-message { font-size: 14px; color: var(--primary-color); font-style: italic; margin: 0; }
.setup-info { margin-top: 48px; }
.setup-info h2 { font-size: 24px; margin-bottom: 24px; color: var(--text-primary); }
.info-box { padding: 24px; border-radius: 12px; }
.info-box.warning { background: #fef3c7; border: 1px solid #fcd34d; }
.info-box p { margin: 0 0 12px; color: #92400e; }
.info-box ol, .info-box ul { margin: 0; padding-left: 20px; color: #92400e; }
.info-box li { margin-bottom: 8px; }
.info-box code { background: rgba(0,0,0,0.1); padding: 2px 6px; border-radius: 4px; }
.info-box a { color: #92400e; font-weight: 500; }
</style>
