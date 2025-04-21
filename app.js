// === Constantes y Elementos ===
const PASSWORD = "finnCracK12@";
const videosKey = 'videos';
const shortsKey = 'shorts';
const actoresKey = 'actrices';
const categoriasKey = 'categorias';
const carpetasKey = 'carpetas';
const favoritosKey = 'favoritos';
const favoritosShortsKey = 'favoritosShorts';

const galeria = document.getElementById('galeria');
const galeriaShorts = document.getElementById('galeriaShorts');
const buscador = document.getElementById('buscador');
const categoriaFiltro = document.getElementById('categoriaFiltro');

// === Utilidades de datos ===
function getData(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}
function setData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function mostrarTab(id) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (id === "galeriaTab") cargarVideos(true);
  else if (id === "shortsTab") cargarShorts();
  else if (id === "favoritosTab") cargarFavoritos();
}

function actualizarSelect(select, data, incluirTodas = false) {
  select.innerHTML = '';
  if (incluirTodas) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = '📂 Todas las categorías';
    select.appendChild(opt);
  }
  data.forEach(item => {
    const option = document.createElement('option');
    option.value = item;
    option.textContent = item;
    select.appendChild(option);
  });
}

function extraerArray(inputId, selectId) {
  const nueva = document.getElementById(inputId).value;
  const existentes = Array.from(document.getElementById(selectId).selectedOptions).map(o => o.value);
  const separadas = nueva ? nueva.split(',').map(s => s.trim()) : [];
  return [...new Set([...existentes, ...separadas])];
}

function guardarVideo() {
  const video = {
    videoUrl: document.getElementById('videoUrl').value,
    imageUrl: document.getElementById('imageUrl').value,
    videoNombre: document.getElementById('videoNombre').value,
    actrices: extraerArray('nuevaActriz', 'actrizSelect'),
    categorias: extraerArray('nuevaCategoria', 'categoriaSelect'),
    carpeta: document.getElementById('nuevaCarpeta').value || document.getElementById('carpetaSelect').value
  };
  if (!video.videoUrl || !video.imageUrl || !video.videoNombre) return alert("Todos los campos son obligatorios");

  const actrices = getData(actoresKey);
  const categorias = getData(categoriasKey);
  const carpetas = getData(carpetasKey);

  video.actrices.forEach(actriz => {
    if (!actrices.includes(actriz)) actrices.push(actriz);
  });
  video.categorias.forEach(cat => {
    if (!categorias.includes(cat)) categorias.push(cat);
  });
  if (video.carpeta && !carpetas.includes(video.carpeta)) carpetas.push(video.carpeta);

  setData(actoresKey, actrices);
  setData(categoriasKey, categorias);
  setData(carpetaKey, carpetas);

  const lista = getData(videosKey);
  lista.push(video);
  setData(videosKey, lista);

  document.querySelectorAll('.formulario input').forEach(input => input.value = '');
  cargarDatos();
  mostrarTab('galeriaTab');
}

function guardarShort() {
  const short = {
    videoUrl: document.getElementById('shortUrl').value,
    imageUrl: document.getElementById('shortImageUrl').value
  };
  if (!short.videoUrl || !short.imageUrl) return alert("Ambos campos son obligatorios");

  const lista = getData(shortsKey);
  lista.push(short);
  setData(shortsKey, lista);

  document.getElementById('shortUrl').value = '';
  document.getElementById('shortImageUrl').value = '';
  cargarShorts();
}

function cargarDatos() {
  actualizarSelect(document.getElementById('actrizSelect'), getData(actoresKey));
  actualizarSelect(document.getElementById('categoriaSelect'), getData(categoriasKey));
  actualizarSelect(document.getElementById('carpetaSelect'), getData(carpetaKey));
  actualizarSelect(categoriaFiltro, getData(categoriasKey), true);
  cargarVideos(true);
}

