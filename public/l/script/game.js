//스크린세팅
var canvas = document.getElementById('myCanvas');
var screen = document.getElementById('screen');
var ctx = canvas.getContext('2d');
var pSrc = screen.getContext('2d');

var b_img = new Image();

var userImg1 = new Image();
var userImg2 = new Image();
var userImg3 = new Image();
var userImg4 = new Image();
var userImg5 = new Image();
var userImg6 = new Image();

b_img.src = 'pan.jpg';

userImg1.src = 'dance/1.png';
userImg2.src = 'dance/2.png';
userImg3.src = 'dance/3.png';
userImg4.src = 'dance/4.png';
userImg5.src = 'dance/4.png';
userImg6.src = 'dance/4.png';

var userImgList = [userImg1,userImg2,userImg3,userImg4,userImg5,userImg6];


//배틀에 참여하는 2인 유저
export var battleUserList = [];  

export var userList = [];
export var userList_f = [];
export var userRoom = 'asd';
export var userMe = 'asd'; //userCode 
export var userMeImg = 0; //userSn
export var profiliImg = '' //profileimgNm

var Mstate = 'y';
var userXMove = 0;
var userYMove = 0;

// var fileInput;
// var fileInputElement = document.getElementById('fileInput');

var background = {
    x : 0,
    y : 0,
    width : 800,
    height : 600,
    draw(){
        ctx.drawImage(b_img,0,0);
    }
}

export const socket = io();

document.getElementById('asd').addEventListener('click', function(e){
    playedScorePop('asd');
});

document.getElementById('rew').addEventListener('click',function(e){
    playedScorePop('rew');
});

document.getElementById('zxc').addEventListener('click',function(e){
    playedScorePop('zxc');
});

document.getElementById('meButton').addEventListener('click',function(e){
    alert(userMe);
});

//채팅 확인 버튼
document.getElementById('chatLogButton').addEventListener('click',function(e){
    document.getElementById('chatLog').classList.toggle("hidden-canvas");
});


// 유저 생성 함수
function createUser(id, x, y,Sn,token, nic, profileSn) {
    userList.push({ id, x, y, width: 100, height: 100, speed: 200, imgSn : Sn, userToken:token, nicName:nic, profileSn:profileSn});
    console.log(userList.length);
    console.log('생성됨');
}

socket.on("guestList", (guestList,guest,userListt,userImgSn,userToken,profileSn)=>{
    alert(guest);
    userMe = guest;
    userMeImg = userImgSn;
    //기존유저생성
    createUser(guest,50,50,userImgSn,userToken,'user'+userImgSn,profileSn);
    console.log(userImgSn);
    for (let i = userListt.length - 1; i >= 0; i--){
        createUser(userListt[i].id,userListt[i].x,userListt[i].y,userListt[i].imgSn,userListt[i].userToken,userListt[i].nicName,userListt[i].profileSn);
    }
    socket.emit("updateGuestListOne",userList);
});


//서버수신
socket.on("updateGuestList", (List,state,battle)=>{
    console.log('업데이트됩니다');
    userList = List;
    userList_f = List;
    //새롭게 온 놈에 대한 플레이트를 생성해줌
    if(state=='plate'){
        battleUserList = battle;
        console.log(battle);
        document.getElementById('boxContainer').innerHTML='';
        // 새로운 요소를 생성합니다.
        for (let i = userList.length - 1; i >= 0; i--){
            var newElement = document.createElement('div');
            console.log(userList[i].imgSn);
            console.log(userMeImg);
            if(userList[i].imgSn == userMeImg){
                var inputHtml = `<div id = "img`+userMeImg+`"><img src="`+userList[i].profileSn+`.png"></div><div id="profileImgState" class="hidden-canvas"><img src="`+userList[i].profileSn+`_h.png"><img src="`+userList[i].profileSn+`_a.png"><img src="`+userList[i].profileSn+`_e.png"><img src="`+userList[i].profileSn+`_s.png"></div>`;
                inputHtml += `<div><div id = "nic`+ userList[i].imgSn +`">`+userList[i].nicName+`</div><input id ="editableInput"/></input><div id="talk`+userList[i].imgSn+`" class="talk"><div></div></div></div><button id="nickButton">닉네임수정</button>`;
                newElement.innerHTML = inputHtml;
            }else{
                newElement.innerHTML = `<div id = "img`+userList[i].imgSn+`"><img src="`+userList[i].profileSn+`.png"></div><div><div id = "nic`+ userList[i].imgSn +`">`+userList[i].nicName+`</div><div id="talk`+userList[i].imgSn+`" class="talk"><div></div></div></div><button id="other">상대의버튼</button>`;
            }
            newElement.classList.add('box');
            newElement.id = userList[i].imgSn;
            document.getElementById('boxContainer').insertAdjacentElement('beforeend', newElement);
        }
        nick();
        profileImg();
    }
});


