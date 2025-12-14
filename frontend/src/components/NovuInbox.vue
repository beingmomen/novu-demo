<template>
  <div class="novu-inbox-wrapper">
    <div ref="inboxContainer" id="novu-inbox"></div>
  </div>
</template>

<script>
import { NovuUI } from '@novu/js/ui';

export default {
  name: 'NovuInbox',
  props: {
    applicationIdentifier: {
      type: String,
      required: true
    },
    subscriberId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      novu: null
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
    }
  },
  methods: {
    initNovu() {
      if (!this.applicationIdentifier || !this.subscriberId) {
        console.warn('NovuInbox: Missing applicationIdentifier or subscriberId');
        return;
      }

      try {
        this.novu = new NovuUI({
          options: {
            applicationIdentifier: this.applicationIdentifier,
            subscriberId: this.subscriberId
          }
        });

        // Mount inbox to container
        if (this.$refs.inboxContainer) {
          this.novu.mountComponent({
            name: 'Inbox',
            props: {
              open: true
            },
            element: this.$refs.inboxContainer
          });
        }
        console.log('NovuInbox mounted with subscriberId:', this.subscriberId);
      } catch (error) {
        console.error('Failed to initialize Novu:', error);
      }
    },
    destroyNovu() {
      if (this.novu) {
        try {
          this.novu.unmountComponent({
            element: this.$refs.inboxContainer
          });
        } catch (e) {
          // Ignore unmount errors
        }
        this.novu = null;
      }
    }
  }
};
</script>

<style scoped>
.novu-inbox-wrapper {
  width: 100%;
  min-height: 400px;
}
</style>
