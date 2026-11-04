import { buildBPrism } from "@/lib/recovered-b-prism-geometry";

export interface PrismRenderer { draw: (x: number, y: number, charge: number) => void; dispose: () => void; vertices: number; setLighting?: (x: number, y: number) => void; }

/** One small mesh, one draw call, no textures, dependencies, shadows or render loop. */
export function createPrismRenderer(canvas: HTMLCanvasElement): PrismRenderer | null {
  const gl = canvas.getContext("webgl", { alpha: true, antialias: true, powerPreference: "low-power", preserveDrawingBuffer: false });
  if (!gl) return null;
  const shaders: WebGLShader[] = [];
  let program: WebGLProgram | null = null;
  let buffer: WebGLBuffer | null = null;
  try {
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type); if (!shader) throw Error("PRISM_SHADER");
      shaders.push(shader); gl.shaderSource(shader, source); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw Error("PRISM_SHADER_COMPILE");
      return shader;
    };
    const vertex = compile(gl.VERTEX_SHADER, `
      attribute vec3 position; attribute vec3 normal; attribute float material;
      uniform vec2 rotation; uniform float aspect;
      varying vec3 vNormal; varying vec3 vPosition; varying float vMaterial;
      void main(){
        float cx=cos(rotation.x),sx=sin(rotation.x),cy=cos(rotation.y),sy=sin(rotation.y);
        mat3 rx=mat3(1.,0.,0.,0.,cx,sx,0.,-sx,cx);
        mat3 ry=mat3(cy,0.,-sy,0.,1.,0.,sy,0.,cy); mat3 model=ry*rx;
        vec3 p=model*position; vPosition=p;vNormal=model*normal;vMaterial=material;
        float z=4.5-p.z; float scale=2.15;
        gl_Position=vec4(p.x*scale/aspect,p.y*scale,1.01*z-.201,z);
      }`);
    const fragment = compile(gl.FRAGMENT_SHADER, `
      precision mediump float; varying vec3 vNormal;varying vec3 vPosition;varying float vMaterial;
      uniform float charge; uniform vec2 pointerLight;
      void main(){
        vec3 n=normalize(vNormal); if(!gl_FrontFacing)n=-n;
        vec3 eye=normalize(vec3(0.,0.,4.5)-vPosition);
        vec3 l=normalize(vec3(-1.5+pointerLight.x*3.,2.5-pointerLight.y*2.,3.));vec3 rim=normalize(vec3(2.,.5,-1.));
        float diffuse=max(dot(n,l),0.);float edge=pow(1.-abs(dot(n,eye)),2.);
        float spec=pow(max(dot(reflect(-l,n),eye),0.),28.);
        vec3 glass=vec3(.025,.07,.14);vec3 metal=vec3(.20,.39,.55);
        vec3 base=vMaterial<.5?glass:(vMaterial<1.5?metal:vec3(.018,.04,.09));
        vec3 color=base*(.6+diffuse*1.4)+spec*vec3(.72,.90,1.)*.8;
        color+=edge*vec3(.08,.57,.85)*(.4+charge*1.4);
        color+=max(dot(n,rim),0.)*vec3(.12,.06,.24)*.8;
        float band=pow(max(0.,1.-abs(vPosition.y-(charge*3.-1.5))*2.),4.);
        color+=charge*(vec3(.03,.24,.40)+band*vec3(.12,.7,1.)*.65);
        gl_FragColor=vec4(color,1.);
      }`);
    program = gl.createProgram(); if (!program) throw Error("PRISM_PROGRAM");
    gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw Error("PRISM_LINK");
    gl.useProgram(program); buffer = gl.createBuffer(); if (!buffer) throw Error("PRISM_BUFFER");
    const mesh = buildBPrism(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, mesh, gl.STATIC_DRAW);
    for (const [name, size, offset] of [["position", 3, 0], ["normal", 3, 12], ["material", 1, 24]] as const) {
      const attribute = gl.getAttribLocation(program, name); gl.enableVertexAttribArray(attribute); gl.vertexAttribPointer(attribute, size, gl.FLOAT, false, 28, offset);
    }
    const rotation = gl.getUniformLocation(program, "rotation"), aspect = gl.getUniformLocation(program, "aspect"), charge = gl.getUniformLocation(program, "charge");
    gl.enable(gl.DEPTH_TEST); gl.clearColor(0, 0, 0, 0);
    let disposed = false, lightX = 0, lightY = 0;
    const pointerLight = gl.getUniformLocation(program, "pointerLight");
    return {
      vertices: mesh.length / 7,
      setLighting(x,y) { lightX=Math.max(-.5,Math.min(.5,x));lightY=Math.max(-.5,Math.min(.5,y)); },
      draw(x, y, energy) {
        if (disposed || gl.isContextLost()) return;
        const rect = canvas.getBoundingClientRect(); const dpr = Math.min(devicePixelRatio || 1, innerWidth < 768 ? 1.25 : 1.75);
        const width = Math.max(1, Math.round(rect.width * dpr)), height = Math.max(1, Math.round(rect.height * dpr));
        if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
        gl.viewport(0, 0, width, height); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); gl.useProgram(program);
        gl.uniform2f(rotation, x, y); gl.uniform1f(aspect, width / height); gl.uniform1f(charge, energy); gl.uniform2f(pointerLight,lightX,lightY);
        gl.drawArrays(gl.TRIANGLES, 0, mesh.length / 7);
      },
      dispose() { if (disposed) return; disposed = true; gl.deleteBuffer(buffer); gl.deleteProgram(program); shaders.forEach(shader => gl.deleteShader(shader)); },
    };
  } catch {
    if (buffer) gl.deleteBuffer(buffer); if (program) gl.deleteProgram(program); shaders.forEach(shader => gl.deleteShader(shader)); return null;
  }
}
