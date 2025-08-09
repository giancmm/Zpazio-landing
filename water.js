(function(){
  const canvas = document.getElementById('glCanvas');
  const gl = canvas.getContext('webgl');
  if(!gl) return;

  function resize(){
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    gl.viewport(0,0,gl.drawingBufferWidth, gl.drawingBufferHeight);
  }
  addEventListener('resize', resize);
  resize();

  const vert = `
    attribute vec2 a_pos;
    varying vec2 v_uv;
    void main(){
      v_uv = (a_pos*0.5)+0.5;
      gl_Position = vec4(a_pos, 0.0, 1.0);
    }
  `;

  const frag = `
    precision mediump float;
    varying vec2 v_uv;
    uniform sampler2D u_tex;
    uniform float u_time;
    uniform vec2 u_res;
    uniform vec2 u_mouse;

    float rand(vec2 co){
      return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
    }

    void main(){
      vec2 uv = v_uv;
      float wave = sin(uv.y*20.0 + u_time*2.0)*0.005;
      float wave2 = sin(uv.x*25.0 - u_time*1.5)*0.005;
      float dist = distance(uv, u_mouse/u_res);
      uv.x += wave + wave2 + 0.02*exp(-dist*50.0);
      uv.y += wave - wave2 + 0.02*exp(-dist*50.0);
      gl_FragColor = texture2D(u_tex, uv);
    }
  `;

  function compile(type, src){
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }

  const vs = compile(gl.VERTEX_SHADER, vert);
  const fs = compile(gl.FRAGMENT_SHADER, frag);
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,-1,1,1,-1,1]), gl.STATIC_DRAW);
  const a_pos = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(a_pos);
  gl.vertexAttribPointer(a_pos, 2, gl.FLOAT, false, 0, 0);

  const img = new Image();
  img.src = 'background.jpeg';
  const tex = gl.createTexture();
  img.onload = ()=>{
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    render();
  };

  const u_tex = gl.getUniformLocation(prog, 'u_tex');
  const u_time = gl.getUniformLocation(prog, 'u_time');
  const u_res = gl.getUniformLocation(prog, 'u_res');
  const u_mouse = gl.getUniformLocation(prog, 'u_mouse');

  let mouse = [-1,-1];
  addEventListener('mousemove', e=>{
    mouse = [e.clientX, canvas.height - e.clientY];
  });

  function render(){
    gl.uniform1i(u_tex, 0);
    gl.uniform1f(u_time, performance.now()/1000);
    gl.uniform2f(u_res, canvas.width, canvas.height);
    gl.uniform2f(u_mouse, mouse[0], mouse[1]);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
  }
})();