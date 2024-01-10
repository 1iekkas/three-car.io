<template>
  <div class="loading" :class="{ 'hidden': !show }" :style="{ zIndex: zIndex }">
    <div class="loading-progress">
      <div class="progress-line">
        <div class="progress-value" :style="{ width: `${progress}%` }"></div>
      </div>

      <div class="progress-tips">loading: {{ progress }}%...</div>
      <div :style="{ 'opacity': progress == 100 ? 1 : 0 }" class="progress-tips">页面渲染中...</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, defineProps, watch } from 'vue'
const show = ref(true)
let zIndex = ref(1)
const props = defineProps({
  progress: {
    type: Number,
    default: 0
  }
})

watch(props, (n, o) => {
  if(props.progress == 100) {
    // 不想写太多代码，使用setTimeout设置show/zIndex属性
    setTimeout(() => {
      show.value = false
    }, 1200)
    setTimeout(() => {
      zIndex.value = -2
    }, 4000)
  }
})

</script>

<style lang="scss" scoped>
.loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 1s linear;

  &.hidden {
    opacity: 0;
    /* z-index: -10; */
  }

  .loading-progress {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 20vw;
    height: 10px;
    transform: translate(-50%, -50%);

    .progress-line {
      position: absolute;
      top: 0;
      left: 0;
      width: 20vw;
      height: 10px;
      background-color: rgb(212, 212, 212);
      border-radius: 8px;
    }

    .progress-value {
      position: absolute;
      top: 0;
      left: 0;
      height: 10px;
      background-color: #ffb20c;
      box-shadow:
        0px 0px 2.7px rgba(255, 238, 162, 0.4),
        0px 0px 6.9px rgba(255, 238, 162, 0.4),
        0px 0px 14.2px rgba(255, 238, 162, 0.11),
        0px 0px 29.2px rgba(255, 238, 162, 0.14),
        0px 0px 80px rgba(255, 238, 162, 0.2);

      border-radius: 8px;
    }
  }

  .progress-tips {
    color: white;
    font-weight: bold;
    margin-top: 32px;
    text-align: center;
    text-shadow: 0px 0px 2.7px rgba(255, 238, 162, 0.25),
        0px 0px 6.9px rgba(255, 238, 162, 0.25),
        0px 0px 14.2px rgba(255, 238, 162, 0.11),
        0px 0px 29.2px rgba(255, 238, 162, 0.14),
        0px 0px 80px rgba(255, 238, 162, 0.2);
        transition: all 0.5s linear;    
    &+.progress-tips {
      margin-top: 12px;
      
    }    
  }
}

@keyframes hide {
  0% {
    opacity: 1;
  }

  25% {
    opacity: .75;
  }

  50% {
    opacity: .5;
  }

  75% {
    opacity: .25;
  }

  100% {
    opacity: 0;
    display: none;
  }
}
</style>