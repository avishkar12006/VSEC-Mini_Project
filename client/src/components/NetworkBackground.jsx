import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../profile.js';

const BG_KEY = 'avi-bg-visible';

export default function NetworkBackground() {
  const canvasRef = useRef(null);
  const [visible, setVisible] = useState(() => {
    try { return sessionStorage.getItem(BG_KEY) !== '0'; } catch { return true; }
  });

  // Listen for toggle events from terminal `bg` command
  useEffect(() => {
    const onToggle = (e) => {
      const next = e.detail ?? !visible;
      setVisible(next);
      try { sessionStorage.setItem(BG_KEY, next ? '1' : '0'); } catch { /* blocked */ }
    };
    window.addEventListener('toggle-bg', onToggle);
    return () => window.removeEventListener('toggle-bg', onToggle);
  }, [visible]);

  // Expose current state for terminal query
  useEffect(() => {
    window.__bgVisible = visible;
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let running = true;
    let lastFrame = 0;
    const INTERVAL = 1000 / 30;
    const EDGE_DIST = 160;
    const HOVER_DIST = 140;
    const PACKET_COUNT_MIN = 12;
    const PACKET_COUNT_MAX = 18;

    // Cap DPR at 1.5 for performance
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let mouse = { x: -9999, y: -9999 };

    // Read CSS variable colors from computed styles
    const getColor = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { w, h };
    };

    let { w, h } = resize();

    // Generate nodes
    const nodeCount = () => Math.max(24, Math.min(70, Math.floor((w * h) / 20000)));
    let nodes = [];
    const initNodes = () => {
      const count = nodeCount();
      nodes = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 6,  // under 8px/s total speed
        vy: (Math.random() - 0.5) * 6,
        idx: i
      }));
    };
    initNodes();

    // Packets
    let packets = [];
    const initPacket = () => {
      const from = Math.floor(Math.random() * nodes.length);
      // Find a connected neighbor
      const neighbors = [];
      for (let j = 0; j < nodes.length; j++) {
        if (j === from) continue;
        const dx = nodes[from].x - nodes[j].x;
        const dy = nodes[from].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < EDGE_DIST) neighbors.push(j);
      }
      if (neighbors.length === 0) return null;
      const to = neighbors[Math.floor(Math.random() * neighbors.length)];
      return { from, to, t: 0, speed: 0.3 + Math.random() * 0.5, trail: [] };
    };

    const fillPackets = () => {
      const target = PACKET_COUNT_MIN + Math.floor(Math.random() * (PACKET_COUNT_MAX - PACKET_COUNT_MIN));
      while (packets.length < target) {
        const p = initPacket();
        if (p) packets.push(p);
        else break;
      }
    };
    if (!prefersReducedMotion()) fillPackets();

    const reduced = prefersReducedMotion();

    // Draw one static frame for reduced motion
    const drawStatic = () => {
      const lineColor = getColor('--line');
      const dimColor = getColor('--dim');
      const bgColor = getColor('--bg');
      ctx.clearRect(0, 0, w, h);

      // Vignette using bg color at edges
      const grad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.8);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(1, bgColor);
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;

      // Edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < EDGE_DIST) {
            const alpha = 0.08 + (1 - dist / EDGE_DIST) * 0.14;
            ctx.strokeStyle = lineColor;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Nodes
      ctx.globalAlpha = 0.20;
      ctx.fillStyle = dimColor;
      for (const node of nodes) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    if (reduced) {
      drawStatic();
      return;
    }

    // Animation loop
    const draw = (now) => {
      if (!running) return;
      animId = requestAnimationFrame(draw);
      if (document.hidden) return;
      if (now - lastFrame < INTERVAL) return;
      lastFrame = now;

      const dt = INTERVAL / 1000;
      const lineColor = getColor('--line');
      const dimColor = getColor('--dim');
      const mintColor = getColor('--mint');
      const bgColor = getColor('--bg');

      ctx.clearRect(0, 0, w, h);

      // Vignette using bg color at edges
      const grad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.8);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(1, bgColor);
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;

      // Move nodes
      for (const node of nodes) {
        node.x += node.vx * dt;
        node.y += node.vy * dt;
        // Wrap at edges
        if (node.x < 0) node.x += w;
        if (node.x > w) node.x -= w;
        if (node.y < 0) node.y += h;
        if (node.y > h) node.y -= h;
      }

      // Edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < EDGE_DIST) {
            const alpha = 0.08 + (1 - dist / EDGE_DIST) * 0.14;
            ctx.strokeStyle = lineColor;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Nodes
      for (const node of nodes) {
        const dx = node.x - mouse.x;
        const dy = node.y - mouse.y;
        const distToMouse = Math.sqrt(dx * dx + dy * dy);
        const nearMouse = distToMouse < HOVER_DIST;

        ctx.globalAlpha = nearMouse ? 0.55 : 0.20;
        ctx.fillStyle = nearMouse ? mintColor : dimColor;
        ctx.beginPath();
        ctx.arc(node.x, node.y, nearMouse ? 2.5 : 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Hover label: decorative IP-like address from node index
        if (nearMouse) {
          ctx.globalAlpha = 0.4;
          ctx.fillStyle = dimColor;
          ctx.font = '10px monospace';
          const label = `10.0.${Math.floor(node.idx / 16)}.${(node.idx % 256)}`;
          ctx.fillText(label, node.x + 6, node.y - 6);
        }
      }

      // Packets
      fillPackets();
      const nextPackets = [];
      for (const pkt of packets) {
        const fromNode = nodes[pkt.from];
        const toNode = nodes[pkt.to];
        if (!fromNode || !toNode) continue;
        pkt.t += pkt.speed * dt;
        const px = fromNode.x + (toNode.x - fromNode.x) * pkt.t;
        const py = fromNode.y + (toNode.y - fromNode.y) * pkt.t;

        // Trail
        pkt.trail.push({ x: px, y: py });
        if (pkt.trail.length > 6) pkt.trail.shift();

        // Draw trail
        for (let ti = 0; ti < pkt.trail.length; ti++) {
          ctx.globalAlpha = (ti / pkt.trail.length) * 0.3;
          ctx.fillStyle = mintColor;
          ctx.beginPath();
          ctx.arc(pkt.trail[ti].x, pkt.trail[ti].y, 1, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw packet
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = mintColor;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();

        if (pkt.t >= 1) {
          // Pick next edge
          const newPkt = initPacket();
          if (newPkt) {
            newPkt.from = pkt.to;
            nextPackets.push(newPkt);
          }
        } else {
          nextPackets.push(pkt);
        }
      }
      packets = nextPackets;

      ctx.globalAlpha = 1;
    };

    animId = requestAnimationFrame(draw);

    // Mouse tracking on window (canvas has pointer-events: none)
    const onMove = (e) => { mouse = { x: e.clientX, y: e.clientY }; };
    const onLeave = () => { mouse = { x: -9999, y: -9999 }; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);

    // Debounced resize
    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        ({ w, h } = resize());
        initNodes();
        packets = [];
        fillPackets();
      }, 200);
    };
    window.addEventListener('resize', onResize);

    return () => {
      running = false;
      cancelAnimationFrame(animId);
      clearTimeout(resizeTimer);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('resize', onResize);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <canvas
      ref={canvasRef}
      className="network-bg"
      aria-hidden="true"
    />
  );
}