//누군가 나갔을 때 서버수신
socket.on("bye",(id) =>{
    //유저리스트 제외
    for (let i = userList.length - 1; i >= 0; i--){
        if(userList[i].id === id){
            userList.splice(i,1);
        }
    }
    //배틀참가중 나가는경우 배틀리스트에서 제외
    for(let i = battleUserList.length - 1; i >= 0; i--){
        if(battleUserList[i].battleUserCode === id){
            battleUserList.splice(i,1);
            socket.emit("XBscreenB",battleUserList);
        }
    }
    socket.emit("updateGuestListOne",userList);
    console.log('누군가 나감');
    console.log(userList);
});


//키다운이벤트 플레이어 서버송신
document.addEventListener('keydown',function(e){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if (e.code == 37 || e.key == "ArrowRight"){
        Mstate = 'x';
        userXMove = 200;
        console.log(userList.length);
    } else if(e.key == 39 || e.key == "ArrowLeft") {
        Mstate = 'x';
        userXMove = -200;
    }
    else if(e.key == 38 || e.key == "ArrowUp") {
        Mstate = 'y';
        userYMove = -200;
    }
    else if(e.key == 40 || e.key == "ArrowDown") {
        Mstate = 'y';
        userYMove = 200;
    }
    for (let i = userList.length - 1; i >= 0; i--){
            const user = userList[i];
            if(user.id === userMe){
                if(Mstate == 'x'){
                    socket.emit("updateGuestList",user,userXMove,0);
                    Mstate = 't'
                }else if(Mstate == 'y'){
                    socket.emit("updateGuestList",user,0,userYMove);
                    Mstate = 't'
                }
            }
        }
})



//닉네임 교체
//닉네임을 백엔드에서 프론드로받음
socket.on("nicF",(nicName, userNicNameIdx)=>{
    // 부모 요소 선택
    var parentElement = document.getElementById('nic'+userNicNameIdx);
    parentElement.style.display = 'block';
    parentElement.innerHTML = nicName;
})

function nick(){
    document.querySelector('#nic'+userMeImg).addEventListener('click',function(e){
        console.log('#nic'+userMeImg);
        var divElement = document.getElementById('nic'+userMeImg);
        var inputElement = document.getElementById('editableInput');
        
        console.log(divElement);
        divElement.style.display = 'none';
        inputElement.style.display = 'block';
        inputElement.value = divElement.textContent.trim(); // div 안의 텍스트를 input에 할당
        inputElement.focus();

        document.querySelector('#nickButton').addEventListener('click',function(e){
            // 문장 가져오기
            let nicNameElement = document.getElementById('editableInput');
            let nicName = nicNameElement ? nicNameElement.value : ''; // sentenceElement가 없으면 빈 문자열 반환
            inputElement.style.display = 'none';
            //sentenceElement.value = '';
            //메세지를 백엔드로 송신
            socket.emit("nicB",nicName, userMeImg);

        })  
    })
}


//프사 교체
socket.on("profileImgF",(url, userProfileImgIdx)=>{
    // 부모 요소 선택
    var parentElement = document.getElementById('img'+userProfileImgIdx);
    // 이전의 <div> 삭제/수정
    parentElement.innerHTML=`<img src="`+url+`">`;
})

