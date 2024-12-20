import { useEffect, useRef } from "react";
import PropTypes, { number } from "prop-types";
import song from "../../assets/songs/christmas.mp3";

let animationController;

const MusicVisualizer = ({
  width,
  height,
  waveMaxHeight = 36,
  // rgb = { r: 198, g: 231, b: 255 },
}) => {
  const canvasRef = useRef();
  const audioRef = useRef();
  const source = useRef();
  const analyser = useRef();
  const radius = width / 2 - waveMaxHeight;
  const spacing = 1;

  const handleAudioPlay = () => {
    let audioContext = new AudioContext();
    if (!source.current) {
      source.current = audioContext.createMediaElementSource(audioRef.current);
      analyser.current = audioContext.createAnalyser();
      source.current.connect(analyser.current);
      analyser.current.connect(audioContext.destination);
      analyser.smoothingTimeConstant = 1;
    }
    visualizeData();
  };

  const visualizeData = () => {
    animationController = window.requestAnimationFrame(visualizeData);
    if (audioRef.current.paused) {
      return cancelAnimationFrame(animationController);
    }
    analyser.fftSize = 256;
    const songData = new Uint8Array(Math.floor(180 / spacing) + 1);
    analyser.current.getByteFrequencyData(songData);


    let previousPeak = false;
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 1;
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#C6E7FF"
    ctx.setLineDash([]);

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop("0", "#C6E7FF");
    gradient.addColorStop("1.0", "#D4F6FF");
    ctx.strokeStyle = gradient;

    // ctx.fillRect(0, 0, 500, 500)

    let lax, lay, lbx, lby;
    let rax, ray, rbx, rby;

    const lAbovePath = new Path2D();
    const lBellowPath = new Path2D();
    const rAbovePath = new Path2D();
    const rBellowPath = new Path2D();

    for (let i = 0; i < songData.length; i++) {
      const angle = ((-i * spacing + 90) * Math.PI) / 180;
      let data = (songData[i] / 128) * waveMaxHeight;

      if (data < waveMaxHeight) {
        data = waveMaxHeight + 1;
      }

      // if (previousPeak) {
      //   data = waveMaxHeight + 1
      //   previousPeak = false;
      // } else {
      //   previousPeak = true;
      // }

      let tDiff = radius - waveMaxHeight + data;
      let bDiff = radius + waveMaxHeight - data;

      lax = tDiff * Math.cos(angle);
      lay = tDiff * Math.sin(angle);
      lbx = bDiff * Math.cos(angle);
      lby = bDiff * Math.sin(angle);

      rax = tDiff * Math.cos(-angle);
      ray = tDiff * Math.sin(-angle);
      rbx = bDiff * Math.cos(-angle);
      rby = bDiff * Math.sin(-angle);

      lAbovePath.lineTo(width / 2 - lax, height / 2 - lay);
      lBellowPath.lineTo(width / 2 - lbx, height / 2 - lby);
      rAbovePath.lineTo(width / 2 + rax, height / 2 + ray);
      rBellowPath.lineTo(width / 2 + rbx, height / 2 + rby);

      ctx.beginPath();
      ctx.moveTo(width / 2 - lax, height / 2 - lay);
      ctx.lineTo(width / 2 - lbx, height / 2 - lby);
      ctx.stroke();
      ctx.closePath();

      ctx.beginPath();
      ctx.moveTo(width / 2 + rax, height / 2 + ray);
      ctx.lineTo(width / 2 + rbx, height / 2 + rby);
      ctx.stroke();
      ctx.closePath();
    }

    ctx.setLineDash([2, 1]);
    ctx.lineWidth = 3;
    ctx.stroke(lAbovePath);
    ctx.stroke(lBellowPath);
    ctx.stroke(rAbovePath);
    ctx.stroke(rBellowPath);
    ctx.closePath();
  };

  return (
    <div>
      <canvas ref={canvasRef} width={width} height={height} />
      <audio controls ref={audioRef} preload="auto" onPlay={handleAudioPlay}>
        <source src={song} type="audio/mpeg" />
        Your browser does not support the audio tag.
      </audio>
    </div>
  );
};

export default MusicVisualizer;

MusicVisualizer.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  waveMaxHeight: PropTypes.number,
  // rgb: { r: number, g: number, b: number },
};
