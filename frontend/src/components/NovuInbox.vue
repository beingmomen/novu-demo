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
