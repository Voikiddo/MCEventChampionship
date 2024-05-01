<template>
  <h3>Current Vote Info</h3>
  <pre>{{ voteInfo }}</pre>
</template>

<script setup lang="js">
import { computed, defineProps, toRef } from "vue";

const props = defineProps({
  voteTopic: {
    type: String,
    required: true
  },
  eventA: {
    type: String
    // required: true
  },
  eventB: {
    type: String
    // required: true
  },
  votesA: {
    type: Number
  },
  votesB: {
    type: Number
  }
})

const voteTopic = toRef(props, "voteTopic")
const eventA = toRef(props, "eventA")
const eventB = toRef(props, "eventB")
const votesA = toRef(props, "votesA")
const votesB = toRef(props, "votesB")

const voteInfo = computed(() => {
  if (voteTopic.value == "TBD") return "TBD"

  return `Topic: ${voteTopic.value}. Result: ${eventA.value} - ${votesA.value} : ${eventB.value} - ${votesB.value}`
})
</script>
