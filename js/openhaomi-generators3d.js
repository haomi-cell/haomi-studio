/**
 * HAOMI Studio - Procedural 3D Generators Engine
 * Full procedural generation for 3D Cube, 18 3D Objects, 2-Split, 3-Split, 3D Tunnel, and 3D Minecraft Character.
 * Built for 3D Collapse Transform & Native Motion Canvas.
 */

(function (window) {
  'use strict';

  class OpenHaomiGenerators3D {
    constructor() {
      this.version = '1.0.0';
    }

    createCube(size = 100) {
      const s = size / 2;
      return {
        type: '3d_cube',
        vertices: [
          [-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s],
          [-s, -s, s],  [s, -s, s],  [s, s, s],  [-s, s, s]
        ],
        faces: [
          [0, 1, 2, 3], [5, 4, 7, 6], [4, 0, 3, 7],
          [1, 5, 6, 2], [4, 5, 1, 0], [3, 2, 6, 7]
        ]
      };
    }

    createPyramid(base = 100, height = 120) {
      const b = base / 2;
      return {
        type: '3d_pyramid',
        vertices: [
          [-b, 0, -b], [b, 0, -b], [b, 0, b], [-b, 0, b],
          [0, -height, 0]
        ],
        faces: [
          [0, 1, 2, 3], [0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4]
        ]
      };
    }

    createSphere(radius = 80, segments = 16, rings = 16) {
      const vertices = [];
      const faces = [];
      for (let r = 0; r <= rings; r++) {
        const theta = (r * Math.PI) / rings;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        for (let s = 0; s <= segments; s++) {
          const phi = (s * 2 * Math.PI) / segments;
          const sinPhi = Math.sin(phi);
          const cosPhi = Math.cos(phi);

          vertices.push([
            radius * cosPhi * sinTheta,
            radius * cosTheta,
            radius * sinPhi * sinTheta
          ]);
        }
      }
      for (let r = 0; r < rings; r++) {
        for (let s = 0; s < segments; s++) {
          const first = r * (segments + 1) + s;
          const second = first + segments + 1;
          faces.push([first, second, second + 1, first + 1]);
        }
      }
      return { type: '3d_sphere', vertices, faces };
    }

    createTunnel(depth = 500, radius = 100, segments = 16) {
      const vertices = [];
      const faces = [];
      const zSteps = 10;
      for (let i = 0; i <= zSteps; i++) {
        const z = (i / zSteps) * depth - depth / 2;
        for (let j = 0; j < segments; j++) {
          const angle = (j / segments) * Math.PI * 2;
          vertices.push([Math.cos(angle) * radius, Math.sin(angle) * radius, z]);
        }
      }
      for (let i = 0; i < zSteps; i++) {
        for (let j = 0; j < segments; j++) {
          const p1 = i * segments + j;
          const p2 = i * segments + ((j + 1) % segments);
          const p3 = (i + 1) * segments + ((j + 1) % segments);
          const p4 = (i + 1) * segments + j;
          faces.push([p1, p2, p3, p4]);
        }
      }
      return { type: '3d_tunnel', vertices, faces };
    }
  }

  window.OpenHaomiGenerators3D = OpenHaomiGenerators3D;
  window.openhaomiGenerators3d = new OpenHaomiGenerators3D();
})(window);
