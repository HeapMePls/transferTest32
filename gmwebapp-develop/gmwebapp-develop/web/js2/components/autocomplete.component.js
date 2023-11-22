var gmjs = gmjs || {};
gmjs.components = gmjs.components || {};
gmjs.components.ac = {};

gmjs.components.ac.init = function(){

  //
  // Hook product search box
  //
  gmjs.components.ac.elRubroAC = new autoComplete({ 
    selector: "#search-rubroNombre",
    // placeHolder: "Search for Food...",
    data: {
      src: async (query) => {
        try {
          if (query.length < 3) return [];
          // Fetch External Data Source
          const source = await fetch(
            "/components/pred-rubros-json/" + query
          );
          const data = await source.json();
          // console.debug(data);
          return data;
        } catch (error) {
          console.error(error);
          return error;
        }
      },
      keys: ["desc", "key", "name", "type"],
      cache: false,
    },
    resultsList: {
      noResults: false,
      maxResults: 30
    },
    resultItem: {
      element: (item, data) => {
        item.style = "display: flex; justify-content: space-between;";
        // console.debug('  Rendering ['+JSON.stringify(data.value)+']');
        if (data.value.type == 0){
          item.innerHTML = `
          <span class="autoComplete_item">
            ${data.match}
          </span>`;
        }else{
          item.innerHTML = `
          <span class="autoComplete_item">
            ${data.match}
            <div>${data.value.desc}</div>
          </span>`;
        }
      },
      highlight: {
        render: true
      }
    }
  });
  gmjs.components.ac.elRubroAC.input.addEventListener("selection", function (event) {
    const feedback = event.detail;
    // Prepare User's Selected Value
    const selection = feedback.selection.value[feedback.selection.key];
    // Replace Input value with the selected value
    gmjs.components.ac.elRubroAC.input.value = selection;
    // Console log autoComplete data feedback
    console.log(feedback);
    if (feedback.selection.value.type == 1){
      var splittedKey = feedback.selection.value.key.split('~');
      var iKey = parseInt(splittedKey[0]*10000) + parseInt(splittedKey[1]);
      var url = '/local/' + encodeURI(feedback.selection.value.name.toLowerCase()) + '/LOC'; //local/guillermina-gallinal/LOC219020001
      url = url + iKey.toString();
      window.location = url;
    }
  });
  gmjs.components.ac.elRubroAC.input.setAttribute('autocomplete','off');


  //
  // Hook zone search box
  //
  gmjs.components.ac.searchZoneElement = document.getElementById('search-zonaNombre');
  gmjs.components.ac.elZonaAC = new autoComplete({ 
    selector: "#search-zonaNombre",
    data: {
      src: async (query) => {
        try {
          if (query.length < 2) return [];
          // Fetch External Data Source
          const source = await fetch(
            "/components/pred-zonas-json/" + query
          );
          const data = await source.json();
          // console.debug(data);
          return data;
        } catch (error) {
          console.error(error);
          return error;
        }
      },
      keys: ["name", "desc"],
      cache: false,
    },
    resultsList: {
      noResults: false,
      maxResults: 30
    },
    resultItem: {
      element: (item, data) => {
        item.style = "display: flex; justify-content: space-between;";
        // console.debug('  Rendering ['+JSON.stringify(data.value)+']');
        if (data.key == 'name'){
          item.innerHTML = `
          <span class="autoComplete_item">
            ${data.match}, <span>${data.value.desc}</span>
          </span>`;
        }else{
          item.innerHTML = `
          <span class="autoComplete_item">
            ${data.value.name}, <span>${data.match}</span>
          </span>`;
        }
      },
      highlight: {
        render: true
      }
    }
  });
  gmjs.components.ac.elZonaAC.input.addEventListener("selection", function (event) {
    const feedback = event.detail;
    // Prepare User's Selected Value
    const selection = feedback.selection.value.name + ', ' + feedback.selection.value.desc;
    // Replace Input value with the selected value
    gmjs.components.ac.elZonaAC.input.value = selection;
    // Console log autoComplete data feedback
    // console.log(feedback);
    gmjs.components.ac.search();
  });
  gmjs.components.ac.elZonaAC.input.addEventListener("keyup", function(e){
    if (e.key === 'Enter' || e.keyCode === 13) {
      gmjs.components.ac.search();
    }
  });
  gmjs.components.ac.elZonaAC.input.setAttribute('autocomplete','off');


  //
  // Handle search
  //
  gmjs.components.ac.searchBtn = document.querySelector('#searcher-form a');
  gmjs.components.ac.searchBtn.addEventListener('click', function(event){
    event.preventDefault();
    gmjs.components.ac.search();
  });

  gmjs.components.ac.form = document.querySelector('#searcher-form');
  gmjs.components.ac.form.addEventListener('submit', function(e){
    e.preventDefault();
    gmjs.components.ac.search();
  });

  gmjs.components.ac.initCrosshair();
}

