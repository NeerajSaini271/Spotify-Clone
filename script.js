console.log("Let's write JavaScript");
let currentSongs = new Audio();
let songs;
let currFolder;
let currentSongIndex = 0;

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const paddedMinutes = minutes.toString().padStart(2, "0");
  const paddedSeconds = secs.toString().padStart(2, "0");
  return `${paddedMinutes}:${paddedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder;
  // Fetch info.json instead of directory listing
  let a = await fetch(`/${folder}/info.json`);
  let response = await a.json();
  let songs = response.songs || [];

  // Show all the songs in the playlist
  let songUl = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUl.innerHTML = "";
  for (const song of songs) {
    songUl.innerHTML += `<li><img src="/img/music.svg" alt="">
        <div class="info">
          <div>${song.replaceAll("%20", " ")}</div>
          <div>Artist</div>
        </div>
        <div class="playnow">
          <span>Play now</span>
          <img src="img/play-rounded-max.svg" alt="">
        </div></li>`;
  }

  // Attach an event listener to each song
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e, i) => {
    e.addEventListener("click", () => {
      playMusic(songs[i], false, i); // Pass index
    });
  });

  return songs;
}

const playMusic = (track, pause = false, index = 0) => {
  currentSongs.src = `/${currFolder}/` + track;
  currentSongIndex = index; // Track the current index
  if (!pause) {
    currentSongs.play();
    play.src = "img/pause.svg";
  }
  document.querySelector(".songinfo-text").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "0:00 / 0:00";
};

// getSongs();

async function displayAlbums() {
  // Fetch the list of album folders from albums.json
  let a = await fetch("/albums.json");
  let albumFolders = await a.json();
  let cardContainer = document.querySelector(".cardContainer");
  cardContainer.innerHTML = "";

  for (let folder of albumFolders) {
    // Get the metadata of the folder
    let a = await fetch(`/Songs/${folder}/info.json`);
    let response = await a.json();
    cardContainer.innerHTML += `
      <div data-folder="${folder}" class="card">
        <div class="play">
          <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="24" fill="#1ED760" />
            <path d="M19 16L19 32L33 24L19 16Z" fill="black" />
          </svg>
        </div>
        <img src="/Songs/${folder}/${response.cover}" alt="" />
        <h2>${response.title}</h2>
        <p>${response.description}</p>
      </div>`;
  }

  // Load a playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`Songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}

async function main() {
  songs = await getSongs("Songs/Bollywood");
  playMusic(songs[0], true);

  displayAlbums();

  play.addEventListener("click", () => {
    if (currentSongs.paused) {
      currentSongs.play();
      play.src = "img/pause.svg";
    } else {
      currentSongs.pause();
      play.src = "img/play.svg";
    }
  });

  //Listen for timeupdate event
  currentSongs.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${formatTime(
      currentSongs.currentTime
    )}/${formatTime(currentSongs.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSongs.currentTime / currentSongs.duration) * 100 + "%";
  });

  //Add an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSongs.currentTime = (currentSongs.duration * percent) / 100;
  });

  //Add an event listener to hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  //Add an event listener to close the hamburger 1
  document.querySelector(".spotifyPlaylists").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });
  //Add an event listener to close the hamburger 2
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  //Add an event lisenter to previous
  previous.addEventListener("click", () => {
    if (currentSongIndex - 1 >= 0) {
      playMusic(songs[currentSongIndex - 1], false, currentSongIndex - 1);
    }
  });

  //Add an event lisenter to next
  next.addEventListener("click", () => {
    if (currentSongIndex + 1 < songs.length) {
      playMusic(songs[currentSongIndex + 1], false, currentSongIndex + 1);
    }
  });

  // Automatically play next song when current ends
  currentSongs.addEventListener("ended", () => {
    if (currentSongIndex + 1 < songs.length) {
      playMusic(songs[currentSongIndex + 1], false, currentSongIndex + 1);
    }
  });

  let lastVolume = 0.75; // Default Volume

  // Set initial volume and slider position
  currentSongs.volume = lastVolume;
  document.querySelector(".range").getElementsByTagName("input")[0].value =
    lastVolume * 100;
  document.querySelector(".volume>img").src = "img/Volume-Full.svg"; // Set initial icon

  //Add an event listener to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("input", (e) => {
      currentSongs.volume = parseInt(e.target.value) / 100;
      if (currentSongs.volume > 0) {
        lastVolume = currentSongs.volume; // Save the last non-zero volume
      }
      if (currentSongs.volume >= 0.7) {
        document.querySelector(".volume>img").src = "img/Volume-Full.svg";
      } else if (currentSongs.volume >= 0.3 && currentSongs.volume < 0.7) {
        document.querySelector(".volume>img").src = "img/Volume-Half.svg";
      } else if (currentSongs.volume > 0 && currentSongs.volume < 0.3) {
        document.querySelector(".volume>img").src = "img/Volume-Low.svg";
      } else {
        document.querySelector(".volume>img").src = "img/Volume-Mute.svg";
      }
    });

  //Add event listener to mute the track
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (
      e.target.src.includes("Volume-Full.svg") ||
      e.target.src.includes("Volume-Half.svg") ||
      e.target.src.includes("Volume-Low.svg")
    ) {
      e.target.src = e.target.src.replace(
        /Volume-(Full|Half|Low)\.svg/,
        "Volume-Mute.svg"
      );
      lastVolume = currentSongs.volume > 0 ? currentSongs.volume : lastVolume; // Save current volume if not zero
      currentSongs.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      currentSongs.volume = lastVolume;
      document.querySelector(".range").getElementsByTagName("input")[0].value =
        lastVolume * 100;

      if (lastVolume > 0 && lastVolume < 0.3) {
        e.target.src = e.target.src.replace(
          "Volume-Mute.svg",
          "Volume-Low.svg"
        );
      } else if (lastVolume >= 0.3 && lastVolume < 0.7) {
        e.target.src = e.target.src.replace(
          "Volume-Mute.svg",
          "Volume-Half.svg"
        );
      } else {
        e.target.src = e.target.src.replace(
          "Volume-Mute.svg",
          "Volume-Full.svg"
        );
      }
    }
  });
}

main();
