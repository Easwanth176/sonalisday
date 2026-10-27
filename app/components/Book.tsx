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

const friendLetters = [
  {
    from: "Gun Gun",
    text: "Happy Birthday, Sona.\n\nI'm genuinely so grateful that you came into my life. When I started my MBA at LPU, I never thought I would find such a beautiful friendship here, and somehow you became my first and one of my closest friends.\n\nFrom helping each other with assignments, especially your last-minute assignments, to calling each other for the smallest things, sharing random talks and making so many memories together, you've made my MBA journey so much smoother and happier.\n\nAnd getting to spend time together in Amritsar, visiting the Golden Temple and clicking those pictures are memories I'll always cherish.\n\nThank you for always being there, for all your help, your care, your calls, and simply for being you. I'm really happy that our paths crossed and that I got a friend like you.\n\nI hope this birthday brings you all the happiness, success and love you deserve. Keep smiling, keep shining, and never change.\n\nHappy Birthday once again, Sona.\nThank you for coming into my life and making this journey a little more special.\n\nGun Gun",
  },
  {
    from: "Srija",
    text: "Happy birthday Sonali,\n\na precious girl who came to my life on a random moment of unbelievable LPU stress. I just cannot express how much I adore you. How much I love you. Your charm always makes me smile and think of your innocence. Life is better with you in LPU. When you get a person with whom sharing laughter and emotions feels safe is a win-win situation, and I got you in my life as an angel.\n\nHappy birthday angel. Don't forget that you deserve the world.\n\nSrija",
  },
  {
    from: "Anju",
    text: "Happy Birthday to one of my favourite people, SONU.\n\nWho knew that while pursuing our MBA, I would find not just a friend but someone who would become such an important part of my life? From classes, assignments and exams to random talks and endless laughter, I'm so glad I get to experience this journey with you.\n\nAnd how can I forget our everyday mess adventures, eating there without even opting for the mess and sitting like we literally owned the place, our Eastwood memories, and Dharamshala, where we literally fought over pictures. These little moments might seem silly, but they'll always be some of my favourite memories with you.\n\nI'm genuinely so grateful to have you by my side. College wouldn't be the same without you, and I hope that even after our MBA, we stay just as close, keep making crazy memories, and celebrate each other's successes.\n\nMay you get all the happiness, love, and success you deserve. Love you so much, bestie. Here's to our MBA journey, our crazy memories, and a friendship that lasts a lifetime.\n\nAnju",
  },
  {
    from: "Lucky",
    text: "Happy Birthday to my forever person, my childhood best friend, and a beautiful part of my life.\n\nWe didn't just grow up together; we grew through life together. From our childhood memories to the people we are today, you have been a part of so many chapters of my life. We have shared laughter, silly fights, countless memories, secrets, tears, and moments that no one else could ever understand the way we do.\n\nYou are not just my best friend; you are a piece of my childhood, a part of my heart, and someone who will always have a special place in my life. No matter how much we grow, how busy life gets, or how many things change around us, the bond we share will always mean the world to me.\n\nSometimes, words are not enough to explain how much a person means to us, and you are that person for me. I'm so grateful that life gave me a friend like you, someone who has known me since the beginning and has been part of my journey for so long. If I could choose my childhood all over again, I would still choose you as my best friend, every single time.\n\nOn your birthday, I wish you all the happiness, love, success, and peace your heart deserves. May life give you a thousand reasons to smile, and may you never forget how special you are to me.\n\nYears may pass, people may change, and life may take us in different directions, but you will always be my childhood best friend and one of my favourite parts of life.\n\nHappy Birthday, my girl. I love you more than these words can ever explain. Here's to our old memories, our present bond, and all the beautiful memories we still have to create together.\n\nLucky",
  },
];

const stripIds = ["063cdcca", "f0bb9fd0", "32d3ba5c", "2d26fa6f"];

function isStrip(node: PieceNode) {
  return stripIds.some((id) => node.image?.startsWith(id));
}