gmjs.components.ac.initCrosshair = function(){
  // Check if feature is present
  if (!("geolocation" in navigator)) return;
  gmjs.components.ac.crossHairActive = false;
  gmjs.components.ac.crossElement = document.getElementById('cross');
  if (gmjs.components.ac.crossElement){
    gmjs.components.ac.crossElement.addEventListener('click', function(e){
      if (gmjs.components.ac.crossHairActive){
        // Disable near-me
        gmjs.components.ac.crossElement.classList.remove('fa-close');
        gmjs.components.ac.crossElement.classList.add('fa-crosshairs');
        gmjs.components.ac.searchZoneElement.disabled = false;
        gmjs.components.ac.searchZoneElement.value = '';
        gmjs.components.ac.searchZoneElement.style.backgroundColor = '#FFFFFF';
        gmjs.components.ac.crossHairActive = false;
        localStorage.removeItem('_gmwa_nm');
      }else{
        // Activate near-me
        gmjs.components.ac.activateNearMe();
      }
    });


    // Check previously NearMe activated 
    var $lastZoneData = localStorage.getItem('_gmwa_nm');
    if ($lastZoneData){
      $lastZoneData = JSON.parse($lastZoneData);
      // Check valid cache
      var currentTime = (new Date().getTime()) / 1000;
      if (currentTime - $lastZoneData.timestamp >= 300) {
        // Need to refresh
        gmjs.logger.log('Header|Refreshing lastZonaData...');
        gmjs.components.ac.activateNearMe();
      }else{
        gmjs.logger.log('Header|Using cached lastZonaData...');
        gmjs.components.ac.coords = $lastZoneData.coords;
        gmjs.components.ac.crossElement.classList.remove('fa-crosshairs');
        gmjs.components.ac.crossElement.classList.add('fa-close');
        gmjs.components.ac.searchZoneElement.value = $lastZoneData.zoneName;
        gmjs.components.ac.searchZoneElement.disabled = true;
        gmjs.components.ac.searchZoneElement.style.backgroundColor = '#F0F0F0';
        gmjs.components.ac.crossHairActive = true;
      }
    }
  }
}
  
gmjs.components.ac.activateNearMe = function(){
  gmjs.components.ac.getNearMe(function(zoneName){
    if (zoneName){
      // Enable near-me
      gmjs.components.ac.crossElement.classList.remove('fa-crosshairs');
      gmjs.components.ac.crossElement.classList.add('fa-close');
      gmjs.components.ac.searchZoneElement.value = zoneName;
      gmjs.components.ac.searchZoneElement.disabled = true;
      gmjs.components.ac.searchZoneElement.style.backgroundColor = '#F0F0F0';
      var nearMeData = {
        zoneName  : zoneName,
        coords    : {
          latitude  : gmjs.components.ac.coords.latitude,
          longitude : gmjs.components.ac.coords.longitude
        },
        timestamp : (new Date().getTime()) / 1000
      }
      localStorage.setItem('_gmwa_nm', JSON.stringify(nearMeData)); // Store NearMe value in storage
      gmjs.components.ac.crossHairActive = true;
    }
  });
}
  
gmjs.components.ac.getNearMe = function(cb){
  // Check if is enabled and show explanation to user on how to proceed
  // ...
  //
  navigator.geolocation.getCurrentPosition(function(position) {
    //do_something(position.coords.latitude, position.coords.longitude);
    gmjs.components.ac.coords = position.coords;
    var url = '/zonanearestcoords/'+position.coords.latitude+'/'+position.coords.longitude;
    fetch(url).then(function(response){
      return response.json();
    }).then(function(datos){
      if (datos != null){
        cb(datos.nmz);
      }else{
        gmjs.logger.error('No zone found for coords: ' + position.coords.latitude + ' , ' + position.coords.longitude);
        cb(null);
      }
    }).catch(function(err){
      gmjs.logger.error('Error getting zone for coords: ' + position.coords.latitude + ' , ' + position.coords.longitude);
      gmjs.logger.error(err);
      cb(null)
    });
  });
}

gmjs.components.ac.search = function() {

  var rubro = gmjs.components.ac.slugify(gmjs.components.ac.elRubroAC.input.value.trim());
  var zona = gmjs.components.ac.slugify(gmjs.components.ac.elZonaAC.input.value.trim());
  rubro = (!rubro) ? 'empresas' : rubro;
  zona = (!zona) ? 'todo-el-pais' : zona;

  if (!gmjs.components.ac.crossHairActive){
    document.location = '/buscar/' + rubro + '/' + zona;
  }else{
    if (gmjs.components.ac.coords && gmjs.components.ac.coords.latitude){
      document.location = '/buscar/' + rubro + '/' + zona + '/' + 
      gmjs.components.ac.coords.latitude + ',' + gmjs.components.ac.coords.longitude;
    }else{
      document.location = '/buscar/' + rubro + '/' + zona;
    }
  }
}

gmjs.components.ac.slugify = function(str) {
  str = str.replace(/^\s+|\s+$/g, ''); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  var from = "ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;";
  var to = "aaaaaeeeeeiiiiooooouuuunc------";
  for (var i = 0, l = from.length; i < l; i++) {
      str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
          .replace(/\s+/g, '-') // collapse whitespace and replace by -
          .replace(/-+/g, '-'); // collapse dashes

  return str;
}