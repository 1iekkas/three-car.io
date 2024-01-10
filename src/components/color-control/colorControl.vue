<template>
  <div class="color-control">
    <div class="color-item" v-for="(color, index) in colorMaps">
      <div class="color-view" :style="{ backgroundColor: color.color }" @click.stop="onSelectColor(color.color)"></div>
      <div class="color-name">{{ color.name }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, defineComponent, defineEmits } from 'vue'
interface color {
  name: string,
  color: string,
}

const emit = defineEmits(['selectColor'])

const colorMaps: Array<color> = reactive([{
  name: 'Default',
  color: '#342718'
},{
  name: 'Red',
  color: '#d40000'
}, {
  name: 'White',
  color: '#f1f1f1'
}, {
  name: 'Black',
  color: '#333333'
}, {
  name: 'Yellow',
  color: '#ffba00'
}, {
  name: 'Blue',
  color: '#00d9ff'
}, {
  name: 'Green',
  color: '#1bc567'
}])

const onSelectColor = (color: string) => {
  console.log('set color')
  emit('selectColor', color)
}

</script>

<style lang="scss" scoped>
.color-control {
  display: flex;
  justify-content: space-between;
  width: 50vw;
  position: fixed;
  bottom: 60px;
  left: 25vw;

  .color-item {
    .color-view {
      cursor: pointer;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      position: relative;
      backdrop-filter: blur(15px);
      overflow: hidden;
      &::after {
        content: "";
        position: absolute;
        top: 0;
        left: 20px;
        width: 80%;
        height: 100%;
        background: linear-gradient(to left, rgba(255, 255, 255, 0.3), transparent);
        transform: skewX(45deg) translateX(0);
        filter: blur(0);
        // clip-path: circle(100% at center);
        /* transition: 0.5s; */
      }
    }

    .color-name {
      color: #323232;
      font-weight: 500;
      text-align: center;
      padding: 6px 0;
    }
  }
}

.fade-enter-active {
  transition: all 0.35s linear;
}

/* 离开：始状态 */
.fade-leave-active {
  transition: all 0.35s linear;
}

.fade-enter-from,
.fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>