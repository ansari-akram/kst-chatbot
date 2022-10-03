var running = false;
var message_box = document.getElementById('message-box');
var response_list = [];
var request_list = [];
var user_id = 0;
var server_api = "http://127.0.0.1:8000/";
var rasa_api = "http://127.0.0.1:5005/webhooks/rest/webhook/";

function send() {
  if (running == true) return;
  var msg = document.getElementById("message").value;
  if (msg == "") return;
  running = true;
  addMsg(msg);
}

function addMsg(msg) {
  var div = document.createElement("div");
  div.innerHTML =
    "<span style='flex-grow:1'></span><div class='chat-message-sent'>" +
    msg +
    "</div>";
  div.className = "chat-message-div";
  document.getElementById("message-box").appendChild(div);

  //SEND MESSAGE TO API
  document.getElementById("message").value = "";
  document.getElementById("message-box").scrollTop = document.getElementById("message-box").scrollHeight;

  //LOADER START
  var loader = document.createElement("div");
  loader.innerHTML = '<div class="chat-message-received loader" title="getting response..."><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="24px" height="30px" viewBox="0 0 24 30" style="enable-background:new 0 0 50 50;" xml:space="preserve"><rect x="0" y="10" width="4" height="10" fill="grey" opacity="0.2"><animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0s" dur="0.6s" repeatCount="indefinite" /><animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0s" dur="0.6s" repeatCount="indefinite" /><animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0s" dur="0.6s" repeatCount="indefinite" /></rect><rect x="8" y="10" width="4" height="10" fill="grey"  opacity="0.2"><animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0.15s" dur="0.6s" repeatCount="indefinite" /><animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0.15s" dur="0.6s" repeatCount="indefinite" /><animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0.15s" dur="0.6s" repeatCount="indefinite" /></rect><rect x="16" y="10" width="4" height="10" fill="grey"  opacity="0.2"><animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0.3s" dur="0.6s" repeatCount="indefinite" /><animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0.3s" dur="0.6s" repeatCount="indefinite" /><animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0.3s" dur="0.6s" repeatCount="indefinite" /></rect></svg></div>';
  // loader.className = "chat-message-received loader";
  document.getElementById("message-box").appendChild(loader);
  document.getElementById("message-box").scrollTop = document.getElementById("message-box").scrollHeight;
  //LOADER END

  prev_msg = document.getElementById('message-box').children[document.getElementById('message-box').children.length - 3].textContent;
  // console.log(prev_msg);

  if (msg.toLowerCase() == "yes") {
    if (prev_msg == "Let me know if I can help you in any other way.") {
      removeLoader();
      setTimeout(addResponseMsg, 500, "Great! We can help. We will have one of our representatives contact you soon.")
      setTimeout(addResponseMsg, 1000, "Thank You once again and have a great day! " + username + ".")
    }
    else if (prev_msg == "Are you satisfied with the Chatbot's Response?") {
      removeLoader();
      response_list = [];
      setTimeout(addResponseMsg, 500, "Thank You for your co-operations with us.")
      setTimeout(addResponseMsg, 500, "Please feel free to ask any other questions.")
    }
  }
  else if (msg.toLowerCase() == "no") {
    if (prev_msg == "Let me know if I can help you in any other way.") {
      removeLoader();
      setTimeout(addResponseMsg, 500, "Thank You for visiting us! Can I help you out with what you are looking for?")
      setTimeout(addResponseMsg, 1000, "<a href='www.google.com'>Our Oracle Service</a>")
      setTimeout(addResponseMsg, 1500, "<a href='www.google.com'>Our Amazon Service</a>")
    }
    else if (prev_msg == "Are you satisfied with the Chatbot's Response?") {
      removeLoader();
      setTimeout(addResponseMsg, 500, "Sorry to hear that. We will retrain our Chatbot in some time")
      setTimeout(addResponseMsg, 500, "Let me know if I can help you in any other way.")
      var requests = request_list[0] + " | " + request_list[1] + " | " + request_list[2];

      sendAnswer("2", requests);
    }
  }
  else sendInput(msg);
}

