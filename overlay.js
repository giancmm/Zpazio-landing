// overlay.js — FIX ORIENTACIÓN: subimos la imagen al WebGL desde un canvas 2D (respeta EXIF)
// Además: 'cover' al tamaño de la ventana, agua fluida, menú y cursor intactos.

/* ---------------- Menú ---------------- */
document.addEventListener('DOMContentLoaded', ()=>{
  const menu = document.getElementById('menu');
  const toggle = document.getElementById('menu-toggle');
  const scrim = document.getElementById('menu-scrim');
  if (menu && toggle){
    const openMenu = ()=>{ menu.classList.add('open'); document.body.classList.add('menu-open'); toggle.setAttribute('aria-expanded','true'); };
    const closeMenu = ()=>{ menu.classList.remove('open'); document.body.classList.remove('menu-open'); toggle.setAttribute('aria-expanded','false'); };
    toggle.addEventListener('click', (e)=>{ e.stopPropagation(); menu.classList.contains('open') ? closeMenu() : openMenu(); });
    if (scrim) scrim.addEventListener('click', closeMenu);
    document.addEventListener('click', (e)=>{ if (!menu.contains(e.target) && !toggle.contains(e.target)) closeMenu(); });
    document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') closeMenu(); });
  }
});

/* -------------- Cursor Bombilla con fallback -------------- */
(function(){
  const bulb = document.getElementById('cursor-bulb');
  if (!bulb) return;
  const img = bulb.querySelector('img');
  if (img){
    img.addEventListener('error', ()=>{ if (!img.__triedFallback){ img.__triedFallback = true; img.src = 'bombilla.jpeg'; } });
  }
  window.addEventListener('mousemove',(e)=>{
    bulb.style.transform = `translate(${e.clientX+12}px, ${e.clientY+12}px)`;
  });
  window.addEventListener('click', ()=>{ bulb.classList.add('on'); setTimeout(()=> bulb.classList.remove('on'), 320); });
})();

