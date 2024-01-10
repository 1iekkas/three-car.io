import * as THREE from 'three'
const loader = new THREE.TextureLoader()
let bodyTexture
bodyTexture = loader.load('../../publice/model/textures/body.jpg', (c) => {
  
})

interface glassConfig {
  color: any,
  opacity?: number,
  envMap?: THREE.DataTexture
}  

interface bodyConfig {
  color: number | string,
  envMap: THREE.DataTexture
}

export function tyreMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#000"),
    roughness: 0.7
  })
}

export function windowGlassMaterial(config: glassConfig) {
  return new THREE.MeshPhongMaterial({
    color: config.color,
    transparent: true,
    opacity: config.opacity, 
    shininess: 15,
    specular: 0xffffff,
    envMap: config.envMap, 
    emissiveIntensity: 0.3,
  });
}

export function bodyMaterial(config: bodyConfig) {
  return new THREE.MeshPhysicalMaterial({
    color: config.color, 
    metalness: 0.44, 
    roughness: 0, 
    clearcoat: 1.0, 
    clearcoatRoughness: 0.03, 
    sheen: 0.5, 
    envMapIntensity: 0.15, 
    envMap: config.envMap,
    transparent: true,
    opacity: 1
  });
}

export function roofMaterial(color?: any) {
  return new THREE.MeshPhysicalMaterial({
    color: 0x000000, 
    metalness: 0.44, 
    roughness: 0, 
    clearcoat: 1.0, 
    clearcoatRoughness: 0.03, 
    sheen: 0.5, 
    envMapIntensity: 0.1,
    transparent: true,
    opacity: 0
  });
}

export function ornamentsMaterial(color?: any) {
  return new THREE.MeshPhysicalMaterial({
    color: 0x000000, metalness: 1.0, roughness: 0.5, clearcoat: 1.0, clearcoatRoughness: 0.03, sheen: 0.5, envMapIntensity: 0.1
  });
}

export function tireSideMaterial() {
  return new THREE.MeshStandardMaterial({
    color: 0x000000, metalness: 0.44, roughness: 0.5, envMapIntensity: 0.1
  });
}

export function tireOtherMaterial() {
  return new THREE.MeshStandardMaterial({
    color: 0x730505, metalness: 0.3, roughness: 0.5, envMapIntensity: 0.1
  });
}

export function logoMaterial() {
  return new THREE.MeshStandardMaterial({
    color: 0xffffff, metalness: 1.0, roughness: 0, envMapIntensity: 0
  });
}

export function carLightGlassMaterial(envMap: THREE.DataTexture) {
  return new THREE.MeshPhysicalMaterial({
    color: 0xffffff, metalness: 0.25, roughness: 0, transmission: 1.0, envMapIntensity: 0.1
  })

  /* return new THREE.MeshPhongMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.5,
    shininess: 35, // 光泽度
    envMap: envMap,
    envMapIntensity: 0.05
    // specular: 0xffffff, // 镜面反射颜色
  }); */
}