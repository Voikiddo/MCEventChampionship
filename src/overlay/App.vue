<template>
  <div class="overlay">
    <div id="voteBtnDiv">
      <button class="voteBtn" id="voteBtn1" @click="voteForTopic(0)">
        {{ voteStatus.eventA }}
      </button>
      <button class="voteBtn" id="voteBtn2" @click="voteForTopic(1)">
        {{ voteStatus.eventB }}
      </button>
    </div>
  </div>
</template>

<script lang="js">
import { defineComponent, ref, reactive } from "vue";

import { provideMEDKit } from "@/shared/hooks/use-medkit";

import analytics from "@/shared/analytics";
import globals from "@/shared/globals";

export default defineComponent({
  setup() {
    const voteStatus = reactive({
      topic: "TBD",
      eventA: "TBD",
      eventB: "TBD"
    })
    const medkitLoaded = ref(false);

    const voteForTopic = (vote) => {
      if (!medkitLoaded.value) console.log("Please wait a bit before trying again");

      console.log(`voting for ${voteStatus.topic} with ${vote}`)
      medkit.vote(voteStatus.topic, vote);
    }

    // MEDKit is initialized and provided to the Vue provide/inject system
    const medkit = provideMEDKit({
      channelId: globals.TESTING_CHANNEL_ID,
      clientId: globals.CLIENT_ID,
      role: "viewer",
      uaString: globals.UA_STRING,
      userId: globals.TESTING_USER_ID,
    });

    // MEDKit must fully load before it is available
    medkit.loaded().then(() => {
      medkitLoaded.value = true

      if (globals.UA_STRING) {
        analytics.setMEDKit(medkit);
        analytics.startKeepAliveHeartbeat();
      }

      medkit.getChannelState().then((state) => {
        console.log(state);
        voteStatus.eventA = state.event_A
        voteStatus.eventB = state.event_B
        voteStatus.topic = state.vote_topic
      })

      // Certain events will be broadcast automatically in response to
      // server actions. This event is sent whenever the channel state
      // is changed by the broadcaster.
      medkit.listen("channel_state_update", (newState) => {
        console.log("Channel state has been updated");
        console.log(JSON.stringify(newState));
      });
    });

    return {
      voteStatus,
      voteForTopic
    };
  },
});
</script>

<style lang="scss">
@import "@/shared/scss/base.scss";

.overlay {
  height: 40vh;
  width: 100vw;
  bottom: 0;
  position: absolute;

  background-color: rgba(50, 50, 50, 0.6);
  color: white;
  padding: 1em;
}

#voteBtnDiv {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
}

.voteBtn {
  height: 10vh;
  width: 20vw;
  margin-right: 12rem;
  font-size: 2rem;
}
</style>
