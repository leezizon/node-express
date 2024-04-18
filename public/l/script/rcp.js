import { battleUserList } from './game.js';
import { userMe } from './game.js';
import { userMeImg } from './game.js';
import { profiliImg } from './game.js';

import { socket } from './game.js';

var battleScreen = document.getElementById('battleScreen');
var BSrc = battleScreen.getContext('2d');

var buttonScreen = document.getElementById('buttonScreen');
var BtSrc = buttonScreen.getContext('2d');

//가위바위보 버튼 크기들
const buttonWidth = 100;
const buttonHeight = 40;
const buttonGap = 20; // 각 버튼 간의 간격
const rcpNm = ['가위','보','바위']; // 각 버튼 간의 간격

// 캔버스의 중앙 좌표
const centerX = battleScreen.width / 2;
const centerY = battleScreen.height / 2;

//참여할 시
document.getElementById('battleChallenge').addEventListener('click',function(e){
    if(battleUserList.length >= 2){
        alert('배틀에 참여하는 인원은 2인까지입니다.');
        return;
    }

    if (confirm('가위바위보에 참여 합니까?')) {
        socket.emit("BscreenB",userMe, userMeImg, profiliImg);
    
        //버튼 변경
        var Battle = document.getElementById("battleChallenge");
        var BattleX = document.getElementById("battleChallengeX");

        Battle.classList.toggle("hidden-canvas");
        BattleX.classList.toggle("hidden-canvas");
    }
});

//참여 취소할 시 
document.getElementById('battleChallengeX').addEventListener('click',function(e){
    if (confirm('가위바위보에 불참하실건가요?')) {
        for(let i = battleUserList.length-1; i >= 0; i--){
            if(battleUserList[i].battleUserSn == userMeImg){
                battleUserList.splice(i,1);
                socket.emit("XBscreenB",battleUserList);

                //버튼 변경
                var Battle = document.getElementById("battleChallenge");
                var BattleX = document.getElementById("battleChallengeX");

                Battle.classList.toggle("hidden-canvas");
                BattleX.classList.toggle("hidden-canvas");
            }
        }
    }
});

//배틀유저리스트를 백엔드에서 프론드로받음
socket.on("BscreenF",(List)=>{
    battleUserList.splice(0);
    for(let i = List.length-1; i >= 0; i--){
        battleUserList.push(List[i]);
    }
    console.log(battleUserList);

    BSrc.clearRect(0, 0, screen.width, screen.height);
    var BscreenPlayer1 = new Image();
    var BscreenPlayer2 = new Image();
    var BscreenPlayer = [BscreenPlayer1,BscreenPlayer2];

    BscreenPlayer[0].src = 'none_t.png';
    BscreenPlayer[1].src = 'none_t.png';

    for(let i = battleUserList.length-1; i >= 0; i--){
        BscreenPlayer[i].src = battleUserList[i].profileImgSn+'_t.png';
    }
    BscreenPlayer[0].onload = function() {
        BSrc.drawImage(BscreenPlayer[0], 0, 0);              
    };
    BscreenPlayer[1].onload = function() {
        BSrc.drawImage(BscreenPlayer[1], 400, 0);     
    };   

    if(battleUserList.length == 2){
        alert('배틀이 시작됩니다.');
        drawButton();
    }  
})

//배틀결과를 프론트로 받음
socket.on("BscreenFResult",(result)=>{
    alert(result);
    BSrc.clearRect(0, 0, screen.width, screen.height);
    BtSrc.clearRect(0, 0, screen.width, screen.height);
})

// 버튼 그리기 함수
function drawButton() {
    var battleAuth = battleUserList.find(battleUser => battleUser.battleUserCode == userMe)
    if(battleAuth){
        for (let i = 0; i < 3; i++) {
            // 각 버튼의 x 좌표 계산
            const buttonX = centerX - (1.5 * buttonWidth) + (i * (buttonWidth + buttonGap));
            const buttonY = centerY - (buttonHeight / 2);
    
            // 버튼 사각형 그리기
            BtSrc.fillStyle = 'lightblue';
            BtSrc.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
            // 버튼 텍스트 그리기
            BtSrc.fillStyle = 'black';
            BtSrc.font = '16px Arial';
            BtSrc.textAlign = 'center';
            BtSrc.textBaseline = 'middle';
            BtSrc.fillText(rcpNm[i], buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
        }
    }
  }
  
  // 클릭 이벤트 처리 함수
  function handleClick(event) {
    var battleAuth = battleUserList.find(battleUser => battleUser.battleUserCode == userMe)
    if(battleAuth){
        const rect = buttonScreen.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
            
        for (let i = 0; i < 3; i++) {
            const buttonX = centerX - (1.5 * buttonWidth) + (i * (buttonWidth + buttonGap));
            const buttonY = centerY - (buttonHeight / 2);

            if(mouseX >= buttonX && mouseX <= buttonX + buttonWidth
                && mouseY >= buttonY && mouseY <= buttonY + buttonHeight
            ){
                alert(i + '버튼을 클릭했습니다!');
                // 버튼 사각형 그리기
                BtSrc.fillStyle = 'red';
                BtSrc.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
                socket.emit("rcpResult",i,userMe);
            }
        }
    }
}

  buttonScreen.addEventListener('click', handleClick);