function profileImg(){
    var imgElement = document.getElementById('profileImgState');
    var meImg = document.getElementById('img'+userMeImg);
    document.getElementById('img'+userMeImg).addEventListener('click',function(e){
        meImg.classList.toggle("hidden-canvas");
        imgElement.classList.toggle("hidden-canvas");
    });
    imgElement.querySelectorAll("img").forEach(function(img){
        img.addEventListener('click',function(e){
            meImg.classList.toggle("hidden-canvas");
            imgElement.classList.toggle("hidden-canvas");
            var imgName = img.src.replace('http://localhost:3000/l/', '');
            meImg.innerHTML=`<img src="`+imgName+`">`
            socket.emit("profileImgB",imgName, userMeImg);
        })
    })
}  


//메세지를 백엔드에서 프론드로받음
socket.on("talkF",(sentence, userSentneceIdx, img, nic)=>{
    // 부모 요소 선택
    var parentElement = document.getElementById('talk'+userSentneceIdx);
    var chatElement = document.querySelectorAll('.chatLog');

    // 이전의 <div> 삭제
    var divToRemove = parentElement.querySelector("div");
    if (divToRemove) {
        divToRemove.remove(); // divToRemove가 있는 경우에만 삭제
    }

    // 새로운 <div> 추가
    parentElement.insertAdjacentHTML("beforeend", `<div>${sentence}</div>`);
    //console.log('<div class="display-flex"><div><img src="'+img+'"></div><div>${nic} :</div><div class="talk">${sentence}</div></div>');
    chatElement[0].insertAdjacentHTML("beforeend", `<div class="display-flex"><div><img src="${img}"></div><div>${nic} :</div><div class="talk">${sentence}</div></div>`);
})

document.querySelector('#send').addEventListener('click',function(e){

    // 문장 가져오기
    let sentenceElement = document.getElementById('sentenceEdit');
    let imgs = document.getElementById('img'+userMeImg).querySelectorAll('img');
    let nic = document.getElementById('nic'+userMeImg).textContent;
    let sentence = sentenceElement ? sentenceElement.value : ''; // sentenceElement가 없으면 빈 문자열 반환
    sentenceElement.value = '';
    //메세지를 백엔드로 송신
    socket.emit("talkB",sentence, userMeImg, imgs[0].getAttribute('src'), nic );

})

document.querySelector('#sentenceEdit').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        // 문장 가져오기
        let sentenceElement = document.getElementById('sentenceEdit');
        let sentence = sentenceElement ? sentenceElement.value : ''; // sentenceElement가 없으면 빈 문자열 반환
        sentenceElement.value = '';
        //메세지를 백엔드로 송신
        socket.emit("talkB",sentence, userMeImg  );
    }
});


//그림로그이미지를 백엔드에서 프론드로받음
socket.on("screenF",(screenData)=>{
    pSrc.clearRect(0, 0, screen.width, screen.height);
    var screenImg = new Image();
    screenImg.src = screenData;
    //screenImg가 로드 될때 drawImage
    screenImg.onload = function() {
        pSrc.drawImage(screenImg, 0, 0);              
    };            
})



function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    background.draw();
    for (let i = userList_f.length - 1; i >= 0; i--){
        const user = userList_f[i];
        ctx.drawImage(userImgList[user.userToken],user.x,user.y);
    }
    requestAnimationFrame(gameLoop);
}


function playedScorePop(name){
    const popupOverlay = document.getElementById("e-mail_input");

    popupOverlay.style.display = "flex";

    document.querySelectorAll('.selectProfile').forEach(function (div){
        div.addEventListener("click", function() {
            profiliImg = div.getAttribute("id");
            alert(div.getAttribute("id"));
            
            if(profiliImg == ''){
                alert('다시선택해주세요');
            }else{
                var Hcanvas = document.getElementById("myCanvas");
                Hcanvas.classList.toggle("hidden-canvas");
                var Scanvas = document.getElementById("screen");
                Scanvas.classList.toggle("hidden-canvas");
                var Bcanvas = document.getElementById("battleScreen");
                Bcanvas.classList.toggle("hidden-canvas");
                var Btcanvas = document.getElementById("buttonScreen");
                Btcanvas.classList.toggle("hidden-canvas");
                var buttons = document.getElementById("buttons");
                buttons.parentNode.removeChild(buttons);
                userRoom = name;
                socket.emit("room",name,profiliImg);
                gameLoop();
                popupOverlay.style.display = "none";
            }
        })
    });
}