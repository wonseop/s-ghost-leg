import EventEmitter from './event-emitter.js';

(() => {
  const Console = window.console || {};

  const HORIZONTAL_NODE_WIDTH = 55;
  const VERTICAL_NODE_HEIGHT = 25;
  const FINDING_ROOT_BORDER_WIDTH = 5;
  const LADDER_ROWS = {};
  const GLOBAL_FOOT_PRINT = {};
  const GLOBAL_CHECK_FOOT_PRINT = {};
  const DEFAULT_GOAL_VALUE = '';
  const DEFAULT_VERTICAL_NODES = 20;
  const DEFAULT_LINE_WIDTH = '2';
  const DEFAULT_LINE_COLOR = '#999';
  const ANIMATION_TERM = 20;

  let ladderElement;
  let ladderCanvas;
  let dimElement;

  let horizontalNode = 0;
  let row = 0;
  let working = false;
  let ctx;
  let userName = '';

  function hasOwnProperty(obj, property) {
    return Object.prototype.hasOwnProperty.call(obj, property);
  }

  function shuffle(arr) {
    const newArr = arr;
    let currentIndex = newArr.length;
    let temporaryValue;
    let randomIndex;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      temporaryValue = newArr[currentIndex];
      newArr[currentIndex] = newArr[randomIndex];
      newArr[randomIndex] = temporaryValue;
    }

    return newArr;
  }

  function stokeLine(x, y, flag, dir, color, width) {
    let moveToStart = 0;
    let moveToEnd = 0;
    let lineToStart = 0;
    let lineToEnd = 0;

    const eachWidth = HORIZONTAL_NODE_WIDTH;
    const eachHeight = VERTICAL_NODE_HEIGHT;

    if (!ctx) {
      ctx = ladderCanvas.getContext('2d');
    }

    if (flag === 'w') {
      // 가로줄
      if (dir === 'r') {
        ctx.beginPath();
        moveToStart = x * eachWidth;
        moveToEnd = y * eachHeight;
        lineToStart = (x + 1) * eachWidth;
        lineToEnd = y * eachHeight;
      } else {
        // dir "l"
        ctx.beginPath();
        moveToStart = x * eachWidth;
        moveToEnd = y * eachHeight;
        lineToStart = (x - 1) * eachWidth;
        lineToEnd = y * eachHeight;
      }
    } else {
      ctx.beginPath();
      moveToStart = x * eachWidth;
      moveToEnd = y * eachHeight;
      lineToStart = x * eachWidth;
      lineToEnd = (y + 1) * eachHeight;
    }

    ctx.moveTo(moveToStart + 3, moveToEnd + 2);
    ctx.lineTo(lineToStart + 3, lineToEnd + 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
    ctx.closePath();
  }

  function setDefaultFootPrint() {
    for (let r = 0; r < DEFAULT_VERTICAL_NODES; r += 1) {
      for (let column = 0; column < horizontalNode; column += 1) {
        GLOBAL_FOOT_PRINT[`${column}-${r}`] = false;
      }
    }
  }

  function reSetCheckFootPrint() {
    for (let r = 0; r < DEFAULT_VERTICAL_NODES; r += 1) {
      for (let column = 0; column < horizontalNode; column += 1) {
        GLOBAL_CHECK_FOOT_PRINT[`${column}-${r}`] = false;
      }
    }
  }

  function setDefaultRowLine() {
    let x; let y; let rowArr; let
      node;

    for (y = 0; y < DEFAULT_VERTICAL_NODES; y += 1) {
      rowArr = [];

      for (x = 0; x < horizontalNode; x += 1) {
        node = `${x}-${row}`;
        rowArr.push(node);
      }
      LADDER_ROWS[row] = rowArr;
      row += 1;
    }
  }

  function startLineDrawing(node, color) {
    let downNode;
    const x = node.split('-')[0] * 1;
    const y = node.split('-')[1] * 1;
    const nodeInfo = GLOBAL_FOOT_PRINT[node];

    GLOBAL_CHECK_FOOT_PRINT[node] = true;

    if (y === DEFAULT_VERTICAL_NODES) {
      reSetCheckFootPrint();

      const target = document.querySelector(`div[data-node="${node}"]`);
      target.style.borderColor = color;
      target.style.borderWidth = `${FINDING_ROOT_BORDER_WIDTH}px`;
      document.getElementById(`${node}-user`).innerText = userName;
      working = false;

      return false;
    }

    if (nodeInfo.change) {
      const leftNode = `${x - 1}-${y}`;
      const rightNode = `${x + 1}-${y}`;
      downNode = `${x}-${y + 1}`;
      const leftNodeInfo = GLOBAL_FOOT_PRINT[leftNode];
      const rightNodeInfo = GLOBAL_FOOT_PRINT[rightNode];

      if (hasOwnProperty(GLOBAL_FOOT_PRINT, leftNode)
        && hasOwnProperty(GLOBAL_FOOT_PRINT, rightNode)) {
        if ((leftNodeInfo.change && leftNodeInfo.draw && !GLOBAL_CHECK_FOOT_PRINT[leftNode])
          && rightNodeInfo.change && !GLOBAL_CHECK_FOOT_PRINT[rightNode]) {
          // Left우선
          Console.log('중복일때  LEFT 우선');
          stokeLine(x, y, 'w', 'l', color, FINDING_ROOT_BORDER_WIDTH);
          setTimeout(() => startLineDrawing(leftNode, color), ANIMATION_TERM);
        } else if ((leftNodeInfo.change && !leftNodeInfo.draw && !GLOBAL_CHECK_FOOT_PRINT[leftNode])
          && (rightNodeInfo.change) && !GLOBAL_CHECK_FOOT_PRINT[rightNode]) {
          Console.log('RIGHT 우선');
          stokeLine(x, y, 'w', 'r', color, FINDING_ROOT_BORDER_WIDTH);
          Console.log('right');
          setTimeout(() => startLineDrawing(rightNode, color), ANIMATION_TERM);
        } else if ((leftNodeInfo.change && leftNodeInfo.draw && !GLOBAL_CHECK_FOOT_PRINT[leftNode])
          && !rightNodeInfo.change) {
          // Left우선
          Console.log('LEFT 우선');
          stokeLine(x, y, 'w', 'l', color, FINDING_ROOT_BORDER_WIDTH);
          setTimeout(() => startLineDrawing(leftNode, color), ANIMATION_TERM);
        } else if (!leftNodeInfo.change
          && (rightNodeInfo.change) && !GLOBAL_CHECK_FOOT_PRINT[rightNode]) {
          // Right우선
          Console.log('RIGHT 우선');
          stokeLine(x, y, 'w', 'r', color, FINDING_ROOT_BORDER_WIDTH);
          setTimeout(() => startLineDrawing(rightNode, color), ANIMATION_TERM);
        } else {
          Console.log('DOWN 우선');
          stokeLine(x, y, 'h', 'd', color, FINDING_ROOT_BORDER_WIDTH);
          setTimeout(() => startLineDrawing(downNode, color), ANIMATION_TERM);
        }
      } else {
        Console.log('else');
        if (!hasOwnProperty(GLOBAL_FOOT_PRINT, leftNode)
          && hasOwnProperty(GLOBAL_FOOT_PRINT, rightNode)) {
          // / 좌측라인
          Console.log('좌측라인');
          if ((rightNodeInfo.change && !rightNodeInfo.draw)
            && !GLOBAL_CHECK_FOOT_PRINT[rightNode]) {
            // Right우선
            Console.log('RIGHT 우선');
            stokeLine(x, y, 'w', 'r', color, FINDING_ROOT_BORDER_WIDTH);
            setTimeout(() => startLineDrawing(rightNode, color), ANIMATION_TERM);
          } else {
            Console.log('DOWN');
            stokeLine(x, y, 'h', 'd', color, FINDING_ROOT_BORDER_WIDTH);
            setTimeout(() => startLineDrawing(downNode, color), ANIMATION_TERM);
          }
        } else if (hasOwnProperty(GLOBAL_FOOT_PRINT, leftNode)
          && !hasOwnProperty(GLOBAL_FOOT_PRINT, rightNode)) {
          // / 우측라인
          Console.log('우측라인');
          if ((leftNodeInfo.change && leftNodeInfo.draw) && !GLOBAL_CHECK_FOOT_PRINT[leftNode]) {
            // Right우선
            Console.log('LEFT 우선');
            stokeLine(x, y, 'w', 'l', color, FINDING_ROOT_BORDER_WIDTH);
            setTimeout(() => startLineDrawing(leftNode, color), 100);
          } else {
            Console.log('DOWN');
            stokeLine(x, y, 'h', 'd', color, FINDING_ROOT_BORDER_WIDTH);
            setTimeout(() => startLineDrawing(downNode, color), ANIMATION_TERM);
          }
        }
      }
    } else {
      Console.log('down');
      downNode = `${x}-${y + 1}`;
      stokeLine(x, y, 'h', 'd', color, FINDING_ROOT_BORDER_WIDTH);
      setTimeout(() => startLineDrawing(downNode, color), ANIMATION_TERM);
    }

    return true;
  }

  function userSetting() {
    const userList = LADDER_ROWS[0];
    let html = '';
    let member;
    let shuffleMembers = [];
    let length;

    if (window.ladderData) {
      shuffleMembers = window.ladderData.goals;
      length = window.ladderData.members.length - shuffleMembers.length;

      if (length > 0) {
        for (let i = 0; i < length; i += 1) {
          shuffleMembers.push(DEFAULT_GOAL_VALUE);
        }
      }

      shuffleMembers = shuffle(shuffleMembers);
    }

    for (let i = 0; i < userList.length; i += 1) {
      const color = `#${(function lol(m, s, c) { return s[m.floor(m.random() * s.length)] + (c && lol(m, s, c - 1)); }(Math, '0123456789ABCDEF', 4))}`;
      const x = userList[i].split('-')[0] * 1;
      const left = x * HORIZONTAL_NODE_WIDTH - 30;

      member = shuffleMembers[i] || '';

      html += `<div class="user-wrap" style="left:${left}px">`
        + `<input type="text" value="${member}" data-node="${userList[i]}">`
        + `<button class="ladder-start" style="background-color:${color}" data-color="${color}" data-node="${userList[i]}"></button>`
        + '</div>';
    }
    ladderElement.insertAdjacentHTML('beforeend', html);
  }

  function resultSetting() {
    let html = '';
    const resultList = LADDER_ROWS[DEFAULT_VERTICAL_NODES - 1];
    let goals = [];

    if (window.ladderData) {
      goals = shuffle(window.ladderData.members);
    }

    for (let i = 0; i < resultList.length; i += 1) {
      const x = resultList[i].split('-')[0] * 1;
      const y = resultList[i].split('-')[1] * 1 + 1;
      const node = `${x}-${y}`;
      const left = x * HORIZONTAL_NODE_WIDTH - 30;
      const goal = goals[i] || '';
      html += `<div class="answer-wrap" style="left:${left}px">`;
      html += `<div contenteditable=true data-node="${node}">${goal}</div>`;
      html += `<p contenteditable=true id="${node}-user"></p>`;
      html += '</div>';
    }

    ladderElement.insertAdjacentHTML('beforeend', html);
  }

  function drawNodeLine() {
    const color = DEFAULT_LINE_COLOR;
    const width = DEFAULT_LINE_WIDTH;

    for (let y = 0; y < DEFAULT_VERTICAL_NODES; y += 1) {
      for (let x = 0; x < horizontalNode; x += 1) {
        const node = `${x}-${y}`;
        const nodeInfo = GLOBAL_FOOT_PRINT[node];
        if (nodeInfo.change && nodeInfo.draw) {
          stokeLine(x, y, 'w', 'r', color, width);
        }
        stokeLine(x, y, 'h', 'd', color, width);
      }
    }
  }

  function setRandomNodeData() {
    let x;
    let y;
    let loopNode;
    let rand;

    for (y = 0; y < DEFAULT_VERTICAL_NODES; y += 1) {
      for (x = 0; x < horizontalNode; x += 1) {
        loopNode = `${x}-${y}`;
        rand = Math.floor(Math.random() * 2);

        if (rand === 0) {
          GLOBAL_FOOT_PRINT[loopNode] = { change: false, draw: false };
        } else if (x === (horizontalNode - 1)) {
          GLOBAL_FOOT_PRINT[loopNode] = { change: false, draw: false };
        } else {
          GLOBAL_FOOT_PRINT[loopNode] = { change: true, draw: true };
          x += 1;
          loopNode = `${x}-${y}`;
          GLOBAL_FOOT_PRINT[loopNode] = { change: true, draw: false };
        }
      }
    }
  }

  function drawCanvas(member) {
    horizontalNode = member;

    ladderElement.style.width = `${(horizontalNode - 1) * HORIZONTAL_NODE_WIDTH + 6}px`;
    ladderElement.style.height = `${(DEFAULT_VERTICAL_NODES - 1) * VERTICAL_NODE_HEIGHT + 6}px`;
    ladderElement.style.backgroundColor = '#fff';

    ladderCanvas.setAttribute('width', (horizontalNode - 1) * HORIZONTAL_NODE_WIDTH + 6);
    ladderCanvas.setAttribute('height', (DEFAULT_VERTICAL_NODES - 1) * VERTICAL_NODE_HEIGHT + 6);

    setDefaultFootPrint();
    reSetCheckFootPrint();
    setDefaultRowLine();
    setRandomNodeData();
    drawNodeLine();
    userSetting();
    resultSetting();
  }

  document.addEventListener('click', (e) => {
    let isDelegated = false;

    for (let { target } = e; target && target !== this; target = target.parentNode) {
      if (target.matches && target.matches('button.ladder-start')) {
        isDelegated = true;
        break;
      }
    }

    if (!isDelegated) {
      return false;
    }

    if (working) {
      return false;
    }

    if (dimElement) {
      dimElement.remove();
      dimElement = null;
    }

    working = true;
    reSetCheckFootPrint();
    const { target } = e;
    target.setAttribute('disabled', true);
    target.style.color = '#000';
    target.style.border = '1px solid #F2F2F2';
    target.style.opacity = '0.3';

    const node = target.getAttribute('data-node');
    const color = target.getAttribute('data-color');

    startLineDrawing(node, color);
    userName = document.querySelector(`input[data-node="${node}"]`).value;

    return true;
  });

  class SGhostLeg extends EventEmitter {
    constructor(target, options) {
      super();

      ladderElement = target;

      this.dimElement = dimElement = document.createElement('div');
      this.dimElement.className = 'sgl-dim';
      target.appendChild(this.dimElement);

      this.ladderCanvas = ladderCanvas = document.createElement('canvas');
      this.ladderCanvas.className = 'sgl-ladder-canvas';
      target.appendChild(this.ladderCanvas);

      this.member = options.member || 4;
      drawCanvas(this.member);
      Console.log('creation success!');
    }
  }

  window.SGhostLeg = SGhostLeg;
})();
