"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import pages from "../data/pages.json";
import styles from "./Book.module.css";

const STAGE_W = 1366;
const STAGE_H = 768;

type PieceNode = {
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
  link?: string;
  image?: string;
  photo?: boolean;
  ix?: number;
  iy?: number;
  iw?: number;
  ih?: number;
  path?: string;
  fill?: string;
  flip?: boolean;
  text?: string;
  font?: string;
  size?: number;
  align?: string;
  color?: string;
  children?: PieceNode[];
};

const portraits: Record<string, { src: string; focus: string }> = {
  "234e8aa46a2903fe87049b93e93ee311.jpg": { src: "/photos/temple.jpg", focus: "center 32%" },
  "9a36de7b4d225b5be0850dbaf7ed1314.jpg": { src: "/photos/friends/restaurant.jpg", focus: "40% 66%" },
  "7f01a6113e0c2307d986b2e32cf80270.jpg": { src: "/photos/friends/night.jpg", focus: "74% 40%" },
  "f0bb9fd07a59b577b5f3dbd2c8c39f41.jpg": { src: "/photos/friends/restaurant.jpg", focus: "40% 68%" },
  "32d3ba5c073326b37a219420ed78f9b1.jpg": { src: "/photos/friends/night.jpg", focus: "62% 38%" },
  "2d26fa6f4f5d96b95ccd30659d1fb414.jpg": { src: "/photos/friends/swagath.jpg", focus: "center 20%" },
  "e8a101a5be2899986c90e2f872443a05.jpg": { src: "/photos/temple.jpg", focus: "center 30%" },
  "0e621821ffcd5a75d8b03b90de1edbe0.jpg": { src: "/photos/mirror.jpg", focus: "center 42%" },
};

const hiddenStickers = new Set([
  "9e7f1cf7519b99cb4047562725440301.png",
  "175e9f3bb4e50464461551c7c8bd90a3.png",
]);

const fontFamily: Record<string, string> = {
  Railey: "var(--font-railey), cursive",
  "Pony Club": "var(--font-pony), cursive",
  Lazydog: "var(--font-lazy), cursive",
  "Crafty Girls": "var(--font-crafty), cursive",
  Anaktoria: "var(--font-anaktoria), cursive",
  Arimo: "var(--font-arimo), sans-serif",
  "Canva Sans": "var(--font-arimo), sans-serif",
};

const forHer =
  "Happy birthday to the woman who makes my world brighter. I don't say it enough, but I'm endlessly grateful for your kindness, your strength, and the way you love me so effortlessly. Watching you grow, chase your dreams, and stay true to yourself inspires me every day. I hope this new year brings you success, peace, and all the joy you give so freely to others. Thank you for being exactly who you are. I love you more than words could ever capture.\nHappy birthday, my love.";

const friendDump = [
  { src: "/photos/friends/autumn.jpg", focus: "center 44%", x: 28, y: 24, w: 270, h: 350, rot: -8, zoom: 1.3 },
  { src: "/photos/friends/swings.jpg", focus: "center 30%", x: 250, y: 70, w: 250, h: 340, rot: 5, zoom: 1 },
  { src: "/photos/friends/swagath.jpg", focus: "center 18%", x: 90, y: 340, w: 250, h: 320, rot: -4, zoom: 1 },
];

function words(text: string) {
  if (text.includes("the man who")) return forHer;
  if (text.includes("Blow out the Candles")) return "Get ready !!!";
  if (text.includes("Some flowers")) return "Your friends !!";
  return text.replaceAll("[Name]", "Sonali").replaceAll("[Your Name]", "Easwanth");
}

function giftLink(link?: string) {
  if (link === "#page-6") return "#page-7";
  if (link === "#page-7") return "#page-6";
  return link;
}

function hideOnCountdown(node: PieceNode) {
  return Boolean(node.image?.startsWith("09a443") || node.text?.includes("Click on the cake"));
}

function hideLetter(node: PieceNode) {
  return Boolean(node.text?.includes("My Dearest") || node.image?.startsWith("0a6cb29e") || node.image?.startsWith("d08be1d0"));
}