/* --------- Agua: WebGL con textura desde canvas 2D (EXIF corregido) + fallback 2D --------- */
(function(){
  let canvas = document.getElementById('bgCanvas');
  if (!canvas){
    canvas = document.createElement('canvas');
    canvas.id = 'bgCanvas';
    Object.assign(canvas.style, { position:'fixed', inset:'0', zIndex:'0', display:'block' });
    document.body.prepend(canvas);
  }

  // util: draw image with CSS-like 'cover' into a target canvas
  function drawCoverToCanvas(target, img){
    const tw = target.width, th = target.height;
    const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    const ir = iw/ih, tr = tw/th;
    let dw, dh, dx, dy;
    if (ir > tr){ dh = th; dw = dh*ir; dx = (tw-dw)/2; dy = 0; }
    else { dw = tw; dh = dw/ir; dx = 0; dy = (th-dh)/2; }
    const ctx = target.getContext('2d');
    ctx.clearRect(0,0,tw,th);
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  function start2D(img){
    const ctx = canvas.getContext('2d');
    function resize2D(){ canvas.width = innerWidth; canvas.height = innerHeight; if (img) drawCoverToCanvas(canvas, img); }
    window.addEventListener('resize', resize2D); resize2D();
    if (img) drawCoverToCanvas(canvas, img);
  }

  // Carga la imagen una vez
  const baseImg = new Image();
  baseImg.src = 'background.jpg';
  baseImg.onload = ()=> initGL(baseImg);
  baseImg.onerror = ()=> start2D(null);

  function initGL(img){
    let gl = null;
    try{ gl = canvas.getContext('webgl', { antialias:true, alpha:false }); }catch(e){ gl=null; }
    if (!gl){ start2D(img); return; }

    function resizeGL(){
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio||1));
      canvas.width = Math.floor(innerWidth*dpr);
      canvas.height = Math.floor(innerHeight*dpr);
      canvas.style.width = innerWidth+'px';
      canvas.style.height = innerHeight+'px';
      gl.viewport(0,0,canvas.width,canvas.height);
      // al cambiar tamaño, re-subimos la textura para mantener 'cover'
      uploadTextureCover();
    }
    window.addEventListener('resize', resizeGL);

    const VERT = `attribute vec2 a_pos; varying vec2 v_uv;
      void main(){ v_uv=(a_pos*0.5)+0.5; gl_Position=vec4(a_pos,0.0,1.0); }`;

    const NOISE = `
    vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
    vec2 mod289(vec2 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
    vec3 permute(vec3 x){ return mod289(((x*34.0)+1.0)*x); }
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
      vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0); m=m*m; m=m*m;
      vec3 x = 2.0*fract(p*0.024390243902439) - 1.0; vec3 h = abs(x) - 0.5; vec3 ox = floor(x+0.5); vec3 a0 = x-ox;
      m *= 1.79284291400159 - 0.85373472095314*(a0*a0 + h*h);
      vec3 g; g.x = a0.x*x0.x + h.x*x0.y; g.yz = a0.yz*x12.xz + h.yz*x12.yw;
      return 130.0*dot(m,g);
    }`;

    const FRAG = `precision mediump float; varying vec2 v_uv;
      uniform sampler2D u_tex; uniform vec2 u_res; uniform float u_time; uniform vec2 u_mouse;
      ${NOISE}
      void main(){
        vec2 uv = v_uv; // ya viene corregido (canvas 2D respeta EXIF)
        vec2 f1 = vec2(snoise(uv*2.2 + vec2(u_time*0.05, u_time*0.04)),
                       snoise(uv*2.2 - vec2(u_time*0.04, u_time*0.05)));
        vec2 f2 = vec2(snoise(uv*4.0 + vec2(u_time*0.03, -u_time*0.02)),
                       snoise(uv*4.0 + vec2(-u_time*0.02, u_time*0.03)));
        vec2 flow = f1*0.012 + f2*0.008;
        vec2 mouseUV = u_mouse / u_res;
        float hasMouse = step(0.0, u_mouse.x);
        float d = distance(uv, mouseUV);
        vec2 wake = normalize(uv - mouseUV + 1e-5) * (exp(-d*35.0)*0.03) * hasMouse;
        vec2 disp = flow + wake;
        gl_FragColor = texture2D(u_tex, uv + disp);
      }`;

    function compile(t, src){
      const s = gl.createShader(t); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)){ console.error(gl.getShaderInfoLog(s)); throw new Error('shader'); }
      return s;
    }
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram(); gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)){ console.error(gl.getProgramInfoLog(prog)); start2D(img); return; }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,-1, 1,1, -1,1]), gl.STATIC_DRAW);
    const a_pos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(a_pos);
    gl.vertexAttribPointer(a_pos, 2, gl.FLOAT, false, 0, 0);

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // usamos un canvas 2D intermedio que respeta EXIF y hace 'cover'
    const texCanvas = document.createElement('canvas');
    function uploadTextureCover(){
      texCanvas.width = canvas.width;
      texCanvas.height = canvas.height;
      drawCoverToCanvas(texCanvas, img); // EXIF fixed por el 2D
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texCanvas);
    }

    // uniforms
    const u_tex = gl.getUniformLocation(prog, 'u_tex');
    const u_time = gl.getUniformLocation(prog, 'u_time');
    const u_res = gl.getUniformLocation(prog, 'u_res');
    const u_mouse = gl.getUniformLocation(prog, 'u_mouse');

    let mouse = [-1,-1];
    window.addEventListener('mousemove', (e)=>{
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width/rect.width);
      const y = (e.clientY - rect.top) * (canvas.height/rect.height);
      mouse = [x, y];
    });

    function render(){
      gl.clearColor(0,0,0,1); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1i(u_tex, 0);
      gl.uniform1f(u_time, performance.now()/1000);
      gl.uniform2f(u_res, canvas.width, canvas.height);
      gl.uniform2f(u_mouse, mouse[0], mouse[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      requestAnimationFrame(render);
    }

    // primera carga
    resizeGL();
    render();
  }
})();