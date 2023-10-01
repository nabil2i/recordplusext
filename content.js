// console.log("injected content")

let chunks = []
let videoId = null;
// Generate a random string of characters
function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}

// Generate a unique random name ending with ".webm"
function generateRandomWebmFileName() {
  const timestamp = new Date().getTime();
  const randomString = generateRandomString(8);
  return `${timestamp}_${randomString}.webm`;
}

function sendChunk(chunck, enpoint) {
  let formData = new FormData();
  const randomWebmFileName = generateRandomWebmFileName();
  formData.append("video_chunck", chunk, randomWebmFileName);

  return fetch(endpoint, {
    method: "PATCH",
    body: formData
  });
}

var recorder = null
function onAccessApproved(stream) {
  recorder = new MediaRecorder(stream);

  recorder.start();

  recorder.onstop = function() {
    stream.getTracks().forEach(function(track) {
      if(track.readyState === "live") {
        track.Stop();
      }
    })
  }

  recorder.ondataavailable = function(event) {
    let recordedBlob = event.data;
    if (recordedBlob.size > 0) {
      chunks.push(event.data);
    }

    if (!videoId) {
      let formData = new FormData();
      const randomWebmFileName = generateRandomWebmFileName();
      formData.append("title", "Video Title");
      formData.append("description", "Video Description");
      formData.append("video_file", chunks[0], randomWebmFileName);
      // formData.append("video_file", chunks[0], "screen-recording.webm");

      fetch("http://34.207.165.115/api/record/videos/", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          videoId = data.video_id;
          console.log("Video ID:", videoId);

          // send other chunks
          for (let i = 1; i < chunks.length; i++) {
            sendChunk(chunks[i], `"http://34.207.165.115/api/record/videos/${videoId}/update_video_file/`)
              .then((response) => {
                console.log(response);
                // Check if the chunk was successfully sent
                if (response.ok) {
                  console.log("Chunk uploaded successfully");
                } else {
                  console.error("Failed to upload chunk");
                }
              })
              .catch((error) => {
                console.error("Error:", error);
              });
          }

          // finalize 
          fetch(`"http://34.207.165.115/api/record/videos/${videoId}/finalize_video_upload/`, {
            method: "POST",
          })
            .then((response) => {
              console.log(response);
              // Check if the finalization was successful
              if (response.ok) {
                console.log("Video upload finalized");
              } else {
                console.error("Failed to finalize video upload");
              }
            })
            .catch((error) => {
              console.error("Error:", error);
            });
          
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } 

    // let url = URL.createObjectURL(recordedBlob);


    
    // let a = document.createElement("a");
    // a.style.display = "none";
    // a.href = url;
    // a.download = "screen-recording.webm"
    // document.body.appendChild(a);
    // a.click();
    // document.body.removeChild(a);

    URL.revokeObjectURL(url);

  }
}

// listen for recording action to execute
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "request-recording") {
    console.log("requesting recording");

    sendResponse(`seen ${message.action}`); // send message back to sender (content)
    navigator.mediaDevices.getDisplayMedia({
      audio:true,
      video: {
        width:9999999999,
        height:9999999999
      }
    }).then((stream) => {
      onAccessApproved(stream);
    })
  }

  if (message.action === "stop-recording") {
    console.log("stopping video");
    sendResponse(`seen ${message.action}`);

    if(!recorder) return console.log("no recorder");
    recorder.stop();
  }
})