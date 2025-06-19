// earth.js
import * as THREE from "three";
import earthVertexShader from "./shaders/earth/vertex.glsl";
import earthFragmentShader from "./shaders/earth/fragment.glsl";
import atmosphereVertexShader from "./shaders/atmosphere/vertex.glsl";
import atmosphereFragmentShader from "./shaders/atmosphere/fragment.glsl";

export function createEarth(textureLoader, sunDirection, gui, moonMaterial) {
  const earthDayTexture = textureLoader.load("./earth/day.jpg");
  earthDayTexture.colorSpace = THREE.SRGBColorSpace;
  earthDayTexture.anisotropy = 8;

  const earthNightTexture = textureLoader.load("./earth/night.jpg");
  earthNightTexture.colorSpace = THREE.SRGBColorSpace;
  earthNightTexture.anisotropy = 8;

  const earthSpecularCloudsTexture = textureLoader.load(
    "./earth/specularClouds.jpg"
  );
  earthSpecularCloudsTexture.anisotropy = 8;

  const earthParameters = {
    atmosphereDayColor: "#00aaff",
    atmosphereTwiLightColor: "#ff6600",
  };

  const earthMaterial = new THREE.ShaderMaterial({
    vertexShader: earthVertexShader,
    fragmentShader: earthFragmentShader,
    uniforms: {
      uDayTexture: { value: earthDayTexture },
      uNightTexture: { value: earthNightTexture },
      uSpecularCloudsTexture: { value: earthSpecularCloudsTexture },
      uSunDirection: { value: sunDirection.clone() },
      uAtmosphereDayColor: {
        value: new THREE.Color(earthParameters.atmosphereDayColor),
      },
      uAtmosphereTwiLightColor: {
        value: new THREE.Color(earthParameters.atmosphereTwiLightColor),
      },
    },
  });

  const atmosphereMaterial = new THREE.ShaderMaterial({
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentShader,
    uniforms: {
      uSunDirection: { value: sunDirection.clone() },
      uAtmosphereDayColor: {
        value: new THREE.Color(earthParameters.atmosphereDayColor),
      },
      uAtmosphereTwiLightColor: {
        value: new THREE.Color(earthParameters.atmosphereTwiLightColor),
      },
    },
    side: THREE.BackSide,
    transparent: true,
  });

  // GUI
  gui.addColor(earthParameters, "atmosphereDayColor").onChange((value) => {
    earthMaterial.uniforms.uAtmosphereDayColor.value.set(value);
    atmosphereMaterial.uniforms.uAtmosphereDayColor.value.set(value);
  });

  gui.addColor(earthParameters, "atmosphereTwiLightColor").onChange((value) => {
    earthMaterial.uniforms.uAtmosphereTwiLightColor.value.set(value);
    atmosphereMaterial.uniforms.uAtmosphereTwiLightColor.value.set(value);
  });

  return { earthMaterial, atmosphereMaterial };
}
