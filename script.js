const USUARIO = "kitty";
const PASSWORD = "1234";
let videoSeleccionado = null;

function login() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  if (user === USUARIO && pass === PASSWORD) {
    document.getElementById("loginContainer").style.display = "none";
    document.getElementById("appContainer").style.display = "block";
    cargarVideos();
  } else {
    alert("Usuario o contraseña incorrectos");
  }
}

function guardarVideo() {
  const videoUrl = document.getElementById("videoUrl").value;
  const imageUrl = document.getElementById("imageUrl").value;

  if (!videoUrl || !imageUrl) {
    alert("Faltan campos");
    return;
  }

  const video = { videoUrl, imageUrl };
  let lista = JSON.parse(localStorage.getItem("videos")) || [];
  lista.push(video);
  localStorage.setItem("videos", JSON.stringify(lista));

  document.getElementById("videoUrl").value = "";
  document.getElementById("imageUrl").value = "";

  cargarVideos();
}

function cargarVideos() {
  const galeria = document.getElementById("galeria");
  galeria.innerHTML = "";
  const lista = JSON.parse(localStorage.getItem("videos")) || [];

  lista.forEach((video, index) => {
    const img = document.createElement("img");
    img.src = video.imageUrl;
    img.title = "Haz clic izquierdo para opciones";

    img.addEventListener("click", (e) => {
      e.preventDefault();
      videoSeleccionado = video;
      mostrarMenuContextual(e.pageX, e.pageY);
    });

    galeria.appendChild(img);
  });
}

function mostrarMenuContextual(x, y) {
  const menu = document.getElementById("menuContextual");
  menu.style.left = x + "px";
  menu.style.top = y + "px";
  menu.style.display = "block";
}

function ocultarMenu() {
  document.getElementById("menuContextual").style.display = "none";
}

function abrirVideoEnNuevoTab() {
  if (videoSeleccionado) {
    window.open(videoSeleccionado.videoUrl, "_blank");
    ocultarMenu();
  }
}

function copiarYMostrar() {
  if (videoSeleccionado) {
    navigator.clipboard.writeText(videoSeleccionado.videoUrl)
      .then(() => {
        alert("Enlace copiado al portapapeles. Ábrelo tú mismo en una ventana de incógnito 🙈");
      });
    ocultarMenu();
  }
}

document.addEventListener("click", function (e) {
  if (!e.target.closest("#menuContextual")) {
    ocultarMenu();
  }
});
