"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { ArrowLeft, ArrowRight, ChevronUp, GitBranch, Map, Orbit, Radio, Rocket, X } from "lucide-react";

type Station = {
  id: string; code: string; title: string; place: string; summary: string;
  details: string[]; color: number; position: [number, number, number];
};

const WORLD_SCALE = 4.5;
const position = (x: number, z: number): [number, number, number] => [x * WORLD_SCALE, 0, z * WORLD_SCALE];

const STATIONS: Station[] = [
  { id: "intro", code: "00", title: "서문성", place: "중앙 관제센터", summary: "항공우주 시스템을 배우고, 설계하고, 사람과 프로젝트를 연결합니다.", details: ["항공우주공학", "위성·UAM 연구", "3D 설계와 창작"], color: 0x70e1ff, position: position(0, 0) },
  { id: "leadership", code: "01", title: "GNUniverse 회장 활동", place: "우주기지 지휘본부", summary: "동아리의 방향을 설계하고 구성원과 프로젝트 운영을 이끈 경험입니다.", details: ["조직 운영", "프로젝트 조율", "협업과 리더십"], color: 0xffb45d, position: position(-18, -12) },
  { id: "education", code: "02", title: "인공위성 교육 기획·운영", place: "우주기술 교육센터", summary: "교육 과정을 기획하고 위성 기술을 이해하기 쉬운 경험으로 전달합니다.", details: ["교육 프로그램 기획", "수업 운영", "활동 기록"], color: 0x84f0b3, position: position(17, -15) },
  { id: "satellite", code: "03", title: "큐브위성·CanSat", place: "위성 개발·조립동", summary: "임무 설계부터 시스템 구성까지 소형위성 개발 흐름을 학습합니다.", details: ["임무 정의", "서브시스템 학습", "제작·시험"], color: 0xf6df72, position: position(23, 7) },
  { id: "catia", code: "04", title: "CATIA 시스템 모델링", place: "공학 설계연구소", summary: "CATIA를 활용해 우주 시스템의 형상과 조립 구조를 설계합니다.", details: ["3D CAD", "부품 모델링", "조립 설계"], color: 0xa9a2ff, position: position(13, 22) },
  { id: "blender", code: "05", title: "Blender 3D 창작", place: "개인 3D 창작 스튜디오", summary: "캐릭터와 배경을 모델링하며 기술과 시각적 스토리텔링을 연결합니다.", details: ["캐릭터 모델링", "배경 제작", "렌더링"], color: 0xff8c79, position: position(-11, 23) },
  { id: "aero", code: "06", title: "UAM 공력해석 자동화", place: "UAM 공력시험장", summary: "OpenVSP·VSPAERO·MATLAB을 연결해 로터 형상 생성과 해석을 자동화합니다.", details: ["OpenVSP", "VSPAERO", "MATLAB DOE"], color: 0x59c8ff, position: position(-25, 9) },
  { id: "skills", code: "07", title: "핵심 기술과 역량", place: "기술 장비 보관소", summary: "리더십, 위성, 3D 모델링과 공학 해석 역량을 한곳에 정리했습니다.", details: ["Leadership", "Satellite Systems", "Engineering Analysis"], color: 0x72e0da, position: position(-27, -25) },
  { id: "records", code: "08", title: "경력과 학력", place: "비행 기록 보관소", summary: "항공우주공학 학습과 활동의 궤적을 시간순으로 확인합니다.", details: ["학력", "활동 경력", "프로젝트 기록"], color: 0xd9efff, position: position(4, -28) },
  { id: "contact", code: "09", title: "연락 및 외부 링크", place: "우주기지 통신센터", summary: "이력서와 GitHub 등 외부 채널로 연결되는 최종 도킹 포인트입니다.", details: ["Resume", "Email", "GitHub · LinkedIn"], color: 0xffd166, position: position(29, -27) },
];

