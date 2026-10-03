import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Mascot3DProps {
  compact?: boolean;
}

export const Mascot3D: React.FC<Mascot3DProps> = ({ compact = false }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 320;
    let height = container.clientHeight || 320;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0.1, compact ? 8.2 : 7.0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const goldKeyLight = new THREE.DirectionalLight(0xF59E0B, 3.5);
    goldKeyLight.position.set(4, 5, 5);
    scene.add(goldKeyLight);

    const blueFillLight = new THREE.DirectionalLight(0x38BDF8, 3.0);
    blueFillLight.position.set(-5, -2, 4);
    scene.add(blueFillLight);

    const frontPoint = new THREE.PointLight(0x60A5FA, 2.5, 15);
    frontPoint.position.set(0, 1, 4);
    scene.add(frontPoint);

    // Mascot main group
    const botGroup = new THREE.Group();
    scene.add(botGroup);

    // Materials
    const navyBodyMat = new THREE.MeshPhongMaterial({
      color: 0x1E3A5F,
      shininess: 90,
      specular: 0x60A5FA,
    });

    const goldAccentMat = new THREE.MeshPhongMaterial({
      color: 0xF59E0B,
      shininess: 120,
      specular: 0xFFFBEB,
    });

    const darkVisorMat = new THREE.MeshPhongMaterial({
      color: 0x0A1120,
      shininess: 140,
      specular: 0x38BDF8,
    });

    const cyanGlowMat = new THREE.MeshBasicMaterial({
      color: 0x00F0FF,
    });

    // 1. Bot Head
    const headGeo = new THREE.BoxGeometry(2.3, 1.9, 1.8);
    const headMesh = new THREE.Mesh(headGeo, navyBodyMat);
    botGroup.add(headMesh);

    // 2. Visor Screen
    const visorGeo = new THREE.BoxGeometry(1.95, 1.25, 0.16);
    const visorMesh = new THREE.Mesh(visorGeo, darkVisorMat);
    visorMesh.position.set(0, -0.05, 0.92);
    botGroup.add(visorMesh);

    // 3. Glowing Eyes & Face " ._. "
    const eyeGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.1, 16);
    const leftEye = new THREE.Mesh(eyeGeo, cyanGlowMat);
    leftEye.rotation.x = Math.PI / 2;
    leftEye.position.set(-0.52, 0.05, 1.02);
    botGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, cyanGlowMat);
    rightEye.rotation.x = Math.PI / 2;
    rightEye.position.set(0.52, 0.05, 1.02);
    botGroup.add(rightEye);

    // Mouth line "_"
    const mouthGeo = new THREE.BoxGeometry(0.44, 0.08, 0.08);
    const mouth = new THREE.Mesh(mouthGeo, cyanGlowMat);
    mouth.position.set(0, -0.24, 1.02);
    botGroup.add(mouth);

    // 4. University Academic Cap (Mortarboard)
    const hatBaseGeo = new THREE.CylinderGeometry(0.65, 0.75, 0.35, 24);
    const hatBaseMat = new THREE.MeshPhongMaterial({ color: 0x0D1B2A });
    const hatBase = new THREE.Mesh(hatBaseGeo, hatBaseMat);
    hatBase.position.set(0, 1.08, 0);
    botGroup.add(hatBase);

    const capTopGeo = new THREE.BoxGeometry(2.5, 0.09, 2.5);
    const capTopMesh = new THREE.Mesh(capTopGeo, navyBodyMat);
    capTopMesh.position.set(0, 1.28, 0);
    capTopMesh.rotation.y = Math.PI / 4;
    botGroup.add(capTopMesh);

    const buttonGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const buttonMesh = new THREE.Mesh(buttonGeo, goldAccentMat);
    buttonMesh.position.set(0, 1.35, 0);
    botGroup.add(buttonMesh);

    const tasselGeo = new THREE.CylinderGeometry(0.04, 0.07, 0.85, 12);
    const tasselMesh = new THREE.Mesh(tasselGeo, goldAccentMat);
    tasselMesh.position.set(0.95, 0.9, 0.5);
    tasselMesh.rotation.z = -0.35;
    botGroup.add(tasselMesh);

    // 5. Orbital Gold & Cyan Rings
    const ring1Geo = new THREE.TorusGeometry(1.9, 0.045, 16, 80);
    const ring1 = new THREE.Mesh(ring1Geo, goldAccentMat);
    ring1.rotation.x = Math.PI / 3;
    botGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(2.2, 0.04, 16, 80);
    const ring2Mat = new THREE.MeshPhongMaterial({ color: 0x38BDF8, shininess: 100 });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.y = Math.PI / 3;
    botGroup.add(ring2);

    // 6. Floating Sparkles / Knowledge Orbs
    const orbCount = 20;
    interface OrbData {
      angle: number;
      radius: number;
      speed: number;
      baseY: number;
      floatSpeed: number;
    }
    const orbs: { mesh: THREE.Mesh; data: OrbData }[] = [];
    const orbGroup = new THREE.Group();
    botGroup.add(orbGroup);

    for (let i = 0; i < orbCount; i++) {
      const size = 0.06 + Math.random() * 0.08;
      const orbGeo = new THREE.SphereGeometry(size, 8, 8);
      const orbMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xF59E0B : 0x00F0FF,
      });
      const orbMesh = new THREE.Mesh(orbGeo, orbMat);
      const angle = (i / orbCount) * Math.PI * 2;
      const radius = 2.4 + Math.random() * 0.8;
      const y = (Math.random() - 0.5) * 2.2;
      orbMesh.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      const orbData: OrbData = {
        angle,
        radius,
        speed: 0.012 + Math.random() * 0.018,
        baseY: y,
        floatSpeed: 1.5 + Math.random() * 1.5,
      };
      orbGroup.add(orbMesh);
      orbs.push({ mesh: orbMesh, data: orbData });
    }

    // Mouse & Touch interactive tracking
    let targetRotX = 0;
    let targetRotY = 0;

    const handlePointerMove = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      const x = ((clientX - rect.left) / (rect.width || 1)) * 2 - 1;
      const y = -(((clientY - rect.top) / (rect.height || 1)) * 2 - 1);
      targetRotY = x * 0.6;
      targetRotX = -y * 0.4;
    };

    const onMouseMove = (e: MouseEvent) => {
      handlePointerMove(e.clientX, e.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    container.addEventListener('touchmove', onTouchMove, { passive: true });

    // Resize handling via ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      botGroup.position.y = Math.sin(t * 1.6) * 0.14;
      botGroup.rotation.y += (targetRotY - botGroup.rotation.y) * 0.05 + 0.005;
      botGroup.rotation.x += (targetRotX - botGroup.rotation.x) * 0.05;

      ring1.rotation.z += 0.012;
      ring2.rotation.x += 0.010;

      orbs.forEach((item) => {
        item.data.angle += item.data.speed;
        item.mesh.position.x = Math.cos(item.data.angle) * item.data.radius;
        item.mesh.position.z = Math.sin(item.data.angle) * item.data.radius;
        item.mesh.position.y =
          item.data.baseY + Math.sin(t * item.data.floatSpeed + item.data.angle) * 0.25;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('touchmove', onTouchMove);
      resizeObserver.disconnect();
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [compact]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full min-h-[300px] sm:min-h-[420px] lg:min-h-[460px] flex items-center justify-center select-none"
    />
  );
};