function crearCard(video, favoritos) {
  const card = document.createElement('div');
  card.className = 'video-card';

  const img = document.createElement('img');
  img.src = video.imageUrl;
  img.onclick = () => { copiarEnlace(video.videoUrl); window.open(video.videoUrl, '_blank'); };

  const nombre = document.createElement('div');
  nombre.className = 'video-name';
  nombre.textContent = video.videoNombre;

  const desc = document.createElement('p');
  desc.innerHTML = `${video.actrices.map(a => `<a onclick=buscarTag('${a}')>${a}</a>`).join(', ')} | ${video.categorias.map(c => `<a onclick=buscarTag('${c}')>${c}</a>`).join(', ')} | ${video.carpeta}`;

  const acciones = document.createElement('div');
  acciones.className = 'acciones';

  const star = document.createElement('span');
  star.textContent = favoritos.includes(video.videoUrl) ? '⭐' : '☆';
  star.onclick = () => toggleFavorito(video.videoUrl);

  const copy = document.createElement('span');
  copy.textContent = '📋';
  copy.onclick = () => copiarEnlace(video.videoUrl);

  const trash = document.createElement('span');
  trash.textContent = '🗑️';
  trash.onclick = () => eliminarVideo(video.videoUrl);

  acciones.append(star, copy, trash);
  card.append(img, nombre, desc, acciones);
  return card;
}

function cargarVideos(aleatorio = false) {
  let videos = getData(videosKey);
  const favoritos = getData(favoritosKey);
  const filtroCategoria = categoriaFiltro.value;
  const query = buscador.value.toLowerCase();

  if (query) {
    videos = videos.filter(v =>
      v.videoNombre.toLowerCase().includes(query) ||
      v.actrices.some(a => a.toLowerCase().includes(query)) ||
      v.categorias.some(c => c.toLowerCase().includes(query))
    );
  }

  if (filtroCategoria) {
    videos = videos.filter(v => v.categorias.includes(filtroCategoria));
  } else if (!query && aleatorio) {
    videos = videos.sort(() => 0.5 - Math.random()).slice(0, 15);
  }

  galeria.innerHTML = '';
  videos.forEach(video => galeria.appendChild(crearCard(video, favoritos)));
}

function filtrarVideos() {
  cargarVideos(false);
}

function buscarTag(tag) {
  buscador.value = tag;
  filtrarVideos();
}

function cargarShorts() {
  const shorts = getData(shortsKey);
  const favoritos = getData(favoritosShortsKey);
  galeriaShorts.innerHTML = '';

  shorts.forEach(short => {
    const card = document.createElement('div');
    card.className = 'short-card';

    const img = document.createElement('img');
    img.src = short.imageUrl;
    img.onclick = () => { copiarEnlace(short.videoUrl); window.open(short.videoUrl, '_blank'); };

    const acciones = document.createElement('div');
    acciones.className = 'acciones';
    acciones.style.marginTop = '10px';

    const star = document.createElement('span');
    star.textContent = favoritos.includes(short.videoUrl) ? '⭐' : '☆';
    star.onclick = () => toggleFavoritoShort(short.videoUrl);

    const copy = document.createElement('span');
    copy.textContent = '📋';
    copy.onclick = () => copiarEnlace(short.videoUrl);

    const trash = document.createElement('span');
    trash.textContent = '🗑️';
    trash.onclick = () => eliminarShort(short.videoUrl);

    acciones.append(star, copy, trash);
    card.append(img, acciones);
    galeriaShorts.appendChild(card);
  });
}

