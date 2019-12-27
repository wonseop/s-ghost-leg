document.addEventListener("DOMContentLoaded", function () {
  var verticalNode = 20;
  var horizontalNode = 0;
  var HORIZONTAL_NODE_WIDTH = 55;
  var DEFAULT_GOAL_VALUE = "";
  var FINDING_NODE_WIDTH = 5;

  var LADDER = {};
  var row = 0;
  var ladder = document.getElementById('ladder');
  var ladder_canvas = document.getElementById('ladder_canvas');
  var GLOBAL_FOOT_PRINT = {};
  var GLOBAL_CHECK_FOOT_PRINT = {};
  var working = false;

  var DEFAULT_LINE_WIDTH = '2';
  var DEFAULT_LINE_COLOR = '#999';
  var ANIMATION_TERM= 100;

  var _ctx;

  function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  }

  if (window._ladderData) {
    document.getElementsByClassName('fill-area')[0].style.display = "none";
  }

  document.getElementById("button").addEventListener('click', function () {
    var member;

    if (window._ladderData) {
      member = window._ladderData.members.length;
    } else {
      member = document.querySelector('input[name=member]').value;

      if (member < 2) {
        return alert('최소 2명 이상 선택하세요.');
      }

      if (member > 25) {
        return alert('너무 많아요.. ㅠㅠ');
      }
    }

    document.getElementById('landing').style.opacity = '0';
    horizontalNode = member;

    setTimeout(function () {
      document.getElementById('landing').remove();
      $('body').removeClass("animation");
      canvasDraw();
    }, 310);
  });

  function canvasDraw() {
    ladder.style.width = ((horizontalNode - 1) * HORIZONTAL_NODE_WIDTH + 6) + "px";
    ladder.style.height = ((verticalNode - 1) * 25 + 6) + "px";
    ladder.style.backgroundColor = "#fff";

    ladder_canvas.setAttribute("width", (horizontalNode - 1) * HORIZONTAL_NODE_WIDTH + 6);
    ladder_canvas.setAttribute("height", (verticalNode - 1) * 25 + 6);

    setDefaultFootPrint();
    reSetCheckFootPrint();
    setDefaultRowLine();
    setRandomNodeData();
    drawNodeLine();
    userSetting();
    resultSetting();
  }

  var userName = "";
  $(document).on('click', 'button.ladder-start', function (e) {
    if (working) {
      return false;
    }
    $('.dim').remove();
    working = true;
    reSetCheckFootPrint();
    var _this = $(e.target);
    _this.attr('disabled', true).css({
      'color': '#000',
      'border': '1px solid #F2F2F2',
      'opacity': '0.3'
    })
    var node = _this.attr('data-node');
    var color = _this.attr('data-color');

    // var bgm = $("#bgm-rally-x")[0];
    // bgm.play();

    startLineDrawing(node, color);
    userName = $('input[data-node="' + node + '"]').val();
  });

  function startLineDrawing(node, color) {
    var downNode;
    var x = node.split('-')[0] * 1;
    var y = node.split('-')[1] * 1;
    var nodeInfo = GLOBAL_FOOT_PRINT[node];

    GLOBAL_CHECK_FOOT_PRINT[node] = true;

    if (y == verticalNode) {
      reSetCheckFootPrint();
      var target = $('div[data-node="' + node + '"]');
      target.css({
        'border-color': color,
        'border-width': '3px'
      })
      $('#' + node + "-user").text(userName);
      working = false;
      // var bgm = $("#bgm-rally-x")[0];
      // bgm.pause();
      // bgm.currentTime = 0;

      // if (target.text() === DEFAULT_GOAL_VALUE) {
      //   var bgmFailure = document.querySelectorAll("#bgm-failure")[0];
      //   bgmFailure.play();
      // } else {
      //   var bgmSuccess = $("#bgm-success")[0];
      //   bgmSuccess.play();
      // }

      return false;
    }
    if (nodeInfo.change) {
      var leftNode = (x - 1) + "-" + y;
      var rightNode = (x + 1) + "-" + y;
      downNode = x + "-" + (y + 1);
      var leftNodeInfo = GLOBAL_FOOT_PRINT[leftNode];
      var rightNodeInfo = GLOBAL_FOOT_PRINT[rightNode];

      if (GLOBAL_FOOT_PRINT.hasOwnProperty(leftNode) && GLOBAL_FOOT_PRINT.hasOwnProperty(rightNode)) {
        if ((leftNodeInfo.change && leftNodeInfo.draw && !GLOBAL_CHECK_FOOT_PRINT[leftNode]) && rightNodeInfo.change && !GLOBAL_CHECK_FOOT_PRINT[rightNode]) {
          //Left우선
          console.log("중복일때  LEFT 우선");
          stokeLine(x, y, 'w', 'l', color, FINDING_NODE_WIDTH);
          setTimeout(function () {
            return startLineDrawing(leftNode, color);
          }, ANIMATION_TERM);
        }
        else if ((leftNodeInfo["change"] && !leftNodeInfo["draw"] && !GLOBAL_CHECK_FOOT_PRINT[leftNode]) && (rightNodeInfo["change"]) && !GLOBAL_CHECK_FOOT_PRINT[rightNode]) {
          console.log('RIGHT 우선')
          stokeLine(x, y, 'w', 'r', color, FINDING_NODE_WIDTH);
          console.log("right")
          setTimeout(function () {
            return startLineDrawing(rightNode, color);
          }, ANIMATION_TERM);
        }
        else if ((leftNodeInfo["change"] && leftNodeInfo["draw"] && !GLOBAL_CHECK_FOOT_PRINT[leftNode]) && !rightNodeInfo["change"]) {
          //Left우선
          console.log("LEFT 우선");
          stokeLine(x, y, 'w', 'l', color, FINDING_NODE_WIDTH);
          setTimeout(function () {
            return startLineDrawing(leftNode, color);
          }, ANIMATION_TERM);
        }
        else if (!leftNodeInfo["change"] && (rightNodeInfo["change"]) && !GLOBAL_CHECK_FOOT_PRINT[rightNode]) {
          //Right우선
          console.log("RIGHT 우선");
          stokeLine(x, y, 'w', 'r', color, FINDING_NODE_WIDTH);
          setTimeout(function () {
            return startLineDrawing(rightNode, color);
          }, ANIMATION_TERM);
        }
        else {
          console.log('DOWN 우선')
          stokeLine(x, y, 'h', 'd', color, FINDING_NODE_WIDTH);
          setTimeout(function () {
            return startLineDrawing(downNode, color);
          }, ANIMATION_TERM);
        }
      } else {
        console.log('else')
        if (!GLOBAL_FOOT_PRINT.hasOwnProperty(leftNode) && GLOBAL_FOOT_PRINT.hasOwnProperty(rightNode)) {
          /// 좌측라인
          console.log('좌측라인')
          if ((rightNodeInfo["change"] && !rightNodeInfo["draw"]) && !GLOBAL_CHECK_FOOT_PRINT[rightNode]) {
            //Right우선
            console.log("RIGHT 우선");
            stokeLine(x, y, 'w', 'r', color, FINDING_NODE_WIDTH);
            setTimeout(function () {
              return startLineDrawing(rightNode, color);
            }, ANIMATION_TERM);
          } else {
            console.log('DOWN')
            stokeLine(x, y, 'h', 'd', color, FINDING_NODE_WIDTH);
            setTimeout(function () {
              return startLineDrawing(downNode, color);
            }, ANIMATION_TERM);
          }

        } else if (GLOBAL_FOOT_PRINT.hasOwnProperty(leftNode) && !GLOBAL_FOOT_PRINT.hasOwnProperty(rightNode)) {
          /// 우측라인
          console.log('우측라인')
          if ((leftNodeInfo["change"] && leftNodeInfo["draw"]) && !GLOBAL_CHECK_FOOT_PRINT[leftNode]) {
            //Right우선
            console.log("LEFT 우선");
            stokeLine(x, y, 'w', 'l', color, FINDING_NODE_WIDTH);
            setTimeout(function () {
              return startLineDrawing(leftNode, color);
            }, 100);
          } else {
            console.log('DOWN')
            stokeLine(x, y, 'h', 'd', color, FINDING_NODE_WIDTH);
            setTimeout(function () {
              return startLineDrawing(downNode, color);
            }, ANIMATION_TERM);
          }
        }
      }
    } else {
      console.log("down")
      downNode = x + "-" + (y + 1);
      stokeLine(x, y, 'h', 'd', color, FINDING_NODE_WIDTH);
      setTimeout(function () {
        return startLineDrawing(downNode, color);
      }, ANIMATION_TERM);
    }
  }

  function userSetting() {
    var userList = LADDER[0],
      html = '',
      member,
      shuffleMembers = [];

    if (window._ladderData) {
      shuffleMembers = window._ladderData.goals;
      length = window._ladderData.members.length - shuffleMembers.length;

      if (length > 0) {
        for (i = 0; i < length; i++) {
          shuffleMembers.push(DEFAULT_GOAL_VALUE);
        }
      }

      shuffleMembers = shuffle(shuffleMembers);
    }


    for (var i = 0; i < userList.length; i++) {
      var color = '#' + (function lol(m, s, c) { return s[m.floor(m.random() * s.length)] + (c && lol(m, s, c - 1)); })(Math, '0123456789ABCDEF', 4);
      var x = userList[i].split('-')[0] * 1;
      //var y = userList[i].split('-')[1] * 1;
      var left = x * HORIZONTAL_NODE_WIDTH - 30;

      member = shuffleMembers[i] || '';

      html += '<div class="user-wrap" style="left:' + left + 'px">' +
        '<input type="text" value="' + member + '" data-node="' + userList[i] + '">' +
        '<button class="ladder-start" style="background-color:' + color + '" data-color="' + color + '" data-node="' + userList[i] + '"></button>' +
        '</div>';
    }
    $(ladder).append(html);
  }

  function resultSetting() {
    var html = '', length, i,
      resultList = LADDER[verticalNode - 1],
      goals = [];

    if (window._ladderData) {
      goals = shuffle(window._ladderData.members);
    }

    for (var i = 0; i < resultList.length; i++) {
      var x = resultList[i].split('-')[0] * 1;
      var y = resultList[i].split('-')[1] * 1 + 1;
      var node = x + "-" + y;
      var left = x * HORIZONTAL_NODE_WIDTH - 30;
      var goal = goals[i] || "";
      html += '<div class="answer-wrap" style="left:' + left + 'px">';
      html += '<div contenteditable=true data-node="' + node + '">' + goal + '</div>';
      html += '<p contenteditable=true id="' + node + '-user"></p>';
      html += '</div>';
    }
    $(ladder).append(html);
  }

  function drawNodeLine() {
    var x, y, node, nodeInfo,
      color = DEFAULT_LINE_COLOR,
      width = DEFAULT_LINE_WIDTH;

    for (var y = 0; y < verticalNode; y++) {
      for (var x = 0; x < horizontalNode; x++) {
        var node = x + '-' + y;
        var nodeInfo = GLOBAL_FOOT_PRINT[node];
        if (nodeInfo["change"] && nodeInfo["draw"]) {
          stokeLine(x, y, 'w', 'r', color, width)
        }
        stokeLine(x, y, 'h', 'd', color, width);
      }
    }
  }

  function stokeLine(x, y, flag, dir, color, width) {
    var moveToStart = 0, moveToEnd = 0, lineToStart = 0, lineToEnd = 0;
    var eachWidth = HORIZONTAL_NODE_WIDTH;
    var eachHeight = 25;

    if (!_ctx) {
      _ctx = ladder_canvas.getContext('2d');
    }

    if (flag == "w") {
      //가로줄
      if (dir == "r") {
        _ctx.beginPath();
        moveToStart = x * eachWidth;
        moveToEnd = y * eachHeight;
        lineToStart = (x + 1) * eachWidth;
        lineToEnd = y * eachHeight;

      } else {
        // dir "l"
        _ctx.beginPath();
        moveToStart = x * eachWidth;
        moveToEnd = y * eachHeight;
        lineToStart = (x - 1) * eachWidth;
        lineToEnd = y * eachHeight;
      }
    } else {
      _ctx.beginPath();
      moveToStart = x * eachWidth;
      moveToEnd = y * eachHeight;
      lineToStart = x * eachWidth;
      lineToEnd = (y + 1) * eachHeight;
    }

    _ctx.moveTo(moveToStart + 3, moveToEnd + 2);
    _ctx.lineTo(lineToStart + 3, lineToEnd + 2);
    _ctx.strokeStyle = color;
    _ctx.lineWidth = width;
    _ctx.stroke();
    _ctx.closePath();
  }

  function setRandomNodeData() {
    for (var y = 0; y < verticalNode; y++) {
      for (var x = 0; x < horizontalNode; x++) {
        var loopNode = x + "-" + y;
        var rand = Math.floor(Math.random() * 2);
        if (rand == 0) {
          GLOBAL_FOOT_PRINT[loopNode] = { "change": false, "draw": false };
        } else {
          if (x == (horizontalNode - 1)) {
            GLOBAL_FOOT_PRINT[loopNode] = { "change": false, "draw": false };
          } else {
            GLOBAL_FOOT_PRINT[loopNode] = { "change": true, "draw": true };
            x = x + 1;
            loopNode = x + "-" + y;
            GLOBAL_FOOT_PRINT[loopNode] = { "change": true, "draw": false };
          }
        }
      }
    }
  }

  function setDefaultFootPrint() {
    var r, column;

    for (r = 0; r < verticalNode; r++) {
      for (column = 0; column < horizontalNode; column++) {
        GLOBAL_FOOT_PRINT[column + "-" + r] = false;
      }
    }
  }

  function reSetCheckFootPrint() {
    var r, column;

    for (r = 0; r < verticalNode; r++) {
      for (column = 0; column < horizontalNode; column++) {
        GLOBAL_CHECK_FOOT_PRINT[column + "-" + r] = false;
      }
    }
  }

  function setDefaultRowLine() {
    var x, y, rowArr, node;

    for (y = 0; y < verticalNode; y++) {
      rowArr = [];

      for (x = 0; x < horizontalNode; x++) {
        node = x + "-" + row;
        rowArr.push(node);
      }
      LADDER[row] = rowArr;
      row++;
    }
  }


});
