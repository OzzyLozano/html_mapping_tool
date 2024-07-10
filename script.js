var map;
var cities = {
  matamoros: { lat: 25.8690, lng: -97.5027 },
  reynosa: { lat: 26.0806, lng: -98.2883 }  // Coordenadas de Reynosa, Tamaulipas
};

var routeInfo = document.getElementById('routeInfo');
var routeNameInput = document.getElementById('routeName');
var routeColorInput = document.getElementById('routeColor');
var routeScheduleInput = document.getElementById('routeSchedule');

var routePoints = []
var routePolyline;

// Función de inicialización del mapa
function initMap() {
  // Coordenadas iniciales (Matamoros, Tamaulipas)
  var initialCity = 'matamoros';
  var initialLatLng = cities[initialCity];

  // Crear el mapa
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: initialLatLng
  });

  // Crear un div personalizado para representar la cruz en el centro del mapa
  var crossDiv = document.createElement('div');
  crossDiv.innerHTML = '<div style="width: 20px; height: 2px; background-color: #FF0000; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>' +
                      '<div style="width: 2px; height: 20px; background-color: #FF0000; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>';
  crossDiv.style.position = 'absolute';
  crossDiv.style.width = '20px';
  crossDiv.style.height = '20px';
  crossDiv.style.transform = 'translate(-50%, -50%)';
  crossDiv.style.pointerEvents = 'none'; // Permitir que los eventos del mapa pasen a través del div

  // Añadir el div al mapa
  map.controls[google.maps.ControlPosition.CENTER].push(crossDiv);

  // Crear selector de ciudades
  var citySelect = document.getElementById('citySelect');
  if (citySelect.length === 0) {
    // Crear opciones del selector de ciudades
    for (var city in cities) {
      var option = document.createElement('option');
      option.value = city;
      option.textContent = city.charAt(0).toUpperCase() + city.slice(1); // Capitalizar la primera letra
      citySelect.appendChild(option);
    }
  }

  // Escuchar cambios en el selector de ciudades
  citySelect.addEventListener('change', function() {
    var selectedCity = citySelect.value;
    var selectedLatLng = cities[selectedCity];
    map.setCenter(selectedLatLng);
  });

  // Escuchar clic izquierdo en el mapa para agregar puntos
  map.addListener('click', function(event) {
    // Solo agregar puntos si la información de la ruta está visible
    if (routeInfo.style.display === 'grid') {
      var point = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
      routePoints.push(point);
      actualizarRuta()
    }
  });
  
}

// Función para trazar una ruta basada en la ciudad seleccionada
function trazarRuta() {
  var selectedCity = document.getElementById('citySelect').value;
  var selectedLatLng = cities[selectedCity];
  var traceRouteBtn = document.getElementById('traceRouteBtn')

  // Mostrar la cruz en el centro del mapa
  document.getElementById('map').classList.add('showCross');

  // Mostrar la información de la ruta
  if (routeInfo.style.display != 'grid') {
    traceRouteBtn.textContent = 'Cancelar trazado'
    routeInfo.style.display = 'grid';
  } else {
    traceRouteBtn.textContent = 'Trazar Ruta'
    routeInfo.style.display = 'none';
  }
}

// Función para actualizar la ruta con los puntos existentes
function actualizarRuta() {
  // Limpiar polilínea anterior si existe
  if (routePolyline) {
    routePolyline.setMap(null);
  }

  // Crear nueva polilínea con los puntos actuales
  routePolyline = new google.maps.Polyline({
    path: routePoints,
    geodesic: true,
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 2
  });

  // Mostrar la polilínea en el mapa
  routePolyline.setMap(map);
}

// confirmar y obtener ruta en archivo json:D
function confirmarRuta() {
  var routeName = routeNameInput.value.trim();
  var routeColor = routeColorInput.value.trim();
  var routeSchedule = routeScheduleInput.value.trim();

  // Verificar que se haya ingresado al menos el nombre de la ruta
  if (!routeName) {
    alert('Por favor ingresa el nombre de la ruta.');
    return;
  }

  // Crear objeto JSON con la información de la ruta
  var routeData = {
    info: {
      nombre: routeName,
      color: routeColor || '',
      horario: routeSchedule || '',
      bidireccional: true, // Ejemplo de valor fijo
      show: true // Ejemplo de valor fijo
    },
    ruta: routePoints.map(function(point) {
      return {
        latitude: point.lat,
        longitude: point.lng
      };
    })
  };

  // Convertir objeto a JSON
  var jsonData = JSON.stringify(routeData, null, 2);

  // Crear un Blob con los datos JSON
  var blob = new Blob([jsonData], { type: 'application/json' });

  // Crear URL del Blob
  var url = URL.createObjectURL(blob);

  // Crear un elemento <a> para descargar el archivo
  var link = document.createElement('a');
  link.href = url;
  link.download = routeName + '.json'; // Nombre del archivo
  link.style.display = 'none';

  // Agregar el elemento <a> al body
  document.body.appendChild(link);

  // Simular clic en el enlace para descargar el archivo
  link.click();

  // Remover el elemento <a> del body
  document.body.removeChild(link);

  // Liberar recursos del Blob
  URL.revokeObjectURL(url);

  // Reiniciar los puntos de la ruta para la siguiente vez
  routePoints = [];

  // Mostrar los datos de la ruta en consola (para verificar)
  console.log('Datos de la ruta:', routeData);

  // Limpiar inputs y ocultar información de la ruta
  routeNameInput.value = "";
  routeColorInput.value = "";
  routeScheduleInput.value = "";
  routeInfo.style.display = 'none';
  document.getElementById('traceRouteBtn').textContent = 'Trazar Ruta'; // Restaurar texto del botón
}



// Llamar a la función de inicialización del mapa cuando la página esté cargada
window.onload = function() {
  initMap();
};
