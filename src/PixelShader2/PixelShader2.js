/**
 * @author Eric NICOLAS (ccjmne) <ccjmne@gmail.com>
 *
 * Pixelation shader w/ spacing.
 */

const PixelShader2 = {

  uniforms: {
    tDiffuse: { value: null },
    resolution: { value: null },
    pixelSize: { type: 'float', value: 16.0 },
    gapSize: { type: 'float', value: 4.0 },
  },

  vertexShader: `
    varying highp vec2 vUV;

    void main() {
      vUV = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,

  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float pixelSize;
    uniform float gapSize;
    uniform vec2 resolution;

    varying highp vec2 vUV;

    void main() {
      vec2 dXY = pixelSize / resolution;
      vec2 gridXY = (pixelSize + gapSize) / resolution;

      // squares
      if(all(lessThan(mod(vUV, gridXY), dXY))) {
        vec2 coord = gridXY * (0.5 + floor(vUV / gridXY));
        gl_FragColor = texture2D(tDiffuse, coord);
      }
    }`,
};

export { PixelShader2 };
