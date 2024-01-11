<template>
  <main>
    <div id="three"></div>
    <control @showColorControl="onShowColorControl" @createRoad="createRoad" />
    <transition name="fade">
      <colorControl v-if="showColorControl" @selectColor="onSelectColor" />
    </transition>
    <!-- <colorControl @selectColor="onSelectColor" /> -->



    <!--loading-->
    <Loading :progress="modelLoadingProgress" />
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, nextTick } from "vue";
import type { Ref } from 'vue'
import * as TWEEN from '@tweenjs/tween.js'
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { getModelComponent } from '../utils/global'

import colorControl from '../components/color-control/colorControl.vue'
import control from '../components/control/control.vue'
import Loading from '../components/loading/loading.vue'

let showColorControl: Ref<boolean> = ref(false)
const modelLoadingProgress: Ref<number> = ref(0)
let showLoading: Ref<boolean> = ref(true)
// 常量
let camera, scene: THREE.Scene, renderer: THREE.WebGLRenderer, gpsMap: THREE.Texture, model: THREE.Group<THREE.Object3DEventMap>, roadMesh: any
// 环境贴图  
let hdrTexture: THREE.DataTexture;

// 网格辅助线
let GridHelper = new THREE.GridHelper(2000, 10, 0x000000);
GridHelper.position.y = 0;
GridHelper.material.opacity = 0.25;
GridHelper.material.transparent = true;

// 坐标轴辅助线
let AxisHelper = new THREE.AxesHelper(1000); // x轴红色、y轴绿色、z轴蓝色
const TextureLoader = new THREE.TextureLoader();
const rgbeLoader = new RGBELoader();

//
let wiper, activeRequestAnimationFrame: number

//
const doorMap: any = {}
const wheelMap: any = {}

// 初始化
const _init = () => {
  const container = document.createElement("div");
  const target: any = document.getElementById("three");
  target.appendChild(container);
  /**场景配置 */
  scene = new THREE.Scene();
  rgbeLoader.load("./model/taycan/textures/env.hdr", (hdr) => {
    hdr.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = hdr;
    hdrTexture = hdr;
  });
  // scene.background = new THREE.Color('#ffffff')

  scene.add(GridHelper);
  // scene.add(AxisHelper);

  gpsMap = new THREE.TextureLoader().load(
    "./model/taycan/textures/road.jpg"
  );

  gpsMap.wrapS = THREE.RepeatWrapping
  gpsMap.wrapT = THREE.RepeatWrapping

  console.log(gpsMap)

  /**光源配置 */
  // 环境光
  const AmbientLight = new THREE.AmbientLight("#000000", 1);
  scene.add(AmbientLight);

  // 平行光
  const directionalLight = new THREE.DirectionalLight(0x000000, 1);
  directionalLight.position.set(5, 10, 7.5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.set(5000, 5000)
  scene.add(directionalLight); // 将方向光添加到场景

  /* const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight2.position.set(-15, 3, 0);
  scene.add(directionalLight2); */

  //聚光灯
  const sportLight = new THREE.SpotLight(0x000000, 0.8)
  sportLight.angle = Math.PI / 3; //散射角度，跟水平线的夹角
  sportLight.penumbra = 0.1;  // 聚光锥的半影衰减百分比
  sportLight.decay = 2; // 纵向：沿着光照距离的衰减量。 0 / 1.4088 / 0.34358  // -0.000009
  sportLight.distance = 10;
  sportLight.shadow.radius = 10;
  // 阴影映射宽度，阴影映射高度
  sportLight.shadow.mapSize.set(5000, 5000);

  sportLight.position.set(0, 10, -2);
  // 光照射的方向
  sportLight.target.position.set(0, 0, 0);
  sportLight.castShadow = true; //开启阴影
  // scene.add(sportLight);

  /**创建相机 */
  camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.25,
    20
  );
  camera.position.set(3.5, 1.3, 2.3); //(3.5, 1.3, 2.3); // x, y, z

  /**模型加载/配置 */
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("./roadSter/draco/gltf/");
  const loader = new GLTFLoader().setPath("./model/taycan/"); // 加载器
  loader.setDRACOLoader(dracoLoader);

  loader.load(
    "editing.glb",
    async (gltf) => {
      model = gltf.scene;

      model.traverse((obj: any) => {
        // console.log(obj)
        obj.castShadow = true;
        obj.receiveShadow = true;
        if (obj.isMesh && obj.name.includes('glass')) {
          obj.material.envMap = hdrTexture
          obj.material.envMapIntensity = 0.3
          obj.material.transparent = true
          obj.material.opacity = 0.75
          /* obj.material.clearcoat= 1.0
          obj.material.clearcoatRoughness= 0.03*/
        }

        if (obj.isMesh && obj.name.includes('light_back_shade')) {
          obj.material.transparent = true
          obj.material.opacity = 0.6
        }

        if (obj.isMesh && obj.name.includes('light_shade')) {
          obj.material.envMap = hdrTexture
          obj.material.envMapIntensity = 0.3
          obj.material.transparent = true
          obj.material.opacity = 0.5
        }

        if (obj.name.includes('wheel_') && obj.isGroup) {
          wheelMap[obj.name] = obj
        }

        if (obj.name.includes('door_') && obj.isGroup) {
          doorMap[obj.name] = obj
        }
      });
      scene.add(model);

      render()
    },
    async (progress) => {
      // 模型加载进度
      const { loaded, total, lengthComputable } = progress
      if (lengthComputable) {
        if (modelLoadingProgress.value == 100) return
        modelLoadingProgress.value = Math.floor((loaded / total) * 100)
        // console.log(modelLoadingProgress.value, total, loaded, progress)
      }

      // console.warn('model loading', modelLoadingProgress.value)
    }
  );

  /**渲染器配置 */
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setClearColor(0xffffff, 1);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  /**操作仪 旋转 转动 */
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.addEventListener("change", render);
  controls.enableDamping = true
  controls.dampingFactor = 0.3 //阻尼系数
  controls.minDistance = 5
  controls.maxDistance = 7
  controls.maxPolarAngle = Math.PI / 2.5
  controls.update();

  createFloor();
  // createRoad();
  window.addEventListener("resize", onWindowResize);
  window.addEventListener("click", onClickWindow)
  // render()
};


