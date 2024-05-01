<template>
  <div class="config">
    <h1>Broadcaster Configuration</h1>

    <div>
      <h3>Set Vote Topic</h3>
      <label for="vote-topic">Vote for: </label>
      <input id="vote-topic" v-model="newVoteState.topic" type="text" />
      <br />
      <label for="vote-event-A">Event A: </label>
      <input id="vote-event-A" v-model="newVoteState.eventA" type="text" />
      <br />
      <label for="vote-event-B">Event B: </label>
      <input id="vote-event-B" v-model="newVoteState.eventB" type="text" />
      <br />
      <button @click="setVoteTopic">Set Topic</button>
    </div>

    <div>
      <h3>Voting Testing</h3>
      <input type="radio" id="vote-A" value="false" v-model="voteValue" />
      <label for="vote-A">A Event</label>
      <input type="radio" id="vote-B" value="true" v-model="voteValue" />
      <label for="vote-B">B Event</label>
      <br />
      <button @click="voteForTopic">Vote!</button>
    </div>

    <div>
      <h3>Update Vote Status</h3>
      <button @click="updateVoteStatus">udpate</button>
    </div>

    <VoteResult
      :voteTopic="voteState.topic"
      :eventA="voteState.eventA"
      :eventB="voteState.eventB"
      :votesA="voteState.votesA"
      :votesB="voteState.votesB"
    />

    <VoteLog />
  </div>
</template>

<script setup lang="js">
import { reactive, ref } from "vue";

import { provideMEDKit } from "@/shared/hooks/use-medkit";

import analytics from "@/shared/analytics";
import globals from "@/shared/globals";

import VoteResult from "../shared/views/VoteResult.vue";
import VoteLog from "@/shared/views/VoteLog.vue";

const newVoteState = reactive({
  topic: "TBD",
  eventA: "TBD",
  eventB: "TBD"
})

const voteState = reactive({
  topic: "TBD",
  eventA: "TBD",
  eventB: "TBD",
  votesA: 0,
  votesB: 0
})

const voteValue = ref(false);
const medkitLoaded = ref(false);

// MEDKit is initialized and provided to the Vue provide/inject system
const medkit = provideMEDKit({
  channelId: globals.TESTING_CHANNEL_ID,
  clientId: globals.CLIENT_ID,
  role: "admin",
  uaString: globals.UA_STRING,
  userId: globals.TESTING_USER_ID,
});

// MEDKit must fully load before it is available
medkit.loaded().then(async () => {
  medkitLoaded.value = true;

  if (globals.UA_STRING) {
    analytics.setMEDKit(medkit);
    analytics.startKeepAliveHeartbeat();
  }

  medkit.getChannelState().then((state) => {
    voteState.topic = state.vote_topic
    voteState.eventA = state.event_A
    voteState.eventB = state.event_B
  })

  medkit.listen("channel_state_update", (newState) => {
    console.log(`New channel state updated: ${JSON.stringify(newState)}`)
    voteState.topic = newState.vote_topic
    voteState.eventA = newState.event_A
    voteState.eventB = newState.event_B

    newVoteState.topic = newState.vote_topic
    newVoteState.eventA = newState.event_A
    newVoteState.eventB = newState.event_B

    medkit.getVoteData(voteState.topic).then(voteData => {
      console.log(voteData);
      voteState.votesA = voteData.specific ? voteData.specific[0] : 0
      voteState.votesB = voteData.specific ? voteData.specific[1] : 0
    })
  });
});

const setVoteTopic = () => {
  if (!medkitLoaded.value) console.log("Please wait a bit before trying again");

  const newState = { vote_topic: newVoteState.topic, event_A: newVoteState.eventA, event_B: newVoteState.eventB }
  medkit.setChannelState(newState).then(state => { console.log(state); });
}

const voteForTopic = () => {
  if (!medkitLoaded.value) console.log("Please wait a bit before trying again");

  console.log(`voting for ${voteState.topic} with ${voteValue.value ? 1 : 0}`)
  medkit.vote(voteState.topic, voteValue.value ? 1 : 0);
}

const updateVoteStatus = () => {
  medkit.getVoteData(voteState.topic).then(voteData => {
    voteState.votesA = voteData.specific ? voteData.specific[0] : 0
    voteState.votesB = voteData.specific ? voteData.specific[1] : 0
  })
}
</script>

<style lang="scss">
@import "@/shared/scss/base.scss";

.config {
  height: 100vh;
  width: 100vw;

  background-color: rgba(50, 50, 50, 1);
  color: white;
  padding: 1em;
}
</style>
