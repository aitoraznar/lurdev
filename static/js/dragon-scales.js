(function () {
  const canvas = document.getElementById('dragonScalesCanvas');
  const ctx = canvas.getContext('2d');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resizeCanvas);
  document.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;

    // Determine which scale the mouse is over and activate it
    const c = Math.floor(mouseX / (scaleSize * (1 - scaleOverlap)));
    const r = Math.floor(mouseY / (scaleSize * (1 - scaleOverlap)));
    
    // Adjust for staggered rows to get the approximate scale under cursor
    // This logic is simplified and might not be perfectly accurate for precise hit detection on edges, 
    // but good enough for this effect.
    // A more precise hit detection would involve checking distance to all nearby scales.
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const checkRow = r + dr;
        const checkCol = c + dc;
        
        const xOffset = (checkRow % 2 === 0) ? 0 : scaleSize / 2;
        const scaleCenterX = checkCol * scaleSize * (1 - scaleOverlap) + xOffset;
        const scaleCenterY = checkRow * scaleSize * (1 - scaleOverlap);

        const dx = scaleCenterX - mouseX;
        const dy = scaleCenterY - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= scaleSize / 5) { // Your existing hover detection logic (e.g. scaleSize / 5)
            const scaleKey = `${checkRow}-${checkCol}`;
            activeScales[scaleKey] = Date.now() + highlightDuration;
        }
      }
    }
  });

  resizeCanvas(); // Initial resize

  const scaleSize = 50; // Size of each scale
  const scaleOverlap = 0.6; // How much scales overlap (0 to 1)
  const baseColor = { r: 15, g: 76, b: 129 }; // Dark blue, matching --main-color
  const hoverColor = { r: baseColor.r + 60, g: baseColor.g + 60, b: baseColor.b + 60 };
  const highlightDuration = 1000; // 1 second in milliseconds
  let activeScales = {}; // Stores scales that should be highlighted and their expiry time

  function drawScales() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const rows = Math.ceil(canvas.height / (scaleSize * (1 - scaleOverlap))) + 1;
    const cols = Math.ceil(canvas.width / (scaleSize * (1 - scaleOverlap))) + 1;
    const currentTime = Date.now();

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const xOffset = (row % 2 === 0) ? 0 : scaleSize / 2;
        const x = col * scaleSize * (1 - scaleOverlap) + xOffset;
        const y = row * scaleSize * (1 - scaleOverlap);

        let r, g, b;
        const scaleKey = `${row}-${col}`;

        if (activeScales[scaleKey] && activeScales[scaleKey] > currentTime) {
          // Scale is active and highlight hasn't expired
          r = hoverColor.r;
          g = hoverColor.g;
          b = hoverColor.b;
        } else {
          // Scale is not active or highlight expired
          if (activeScales[scaleKey]) {
            delete activeScales[scaleKey]; // Clean up expired scale
          }
          r = baseColor.r;
          g = baseColor.g;
          b = baseColor.b;
        }

        ctx.beginPath();
        ctx.arc(x, y, scaleSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
        
        // Add a slight border to scales for definition
        ctx.strokeStyle = `rgba(${baseColor.r - 10}, ${baseColor.g - 10}, ${baseColor.b - 10}, 0.5)`;
        ctx.lineWidth = 1;

        ctx.fill();
        ctx.stroke();
      }
    }
  }

  function animate() {
    drawScales();
    requestAnimationFrame(animate);
  }

  animate();
})(); 