(() => {
  const canvas = document.querySelector("canvas");
  const context = canvas.getContext("2d");
  const mark = document.querySelector("#mark");
  const one = document.querySelector("#one");
  const mind = document.querySelector("#mind");
  const mindInk = document.querySelector("#mind-ink-fill");
  const mindInkTip = document.querySelector("#mind-ink-tip");
  const contour = document.querySelector("#contour");
  const sweep = document.querySelector("#contour-sweep");
  const endGuard = document.querySelector("#contour-end-guard");
  const light = document.querySelector("#contour-light");
  const lightTip = document.querySelector("#contour-light-tip");
  const waveLight = document.querySelector("#contour-wave-light");
  const waveRest = document.querySelector("#contour-wave-rest");
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const options = new URLSearchParams(location.search);
  const inBanner = options.has("banner");
  const rebuild = options.has("rebuild");
  let dockingStarted = false;
  const startBannerDock = () => {
    if (!inBanner || parent === window || dockingStarted) return;
    dockingStarted = true;
    parent.postMessage("one-mind:complete", "*");
  };
  if (!context || (!rebuild && motion.matches) || options.has("static")) return;
  const contourStyle = options.get("contorno") === "lapiz" ? "lapiz" : "foco";
  const mindStyle = options.get("mind");
  const originalRhythm = options.get("ritmo") === "original";
  const staggeredMind = !mindStyle && !originalRhythm;
  const lampDelay = originalRhythm ? 0 : 120;
  const lampHaloEnd = originalRhythm ? 4140 : 3920;
  if (contourStyle === "foco") {
    light.querySelector("use").removeAttribute("mask");
    light.setAttribute("filter", "url(#contour-lamp-halo)");
  }
  const contourLength = contourStyle === "lapiz" ? sweep.getTotalLength() : 0;
  if (contourLength) sweep.setAttribute("stroke-dasharray", `${contourLength} ${contourLength}`);

  const formationEnd = 3820;
  const originalPlacementEnd = 4230;
  const landingExtension = 480;
  const placementEnd = originalPlacementEnd + landingExtension;
  const nextLayerDelay = placementEnd - 2550;
  const currentBannerIntro = inBanner && contourStyle === "foco" && !originalRhythm;
  const holdBeforePulse = 1000;
  const pulseDuration = 1210;
  const pulsePeak = 0.30;
  const restDuration = 540;
  const contourSettled = nextLayerDelay + lampDelay + lampHaloEnd;
  const waveStart = contourSettled + holdBeforePulse;
  const waveEnd = waveStart + pulseDuration;
  const duration = currentBannerIntro
    ? waveEnd + restDuration
    : 5600 + nextLayerDelay;
  const restStart = duration - restDuration;
  const staticView = { x: 227, y: 348, width: 648, height: 668 };
  const logo = { x: 551, y: 682.5, width: 584, height: 611 };
  const word = { x: 528, y: 615.5, width: 330, height: 101 };
  const colors = [[4, 201, 237], [0, 158, 234], [20, 99, 222], [102, 80, 230], [149, 57, 223], [202, 39, 219], [227, 35, 210]];
  const clamp = (value) => Math.max(0, Math.min(1, value));
  const phase = (time, start, end) => clamp((time - start) / (end - start));
  const smooth = (value) => value * value * (3 - 2 * value);
  const mix = (from, to, progress) => from + (to - from) * progress;
  const waveColor = document.querySelector("#contour-wave-color");
  const waveBlue = document.querySelector("#contour-wave-blue");
  const wavePink = document.querySelector("#contour-wave-pink");
  const waveCore = document.querySelector("#contour-wave-core");
  let wavePoints;
  let waveVisible = false;
  const mindLetters = staggeredMind ? [...mind.querySelectorAll("path")].map((letter, index) => {
    const mask = mindInk.parentElement.cloneNode(true);
    const [fill, tip] = mask.children;
    mask.id = `mind-letter-ink-${index}`;
    fill.removeAttribute("id");
    tip.removeAttribute("id");
    mindInk.parentElement.after(mask);
    letter.setAttribute("mask", `url(#${mask.id})`);
    return { letter, fill, tip, delay: index * 45 };
  }) : [];

  // Seeded positions keep the field stable on reload and on viewport changes.
  let seed = 1789;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  function traceGlyph(glyph, box) {
    if (glyph.localName === "path") return new Path2D(glyph.getAttribute("d"));
    const outline = new Path2D();
    if (glyph.localName === "polygon") {
      for (let index = 0; index < glyph.points.numberOfItems; index++) {
        const { x, y } = glyph.points.getItem(index);
        if (index === 0) outline.moveTo(x, y);
        else outline.lineTo(x, y);
      }
      outline.closePath();
    } else {
      outline.rect(box.x, box.y, box.width, box.height);
    }
    return outline;
  }

  // Use every original vector shape, including the digit fragments clipped by the letters.
  const glyphs = [...one.querySelectorAll("path, polygon, rect")].map(glyph => {
    const angle = random() * Math.PI * 2;
    const radius = Math.sqrt(random());
    const depth = random();
    const box = glyph.getBBox();
    // Keep the clipped edges quiet until they join the letterforms.
    const edgeFragment = box.height < 5.3 || box.width < 3.2;
    const x = Math.cos(angle) * radius * 0.67;
    const drift = random() - 0.5;
    const color = colors[Math.round(clamp(x + 0.5) * (colors.length - 1))];
    const fill = glyph.getAttribute("fill");
    return {
      x,
      y: Math.sin(angle) * radius * 0.80,
      depth,
      drift,
      release: depth * 530 + (drift + 0.5) * 170,
      perspective: 0.26 + 1.08 * depth ** 2,
      proximity: depth ** 3,
      opacity: (0.18 + random() * 0.54) * (edgeFragment ? 0.12 : 1),
      color,
      fieldFill: `rgb(${color.join(",")})`,
      outline: traceGlyph(glyph, box),
      fill,
      rgb: fill.slice(1).match(/../g).map(channel => parseInt(channel, 16)),
      stroke: glyph.getAttribute("stroke"),
      strokeWidth: Number(glyph.getAttribute("stroke-width")),
      halfWidth: box.width / 2,
      halfHeight: box.height / 2,
      targetX: box.x + box.width / 2,
      targetY: box.y + box.height / 2,
    };
  });
  const particles = [...glyphs].sort((left, right) => left.depth - right.depth);

  let width = 1;
  let height = 1;
  let pixelRatio = 1;
  let sized = false;
  let fieldPainted = false;
  let needsDraw = false;
  let frame = 0;
  let started = false;
  let complete = false;
  let elapsed = 0;
  let previousFrame;
  let paused = false;
  let observer;

  function resize() {
    const nextWidth = Math.max(1, document.documentElement.clientWidth);
    const nextHeight = Math.max(1, document.documentElement.clientHeight);
    const nextRatio = Math.min(devicePixelRatio || 1, 2.5);
    if (sized && nextWidth === width && nextHeight === height && nextRatio === pixelRatio) return false;
    sized = true;
    width = nextWidth;
    height = nextHeight;
    pixelRatio = nextRatio;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    fieldPainted = false;
    mark.setAttribute("viewBox", `0 0 ${width} ${height}`);
    return true;
  }

  const layerPoses = new WeakMap();
  function setLayer(layer, scale, x, y, alpha) {
    const pose = layerPoses.get(layer);
    if (alpha !== pose?.alpha) layer.setAttribute("opacity", alpha);
    if ((alpha > 0 || !pose) && (scale !== pose?.scale || x !== pose?.x || y !== pose?.y)) {
      layer.setAttribute("transform", `translate(${x} ${y}) scale(${scale})`);
      layerPoses.set(layer, { scale, x, y, alpha });
    } else if (pose) pose.alpha = alpha;
  }

  function drawField(time, wordPose, composition) {
    if (time >= formationEnd && !fieldPainted) return;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);
    fieldPainted = time < formationEnd;
    if (!fieldPainted) return;

    const fade = 1 - smooth(phase(time, 1450, 3150));
    if (!inBanner && !composition) {
      const glow = context.createLinearGradient(0, 0, width, 0);
      glow.addColorStop(0, "#edfaff");
      glow.addColorStop(0.49, "#fff");
      glow.addColorStop(1, "#fdf0ff");
      context.globalAlpha = fade * 0.7;
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);
    }
    const retreat = 1.18 - 0.34 * smooth(phase(time, 200, 2800));
    const fieldSize = Math.min(width, height * 2.15) * 0.009;
    const ink = smooth(phase(time, 2600, 3360));
    const originX = width * (composition?.originX ?? 0.5);
    const originY = height * (composition?.originY ?? 0.5);
    const originWidth = width * (composition?.originWidth ?? 0);
    context.miterLimit = 10;
    let filter = "none";
    for (const particle of ink === 1 ? glyphs : particles) {
      const { depth, drift, release, targetX, targetY } = particle;
      const emission = composition ? smooth(phase(time, release, release + 180)) : 1;
      if (emission === 0) continue;
      const spread = composition ? smooth(phase(time, release + 70, release + 1150)) : 1;
      const perspective = particle.perspective * retreat;
      const launchX = originX + particle.x * originWidth * 0.45;
      const launchY = originY + particle.y * originWidth * 0.14;
      const fieldX = mix(launchX, width * (0.5 + particle.x * perspective + drift * time / 14500), spread);
      const fieldY = mix(launchY, height * (0.5 + particle.y * perspective - drift * time / 11500), spread);
      const converge = smooth(phase(time, 850 + depth * 340, 2860 + depth * 280));
      const x = mix(fieldX, wordPose.x + targetX * wordPose.scale, converge);
      const y = mix(fieldY, wordPose.y + targetY * wordPose.scale, converge);
      const scale = mix(mix(1.35, 0.38 + fieldSize * particle.proximity, spread), wordPose.scale, converge);
      const blur = depth > 0.95 ? (depth - 0.95) * 58 * (1 - converge) : 0;
      if (ink === 0) {
        // Keep the filter halo and antialiasing inside the visibility bounds.
        const padding = blur * 4 + 2;
        const extentX = particle.halfWidth * scale + padding;
        const extentY = particle.halfHeight * scale + padding;
        if (x + extentX < 0 || x - extentX > width || y + extentY < 0 || y - extentY > height) continue;
      }
      context.setTransform(scale * pixelRatio, 0, 0, scale * pixelRatio,
        (x - targetX * scale) * pixelRatio, (y - targetY * scale) * pixelRatio);
      context.fillStyle = ink === 0 ? particle.fieldFill
        : ink === 1 ? particle.fill
        : `rgb(${particle.color.map((channel, index) => Math.round(mix(channel, particle.rgb[index], ink))).join(",")})`;
      const visibility = Math.min(1, particle.opacity * (1.85 - .85 * spread));
      context.globalAlpha = emission * mix(visibility, 1, converge);
      const nextFilter = blur > 0.7 ? `blur(${blur}px)` : "none";
      if (nextFilter !== filter) {
        context.filter = nextFilter;
        filter = nextFilter;
      }
      context.fill(particle.outline);
      if (ink > 0) {
        context.globalAlpha *= ink;
        context.strokeStyle = particle.stroke;
        context.lineWidth = particle.strokeWidth;
        context.stroke(particle.outline);
      }
    }
    context.globalAlpha = 1;
    if (filter !== "none") context.filter = "none";
  }

  function illuminateContour(time, scale, x, y) {
    if (contourStyle === "foco") {
      const lampTime = time - lampDelay;
      const ignition = smooth(phase(lampTime, 3150, 3480));
      const haloRise = smooth(phase(lampTime, 3150, 3380));
      const haloFade = 1 - smooth(phase(lampTime, 3490, lampHaloEnd));
      setLayer(contour, scale, x, y, ignition);
      setLayer(light, scale, x, y, haloRise * haloFade * 0.85);
      return;
    }

    const reveal = phase(time, 3150, 4640);
    const ignition = smooth(phase(time, 3150, 3310));
    const fade = 1 - smooth(phase(time, 4500, 4860));
    const distance = contourLength * reveal;
    const tip = sweep.getPointAtLength(distance);
    setLayer(contour, scale, x, y, ignition);
    setLayer(light, scale, x, y, ignition * fade);

    if (reveal > 0 && reveal < 1) {
      sweep.setAttribute("stroke-dashoffset", contourLength - distance);
      // The two tips are close enough for the wide mask to touch both at the start.
      // Open the right tip only as the drawing approaches it along the face.
      endGuard.setAttribute("opacity", reveal > 0.85 ? 1 - smooth(phase(tip.y, 916, 936)) : 1);
      contour.setAttribute("mask", "url(#contour-reveal)");
    } else {
      contour.removeAttribute("mask");
    }

    if (ignition && fade) {
      lightTip.setAttribute("cx", tip.x);
      lightTip.setAttribute("cy", tip.y);
    }
  }

  function drawMindInk(fill, tip, progress) {
    const edge = mix(676, 789, smooth(progress));
    fill.setAttribute("height", edge - 660);
    tip.setAttribute("y", edge);
  }

  function sampleWave(path) {
    const length = path.getTotalLength();
    const segments = 64;
    return Array.from({ length: segments + 1 }, (_, index) => {
      const position = index / segments;
      const { x, y } = path.getPointAtLength(length * position);
      const leading = path.getPointAtLength(Math.max(0, length * position - 1));
      const trailing = path.getPointAtLength(Math.min(length, length * position + 1));
      const dx = trailing.x - leading.x;
      const dy = trailing.y - leading.y;
      const size = Math.hypot(dx, dy);
      return {
        x, y, nx: -dy / size, ny: dx / size,
        taper: Math.sin(Math.PI * position) ** 1.45,
        distance: (2 * position - 1) ** 2,
      };
    });
  }

  function waveShape(first, second) {
    return `M${first.join("L")}L${second.reverse().join("L")}Z`;
  }

  function illuminateWave(beat, intensity, scale, x, y) {
    if (!intensity) {
      if (waveVisible) {
        waveLight.setAttribute("visibility", "hidden");
        waveRest.removeAttribute("opacity");
        waveVisible = false;
      }
      return;
    }

    const blueUpper = [];
    const blueLower = [];
    const pinkUpper = [];
    const pinkLower = [];
    const coreUpper = [];
    const coreLower = [];
    for (const point of wavePoints) {
      // The crown lights first, and the crest travels toward both tapered ends.
      const travelDelay = 0.22 * point.distance;
      const localBeat = Math.max(0, beat - travelDelay);
      const opening = smooth(phase(localBeat, 0, 0.24));
      const breadth = opening * intensity ** 0.7;
      const crest = Math.sin(Math.PI * smooth(phase(localBeat, 0.03, 0.8)));
      const sway = 2.8 * crest * breadth;
      const crossing = smooth(phase(localBeat, 0.23, 0.66));
      const separation = 12 * Math.cos(Math.PI * crossing) * breadth;
      const blueWidth = (7 + 3.7 * crest) * breadth;
      const pinkWidth = (6 + 3.2 * crest) * breadth;
      const coreWidth = (2.6 + 6 * crest) * breadth;
      const at = offset => {
        const distance = (sway + offset) * point.taper;
        return `${(point.x + point.nx * distance).toFixed(2)},${(point.y + point.ny * distance).toFixed(2)}`;
      };
      blueUpper.push(at(-separation - blueWidth));
      blueLower.push(at(-separation + blueWidth));
      pinkUpper.push(at(separation - pinkWidth));
      pinkLower.push(at(separation + pinkWidth));
      coreUpper.push(at(-coreWidth));
      coreLower.push(at(coreWidth));
    }
    waveBlue.setAttribute("d", waveShape(blueUpper, blueLower));
    wavePink.setAttribute("d", waveShape(pinkUpper, pinkLower));
    waveCore.setAttribute("d", waveShape(coreUpper, coreLower));
    waveRest.setAttribute("opacity", 1 - 0.68 * intensity);
    waveColor.setAttribute("opacity", mix(0.22, 0.87, intensity));
    setLayer(waveLight, scale, x, y, intensity);
    if (!waveVisible) {
      waveLight.removeAttribute("visibility");
      waveVisible = true;
    }
  }

  function pulseIntensity(beat) {
    return smooth(phase(beat, 0, pulsePeak)) * (1 - smooth(phase(beat, pulsePeak, 1)));
  }

  function draw(time, composition) {
    // Prepare the wave during the logo hold, after the binary canvas has finished.
    if (!wavePoints && (currentBannerIntro || rebuild) && time >= contourSettled) {
      wavePoints = sampleWave(document.querySelector("#contour-wave-axis"));
    }
    const introScale = composition
      ? width * composition.width / (724 / 1.2)
      : Math.min(height * 0.79 / logo.height, width * 0.72 / logo.width) * (inBanner ? 0.92 : 1);
    const restScale = Math.min(width / staticView.width, height * 0.864 / staticView.height);
    const rest = inBanner ? smooth(phase(time, restStart, duration)) : 0;
    const beat = composition ? (motion.matches ? 0 : clamp(composition.pulse))
      : currentBannerIntro ? phase(time, waveStart, waveEnd) : 0;
    const pulse = pulseIntensity(beat);
    const finalScale = mix(introScale, restScale, rest) * (1 + 0.10 * pulse);
    const centerY = mix(logo.y, staticView.y + staticView.height / 2, rest);
    const initialScale = Math.min(width * 0.9 / word.width, height * 0.74 / word.height);
    const x = width * (composition?.x ?? 0.5) - logo.x * finalScale;
    const y = height * (composition?.y ?? 0.5) - centerY * finalScale;
    // Stretch the approach gradually so the formed word never pauses or changes pace abruptly.
    const placementTime = time - landingExtension * smooth(phase(time, 2890, placementEnd));
    const settle = smooth(phase(placementTime, 1570, originalPlacementEnd));
    const scale = mix(initialScale, finalScale, settle ** 5.5);
    // The Canvas glyphs reach the exact pose of the static SVG before the renderer switches.
    const wordPose = {
      scale,
      x: mix(width / 2, x + word.x * finalScale, settle) - word.x * scale,
      y: mix(height / 2, y + word.y * finalScale, settle) - word.y * scale,
    };
    setLayer(one, wordPose.scale, wordPose.x, wordPose.y, time >= formationEnd ? 1 : 0);
    const nextLayerTime = time - nextLayerDelay;
    const mindEnd = mindStyle === "lateral" || mindStyle === "vertical" ? 3220 : 3080;
    const mindEntrance = phase(nextLayerTime, 2480, mindEnd);
    const mindProgress = 1 - (1 - mindEntrance) ** 3;
    const mindOffset = 1 - mindProgress;
    if (mindStyle === "lateral") {
      setLayer(mind, finalScale, x + mindOffset * width * 0.23, y, mindProgress);
    } else if (mindStyle === "vertical") {
      const descent = 102 * finalScale;
      setLayer(mind, finalScale, x, y - mindOffset * descent, smooth(mindEntrance));
    } else {
      setLayer(mind, finalScale, x, y, mindEntrance > 0 ? 1 : 0);
      if (staggeredMind) {
        for (const { letter, fill, tip, delay } of mindLetters) {
          if (!composition && !letter.hasAttribute("mask")) continue;
          const progress = phase(nextLayerTime - delay, 2480, 2945);
          if (progress === 1) letter.removeAttribute("mask");
          else {
            if (composition && !letter.hasAttribute("mask")) letter.setAttribute("mask", `url(#${fill.parentElement.id})`);
            drawMindInk(fill, tip, progress);
          }
        }
      } else if (mindEntrance > 0 && mindEntrance < 1) {
        drawMindInk(mindInk, mindInkTip, mindEntrance);
        mind.setAttribute("mask", "url(#mind-ink-reveal)");
      } else {
        mind.removeAttribute("mask");
      }
    }

    illuminateContour(nextLayerTime, finalScale, x, y);
    illuminateWave(beat, pulse, finalScale, x, y);
    drawField(time, wordPose, composition);
  }

  const resizeObserver = new ResizeObserver(() => {
    if (complete || !resize()) return;
    if (!started || paused) draw(elapsed);
    else needsDraw = true;
  });

  function finish() {
    complete = true;
    cancelAnimationFrame(frame);
    observer?.disconnect();
    resizeObserver.disconnect();
    document.body.classList.remove("playing");
    mark.setAttribute("viewBox", `${staticView.x} ${staticView.y} ${staticView.width} ${staticView.height}`);
    for (const layer of [one, mind, contour]) {
      layer.removeAttribute("transform");
      layer.removeAttribute("opacity");
      layer.removeAttribute("mask");
    }
    for (const { letter } of mindLetters) letter.removeAttribute("mask");
    canvas.remove();
    light.remove();
    waveLight.remove();
    waveRest.removeAttribute("opacity");
    motion.removeEventListener("change", onMotionChange);
    window.removeEventListener("message", onPlayback);
    startBannerDock();
  }

  function onMotionChange(event) {
    if (event.matches) finish();
  }

  function tick(now) {
    if (paused || complete) return;
    const previousTime = elapsed;
    if (previousFrame !== undefined) elapsed += now - previousFrame;
    previousFrame = now;
    if (elapsed >= duration) return finish();
    const holding = currentBannerIntro && previousTime >= contourSettled && elapsed < waveStart;
    if (needsDraw || (elapsed !== previousTime && !holding)) draw(elapsed);
    needsDraw = false;
    // Let the parent shrink the iframe while the mark settles into its static viewBox.
    if (currentBannerIntro && elapsed >= waveEnd) startBannerDock();
    frame = requestAnimationFrame(tick);
  }

  function onPlayback(event) {
    if (event.source !== parent || event.origin !== location.origin) return;
    if (event.data !== "one-mind:pause" && event.data !== "one-mind:resume") return;
    const nextPaused = event.data === "one-mind:pause";
    if (nextPaused === paused) return;
    paused = nextPaused;
    previousFrame = undefined;
    if (paused) cancelAnimationFrame(frame);
    else if (started) frame = requestAnimationFrame(tick);
  }

  document.body.classList.add("playing");
  if (rebuild) {
    let composition;
    const render = () => {
      if (!composition) return;
      draw(motion.matches ? contourSettled : clamp(composition.progress) * contourSettled, composition);
      document.documentElement.classList.remove("waiting-for-rebuild");
    };
    window.addEventListener("message", event => {
      if (event.source !== parent || event.origin !== location.origin || event.data?.type !== "one-mind:rebuild") return;
      const { progress, pulse, x, y, width, originX, originY, originWidth } = event.data;
      if (![progress, pulse, x, y, width, originX, originY, originWidth].every(Number.isFinite)) return;
      composition = event.data;
      if (!sized) resize();
      render();
    });
    new ResizeObserver(() => {
      if (composition && resize()) render();
    }).observe(document.documentElement);
    motion.addEventListener("change", render);
    return;
  }
  resize();
  draw(0);
  resizeObserver.observe(document.documentElement);
  motion.addEventListener("change", onMotionChange);
  observer = new IntersectionObserver(([entry]) => {
    if (entry.intersectionRatio < 0.45 || started) return;
    started = true;
    observer.disconnect();
    if (!paused) frame = requestAnimationFrame(tick);
  }, { threshold: 0.45 });
  observer.observe(document.body);
  if (inBanner && parent !== window) {
    window.addEventListener("message", onPlayback);
    parent.postMessage("one-mind:ready", "*");
  }
})();
