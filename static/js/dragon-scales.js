(function () {
  let canvas, ctx;
  let mouseX, mouseY;

  const EDGE_LENGTH = 15; // Visual length of each cube edge
  const CANVAS_BACKGROUND_COLOR = '#0f4c81';
  const BASE_LINE_COLOR = '#1a6cb3'; // Made lines brighter
  const HOVER_LINE_COLOR = '#f0c244'; // Bright cyan
  const HOVER_HIGHLIGHT_DURATION = 1000; // 1 secondç
  const LINE_PATTERNS = {
    'hexagon': 6,
    'wave': 2,
    'line': 1,
  };

  // Spacing for the grid of cube centers (based on flat-topped hexagons as the cube tops)
  // Radius of the hexagon (center to vertex) is EDGE_LENGTH
  const CUBE_COL_WIDTH = () => EDGE_LENGTH * Math.sqrt(3); // Horizontal distance between centers in a conceptual column
  const CUBE_ROW_HEIGHT = () => EDGE_LENGTH * 1.5;       // Vertical distance between rows of centers

  let activeItems = {}; // Stores { 'row-col': expiryTime } for hovered cube units

  // Helper to draw a single line
  function drawLine(context, startX, startY, endX, endY) {
    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.stroke();
  }

  // Calculates the 9 lines for one isometric cube
  function getCubeLines(centerX, centerY, edgeLength) {
    const lines = [];
    const hexRadius = edgeLength; // Top hexagon's radius is the cube's edge length

    const topVertices = [];
    for (let i = 0; i < 6; i++) {
      // Flat-topped hexagon vertices
      const angle = (Math.PI / 3) * i + (Math.PI / 6);
      topVertices.push({
        x: centerX + hexRadius * Math.cos(angle),
        y: centerY + hexRadius * Math.sin(angle),
      });
    }

    // Lines for the top hexagon face
    for (let i = 0; i < 6; i++) {
      lines.push({
        startX: topVertices[i].x, startY: topVertices[i].y,
        endX: topVertices[(i + 1) % 6].x, endY: topVertices[(i + 1) % 6].y,
      });
    }

    // Lines from center to each vertex of the top hexagon face
    //for (let i = 0; i < 6; i++) {
    //  lines.push({
    //    startX: centerX, startY: centerY,
    //    endX: topVertices[i].x, endY: topVertices[i].y,
    //  });
    //}

    return lines;
  }

  function initialize() {
    canvas = document.getElementById('dragonScalesCanvas');
    ctx = canvas.getContext('2d');
    mouseX = window.innerWidth / 2;
    mouseY = window.innerHeight / 2;

    window.addEventListener('resize', handleResize);
    document.addEventListener('mousemove', handleMouseMove);

    handleResize();
    animateLoop();
  }

  function handleResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function handleMouseMove(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
    activateCubeOnHover();
  }

  function activateCubeOnHover() {
    const colWidth = CUBE_COL_WIDTH();
    const rowHeight = CUBE_ROW_HEIGHT();

    // Determine the grid cell (row, col) of the cube unit under the mouse
    const approxRow = Math.round(mouseY / rowHeight);
    const xOffsetForRow = (approxRow % 2 !== 0) ? colWidth / 2 : 0;
    const approxCol = Math.round((mouseX - xOffsetForRow) / colWidth);

    // For simplicity, activate the single closest guessed cube unit.
    // A more complex approach might check distances to multiple nearby cube centers.
    const cubeKey = `${approxRow}-${approxCol}`;
    activeItems[cubeKey] = Date.now() + HOVER_HIGHLIGHT_DURATION;
  }

  function drawIsometricCubePattern(linePattern = 'hexagon') {
    ctx.fillStyle = CANVAS_BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 1; // Increased line thickness

    const colWidth = CUBE_COL_WIDTH();
    const rowHeight = CUBE_ROW_HEIGHT();
    const currentTime = Date.now();

    const numRows = Math.ceil(canvas.height / rowHeight) + 2;
    const numCols = Math.ceil(canvas.width / colWidth) + 2;

    // First pass: Draw all non-highlighted cubes
    for (let r = -1; r < numRows; r++) {
      for (let c = -1; c < numCols; c++) {
        const cubeKey = `${r}-${c}`;
        if (!activeItems[cubeKey] || activeItems[cubeKey] <= currentTime) {
          const xOffsetForRow = (r % 2 !== 0) ? colWidth / 2 : 0;
          const cubeCenterX = c * colWidth + xOffsetForRow;
          const cubeCenterY = r * rowHeight;

          ctx.strokeStyle = BASE_LINE_COLOR;
          let lines = getCubeLines(cubeCenterX, cubeCenterY, EDGE_LENGTH);
          lines = lines.slice(0, LINE_PATTERNS[linePattern] || 6);
          for (const line of lines) {
            drawLine(ctx, line.startX, line.startY, line.endX, line.endY);
          }
        }
      }
    }

    // Second pass: Draw highlighted cubes on top
    for (const cubeKey in activeItems) {
      if (activeItems[cubeKey] > currentTime) {
        const [rStr, cStr] = cubeKey.split('-');
        const r = parseInt(rStr, 10);
        const c = parseInt(cStr, 10);

        const xOffsetForRow = (r % 2 !== 0) ? colWidth / 2 : 0;
        const cubeCenterX = c * colWidth + xOffsetForRow;
        const cubeCenterY = r * rowHeight;

        ctx.strokeStyle = HOVER_LINE_COLOR;
        let lines = getCubeLines(cubeCenterX, cubeCenterY, EDGE_LENGTH);
        // Apply the same pattern logic for highlighted cubes, or always full hexagon if preferred
        lines = lines.slice(0, LINE_PATTERNS[linePattern] || 6); 
        for (const line of lines) {
          drawLine(ctx, line.startX, line.startY, line.endX, line.endY);
        }
      } else {
        // Clean up expired items as we iterate
        delete activeItems[cubeKey];
      }
    }
  }

  function getDailyLinePattern() {
    // Use the current date to select a pattern that stays consistent throughout the day
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    const patterns = Object.keys(LINE_PATTERNS);
    // Create a deterministic index based on the date
    const dateHash = dateString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return patterns[dateHash % patterns.length];
  }

  function animateLoop() {
    const linePattern = getDailyLinePattern();
    drawIsometricCubePattern(linePattern); // 'line' || 'hexagon' || 'wave'
    requestAnimationFrame(animateLoop);
  }

  initialize();
})(); 