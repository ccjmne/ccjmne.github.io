import { Uniform } from 'three';

export const PixelShader2: {
  uniforms: {
    tDiffuse: Uniform;
    resolution: Uniform;
    pixelSize: Uniform;
    gapSize: Uniform;
  };

  vertexShader: string;
  fragmentShader: string;
};
