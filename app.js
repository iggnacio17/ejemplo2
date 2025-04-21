// app.js

const PASSWORD = "finnCracK12@";
const videosKey = 'videos';
const shortsKey = 'shorts';
const actoresKey = 'actrices';
const categoriasKey = 'categorias';
const carpetasKey = 'carpetas';
const favoritosKey = 'favoritos';
const favoritosShortsKey = 'favoritosShorts';

function mostrarTab(id) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (id === "galeriaTab") cargarVideos(true);
  else if (id === "shortsTab") cargarShorts();
  else if (id === "favoritosTab") cargarFavoritos();
}

function getData(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

function setData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
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

function guardarVideo() {
  const actricesInput = document.getElementById('nuevaActriz').value;
  const categoriasInput = document.getElementById('nuevaCategoria').value;

  const video = {
    id: Date.now(),
    videoUrl: document.getElementById('videoUrl').value,
    imageUrl: document.getElementById('imageUrl').value,
    videoNombre: document.getElementById('videoNombre').value,
    actrices: actricesInput.split(',').map(s => s.trim()).filter(Boolean),
    categorias: categoriasInput.split(',').map(s => s.trim()).filter(Boolean),
    carpeta: document.getElementById('nuevaCarpeta').value || document.getElementById('carpetaSelect').value
  };

  if (!video.videoUrl || !video.imageUrl || !video.videoNombre) return alert("Todos los campos son obligatorios");

  const actrices = getData(actoresKey);
  const categorias = getData(categoriasKey);
  const carpetas = getData(carpetasKey);

  video.actrices.forEach(a => { if (!actrices.includes(a)) actrices.push(a); });
  video.categorias.forEach(c => { if (!categorias.includes(c)) categorias.push(c); });
  if (video.carpeta && !carpetas.includes(video.carpeta)) carpetas.push(video.carpeta);

  setData(actoresKey, actrices);
  setData(categoriasKey, categorias);
  setData(carpetasKey, carpetas);

  const lista = getData(videosKey);
  lista.push(video);
  setData(videosKey, lista);

  document.querySelectorAll('.formulario input').forEach(input => input.value = '');
  cargarDatos();
  mostrarTab('galeriaTab');
}

function crearTag(tag, callback) {
  const span = document.createElement('span');
  span.className = 'tag';
  span.textContent = tag;
  span.onclick = () => callback(tag);
  return span;
}

function crearCard(video, favoritos) {
  const card = document.createElement('div');
  card.className = 'video-card';

  const img = document.createElement('img');
  img.src = video.imageUrl;
  img.onclick = () => {
    copiarEnlace(video.videoUrl);
    window.open(video.videoUrl, '_blank');
  };

  const nombre = document.createElement('div');
  nombre.className = 'video-name';
  nombre.textContent = video.videoNombre;

  const desc = document.createElement('p');
  desc.innerHTML = `📁 ${video.carpeta}`;

  const tags = document.createElement('div');
  video.actrices.forEach(a => tags.appendChild(crearTag(a, buscarPorEtiqueta)));
  video.categorias.forEach(c => tags.appendChild(crearTag(c, buscarPorEtiqueta)));

  const acciones = document.createElement('div');
  acciones.className = 'acciones';

  const star = document.createElement('span');
  star.textContent = favoritos.includes(video.videoUrl) ? '⭐' : '☆';
  star.onclick = () => toggleFavorito(video.videoUrl);

  const copy = document.createElement('span');
  copy.textContent = '📋';
  copy.onclick = () => copiarEnlace(video.videoUrl);

  const edit = document.createElement('span');
  edit.textContent = '✏️';
  edit.onclick = () => editarVideo(video);

  const trash = document.createElement('span');
  trash.textContent = '🗑️';
  trash.onclick = () => eliminarVideo(video.videoUrl);

  acciones.append(star, copy, edit, trash);
  card.append(img, nombre, desc, tags, acciones);
  return card;
}

function cargarVideos(aleatorio = false) {
  const videos = getData(videosKey);
  const favoritos = getData(favoritosKey);
  const filtro = document.getElementById('categoriaFiltro').value;
  const query = document.getElementById('buscador').value.toLowerCase().split(" ");

  let mostrar = videos.filter(v => {
    return query.every(q =>
      v.videoNombre.toLowerCase().includes(q) ||
      (v.actrices && v.actrices.some(a => a.toLowerCase().includes(q))) ||
      (v.categorias && v.categorias.some(c => c.toLowerCase().includes(q)))
    );
  });

  if (filtro !== '') mostrar = mostrar.filter(v => v.categorias.includes(filtro));
  else if (query.length === 1 && query[0] === '' && aleatorio)
    mostrar = videos.sort(() => 0.5 - Math.random()).slice(0, 15);

  const galeria = document.getElementById('galeria');
  galeria.innerHTML = '';
  mostrar.forEach(video => galeria.appendChild(crearCard(video, favoritos)));
}

function buscarPorEtiqueta(valor) {
  document.getElementById('buscador').value = valor;
  cargarVideos();
}

function copiarEnlace(url) {
  navigator.clipboard.writeText(url).then(() => console.log('Copiado')); 
}

function editarVideo(video) {
  document.getElementById('videoUrl').value = video.videoUrl;
  document.getElementById('imageUrl').value = video.imageUrl;
  document.getElementById('videoNombre').value = video.videoNombre;
  document.getElementById('nuevaActriz').value = video.actrices.join(', ');
  document.getElementById('nuevaCategoria').value = video.categorias.join(', ');
  document.getElementById('nuevaCarpeta').value = video.carpeta;

  eliminarVideo(video.videoUrl, false);
  mostrarTab('formularioTab');
}

function eliminarVideo(videoUrl, confirmar = true) {
  if (confirmar && !confirm('¿Eliminar este video?')) return;
  let lista = getData(videosKey);
  lista = lista.filter(v => v.videoUrl !== videoUrl);
  setData(videosKey, lista);
  let favoritos = getData(favoritosKey);
  favoritos = favoritos.filter(url => url !== videoUrl);
  setData(favoritosKey, favoritos);
  cargarVideos();
}

function toggleFavorito(videoUrl) {
  let favoritos = getData(favoritosKey);
  if (favoritos.includes(videoUrl)) favoritos = favoritos.filter(url => url !== videoUrl);
  else favoritos.push(videoUrl);
  setData(favoritosKey, favoritos);
  cargarVideos();
}

function cargarDatos() {
  actualizarSelect(document.getElementById('actrizSelect'), getData(actoresKey));
  actualizarSelect(document.getElementById('categoriaSelect'), getData(categoriasKey));
  actualizarSelect(document.getElementById('carpetaSelect'), getData(carpetasKey));
  actualizarSelect(document.getElementById('categoriaFiltro'), getData(categoriasKey), true);
  cargarVideos();
}

function exportarBaseDatos() {
  const datos = {
    [videosKey]: getData(videosKey),
    [shortsKey]: getData(shortsKey),
    [actoresKey]: getData(actoresKey),
    [categoriasKey]: getData(categoriasKey),
    [carpetasKey]: getData(carpetasKey),
    [favoritosKey]: getData(favoritosKey),
    [favoritosShortsKey]: getData(favoritosShortsKey)
  };
  const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup_videos_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importarBaseDatos(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const datos = JSON.parse(e.target.result);
      setData(videosKey, datos[videosKey] || []);
      setData(shortsKey, datos[shortsKey] || []);
      setData(actoresKey, datos[actoresKey] || []);
      setData(categoriasKey, datos[categoriasKey] || []);
      setData(carp...