function sendInput(input) {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({
    "sender": username,
    "message": input,
    "token": "None"
  });

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  fetch(rasa_api, requestOptions)
    .then(response => response.text())
    .then(result => {
      console.log(JSON.parse(result).length);
      console.log(JSON.parse(result));
      console.log(JSON.parse(result).text);
      removeLoader();
      var log_string = "";
      for (var i = 0; i < JSON.parse(result).length; i++) {
        if (JSON.parse(result)[i].text != "" && JSON.parse(result)[i].text != undefined) {
          log_string = log_string + JSON.parse(result)[i].text + "\n";
          addResponseMsg(JSON.parse(result)[i].text);
        }
        else if (JSON.parse(result)[i].image != "" && JSON.parse(result)[i].image != undefined) {
          log_string = log_string + "image: " + JSON.parse(result)[i].image + "\n";
          addResponseImg(JSON.parse(result)[i].image);
        } else {
          console.log("configure for further responses")
        }
      }

      if (JSON.parse(result).length == 0) {
        log_string = log_string + "Please contact the Sales Team for further information";
        addResponseMsg("Please contact the Sales Team for further information");
      }
      // Saving Logs
      var log_formdata = new FormData();
      log_formdata.append("user", user_id);
      log_formdata.append("question", input);
      log_formdata.append("answer", log_string);

      var log_requestOptions = {
        method: 'POST',
        body: log_formdata,
        redirect: 'follow'
      };

      fetch(server_api + "log/", log_requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
      // Saving Logs end
    })
    .catch(error => console.log('error', error));


  // fetch(rasa_api, requestOptions)
  //   .then(result => {
  //     result.text().then(function (text) {
  //       removeLoader();
  //       if (result.status == 200) {
  //         // console.log('chatbot response', JSON.parse(text).answer);

  //         if (JSON.parse(text).answer == sorry) {
  //           addResponseMsg(JSON.parse(text).answer);
  //           sendAnswer("3", input);
  //         } else {
  //           response_list.push(JSON.parse(text).answer);
  //           request_list.push(input);

  //           for (var i = 0; i < response_list.length; i++) {
  //             if (response_list[i] != JSON.parse(text).answer) {
  //               response_list = [];
  //               request_list = [];
  //               response_list.push(JSON.parse(text).answer);
  //               request_list.push(input);
  //               break;
  //             }

  //             else if (response_list[i] == JSON.parse(text).answer && response_list.length == 3) {
  //               setTimeout(addResponseMsg, 500, "Are you satisfied with the Chatbot's Response?");
  //               break;
  //             }
  //           }
  //           addResponseMsg(JSON.parse(text).answer);
  //         }
  //       } else {
  //         setTimeout(addResponseMsg, 500, "Let me know if I can help you in any other way.")
  //       }
  //     })
  //   })
  //   .catch(error => console.log('error', error));
}

function sendAnswer(event_type_id, event_question) {
  var formdata = new FormData();
  formdata.append("event_type", event_type_id);
  formdata.append("user_email", email);
  formdata.append("event_question", event_question);
  formdata.append("event_answer", response_list[0]);

  response_list = [];

  var requestOptions = {
    method: 'POST',
    body: formdata,
    redirect: 'follow'
  };

  fetch(server_api + "save-answer/", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
}

function addResponseMsg(msg) {
  var div = document.createElement("div");
  div.innerHTML = "<div class='chat-message-received'>" + msg + "</div>";
  div.className = "chat-message-div";
  document.getElementById("message-box").appendChild(div);
  document.getElementById("message-box").scrollTop = document.getElementById(
    "message-box"
  ).scrollHeight;
  running = false;
}

function addResponseImg(image) {
  var div = document.createElement("div");
  div.innerHTML = "<div class='chat-message-received'><img src=" + image + " alt=" + image + " /></div>";
  div.className = "chat-message-div";
  document.getElementById("message-box").appendChild(div);
  document.getElementById("message-box").scrollTop = document.getElementById(
    "message-box"
  ).scrollHeight;
  running = false;
}

function removeLoader() {
  message_box.lastChild.remove();
}

document.getElementById("message").addEventListener("keyup", function (event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    send();
  }
});

function toggle_chatbot_on_click() {
  if (document.getElementById("chatbot").classList.contains("collapsed")) {
    document.getElementById("chatbot").classList.remove("collapsed")
    // console.log(document.getElementById("chatbot").children);
    document.getElementById("chatbot_toggle").children[0].style.display = "none"
    document.getElementById("chatbot_toggle").children[1].style.display = ""
    document.getElementById("chatbot").children[0].style.display = ""
    document.getElementById("chatbot").children[1].style.display = ""
    document.getElementById("chatbot").children[2].style.display = ""
    if (document.getElementById("cred-form").classList.contains("inactive")) {
      document.getElementById("chatbot").children[3].style.display = ""
      document.getElementById("chatbot").children[4].style.display = ""
      document.getElementById("chatbot").children[5].style.display = ""
    } else {
      document.getElementById("chatbot").children[3].style.display = "none"
      document.getElementById("chatbot").children[4].style.display = "none"
      document.getElementById("chatbot").children[5].style.display = "none"
      document.getElementById("user-name").focus();
    }
    document.getElementById("chatbot_toggle").style.backgroundColor = "transparent"
  }
  else {
    document.getElementById("chatbot").classList.add("collapsed")
    document.getElementById("chatbot_toggle").children[0].style.display = "inline-block"
    document.getElementById("chatbot_toggle").children[1].style.display = "none"
    document.getElementById("chatbot").children[1].style.display = "none"
    document.getElementById("chatbot").children[4].style.display = "none"
    document.getElementById("chatbot_toggle").style.backgroundColor = "white"
  }
}

document.getElementById("chatbot_toggle").onclick = function () {
  toggle_chatbot_on_click();
}

function checkWelcomeMsg() {
  var list = document.getElementById("message-box").querySelectorAll('div');
  if (list.length == 0) return true;
  return false;
}

document.getElementById("chatbot_toggle").children[1].style.display = "none"
document.getElementById("chatbot").children[1].style.display = "none"
document.getElementById("chatbot").children[4].style.display = "none"

function validateEmail(email) {
  return String(email).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
}

function checkForm() {
  username = document.getElementById("user-name").value;
  email = document.getElementById("user-email").value;
  phone_no = document.getElementById("user-phone").value;

  if (document.getElementById("cred-form").classList.contains("active") && username != '' && validateEmail(email) && phone_no.length >= 10) {
    var formdata = new FormData();
    formdata.append("username", username);
    formdata.append("email", email);
    formdata.append("phone", phone_no);

    var requestOptions = {
      method: 'POST',
      body: formdata,
      redirect: 'follow'
    };

    fetch(server_api + "chatbot-user/", requestOptions)
      .then(result => {
        result.text().then(function (text) {
          if (result.status == 200) {
            console.log(JSON.parse(text));
            user_id = JSON.parse(text).user_id;
            document.getElementById("cred-form").classList.remove("active")
            document.getElementById("cred-form").classList.add("inactive")
            document.getElementById("chatbot").children[3].style.display = ""
            document.getElementById("chatbot").children[4].style.display = ""
            document.getElementById("chatbot").children[5].style.display = ""
            if (checkWelcomeMsg()) setTimeout(addResponseMsg, 500, "Hi " + JSON.parse(text).username + ", Welcome to Kernel Sphere AI Chatbot")
            document.getElementById("message").focus();
          }
        })
      })
      .catch(error => console.log('error', error));
  }
}

// testing
// toggle_chatbot_on_click()