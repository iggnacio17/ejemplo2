// script completo actualizado (funciones clave)
// contiene: manejo de tabs, almacenamiento local, búsqueda, favoritos, import/export, y mejoras solicitadas

// Variables clave
const PASSWORD = "finnCracK12@";
const keys = {
  videos: 'videos',
  shorts: 'shorts',
  actrices: 'actrices',
  categorias: 'categorias',
  carpetas: 'carpetas',
  favoritos: 'favoritos',
  favoritosShorts: 'favoritosShorts'
};

const galeria = document.getElementById('galeria');
const galeriaShorts = document.getElementById('galeriaShorts');
const buscador = document.getElementById('buscador');
const categoriaFiltro = document.getElementById('categoriaFiltro');

function mostrarTab(id) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (id === "galeriaTab") cargarVideos(true);
  if (id === "shortsTab") cargarShorts();
  if (id === "favoritosTab") cargarFavoritos();
}

function getData(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

function setData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function guardarVideo() {
  const video = {
    videoUrl: document.getElementById('videoUrl').value,
    imageUrl: document.getElementById('imageUrl').value,
    videoNombre: document.getElementById('videoNombre').value,
    actriz: document.getElementById('nuevaActriz').value.split(',').map(a => a.trim()).filter(a => a),
    categoria: document.getElementById('nuevaCategoria').value.split(',').map(c => c.trim()).filter(c => c),
    carpeta: document.getElementById('nuevaCarpeta').value || document.getElementById('carpetaSelect').value
  };

  if (!video.videoUrl || !video.imageUrl || !video.videoNombre) return alert("Todos los campos son obligatorios");

  const actrices = new Set([...getData(keys.actrices), ...video.actriz]);
  const categorias = new Set([...getData(keys.categorias), ...video.categoria]);
  const carpetas = new Set([...getData(keys.carpetas), video.carpeta]);

  setData(keys.actrices, Array.from(actrices));
  setData(keys.categorias, Array.from(categorias));
  setData(keys.carpetas, Array.from(carpetas));

  const lista = getData(keys.videos);
  lista.push(video);
  setData(keys.videos, lista);
  document.querySelectorAll('.formulario input').forEach(input => input.value = '');
  cargarDatos(); mostrarTab('galeriaTab');
}

function crearChips(lista, tipo) {
  return lista.map(i => `<span class="etiqueta" onclick="filtrarPor('${tipo}', '${i}')">${i}</span>`).join(' ');
}

function crearCard(video, favoritos) {
  const card = document.createElement('div');
  card.className = 'video-card';
  card.innerHTML = `
    <img src="${video.imageUrl}" onclick="copiarEnlace('${video.videoUrl}'); window.open('${video.videoUrl}')">
    <div class="video-name">${video.videoNombre}</div>
    <p>🎭 ${crearChips(video.actriz || [], 'actriz')}<br>🗂️ ${crearChips(video.categoria || [], 'categoria')}<br>📁 ${video.carpeta || ''}</p>
    <div class="acciones">
      <span onclick="toggleFavorito('${video.videoUrl}')">${favoritos.includes(video.videoUrl) ? '⭐' : '☆'}</span>
      <span onclick="copiarEnlace('${video.videoUrl}')">📋</span>
      <span onclick="eliminarVideo('${video.videoUrl}')">🗑️</span>
    </div>
  `;
  return card;
}

function cargarVideos(aleatorio = false) {
  let videos = getData(keys.videos);
  const favoritos = getData(keys.favoritos);
  const filtro = buscador.value.toLowerCase().split(' ');
  const categoria = categoriaFiltro.value;
  if (categoria) videos = videos.filter(v => (v.categoria || []).includes(categoria));
  if (filtro[0] !== '') {
    videos = videos.filter(v => filtro.every(f => 
      v.videoNombre.toLowerCase().includes(f) ||
      (v.actriz || []).some(a => a.toLowerCase().includes(f)) ||
      (v.categoria || []).some(c => c.toLowerCase().includes(f))
    ));
  } else if (aleatorio) {
    videos = videos.sort(() => 0.5 - Math.random()).slice(0, 15);
  }
  galeria.innerHTML = '';
  videos.forEach(v => galeria.appendChild(crearCard(v, favoritos)));
}

function guardarShort() {
  const url = document.getElementById('shortUrl').value;
  const image = document.getElementById('shortImageUrl').value;
  if (!url || !image) return alert("Campos requeridos");
  const shorts = getData(keys.shorts);
  shorts.push({ videoUrl: url, imageUrl: image });
  setData(keys.shorts, shorts);
  document.getElementById('shortUrl').value = '';
  document.getElementById('shortImageUrl').value = '';
  cargarShorts();
}

function crearCardShort(short, favoritos) {
  const card = document.createElement('div');
  card.className = 'short-card';
  card.innerHTML = `
    <img src="${short.imageUrl}" onclick="copiarEnlace('${short.videoUrl}'); window.open('${short.videoUrl}')">
    <div class="acciones" style="margin-top:10px">
      <span onclick="toggleFavoritoShort('${short.videoUrl}')">${favoritos.includes(short.videoUrl) ? '⭐' : '☆'}</span>
      <span onclick="copiarEnlace('${short.videoUrl}')">📋</span>
      <span onclick="eliminarShort('${short.videoUrl}')">🗑️</span>
    </div>`;
  return card;
}

function cargarShorts() {
  const lista = getData(keys.shorts);
  const favoritos = getData(keys.favoritosShorts);
  galeriaShorts.innerHTML = '';
  lista.forEach(s => galeriaShorts.appendChild(crearCardShort(s, favoritos)));
}

function copiarEnlace(url) {
  navigator.clipboard.writeText(url).then(() => console.log("Copiado: ", url));
}

function filtrarPor(tipo, valor) {
  buscador.value = valor;
  filtrarVideos();
}

function filtrarVideos() {
  cargarVideos(false);
}

function toggleFavorito(url) {
  let favoritos = getData(keys.favoritos);
  favoritos = favoritos.includes(url) ? favoritos.filter(u => u !== url) : [...favoritos, url];
  setData(keys.favoritos, favoritos);
  cargarVideos(false); cargarFavoritos();
}

function toggleFavoritoShort(url) {
  let favoritos = getData(keys.favoritosShorts);
  favoritos = favoritos.includes(url) ? favoritos.filter(u => u !== url) : [...favoritos, url];
  setData(keys.favoritosShorts, favoritos);
  cargarShorts(); cargarFavoritos();
}

function eliminarVideo(url) {
  if (!confirm("Eliminar video?")) return;
  setData(keys.videos, getData(keys.videos).filter(v => v.videoUrl !== url));
  setData(keys.favoritos, getData(keys.favoritos).filter(v => v !== url));
  cargarVideos(); cargarFavoritos();
}

function eliminarShort(url) {
  if (!confirm("Eliminar short?")) return;
  setData(keys.shorts, getData(keys.shorts).filter(s => s.videoUrl !== url));
  setData(keys.favoritosShorts, getData(keys.favoritosShorts).filter(s => s !== url));
  cargarShorts(); cargarFavoritos();
}

function cargarFavoritos() {
  const favVideos = getData(keys.videos).filter(v => getData(keys.favoritos).includes(v.videoUrl));
  const favShorts = getData(keys.shorts).filter(s => getData(keys.favoritosShorts).includes(s.videoUrl));
  const cont = document.getElementById('galeriaFavoritos');
  cont.innerHTML = '';
  favVideos.forEach(v => cont.appendChild(crearCard(v, getData(keys.favoritos))));
  favShorts.forEach(s => cont.appendChild(crearCardShort(s, getData(keys.favoritosShorts))));
}

function exportarBaseDatos() {
  const datos = Object.fromEntries(Object.keys(keys).map(k => [k, getData(k)]));
  const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `backup_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function importarBaseDatos(evt) {
  const file = evt.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      Object.entries(data).forEach(([k, v]) => setData(k, v || []));
      alert("Importado correctamente");
      cargarDatos();
    } catch {
      alert("Error importando archivo");
    }
  };
  reader.readAsText(file);
}

function cargarDatos() {
  const actualizar = (id, data, multi = false) => {
    const el = document.getElementById(id);
    el.innerHTML = '';
    data.forEach(i => {
      const opt = document.createElement('option');
      opt.value = i; opt.textContent = i;
      el.appendChild(opt);
    });
  };
  actualizar('actrizSelect', getData(keys.actrices), true);
  actualizar('categoriaSelect', getData(keys.categorias), true);
  actualizar('carpetaSelect', getData(keys.carpeta));
  actualizar('categoriaFiltro', getData(keys.categorias));
  cargarVideos(true);
}

function pedirContrasena() {
  const input = prompt("Introduce la contraseña:");
  if (input !== PASSWORD) {
    alert("Contraseña incorrecta. Acceso denegado.");
    document.body.innerHTML = "<h1 style='color:red;text-align:center;'>Acceso Denegado</h1>";
  } else cargarDatos();
}

pedirContrasena();
