/**
 * @author Eric NICOLAS (ccjmne) <ccjmne@gmail.com>
 *
 * Pixelation shader where pixels are hexagonal. Supports optional w/ spacing.
 */

const HexPixelShader = {

  uniforms: {
    tDiffuse: { value: null },
    resolution: { value: null },
    pixelSize: { type: 'float', value: 12.0 },
    gapSize: { type: 'float', value: 2.0 },
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
      vec2 cartesianGridCellRatio = vec2(1, 3. / sqrt(3.));

      vec2 dXY = pixelSize / resolution * cartesianGridCellRatio;
      vec4 idx = floor(vec4(vUV, vUV - dXY / 2.) / dXY.xyxy);
      vec4 ctr = (idx + vec4(.5, .5, 1., 1.)) * dXY.xyxy;
      vec4 dst = (vUV.xyxy - ctr) * resolution.xyxy;

      if(gapSize == 0.) {
        gl_FragColor = texture2D(tDiffuse, length(dst.xy) < length(dst.zw) ? ctr.xy : ctr.zw);
      } else if(abs(length(dst.xy) - length(dst.zw)) > gapSize) { // oblique gaps
        if(length(dst.xy) < length(dst.zw)) {
          if(length(dot(dst.xy, vec2(1., 0.))) < (pixelSize - gapSize) / 2.) { // vertical gaps
            gl_FragColor = texture2D(tDiffuse, ctr.xy);
          }
        } else if(length(dot(dst.zw, vec2(1., 0.))) < (pixelSize - gapSize) / 2.) { // vertical gaps
          gl_FragColor = texture2D(tDiffuse, ctr.zw);
        }
      }
    }`,
};

export { HexPixelShader };