function cargarFavoritos() {
  const favoritos = getData(favoritosKey);
  const favoritosShorts = getData(favoritosShortsKey);
  const videos = getData(videosKey).filter(v => favoritos.includes(v.videoUrl));
  const shorts = getData(shortsKey).filter(s => favoritosShorts.includes(s.videoUrl));

  const contenedor = document.getElementById('galeriaFavoritos');
  contenedor.innerHTML = '';

  videos.forEach(video => contenedor.appendChild(crearCard(video, favoritos)));
  shorts.forEach(short => {
    const card = document.createElement('div');
    card.className = 'short-card';
    const img = document.createElement('img');
    img.src = short.imageUrl;
    img.onclick = () => { copiarEnlace(short.videoUrl); window.open(short.videoUrl, '_blank'); };
    const acciones = document.createElement('div');
    acciones.className = 'acciones';
    acciones.style.marginTop = '10px';
    const star = document.createElement('span');
    star.textContent = '⭐';
    star.onclick = () => toggleFavoritoShort(short.videoUrl);
    const copy = document.createElement('span');
    copy.textContent = '📋';
    copy.onclick = () => copiarEnlace(short.videoUrl);
    const trash = document.createElement('span');
    trash.textContent = '🗑️';
    trash.onclick = () => eliminarShort(short.videoUrl);
    acciones.append(star, copy, trash);
    card.append(img, acciones);
    contenedor.appendChild(card);
  });
}

function toggleFavorito(url) {
  let favs = getData(favoritosKey);
  if (favs.includes(url)) favs = favs.filter(f => f !== url);
  else favs.push(url);
  setData(favoritosKey, favs);
  cargarVideos(false);
  cargarFavoritos();
}

function toggleFavoritoShort(url) {
  let favs = getData(favoritosShortsKey);
  if (favs.includes(url)) favs = favs.filter(f => f !== url);
  else favs.push(url);
  setData(favoritosShortsKey, favs);
  cargarShorts();
  cargarFavoritos();
}

function eliminarVideo(url) {
  if (!confirm("¿Eliminar video?")) return;
  setData(videosKey, getData(videosKey).filter(v => v.videoUrl !== url));
  setData(favoritosKey, getData(favoritosKey).filter(f => f !== url));
  cargarVideos();
  cargarFavoritos();
}

function eliminarShort(url) {
  if (!confirm("¿Eliminar short?")) return;
  setData(shortsKey, getData(shortsKey).filter(s => s.videoUrl !== url));
  setData(favoritosShortsKey, getData(favoritosShortsKey).filter(f => f !== url));
  cargarShorts();
  cargarFavoritos();
}

function copiarEnlace(url) {
  navigator.clipboard.writeText(url);
}

function exportarBaseDatos() {
  const datos = {
    [videosKey]: getData(videosKey),
    [shortsKey]: getData(shortsKey),
    [actoresKey]: getData(actoresKey),
    [categoriasKey]: getData(categoriasKey),
    [carpetasKey]: getData(carpetaKey),
    [favoritosKey]: getData(favoritosKey),
    [favoritosShortsKey]: getData(favoritosShortsKey)
  };
  const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importarBaseDatos(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const datos = JSON.parse(e.target.result);
      if (!datos[videosKey]) return alert("Archivo no válido");
      setData(videosKey, datos[videosKey]);
      setData(shortsKey, datos[shortsKey] || []);
      setData(actoresKey, datos[actoresKey] || []);
      setData(categoriasKey, datos[categoriasKey] || []);
      setData(carpetaKey, datos[carpetasKey] || []);
      setData(favoritosKey, datos[favoritosKey] || []);
      setData(favoritosShortsKey, datos[favoritosShortsKey] || []);
      alert("Importado exitosamente.");
      cargarDatos();
    } catch {
      alert("Error al leer el archivo JSON");
    }
  };
  reader.readAsText(file);
}

function pedirContrasena() {
  const input = prompt("Introduce la contraseña:");
  if (input !== PASSWORD) {
    alert("Contraseña incorrecta. Acceso denegado.");
    document.body.innerHTML = "<h1 style='color: red; text-align:center;'>Acceso Denegado</h1>";
  } else {
    cargarDatos();
  }
}

pedirContrasena();