const friendDump = [
  { src: "/photos/friends/autumn.jpg", focus: "center 44%", x: 48, y: 24, w: 250, h: 312, rot: -9, zoom: 1.3 },
  { src: "/photos/friends/swings.jpg", focus: "center 30%", x: 338, y: 40, w: 200, h: 248, rot: 8, zoom: 1 },
  { src: "/photos/friends/swagath.jpg", focus: "center 18%", x: 250, y: 400, w: 286, h: 320, rot: -4, zoom: 1 },
  { src: "/photos/friends/restaurant.jpg", focus: "40% 66%", x: 940, y: 28, w: 230, h: 272, rot: 11, zoom: 1 },
  { src: "/photos/friends/night.jpg", focus: "74% 40%", x: 930, y: 360, w: 236, h: 286, rot: -8, zoom: 1 },
  { src: "/photos/friends/ethnic.jpg", focus: "center 24%", x: 568, y: 168, w: 328, h: 418, rot: 2, zoom: 1, hero: true },
];

function hideDumpFrames(node: PieceNode) {
  return Boolean(node.image?.startsWith("9a36de7b") || node.image?.startsWith("7f01a611") || node.image?.startsWith("afdc7ec"));
}

function words(text: string) {
  if (text.includes("the man who")) return forHer;
  if (text.includes("Blow out the Candles")) return "Get ready !!!";
  if (text.includes("Some flowers")) return "From your friends !!";
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

function finaleSpot(image?: string): { x: number; y: number; w?: number; h?: number; scale?: number } | undefined {
  if (!image) return;
  if (image.startsWith("d76124585e79")) return { x: 216.5, y: 319.5, w: 332.6, h: 187.3, scale: 1.4 };
  if (image.startsWith("fd238e91686f")) return { x: 197.3, y: 254 };
  if (image.startsWith("f2153bc04942")) return { x: 201, y: 568 };
  if (image.startsWith("da3e532ae2a2")) return { x: 366.75, y: 531.75, scale: 0.82 };
  if (image.startsWith("0e621821ffcd")) return { x: 417.2, y: 582.2, scale: 0.82 };
  if (image.startsWith("78962efcb222")) return { x: 36, y: 603 };
  if (image.startsWith("091b2330102a")) return { x: 8, y: 538 };
}

function hideLetter(node: PieceNode) {
  return Boolean(node.text?.includes("My Dearest") || node.image?.startsWith("0a6cb29e") || node.image?.startsWith("d08be1d0"));
}

function linked(node: PieceNode): boolean {
  if (node.link || node.text?.trim() === "NO") return true;
  return node.children?.some(linked) ?? false;
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
  if (isStrip(node) || hideDumpFrames(node) || (node.image && hiddenStickers.has(node.image) && !node.children)) return null;
  const isNo = node.text?.trim() === "NO";
  const isLetter = Boolean(node.text?.includes("the man who"));
  const isBright = Boolean(node.text?.includes("a little brighter"));
  const isOrdinary = Boolean(node.text?.includes("a way of making"));
  const finale = finaleSpot(node.image);
  const spot = flee ?? {
    x: isLetter ? 755 : isOrdinary ? 193 : finale?.x ?? node.x,
    y: isLetter ? 237 : isOrdinary ? 538 : finale?.y ?? node.y,
  };
  const clickable = Boolean(node.link) || isNo;
  const turn = [node.r ? `rotate(${node.r}deg)` : "", finale?.scale ? `scale(${finale.scale})` : ""].join(" ").trim();
  const style: CSSProperties = {
    left: spot.x,
    top: spot.y,
    width: isLetter ? 226 : isOrdinary ? 384 : finale?.w ?? node.w,
    height: isLetter ? 440 : isBright ? 112 : isOrdinary ? 32 : finale?.h ?? node.h,
    transform: turn || undefined,
    overflow: (node.image && !node.children) || isOrdinary ? "hidden" : "visible",
    pointerEvents: linked(node) ? "auto" : "none",
    transition: isNo ? "left 0.18s ease, top 0.18s ease" : undefined,
    cursor: clickable ? "pointer" : undefined,
    zIndex: clickable || isOrdinary ? 3 : 1,
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
            fontSize: isLetter ? 15 : isBright ? 22 : isOrdinary ? 16 : node.size,
            color: node.color || "#1a1a1a",
            textAlign: (node.align as CSSProperties["textAlign"]) || "center",
            justifyContent: node.align === "center" ? "center" : "flex-start",
            alignItems: node.path || (node.size || 0) > 40 ? "center" : "flex-start",
            lineHeight: isLetter ? 1.28 : isOrdinary ? 1.05 : node.text.includes("\n") ? 1.15 : 1.12,
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
  const fitRef = useRef<HTMLElement>(null);
  const [page, setPage] = useState(0);
  const [scale, setScale] = useState(0);
  const [flee, setFlee] = useState<Record<string, { x: number; y: number }>>({});
  const [count, setCount] = useState(3);
  const [letter, setLetter] = useState(0);

  useEffect(() => {
    const box = fitRef.current;
    if (!box) return;
    const fit = () => {
      const view = window.visualViewport;
      const width = Math.min(box.clientWidth, view?.width ?? window.innerWidth);
      const height = Math.min(box.clientHeight, view?.height ?? window.innerHeight);
      if (!width || !height) return;
      setScale(Math.min(width / STAGE_W, height / STAGE_H));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    window.addEventListener("orientationchange", fit);
    window.visualViewport?.addEventListener("resize", fit);
    const asked = Number(new URLSearchParams(window.location.search).get("p"));
    if (Number.isFinite(asked) && asked >= 0 && asked < pages.length) setPage(asked);
    return () => {
      observer.disconnect();
      window.removeEventListener("orientationchange", fit);
      window.visualViewport?.removeEventListener("resize", fit);
    };
  }, []);

  useEffect(() => {
    if (page !== 7) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") setLetter((index) => (index + 1) % friendLetters.length);
      if (event.key === "ArrowLeft") setLetter((index) => (index + friendLetters.length - 1) % friendLetters.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [page]);

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

  const go = (link: string) => {
    const index = Number(link.replace("#page-", ""));
    if (index >= 0 && index < pages.length) setPage(index);
  };

  const run = (id: string, node: PieceNode) => {
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
    <main className={styles.fit} ref={fitRef}>
      <div className={styles.frame} style={{ width: STAGE_W * scale, height: STAGE_H * scale }}>
      <div className={styles.stage} style={{ transform: `scale(${scale})` }}>
        {current.nodes.map((node, index) =>
          (page === 1 && hideOnCountdown(node)) ||
          (page === 6 && (hideLetter(node) || hideDumpFrames(node))) ? null : (
            <Piece key={`${page}-${index}`} id={`${page}-${index}`} node={node} onGo={go} flee={flee[`${page}-${index}`]} onRun={run} />
          ),
        )}
        {page === 6 &&
          friendDump.map((shot) => (
            <div
              key={shot.src}
              className={shot.hero ? styles.hero : styles.dump}
              style={{ left: shot.x, top: shot.y, width: shot.w, height: shot.h, transform: `rotate(${shot.rot}deg)` }}
            >
              <img src={shot.src} alt="" style={{ objectPosition: shot.focus, transform: `scale(${shot.zoom})` }} />
            </div>
          ))}
        {page === 7 && (
          <div
            className={styles.letters}
            key={letter}
            role="button"
            tabIndex={0}
            onClick={() => setLetter((index) => (index + 1) % friendLetters.length)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") setLetter((index) => (index + 1) % friendLetters.length);
            }}
          >
            <p className={styles.from}>From {friendLetters[letter].from}</p>
            <p className={styles.note}>{friendLetters[letter].text}</p>
            <div className={styles.turns}>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setLetter((index) => (index + friendLetters.length - 1) % friendLetters.length);
                }}
                aria-label="Previous letter"
              >
                ‹
              </button>
              <span className={styles.dots}>
                {friendLetters.map((_, index) => (
                  <i key={index} className={index === letter ? styles.dotOn : styles.dot} />
                ))}
              </span>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setLetter((index) => (index + 1) % friendLetters.length);
                }}
                aria-label="Next letter"
              >
                ›
              </button>
            </div>
            <p className={styles.hint}>tap the card for the next letter</p>
          </div>
        )}
        {page === 8 && (
          <div className={styles.us}>
            <img src="/photos/us-rot.jpg" alt="" />
          </div>
        )}
        {page === 1 && (
          <div className={styles.countdown}>
            <p className={styles.count} key={count}>
              {count}
            </p>
            <img className={styles.present} src="/canva/d8408c52ddb203fde5ed3224b5364b42.png" alt="" />
          </div>
        )}
      </div>
      </div>
    </main>
  );
}