/**创建基础地板 */
const createFloor = () => {
  const floorGeometry = new THREE.PlaneGeometry(200, 200);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xd1d1d1,
    side: THREE.DoubleSide,
    metalness: 0,
    roughness: 0.1
  });
  const floorMesh = new THREE.Mesh(floorGeometry, material);
  floorMesh.rotation.x = Math.PI / 2;
  floorMesh.receiveShadow = true;
  floorMesh.position.set(0, -0.02, 0)
  scene.add(floorMesh);
};

/**创建道路 */
const createRoad = () => {
  if(showColorControl.value) showColorControl.value = false
  const roadGeometry = new THREE.PlaneGeometry(10, 5); // x, 7
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    metalness: 0,
    roughness: 1
  });
  roadMesh = new THREE.Mesh(roadGeometry, material);
  roadMesh.material.map = gpsMap
  roadMesh.material.needsUpdate = true;
  // roadMesh.material.envMap = gpsMap
  roadMesh.rotation.x = Math.PI / 2;
  roadMesh.rotation.z = Math.PI / 2

  roadMesh.receiveShadow = true;
  roadMesh.position.set(0, -0.01, 0)
  scene.add(roadMesh);

  let duration = 3000
  let tween = new TWEEN.Tween(gpsMap.offset)
    .to({ x: gpsMap.offset.x + 3 }, duration)
    .easing(TWEEN.Easing.Linear.None).start().onComplete(() => {
      removeAllAnimate()
    });
  wheelRotate(duration)
  animate(duration)


  /* gpsMap.offset.x -= 0.06
  animate(1000) */
}

const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

/**车轮动画 */
const wheelRotate = (duration: number) => {
  Object.keys(wheelMap).map(e => {
    let tween = new TWEEN.Tween(wheelMap[e].rotation)
      .to({ x: wheelMap[e].rotation.x + Math.PI * 5 }, duration)
      .easing(TWEEN.Easing.Linear.None).start().onComplete(() => {
        removeAllAnimate()
        if (roadMesh) {
          scene.remove(roadMesh)
          console.log(roadMesh)
          roadMesh.geometry.dispose();
          roadMesh.material.dispose();
          roadMesh = undefined;
          TWEEN.removeAll()
        }
      });
  })
  // animate(duration)
}

const onClickWindow = (event: any) => {
  const result = getModelComponent({ event, scene, camera })
  if (!result.length) return
  let isDoor = false, doorTargetName = ''

  if (result[0].object.name.includes('door_L_f')) {
    isDoor = true
    doorTargetName = 'door_L_f'
  }

  if (result[0].object.name.includes('door_L_r')) {
    isDoor = true
    doorTargetName = 'door_L_r'
  }

  if (result[0].object.name.includes('door_R_f')) {
    isDoor = true
    doorTargetName = 'door_R_f'
  }

  if (result[0].object.name.includes('door_R_r')) {
    isDoor = true
    doorTargetName = 'door_R_r'
  }

  if (isDoor) {
    if (doorMap[doorTargetName].isOpen) {
      closeDoor(doorTargetName)
    } else {
      openDoor(doorTargetName)
    }
  }

}

const render = () => {
  TWEEN.update()
  renderer.render(scene, camera);
};

const animate = (duration: number) => {
  render()
  activeRequestAnimationFrame = requestAnimationFrame(animate)
  console.log('rrrr')
}

/**更换车漆 */
const onSelectColor = (color: string) => {
  console.log(`更换颜色： ${color}`)
  model.traverse((obj: any) => {
    if (obj.name.includes('paint') && obj.isMesh) {
      obj.material.color = new THREE.Color(color)
    }
  })
  render()
}

/**打开车门 */
const openDoor = (doorName: string) => {
  const duration = 300
  let tween = new TWEEN.Tween(doorMap[doorName].rotation)
    .to({ y: -Math.PI / 4 }, duration)
    .easing(TWEEN.Easing.Elastic.Out).start().onComplete(() => {
      doorMap[doorName].isOpen = true
      removeAllAnimate()
    });
  animate(duration)
}

/**清除动画 */
const removeAllAnimate = () => {
  setTimeout(() => {
    cancelAnimationFrame(activeRequestAnimationFrame)
  }, 0)
}

/**关闭车门 */
const closeDoor = (doorName: string) => {
  const duration = 300
  let tween = new TWEEN.Tween(doorMap[doorName].rotation)
    .to({ y: 0 }, duration)
    .easing(TWEEN.Easing.Cubic.Out).start().onComplete(() => {
      doorMap[doorName].isOpen = false
      removeAllAnimate()
    });
  animate(duration)
}

/**事件绑定 */
const onShowColorControl = () => {
  showColorControl.value = !showColorControl.value
}


onMounted(() => {
  _init();

  /* nextTick(() => {
    console.log('next tick')
    
  }) */
});
</script>