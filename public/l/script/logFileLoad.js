import { userMe } from './game.js';
import { userList } from './game.js';
import { socket } from './game.js';

var fileInput;
var fileInputElement = document.getElementById('fileInput');


//관리자 선택표시
document.getElementById('manageButton').addEventListener('click',function(e){
    fetch('/l/selectManageGrid', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
    .then(response => response.json()) // JSON 형식으로 파싱
    .then(json => {
            console.log(json.val); // 정상적으로 값 출력
            if(json.val == '기존'){
                alert('너는관리자가 아닙니다.');
            }else{
                document.getElementById('boxContainer').querySelectorAll(".box").forEach(function(div) {
                    div.classList.replace('box','manage_box');
                })
                funcfunc();
                alert('안녕하세요!');
            }
        })
    .catch(error => {
            console.error('데이터 가져오기 오류:', error);
    });
})

function funcfunc(){
    //관리자 선택시 권한부여
    document.getElementById('boxContainer').querySelectorAll(".manage_box").forEach(function(div) {
        div.addEventListener("click", function() {
            const userId = div.getAttribute("id");
            alert(userId);
            //.replace('manageChk', '');
            for (let i = userList.length - 1; i >= 0; i--){
                const user = userList[i];
                if(user.imgSn == userId){
                    socket.emit("screenAuthPut",user.id);
                    alert('통과');
                }
            }
        })
    })
}

document.getElementById('fileInputButton').addEventListener('click', function() {
    fileInputElement.click();
});

//권한체크요청
fileInputElement.addEventListener('change', function(event) {
    const fileNameContainer = document.getElementById('fileName');
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
    // 이미지 파일을 읽고 Socket.IO를 통해 서버에 전송합니다.
        fileNameContainer.textContent = `선택된 파일: ${file.name}`;
        fileInput = e.target.result;
    };
    reader.readAsDataURL(file);
    socket.emit('screenAuthChk', userMe);                
});

//권한들어오면 파일 보내기
socket.on("screenAuthChk",(youAuth)=>{
    if(youAuth){
        // 이미지 파일을 읽고 Socket.IO를 통해 서버에 전송합니다.
        socket.emit('screenB', fileInput);
    }else{
        console.log('당신은 권한이 없습니다');
    }
})