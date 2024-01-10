<template>
  <!--交互组件 :style="{ transform: `rotate(${45 * (index + 1)}deg)` }"-->
  <div class="interactive-section">
    <div class="tips">控制台</div>
    <div class="control-item" v-for="(item, index) in controlsList"
    :style="{ transform: `translate(-50%, -50%) rotate(${45 * (index + 3.1)}deg) translate(105px) rotate(-${45 * (index + 3.1)}deg)` }" @click="onClick(item.emitEvent)"> {{ item.name }} </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, defineEmits } from 'vue';
const emit = defineEmits(['showColorControl', 'createRoad'])
// 
let controlsList:Array<any> = reactive([{
  icon: '',
  name: 'Color',
  emitEvent: 'showColorControl',
}, {
  icon: '',
  name: 'Wheel',
  emitEvent: '',
}, {
  icon: '',
  name: 'Start',
  emitEvent: 'createRoad', 
}])


const onClick = (emitEvent) => {
  emit(emitEvent)
}

</script>

<style lang="scss">
.interactive-section {
  position: absolute;
  bottom: 10vh;
  right: 5vw;

  .tips {
    color: #000;
    font-weight: bold;
    cursor: pointer;
    width: 120px;
    height: 120px;
    background-color: white;
    border-radius: 50%;
    text-align: center;
    line-height: 120px;
    box-shadow: rgba(0, 0, 0, 0.25) 0px 25px 50px -12px;
  }

  .control-item {
    font-size: 12px;
    width: 50px;
    height: 50px;
    line-height: 50px;
    text-align: center;
    cursor: pointer;
    position: absolute;
    top: 50%;
    left: 50%;
    background: white;
    border-radius: 50%;
    transform: translate(-50%, -50%) rotate(45deg) translate(135px) rotate(-45deg);
    box-shadow: rgba(17, 17, 26, 0.05) 0px 4px 16px, rgba(17, 17, 26, 0.05) 0px 8px 32px;
    transition: all 0.2s linear;
    &:hover {
      color: #000;
      background-color: #ececec;
    }
  }
}
</style>