function labelSprite(text: string, color: number) {
  const canvas = document.createElement("canvas"); canvas.width = 640; canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "rgba(3,12,20,.88)"; ctx.roundRect(16, 16, 608, 92, 18); ctx.fill();
  ctx.strokeStyle = `#${color.toString(16).padStart(6, "0")}`; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = "#fff"; ctx.font = "600 31px Arial"; ctx.textAlign = "center"; ctx.fillText(text, 320, 75);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
  sprite.scale.set(9, 1.8, 1); return sprite;
}

function buildStation(station: Station) {
  const group = new THREE.Group(); group.position.set(...station.position);
  const shell = new THREE.MeshStandardMaterial({ color: 0x111e27, roughness: .68, metalness: .45 });
  const glow = new THREE.MeshStandardMaterial({ color: station.color, emissive: station.color, emissiveIntensity: 1.15 });
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 4, .45, 24), shell); pad.position.y = .25; group.add(pad);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(2.25, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), shell); dome.position.y = .45; group.add(dome);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.55, .12, 8, 32), glow); ring.rotation.x = Math.PI / 2; ring.position.y = .68; group.add(ring);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(.08, .1, 3.2, 8), shell); mast.position.y = 3.2; group.add(mast);
  const light = new THREE.Mesh(new THREE.SphereGeometry(.18, 10, 8), glow); light.position.y = 4.85; group.add(light);
  const label = labelSprite(`${station.code}  ${station.place}`, station.color); label.position.y = 6.4; group.add(label);
  return group;
}

