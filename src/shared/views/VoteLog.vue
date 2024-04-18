<template>
  <h1>COMING SOON</h1>

  <h3>Current Channel State</h3>
  <pre>{{ channelState }}</pre>

  <h3>Current Vote Info</h3>
  <pre>{{ voteInfo }}</pre>
</template>

<script lang="js">
import { defineComponent, ref } from "vue";

import { useMEDKit } from "@/shared/hooks/use-medkit";

export default defineComponent({
  setup() {
    const channelState = ref("");
    const voteInfo = ref("")

    const { medkit } = useMEDKit();

    medkit.loaded().then(async () => {
        console.log("MEDKit is available");


        // A snapshot of the channel state can be fetched at any point
        channelState.value = JSON.stringify(
            await medkit.getChannelState(),
            undefined,
            2
        );


        medkit.getFullVoteLogs('test-vote').then(logs => {
            const audit = logs.result;

            // ... process the audit logs ...
            const valueToUsersMapping = {};
            for (let i = 0; i < audit.length; ++i) {
                const value = audit[i].value;
                const identifier = audit[i].identifier;

                const list = valueToUsersMapping[value] || [];
                list.append(identifier);

                valueToUsersMapping[value] = list;
            }
            voteInfo.value = JSON.stringify(valueToUsersMapping, undefined, 2)
        });

        // A listener can be created which will automatically be called
        // when the broadcaster updates state
        medkit.listen("channel_state_update", (newState) => {
            channelState.value = JSON.stringify(newState, undefined, 2);
        });
    });

    return {
      channelState,
      voteInfo,
    }
  }
});
</script>

<style lang="scss" scoped>
@import url("https://fonts.googleapis.com/css2?family=Nunito&display=swap");

h1 {
  font-family: Nunito, sans-serif;
  font-size: 2rem;
  text-align: center;
}

pre {
  width: 100%;
  overflow: auto;
}
</style>
