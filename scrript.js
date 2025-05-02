let currentsong = new Audio();
let currentSongIndex = 0;
function convertSecondsToTime(seconds) {
    // Ensure the input is an integer
    seconds = Math.floor(seconds);

    // Calculate minutes and remaining seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    // Format as "MM:SS" by padding with zeros
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    // Combine into "MM:SS" format
    return `${formattedMinutes}:${formattedSeconds}`;
}

// Replace your getsongs function with this version
async function getsongs() {
    try {
        // Try to fetch from server directory
        let response = await fetch("./musics");
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status}`);
        }
        
        let text = await response.text();
        let div = document.createElement('div');
        div.innerHTML = text;
        let as = div.getElementsByTagName('a');
        let songs = [];
        
        for (let i = 0; i < as.length; i++) {
            const element = as[i];
            if (element.href.endsWith('.mp3')) {
                let songName = decodeURIComponent(element.href.split("/").pop());
                songs.push(songName);
            }
        }
        
        console.log("Found songs:", songs);
        return songs;
    } catch (error) {
        console.error("Error fetching songs:", error);
        
        // Create a hardcoded list of songs as fallback
        return [
            "song1.mp3", 
            "song2.mp3", 
            "song3.mp3",
            "song4.mp3",
            "song5.mp3"
        ];
    }
}

// Also modify your playsong function to handle potential errors
const playsong = (track, pause = false) => {
    try {
        currentsong.src = track;
        
        // Add error handling for audio loading
        currentsong.onerror = function() {
            console.error("Error loading audio:", track);
            document.querySelector(".songinfo").innerHTML = "Error loading song";
        };
        
        if (!pause) {
            let playPromise = currentsong.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error("Playback failed:", error);
                    play.src = "./elements/play.svg";
                });
            }
            
            play.src = "./elements/pasue.svg";
        } else {
            currentsong.pause();
            play.src = "./elements/play.svg";
        }

        document.querySelector(".songinfo").innerHTML = track.split("/").pop().replaceAll('.mp3', '');
        document.querySelector(".timer").innerHTML = "00:00";
        
        highlightCurrentSong(currentSongIndex);
    } catch (error) {
        console.error("Error in playsong:", error);
    }
};

// Add these variables at the top of your file
let isShuffleActive = false;
let isRepeatActive = false;
let originalSongOrder = [];

// Add this to your main function after the songs are loaded
async function main() {



    let songs = await getsongs();
    // Store the original song order
    originalSongOrder = [...songs];
    playsong(`musics/${songs[0]}`, true);

    let songul = document.querySelector('.songlist').getElementsByTagName('ul')[0];
    for (const song of songs) {
        songul.innerHTML += `<li>
                        <div class="playnow">
                            <img class="invert" src="./elements/play.svg" alt="">
                        </div>
                        <div class="info">
                            <div>${song.replaceAll('.mp3', '')}</div>
                        </div>
        </li>`;
    }

    Array.from(document.querySelectorAll(".songlist li")).forEach((e, index) => {
        e.addEventListener("click", () => {
            const songName = e.querySelector(".info div").textContent;
            playsong(`musics/${songs[index]}`); // Pass the full URL to the playsong function
        });
    });
    play.addEventListener('click', () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "./elements/pasue.svg";
        }
        else {
            currentsong.pause();
            play.src = "./elements/play.svg";
        }
    })
    currentsong.addEventListener('timeupdate', () => {
        document.querySelector(".timer").innerHTML = `${convertSecondsToTime(currentsong.currentTime)} / ${convertSecondsToTime(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    })

  document.querySelector(".seekbar").addEventListener('click', (e) => {
    // Log to verify the click event is firing

    // Get the width of the seekbar and the click position
    const seekbarWidth = e.target.getBoundingClientRect().width;
    const clickPositionX = e.offsetX;

    // Calculate the percentage of the click position
    const percent = (clickPositionX / seekbarWidth) * 100;

    // Update the circle position
    document.querySelector(".circle").style.left = percent + "%";

    // Update the current time of the song
    if (!isNaN(currentsong.duration)) {
        currentsong.currentTime = (currentsong.duration * percent) / 100;
    } else {
        console.error("Audio duration is not available yet.");
    }
});

    document.querySelector(".hamburger").addEventListener('click',()=>{
        document.querySelector(".left").style.left ="0"
    })

    document.querySelector(".closeham").addEventListener('click',()=>{
        document.querySelector(".left").style.left = "-100%";
    })

    previous.addEventListener('click',()=>{
  
        
    })
    previous.addEventListener('click', () => {
        if (currentSongIndex > 0) {
            currentSongIndex--; // Move to the previous song
            playsong(`musics/${songs[currentSongIndex]}`);
           
        }
    });


    // Add event listeners for shuffle and repeat
    document.getElementById("shuffle").addEventListener('click', () => {
        isShuffleActive = !isShuffleActive;
        
        if (isShuffleActive) {
            // Visual indication that shuffle is active
            document.getElementById("shuffle").classList.add("active-control");
            
            // Shuffle the songs array
            for (let i = songs.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [songs[i], songs[j]] = [songs[j], songs[i]];
            }
        } else {
            // Remove visual indication
            document.getElementById("shuffle").classList.remove("active-control");
            
            // Restore original order
            songs = [...originalSongOrder];
        }
        
        // Find the current song in the new order
        currentSongIndex = songs.findIndex(song => 
            song === currentsong.src.split('/').pop());
        
        if (currentSongIndex === -1) currentSongIndex = 0;
    });
    
    document.getElementById("repeat").addEventListener('click', () => {
        isRepeatActive = !isRepeatActive;
        
        if (isRepeatActive) {
            // Visual indication that repeat is active
            document.getElementById("repeat").classList.add("active-control");
            
            // Set the audio to loop
            currentsong.loop = true;
        } else {
            // Remove visual indication
            document.getElementById("repeat").classList.remove("active-control");
            
            // Disable looping
            currentsong.loop = false;
        }
    });
    
    // Modify the next button to handle repeat and shuffle
    next.addEventListener('click', () => {
        if (currentSongIndex < songs.length - 1) {
            currentSongIndex++; // Move to the next song
        } else if (isRepeatActive && !currentsong.loop) {
            // If we're at the end and repeat playlist is active
            currentSongIndex = 0;
        }
        
        playsong(`musics/${songs[currentSongIndex]}`);
    });
    
    // Add ended event to handle what happens when a song finishes
    currentsong.addEventListener('ended', () => {
        if (!currentsong.loop) { // If single song repeat is not active
            if (currentSongIndex < songs.length - 1) {
                currentSongIndex++;
                playsong(`musics/${songs[currentSongIndex]}`);
            } else if (isRepeatActive) {
                // If we're at the end and repeat playlist is active
                currentSongIndex = 0;
                playsong(`musics/${songs[currentSongIndex]}`);
            }
        }
        // If single song repeat is active, the audio element will handle looping
    });
    document.querySelector(".timevol input").addEventListener('change',(e)=>{
     currentsong.volume = parseInt(e.target.value)/100;
    })
}
main();