function linked(node: PieceNode): boolean {
  if (node.link || node.text?.trim() === "NO") return true;
  return node.children?.some(linked) ?? false;
}

const melody = [
  60, 60, 62, 60, 65, 64, 60, 60, 62, 60, 67, 65, 60, 60, 72, 69, 65, 64, 62, 70, 70, 69, 65, 67, 65,
];
const holds = [
  0.35, 0.2, 0.5, 0.5, 0.5, 0.9, 0.35, 0.2, 0.5, 0.5, 0.5, 0.9, 0.35, 0.2, 0.5, 0.5, 0.5, 0.45, 0.9, 0.35, 0.2, 0.5, 0.5, 0.5, 1.2,
];

function playSong(ctx: AudioContext) {
  let time = ctx.currentTime + 0.05;
  melody.forEach((midi, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = 440 * 2 ** ((midi - 69) / 12);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.08, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + holds[index]);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + holds[index] + 0.02);
    time += holds[index] * 0.92;
  });
  return (time - ctx.currentTime) * 1000;
}

function Piece({
  node,
  id,
  onGo,
  flee,
  onRun,
}: {
  node: PieceNode;
  id: string;
  onGo: (link: string) => void;
  flee: { x: number; y: number } | undefined;
  onRun: (id: string, node: PieceNode) => void;
}) {
  if (node.image && hiddenStickers.has(node.image) && !node.children) return null;
  const isNo = node.text?.trim() === "NO";
  const spot = flee ?? { x: node.x, y: node.y };
  const clickable = Boolean(node.link) || isNo;
  const style: CSSProperties = {
    left: spot.x,
    top: spot.y,
    width: node.w,
    height: node.h,
    transform: node.r ? `rotate(${node.r}deg)` : undefined,
    overflow: node.image && !node.children ? "hidden" : "visible",
    pointerEvents: linked(node) ? "auto" : "none",
    transition: isNo ? "left 0.18s ease, top 0.18s ease" : undefined,
    cursor: clickable ? "pointer" : undefined,
    zIndex: clickable ? 3 : 1,
  };

  const useCrop = Boolean(node.image && !node.path && node.iw && node.iw > node.w * 0.45);
  const body = (
    <>
      {node.path && node.fill && (
        <svg className={styles.shape} viewBox="0 0 64 42" preserveAspectRatio="none" aria-hidden>
          <path d={node.path} fill={node.fill} />
        </svg>
      )}
      {node.image && (
        <img
          src={node.photo ? portraits[node.image]?.src || "/photos/temple.jpg" : `/canva/${node.image}`}
          alt=""
          draggable={false}
          style={
            useCrop
              ? {
                  position: "absolute",
                  left: node.ix,
                  top: node.iy,
                  width: node.iw,
                  height: node.ih,
                  maxWidth: "none",
                  objectFit: node.photo ? "cover" : undefined,
                  objectPosition: node.photo ? portraits[node.image]?.focus : undefined,
                  transform: node.flip ? "scaleX(-1)" : undefined,
                }
              : {
                  width: "100%",
                  height: "100%",
                  objectFit: node.photo ? "cover" : "fill",
                  objectPosition: node.photo ? portraits[node.image]?.focus : undefined,
                  transform: node.flip ? "scaleX(-1)" : undefined,
                }
          }
        />
      )}
      {node.text && (
        <span
          className={styles.label}
          style={{
            fontFamily: fontFamily[node.font || "Railey"],
            fontSize: node.size,
            color: node.color || "#1a1a1a",
            textAlign: (node.align as CSSProperties["textAlign"]) || "center",
            justifyContent: node.align === "center" ? "center" : "flex-start",
            alignItems: node.path || (node.size || 0) > 40 ? "center" : "flex-start",
            lineHeight: node.text.includes("\n") ? 1.15 : 1.05,
            display: "flex",
          }}
        >
          {words(node.text)}
        </span>
      )}
      {node.children?.map((child, index) => (
        <Piece key={index} id={`${id}.${index}`} node={child} onGo={onGo} flee={undefined} onRun={onRun} />
      ))}
    </>
  );

  if (isNo) {
    return (
      <button
        className={styles.piece}
        style={style}
        onPointerEnter={() => onRun(id, node)}
        onClick={(event) => {
          event.preventDefault();
          onRun(id, node);
        }}
      >
        {body}
      </button>
    );
  }

  const link = giftLink(node.link);
  if (link) {
    return (
      <button className={styles.piece} style={style} onClick={() => onGo(link)}>
        {body}
      </button>
    );
  }

  return (
    <div className={styles.piece} style={style}>
      {body}
    </div>
  );
}