function buildCraft() {
  const craft = new THREE.Group();
  const hull = new THREE.MeshStandardMaterial({ color: 0xdce8ed, metalness: .75, roughness: .28 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x77ddff, emissive: 0x1b8faa, emissiveIntensity: .5 });
  const fire = new THREE.MeshStandardMaterial({ color: 0xffa85c, emissive: 0xff6a2f, emissiveIntensity: 1.2 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(.6, 1.55, 5, 12), hull); body.rotation.x = Math.PI / 2; body.position.y = 1.1; craft.add(body);
  const cockpit = new THREE.Mesh(new THREE.SphereGeometry(.48, 14, 10), glass); cockpit.scale.set(1, .65, 1.4); cockpit.position.set(0, 1.45, -.35); craft.add(cockpit);
  const wings = new THREE.Mesh(new THREE.BoxGeometry(2.65, .12, 1.1), hull); wings.position.set(0, .94, .25); craft.add(wings);
  [-.42, .42].forEach((x) => { const e = new THREE.Mesh(new THREE.CylinderGeometry(.19, .27, .7, 12), fire); e.rotation.x = Math.PI / 2; e.position.set(x, .98, 1.2); craft.add(e); });
  craft.position.set(0, 0, 7); return craft;
}

export default function SpacePortfolio() {
  const mountRef = useRef<HTMLDivElement>(null);
  const keysRef = useRef<Record<string, boolean>>({});
  const craftRef = useRef<THREE.Group | null>(null);
  const nearbyRef = useRef<Station | null>(null);
  const [started, setStarted] = useState(false);
  const [active, setActive] = useState<Station | null>(null);
  const [nearby, setNearby] = useState<Station | null>(null);
  const [mapOpen, setMapOpen] = useState(true);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const mount = mountRef.current; if (!mount) return;
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x02070d); scene.fog = new THREE.FogExp2(0x071018, .003);
    const camera = new THREE.PerspectiveCamera(56, mount.clientWidth / mount.clientHeight, .1, 1000); camera.position.set(0, 16, 18);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(mount.clientWidth, mount.clientHeight); renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75)); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15; mount.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0x90cfff, 0x091018, 1.4)); const sun = new THREE.DirectionalLight(0xffe8c2, 3.2); sun.position.set(-28, 42, 14); scene.add(sun);
    const moon = new THREE.Mesh(new THREE.CircleGeometry(360, 128), new THREE.MeshStandardMaterial({ color: 0x3e4548, roughness: 1 })); moon.rotation.x = -Math.PI / 2; scene.add(moon);
    const grid = new THREE.GridHelper(600, 120, 0x1b596c, 0x19313a); grid.position.y = .025; (grid.material as THREE.Material).transparent = true; (grid.material as THREE.Material).opacity = .22; scene.add(grid);
    const stars = new Float32Array(2700); for (let i = 0; i < 900; i++) { const r = 280 + Math.random() * 560, a = Math.random() * Math.PI * 2; stars[i*3] = Math.cos(a)*r; stars[i*3+1] = 40 + Math.random()*300; stars[i*3+2] = Math.sin(a)*r; }
    const starGeo = new THREE.BufferGeometry(); starGeo.setAttribute("position", new THREE.BufferAttribute(stars, 3)); scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xdff7ff, size: .22 })));
    const earth = new THREE.Mesh(new THREE.SphereGeometry(24, 32, 20), new THREE.MeshStandardMaterial({ color: 0x2d7fa4, emissive: 0x0d2e47, emissiveIntensity: .3 })); earth.position.set(-280, 140, -390); scene.add(earth);
    STATIONS.forEach((s) => scene.add(buildStation(s))); const craft = buildCraft(); craftRef.current = craft; scene.add(craft);

    const keydown = (e: KeyboardEvent) => { keysRef.current[e.key.toLowerCase()] = true; if (e.key === "Enter" && nearbyRef.current) setActive(nearbyRef.current); if (e.key.toLowerCase() === "m") setMapOpen((v) => !v); if (e.key === "Escape") setActive(null); };
    const keyup = (e: KeyboardEvent) => { keysRef.current[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", keydown); window.addEventListener("keyup", keyup);
    let frame = 0, speed = 0, lastNearby = ""; const clock = new THREE.Clock();
    const animate = () => {
      frame = requestAnimationFrame(animate); const dt = Math.min(clock.getDelta(), .04); const k = keysRef.current;
      if (k.w || k.arrowup) speed += 8.5 * dt; if (k.s || k.arrowdown) speed -= 6.5 * dt; if (!k.w && !k.arrowup && !k.s && !k.arrowdown) speed *= Math.pow(.035, dt);
      speed = THREE.MathUtils.clamp(speed, -4.5, 9.5); if (k.a || k.arrowleft) craft.rotation.y += 2.1 * dt; if (k.d || k.arrowright) craft.rotation.y -= 2.1 * dt; craft.translateZ(-speed * dt);
      const radius = Math.hypot(craft.position.x, craft.position.z); if (radius > 270) { craft.position.x *= 270/radius; craft.position.z *= 270/radius; }
      craft.position.y = .12 + Math.sin(clock.elapsedTime * 2.2) * .08;
      const cameraGoal = new THREE.Vector3(0, 12, 14).applyAxisAngle(new THREE.Vector3(0,1,0), craft.rotation.y).add(craft.position); camera.position.lerp(cameraGoal, 1 - Math.pow(.001, dt)); camera.lookAt(craft.position.clone().add(new THREE.Vector3(0,1.2,0)));
      const nearest = STATIONS.reduce((best, station) => {
        const range = Math.hypot(craft.position.x-station.position[0], craft.position.z-station.position[2]);
        return range < best.range ? { station, range } : best;
      }, { station: STATIONS[0], range: Infinity });
      const closeStation: Station | null = nearest.range < 6.4 ? nearest.station : null; nearbyRef.current = closeStation;
      if ((closeStation?.id ?? "") !== lastNearby) { lastNearby = closeStation?.id ?? ""; setNearby(closeStation); } setDistance(Math.round(nearest.range*10)); renderer.render(scene, camera);
    }; animate();
    const resize = () => { camera.aspect = mount.clientWidth / mount.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(mount.clientWidth, mount.clientHeight); }; window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("keydown", keydown); window.removeEventListener("keyup", keyup); window.removeEventListener("resize", resize); renderer.dispose(); if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement); };
  }, []);

  const press = (key: string, value: boolean) => { keysRef.current[key] = value; };
  const jumpTo = (s: Station) => { craftRef.current?.position.set(s.position[0], 0, s.position[2] + 5.1); setActive(s); };

  return <main className="space-shell">
    <div ref={mountRef} className="space-canvas" aria-label="달 연구기지 3D 탐험 공간" /><div className="scanlines" aria-hidden="true" />
    <header className="hud-header">
      <button className="brand" onClick={() => setActive(STATIONS[0])} aria-label="자기소개 열기"><span className="brand-mark"><Orbit size={18}/></span><span><b>SEOMUN</b><small>ORBITAL PORTFOLIO</small></span></button>
      <div className="hud-status"><span className="pulse"/> BASE ONLINE <em>KR · 2026</em></div>
      <button className="icon-button" onClick={() => setMapOpen((v) => !v)} aria-label="기지 지도 열기"><Map size={19}/></button>
    </header>
    {mapOpen && <aside className="mission-map" aria-label="기지 구역 목록"><p className="eyebrow">LUNAR BASE DIRECTORY</p><h1>탐험할 구역</h1><p className="map-copy">우주선을 조종하거나 구역을 선택해 서문성의 프로젝트를 확인하세요.</p><nav>{STATIONS.map((s) => <button key={s.id} onClick={() => jumpTo(s)}><span>{s.code}</span><div><b>{s.place}</b><small>{s.title}</small></div><ArrowRight size={14}/></button>)}</nav></aside>}
    <aside className="telemetry" aria-label="비행 정보"><p><span>CRAFT</span><b>S-01</b></p><p><span>NEAREST</span><b>{nearby?.code ?? "--"}</b></p><p><span>RANGE</span><b>{distance} M</b></p></aside>
    {nearby && !active && <button className="dock-prompt" onClick={() => setActive(nearby)}><Radio size={17}/><span><small>신호 수신</small><b>{nearby.place}</b></span><kbd>ENTER</kbd></button>}
    {active && <section className="detail-panel" aria-modal="true" role="dialog" aria-label={`${active.title} 상세 정보`}><button className="close" onClick={() => setActive(null)} aria-label="상세 정보 닫기"><X/></button><p className="eyebrow">STATION {active.code} · {active.place}</p><h2>{active.title}</h2><p className="detail-summary">{active.summary}</p><ul>{active.details.map((d) => <li key={d}>{d}</li>)}</ul>{active.id === "contact" ? <a className="primary-link" href="https://github.com/Moriatihoms" target="_blank" rel="noreferrer"><GitBranch size={17}/> GitHub에서 확인하기</a> : <button className="primary-link" onClick={() => setActive(null)}>탐험 계속하기 <ArrowRight size={17}/></button>}</section>}
    <div className="controls-desktop"><span>WASD / 방향키</span> 이동 <span>M</span> 지도 <span>ENTER</span> 정보</div>
    <div className="controls-mobile" aria-label="우주선 이동 조작"><button onPointerDown={() => press("a",true)} onPointerUp={() => press("a",false)} onPointerLeave={() => press("a",false)} aria-label="왼쪽"><ArrowLeft/></button><button onPointerDown={() => press("w",true)} onPointerUp={() => press("w",false)} onPointerLeave={() => press("w",false)} aria-label="앞으로"><ChevronUp/></button><button onPointerDown={() => press("d",true)} onPointerUp={() => press("d",false)} onPointerLeave={() => press("d",false)} aria-label="오른쪽"><ArrowRight/></button></div>
    {!started && <section className="intro-screen"><div className="intro-orbit" aria-hidden="true"><span/><Rocket/></div><p className="eyebrow">PERSONAL MISSION ARCHIVE · 2026</p><h2>우주를 설계하고,<br/><i>가능성을 연결하다.</i></h2><p>서문성의 항공우주 연구, 위성 교육, 공학 설계와 3D 창작 활동을 하나의 우주기지에서 만나보세요.</p><button onClick={() => setStarted(true)}><Rocket size={18}/> 탐사 임무 시작</button><small>키보드와 모바일 조작을 모두 지원합니다</small></section>}
  </main>;
}
