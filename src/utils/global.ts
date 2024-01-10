import * as THREE from "three";
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

interface params {
  event: any
  scene: THREE.Scene
  camera: any
}

export function getModelComponent(params: params):Array {
  const { event, scene, camera, target } = params
  //计算鼠标点击位置
  event.preventDefault();

  //转换为webgl坐标系下的鼠标位置
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  //从相机发射一条经过鼠标点击位置的射线
  raycaster.setFromCamera(mouse, camera);

  //计算射线和模型的交点
  return raycaster.intersectObjects(scene.children, true);
  //如果有交点，则执行相应操作
  
}