export default function Book() {
  const [page, setPage] = useState(0);
  const [scale, setScale] = useState(1);
  const [on, setOn] = useState(true);
  const [flee, setFlee] = useState<Record<string, { x: number; y: number }>>({});
  const [count, setCount] = useState(3);
  const audio = useRef<AudioContext | null>(null);
  const timer = useRef<number | null>(null);
  const onRef = useRef(true);

  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H));
    fit();
    window.addEventListener("resize", fit);
    const asked = Number(new URLSearchParams(window.location.search).get("p"));
    if (Number.isFinite(asked) && asked >= 0 && asked < pages.length) setPage(asked);
    return () => window.removeEventListener("resize", fit);
  }, []);

  useEffect(() => {
    if (page !== 1) return;
    setCount(3);
    const timers = [
      window.setTimeout(() => setCount(2), 1000),
      window.setTimeout(() => setCount(1), 2000),
      window.setTimeout(() => setPage(2), 3000),
    ];
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [page]);

  const loop = () => {
    const ctx = audio.current;
    if (!ctx || !onRef.current) return;
    const wait = playSong(ctx);
    timer.current = window.setTimeout(loop, wait + 1400);
  };

  const start = () => {
    if (!onRef.current) return;
    const ctx = audio.current ?? new AudioContext();
    audio.current = ctx;
    if (ctx.state === "suspended") void ctx.resume();
    if (timer.current) return;
    loop();
  };

  const toggle = () => {
    const next = !onRef.current;
    onRef.current = next;
    setOn(next);
    if (!next && timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
    if (next) start();
  };

  const go = (link: string) => {
    start();
    const index = Number(link.replace("#page-", ""));
    if (index >= 0 && index < pages.length) setPage(index);
  };

  const run = (id: string, node: PieceNode) => {
    start();
    setFlee((current) => ({
      ...current,
      [id]: {
        x: Math.random() * Math.max(40, STAGE_W - node.w),
        y: Math.random() * Math.max(40, STAGE_H - node.h),
      },
    }));
  };

  const current = pages[page] as { nodes: PieceNode[] };

  return (
    <main className={styles.fit}>
      <button className={styles.sound} onClick={toggle} aria-label={on ? "Pause music" : "Play music"}>
        {on ? "♪" : "×"}
      </button>
      <div className={styles.stage} style={{ transform: `scale(${scale})` }}>
        {current.nodes.map((node, index) =>
          (page === 1 && hideOnCountdown(node)) || (page === 6 && hideLetter(node)) ? null : (
            <Piece key={`${page}-${index}`} id={`${page}-${index}`} node={node} onGo={go} flee={flee[`${page}-${index}`]} onRun={run} />
          ),
        )}
        {page === 6 &&
          friendDump.map((shot) => (
            <div key={shot.src} className={styles.dump} style={{ left: shot.x, top: shot.y, width: shot.w, height: shot.h, transform: `rotate(${shot.rot}deg)` }}>
              <img src={shot.src} alt="" style={{ objectPosition: shot.focus, transform: `scale(${shot.zoom})` }} />
            </div>
          ))}
        {page === 1 && (
          <div className={styles.countdown}>
            <p className={styles.count} key={count}>
              {count}
            </p>
            <img className={styles.present} src="/canva/d8408c52ddb203fde5ed3224b5364b42.png" alt="" />
          </div>
        )}
      </div>
    </main>
  );
}
